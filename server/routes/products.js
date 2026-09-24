const express = require('express');
const { PRODUCTS } = require('../data/products');

const router = express.Router();

// GET /api/products  — optional ?type=clothing|poster & ?category=xyz
router.get('/', (req, res) => {
  let list = PRODUCTS;
  if (req.query.type) list = list.filter((p) => p.type === req.query.type);
  if (req.query.category) list = list.filter((p) => p.category === req.query.category);
  res.json(list);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = PRODUCTS.find((p) => String(p.id) === String(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
