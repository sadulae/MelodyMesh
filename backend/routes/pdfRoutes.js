const express = require('express');
const router = express.Router();
const { generateOngoingEventsPDF } = require('../controllers/pdfController');

// Route to generate PDF
router.get('/generate-pdf', generateOngoingEventsPDF);

module.exports = router;
