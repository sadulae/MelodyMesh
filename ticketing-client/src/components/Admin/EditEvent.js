// src/components/Admin/EditEvent.js

import React, { useState, useEffect } from 'react';
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

// Import the centralized API instance
import api from '../../utils/api';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // State variables
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLocationError, setEventLocationError] = useState('');
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

  const today = new Date();
  const maxDate = addYears(today, 5);

  useEffect(() => {
    // Fetch the event details to populate the form
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/admin/events/${eventId}`); // Use the centralized API
        const event = response.data;
        setTitle(event.title);
        setDescription(event.description);
        setDate(new Date(event.date));
        setEventLocation(event.location);
        setTiers(
          event.tiers.map((tier) => ({
            name: tier.name,
            price: tier.price,
            benefits: tier.benefits,
            quantity: tier.quantity,
          }))
        );
        console.log(event.posterUrl);
        setPosterPreview(event.posterUrl); // Assuming backend provides a URL for the current poster
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

  const handleAddTier = () => {
    setTiers([...tiers, { name: '', price: '', benefits: '', quantity: '' }]);
  };

  const handleRemoveTier = (index) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

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

  const validateForm = () => {
    let valid = true;

    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    } else {
      setTitleError('');
    }

    if (!description.trim()) {
      setDescriptionError('Description is required');
      valid = false;
    } else {
      setDescriptionError('');
    }

    if (!date) {
      setDateError('Date and time are required');
      valid = false;
    } else {
      setDateError('');
    }

    if (!eventLocation.trim()) {
      setEventLocationError('Location is required');
      valid = false;
    } else {
      setEventLocationError('');
    }

    // Tiers validation
    if (tiers.length === 0) {
      setTiersError('At least one tier is required');
      valid = false;
    } else {
      const tiersValid = tiers.every((tier) => {
        return (
          tier.name.trim() &&
          tier.price.toString().trim() &&
          tier.benefits.trim() &&
          tier.quantity.toString().trim() &&
          parseInt(tier.quantity) > 0
        );
      });

      if (!tiersValid) {
        setTiersError('All tier fields are required and quantity must be greater than 0');
        valid = false;
      } else {
        setTiersError('');
      }
    }

    return valid;
  };

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
    if (poster) {
      formData.append('poster', poster);
    }
    formData.append('tiers', JSON.stringify(tiers));

    try {
      setIsSubmitting(true); // Start loading
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
      // Extract error message from backend response if available
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to update event';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false); // End loading
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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
                onChange={(e) => setTitle(e.target.value)}
                error={!!titleError}
                helperText={titleError}
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
                onChange={(e) => setDescription(e.target.value)}
                error={!!descriptionError}
                helperText={descriptionError}
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
            {/* Location */}
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Location"
                placeholder="Enter the event location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                error={!!eventLocationError}
                helperText={eventLocationError}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
          </Grid>

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
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        {poster ? 'Change Poster' : 'Upload Poster'}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handlePosterChange}
        />
      </Button>
    </Grid>
    <Grid item xs>
      {/* If a new poster is uploaded, show its name */}
      {poster ? (
        <Typography variant="body2" mt={1}>
          Selected file: {poster.name}
        </Typography>
      ) : (
        // Otherwise, show a message indicating the current poster will be used
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

  {/* Show the preview and delete button only if a new poster is uploaded */}
  {poster && (
    <Box mt={2} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
      <img
        src={URL.createObjectURL(poster)} // Preview the uploaded poster
        alt="Poster Preview"
        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
      />
      <Button
        variant="outlined"
        color="error"
        onClick={() => {
          setPoster(null); // Remove the poster
          setPosterPreview(null); // Clear the preview
        }}
        sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
      >
        Delete Poster
      </Button>
    </Box>
  )}
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
              <Box key={index} mt={2} p={2} border={1} borderRadius={3} borderColor="grey.300">
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
                      onChange={(e) => handleTierChange(index, 'name', e.target.value)}
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
                      label="Price ($)"
                      placeholder="e.g., 99.99"
                      type="number"
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }}
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
                      inputProps={{ min: 1 }}
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
                      onChange={(e) => handleTierChange(index, 'benefits', e.target.value)}
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
              disabled={isSubmitting}
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
