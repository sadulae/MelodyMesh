require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust path if necessary

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.disconnect();
      return;
    }

    // Create an admin user
    const hashedPassword = await bcrypt.hash('password123', 10); // Use a strong password
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      dob: new Date('1980-01-01'),
      isAdmin: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    mongoose.disconnect();
  });
