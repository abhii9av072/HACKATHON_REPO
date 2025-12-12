const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Item = require("../models/Item");

router.post("/", auth, async (req, res) => {
  const { name, category, description, image } = req.body;
  try {
    const item = new Item({ name, category, description, image, owner: req.user.id });
    await item.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  const query = req.query.q || "";
  try {
    const items = await Item.find({ name: { $regex: query, $options: "i" } }).populate("owner");
    res.json({ results: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ results: [] });
  }
});

module.exports = router;
