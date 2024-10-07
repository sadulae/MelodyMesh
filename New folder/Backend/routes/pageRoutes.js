const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Home route
router.get('/home', (req, res) => {
  res.send('Home page');
});

// Contact route
router.get('/contact', (req, res) => {
  res.send('Contact page');
});

// About route
router.get('/about', (req, res) => {
  res.send('About page');
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
