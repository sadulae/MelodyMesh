const express = require('express');
const router = express.Router();

// Home route
router.get('/home', (req, res) => {
  res.send('Home page');
});

// Contact route
router.get('/contact', (req, res) => {
  res.send('Contact page');
});

// About route
router.get('/about', (req, res) => {
  res.send('About page');
});

module.exports = router;
