const express = require("express");
const router = express.Router();
const { searchItem, suggestions } = require("../controllers/searchController");

router.get("/search", searchItem);
router.get("/suggestions", suggestions);

module.exports = router;
