import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Grid, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const AddOrganizer = () => {
  const [organizerName, setOrganizerName] = useState('');
  const [organizerRole, setOrganizerRole] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [eventID, setEventID] = useState(''); // For event selection
  const [events, setEvents] = useState([]); // Store available events

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
  ]; // Example roles for dropdown

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data); // Store fetched events
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare the form data
    const formData = {
      eventID,
      organizerName,
      organizerRole,
      organizerContact: contactNumber, // Fix this key to match the backend
      organizerEmail,
      notes,
      startTime,
      endTime,
    };
  
    // Log form data for debugging
    console.log('Form Data:', formData);
  
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
        // Clear form fields
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
              onChange={(e) => setOrganizerName(e.target.value)}
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
              onChange={(e) => setContactNumber(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Organizer Email */}
          <Grid item xs={12}>
            <TextField
              label="Organizer Email"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
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
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Organizer
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddOrganizer;
