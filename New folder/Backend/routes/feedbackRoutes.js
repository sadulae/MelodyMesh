const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const Feedback = require('../models/Feedback');

// POST route for user feedback submission
router.post('/', feedbackController.createFeedback);

// GET route for viewing feedback by event (e.g., admin side)
router.get('/:eventId', feedbackController.getFeedbackByEvent);
router.get('/public-feedback/:eventId', feedbackController.getPublicFeedbackByEvent);

// PUT route for updating feedback by feedbackId
router.put('/:feedbackId', async (req, res) => {
  const { feedbackText, rating } = req.body;
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.feedbackText = feedbackText;
    feedback.rating = rating;
    await feedback.save();

    res.status(200).json({ message: 'Feedback updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating feedback', error });
  }
});

// DELETE route for deleting feedback by feedbackId
router.delete('/:feedbackId', async (req, res) => {
    try {
      console.log('Deleting feedback with ID:', req.params.feedbackId);
      
      // Use findByIdAndDelete to directly delete the document
      const feedback = await Feedback.findByIdAndDelete(req.params.feedbackId);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
  
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ message: 'Error deleting feedback', error });
    }
  });
module.exports = router;
