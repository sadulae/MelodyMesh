const express = require('express');
const router = express.Router();
const SoundLighting = require('../models/Volunteer');
const authMiddleware = require('../middleware/authMiddleware'); 
const checkAdmin = require('../middleware/checkAdmin'); 

// Add sound and lighting details (POST)
router.post('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const newSoundLighting = new SoundLighting({
      eventID: req.body.eventID,
      soundProviderName: req.body.soundProviderName,
      lightProviderName: req.body.lightProviderName,
      soundPhoneNumber: req.body.soundPhoneNumber,
      lightPhoneNumber: req.body.lightPhoneNumber,
      soundEmail: req.body.soundEmail,
      lightEmail: req.body.lightEmail,
      soundEquipment: req.body.soundEquipment,
      lightingEquipment: req.body.lightingEquipment,
      soundPayment: req.body.soundPayment,
      lightPayment: req.body.lightPayment,
      paymentStatus: req.body.paymentStatus,
    });

    const savedSoundLighting = await newSoundLighting.save();
    res.status(201).json(savedSoundLighting);
  } catch (error) {
    console.error('Error adding sound and lighting details:', error);
    res.status(500).json({ message: 'Server error. Failed to add details.' });
  }
});

// Get sound and lighting details by event ID (GET)
router.get('/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const soundLightingDetails = await SoundLighting.find({ eventID: req.params.eventId });
    if (!soundLightingDetails.length) {
      return res.status(404).json({ message: 'No sound and lighting details found for this event.' });
    }
    res.json(soundLightingDetails);
  } catch (error) {
    console.error('Error fetching sound and lighting details:', error);
    res.status(500).json({ message: 'Failed to fetch details.' });
  }
});

// Update sound and lighting details by ID (PUT)
router.put('/:id', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const updatedSoundLighting = await SoundLighting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedSoundLighting) {
      return res.status(404).json({ message: 'Sound and lighting details not found.' });
    }

    res.json({ message: 'Details updated successfully', updatedSoundLighting });
  } catch (error) {
    console.error('Error updating sound and lighting details:', error);
    res.status(500).json({ message: 'Failed to update details.' });
  }
});

// Delete sound and lighting details by ID (DELETE)
router.delete('/:id', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const deletedSoundLighting = await SoundLighting.findByIdAndDelete(req.params.id);

    if (!deletedSoundLighting) {
      return res.status(404).json({ message: 'Details not found.' });
    }

    res.json({ message: 'Sound and lighting details deleted successfully' });
  } catch (error) {
    console.error('Error deleting sound and lighting details:', error);
    res.status(500).json({ message: 'Failed to delete details.' });
  }
});

module.exports = router;
