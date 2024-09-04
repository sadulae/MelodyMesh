const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true }, // Assuming dob is captured as a Date
  resetToken: { type: String }, // For storing the reset password token
  resetTokenExpiration: { type: Date }, // For storing the expiration time of the token
});

module.exports = mongoose.model('User', UserSchema);
