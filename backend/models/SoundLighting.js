const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SoundLightingSchema = new Schema({
  eventID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // This references the Event model
    required: true,
  },
  soundProviderName: {
    type: String,
    required: true,
  },
  lightProviderName: {
    type: String,
    required: true,
  },
  soundPhoneNumber: {
    type: String,
    required: true,
  },
  lightPhoneNumber: {
    type: String,
    required: true,
  },
  soundEmail: {
    type: String,
    required: true,
  },
  lightEmail: {
    type: String,
    required: true,
  },
  soundEquipment: [
    {
      equipmentName: String,
      quantity: Number,
    },
  ],
  lightingEquipment: [
    {
      equipmentName: String,
      quantity: Number,
    },
  ],
  soundPayment: {
    type: Number,
    required: true,
  },
  lightPayment: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
    required: true,
  },
});

module.exports = mongoose.model('SoundLighting', SoundLightingSchema);
