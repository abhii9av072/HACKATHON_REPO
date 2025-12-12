const User = require("../models/User");

exports.getMetrics = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    moneySaved: user.moneySaved || 0,
    carbonSaved: user.carbonSaved || 0,
    borrowedCount: user.borrowed.length,
    lentCount: user.lent.length
  });
};
