const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET all available items for borrowing
// routes/items.js
router.get('/mylent', auth, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your lent items" });
  }
});


module.exports = router;
