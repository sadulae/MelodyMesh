import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';
import { Rating } from '@mui/material';
import axios from 'axios';

const FeedbackForm = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [error, setError] = useState(''); // Version 1: Keep the 'error' state from version 1

  // Fetch events and user info from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/feedback-user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserInfo({ name: response.data.firstName, email: response.data.email });
        }
      } catch (error) {
        console.error('Error fetching user info for feedback:', error);
      }
    };

    fetchEvents();
    fetchUserInfo();
  }, []);

  // Function to validate and sanitize feedback text
  const sanitizeInput = (text) => {
    const unwantedCharsRegex = /[;';\][.,/]+/g;
    const explicitWordsRegex = /(word1|word2|word3)/gi;
    let sanitizedText = text.replace(unwantedCharsRegex, '');
    sanitizedText = sanitizedText.replace(explicitWordsRegex, '****');
    return sanitizedText;
  };

  const handleFeedbackTextChange = (e) => {
    const sanitizedText = sanitizeInput(e.target.value);
    setFeedbackText(sanitizedText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Version 1: Keep the original error handling

    if (!selectedEvent || !feedbackText || !rating) {
      setError('Please fill in all fields.');
      return;
    }

    const feedbackData = {
      eventId: selectedEvent,
      feedbackText,
      rating,
      anonymous: isAnonymous,
      name: isAnonymous ? 'Anonymous' : userInfo.name,
      email: isAnonymous ? 'Anonymous' : userInfo.email,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/feedback', feedbackData);
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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              onChange={handleFeedbackTextChange}
              fullWidth
              margin="normal"
              required
            />

            {/* Star Rating */}
            <Box mt={2}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(e, newValue) => setRating(newValue)}
                size="large"
                precision={1}
              />
            </Box>

            {/* Anonymous Switch */}
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    color="primary"
                  />
                }
                label="Submit as Anonymous"
              />
            </Box>

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Submit Feedback
            </Button>
          </form>
        </>
      )}
    </Container>
  );
};

export default FeedbackForm;
