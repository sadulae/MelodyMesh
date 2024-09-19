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
} from '@mui/material';
import axios from 'axios';
import addYears from 'date-fns/addYears';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteIcon from '@mui/icons-material/Delete';


const AdminPage = () => {
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
    const newTiers = tiers.slice();
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
    tiers.forEach((tier) => {
      if (
        !tier.name.trim() ||
        !tier.price.trim() ||
        !tier.benefits.trim() ||
        !tier.quantity.toString().trim()
      ) {
        setTiersError('All tier fields are required');
        valid = false;
      } else if (parseInt(tier.quantity) <= 0) {
        setTiersError('Quantity must be greater than 0');
        valid = false;
      } else {
        setTiersError('');
      }
    });
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
    formData.append('date', date.toISOString().slice(0, 10));
    formData.append('location', location);
    formData.append('poster', poster);
    formData.append('tiers', JSON.stringify(tiers));

    try {
      await axios.post('http://localhost:5000/api/admin/add-event', formData, {
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
    } catch (error) {
      console.error('Error adding event:', error.response ? error.response.data : error.message);
      setSnackbarMessage('Failed to add event');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '20px',
        paddingBottom: '20px',
      }}
    >
      <Typography variant="h4" color="primary" style={{ marginBottom: '30px' }}>
        Add New Event
      </Typography>
      <Paper
        elevation={3}
        style={{ padding: '30px', borderRadius: '15px', width: '100%' }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Event Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" align="left" color="textPrimary">
                Event Details
              </Typography>
            </Grid>
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
                  style: { borderRadius: '10px' },
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
                  style: { borderRadius: '10px' },
                }}
              />
            </Grid>
            {/* Event Date and Location */}
            <Grid item xs={12} sm={6}>
              <ReactDatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="yyyy/MM/dd"
                minDate={today}
                maxDate={maxDate}
                placeholderText="Select the event date"
                customInput={
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Event Date"
                    error={!!dateError}
                    helperText={dateError}
                    InputProps={{
                      style: { borderRadius: '10px' },
                      readOnly: true,
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={!!locationError}
                helperText={locationError}
                InputProps={{
                  style: { borderRadius: '10px' },
                }}
              />
            </Grid>
            {/* Poster Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" align="left" color="textPrimary">
                Event Poster
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                style={{
                  borderRadius: '10px',
                  padding: '10px',
                  textTransform: 'none',
                }}
              >
                Upload Poster
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePosterChange}
                />
              </Button>
              {poster && (
                <Typography variant="body2" align="left" style={{ marginTop: '5px' }}>
                  Selected file: {poster.name}
                </Typography>
              )}
              {posterError && (
                <Typography variant="body2" color="error" align="left">
                  {posterError}
                </Typography>
              )}
            </Grid>
            {/* Ticket Tiers Section */}
            <Grid item xs={12}>
              <Typography variant="h6" align="left" color="textPrimary">
                Ticket Tiers
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                align="left"
                style={{ marginTop: '5px' }}
              >
                Add different ticket tiers with their prices, quantities, and benefits.
              </Typography>
            </Grid>
            {tiers.map((tier, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
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
                      style: { borderRadius: '10px' },
                    }}
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
                    InputProps={{
                      style: { borderRadius: '10px' },
                      inputProps: { min: 0, step: '0.01' },
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
                    InputProps={{
                      style: { borderRadius: '10px' },
                      inputProps: { min: 1 },
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
                      style: { borderRadius: '10px' },
                    }}
                  />
                </Grid>
                {/* Remove Tier Button */}
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
            ))}
            {tiersError && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error" align="left">
                  {tiersError}
                </Typography>
              </Grid>
            )}
            {/* Add Another Tier Button */}
            <Grid item xs={12}>
              <Button
                onClick={handleAddTier}
                fullWidth
                variant="outlined"
                color="primary"
                style={{ borderRadius: '10px' }}
              >
                Add Another Tier
              </Button>
            </Grid>
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                style={{
                  borderRadius: '10px',
                  padding: '15px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                }}
              >
                Add Event
              </Button>
            </Grid>
          </Grid>
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
