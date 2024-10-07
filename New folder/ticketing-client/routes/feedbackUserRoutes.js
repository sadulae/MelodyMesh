const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware to authenticate

// Get user details for feedback form
router.get('/', authMiddleware, async (req, res) => { // Change to '/' since the base path is already defined in server.js
  try {
    const user = await User.findById(req.user.id).select('firstName email'); // Fetch only firstName and email
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
