// src/components/Admin/ManageLocation.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Typography,
  Container,
  Box,
  CircularProgress,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Snackbar,
  Alert,
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
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

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
  const [errors, setErrors] = useState({}); // State for form errors
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Snackbar state

  const autocompleteRef = useRef(null);

  // Regex Patterns for Validation
  const patterns = {
    locationName: /^[A-Za-z0-9 ]*$/,
    notes: /^[A-Za-z0-9,.\- ]*$/,
    contactPerson: /^[A-Za-z ]*$/,
    contactPhone: /^[0-9()+\- ]*$/,
    contactEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    capacity: /^\d+$/,
    paymentAmount: /^\d+(\.\d{1,2})?$/,
  };

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
        setSnackbar({ open: true, message: 'Failed to fetch events.', severity: 'error' });
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

    // Update newLocation state
    setNewLocation((prev) => ({ ...prev, [name]: value }));

    // Validate the input
    let errorMsg = '';

    switch (name) {
      case 'locationName':
        if (!value.trim()) {
          errorMsg = 'Location Name is required.';
        } else if (!patterns.locationName.test(value)) {
          errorMsg = 'Only letters and numbers are allowed.';
        }
        break;
      case 'notes':
        if (value && !patterns.notes.test(value)) {
          errorMsg = 'Only letters, numbers, commas, hyphens, and periods are allowed.';
        }
        break;
      case 'contactPerson':
        if (!value.trim()) {
          errorMsg = 'Contact Person is required.';
        } else if (!patterns.contactPerson.test(value)) {
          errorMsg = 'Only letters and spaces are allowed.';
        }
        break;
      case 'contactPhone':
        if (!value.trim()) {
          errorMsg = 'Contact Phone is required.';
        } else if (!patterns.contactPhone.test(value)) {
          errorMsg = 'Only numbers and allowed symbols (+, -, (, )) are allowed.';
        }
        break;
      case 'contactEmail':
        if (!value.trim()) {
          errorMsg = 'Contact Email is required.';
        } else if (!patterns.contactEmail.test(value)) {
          errorMsg = 'Invalid email format.';
        }
        break;
      case 'capacity':
        if (!value.trim()) {
          errorMsg = 'Capacity is required.';
        } else if (!patterns.capacity.test(value)) {
          errorMsg = 'Only positive numbers are allowed.';
        }
        break;
      case 'paymentAmount':
        if (!value.toString().trim()) {
          errorMsg = 'Payment Amount is required.';
        } else if (!patterns.paymentAmount.test(value.toString().trim())) {
          errorMsg = 'Invalid payment amount.';
        }
        break;
      default:
        break;
    }

    // Update errors state
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleAccessibleFeaturesChange = (event) => {
    const {
      target: { value },
    } = event;
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
      setSnackbar({ open: true, message: 'Please fill out all required fields.', severity: 'error' });
      return;
    }

    // Final validation before submission
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      setSnackbar({ open: true, message: 'Please fix the errors in the form.', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Location updated successfully!', severity: 'success' });
      fetchLocations(selectedEvent._id);
    } catch (error) {
      console.error('Error updating location:', error);
      setSnackbar({ open: true, message: 'Failed to update location.', severity: 'error' });
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

  // Prevent typing unwanted characters
  const handleKeyPress = (pattern) => (e) => {
    const regex = new RegExp(pattern);
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  // Prevent pasting unwanted characters
  const handlePaste = (pattern) => (e) => {
    const pasteData = e.clipboardData.getData('text');
    const regex = new RegExp(`^${pattern}$`);
    if (!regex.test(pasteData)) {
      e.preventDefault();
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Manage Locations
      </Typography>

      {/* Search Events */}
      <TextField
        label="Search Event"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
      />

      {/* Display Events */}
      {filteredEvents.length > 0 ? (
        <Grid container spacing={2}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} key={event._id}>
              <Box border={1} padding={2} borderRadius={4} borderColor="grey.300">
                <Typography variant="h6">{event.eventName}</Typography>
                <Typography>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEdit(event)}
                  sx={{ mt: 2 }}
                >
                  Edit Location
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No events found.</Typography>
      )}

      {/* Edit Location Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Location for {selectedEvent?.eventName}</DialogTitle>
        <DialogContent>
          {/* Conditionally render form or message based on location availability */}
          {noLocations ? (
            <Typography>No location details available for this event.</Typography>
          ) : (
            // Start of the form
            <form onSubmit={handleSubmit}>
              <TextField
                label="Location Name"
                name="locationName"
                fullWidth
                value={newLocation.locationName}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.locationName)}
                helperText={errors.locationName}
                onKeyPress={handleKeyPress(/[A-Za-z0-9 ]/)}
                onPaste={handlePaste(/[A-Za-z0-9 ]+/)}
              />
              <TextField
                label="Notes"
                name="notes"
                fullWidth
                value={newLocation.notes}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                error={Boolean(errors.notes)}
                helperText={errors.notes}
                onKeyPress={handleKeyPress(/[A-Za-z0-9,.\- ]/)}
                onPaste={handlePaste(/[A-Za-z0-9,.\- ]+/)}
              />
              <TextField
                label="Contact Person"
                name="contactPerson"
                fullWidth
                value={newLocation.contactPerson}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.contactPerson)}
                helperText={errors.contactPerson}
                onKeyPress={handleKeyPress(/[A-Za-z ]/)}
                onPaste={handlePaste(/[A-Za-z ]+/)}
              />
              <TextField
                label="Phone Number"
                name="contactPhone"
                fullWidth
                value={newLocation.contactPhone}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.contactPhone)}
                helperText={errors.contactPhone}
                onKeyPress={handleKeyPress(/[0-9()+\- ]/)}
                onPaste={handlePaste(/[0-9()+\- ]+/)}
              />
              <TextField
                label="Email Address"
                name="contactEmail"
                fullWidth
                value={newLocation.contactEmail}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.contactEmail)}
                helperText={errors.contactEmail}
                type="email"
                onPaste={(e) => {
                  const pasteData = e.clipboardData.getData('text');
                  if (!patterns.contactEmail.test(pasteData)) {
                    e.preventDefault();
                  }
                }}
              />
              <TextField
                label="Capacity"
                name="capacity"
                fullWidth
                value={newLocation.capacity}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.capacity)}
                helperText={errors.capacity}
                type="number"
                inputProps={{ min: 0 }}
                onKeyPress={handleKeyPress(/[0-9]/)}
                onPaste={handlePaste(/[0-9]+/)}
              />
              <TextField
                label="Parking Availability"
                select
                fullWidth
                name="parking"
                value={newLocation.parking}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>

              {/* Accessible Features (Multiple Select with Checkboxes) */}
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
                  renderValue: (selected) => selected.join(', '),
                }}
              >
                {accessibleFeaturesOptions.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    <Checkbox checked={newLocation.accessibleFeatures.indexOf(feature) > -1} />
                    <ListItemText primary={feature} />
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Payment Amount"
                name="paymentAmount"
                fullWidth
                value={newLocation.paymentAmount}
                onChange={handleInputChange}
                margin="normal"
                required
                error={Boolean(errors.paymentAmount)}
                helperText={errors.paymentAmount}
                type="number"
                inputProps={{ min: 0, step: '0.01' }}
                onKeyPress={handleKeyPress(/[0-9.]/)}
                onPaste={handlePaste(/[0-9.]+/)}
              />
              <TextField
                label="Payment Status"
                select
                fullWidth
                name="paymentStatus"
                value={newLocation.paymentStatus}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </TextField>

              {/* Google Map */}
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Select Location on Map
                </Typography>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={latLng}
                  zoom={10}
                  onClick={handleMapClick}
                >
                  <Marker position={latLng} />
                </GoogleMap>
              </Box>

              {/* Submit Button */}
              <DialogActions sx={{ mt: 2 }}>
                <Button onClick={handleClose} color="inherit">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={
                    loading ||
                    !newLocation.locationName ||
                    !newLocation.contactPerson ||
                    !newLocation.contactPhone ||
                    !newLocation.contactEmail ||
                    !newLocation.capacity ||
                    !newLocation.paymentAmount ||
                    Object.values(errors).some((error) => error)
                  }
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Location'}
                </Button>
              </DialogActions>
            </form>
            // End of the form
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageLocation;
