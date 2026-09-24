/**
 * Payment Service — Razorpay-ready
 * ----------------------------------
 * Razorpay is used here because it natively supports UPI, cards, netbanking
 * and wallets in one checkout — matching the payment options already in the
 * existing frontend UI. If RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set
 * in .env, this falls back to a MOCK payment so you can test the full
 * checkout flow before signing up for a gateway.
 *
 * To go live:
 *   1. Create a Razorpay account: https://dashboard.razorpay.com/signup
 *   2. Get your Key ID + Key Secret from Settings > API Keys (use the TEST
 *      keys first, they work exactly like live keys but with test cards)
 *   3. Put them in .env as RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
 *   4. In Razorpay Dashboard > Webhooks, add {yourDomain}/api/payment/webhook
 *      with the "payment.captured" and "payment.failed" events, and set
 *      RAZORPAY_WEBHOOK_SECRET in .env to the same secret you set there.
 *
 * Swap to Stripe/PayU/Cashfree instead? Keep createPaymentOrder /
 * verifyPaymentSignature's shapes the same and only the internals need to
 * change — routes/payment.js and the frontend don't need to know the
 * difference.
 */
const crypto = require('crypto');

const isConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

let razorpayClient = null;
function getClient() {
  if (razorpayClient) return razorpayClient;
  const Razorpay = require('razorpay');
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return razorpayClient;
}

/**
 * Create a payment-gateway order for a given amount (in rupees).
 * Returns enough info for the frontend to open the Razorpay Checkout modal.
 */
async function createPaymentOrder({ orderId, amountRupees, notes = {} }) {
  if (!isConfigured()) {
    return {
      mock: true,
      keyId: 'rzp_test_mock',
      gatewayOrderId: 'mock_order_' + orderId,
      amountPaise: Math.round(amountRupees * 100),
      currency: 'INR',
    };
  }
  const client = getClient();
  const gatewayOrder = await client.orders.create({
    amount: Math.round(amountRupees * 100), // paise
    currency: 'INR',
    receipt: orderId,
    notes,
  });
  return {
    mock: false,
    keyId: process.env.RAZORPAY_KEY_ID,
    gatewayOrderId: gatewayOrder.id,
    amountPaise: gatewayOrder.amount,
    currency: gatewayOrder.currency,
  };
}

/**
 * Verify the signature Razorpay Checkout returns to the browser after a
 * successful payment (razorpay_order_id + razorpay_payment_id + razorpay_signature).
 */
function verifyPaymentSignature({ gatewayOrderId, gatewayPaymentId, signature }) {
  if (!isConfigured()) {
    // Mock mode: accept the mock success token produced by the frontend's mock flow.
    return signature === 'mock_signature';
  }
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${gatewayOrderId}|${gatewayPaymentId}`)
    .digest('hex');
  return expected === signature;
}

/** Verify an inbound webhook request body against the webhook secret. */
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signatureHeader;
}

module.exports = { isConfigured, createPaymentOrder, verifyPaymentSignature, verifyWebhookSignature };
