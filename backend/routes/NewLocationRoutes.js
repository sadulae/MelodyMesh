const express = require('express');
const router = express.Router();
const NewLocation = require('../models/NewLocation');
const authMiddleware = require('../middleware/authMiddleware');  // ensure this middleware file exists
const checkAdmin = require('../middleware/checkAdmin');  // ensure this middleware file exists

// @route   POST /api/admin/new-locations
// @desc    Add a new location
// @access  Admin (Protected)
router.post('/', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const newLocation = new NewLocation({
      eventID: req.body.eventID,
      locationName: req.body.locationName,
      notes: req.body.notes,
      contactPerson: req.body.contactPerson,
      contactPhone: req.body.contactPhone,
      contactEmail: req.body.contactEmail,
      capacity: req.body.capacity,
      parking: req.body.parking,
      accessibleFeatures: req.body.accessibleFeatures,
      paymentAmount: req.body.paymentAmount,
      paymentStatus: req.body.paymentStatus,
      lat: req.body.lat,
      lng: req.body.lng,
    });

    await newLocation.save();
    res.status(201).json({ message: 'Location added successfully', location: newLocation });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ message: 'Server error. Failed to add location.' });
  }
});

// @route   GET /api/admin/new-locations/:eventId
// @desc    Get all locations for a specific event
// @access  Admin (Protected)
router.get('/:eventId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const locations = await NewLocation.find({ eventID: req.params.eventId });
    if (!locations.length) {
      return res.status(404).json({ message: 'No locations found for this event' });
    }
    res.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Failed to fetch locations' });
  }
});

// @route   PUT /api/admin/new-locations/:locationId
// @desc    Update a location by ID
// @access  Admin (Protected)
router.put('/:locationId', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const location = await NewLocation.findByIdAndUpdate(
      req.params.locationId,
      req.body,
      { new: true }
    );
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json({ message: 'Location updated successfully', location });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// @route   DELETE /api/admin/new-locations/:locationId
// @desc    Delete a location by ID
// @access  Admin (Protected)
router.delete('/:eventId/delete-all', authMiddleware, checkAdmin, async (req, res) => {
  try {
    const deletedLocations = await NewLocation.deleteMany({ eventID: req.params.eventId });
    if (!deletedLocations.deletedCount) {
      return res.status(404).json({ message: 'No locations found for this event' });
    }
    res.json({ message: 'All locations deleted successfully' });
  } catch (error) {
    console.error('Error deleting locations:', error);
    res.status(500).json({ message: 'Failed to delete locations' });
  }
});

module.exports = router;
