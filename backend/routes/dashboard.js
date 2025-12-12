const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/metrics", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ moneySaved: user.moneySaved, carbonSaved: user.carbonSaved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
