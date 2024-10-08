import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, Grid, Typography, Box, MenuItem,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AddOrganizerEvent = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [status, setStatus] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validation states
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [statusError, setStatusError] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate

  // Form validity
  const [isFormValid, setIsFormValid] = useState(false);

  // Regular expression for event name validation
  const eventNameRegex = /^[A-Za-z0-9,\-\s]*$/;

  // Function to validate event name
  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('Event name is required.');
      return false;
    } else if (!eventNameRegex.test(name)) {
      setNameError('Only letters, numbers, commas, dashes, and spaces are allowed.');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  // Function to validate event date
  const validateDate = (date) => {
    if (!date) {
      setDateError('Event date is required.');
      return false;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setDateError('Event date cannot be in the past.');
      return false;
    } else {
      setDateError('');
      return true;
    }
  };

  // Function to validate event time
  const validateTime = (time) => {
    if (!time) {
      setTimeError('Event time is required.');
      return false;
    } else {
      setTimeError('');
      return true;
    }
  };

  // Function to validate status
  const validateStatus = (status) => {
    if (!status) {
      setStatusError('Status is required.');
      return false;
    } else {
      setStatusError('');
      return true;
    }
  };

  // useEffect to check form validity whenever inputs or errors change
  useEffect(() => {
    const isNameValid = validateName(name);
    const isDateValid = validateDate(date);
    const isTimeValid = validateTime(time);
    const isStatusValid = validateStatus(status);
    setIsFormValid(isNameValid && isDateValid && isTimeValid && isStatusValid);
  }, [name, date, time, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isDateValid = validateDate(date);
    const isTimeValid = validateTime(time);
    const isStatusValid = validateStatus(status);

    if (!isNameValid || !isDateValid || !isTimeValid || !isStatusValid) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 'HH:MM'

    const eventData = {
      eventName: name.trim(),
      eventDate: formattedDate,
      eventTime: formattedTime,
      status,
    };

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/admin/organizer-add-event', eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setSuccess('Event added successfully!');
        setName('');
        setDate(null);
        setTime(null);
        setStatus('upcoming');
        
        // Redirect to manage events page
        navigate('/admin/organizer-manage-events');
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (error) {
      if (error.response) {
        setError('Failed to add event: ' + error.response.data.message);
      } else if (error.request) {
        setError('Failed to add event. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Add New Event
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, margin: '0 auto' }}>
          <Grid container spacing={2}>
            {/* Event Name */}
            <Grid item xs={12}>
              <TextField
                label="Event Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                error={!!nameError}
                helperText={nameError}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            {/* Event Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Event Date"
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                  validateDate(newValue);
                }}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    error={!!dateError}
                    helperText={dateError}
                  />
                )}
              />
            </Grid>

            {/* Event Time */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Event Time"
                value={time}
                onChange={(newValue) => {
                  setTime(newValue);
                  validateTime(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    error={!!timeError}
                    helperText={timeError}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  validateStatus(e.target.value);
                }}
                variant="outlined"
                fullWidth
                required
                error={!!statusError}
                helperText={statusError}
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!isFormValid || loading}
                  fullWidth
                >
                  Add Event
                </Button>
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'primary.main',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AddOrganizerEvent;
