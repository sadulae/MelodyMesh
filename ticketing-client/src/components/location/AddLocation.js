// src/components/Admin/AddLocation.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Typography,
  Container,
  Box,
  CircularProgress,
  Grid,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
} from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import axios from 'axios';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 };
const circleOptions = {
  strokeColor: '#ff5722',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#ff5722',
  fillOpacity: 0.35,
};

// Accessible features options relevant to musical event venues
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

const AddLocation = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [locationDetails, setLocationDetails] = useState({
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
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reference to the map instance
  const mapRef = useRef();

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Re-center the map when mapCenter changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(mapCenter);
    }
  }, [mapCenter]);

  // Auto-suggestion for location using Google Places
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => defaultCenter.lat, lng: () => defaultCenter.lng },
      radius: 200 * 1000, // 200 km radius
    },
  });

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/admin/organizer-events',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setSnackbar({ open: true, message: 'Failed to fetch events.', severity: 'error' });
      }
    };

    fetchEvents();
  }, []);

  // Regex Patterns
  const patterns = {
    locationName: /^[A-Za-z0-9+, ]*$/,
    notes: /^[A-Za-z0-9,.\- ]*$/,
    contactPerson: /^[A-Za-z ]*$/,
    contactPhone: /^[0-9()+\- ]*$/,
    contactEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    capacity: /^\d+$/,
    paymentAmount: /^\d+(\.\d{1,2})?$/,
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update locationDetails state
    setLocationDetails((prev) => ({ ...prev, [name]: value }));

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
        if (!value.trim()) {
          errorMsg = 'Payment Amount is required.';
        } else if (!patterns.paymentAmount.test(value)) {
          errorMsg = 'Invalid payment amount.';
        }
        break;
      default:
        break;
    }

    // Update errors state
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Handle Accessible Features change
  const handleAccessibleFeaturesChange = (event) => {
    const {
      target: { value },
    } = event;
    setLocationDetails((prev) => ({
      ...prev,
      accessibleFeatures: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Handle location selection from auto-suggest dropdown
  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setLocationDetails((prev) => ({
        ...prev,
        locationName: description,
        lat,
        lng,
      }));
      setMapCenter({ lat, lng }); // Move map to the selected location
    } catch (error) {
      console.error('Error selecting location:', error);
      setSnackbar({ open: true, message: 'Failed to select location.', severity: 'error' });
    }
  };

  // Handle map click to get lat/lng and update location name
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      const results = await getGeocode({ location: { lat, lng } });
      if (results && results.length > 0) {
        const address = results[0].formatted_address;
        setValue(address, false);
        setLocationDetails((prev) => ({
          ...prev,
          locationName: address,
          lat,
          lng,
        }));
      } else {
        setLocationDetails((prev) => ({ ...prev, lat, lng }));
      }
      setMapCenter({ lat, lng });
    } catch (error) {
      console.error('Error getting address from lat/lng:', error);
      setLocationDetails((prev) => ({ ...prev, lat, lng }));
      setMapCenter({ lat, lng });
      setSnackbar({ open: true, message: 'Failed to get address from location.', severity: 'error' });
    }
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate Location Name
    if (!locationDetails.locationName.trim()) {
      newErrors.locationName = 'Location Name is required.';
    } else if (!patterns.locationName.test(locationDetails.locationName)) {
      newErrors.locationName = 'Only letters and numbers are allowed.';
    }

    // Validate Special Notes
    if (locationDetails.notes && !patterns.notes.test(locationDetails.notes)) {
      newErrors.notes = 'Only letters, numbers, commas, hyphens, and periods are allowed.';
    }

    // Validate Contact Person
    if (!locationDetails.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact Person is required.';
    } else if (!patterns.contactPerson.test(locationDetails.contactPerson)) {
      newErrors.contactPerson = 'Only letters and spaces are allowed.';
    }

    // Validate Contact Phone
    if (!locationDetails.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact Phone is required.';
    } else if (!patterns.contactPhone.test(locationDetails.contactPhone)) {
      newErrors.contactPhone = 'Only numbers and allowed symbols (+, -, (, )) are allowed.';
    }

    // Validate Contact Email
    if (!locationDetails.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact Email is required.';
    } else if (!patterns.contactEmail.test(locationDetails.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format.';
    }

    // Validate Capacity
    if (!locationDetails.capacity.trim()) {
      newErrors.capacity = 'Capacity is required.';
    } else if (!patterns.capacity.test(locationDetails.capacity)) {
      newErrors.capacity = 'Only positive numbers are allowed.';
    }

    // Validate Payment Amount
    if (!locationDetails.paymentAmount.toString().trim()) {
      newErrors.paymentAmount = 'Payment Amount is required.';
    } else if (!patterns.paymentAmount.test(locationDetails.paymentAmount.toString().trim())) {
      newErrors.paymentAmount = 'Invalid payment amount.';
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fix the errors in the form.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/new-locations', // Use the new endpoint
        {
          ...locationDetails,
          eventID: selectedEvent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({ open: true, message: 'Location added successfully!', severity: 'success' });
      // Optionally, reset the form
      setLocationDetails({
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
      setSelectedEvent('');
    } catch (error) {
      console.error('Error adding location:', error);
      setSnackbar({ open: true, message: 'Failed to add location.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Prevent typing unwanted characters and handle paste
  const handleKeyPress = (pattern) => (e) => {
    const regex = new RegExp(pattern);
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (pattern) => (e) => {
    const pasteData = e.clipboardData.getData('text');
    const regex = new RegExp(pattern);
    if (!regex.test(pasteData)) {
      e.preventDefault();
    }
  };

  // Render the map
  const renderMap = () => (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={10}
      center={mapCenter}
      onClick={handleMapClick}
      onLoad={onMapLoad}
    >
      <Marker position={mapCenter} />
      <Circle
        center={mapCenter}
        radius={500} // 500 meters radius
        options={circleOptions}
      />
    </GoogleMap>
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Add Location
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Event Selection and Location Details */}
          <Grid item xs={12} md={6}>
            {/* Select Event */}
            <TextField
              select
              label="Select Event"
              fullWidth
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
              margin="normal"
              error={Boolean(errors.selectedEvent)}
              helperText={errors.selectedEvent}
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>

            {/* Location Name with Restrictions */}
            <TextField
              label="Location Name"
              name="locationName"
              fullWidth
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                handleInputChange(e);
              }}
              margin="normal"
              required
              disabled={!ready}
              error={Boolean(errors.locationName)}
              helperText={errors.locationName}
              onKeyPress={handleKeyPress(/^[A-Za-z0-9 ]$/)}
              onPaste={handlePaste(/^[A-Za-z0-9 ]+$/)}
            />

            {/* Suggestions from Google Places */}
            {status === 'OK' && (
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 1000,
                  backgroundColor: '#fff',
                  borderRadius: 1,
                  boxShadow: 3,
                  maxHeight: 200,
                  overflowY: 'auto',
                  width: '100%',
                  mt: 1,
                }}
              >
                {data.map(({ place_id, description }) => (
                  <Box
                    key={place_id}
                    sx={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'grey.200' },
                    }}
                    onClick={() => handleSelect(description)}
                  >
                    {description}
                  </Box>
                ))}
              </Box>
            )}

            {/* Special Notes with Restrictions */}
            <TextField
              label="Special Notes"
              name="notes"
              fullWidth
              value={locationDetails.notes}
              onChange={handleInputChange}
              margin="normal"
              error={Boolean(errors.notes)}
              helperText={errors.notes}
              onKeyPress={handleKeyPress(/^[A-Za-z0-9,.\- ]$/)}
              onPaste={handlePaste(/^[A-Za-z0-9,.\- ]+$/)}
              multiline
              rows={3}
            />

            {/* Contact Person with Restrictions */}
            <TextField
              label="Contact Person"
              name="contactPerson"
              fullWidth
              value={locationDetails.contactPerson}
              onChange={handleInputChange}
              margin="normal"
              required
              error={Boolean(errors.contactPerson)}
              helperText={errors.contactPerson}
              onKeyPress={handleKeyPress(/^[A-Za-z ]$/)}
              onPaste={handlePaste(/^[A-Za-z ]+$/)}
            />

            {/* Contact Phone with Restrictions */}
            <TextField
              label="Contact Phone"
              name="contactPhone"
              fullWidth
              value={locationDetails.contactPhone}
              onChange={handleInputChange}
              margin="normal"
              required
              error={Boolean(errors.contactPhone)}
              helperText={errors.contactPhone}
              onKeyPress={handleKeyPress(/^[0-9()+\- ]$/)}
              onPaste={handlePaste(/^[0-9()+\- ]+$/)}
            />

            {/* Contact Email */}
            <TextField
              label="Contact Email"
              name="contactEmail"
              fullWidth
              value={locationDetails.contactEmail}
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

            {/* Capacity */}
            <TextField
              label="Capacity"
              name="capacity"
              fullWidth
              value={locationDetails.capacity}
              onChange={handleInputChange}
              margin="normal"
              required
              error={Boolean(errors.capacity)}
              helperText={errors.capacity}
              onKeyPress={handleKeyPress(/^[0-9]$/)}
              onPaste={handlePaste(/^[0-9]+$/)}
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
            />

            {/* Parking Availability */}
            <TextField
              label="Parking Availability"
              select
              fullWidth
              name="parking"
              value={locationDetails.parking}
              onChange={handleInputChange}
              margin="normal"
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>

            {/* Accessible Features (Multiple Select with Checkboxes) */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="accessible-features-label">Accessible Features</InputLabel>
              <Select
                labelId="accessible-features-label"
                label="Accessible Features"
                multiple
                value={locationDetails.accessibleFeatures}
                onChange={handleAccessibleFeaturesChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {accessibleFeaturesOptions.map((feature) => (
                  <MenuItem key={feature} value={feature}>
                    <Checkbox checked={locationDetails.accessibleFeatures.indexOf(feature) > -1} />
                    <ListItemText primary={feature} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Payment Amount */}
            <TextField
              label="Payment Amount"
              name="paymentAmount"
              fullWidth
              value={locationDetails.paymentAmount}
              onChange={handleInputChange}
              margin="normal"
              required
              error={Boolean(errors.paymentAmount)}
              helperText={errors.paymentAmount}
              type="number"
              InputProps={{ inputProps: { min: 0, step: '0.01' } }}
              onKeyPress={handleKeyPress(/^[0-9.]$/)}
              onPaste={handlePaste(/^[0-9.]+$/)}
            />

            {/* Payment Status */}
            <TextField
              label="Payment Status"
              select
              fullWidth
              name="paymentStatus"
              value={locationDetails.paymentStatus}
              onChange={handleInputChange}
              margin="normal"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </TextField>
          </Grid>

          {/* Google Map */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Location on Map
              </Typography>
              {renderMap()}
            </Box>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              loading ||
              !selectedEvent ||
              !locationDetails.locationName ||
              !locationDetails.contactPerson ||
              !locationDetails.contactPhone ||
              !locationDetails.contactEmail ||
              !locationDetails.capacity ||
              !locationDetails.paymentAmount ||
              Object.values(errors).some((error) => error)
            }
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Add Location'}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
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

export default AddLocation;
