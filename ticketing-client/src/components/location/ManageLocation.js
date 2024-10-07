import React, { useState, useEffect, useRef } from 'react';
import {
  Button, TextField, MenuItem, Typography, Container, Box, CircularProgress, Checkbox, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 };
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual key

const accessibleFeaturesOptions = [
  'Wheelchair Accessible Seating',
  'Assistive Listening Devices',
  'Sign Language Interpretation',
  'Accessible Restrooms',
  'Accessible Parking',
  'Braille Signage',
  'Elevator or Ramp Access',
  'Strobe-Free Lighting',
  'Quiet Areas',
  'Accessible Stage or Dance Floor',
  'Closed Captioning',
  'Service Animal Friendly',
];

const ManageLocation = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // Store the selected event object
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    locationName: '',
    notes: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    capacity: '',
    parking: 'No',
    paymentAmount: '',
    paymentStatus: 'pending',
    accessibleFeatures: [],
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
  });
  const [latLng, setLatLng] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [noLocations, setNoLocations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false); // Modal state

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const autocompleteRef = useRef(null);

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

  const fetchLocations = async (eventId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/new-locations/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedLocations = response.data.locations || [];
      if (fetchedLocations.length > 0) {
        setLocations(fetchedLocations);
        setNewLocation(fetchedLocations[0]);
        setLatLng({ lat: fetchedLocations[0].lat, lng: fetchedLocations[0].lng });
        setNoLocations(false);
      } else {
        setNoLocations(true);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setNoLocations(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccessibleFeaturesChange = (event) => {
    const { target: { value } } = event;
    setNewLocation((prev) => ({
      ...prev,
      accessibleFeatures: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    setLatLng({ lat: clickedLat, lng: clickedLng });
    setNewLocation((prev) => ({ ...prev, lat: clickedLat, lng: clickedLng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newLocation.locationName) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/new-locations/${newLocation._id}`,
        { ...newLocation, eventID: selectedEvent._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Location updated successfully!');
      fetchLocations(selectedEvent._id);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location.');
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    fetchLocations(event._id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>Manage Locations</Typography>

      <TextField label="Search Event" fullWidth value={searchTerm} onChange={handleSearchChange} margin="normal" />

      {filteredEvents.length > 0 ? (
        <Grid container spacing={2}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} key={event._id}>
              <Box border={1} padding={2} borderRadius={4} borderColor="grey.300">
                <Typography variant="h6">{event.eventName}</Typography>
                <Typography>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                <Button variant="contained" color="primary" onClick={() => handleEdit(event)}>Edit Location</Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No events found.</Typography>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Location for {selectedEvent?.eventName}</DialogTitle>
        <DialogContent>
          {/* Conditionally render form or message based on location availability */}
          {noLocations ? (
            <Typography>No location details available for this event.</Typography>
          ) : (
            // Start of the form
            <form onSubmit={handleSubmit}>
              <TextField label="Location Name" name="locationName" fullWidth value={newLocation.locationName} onChange={handleInputChange} margin="normal" required />
              <TextField label="Notes" name="notes" fullWidth value={newLocation.notes} onChange={handleInputChange} margin="normal" multiline rows={3} />
              <TextField label="Contact Person" name="contactPerson" fullWidth value={newLocation.contactPerson} onChange={handleInputChange} margin="normal" />
              <TextField label="Phone Number" name="contactPhone" fullWidth value={newLocation.contactPhone} onChange={handleInputChange} margin="normal" />
              <TextField label="Email Address" name="contactEmail" fullWidth value={newLocation.contactEmail} onChange={handleInputChange} margin="normal" />
              <TextField label="Capacity" name="capacity" fullWidth value={newLocation.capacity} onChange={handleInputChange} margin="normal" />
              <TextField label="Parking Availability" select fullWidth name="parking" value={newLocation.parking} onChange={handleInputChange} margin="normal">
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>

              <TextField
                label="Accessible Features"
                name="accessibleFeatures"
                select
                fullWidth
                margin="normal"
                SelectProps={{
                  multiple: true,
                  value: newLocation.accessibleFeatures,
                  onChange: handleAccessibleFeaturesChange,
                  renderValue: (selected) => selected.join(', ')
                }}
              >
                {accessibleFeaturesOptions.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    <Checkbox checked={newLocation.accessibleFeatures.indexOf(feature) > -1} />
                    <ListItemText primary={feature} />
                  </MenuItem>
                ))}
              </TextField>

              {isLoaded && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>Select Location on Map</Typography>
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={latLng} zoom={10} onClick={handleMapClick}>
                    <Marker position={latLng} />
                  </GoogleMap>
                </Box>
              )}

              {/* Move DialogActions inside the form */}
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" color="primary" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Update Location'}
                </Button>
              </DialogActions>
            </form>
            // End of the form
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ManageLocation;
