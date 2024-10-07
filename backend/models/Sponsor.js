const mongoose = require('mongoose');

const SponsorSchema = new mongoose.Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  sponsorName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  brandInfo: {
    type: String,
    required: true,
  },
  brandPoster: {
    type: String,
  },
  sponsorshipAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    required: true,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model('Sponsor', SponsorSchema);
