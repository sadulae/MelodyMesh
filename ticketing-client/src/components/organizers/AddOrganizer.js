import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Grid, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const AddOrganizer = () => {
  const [organizerName, setOrganizerName] = useState('');
  const [organizerNameError, setOrganizerNameError] = useState('');
  const [organizerRole, setOrganizerRole] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerEmailError, setOrganizerEmailError] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactNumberError, setContactNumberError] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventID, setEventID] = useState('');
  const [events, setEvents] = useState([]);
  const [timeError, setTimeError] = useState('');

  const roles = [
    'Event Manager',
    'Stage Manager',
    'Sound Engineer',
    'Lighting Technician',
    'Artist Liaison',
    'Security Coordinator',
    'Marketing Manager',
    'Logistics Coordinator',
    'Ticketing Manager',
    'Catering Manager',
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z\s]*$/;

    if (regex.test(value)) {
      const formattedName = value
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word

      setOrganizerName(formattedName);
      setOrganizerNameError('');
    } else {
      setOrganizerNameError('Please enter only letters and spaces.');
    }
  };

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*$/;

    if (regex.test(value) && value.length <= 10) {
      setContactNumber(value);
      setContactNumberError('');

      if (value.length === 10) {
        setContactNumberError('');
      } else if (value.length > 0 && value.length < 10) {
        setContactNumberError('Contact number must be exactly 10 digits.');
      }
    } else {
      setContactNumberError('Please enter only numbers (10 digits required).');
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9._@-]*$/;

    if (regex.test(value)) {
      setOrganizerEmail(value);
      setOrganizerEmailError('');

      if (value) {
        const emailValidationRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
        if (!emailValidationRegex.test(value)) {
          setOrganizerEmailError('Please enter a valid email address.');
        } else {
          setOrganizerEmailError('');
        }
      }
    } else {
      setOrganizerEmailError('Please enter valid characters for email.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure the contact number is exactly 10 digits before submitting
    if (contactNumber.length !== 10) {
      setContactNumberError('Contact number must be exactly 10 digits.');
      return;
    }

    // Ensure the email is valid before submitting
    if (organizerEmailError) {
      return;
    }

    // Validate start time and end time
    const now = new Date();
    if (!startTime || !endTime || startTime <= now || endTime <= now) {
      setTimeError('Both start time and end time must be in the future.');
      return;
    }

    if (endTime <= startTime) {
      setTimeError('End time must be after start time.');
      return;
    } else {
      setTimeError(''); // Clear error if the time is valid
    }

    const formData = {
      eventID,
      organizerName,
      organizerRole,
      organizerContact: contactNumber,
      organizerEmail,
      notes,
      startTime,
      endTime,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/organizers',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert('Organizer added successfully!');
        setOrganizerName('');
        setOrganizerRole('');
        setOrganizerEmail('');
        setContactNumber('');
        setNotes('');
        setStartTime(null);
        setEndTime(null);
        setEventID('');
      } else {
        alert('Failed to add organizer.');
      }
    } catch (error) {
      console.error('Error submitting organizer details:', error.response?.data || error.message);
      alert(`Error occurred while submitting organizer details: ${error.response?.data.message || error.message}`);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Add Organizer
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Dropdown to select Event */}
          <Grid item xs={12}>
            <TextField
              select
              label="Select Event"
              value={eventID}
              onChange={(e) => setEventID(e.target.value)}
              fullWidth
              required
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Organizer Name */}
          <Grid item xs={12}>
            <TextField
              label="Organizer Name"
              value={organizerName}
              onChange={handleNameChange}
              error={!!organizerNameError}
              helperText={organizerNameError}
              fullWidth
              required
            />
          </Grid>

          {/* Organizer Role */}
          <Grid item xs={12}>
            <TextField
              select
              label="Organizer Role"
              value={organizerRole}
              onChange={(e) => setOrganizerRole(e.target.value)}
              fullWidth
              required
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Contact Number */}
          <Grid item xs={12}>
            <TextField
              label="Contact Number"
              value={contactNumber}
              onChange={handleContactNumberChange}
              error={!!contactNumberError}
              helperText={contactNumberError}
              fullWidth
              required
            />
          </Grid>

          {/* Organizer Email */}
          <Grid item xs={12}>
            <TextField
              label="Organizer Email"
              value={organizerEmail}
              onChange={handleEmailChange}
              error={!!organizerEmailError}
              helperText={organizerEmailError}
              fullWidth
              required
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              label="Special Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* Time Slot */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={(newValue) => {
                  const now = new Date();
                  if (newValue <= now) {
                    setTimeError('Start time must be after the current date and time.');
                    setStartTime(null); // Clear the start time if invalid
                  } else {
                    setStartTime(newValue);
                    setTimeError(''); // Clear error on valid time
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!timeError} 
                    helperText={timeError} 
                    required 
                  />
                )}
                minDateTime={new Date()} // Set minimum date/time to current time
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={(newValue) => {
                  const now = new Date();
                  if (newValue <= now) {
                    setTimeError('End time must be after the current date and time.');
                    setEndTime(null); // Clear the end time if invalid
                  } else {
                    setEndTime(newValue);
                    setTimeError(''); // Clear error on valid time
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!timeError} 
                    helperText={timeError} 
                    required 
                  />
                )}
                minDateTime={new Date()} // Set minimum date/time to current time
              />
            </LocalizationProvider>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button variant="contained" type="submit">
              Add Organizer
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddOrganizer;
