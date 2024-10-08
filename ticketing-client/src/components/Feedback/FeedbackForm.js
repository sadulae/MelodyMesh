import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Rating } from '@mui/material'; // For star rating
import axios from 'axios';

const FeedbackForm = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [feedbackError, setFeedbackError] = useState(''); // New state for feedback error

  // Fetch events and user info from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events'); // Fetching events
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you're using JWT for auth
        if (token) {
          const response = await axios.get('http://localhost:5000/api/feedback-user', {
            headers: { Authorization: `Bearer ${token}` }, // Sending token in the headers
          });
          setUserInfo({ name: response.data.firstName, email: response.data.email });
        }
      } catch (error) {
        console.error('Error fetching user info for feedback:', error);
      }
    };

    fetchEvents();
    fetchUserInfo(); // Fetching user info from feedback-user route
  }, []);

  // Validate feedback text
  const validateFeedback = () => {
    if (feedbackText.length < 10) {
      setFeedbackError('Feedback must be at least 10 characters long');
      return false;
    }
    if (feedbackText.length > 500) {
      setFeedbackError('Feedback cannot exceed 500 characters');
      return false;
    }
    setFeedbackError('');
    return true;
  };

  // Handle feedback submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!selectedEvent || !feedbackText || !rating) {
      alert('Please fill in all fields');
      return;
    }

    // Validate feedback text
    if (!validateFeedback()) return;

    const feedbackData = {
      eventId: selectedEvent,
      feedbackText,
      rating,
      anonymous: isAnonymous,
      name: isAnonymous ? 'Anonymous' : userInfo.name,
      email: isAnonymous ? 'Anonymous' : userInfo.email,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/feedback', feedbackData); // Post feedback
      if (response.status === 201) {
        alert('Feedback submitted successfully');
        setFeedbackText('');
        setRating(0);
        setSelectedEvent('');
        setIsAnonymous(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Container>
      {loading ? (
        <Typography>Loading events...</Typography>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Submit Feedback
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Select Event */}
            <TextField
              select
              label="Select Event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.title}
                </MenuItem>
              ))}
            </TextField>

            {/* User Name */}
            <TextField
              label="Your Name"
              value={isAnonymous ? 'Anonymous' : userInfo.name}
              fullWidth
              margin="normal"
              disabled
            />

            {/* User Email */}
            <TextField
              label="Your Email"
              value={isAnonymous ? 'Anonymous' : userInfo.email}
              fullWidth
              margin="normal"
              disabled
            />

            {/* Feedback Text */}
            <TextField
              label="Your Feedback"
              multiline
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!feedbackError} // Show error if there's a validation issue
              helperText={feedbackError} // Display error message
            />

            {/* Star Rating */}
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
              precision={1}
            />

            {/* Anonymous Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  color="primary"
                />
              }
              label="Submit as Anonymous"
            />

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit Feedback
            </Button>
          </form>
        </>
      )}
    </Container>
  );
};

export default FeedbackForm;
