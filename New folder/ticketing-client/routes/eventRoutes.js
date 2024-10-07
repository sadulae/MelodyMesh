const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

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

/**
 * @route   POST /api/events/:eventId/update-tickets
 * @desc    Update ticket quantities after checkout
 * @access  Public (you may want to restrict this to an authenticated user)
 */
router.post('/:eventId/update-tickets', async (req, res) => {
  try {
    const { tickets } = req.body; // Array of tickets purchased
    const { eventId } = req.params;
    console.log('Tickets:', tickets); // Log tickets to ensure they are received
    console.log('Event ID:', eventId); // Log event ID

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Loop through the purchased tickets and decrement quantities
    tickets.forEach((ticket) => {
      const tier = event.tiers.id(ticket.tierId); // Find the tier
      if (tier) {
        if (tier.quantity < ticket.quantity) {
          return res.status(400).json({ message: 'Not enough tickets available.' });
        }
        tier.quantity -= ticket.quantity; // Decrement the quantity
      }
    });

    // Save the updated event
    await event.save();
    res.json({ message: 'Ticket quantities updated successfully' });
  } catch (error) {
    console.error('Error updating tickets:', error);
    res.status(500).json({ message: 'Failed to update tickets' });
  }
});



module.exports = router;
