const mongoose = require('mongoose');

const organizerEventSchema = new mongoose.Schema({
  eventID: {
    type: String,
    default: () => Date.now().toString(),
  },
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'], // Add 'ongoing' here
    required: true,
  },
  posterUrl: {
    type: String,
  },
});

module.exports = mongoose.model('OrganizerEvent', organizerEventSchema);
