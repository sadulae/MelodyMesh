const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const performerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
});

const bandSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  paymentAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
});

const bandsPerformersSchema = new Schema({
  eventID: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  bands: [bandSchema],
  performers: [performerSchema],
});

const BandsPerformers = mongoose.model('BandsPerformers', bandsPerformersSchema);

module.exports = BandsPerformers;
