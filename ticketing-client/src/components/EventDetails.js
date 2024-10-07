import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { AccessTime, LocationOn, Event as EventIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
      setEvent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch event details based on eventId
    fetchEventDetails();
  }, [eventId]);

  const handleQuantityChange = (tierId, value, maxQuantity) => {
    let intValue = parseInt(value);
    if (isNaN(intValue)) {
      intValue = 0;
    }
    if (intValue < 0) {
      intValue = 0;
    } else if (intValue > maxQuantity) {
      intValue = maxQuantity;
    }

    setSelectedQuantities({
      ...selectedQuantities,
      [tierId]: intValue,
    });
  };

  const handlePurchase = async () => {
    // Prepare the purchase data
    const purchaseData = Object.entries(selectedQuantities)
      .filter(([tierId, quantity]) => quantity > 0)
      .map(([tierId, quantity]) => ({ tierId, quantity }));

    if (purchaseData.length === 0) {
      setSnackbarMessage('Please select at least one ticket.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/events/${event._id}/purchase`,
        { tickets: purchaseData }
      );
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Refresh event data to update available quantities
      fetchEventDetails();
      // Reset selected quantities
      setSelectedQuantities({});
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to purchase tickets');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Determine if the checkout button should be disabled
  const isCheckoutDisabled = !Object.values(selectedQuantities).some((quantity) => quantity > 0);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" color="error">
          Event not found
        </Typography>
      </Container>
    );
  }

  // Currency formatter for Sri Lankan Rupees
  const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  });

  const formattedDate = new Date(event.date).toLocaleDateString('en-LK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Grid container>
          {/* Event Poster */}
          <Grid item xs={12} md={5}>
            <CardMedia
              component="img"
              image={`http://localhost:5000${event.posterUrl}`}
              alt={event.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Grid>

          {/* Event Details */}
          <Grid item xs={12} md={7}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {event.title}
              </Typography>

              {/* Event Date and Location */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="textSecondary">
                  {formattedDate}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="textSecondary">
                  {new Date(event.date).toLocaleTimeString('en-LK', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="textSecondary">
                  {event.location}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Event Description */}
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Ticket Tiers */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Select Tickets
        </Typography>
        <Grid container spacing={3}>
          {event.tiers.map((tier) => {
            const maxAvailable = tier.quantity;

            return (
              <Grid item xs={12} sm={6} md={4} key={tier._id}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {tier.name}
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {currencyFormatter.format(tier.price)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {tier.benefits}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Available Tickets: {tier.quantity}
                    </Typography>

                    {/* Quantity Selector */}
                    {tier.quantity > 0 ? (
                      <TextField
                        label="Quantity"
                        type="number"
                        InputProps={{
                          inputProps: { min: 0, max: maxAvailable },
                        }}
                        value={selectedQuantities[tier._id] || 0}
                        onChange={(e) =>
                          handleQuantityChange(tier._id, e.target.value, maxAvailable)
                        }
                        style={{ width: '100%', marginTop: '10px' }}
                      />
                    ) : (
                      <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        Sold Out
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Purchase Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePurchase}
            sx={{ borderRadius: 2, padding: '10px 30px' }}
            disabled={isCheckoutDisabled}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Box>

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetails;