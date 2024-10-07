const express = require('express');
const router = express.Router();
const OrganizerEvent = require('../models/OrganizerEvent');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin'); // Middleware to check admin role

/**
 * @route   POST /api/admin/organizer-add-event
 * @desc    Add a new event for the organizer
 * @access  Admin (Protected)
 */
router.post('/organizer-add-event', authMiddleware, checkAdmin, async (req, res) => { 
  const { eventName, eventDate, eventTime, status } = req.body;

  try {
    const eventID = Date.now().toString(); // Generate a unique event ID

    // Validate eventDate
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      console.error('Invalid date format:', eventDate);
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Validate eventTime (basic validation)
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(eventTime)) {
      console.error('Invalid time format:', eventTime);
      return res.status(400).json({ message: 'Invalid time format.' });
    }

    // Create new event
    const newEvent = new OrganizerEvent({
      eventName,
      eventDate: parsedEventDate,
      eventTime,
      eventID,
      status,
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
    const events = await OrganizerEvent.find().sort({ eventDate: -1 }); // Changed 'date' to 'eventDate'
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
router.put('/organizer-events/:eventId', authMiddleware, checkAdmin, async (req, res) => {
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
