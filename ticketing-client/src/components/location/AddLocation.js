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

// Updated accessible features options relevant to musical event venues
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
    accessibleFeatures: [], // Initialize as an empty array
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
  });
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);

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
      }
    };

    fetchEvents();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationDetails((prev) => ({ ...prev, [name]: value }));
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
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !locationDetails.locationName) {
      alert('Please fill out the required fields.');
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
      alert('Location added successfully!');
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location.');
    } finally {
      setLoading(false);
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
    <Container>
      <Typography variant="h5" gutterBottom>
        Add Location
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Select Event */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Select Event"
              fullWidth
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
              margin="normal"
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>

            {/* Location Name (with Google Places auto-suggest) */}
            <TextField
              label="Location Name"
              name="locationName"
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              margin="normal"
              required
              disabled={!ready}
              helperText="Start typing to search for a location"
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

            {/* Other Location Details */}
            <TextField
              label="Special Notes"
              name="notes"
              fullWidth
              value={locationDetails.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              label="Contact Person"
              name="contactPerson"
              fullWidth
              value={locationDetails.contactPerson}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Phone Number"
              name="contactPhone"
              fullWidth
              value={locationDetails.contactPhone}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Email Address"
              name="contactEmail"
              fullWidth
              value={locationDetails.contactEmail}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Capacity"
              name="capacity"
              fullWidth
              value={locationDetails.capacity}
              onChange={handleInputChange}
              margin="normal"
            />
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
            <TextField
              label="Accessible Features"
              name="accessibleFeatures"
              select
              fullWidth
              margin="normal"
              SelectProps={{
                multiple: true,
                value: locationDetails.accessibleFeatures,
                onChange: handleAccessibleFeaturesChange,
                renderValue: (selected) => selected.join(', '),
              }}
            >
              {accessibleFeaturesOptions.map((feature) => (
                <MenuItem key={feature} value={feature}>
                  <Checkbox
                    checked={locationDetails.accessibleFeatures.indexOf(feature) > -1}
                  />
                  <ListItemText primary={feature} />
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Payment Amount"
              name="paymentAmount"
              fullWidth
              value={locationDetails.paymentAmount}
              onChange={handleInputChange}
              margin="normal"
            />
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Location'}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default AddLocation;
