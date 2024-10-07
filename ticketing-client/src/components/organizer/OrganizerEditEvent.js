import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material';

const OrganizerEditEvent = () => {
  const { eventId } = useParams(); // Get eventId from the URL
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(null); // To handle error state

  useEffect(() => {
    // Fetch event details using the eventId
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token for authorization
        const response = await axios.get(
          `http://localhost:5000/api/admin/organizer-events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const event = response.data;
        setEventName(event.eventName);
        setEventDate(new Date(event.eventDate).toISOString().split('T')[0]); // Format date for input
        setEventTime(event.eventTime);
        setStatus(event.status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to fetch event details.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!eventName || !eventDate || !eventTime || !status) {
      setError('Please fill in all required fields.');
      return;
    }

    const updatedEvent = {
      eventName,
      eventDate,
      eventTime,
      status,
    };

    try {
      const token = localStorage.getItem('token'); // Get token for authorization
      await axios.put(
        `http://localhost:5000/api/admin/organizer-events/${eventId}`,
        updatedEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('Event updated successfully!');
      navigate('/admin/organizer-manage-events'); // Redirect after successful update
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event.');
    }
  };

  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: '80vh' }}
      >
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        maxWidth: 600,
        margin: 'auto',
        marginTop: 5,
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Edit Organizer Event
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Event Name */}
          <Grid item xs={12}>
            <TextField
              label="Event Name"
              variant="outlined"
              fullWidth
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </Grid>

          {/* Event Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Event Date"
              type="date"
              variant="outlined"
              fullWidth
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>

          {/* Event Time */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Event Time"
              type="time"
              variant="outlined"
              fullWidth
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
              <FormHelperText>Select the current status of the event</FormHelperText>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Update Event
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default OrganizerEditEvent;
