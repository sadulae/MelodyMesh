// src/components/Admin/ViewEvents.js

import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // Import the centralized Axios instance
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Slide,
  TextField,
} from '@mui/material';
import { Edit, Delete, PictureAsPdf } from '@mui/icons-material'; // Use PictureAsPdf icon for PDF generation
import { useNavigate } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake'; // Import pdfMake for PDF generation
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Import fonts for pdfMake

pdfMake.vfs = pdfFonts.pdfMake.vfs; // Set the virtual file system for pdfMake

// Transition component for Dialog animation
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events');
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({ open: true, message: 'Failed to fetch events', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on the search query
  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const handleEdit = (eventId) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleDelete = (eventId) => {
    setSelectedEventId(eventId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/events/${selectedEventId}`);
      setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({ open: true, message: 'Failed to delete event', severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedEventId(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedEventId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to generate a detailed PDF report of all events
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

    // Group events by date
    const eventsByDate = {};
    filteredEvents.forEach((event) => {
      const eventDate = new Date(event.date).toLocaleDateString();
      if (!eventsByDate[eventDate]) {
        eventsByDate[eventDate] = [];
      }
      eventsByDate[eventDate].push(event);
    });

    // Loop through each date group
    for (const [date, eventsOnDate] of Object.entries(eventsByDate)) {
      // Date header
      content.push({
        text: `Events on ${date}`,
        style: 'dateHeader',
        margin: [0, 20, 0, 10],
      });

      eventsOnDate.forEach((event) => {
        // Event title
        content.push({
          text: event.title,
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
                { text: event.description },
              ],
              [
                { text: 'Location', style: 'tableHeader' },
                { text: event.location },
              ],
              [
                { text: 'Date & Time', style: 'tableHeader' },
                { text: new Date(event.date).toLocaleString() },
              ],
              [
                { text: 'Latitude', style: 'tableHeader' },
                { text: event.lat ? event.lat.toString() : 'N/A' },
              ],
              [
                { text: 'Longitude', style: 'tableHeader' },
                { text: event.lng ? event.lng.toString() : 'N/A' },
              ],
              // Add more rows as needed
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10],
        });

        // Tiers table
        if (event.tiers && event.tiers.length > 0) {
          const tierTableBody = [
            [
              { text: 'Tier Name', style: 'tableHeader' },
              { text: 'Price (Rs.)', style: 'tableHeader' },
              { text: 'Benefits', style: 'tableHeader' },
              { text: 'Quantity', style: 'tableHeader' },
            ],
          ];

          event.tiers.forEach((tier) => {
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
        }

        // Divider
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
      });
    }

    const docDefinition = {
      content,
      styles: {
        dateHeader: {
          fontSize: 16,
          bold: true,
          color: '#007BFF',
          margin: [0, 20, 0, 10],
        },
        eventTitle: {
          fontSize: 14,
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

    pdfMake.createPdf(docDefinition).download('all_events_report.pdf');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Events
      </Typography>

      {/* Search Bar */}
      <TextField
        label="Search Events"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Generate PDF Report Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<PictureAsPdf />}
        onClick={generatePdf}
        sx={{ mb: 2 }}
      >
        Download All Events Report
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Location</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event._id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleEdit(event._id)}>
                  <Edit color="primary" />
                </IconButton>
                <IconButton onClick={() => handleDelete(event._id)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={openDeleteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCancelDelete}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="outlined" color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewEvents;
