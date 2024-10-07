const express = require('express');
const router = express.Router();
const BandsPerformers = require('../models/BandsPerformers');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

/**
 * @route   POST /api/admin/bands-performers
 * @desc    Assign bands and performers to an event
 * @access  Admin (Protected)
 */
router.post('/bands-performers', authMiddleware, checkAdmin, async (req, res) => {
    const { eventID, bands, performers } = req.body;
  
    // Log incoming data
    console.log('Incoming data:', JSON.stringify(req.body, null, 2));
  
    // Validate incoming data
    if (!eventID || !Array.isArray(bands) || !Array.isArray(performers)) {
      console.error('Invalid data format: EventID, bands, and performers are required.');
      return res.status(400).json({ message: 'Invalid data format. EventID, bands, and performers are required.' });
    }
  
    // Ensure each band and performer is valid
    for (const band of bands) {
      if (!band.name || !band.email || !band.phone || !band.paymentAmount || !band.paymentStatus) {
        console.error('Invalid band data:', band);
        return res.status(400).json({ message: 'Each band must have name, email, phone, payment amount, and payment status.' });
      }
    }
  
    for (const performer of performers) {
      if (!performer.name || !performer.email || !performer.phone || !performer.paymentAmount || !performer.paymentStatus) {
        console.error('Invalid performer data:', performer);
        return res.status(400).json({ message: 'Each performer must have name, email, phone, payment amount, and payment status.' });
      }
    }
  
    // Log data before saving
    console.log('Data ready to be saved:', {
      eventID,
      bands,
      performers,
    });
  
    try {
      const newBandsPerformers = new BandsPerformers({
        eventID,
        bands,
        performers,
      });
  
      await newBandsPerformers.save();
      res.status(201).json({ message: 'Bands and performers assigned successfully!' });
    } catch (error) {
      console.error('Error assigning bands and performers:', error);
      res.status(500).json({ message: 'Failed to assign bands and performers.' });
    }
  });
  

/**
 * @route   GET /api/admin/bands-performers/:eventId
 * @desc    Get bands and performers for a specific event
 * @access  Admin (Protected)
 */
router.get('/bands-performers/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const bandsPerformers = await BandsPerformers.findOne({ eventID: req.params.eventId });
    if (!bandsPerformers) {
      return res.status(404).json({ message: 'Bands and performers not found for this event.' });
    }
    res.json(bandsPerformers);
  } catch (error) {
    console.error('Error fetching bands and performers:', error);
    res.status(500).json({ message: 'Failed to fetch bands and performers.' });
  }
});

/**
 * @route   PUT /api/admin/bands-performers/:eventId
 * @desc    Update bands and performers for an event
 * @access  Admin (Protected)
 */
router.put('/bands-performers/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  const { bands, performers } = req.body;

  try {
    const updatedBandsPerformers = await BandsPerformers.findOneAndUpdate(
      { eventID: req.params.eventId },
      { bands, performers },
      { new: true, upsert: true }
    );
    res.json({ message: 'Bands and performers updated successfully!', bandsPerformers: updatedBandsPerformers });
  } catch (error) {
    console.error('Error updating bands and performers:', error);
    res.status(500).json({ message: 'Failed to update bands and performers.' });
  }
});

/**
 * @route   DELETE /api/admin/bands-performers/:eventId
 * @desc    Delete all bands and performers for an event
 * @access  Admin (Protected)
 */
router.delete('/bands-performers/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    await BandsPerformers.findOneAndDelete({ eventID: req.params.eventId });
    res.json({ message: 'Bands and performers deleted successfully!' });
  } catch (error) {
    console.error('Error deleting bands and performers:', error);
    res.status(500).json({ message: 'Failed to delete bands and performers.' });
  }
});

module.exports = router;
