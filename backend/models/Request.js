// backend/models/Request.js
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  itemSnapshot: { type: Object }, // store item snapshot (name, image, category) to show later
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "delivered", "rejected", "cancelled"], default: "pending" },
  // owner-provided contact & meeting info (filled when owner accepts)
  meeting: {
    address: String,
    time: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
