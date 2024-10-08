import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { Add, Remove, Edit, Delete, PictureAsPdf } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ManageBandsPerformers = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [bands, setBands] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [editData, setEditData] = useState(null); // Data being edited
  const [editType, setEditType] = useState(null); // 'band' or 'performer'
  const [editIndex, setEditIndex] = useState(null); // Index of the band or performer being edited
  const [loading, setLoading] = useState(false); // Loading state for event selection
  const [openDialog, setOpenDialog] = useState(false); // Dialog open state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Snackbar state

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setSnackbar({ open: true, message: 'Failed to fetch events.', severity: 'error' });
      }
    };

    fetchEvents();
  }, []);

  // Fetch bands and performers for the selected event
  const fetchBandsPerformers = async (eventId) => {
    try {
      setLoading(true); // Start loading
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/bands-performers/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBands(response.data.bands || []); // Ensure it defaults to an empty array if undefined
      setPerformers(response.data.performers || []); // Ensure it defaults to an empty array if undefined
    } catch (error) {
      console.error('Error fetching bands and performers:', error);
      setSnackbar({ open: true, message: 'Failed to fetch bands and performers.', severity: 'error' });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle event selection
  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setBands([]); // Clear old data
    setPerformers([]); // Clear old data
    if (eventId) {
      fetchBandsPerformers(eventId);
    }
  };

  // Handle delete of a band or performer
  const handleDelete = async (bandIndex, performerIndex = null) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (!confirmDelete) return;

    let updatedBands = [...bands];
    let updatedPerformers = [...performers];

    if (performerIndex === null) {
      // Delete the entire band
      updatedBands.splice(bandIndex, 1);
    } else {
      // Delete only a performer
      updatedPerformers.splice(performerIndex, 1);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/bands-performers/${selectedEvent}`,
        { bands: updatedBands, performers: updatedPerformers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state after successful deletion
      setBands(updatedBands);
      setPerformers(updatedPerformers);

      setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };

  // Handle editing of band/performer details (opens dialog)
  const handleEdit = (bandIndex, performerIndex = null) => {
    if (performerIndex !== null) {
      // Edit performer
      if (performers[performerIndex]) {
        setEditType('performer');
        setEditData({ ...performers[performerIndex] });
        setEditIndex({ performerIndex });
      } else {
        console.error('Performer not found or undefined');
        return;
      }
    } else {
      // Edit band
      if (bands[bandIndex]) {
        setEditType('band');
        setEditData({ ...bands[bandIndex] });
        setEditIndex({ bandIndex });
      } else {
        console.error('Band not found or undefined');
        return;
      }
    }
    setOpenDialog(true); // Open dialog for editing
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditData(null);
    setEditType(null);
    setEditIndex(null);
  };

  // Handle save of the edited data
  const handleSave = async () => {
    let updatedBands = [...bands];
    let updatedPerformers = [...performers];

    if (editType === 'performer') {
      updatedPerformers[editIndex.performerIndex] = editData;
    } else {
      updatedBands[editIndex.bandIndex] = editData;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/bands-performers/${selectedEvent}`,
        { bands: updatedBands, performers: updatedPerformers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state after successful edit
      if (editType === 'performer') {
        setPerformers(updatedPerformers);
      } else {
        setBands(updatedBands);
      }

      setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
      handleDialogClose();
    } catch (error) {
      console.error('Error updating item:', error);
      setSnackbar({ open: true, message: 'Failed to update item.', severity: 'error' });
    }
  };

  // Handle input changes in the dialog
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate PDF report for the selected event
  const generatePDF = async () => {
    const doc = new jsPDF('p', 'pt');

    // Set title for the PDF
    doc.setFontSize(18);
    doc.text('Event Report', 40, 50);

    if (selectedEvent) {
      const selectedEventData = events.find((event) => event._id === selectedEvent);
      if (selectedEventData) {
        doc.setFontSize(14);
        doc.text(`Event Name: ${selectedEventData.eventName}`, 40, 80);
        doc.text(`Event Date: ${new Date(selectedEventData.eventDate).toLocaleDateString()}`, 40, 100);
      }
    }

    // Add Bands section
    doc.setFontSize(16);
    doc.text('Bands:', 40, 140);
    bands.forEach((band, index) => {
      doc.setFontSize(12);
      doc.text(`Band ${index + 1}: ${band.name}`, 40, 160 + index * 20);
      doc.text(`Email: ${band.email}`, 40, 180 + index * 20);
      doc.text(`Phone: ${band.phone}`, 40, 200 + index * 20);
      doc.text(`Payment Amount: $${band.paymentAmount}`, 40, 220 + index * 20);
      doc.text(`Payment Status: ${band.paymentStatus}`, 40, 240 + index * 20);
    });

    // Add Performers section
    const performersY = 260 + bands.length * 20;
    doc.setFontSize(16);
    doc.text('Performers:', 40, performersY);
    performers.forEach((performer, index) => {
      const yPosition = performersY + (index + 1) * 20;
      doc.setFontSize(12);
      doc.text(`Performer ${index + 1}: ${performer.name}`, 40, yPosition);
      doc.text(`Email: ${performer.email}`, 40, yPosition + 20);
      doc.text(`Phone: ${performer.phone}`, 40, yPosition + 40);
      doc.text(`Payment Amount: $${performer.paymentAmount}`, 40, yPosition + 60);
      doc.text(`Payment Status: ${performer.paymentStatus}`, 40, yPosition + 80);
    });

    // Save the PDF
    doc.save('event_report.pdf');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Manage Bands and Performers
      </Typography>

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

      {/* Select Event */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="select-event-label">Select Event</InputLabel>
        <Select
          labelId="select-event-label"
          id="select-event"
          value={selectedEvent}
          label="Select Event"
          onChange={handleEventChange}
        >
          {events.map((event) => (
            <MenuItem key={event._id} value={event._id}>
              {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Show Bands and Performers for the selected event */}
      {!loading && selectedEvent && (
        <>
          {bands.length === 0 && performers.length === 0 ? (
            <Typography variant="h6" align="center" color="textSecondary">
              No bands or performers found for this event.
            </Typography>
          ) : (
            <Grid container spacing={4}>
              {/* Bands Section */}
              {bands.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Bands
                    </Typography>
                    {bands.map((band, bandIndex) => (
                      <Box
                        key={band._id || bandIndex}
                        sx={{
                          border: '1px solid #ddd',
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        <Typography variant="h6">{band.name}</Typography>
                        <Typography>Email: {band.email}</Typography>
                        <Typography>Phone: {band.phone}</Typography>
                        <Typography>Payment Amount: ${band.paymentAmount}</Typography>
                        <Typography>Payment Status: {band.paymentStatus}</Typography>
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(bandIndex)}
                            aria-label="edit band"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(bandIndex)}
                            aria-label="delete band"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}

              {/* Performers Section */}
              {performers.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Performers
                    </Typography>
                    {performers.map((performer, performerIndex) => (
                      <Box
                        key={performer._id || performerIndex}
                        sx={{
                          border: '1px solid #ddd',
                          borderRadius: 2,
                          p: 2,
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        <Typography variant="h6">{performer.name}</Typography>
                        <Typography>Email: {performer.email}</Typography>
                        <Typography>Phone: {performer.phone}</Typography>
                        <Typography>Payment Amount: ${performer.paymentAmount}</Typography>
                        <Typography>Payment Status: {performer.paymentStatus}</Typography>
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(null, performerIndex)}
                            aria-label="edit performer"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(null, performerIndex)}
                            aria-label="delete performer"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Generate Report Button */}
          <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PictureAsPdf />}
              onClick={generatePDF}
            >
              Generate Report
            </Button>
          </Box>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit {editType === 'performer' ? 'Performer' : 'Band'} Details</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              value={editData?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <TextField
              margin="normal"
              label="Email"
              type="email"
              fullWidth
              value={editData?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <TextField
              margin="normal"
              label="Phone"
              type="tel"
              fullWidth
              value={editData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <TextField
              margin="normal"
              label="Payment Amount"
              type="number"
              fullWidth
              value={editData?.paymentAmount || ''}
              onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
              InputProps={{ inputProps: { min: 0, step: '0.01' } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-status-label">Payment Status</InputLabel>
              <Select
                labelId="payment-status-label"
                label="Payment Status"
                value={editData?.paymentStatus || 'pending'}
                onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageBandsPerformers;
