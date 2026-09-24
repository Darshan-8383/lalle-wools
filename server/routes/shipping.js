const express = require('express');
const db = require('../db');
const shipping = require('../services/shipping');

const router = express.Router();

// POST /api/shipping/check-pincode  { pincode, amount, weightKg }
router.post('/check-pincode', async (req, res) => {
  try {
    const { pincode, amount = 0, weightKg = 0.3 } = req.body || {};
    const result = await shipping.checkServiceability({
      deliveryPincode: pincode,
      codAmount: amount,
      weightKg,
    });
    res.json(result);
  } catch (err) {
    console.error('[shipping] check-pincode failed:', err);
    res.status(500).json({ error: 'Could not check serviceability right now' });
  }
});

// GET /api/shipping/track/:orderId
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = db.getOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.shipment || !order.shipment.awbCode) {
      return res.json({ status: order.status, message: 'Not yet handed to courier' });
    }
    const tracking = await shipping.trackShipment(order.shipment.awbCode);
    res.json(tracking);
  } catch (err) {
    console.error('[shipping] track failed:', err);
    res.status(500).json({ error: 'Could not fetch tracking right now' });
  }
});

module.exports = router;
