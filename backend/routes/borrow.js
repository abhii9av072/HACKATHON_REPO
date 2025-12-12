// backend/routes/borrow.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Item = require("../models/Item");
const User = require("../models/User");

router.post("/", auth, async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) return res.status(400).json({ error: "No itemId provided" });
  try {
    const item = await Item.findById(itemId).populate("owner");
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.borrowedBy) return res.status(400).json({ error: "Item already borrowed" });

    // Assign borrower
    item.borrowedBy = req.user.id;
    await item.save();

    // Increase lender (owner) trust score slightly, ensure bounds 10..100
    if (item.owner) {
      const owner = await User.findById(item.owner._id || item.owner);
      if (owner) {
        owner.trustScore = Math.min(100, Math.max(10, (owner.trustScore || 10) + 3)); // +5 per lend (tunable)
        await owner.save();
      }
    }

    // Optionally update borrower metrics (handled earlier in your code if desired)
    res.json({ success: true });
  } catch (err) {
    console.error("borrow POST error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
