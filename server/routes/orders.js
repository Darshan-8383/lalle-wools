const express = require('express');
const { PRODUCTS } = require('../data/products');
const db = require('../db');
const shipping = require('../services/shipping');

const router = express.Router();

const COD_FEE = 40;

/** Recompute cart totals from the server-side catalog — never trust client prices. */
function priceCart(items) {
  const priced = [];
  for (const line of items) {
    const product = PRODUCTS.find((p) => String(p.id) === String(line.id));
    if (!product) throw new Error(`Unknown product id ${line.id}`);
    const qty = Math.max(1, Number(line.qty) || 1);
    if (product.stock !== undefined && product.stock < qty) {
      throw new Error(`${product.name} is out of stock`);
    }
    priced.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      size: product.type === 'clothing' ? (line.size || 'M') : 'NA',
      qty,
      weightGrams: product.weightGrams || 250,
    });
  }
  const subtotal = priced.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { priced, subtotal };
}

function validateAddress(address = {}) {
  const required = ['name', 'phone', 'line1', 'city', 'pincode', 'state'];
  const missing = required.filter((k) => !address[k] || !String(address[k]).trim());
  if (missing.length) throw new Error(`Missing address fields: ${missing.join(', ')}`);
  if (!/^[1-9][0-9]{5}$/.test(String(address.pincode))) throw new Error('Invalid PIN code');
  if (!/^[6-9]\d{9}$/.test(String(address.phone).replace(/\D/g, '').slice(-10))) {
    throw new Error('Invalid phone number');
  }
}

// POST /api/orders — create a new order (status: pending)
router.post('/', async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body || {};
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'Cart is empty' });
    if (!['upi', 'card', 'netbanking', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    validateAddress(address);
    const { priced, subtotal } = priceCart(items);

    const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
    const total = subtotal + codFee;

    const order = await db.createOrder({
      items: priced,
      address: {
        name: address.name,
        phone: address.phone,
        email: address.email || null,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        pincode: address.pincode,
        state: address.state,
      },
      amounts: { subtotal, codFee, total, currency: 'INR' },
      payment: { method: paymentMethod, status: paymentMethod === 'cod' ? 'cod_pending' : 'awaiting_payment' },
      shipment: null,
    });

    // Cash on Delivery is confirmed immediately (no gateway step needed).
    if (paymentMethod === 'cod') {
      const confirmed = await db.updateOrder(order.id, {
        status: 'confirmed',
        payment: { ...order.payment, status: 'cod_confirmed', confirmedAt: new Date().toISOString() },
      });
      bookShipmentInBackground(confirmed.id);
      return res.status(201).json(confirmed);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

/** Fire-and-forget shipment booking so the HTTP response isn't held up by Shiprocket's API. */
function bookShipmentInBackground(orderId) {
  const order = db.getOrder(orderId);
  if (!order) return;
  shipping
    .createShipment(order)
    .then((shipment) =>
      db.updateOrder(orderId, { status: 'shipped_pending_pickup', shipment })
    )
    .catch((err) => {
      console.error(`[shipping] failed to book shipment for ${orderId}:`, err.message);
      db.updateOrder(orderId, { shipment: { error: err.message } });
    });
}

module.exports = { router, priceCart, validateAddress, bookShipmentInBackground, COD_FEE };
