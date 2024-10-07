import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField, Button, Grid, Typography, Box, MenuItem,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

const AddOrganizerEvent = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [status, setStatus] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !date || !time || !status) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Extract date and time components
    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // 'HH:MM'

    const eventData = {
      eventName: name,
      eventDate: formattedDate, // Send date as 'YYYY-MM-DD'
      eventTime: formattedTime, // Send time as 'HH:MM'
      status,
    };

    try {
      // Get token from localStorage for authorization
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/admin/organizer-add-event', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include JWT token in the Authorization header
          'Content-Type': 'application/json', // Explicitly set Content-Type
        },
      });

      if (response.status === 201) {
        setSuccess('Event added successfully!');
        setName('');
        setDate(null);
        setTime(null);
        setStatus('upcoming');
      } else {
        setError('Unexpected response from the server.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError('Failed to add event: ' + error.response.data.message);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Failed to add event. Please try again.');
      } else {
        console.error('Error message:', error.message);
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
              />
            </Grid>

            {/* Event Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Event Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>

            {/* Event Time */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Event Time"
                value={time}
                onChange={(newValue) => setTime(newValue)}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                variant="outlined"
                fullWidth
                required
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
                  disabled={loading}
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
