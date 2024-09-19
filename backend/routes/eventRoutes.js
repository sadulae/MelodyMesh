const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

/**
 * @route   GET /api/events
 * @desc    Get all public events
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * @route   GET /api/events/:eventId
 * @desc    Get event by ID (public)
 * @access  Public
 */
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

