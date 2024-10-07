import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Box,
  Button,
  TextField,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const AdminFeedback = () => {
  const [events, setEvents] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null); // Feedback to edit/delete
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Edit dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Delete dialog state

  // Fetch events and feedback
  useEffect(() => {
    fetchEventsAndFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEventsAndFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsResponse = await axios.get('http://localhost:5000/api/events');
      const events = eventsResponse.data;

      // Fetch feedback for all events concurrently
      const feedbackPromises = events.map((event) =>
        axios.get(`http://localhost:5000/api/feedback/${event._id}`)
      );

      const feedbackResponses = await Promise.all(feedbackPromises);
      const feedbackDict = {};
      feedbackResponses.forEach((response, index) => {
        feedbackDict[events[index]._id] = response.data;
      });

      setEvents(events);
      setFeedbackData(feedbackDict);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events and feedback:', error);
      setError('Error fetching events and feedback');
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to fetch events and feedback.',
        severity: 'error',
      });
    }
  };

  // Open the edit dialog
  const handleEditClick = (feedback) => {
    setSelectedFeedback({ ...feedback }); // Clone to prevent direct state mutation
    setIsEditDialogOpen(true);
  };

  // Handle input changes in the edit dialog
  const handleEditInputChange = (field, value) => {
    setSelectedFeedback((prev) => ({ ...prev, [field]: value }));
  };

  // Save edited feedback
  const handleSaveEdit = async () => {
    try {
      const { _id, feedbackText, rating } = selectedFeedback;
      // Send PUT request to update feedback
      await axios.put(`http://localhost:5000/api/feedback/${_id}`, {
        feedbackText,
        rating,
      });
      setSnackbar({
        open: true,
        message: 'Feedback updated successfully.',
        severity: 'success',
      });
      fetchEventsAndFeedback(); // Refresh feedback after update
    } catch (error) {
      console.error('Error updating feedback:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update feedback.',
        severity: 'error',
      });
    }
    setIsEditDialogOpen(false);
    setSelectedFeedback(null);
  };

  // Open the delete confirmation dialog
  const handleDeleteClick = (feedback) => {
    setSelectedFeedback(feedback);
    setIsDeleteDialogOpen(true);
  };

  // Confirm and delete feedback
  const handleDeleteConfirm = async () => {
    try {
      // Send DELETE request to delete feedback
      await axios.delete(
        `http://localhost:5000/api/feedback/${selectedFeedback._id}`
      );
      setSnackbar({
        open: true,
        message: 'Feedback deleted successfully.',
        severity: 'success',
      });
      fetchEventsAndFeedback(); // Refresh feedback after delete
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete feedback.',
        severity: 'error',
      });
    }
    setIsDeleteDialogOpen(false);
    setSelectedFeedback(null);
  };
  
  // Filter feedback based on search term
  const filterFeedback = (feedbacks) => {
    if (!searchTerm) return feedbacks;
    return feedbacks.filter(
      (fb) =>
        (fb.anonymous === false &&
          (fb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.feedbackText.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        fb.anonymous === true &&
          fb.feedbackText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Prepare rows for DataGrid
  const prepareRows = (feedbacks) => {
    return feedbacks.map((fb) => ({
      id: fb._id,
      user: fb.anonymous ? 'Anonymous' : `${fb.name} (${fb.email})`,
      feedback: fb.feedbackText,
      rating: fb.rating,
      createdAt: fb.createdAt,
      actions: fb,
    }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      sortable: false,
    },
    {
      field: 'feedback',
      headerName: 'Feedback',
      flex: 2,
      sortable: false,
    },
    {
      field: 'rating',
      headerName: 'Rating',
      type: 'number',
      flex: 0.5,
      sortable: true,
      renderCell: (params) => <Rating value={params.value} readOnly />,
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      flex: 1,
      sortable: true,
      valueGetter: (params) =>
        new Date(params.value).toLocaleDateString('en-US'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.value)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.value)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Container>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        my={4}
      >
        <Typography variant="h4" gutterBottom>
          Manage Feedback for All Events
        </Typography>
        <Button variant="contained" color="primary" onClick={fetchEventsAndFeedback}>
          Refresh
        </Button>
      </Box>

      {/* Search Bar */}
      <Box mb={4}>
        <TextField
          label="Search Feedback"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by user name or feedback text"
        />
      </Box>

      {/* Loading Indicator */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : events.length === 0 ? (
        <Box my={4}>
          <Alert severity="info">No events available.</Alert>
        </Box>
      ) : (
        // Events and Feedbacks
        <Grid container spacing={4}>
          {events.map((event) => {
            const feedbacks = feedbackData[event._id] || [];
            const filteredFeedbacks = filterFeedback(feedbacks);
            const rows = prepareRows(filteredFeedbacks);

            return (
              <Grid item xs={12} key={event._id}>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${event._id}-content`}
                    id={`panel-${event._id}-header`}
                  >
                    <Typography variant="h6">{event.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {filteredFeedbacks.length > 0 ? (
                      <Box style={{ height: 400, width: '100%' }}>
                        <DataGrid
                          rows={rows}
                          columns={columns}
                          pageSize={5}
                          rowsPerPageOptions={[5, 10, 20]}
                          disableSelectionOnClick
                          autoHeight
                        />
                      </Box>
                    ) : (
                      <Typography color="textSecondary">
                        No feedback available for this event.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Feedback Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        aria-labelledby="edit-feedback-dialog-title"
      >
        <DialogTitle id="edit-feedback-dialog-title">Edit Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Feedback"
            variant="outlined"
            multiline
            minRows={3}
            value={selectedFeedback?.feedbackText || ''}
            onChange={(e) =>
              handleEditInputChange('feedbackText', e.target.value)
            }
          />
          <Box display="flex" alignItems="center" mt={2}>
            <Typography component="legend" mr={2}>
              Rating:
            </Typography>
            <Rating
              value={selectedFeedback?.rating || 0}
              onChange={(event, newValue) =>
                handleEditInputChange('rating', newValue)
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        aria-labelledby="delete-feedback-dialog-title"
      >
        <DialogTitle id="delete-feedback-dialog-title">
          Delete Feedback
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this feedback?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminFeedback;
