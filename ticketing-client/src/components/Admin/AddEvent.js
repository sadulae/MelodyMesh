// src/components/Admin/AdminPage.js

import React, { useState } from 'react';
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
} from '@mui/material';
// Remove direct Axios import
// import axios from 'axios';
import addYears from 'date-fns/addYears';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

// Import the centralized API instance
import api from '../../utils/api';

const AdminPage = () => {
  const navigate = useNavigate();

  // State variables
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState('');
  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [tiers, setTiers] = useState([{ name: '', price: '', benefits: '', quantity: '' }]);
  const [tiersError, setTiersError] = useState('');
  const [poster, setPoster] = useState(null);
  const [posterError, setPosterError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const today = new Date();
  const maxDate = addYears(today, 5);

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
    setPoster(event.target.files[0]);
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
      setDateError('Date is required');
      valid = false;
    } else {
      setDateError('');
    }

    if (!location.trim()) {
      setLocationError('Location is required');
      valid = false;
    } else {
      setLocationError('');
    }

    if (!poster) {
      setPosterError('Poster is required');
      valid = false;
    } else {
      setPosterError('');
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
    formData.append('location', location);
    formData.append('poster', poster);
    formData.append('tiers', JSON.stringify(tiers));

    try {
      // Use the centralized API instance
      await api.post('/admin/add-event', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbarMessage('Event added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Clear the form
      setTitle('');
      setDescription('');
      setDate(null);
      setLocation('');
      setPoster(null);
      setTiers([{ name: '', price: '', benefits: '', quantity: '' }]);
      // Redirect back to manage events after a short delay
      setTimeout(() => {
        navigate('/admin/events');
      }, 2000);
    } catch (error) {
      console.error('Error adding event:', error.response ? error.response.data : error.message);
      // Extract error message from backend response if available
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to add event';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Add New Event
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          {/* Event Details */}
          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>
          <Grid container spacing={2}>
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
              />
            </Grid>
            {/* Date */}
            <Grid item xs={12} sm={6}>
              <ReactDatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="yyyy/MM/dd"
                minDate={today}
                maxDate={maxDate}
                customInput={
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Event Date"
                    error={!!dateError}
                    helperText={dateError}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={!!locationError}
                helperText={locationError}
              />
            </Grid>
          </Grid>

          {/* Event Poster */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Event Poster
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ textTransform: 'none' }}
            >
              {poster ? 'Change Poster' : 'Upload Poster'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handlePosterChange}
              />
            </Button>
            {poster && (
              <Typography variant="body2" mt={1}>
                Selected file: {poster.name}
              </Typography>
            )}
            {posterError && (
              <Typography variant="body2" color="error">
                {posterError}
              </Typography>
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
              <Box key={index} mt={2} p={2} border={1} borderRadius={2} borderColor="grey.300">
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
                    />
                  </Grid>
                  {/* Price */}
                  <Grid item xs={12} sm={2}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      label="Price"
                      placeholder="e.g., 99.99"
                      type="number"
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                      inputProps={{ min: 0, step: '0.01' }}
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
                sx={{ textTransform: 'none' }}
              >
                Add Another Tier
              </Button>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box mt={4}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none' }}
            >
              Add Event
            </Button>
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage;
