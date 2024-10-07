const mongoose = require('mongoose');

const OrganizerSchema = new mongoose.Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  organizerName: {
    type: String,
    required: true,
  },
  organizerRole: {
    type: String,
    required: true,
  },
  organizerContact: {
    type: String,
    required: true,
  },
  organizerEmail: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model('Organizer', OrganizerSchema);
