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
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Validation states
  const [eventNameError, setEventNameError] = useState('');
  const [eventDateError, setEventDateError] = useState('');
  const [eventTimeError, setEventTimeError] = useState('');
  const [statusError, setStatusError] = useState('');

  const eventNameRegex = /^[A-Za-z0-9,\-\s]*$/; // Regex for allowed characters in event name

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
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
        setEventDate(new Date(event.eventDate).toISOString().split('T')[0]);
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

  // Validate event name
  const validateEventName = (name) => {
    if (!name) {
      setEventNameError('Event name is required');
      return false;
    } else if (!eventNameRegex.test(name)) {
      setEventNameError(
        'Event name can only contain letters, numbers, commas, dashes, and spaces'
      );
      return false;
    } else {
      setEventNameError('');
      return true;
    }
  };

  // Validate event date
  const validateEventDate = (date) => {
    if (!date) {
      setEventDateError('Event date is required');
      return false;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setEventDateError('Event date cannot be in the past');
      return false;
    } else {
      setEventDateError('');
      return true;
    }
  };

  // Validate event time
  const validateEventTime = (time) => {
    if (!time) {
      setEventTimeError('Event time is required');
      return false;
    } else {
      setEventTimeError('');
      return true;
    }
  };

  // Validate status
  const validateStatus = (value) => {
    if (!value) {
      setStatusError('Status is required');
      return false;
    } else {
      setStatusError('');
      return true;
    }
  };

  // Handle form submission with all validations
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateEventName(eventName);
    const isDateValid = validateEventDate(eventDate);
    const isTimeValid = validateEventTime(eventTime);
    const isStatusValid = validateStatus(status);

    if (!isNameValid || !isDateValid || !isTimeValid || !isStatusValid) {
      return;
    }

    const updatedEvent = {
      eventName,
      eventDate,
      eventTime,
      status,
    };

    try {
      const token = localStorage.getItem('token');
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
      navigate('/admin/organizer-manage-events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event.');
    }
  };

  // Handle loading state
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
              onBlur={() => validateEventName(eventName)}
              error={!!eventNameError}
              helperText={eventNameError}
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
              onBlur={() => validateEventDate(eventDate)}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!eventDateError}
              helperText={eventDateError}
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
              onBlur={() => validateEventTime(eventTime)}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!eventTimeError}
              helperText={eventTimeError}
              required
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth required error={!!statusError}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                onBlur={() => validateStatus(status)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
              <FormHelperText>{statusError || 'Select the current status of the event'}</FormHelperText>
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
