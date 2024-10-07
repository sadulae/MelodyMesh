const express = require('express');
const router = express.Router();
const Sponsor = require('../models/Sponsor');
const authMiddleware = require('../middleware/authMiddleware');
const sendNotification = require('../utils/sendSponsorNotification'); // Email function
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../uploads')); // Resolve to the correct absolute path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with original extension
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10MB
});

// @route   POST /api/admin/sponsors
// @desc    Add a new sponsor
// @access  Private
router.post('/', authMiddleware, upload.single('brandPoster'), async (req, res) => {
    const {
      sponsorName,
      contactPerson,
      contactEmail,
      contactNumber, // Use contactNumber instead of contactPhone
      brandInfo,
      paymentAmount, // Use paymentAmount instead of sponsorshipAmount
      paymentStatus,
      eventID,
      notes,
    } = req.body;
  
    // Check for required fields
    if (
      !sponsorName ||
      !contactPerson ||
      !contactEmail ||
      !contactNumber || // Corrected field name
      !brandInfo ||
      !paymentAmount || // Corrected field name
      !paymentStatus ||
      !eventID
    ) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
  
    // Check if brandPoster file is provided
    const brandPoster = req.file ? req.file.filename : null;
    if (!brandPoster) {
      return res.status(400).json({ message: 'Brand poster must be uploaded.' });
    }
  
    try {
      const newSponsor = new Sponsor({
        sponsorName,
        contactPerson,
        contactEmail,
        contactPhone: contactNumber, // Use the correct field name
        brandInfo,
        brandPoster,
        sponsorshipAmount: paymentAmount, // Use the correct field name
        paymentStatus,
        eventID,
        notes,
      });
  
      const savedSponsor = await newSponsor.save();
      res.status(201).json(savedSponsor);
    } catch (error) {
      console.error('Error adding sponsor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  

// @route   GET /api/admin/sponsors/:eventId
// @desc    Get sponsors by event ID
// @access  Private
router.get('/:eventId', authMiddleware, async (req, res) => {
  console.log('GET /api/admin/sponsors/:eventId called with eventId:', req.params.eventId);

  try {
    const sponsors = await Sponsor.find({ eventID: req.params.eventId });
    if (!sponsors.length) {
      console.log('No sponsors found for event:', req.params.eventId);
      return res.status(404).json({ message: 'No sponsors found for this event.' });
    }
    console.log('Sponsors found:', sponsors); // Log found sponsors
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ message: 'Failed to fetch sponsors.' });
  }
});

// @route   PUT /api/admin/sponsors/:id
// @desc    Update a sponsor
// @access  Private
router.put('/:id', authMiddleware, upload.single('brandPoster'), async (req, res) => {
  console.log('PUT /api/admin/sponsors/:id called with id:', req.params.id);
  console.log('PUT request body:', req.body); // Log the update request body

  const { sponsorName, contactPerson, contactEmail, contactPhone, brandInfo, sponsorshipAmount, paymentStatus, notes } = req.body;

  const updateFields = {
    sponsorName,
    contactPerson,
    contactEmail,
    contactPhone,
    brandInfo,
    sponsorshipAmount,
    paymentStatus,
    notes,
  };

  if (req.file) {
    updateFields.brandPoster = `/uploads/${req.file.filename}`; // Save updated poster link
  }

  try {
    const updatedSponsor = await Sponsor.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updatedSponsor) {
      console.log('Sponsor not found for id:', req.params.id);
      return res.status(404).json({ message: 'Sponsor not found.' });
    }

    console.log('Sponsor updated:', updatedSponsor); // Log the updated sponsor
    res.json(updatedSponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ message: 'Failed to update sponsor.' });
  }
});

// @route   DELETE /api/admin/sponsors/:id
// @desc    Delete a sponsor
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  console.log('DELETE /api/admin/sponsors/:id called with id:', req.params.id);

  try {
    const deletedSponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!deletedSponsor) {
      console.log('Sponsor not found for id:', req.params.id);
      return res.status(404).json({ message: 'Sponsor not found.' });
    }
    console.log('Sponsor deleted:', deletedSponsor); // Log deleted sponsor
    res.json({ message: 'Sponsor deleted successfully.' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ message: 'Failed to delete sponsor.' });
  }
});

// @route   POST /api/admin/sponsors/send-notification
// @desc    Send a notification to the sponsor
// @access  Private
router.post('/send-notification', authMiddleware, async (req, res) => {
  console.log('POST /api/admin/sponsors/send-notification called with:', req.body);

  const { contactEmail, sponsorName, sponsorshipAmount, paymentStatus, eventName } = req.body;

  try {
    await sendNotification(contactEmail, sponsorName, sponsorshipAmount, paymentStatus, eventName);
    console.log('Notification sent to:', contactEmail);
    res.json({ message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification.' });
  }
});

module.exports = router;
