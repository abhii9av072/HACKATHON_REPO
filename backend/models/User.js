const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  picture: String,
  carbonSaved: { type: Number, default: 0 },
  moneySaved: { type: Number, default: 0 },
  trustMeter: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
