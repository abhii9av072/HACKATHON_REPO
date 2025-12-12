const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require('../models/User'); // path relative to routes file

router.get("/metrics", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      moneySaved: user.moneySaved || 0,
      carbonSaved: user.carbonSaved || 0,
      trustMeter: user.trustScore || 0
    });
  } catch (err) {
    console.error("Dashboard metrics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
