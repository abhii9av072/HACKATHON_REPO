const Item = require("../models/Item");
const User = require("../models/User");

exports.getAllItems = async (req, res) => {
  const query = req.query.q || "";
  const items = await Item.find({ name: { $regex: query, $options: "i" }, availability: true }).populate("owner", "name email");
  res.json({ results: items });
};

exports.getSuggestions = async (req, res) => {
  const query = req.query.q || "";
  const items = await Item.find({ name: { $regex: "^" + query, $options: "i" }, availability: true }).limit(5);
  res.json({ suggestions: items.map(i => i.name) });
};

exports.lendItem = async (req, res) => {
  const userId = req.user.id;
  const { name, category, description, image } = req.body;

  const newItem = await Item.create({ name, category, description, image, owner: userId });
  await User.findByIdAndUpdate(userId, { $push: { lent: newItem._id } });
  res.json({ success: true, item: newItem });
};

exports.borrowItem = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.body;

  const item = await Item.findById(itemId);
  if (!item || !item.availability) return res.status(400).json({ error: "Item not available" });

  item.availability = false;
  item.borrowedBy = userId;
  await item.save();

  await User.findByIdAndUpdate(userId, { $push: { borrowed: item._id } });

  // Update metrics (dummy values, can customize)
  const moneySaved = 500; // assume 500 Rs saved per borrow
  const carbonSaved = 2; // assume 2 kg CO2 saved
  await User.findByIdAndUpdate(userId, { $inc: { moneySaved, carbonSaved } });

  res.json({ success: true, item });
};
