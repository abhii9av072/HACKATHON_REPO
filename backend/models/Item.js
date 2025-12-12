const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  borrowedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  distance: { type: Number, default: 0 },
  time: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
  