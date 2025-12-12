// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); // ensure this exists and works

// Google login (frontend already fetched google profile and posts it here)
router.post("/google", async (req, res) => {
  const { email, name, picture, googleId } = req.body;
  if (!email || !googleId) return res.status(400).json({ error: "Missing google data" });
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, picture, googleId });
      await user.save();
    } else {
      // update picture/name if changed
      user.name = name || user.name;
      user.picture = picture || user.picture;
      await user.save();
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // include user if frontend wants it
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
