const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newLocationSchema = new Schema({
  eventID: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  locationName: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  contactPerson: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  parking: {
    type: String,
    enum: ['Yes', 'No'],
  },
  accessibleFeatures: {
    type: [String],
  },
  paymentAmount: {
    type: Number,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const NewLocation = mongoose.model('NewLocation', newLocationSchema);
module.exports = NewLocation;
