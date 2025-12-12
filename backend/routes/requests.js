// backend/routes/requests.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Request = require("../models/Request");
const Item = require("../models/Item");
const User = require("../models/User");

// POST /api/request  - borrower requests an item
// body: { itemId }
router.post("/", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "No itemId" });

    const item = await Item.findById(itemId).populate("owner");
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.borrowedBy) return res.status(400).json({ error: "Item already borrowed" });

    // create request
    const request = await Request.create({
      item: item._id,
      itemSnapshot: { name: item.name, image: item.image, category: item.category },
      borrower: req.user.id,
      owner: item.owner._id
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error("create request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/requests/owner  - owner sees incoming requests
router.get("/owner", auth, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user.id }).populate("borrower", "name email picture").populate("item", "name image category");
    res.json({ results: requests });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /api/requests/my  - borrower sees own requests
router.get("/my", auth, async (req, res) => {
  try {
    const requests = await Request.find({ borrower: req.user.id }).populate("owner", "name email picture").populate("item", "name image category");
    res.json({ results: requests });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/requests/:id/accept - owner accepts and provides contact/time/phone
// body: { address, time, phone }
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { address, time, phone } = req.body;
    const request = await Request.findById(id).populate("item");
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (String(request.owner) !== String(req.user.id)) return res.status(403).json({ error: "Not authorized" });
    if (request.status !== "pending") return res.status(400).json({ error: "Invalid state" });

    // update request
    request.status = "accepted";
    request.meeting = { address, time, phone };
    await request.save();

    res.json({ success: true, request });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/requests/:id/mark-delivered - borrower marks delivered (final step)
// This will: set item.borrowedBy, update trust/metrics
router.post("/:id/mark-delivered", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate("item").populate("owner").populate("borrower");
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (String(request.borrower._id) !== String(req.user.id)) return res.status(403).json({ error: "Not authorized" });
    if (request.status !== "accepted") return res.status(400).json({ error: "Invalid state" });

    // mark item as borrowed by borrower
    const item = await Item.findById(request.item._id);
    item.borrowedBy = request.borrower._id;
    await item.save();

    // mark request delivered
    request.status = "delivered";
    await request.save();

    // update metrics and trust
    const owner = await User.findById(request.owner._id);
    const borrower = await User.findById(request.borrower._id);

    // For example increments (tweak as you like)
    borrower.moneySaved = (borrower.moneySaved || 0) + 100; // estimated money saved
    borrower.carbonSaved = (borrower.carbonSaved || 0) + 5;
    await borrower.save();

    owner.trustScore = Math.min(100, (owner.trustScore || 10) + 5);
    await owner.save();

    res.json({ success: true });
  } catch (err) {
    console.error("mark-delivered error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Optional: cancel / reject endpoints
router.post("/:id/reject", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Not found" });
    if (String(request.owner) !== String(req.user.id)) return res.status(403).json({ error: "Not authorized" });
    request.status = "rejected";
    await request.save();
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

module.exports = router;
