const express = require('express');
const router = express.Router();
const Organizer = require('../models/Organizer');
const authMiddleware = require('../middleware/authMiddleware');
const sendNotification = require('../utils/sendNotification'); // Utility function to send notifications

// @route   POST /api/admin/organizers
// @desc    Add a new organizer
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventID, organizerName, organizerRole, organizerContact, organizerEmail, startTime, endTime, notes } = req.body;

    if (!eventID || !organizerName || !organizerRole || !organizerContact || !organizerEmail || !startTime || !endTime) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newOrganizer = new Organizer({
      eventID,
      organizerName,
      organizerRole,
      organizerContact,
      organizerEmail,
      startTime,
      endTime,
      notes,
    });

    const savedOrganizer = await newOrganizer.save();
    res.status(201).json(savedOrganizer);
  } catch (error) {
    console.error('Error adding organizer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/organizers/:eventId
// @desc    Get organizers by event ID
// @access  Private
router.get('/:eventId', authMiddleware, async (req, res) => {
  try {
    const organizers = await Organizer.find({ eventID: req.params.eventId });
    if (!organizers.length) {
      return res.status(404).json({ message: 'No organizers found for this event.' });
    }
    res.json(organizers);
  } catch (error) {
    console.error('Error fetching organizers:', error);
    res.status(500).json({ message: 'Failed to fetch organizers.' });
  }
});

// @route   PUT /api/admin/organizers/:id
// @desc    Update an organizer
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizerName, organizerRole, organizerContact, organizerEmail, startTime, endTime, notes } = req.body;
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      { organizerName, organizerRole, organizerContact, organizerEmail, startTime, endTime, notes },
      { new: true }
    );
    
    if (!updatedOrganizer) {
      return res.status(404).json({ message: 'Organizer not found.' });
    }

    res.json(updatedOrganizer);
  } catch (error) {
    console.error('Error updating organizer:', error);
    res.status(500).json({ message: 'Failed to update organizer.' });
  }
});

// @route   DELETE /api/admin/organizers/:id
// @desc    Delete an organizer
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedOrganizer = await Organizer.findByIdAndDelete(req.params.id);
    if (!deletedOrganizer) {
      return res.status(404).json({ message: 'Organizer not found.' });
    }
    res.json({ message: 'Organizer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting organizer:', error);
    res.status(500).json({ message: 'Failed to delete organizer.' });
  }
});

// @route   POST /api/admin/organizers/send-notification
// @desc    Send a notification to the organizer
// @access  Private
router.post('/send-notification', authMiddleware, async (req, res) => {
    try {
      const { organizerEmail, organizerName, organizerRole, eventID, startTime, endTime } = req.body;
  
      // Ensure all required fields are provided
      if (!organizerEmail || !organizerName || !organizerRole || !eventID || !startTime || !endTime) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
      }
  
      // Simulate email sending logic or use a real service like nodemailer
      await sendNotification(organizerEmail, organizerName, organizerRole, eventID, startTime, endTime);
  
      res.json({ message: 'Notification sent successfully!' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Failed to send notification.' });
    }
  });

module.exports = router;
