/**
 * Minimal file-backed datastore.
 * --------------------------------
 * Zero native dependencies (no node-gyp / better-sqlite3 build headaches),
 * so this runs anywhere Node runs. It's intentionally simple — a real
 * production deployment should swap this for Postgres/MySQL/Mongo behind
 * the same function signatures (createOrder, getOrder, updateOrder, etc.)
 * so nothing else in the app needs to change. See README "Going to a real
 * database" section.
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [], nextOrderSeq: 1000 }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/** Very small mutex so concurrent requests don't clobber the JSON file. */
let queue = Promise.resolve();
function withLock(fn) {
  const result = queue.then(() => fn());
  queue = result.catch(() => {});
  return result;
}

function createOrder(order) {
  return withLock(() => {
    const db = readDb();
    const id = 'LW' + db.nextOrderSeq.toString(36).toUpperCase();
    db.nextOrderSeq += 1;
    const record = {
      id,
      status: 'pending', // pending -> paid/cod_confirmed -> shipped -> delivered | payment_failed | cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...order,
    };
    db.orders.push(record);
    writeDb(db);
    return record;
  });
}

function getOrder(id) {
  const db = readDb();
  return db.orders.find((o) => o.id === id) || null;
}

function findOrderByRazorpayOrderId(razorpayOrderId) {
  const db = readDb();
  return db.orders.find((o) => o.payment && o.payment.razorpayOrderId === razorpayOrderId) || null;
}

function updateOrder(id, patch) {
  return withLock(() => {
    const db = readDb();
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    db.orders[idx] = { ...db.orders[idx], ...patch, updatedAt: new Date().toISOString() };
    writeDb(db);
    return db.orders[idx];
  });
}

function listOrders() {
  return readDb().orders;
}

module.exports = {
  createOrder,
  getOrder,
  updateOrder,
  listOrders,
  findOrderByRazorpayOrderId,
};
