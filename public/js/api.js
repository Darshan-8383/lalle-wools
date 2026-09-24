/* ═══════════════════════════════════════
   LALLEWOOLS — api.js
   Thin fetch wrapper around the backend REST API.
   Same-origin by default (works once server/index.js serves this file);
   override window.LALLEWOOLS_API_BASE before this script loads if the
   frontend and backend are deployed separately.
═══════════════════════════════════════ */
'use strict';

const API_BASE = window.LALLEWOOLS_API_BASE || '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const Api = {
  getProducts: () => apiRequest('/products'),
  getProduct: (id) => apiRequest(`/products/${id}`),

  createOrder: (payload) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id) => apiRequest(`/orders/${id}`),

  createPaymentOrder: (orderId) =>
    apiRequest('/payment/create-order', { method: 'POST', body: JSON.stringify({ orderId }) }),
  verifyPayment: (payload) =>
    apiRequest('/payment/verify', { method: 'POST', body: JSON.stringify(payload) }),

  checkPincode: (pincode, amount, weightKg) =>
    apiRequest('/shipping/check-pincode', {
      method: 'POST',
      body: JSON.stringify({ pincode, amount, weightKg }),
    }),
  trackOrder: (orderId) => apiRequest(`/shipping/track/${orderId}`),
};
