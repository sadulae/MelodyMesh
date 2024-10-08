// src/components/EventDetails.js

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
// Import pdfmake and virtual file system
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs; // Set the virtual file system for pdfMake

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
        `http://localhost:5000/api/events/${event._id}/update-tickets`,
        { tickets: purchaseData }
      );
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Refresh event data to update available quantities
      await fetchEventDetails();
      // Reset selected quantities
      setSelectedQuantities({});
      // Generate and download the ticket
      generateTicket(purchaseData);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to purchase tickets');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Function to generate and download the ticket
  const generateTicket = (purchaseData) => {
    // Currency formatter for Sri Lankan Rupees
    const currencyFormatter = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    });

    // Calculate total amount
    const totalAmount = purchaseData.reduce((sum, { tierId, quantity }) => {
      const tier = event.tiers.find((t) => t._id === tierId);
      return sum + tier.price * quantity;
    }, 0);

    // Prepare the ticket content
    const docDefinition = {
      content: [
        // Header Section with MelodyMesh text
        {
          columns: [
            {
              text: 'MelodyMesh',
              color: '#007BFF',
              fontSize: 24,
              bold: true,
              margin: [0, 0, 0, 0],
            },
            {
              text: 'Ticket Confirmation',
              style: 'header',
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 20],
        },
        // Date and Time Issued
        {
          text: `Date of Issue: ${new Date().toLocaleString()}`,
          alignment: 'right',
          margin: [0, 0, 0, 10],
          fontSize: 10,
          color: '#555',
        },
        // Divider Line
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#CCCCCC',
            },
          ],
          margin: [0, 10, 0, 10],
        },
        // Event Details Heading
        {
          text: 'Event Details',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        // Event Details Content
        {
          columns: [
            [
              { text: 'Event Name:', style: 'label' },
              { text: event.title, style: 'value' },
            ],
            [
              { text: 'Date & Time:', style: 'label' },
              {
                text: `${new Date(event.date).toLocaleDateString('en-LK', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })} at ${new Date(event.date).toLocaleTimeString('en-LK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`,
                style: 'value',
              },
            ],
          ],
          columnGap: 20,
        },
        {
          columns: [
            [
              { text: 'Location:', style: 'label' },
              { text: event.location, style: 'value' },
            ],
            // Additional event details can be added here if needed
          ],
          columnGap: 20,
          margin: [0, 10, 0, 10],
        },
        // Divider Line
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#CCCCCC',
            },
          ],
          margin: [0, 10, 0, 10],
        },
        // Ticket Details Heading
        {
          text: 'Ticket Details',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        // Ticket Details Table
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Tier', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader', alignment: 'right' },
                { text: 'Price', style: 'tableHeader', alignment: 'right' },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
              ],
              ...purchaseData.map(({ tierId, quantity }) => {
                const tier = event.tiers.find((t) => t._id === tierId);
                const price = tier.price;
                const subtotal = price * quantity;
                return [
                  { text: tier.name, style: 'tableData' },
                  { text: quantity, style: 'tableData', alignment: 'right' },
                  {
                    text: currencyFormatter.format(price),
                    style: 'tableData',
                    alignment: 'right',
                  },
                  {
                    text: currencyFormatter.format(subtotal),
                    style: 'tableData',
                    alignment: 'right',
                  },
                ];
              }),
              // Total row
              [
                { text: 'Total', colSpan: 3, alignment: 'right', style: 'tableTotal' },
                {},
                {},
                {
                  text: currencyFormatter.format(totalAmount),
                  style: 'tableTotal',
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex) => {
              return rowIndex === 0 ? '#F5F5F5' : null;
            },
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            hLineColor: () => '#FFFFFF',
            paddingLeft: (i) => (i === 0 ? 0 : 8),
            paddingRight: (i) => (i === 0 ? 0 : 8),
            paddingTop: (i) => 4,
            paddingBottom: (i) => 4,
          },
        },
        // Divider Line
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: '#CCCCCC',
            },
          ],
          margin: [0, 20, 0, 10],
        },
        // Footer Message
        {
          text: 'Thank you for your purchase!',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
        // Optional Terms and Conditions
        {
          text: 'Please present this ticket at the event entrance. Tickets are non-refundable and non-transferable.',
          style: 'terms',
          alignment: 'center',
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#4e73df',
        },
        sectionHeader: {
          fontSize: 16,
          bold: true,
          color: '#333333',
        },
        label: {
          fontSize: 12,
          bold: true,
          color: '#555555',
        },
        value: {
          fontSize: 12,
          color: '#000000',
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: '#555555',
          fillColor: '#F5F5F5',
        },
        tableData: {
          fontSize: 12,
          color: '#000000',
        },
        tableTotal: {
          fontSize: 12,
          bold: true,
          color: '#000000',
        },
        footer: {
          fontSize: 14,
          bold: true,
          color: '#4e73df',
        },
        terms: {
          fontSize: 10,
          color: '#777777',
        },
      },
      defaultStyle: {
        fontSize: 12,
      },
      pageMargins: [40, 60, 40, 60],
      // Removed the images section since we're not using an image
    };

    // Generate PDF and download
    pdfMake.createPdf(docDefinition).download('ticket.pdf');
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
