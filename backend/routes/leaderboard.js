const express = require("express");
const router = express.Router();
const User = require('../models/User'); // path relative to routes file

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const results = await User.find({})
      .sort({ carbonSaved: -1 })
      .skip(skip)
      .limit(limit)
      .select("name picture carbonSaved trustScore moneySaved")
      .lean();

    // Return as 'leaderboard' to match frontend expectations
    res.json({
      leaderboard: results
    });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
