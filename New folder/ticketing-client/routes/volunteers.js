const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/admin/volunteers
// @desc    Add a new volunteer
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventID, name, nic, gender, role, email, phone } = req.body;

    // Ensure all required fields are provided
    if (!eventID || !name || !nic || !gender || !role || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newVolunteer = new Volunteer({
      eventID,
      name,
      nic,
      gender,
      role,
      email,
      phone,
    });

    const savedVolunteer = await newVolunteer.save();
    res.status(201).json(savedVolunteer);
  } catch (error) {
    console.error('Error adding volunteer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/volunteers/:eventId
// @desc    Get volunteers by event ID
// @access  Private
router.get('/:eventId', authMiddleware, async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ eventID: req.params.eventId });
    if (!volunteers.length) {
      return res.status(404).json({ message: 'No volunteers found for this event.' });
    }
    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Failed to fetch volunteers.' });
  }
});

// @route   PUT /api/admin/volunteers/:id
// @desc    Update a volunteer by ID
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, nic, gender, role, email, phone } = req.body;

    // Ensure all required fields are provided
    if (!name || !nic || !gender || !role || !email || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Find the volunteer by ID and update the fields
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { name, nic, gender, role, email, phone },
      { new: true, runValidators: true } // Return the updated document and ensure validation
    );

    if (!updatedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }

    res.status(200).json(updatedVolunteer);
  } catch (error) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({ message: 'Failed to update volunteer.' });
  }
});

// @route   DELETE /api/admin/volunteers/:id
// @desc    Delete a volunteer
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedVolunteer = await Volunteer.findByIdAndDelete(req.params.id);

    if (!deletedVolunteer) {
      return res.status(404).json({ message: 'Volunteer not found.' });
    }

    res.json({ message: 'Volunteer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    res.status(500).json({ message: 'Failed to delete volunteer.' });
  }
});

module.exports = router;
