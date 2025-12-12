const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  category: String,
  description: String,
  image: String,
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  }
});

itemSchema.index({ location: '2dsphere' }); // enable geo queries

module.exports = mongoose.model('Item', itemSchema);
