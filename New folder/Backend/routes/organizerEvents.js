const express = require('express');
const router = express.Router();
const OrganizerEvent = require('../models/OrganizerEvent');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin'); // Middleware to check admin role

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/organizer/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/admin/organizer-add-event
 * @desc    Add a new event for the organizer
 * @access  Admin (Protected)
 */
router.post('/organizer-add-event', authMiddleware, checkAdmin, upload.single('poster'), async (req, res) => {
    const { eventName, eventDate, eventTime, status } = req.body;
  
    try {
      const eventID = Date.now().toString(); // Generate a unique event ID
  
      // Convert eventDate to a proper Date object (if needed)
      const parsedEventDate = new Date(eventDate);
      if (isNaN(parsedEventDate)) {
        console.error('Invalid date format:', eventDate);
        return res.status(400).json({ message: 'Invalid date format.' });
      }
  
      // Create new event
      const newEvent = new OrganizerEvent({
        eventName,
        eventDate: parsedEventDate,
        eventTime,
        eventID,
        status,
        posterUrl: req.file ? `/uploads/organizer/${req.file.filename}` : '',
      });
  
      await newEvent.save();
      res.status(201).json({ message: 'Organizer event added successfully!' });
    } catch (error) {
      console.error('Error adding organizer event:', error);
      res.status(500).json({ message: 'Failed to add organizer event.' });
    }
  });

/**
 * @route   GET /api/admin/organizer-events
 * @desc    Get all organizer events
 * @access  Admin (Protected)
 */
router.get('/organizer-events', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const events = await OrganizerEvent.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * @route   GET /api/admin/organizer-events/:eventId
 * @desc    Get organizer event by ID
 * @access  Admin (Protected)
 */
router.get('/organizer-events/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const event = await OrganizerEvent.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching organizer event:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * @route   PUT /api/admin/organizer-events/:eventId
 * @desc    Update organizer event by ID
 * @access  Admin (Protected)
 */
router.put('/organizer-events/:eventId', authMiddleware, checkAdmin, upload.single('poster'), async (req, res) => {
  const { eventName, eventDate, eventTime, status } = req.body; // Match frontend field names

  try {
    // Convert eventDate to Date object
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    const updatedEventData = {
      eventName, // Use correct field names
      eventDate: parsedEventDate,
      eventTime,
      status,
    };

    if (req.file) {
      updatedEventData.posterUrl = `/uploads/organizer/${req.file.filename}`;
    }

    const updatedEvent = await OrganizerEvent.findByIdAndUpdate(req.params.eventId, updatedEventData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Organizer event updated successfully!', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update organizer event.' });
  }
});

/**
 * @route   DELETE /api/admin/organizer-events/:eventId
 * @desc    Delete organizer event by ID
 * @access  Admin (Protected)
 */
router.delete('/organizer-events/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const deletedEvent = await OrganizerEvent.findByIdAndDelete(req.params.eventId);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json({ message: 'Organizer event deleted successfully!' });
  } catch (error) {
    console.error('Error deleting organizer event:', error);
    res.status(500).json({ message: 'Failed to delete organizer event.' });
  }
});

module.exports = router;
