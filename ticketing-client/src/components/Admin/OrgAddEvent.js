import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography } from '@mui/material';
import axios from 'axios';

const OrgAddEvent = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Validation states
  const [eventNameError, setEventNameError] = useState('');
  const [eventDateError, setEventDateError] = useState('');

  // Form validity
  const [isFormValid, setIsFormValid] = useState(false);

  // Regular expression for event name validation
  const eventNameRegex = /^[A-Za-z0-9,\-\s]*$/;

  // Function to validate event name
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

  // Function to validate event date
  const validateEventDate = (date) => {
    if (!date) {
      setEventDateError('Event date is required');
      return false;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    // Remove time part for comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setEventDateError('Event date cannot be in the past');
      return false;
    } else {
      setEventDateError('');
      return true;
    }
  };

  // Function to handle event name input with character restriction
  const handleEventNameChange = (e) => {
    const input = e.target.value;
    // Allow only valid characters: letters, numbers, commas, dashes, and spaces
    const filteredInput = input.replace(/[^A-Za-z0-9,\-\s]/g, '');
    setEventName(filteredInput);
  };

  // Function to handle key press validation
  const handleEventNameKeyPress = (e) => {
    const allowedKeys = /^[A-Za-z0-9,\-\s]$/; // Only allow alphanumeric, comma, dash, and space
    if (!allowedKeys.test(e.key)) {
      e.preventDefault(); // Prevent entering invalid characters
    }
  };

  // Function to get today's date in YYYY-MM-DD format for the min attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Effect to check form validity whenever inputs or errors change
  useEffect(() => {
    const isNameValid = validateEventName(eventName);
    const isDateValid = validateEventDate(eventDate);
    setIsFormValid(isNameValid && isDateValid);
  }, [eventName, eventDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNameValid = validateEventName(eventName);
    const isDateValid = validateEventDate(eventDate);
    if (!isNameValid || !isDateValid) {
      return;
    }
    try {
      await axios.post('/api/organizer-events', { eventName, eventDate });
      alert('Event added successfully');
      // Reset form
      setEventName('');
      setEventDate('');
    } catch (err) {
      console.error(err);
      alert('Failed to add event');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">Add Organizer Event</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Event Name"
            fullWidth
            value={eventName}
            onChange={handleEventNameChange}
            onKeyPress={handleEventNameKeyPress}
            onBlur={(e) => validateEventName(e.target.value)}
            error={!!eventNameError}
            helperText={eventNameError}
            inputProps={{
              maxLength: 100,
              pattern: '[A-Za-z0-9,\\-\\s]*',
              title:
                'Event name can only contain letters, numbers, commas, dashes, and spaces',
            }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Event Date"
            fullWidth
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            onBlur={(e) => validateEventDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getTodayDate(), // This will prevent selecting past dates
            }}
            error={!!eventDateError}
            helperText={eventDateError}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isFormValid}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default OrgAddEvent;
