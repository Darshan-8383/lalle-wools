require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const productsRoute = require('../server/routes/products');
const { router: ordersRoute } = require('../server/routes/orders');
const paymentRoute = require('../server/routes/payment');
const shippingRoute = require('../server/routes/shipping');
const paymentService = require('../server/services/payment');
const shippingService = require('../server/services/shipping');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));

// NOTE: the Razorpay webhook route needs the *raw* body to verify its
// signature, so it registers its own express.raw() middleware inside
// routes/payment.js. Mount it before the global json() parser touches it —
// simplest fix is Express only applies body parsers per-route anyway, so
// order here is fine as long as json() doesn't also try to parse it first.
app.use('/api/payment/webhook', express.raw({ type: '*/*' }));
app.use(express.json());

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/shipping', shippingRoute);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    paymentGateway: paymentService.isConfigured() ? 'razorpay (live keys)' : 'mock (no gateway keys set)',
    shippingProvider: shippingService.isConfigured() ? 'shiprocket (live keys)' : 'mock (no shipping keys set)',
  });
});

// Serve the existing frontend as static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🛍  LALLEWOOLS server running at http://localhost:${PORT}`);
  console.log(`   Payment gateway: ${paymentService.isConfigured() ? 'RAZORPAY (live keys found)' : 'MOCK MODE — set RAZORPAY_KEY_ID/SECRET in .env to go live'}`);
  console.log(`   Shipping provider: ${shippingService.isConfigured() ? 'SHIPROCKET (live keys found)' : 'MOCK MODE — set SHIPROCKET_EMAIL/PASSWORD in .env to go live'}\n`);
});
