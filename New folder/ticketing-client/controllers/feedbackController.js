const Feedback = require('../models/Feedback');

// Create feedback (user submitting feedback)
exports.createFeedback = async (req, res) => {
  const { eventId, feedbackText, rating, anonymous, name, email } = req.body;

  try {
    const newFeedback = new Feedback({
      eventId,
      feedbackText,
      rating,
      anonymous,
      name,
      email,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error });
  }
};

// Get feedback for an event (Admin or user viewing feedback for a particular event)
exports.getFeedbackByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const feedback = await Feedback.find({ eventId }).populate('eventId', 'title');
    if (!feedback) {
      return res.status(404).json({ message: 'No feedback found for this event' });
    }
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback for event', error });
  }
};

exports.getPublicFeedbackByEvent = async (req, res) => {
    const { eventId } = req.params;
  
    try {
      const feedback = await Feedback.find({ eventId }).populate('eventId', 'title');
  
      if (!feedback || feedback.length === 0) {
        return res.status(404).json({ message: 'No feedback found for this event' });
      }
  
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feedback for event', error });
    }
  };
