// src/components/Admin/EditEvent.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Box,
  CircularProgress,
} from '@mui/material';
import addYears from 'date-fns/addYears';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import api from '../../utils/api';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Define libraries for Google Maps
const libraries = ['places'];

// Styles for the map container
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default location (Colombo, Sri Lanka)
const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612,
};

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // State variables
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLocationError, setEventLocationError] = useState('');
  const [latLng, setLatLng] = useState(defaultCenter);
  const [tiers, setTiers] = useState([]);
  const [tiersError, setTiersError] = useState('');
  const [poster, setPoster] = useState(null);
  const [posterError, setPosterError] = useState('');
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const mapRef = useRef(); // Reference for the map

  // Date-related logic
  const today = new Date();
  const maxDate = addYears(today, 5);

  // Regular Expressions for Validations
  const titlePattern = /^[A-Za-z0-9- ]+$/;
  const descriptionPattern = /^[A-Za-z0-9- ]+$/;
  const locationPattern = /^[A-Za-z0-9 ,.-]+$/;
  const tierNamePattern = /^[A-Za-z0-9- ]+$/;
  const benefitsPattern = /^[A-Za-z0-9- ]+$/;

  // Reverse geocode to convert lat/lng to an address
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const results = await getGeocode({ location: { lat, lng } });
      if (results.length > 0) {
        const address = results[0].formatted_address;
        setEventLocation(address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  }, []);

  // Handle map click to select a location
  const handleMapClick = useCallback(
    (event) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();
      setLatLng({
        lat: clickedLat,
        lng: clickedLng,
      });

      // Optionally reverse geocode the selected coordinates
      reverseGeocode(clickedLat, clickedLng);
    },
    [reverseGeocode]
  );

  // Handle place selection using Places Autocomplete
  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => defaultCenter.lat, lng: () => defaultCenter.lng },
      radius: 200 * 1000, // 200 km radius
    },
    debounce: 300,
  });

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      setLatLng({ lat, lng });
      setEventLocation(description);
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Handle typing in the location input
  const handleLocationInputChange = (e) => {
    setEventLocation(e.target.value);
    setValue(e.target.value);
  };

  useEffect(() => {
    // Fetch the event details to populate the form
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/admin/events/${eventId}`);
        const event = response.data;
        setTitle(event.title);
        setDescription(event.description);
        setDate(new Date(event.date));
        setEventLocation(event.location);
        // Assuming backend provides lat and lng; if not, handle accordingly
        setLatLng({ lat: event.lat || defaultCenter.lat, lng: event.lng || defaultCenter.lng });
        setTiers(
          event.tiers.map((tier) => ({
            name: tier.name,
            price: tier.price,
            benefits: tier.benefits,
            quantity: tier.quantity,
          }))
        );
        setPosterPreview(event.posterUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setSnackbarMessage('Failed to load event details');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  // Input Filtering Functions
  const handleTitleChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^A-Za-z0-9- ]/g, '');
    setTitle(sanitizedValue);
    if (!titlePattern.test(sanitizedValue) && sanitizedValue !== '') {
      setTitleError('Only letters, numbers, spaces, and hyphens are allowed');
    } else {
      setTitleError('');
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^A-Za-z0-9- ]/g, '');
    setDescription(sanitizedValue);
    if (!descriptionPattern.test(sanitizedValue) && sanitizedValue !== '') {
      setDescriptionError('Only letters, numbers, spaces, and hyphens are allowed');
    } else {
      setDescriptionError('');
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^A-Za-z0-9 ,.-]/g, '');
    setEventLocation(sanitizedValue);
    if (!locationPattern.test(sanitizedValue) && sanitizedValue !== '') {
      setEventLocationError(
        'Only letters, numbers, spaces, commas, periods, and hyphens are allowed'
      );
    } else {
      setEventLocationError('');
    }
  };

  const handleTierNameChange = (index, value) => {
    const sanitizedValue = value.replace(/[^A-Za-z0-9- ]/g, '');
    handleTierChange(index, 'name', sanitizedValue);
  };

  const handleBenefitsChange = (index, value) => {
    const sanitizedValue = value.replace(/[^A-Za-z0-9- ]/g, '');
    handleTierChange(index, 'benefits', sanitizedValue);
  };

  // Add a new ticket tier
  const handleAddTier = () => {
    setTiers([...tiers, { name: '', price: '', benefits: '', quantity: '' }]);
  };

  // Remove an existing ticket tier
  const handleRemoveTier = (index) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
  };

  // Handle changes in the ticket tier fields
  const handleTierChange = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  // Handle the file upload for the event poster
  const handlePosterChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPoster(file);
      // Generate a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate the form before submission
  const validateForm = () => {
    let valid = true;

    // Title Validation
    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    } else if (!titlePattern.test(title.trim())) {
      setTitleError('Title can only contain letters, numbers, spaces, and hyphens');
      valid = false;
    } else {
      setTitleError('');
    }

    // Description Validation
    if (!description.trim()) {
      setDescriptionError('Description is required');
      valid = false;
    } else if (!descriptionPattern.test(description.trim())) {
      setDescriptionError('Description can only contain letters, numbers, spaces, and hyphens');
      valid = false;
    } else {
      setDescriptionError('');
    }

    // Date Validation
    if (!date) {
      setDateError('Date and time are required');
      valid = false;
    } else if (date < today) {
      setDateError('Date and time cannot be in the past');
      valid = false;
    } else {
      setDateError('');
    }

    // Location Validation
    if (!eventLocation.trim()) {
      setEventLocationError('Location is required');
      valid = false;
    } else if (!locationPattern.test(eventLocation.trim())) {
      setEventLocationError(
        'Location can only contain letters, numbers, spaces, commas, periods, and hyphens'
      );
      valid = false;
    } else {
      setEventLocationError('');
    }

    // Tiers Validation
    if (tiers.length === 0) {
      setTiersError('At least one tier is required');
      valid = false;
    } else {
      let tierValid = true;
      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        if (
          !tier.name.trim() ||
          !tier.price.toString().trim() ||
          !tier.benefits.trim() ||
          !tier.quantity.toString().trim()
        ) {
          tierValid = false;
          setTiersError('All tier fields are required');
          break;
        }
        if (!tierNamePattern.test(tier.name.trim())) {
          tierValid = false;
          setTiersError('Tier names can only contain letters, numbers, spaces, and hyphens');
          break;
        }
        if (isNaN(tier.price) || Number(tier.price) < 0) {
          tierValid = false;
          setTiersError('Price must be a positive number');
          break;
        }
        if (!benefitsPattern.test(tier.benefits.trim())) {
          tierValid = false;
          setTiersError('Benefits can only contain letters, numbers, spaces, and hyphens');
          break;
        }
        if (!Number.isInteger(Number(tier.quantity)) || Number(tier.quantity) <= 0) {
          tierValid = false;
          setTiersError('Quantity must be a positive integer');
          break;
        }
      }

      if (tierValid) {
        setTiersError('');
      } else {
        valid = false;
      }
    }

    return valid;
  };

  // Submit the form data to the backend
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      setSnackbarMessage('Please fix the errors in the form.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date.toISOString());
    formData.append('location', eventLocation);
    formData.append('lat', latLng.lat);
    formData.append('lng', latLng.lng);
    if (poster) {
      formData.append('poster', poster);
    }
    formData.append('tiers', JSON.stringify(tiers));

    try {
      setIsSubmitting(true);
      await api.put(`/admin/events/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbarMessage('Event updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Redirect back to manage events after a short delay
      setTimeout(() => {
        navigate('/admin/events');
      }, 2000);
    } catch (error) {
      console.error(
        'Error updating event:',
        error.response ? error.response.data : error.message
      );
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to update event';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Compute if the form is complete
  const isFormComplete =
    title.trim() !== '' &&
    description.trim() !== '' &&
    date !== null &&
    eventLocation.trim() !== '' &&
    tiers.length > 0 &&
    tiers.every(
      (tier) =>
        tier.name.trim() !== '' &&
        tier.price.toString().trim() !== '' &&
        tier.benefits.trim() !== '' &&
        tier.quantity.toString().trim() !== '' &&
        parseInt(tier.quantity) > 0
    );

  // Function to generate PDF with the requested changes
  const generatePdf = () => {
    const content = [];

    // Header with MelodyMesh and contact info
    content.push({
      columns: [
        {
          text: 'MelodyMesh',
          color: '#007BFF', // Blue color
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 0],
        },
        {
          text: [
            { text: 'Email: ', bold: true },
            'melodymeshevents@gmail.com\n',
            { text: 'Date of Issue: ', bold: true },
            new Date().toLocaleDateString(),
          ],
          alignment: 'right',
          margin: [0, 5, 0, 0],
        },
      ],
      margin: [0, 0, 0, 20],
    });

    // Divider line
    content.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 1,
          lineColor: '#CED4DA',
        },
      ],
      margin: [0, 10, 0, 10],
    });

    // Event title
    content.push({
      text: title,
      style: 'eventTitle',
      margin: [0, 10, 0, 5],
    });

    // Event details
    content.push({
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'Description', style: 'tableHeader' },
            { text: description },
          ],
          [
            { text: 'Location', style: 'tableHeader' },
            { text: eventLocation },
          ],
          [
            { text: 'Date & Time', style: 'tableHeader' },
            { text: date ? date.toLocaleString() : '' },
          ],
          [
            { text: 'Latitude', style: 'tableHeader' },
            { text: latLng.lat.toString() },
          ],
          [
            { text: 'Longitude', style: 'tableHeader' },
            { text: latLng.lng.toString() },
          ],
          // Add more rows as needed
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 10],
    });

    // Tiers table
    const tierTableBody = [
      [
        { text: 'Tier Name', style: 'tableHeader' },
        { text: 'Price (Rs.)', style: 'tableHeader' },
        { text: 'Benefits', style: 'tableHeader' },
        { text: 'Quantity', style: 'tableHeader' },
      ],
    ];

    tiers.forEach((tier) => {
      tierTableBody.push([
        tier.name,
        `Rs. ${Number(tier.price).toFixed(2)}`,
        tier.benefits,
        tier.quantity.toString(),
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: ['*', 'auto', '*', 'auto'],
        body: tierTableBody,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 15],
    });

    const docDefinition = {
      content,
      styles: {
        eventTitle: {
          fontSize: 16,
          bold: true,
          color: '#343A40',
        },
        tableHeader: {
          bold: true,
          fillColor: '#E9ECEF',
          color: '#495057',
          alignment: 'left',
          margin: [0, 5, 0, 5],
        },
        defaultStyle: {
          fontSize: 12,
          color: '#212529',
        },
      },
      defaultStyle: {
        fontSize: 11,
        color: '#212529',
      },
      pageMargins: [40, 60, 40, 60],
      footer: (currentPage, pageCount) => ({
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        margin: [0, 0, 0, 10],
      }),
    };

    pdfMake.createPdf(docDefinition).download(`${title}_details.pdf`);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom align="center">
        Edit Event
      </Typography>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {/* Event Details */}
          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Title"
                placeholder="Enter the event title"
                value={title}
                onChange={handleTitleChange}
                error={!!titleError}
                helperText={titleError || 'Only letters, numbers, spaces, and hyphens are allowed'}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                placeholder="Enter a detailed description of the event"
                value={description}
                onChange={handleDescriptionChange}
                error={!!descriptionError}
                helperText={
                  descriptionError || 'Only letters, numbers, spaces, and hyphens are allowed'
                }
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
            {/* Date with Time Picker */}
            <Grid item xs={12} sm={6}>
              <ReactDatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="yyyy/MM/dd h:mm aa"
                minDate={today}
                maxDate={maxDate}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                customInput={
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Event Date and Time"
                    error={!!dateError}
                    helperText={dateError}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                }
              />
            </Grid>
            {/* Location Search */}
            <Grid item xs={12} sm={6} sx={{ position: 'relative' }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Search Location"
                value={eventLocation}
                onChange={handleLocationChange}
                disabled={!ready}
                error={!!eventLocationError}
                helperText={
                  eventLocationError ||
                  'Only letters, numbers, spaces, commas, periods, and hyphens are allowed. Start typing to search for a location'
                }
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
              {/* Suggestion Dropdown */}
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
            </Grid>
          </Grid>

          {/* Google Map */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Select Location on Map
            </Typography>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={10}
              center={latLng}
              onClick={handleMapClick}
              onLoad={(map) => (mapRef.current = map)}
            >
              <Marker position={latLng} />
            </GoogleMap>
          </Box>

          {/* Event Poster */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Event Poster
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: posterError ? 'error.main' : 'primary.main',
                  }}
                >
                  {poster ? 'Change Poster' : 'Upload Poster'}
                  <input type="file" accept="image/*" hidden onChange={handlePosterChange} />
                </Button>
              </Grid>
              <Grid item xs>
                {poster ? (
                  <Typography variant="body2" mt={1}>
                    Selected file: {poster.name}
                  </Typography>
                ) : (
                  <Typography variant="body2" mt={1}>
                    Current poster will be used if no new one is uploaded.
                  </Typography>
                )}
                {posterError && (
                  <Typography variant="body2" color="error">
                    {posterError}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Ticket Tiers */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Ticket Tiers
            </Typography>
            {tiersError && (
              <Typography variant="body2" color="error" gutterBottom>
                {tiersError}
              </Typography>
            )}
            {tiers.map((tier, index) => (
              <Box
                key={index}
                mt={2}
                p={2}
                border={1}
                borderRadius={3}
                borderColor="grey.300"
                sx={{ backgroundColor: 'grey.50' }}
              >
                <Grid container spacing={2} alignItems="flex-end">
                  {/* Tier Name */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Tier Name"
                      placeholder="e.g., VIP"
                      value={tier.name}
                      onChange={(e) => handleTierNameChange(index, e.target.value)}
                      error={
                        tiersError.includes('Tier names can') ||
                        tiersError.includes('All tier fields are required')
                      }
                      helperText={
                        tiersError.includes('Tier names can') ||
                        tiersError.includes('All tier fields are required')
                          ? 'Only letters, numbers, spaces, and hyphens are allowed'
                          : ''
                      }
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />
                  </Grid>
                  {/* Price */}
                  <Grid item xs={12} sm={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Price (Rs.)"
                      placeholder="e.g., 999.99"
                      type="number"
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }}
                      error={
                        tiersError.includes('Price must be') ||
                        tiersError.includes('All tier fields are required')
                      }
                      helperText={
                        tiersError.includes('Price must be') ||
                        tiersError.includes('All tier fields are required')
                          ? 'Enter a valid positive number'
                          : ''
                      }
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />
                  </Grid>
                  {/* Quantity */}
                  <Grid item xs={12} sm={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Quantity"
                      placeholder="e.g., 100"
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => handleTierChange(index, 'quantity', e.target.value)}
                      inputProps={{ min: 1, step: '1' }}
                      error={
                        tiersError.includes('Quantity must be') ||
                        tiersError.includes('All tier fields are required')
                      }
                      helperText={
                        tiersError.includes('Quantity must be') ||
                        tiersError.includes('All tier fields are required')
                          ? 'Enter a valid positive integer'
                          : ''
                      }
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />
                  </Grid>
                  {/* Benefits */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Benefits"
                      placeholder="e.g., Backstage access"
                      value={tier.benefits}
                      onChange={(e) => handleBenefitsChange(index, e.target.value)}
                      error={
                        tiersError.includes('Benefits can') ||
                        tiersError.includes('All tier fields are required')
                      }
                      helperText={
                        tiersError.includes('Benefits can') ||
                        tiersError.includes('All tier fields are required')
                          ? 'Only letters, numbers, spaces, and hyphens are allowed'
                          : ''
                      }
                      InputProps={{
                        sx: { borderRadius: 2 },
                      }}
                    />
                  </Grid>
                  {/* Remove Button */}
                  <Grid item xs={12} sm={1}>
                    {tiers.length > 1 && (
                      <Tooltip title="Remove Tier">
                        <IconButton onClick={() => handleRemoveTier(index)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Box mt={2}>
              <Button
                onClick={handleAddTier}
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Add Another Tier
              </Button>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box mt={4} position="relative">
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={!isFormComplete || isSubmitting}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Update Event
            </Button>
            {isSubmitting && (
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
        </form>

        {/* PDF Generation Button */}
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={generatePdf}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Download Event Details as PDF
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditEvent;
