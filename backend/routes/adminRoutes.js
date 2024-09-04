const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route to add an event (without authMiddleware for testing)
router.post('/add-event', upload.single('poster'), async (req, res) => {
  const { title, description, date, location, tiers } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      posterUrl: req.file ? `/uploads/${req.file.filename}` : '',
      tiers: JSON.parse(tiers), // Parse tiers as it's received as a string
    });

    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully!' });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Failed to add event' });
  }
});

module.exports = router;
