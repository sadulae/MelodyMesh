const mongoose = require('mongoose');

const TierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  benefits: { type: String, required: true },
  // Add the quantity field here
  quantity: { type: Number, required: true },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  posterUrl: { type: String, required: true },
  tiers: [TierSchema],
});

module.exports = mongoose.model('Event', EventSchema);
