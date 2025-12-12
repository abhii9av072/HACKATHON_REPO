const router = require('express').Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth'); // ensure user is logged in

// POST /api/lend
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, description, image, latitude, longitude } = req.body;

    if (!name || !category || !description || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const item = new Item({
      owner: req.user._id,
      name,
      category,
      description,
      image,
      location: { type: 'Point', coordinates: [longitude, latitude] }
    });

    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    console.error("Lend Item Error:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

module.exports = router;
q