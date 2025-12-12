const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAllItems, getSuggestions, lendItem, borrowItem } = require("../controllers/itemController");

router.get("/search", getAllItems);
router.get("/suggestions", getSuggestions);
router.post("/lend", protect, lendItem);
router.post("/borrow", protect, borrowItem);

module.exports = router;
