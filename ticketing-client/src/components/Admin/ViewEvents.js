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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Transition component for Dialog animation
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events'); // Use the centralized API
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({ open: true, message: 'Failed to fetch events', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEdit = (eventId) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleDelete = (eventId) => {
    setSelectedEventId(eventId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/events/${selectedEventId}`); // Use the centralized API
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Events
      </Typography>
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
          {events.map((event) => (
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
