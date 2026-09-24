const express = require('express');
const db = require('../db');
const payment = require('../services/payment');
const { bookShipmentInBackground } = require('./orders');

const router = express.Router();

// POST /api/payment/create-order  { orderId }
router.post('/create-order', async (req, res) => {
  try {
    const { orderId } = req.body || {};
    const order = db.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment.method === 'cod') return res.status(400).json({ error: 'This order is Cash on Delivery' });
    if (order.payment.status === 'paid') return res.status(400).json({ error: 'Order already paid' });

    const gatewayOrder = await payment.createPaymentOrder({
      orderId: order.id,
      amountRupees: order.amounts.total,
      notes: { orderId: order.id, customer: order.address.name },
    });

    await db.updateOrder(order.id, {
      payment: { ...order.payment, razorpayOrderId: gatewayOrder.gatewayOrderId },
    });

    res.json({
      mock: gatewayOrder.mock,
      keyId: gatewayOrder.keyId,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      amountPaise: gatewayOrder.amountPaise,
      currency: gatewayOrder.currency,
      orderId: order.id,
      customer: { name: order.address.name, phone: order.address.phone, email: order.address.email },
    });
  } catch (err) {
    console.error('[payment] create-order failed:', err);
    res.status(500).json({ error: 'Could not initiate payment. Please try again.' });
  }
});

// POST /api/payment/verify  { orderId, gatewayOrderId, gatewayPaymentId, signature }
router.post('/verify', async (req, res) => {
  try {
    const { orderId, gatewayOrderId, gatewayPaymentId, signature } = req.body || {};
    const order = db.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const ok = payment.verifyPaymentSignature({ gatewayOrderId, gatewayPaymentId, signature });
    if (!ok) {
      await db.updateOrder(orderId, { payment: { ...order.payment, status: 'failed' } });
      return res.status(400).json({ error: 'Payment verification failed', verified: false });
    }

    const updated = await db.updateOrder(orderId, {
      status: 'confirmed',
      payment: {
        ...order.payment,
        status: 'paid',
        gatewayOrderId,
        gatewayPaymentId,
        paidAt: new Date().toISOString(),
      },
    });
    bookShipmentInBackground(orderId);
    res.json({ verified: true, order: updated });
  } catch (err) {
    console.error('[payment] verify failed:', err);
    res.status(500).json({ error: 'Could not verify payment' });
  }
});

// POST /api/payment/webhook — Razorpay server-to-server confirmation (belt & suspenders vs. verify)
// Configure this URL in Razorpay Dashboard > Settings > Webhooks.
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const ok = payment.verifyWebhookSignature(req.body, signature);
    if (!ok) return res.status(400).send('invalid signature');

    const event = JSON.parse(req.body.toString('utf-8'));
    if (event.event === 'payment.captured') {
      const gatewayOrderId = event.payload?.payment?.entity?.order_id;
      const order = db.findOrderByRazorpayOrderId(gatewayOrderId);
      if (order && order.payment.status !== 'paid') {
        await db.updateOrder(order.id, { status: 'confirmed', payment: { ...order.payment, status: 'paid' } });
        bookShipmentInBackground(order.id);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[payment] webhook error:', err);
    res.status(500).send('webhook error');
  }
});

module.exports = router;
