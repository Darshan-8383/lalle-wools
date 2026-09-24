# LALLEWOOLS — Full-Stack Storefront

Your original frontend (`FINAL_REAL WEBSITE/`) is preserved pixel-for-pixel — same
HTML, CSS, look and feel. What's new is a real Node/Express backend behind it,
so the site is no longer "fake checkout with localStorage" — it has real
order records, server-side pricing, and is wired to plug straight into
**Razorpay** (payments) and **Shiprocket** (shipping).

Everything works out of the box in **mock mode** with zero API keys, so you
can click through the entire checkout flow today. Add real keys later and
nothing else changes.

## What changed vs. the original frontend

| Before | Now |
|---|---|
| Product list hardcoded in `js/script.js` | Served from `GET /api/products` (single source of truth in `server/data/products.js`) |
| Cart total computed & trusted from the browser | Server re-validates every item's price + stock before creating an order |
| "Place Order" just faked an order ID | Creates a real order record, and for online payments opens Razorpay Checkout for real |
| No shipping logic at all | PIN code serviceability check + automatic shipment booking after payment/COD confirmation |

The visual design, animations, product mockups, search, wishlist, "Find My
Fit" — all untouched.

## Project structure

```
loolo-fullstack/
├── public/                  ← your original frontend, served as static files
│   ├── index.html            (added 2 <script> tags: api.js + Razorpay checkout.js)
│   ├── css/style.css          (untouched)
│   ├── js/script.js           (checkout logic now calls the real backend)
│   ├── js/api.js              (new: tiny fetch wrapper for the API)
│   └── images/
├── server/
│   ├── index.js              ← Express app entry point
│   ├── db.js                  (simple JSON-file order store — swap for a real DB later)
│   ├── data/
│   │   ├── products.js        (product catalog — edit prices/stock here)
│   │   └── db.json            (auto-created; holds orders)
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payment.js
│   │   └── shipping.js
│   └── services/
│       ├── payment.js         ← Razorpay integration (+ mock fallback)
│       └── shipping.js        ← Shiprocket integration (+ mock fallback)
├── package.json
└── .env.example
```

## Run it locally

```bash
npm install
cp .env.example .env      # leave the keys blank to run in mock mode
npm start                 # http://localhost:4000
```

Open `http://localhost:4000` — this is the same site, now backend-powered.
Add something to your bag, go through checkout, and place an order with any
payment method (including "UPI") — mock mode simulates a successful payment
instantly so you can see the full flow, including the confirmation screen
and the auto-booked mock shipment.

Check `GET /api/health` any time to see whether real gateway/shipping keys
are detected.

## Connecting Razorpay (payments)

1. Sign up at https://dashboard.razorpay.com/signup
2. Go to **Settings → API Keys**, generate **Test** keys first (they behave
   exactly like live keys, but with Razorpay's test cards/UPI IDs — no real
   money moves).
3. Put them in `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```
4. Restart the server. `GET /api/health` should now report
   `"paymentGateway": "razorpay (live keys)"`, and the checkout will open
   Razorpay's real Checkout modal instead of the instant mock success.
5. (Recommended) In Razorpay Dashboard → **Settings → Webhooks**, add a
   webhook pointing at `https://yourdomain.com/api/payment/webhook` for the
   `payment.captured` and `payment.failed` events, then put that same secret
   in `RAZORPAY_WEBHOOK_SECRET`. This is a safety net that confirms payments
   server-to-server even if the customer closes their browser tab right
   after paying.
6. When you're ready for real transactions, switch to your **Live** keys
   (Razorpay requires KYC/business verification for this) — no code changes
   needed, just swap the `.env` values.

Want a different gateway (Stripe, PayU, Cashfree, Instamojo)? Everything
gateway-specific lives in `server/services/payment.js` — the routes and
frontend only call `createPaymentOrder()` / `verifyPaymentSignature()`, so
you can swap the internals of that one file without touching anything else.

## Connecting Shiprocket (shipping)

1. Sign up at https://www.shiprocket.in
2. In their dashboard, add your pickup/warehouse address under
   **Settings → Pickup Addresses**, and note the exact nickname you gave it.
3. Put your credentials in `.env`:
   ```
   SHIPROCKET_EMAIL=you@example.com
   SHIPROCKET_PASSWORD=your-password
   SHIPROCKET_PICKUP_LOCATION=Primary
   SHIPROCKET_PICKUP_PINCODE=560001
   ```
4. Restart the server. `GET /api/health` should report
   `"shippingProvider": "shiprocket (live keys)"`.
5. From then on:
   - The checkout page's PIN code serviceability + delivery estimate
     (step 2 of checkout) calls Shiprocket's real serviceability API.
   - As soon as an order is paid (or placed as COD), the backend
     automatically calls Shiprocket to book a shipment (`server/routes
     /orders.js` → `bookShipmentInBackground`). The resulting AWB/tracking
     number is stored on the order.
   - `GET /api/shipping/track/:orderId` fetches live tracking.

Prefer Delhivery, Pickrr, or another provider directly? Same idea — only
`server/services/shipping.js` needs to change; the function names
(`checkServiceability`, `createShipment`, `trackShipment`) are the contract
the rest of the app relies on.

## Managing products

Edit `server/data/products.js` — every product's price, stock, description,
sizes, etc. live there now instead of in the frontend. Restart the server to
pick up changes. (For a real store you'll eventually want an admin UI or a
database table instead of a JS file — see below.)

## Going to a real database

`server/db.js` currently stores orders in a JSON file
(`server/data/db.json`) so the whole app runs with zero setup. It's fine for
testing and very small stores, but for production swap it for Postgres,
MySQL, or MongoDB:

- Keep the exported function signatures the same
  (`createOrder`, `getOrder`, `updateOrder`, `listOrders`,
  `findOrderByRazorpayOrderId`) and nothing in `routes/` or `services/`
  needs to change.
- Same idea for `server/data/products.js` — move the array into a
  `products` table and change `routes/products.js` to query it instead.

## Deploying

This is a single Node process serving both the API and the static frontend,
so it deploys anywhere Node runs:

- **Render / Railway / Fly.io**: point them at this repo, build command
  `npm install`, start command `npm start`, add your `.env` values as
  environment variables in their dashboard.
- **A VPS**: `git clone`, `npm install`, `npm start` behind `pm2` + nginx.
- Keep `CLIENT_ORIGIN` in `.env` set to your real domain once deployed
  (instead of `*`) to lock down CORS.

## Security notes for going live

- Never commit `.env` — it's already in `.gitignore`.
- All prices are recomputed server-side from `server/data/products.js`
  before an order is created — the frontend's numbers are never trusted.
- Phone numbers and PIN codes are validated server-side.
- Razorpay payments are verified two ways: the signature returned to the
  browser (`/api/payment/verify`) and, once you add the webhook secret, a
  second server-to-server confirmation (`/api/payment/webhook`) — this
  protects you even if someone tampers with the browser-side request.
