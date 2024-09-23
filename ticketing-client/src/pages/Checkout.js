import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Snackbar,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you are using axios for API requests

const Checkout = () => {
  const navigate = useNavigate();

  // State variables for selected tickets
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [eventId, setEventId] = useState(''); // Store eventId to update tickets
  const [eventTitle, setEventTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchEventDetails = async () => {
      const storedEventId = localStorage.getItem('eventId');
      if (!storedEventId) {
        console.error('No eventId found in localStorage.');
        return;
      }
  
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/events/${storedEventId}`);  // Use environment variable
        const event = response.data;
        console.log('Fetched Event Details:', event);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };
  
    fetchEventDetails();
  }, []);

  useEffect(() => {
    const storedTickets = JSON.parse(localStorage.getItem('selectedTickets'));
    const storedEventTitle = localStorage.getItem('eventTitle');
    const storedEventId = localStorage.getItem('eventId'); // Ensure eventId is correctly stored
  
    console.log('Stored Event ID:', storedEventId); // Add this to check if eventId is fetched correctly
  
    if (storedTickets && storedTickets.length > 0) {
      setSelectedTickets(storedTickets);
      setEventTitle(storedEventTitle || '');
      setEventId(storedEventId || '');
  
      const total = storedTickets.reduce((acc, ticket) => acc + ticket.price * ticket.quantity, 0);
      setTotalAmount(total);
    } else {
      navigate('/home');
    }
  
    return () => {
      setSelectedTickets([]);
      setEventTitle('');
      setTotalAmount(0);
    };
  }, [navigate]);
  

  const handleProceedToPayment = async () => {
    try {
      // Simulate a successful payment
      setSnackbar({ open: true, message: 'Payment Successful! Your tickets are booked.', severity: 'success' });

      // Prepare the data to update tickets on the server
      const ticketData = selectedTickets.map(ticket => ({
        tierId: ticket.tierId,
        quantity: ticket.quantity,
      }));

      // Call API to update ticket quantities
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/events/${eventId}/update-tickets`, { tickets: ticketData });
      } catch (error) {
        console.error('Payment Error or Ticket Update Error:', error.response ? error.response.data : error.message);
        setSnackbar({ open: true, message: 'Payment Failed. Please try again.', severity: 'error' });
      }

      // Clear selected tickets and event title
      localStorage.removeItem('selectedTickets');
      localStorage.removeItem('eventTitle');
      localStorage.removeItem('eventId');

      // Redirect to confirmation or home page after a short delay
      setTimeout(() => {
        navigate('/confirmation'); // Adjust the path as necessary
      }, 3000);
    } catch (error) {
      console.error('Payment Error or Ticket Update Error:', error);
      setSnackbar({ open: true, message: 'Payment Failed. Please try again.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Calculate if any ticket has quantity > 0
  const isCheckoutDisabled = !selectedTickets.some((ticket) => ticket.quantity > 0);

  const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  });

  return (
    <>
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <IconButton onClick={handleBack} aria-label="Go Back">
            <ArrowBack />
          </IconButton>
        </Box>

        <Typography variant="h4" gutterBottom align="center">
          Checkout
        </Typography>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h6" gutterBottom>
            Review Your Selection
          </Typography>
          <Grid container spacing={3}>
            {/* Event Title */}
            {eventTitle && (
              <Grid item xs={12}>
                <Typography variant="subtitle1"><strong>Event:</strong> {eventTitle}</Typography>
              </Grid>
            )}
            {/* Selected Tickets */}
            {selectedTickets.map((ticket, index) => (
              <Grid item xs={12} key={ticket.tierId || index}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #ccc',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1"><strong>Tier:</strong> {ticket.name}</Typography>
                    <Typography variant="subtitle1"><strong>Price:</strong> {currencyFormatter.format(ticket.price)}</Typography>
                    <Typography variant="subtitle1"><strong>Quantity:</strong> {ticket.quantity}</Typography>
                    <Typography variant="subtitle1"><strong>Subtotal:</strong> {currencyFormatter.format(ticket.price * ticket.quantity)}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
            {/* Total Amount */}
            <Grid item xs={12}>
              <Typography variant="h6">
                Total Amount: {currencyFormatter.format(totalAmount)}
              </Typography>
            </Grid>
            {/* Proceed to Payment Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleProceedToPayment}
                fullWidth
                disabled={isCheckoutDisabled}
                sx={{ borderRadius: 2, py: 1.5, fontSize: '1rem', textTransform: 'none' }}
              >
                Proceed to Payment
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Checkout;
