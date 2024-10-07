const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin'); // Middleware to check admin role

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/admin/add-event
 * @desc    Add a new event
 * @access  Admin (Protected)
 */
router.post('/add-event', authMiddleware, checkAdmin, upload.single('poster'), async (req, res) => {
  const { title, description, date, location, tiers } = req.body;

  try {
    // Parse tiers as it's received as a JSON string
    let parsedTiers = [];
    try {
      parsedTiers = JSON.parse(tiers);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid tiers format.' });
    }

    // Validate each tier
    for (const tier of parsedTiers) {
      if (!tier.name || !tier.price || !tier.benefits || tier.quantity === undefined) {
        return res.status(400).json({ message: 'All tier fields are required, including quantity.' });
      }
      if (parseInt(tier.quantity) <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0.' });
      }
    }

    // Convert date string to Date object
    const eventDate = new Date(date);
    if (isNaN(eventDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      location,
      posterUrl: req.file ? `/uploads/${req.file.filename}` : '',
      tiers: parsedTiers,
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully!' });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Failed to add event.' });
  }
});

/**
 * @route   GET /api/admin/events
 * @desc    Get all events
 * @access  Admin (Protected)
 */
router.get('/events', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * @route   GET /api/admin/events/:eventId
 * @desc    Get event by ID
 * @access  Admin (Protected)
 */
router.get('/events/:eventId', authMiddleware, checkAdmin, async (req, res) => {
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

/**
 * @route   PUT /api/admin/events/:eventId
 * @desc    Update event by ID
 * @access  Admin (Protected)
 */
router.put('/events/:eventId', authMiddleware, checkAdmin, upload.single('poster'), async (req, res) => {
  const { title, description, date, location, tiers } = req.body;

  try {
    // Parse tiers
    let parsedTiers = [];
    try {
      parsedTiers = JSON.parse(tiers);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid tiers format.' });
    }

    // Validate each tier
    for (const tier of parsedTiers) {
      if (!tier.name || !tier.price || !tier.benefits || tier.quantity === undefined) {
        return res.status(400).json({ message: 'All tier fields are required, including quantity.' });
      }
      if (parseInt(tier.quantity) <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0.' });
      }
    }

    // Convert date string to Date object
    const eventDate = new Date(date);
    if (isNaN(eventDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const updatedEventData = {
      title,
      description,
      date: eventDate,
      location,
      tiers: parsedTiers,
    };

    if (req.file) {
      updatedEventData.posterUrl = `/uploads/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.eventId, updatedEventData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Event updated successfully!', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event.' });
  }
});

/**
 * @route   DELETE /api/admin/events/:eventId
 * @desc    Delete event by ID
 * @access  Admin (Protected)
 */
router.delete('/events/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json({ message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event.' });
  }
});

module.exports = router;
