const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

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

module.exports = router;
