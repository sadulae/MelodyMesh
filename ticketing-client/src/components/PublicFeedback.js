import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Rating,
} from '@mui/material';
import axios from 'axios';

const PublicFeedback = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch feedback for the selected event
  const fetchFeedback = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/public-feedback/${eventId}`);
      setFeedback(response.data);
    } catch (error) {
      setError('Error fetching feedback');
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle event selection change
  const handleEventChange = (event) => {
    const eventId = event.target.value;
    setSelectedEvent(eventId);
    fetchFeedback(eventId); // Fetch feedback for the selected event
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        View Feedback for Events
      </Typography>

      {/* Select Event */}
      <TextField
        select
        label="Select Event"
        value={selectedEvent}
        onChange={handleEventChange}
        fullWidth
        margin="normal"
      >
        {events.map((event) => (
          <MenuItem key={event._id} value={event._id}>
            {event.title}
          </MenuItem>
        ))}
      </TextField>

      {/* Feedback Display */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : feedback.length > 0 ? (
        <Grid container spacing={4} sx={{ marginTop: 2 }}>
          {feedback.map((fb) => (
            <Grid item xs={12} sm={6} md={4} key={fb._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar>{fb.anonymous ? 'A' : fb.name.charAt(0)}</Avatar>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">
                        {fb.anonymous ? 'Anonymous' : fb.name}
                      </Typography>
                      <Typography color="textSecondary">{fb.email}</Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body1" sx={{ marginTop: 2 }}>
                    {fb.feedbackText}
                  </Typography>
                  <Rating value={fb.rating} precision={0.5} readOnly sx={{ marginTop: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ marginTop: 2 }}>No feedback available for this event.</Typography>
      )}
    </Container>
  );
};

export default PublicFeedback;
