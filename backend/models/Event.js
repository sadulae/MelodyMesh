const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  name: String,
  price: Number,
  benefits: String,
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  posterUrl: { type: String }, // Field for storing poster URL
  tiers: [tierSchema],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
