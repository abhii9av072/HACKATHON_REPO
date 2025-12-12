const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET all available items for borrowing
router.get('/', auth, async (req, res) => {
  try {
    const items = await Item.find({ available: true }).populate('owner', 'name email');
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

module.exports = router;
