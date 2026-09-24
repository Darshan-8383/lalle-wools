/**
 * Shipping Service — Shiprocket-ready
 * ------------------------------------
 * Shiprocket is the most common shipping aggregator for Indian D2C brands
 * (it books Delhivery/Bluedart/Ecom Express/etc. under one API), so this
 * file is wired for it. If SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are not
 * set in .env, every function below falls back to a realistic MOCK so the
 * whole checkout flow still works end-to-end during development.
 */

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

const isConfigured = () =>
  Boolean(
    process.env.SHIPROCKET_EMAIL &&
    process.env.SHIPROCKET_PASSWORD &&
    process.env.SHIPROCKET_EMAIL.trim() !== '' &&
    process.env.SHIPROCKET_PASSWORD.trim() !== ''
  );

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD?.trim();

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    console.error(`\n[Shiprocket Auth Error Details] HTTP ${res.status}:`, errorDetails);
    throw new Error(`Shiprocket auth failed: ${res.status} (${errorDetails})`);
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // valid ~9-10 days
  return cachedToken;
}

/**
 * Check whether a pincode is serviceable and estimate cost/ETA.
 * @param {{pickupPincode?: string, deliveryPincode: string, codAmount?: number, weightKg?: number}} params
 */
async function checkServiceability({ pickupPincode, deliveryPincode, codAmount = 0, weightKg = 0.3 }) {
  if (!isConfigured()) {
    const isValid = /^[1-9][0-9]{5}$/.test(String(deliveryPincode || ''));
    if (!isValid) return { serviceable: false, reason: 'Invalid PIN code' };
    const digitSum = String(deliveryPincode).split('').reduce((a, d) => a + Number(d), 0);
    const etaDays = 3 + (digitSum % 5);
    return {
      serviceable: true,
      mock: true,
      etaDays,
      etaLabel: `${etaDays}-${etaDays + 1} business days`,
      codAvailable: true,
      shippingFee: codAmount > 0 ? 60 : 0,
    };
  }

  const token = await getToken();
  const params = new URLSearchParams({
    pickup_postcode: pickupPincode || process.env.SHIPROCKET_PICKUP_PINCODE || '',
    delivery_postcode: deliveryPincode,
    cod: codAmount > 0 ? '1' : '0',
    weight: String(weightKg),
  });

  const res = await fetch(`${SHIPROCKET_BASE}/courier/serviceability/?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n[Shiprocket Serviceability Check Failed] HTTP ${res.status}:`, errText);
    throw new Error(`Shiprocket serviceability check failed: ${res.status}`);
  }

  const data = await res.json();
  const couriers = data?.data?.available_courier_companies || [];
  if (!couriers.length) return { serviceable: false, reason: 'No courier available for this PIN code' };

  const cheapest = couriers.reduce((a, b) => (a.rate < b.rate ? a : b));
  return {
    serviceable: true,
    mock: false,
    etaDays: Number(cheapest.estimated_delivery_days) || 5,
    etaLabel: cheapest.etd || `${cheapest.estimated_delivery_days} days`,
    codAvailable: couriers.some((c) => c.cod === 1),
    shippingFee: Math.round(cheapest.rate),
    courierName: cheapest.courier_name,
  };
}

/**
 * Create a shipment / forward order once payment is confirmed.
 * @param {object} order - full order record from db.js
 */
async function createShipment(order) {
  if (!isConfigured()) {
    return {
      mock: true,
      awbCode: 'MOCKAWB' + order.id,
      courierName: 'Mock Express',
      shipmentId: 'MOCKSHIP' + order.id,
      trackingUrl: `https://example.com/track/MOCKAWB${order.id}`,
      status: 'booked',
    };
  }

  const token = await getToken();
  const totalWeightKg = Math.max(
    0.1,
    (order.items.reduce((sum, i) => sum + (i.weightGrams || 250) * i.qty, 0)) / 1000
  );

  const payload = {
    order_id: order.id,
    order_date: order.createdAt.slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: order.address.name,
    billing_last_name: '',
    billing_address: order.address.line1,
    billing_address_2: order.address.line2 || '',
    billing_city: order.address.city,
    billing_pincode: order.address.pincode,
    billing_state: order.address.state,
    billing_country: 'India',
    billing_email: order.address.email || 'noemail@lallewools.com',
    billing_phone: order.address.phone,
    shipping_is_billing: true,
    order_items: order.items.map((i) => ({
      name: i.name,
      sku: i.sku || `LW-${i.id}`,
      units: i.qty,
      selling_price: i.price,
    })),
    payment_method: order.payment.method === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.amounts.subtotal,
    length: 30,
    breadth: 24,
    height: 3,
    weight: Number(totalWeightKg.toFixed(2)),
  };

  const res = await fetch(`${SHIPROCKET_BASE}/orders/create/adhoc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n[Shiprocket Order Create Failed] HTTP ${res.status}:`, errText);
    throw new Error(`Shiprocket order create failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return {
    mock: false,
    shipmentId: data.shipment_id,
    shiprocketOrderId: data.order_id,
    status: data.status,
    awbCode: data.awb_code || null,
  };
}

async function trackShipment(awbCode) {
  if (!isConfigured() || String(awbCode).startsWith('MOCKAWB')) {
    return {
      mock: true,
      awbCode,
      status: 'in_transit',
      checkpoints: [
        { status: 'Order Confirmed', at: new Date(Date.now() - 86400000).toISOString() },
        { status: 'Shipped', at: new Date().toISOString() },
      ],
    };
  }

  const token = await getToken();
  const res = await fetch(`${SHIPROCKET_BASE}/courier/track/awb/${awbCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`\n[Shiprocket Tracking Failed] HTTP ${res.status}:`, errText);
    throw new Error(`Shiprocket tracking failed: ${res.status}`);
  }

  return res.json();
}

module.exports = { isConfigured, checkServiceability, createShipment, trackShipment };