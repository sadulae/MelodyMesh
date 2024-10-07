import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Typography, Container, Grid } from '@mui/material';
import axios from 'axios';

const AddVolunteer = () => {
  const [eventID, setEventID] = useState('');
  const [events, setEvents] = useState([]); // State to store events
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState(''); // Gender state
  const [role, setRole] = useState(''); // Preferred role state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState([
    'Stage Manager',
    'Sound Engineer',
    'Lighting Technician',
    'Security',
    'Usher',
    'Front of House',
    'Artist Liaison',
    'Catering',
    'Ticketing',
    'Backstage Assistant'
  ]); // Example roles for dropdown

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

    // Prepare the payload for the API request
    const payload = {
      eventID,
      name,
      nic,
      gender,
      role,
      email,
      phone,
    };

    try {
      const token = localStorage.getItem('token'); // Get token from local storage
      const response = await axios.post('http://localhost:5000/api/admin/volunteers', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        alert('Volunteer details added successfully!');
      } else {
        alert('Failed to add volunteer details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('There was an error submitting the form.');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Add Volunteer Details</Typography>
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

          {/* Name */}
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* NIC */}
          <Grid item xs={12}>
            <TextField
              label="NIC"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Gender */}
          <Grid item xs={12}>
            <TextField
              select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="preferNotToSay">Prefer not to mention</MenuItem>
            </TextField>
          </Grid>

          {/* Preferred Role */}
          <Grid item xs={12}>
            <TextField
              select
              label="Preferred Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
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

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Volunteer
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddVolunteer;
