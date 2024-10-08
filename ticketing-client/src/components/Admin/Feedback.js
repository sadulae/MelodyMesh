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
import jsPDF from 'jspdf';  // Import jsPDF for PDF generation
import 'jspdf-autotable'; // Import the autoTable plugin for jsPDF  
import emailjs from 'emailjs-com'; // Import EmailJS for sending emails

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
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  // const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false); // Update for reply dialog
  const [replyMessage, setReplyMessage] = useState(''); // Update for reply message

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

  // Function to calculate average rating for an event
  const calculateAverageRating = (feedbacks) => {
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    return (totalRating / feedbacks.length).toFixed(2);
  };

  // Convert the image to base64 format
const getBase64ImageFromURL = async (url) => {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
  });
};

// Function to handle PDF generation
const generateReport = async () => {
  const doc = new jsPDF();

  // Add the logo image to the top-right corner
  const logoUrl = `${process.env.PUBLIC_URL}/logom.png`; // Path to logo in the public folder
  const logoBase64 = await getBase64ImageFromURL(logoUrl);
  doc.addImage(logoBase64, 'PNG', 150, 10, 50, 20); // Add the logo (adjust x, y, width, height)

  // Title for the report
  doc.setFontSize(18);
  doc.text('Event Feedback Report', 14, 20);

  // Start after the logo
  let yPos = 40;

  // Loop through events and feedbacks
  for (const event of events) {
    const feedbacks = feedbackData[event._id] || [];

    if (feedbacks.length > 0) {
      // Section title for the event
      doc.setFontSize(14);
      doc.text(`Event: ${event.title}`, 14, yPos);
      yPos += 6;
      doc.setFontSize(12);
      doc.text(`Total Feedback: ${feedbacks.length}`, 14, yPos);
      yPos += 6;
      doc.text(`Average Rating: ${calculateAverageRating(feedbacks)}`, 14, yPos);
      yPos += 10;

      // Feedback table for the event
      doc.autoTable({
        startY: yPos,
        head: [['User', 'Feedback', 'Rating']],
        body: feedbacks.map((fb) => [
          fb.anonymous ? 'Anonymous' : `${fb.name} (${fb.email})`,
          fb.feedbackText,
          fb.rating,
        ]),
        margin: { top: 10 },
        styles: { fontSize: 10, cellPadding: 3 },
      });

      // Update yPos after the table
      yPos = doc.autoTable.previous.finalY + 10;

      // Add a separator line between events
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;
    }
  }

  // Save the generated PDF to the user's computer
  doc.save('event-feedback-report.pdf');
};


  // // Open the edit dialog
  // const handleEditClick = (feedback) => {
  //   setSelectedFeedback({ ...feedback });
  //   setIsEditDialogOpen(true);
  // };

  // // Handle input changes in the edit dialog
  // const handleEditInputChange = (field, value) => {
  //   setSelectedFeedback((prev) => ({ ...prev, [field]: value }));
  // };

  // // Save edited feedback
  // const handleSaveEdit = async () => {
  //   try {
  //     const { _id, feedbackText, rating } = selectedFeedback;
  //     // Send PUT request to update feedback
  //     await axios.put(`http://localhost:5000/api/feedback/${_id}`, {
  //       feedbackText,
  //       rating,
  //     });
  //     setSnackbar({
  //       open: true,
  //       message: 'Feedback updated successfully.',
  //       severity: 'success',
  //     });
  //     fetchEventsAndFeedback(); // Refresh feedback after update
  //   } catch (error) {
  //     console.error('Error updating feedback:', error);
  //     setSnackbar({
  //       open: true,
  //       message: 'Failed to update feedback.',
  //       severity: 'error',
  //     });
  //   }
  //   setIsEditDialogOpen(false);
  //   setSelectedFeedback(null);
  // };

  // Handle reply button click
  const handleReplyClick = (feedback) => {
    setSelectedFeedback(feedback);
    setIsReplyDialogOpen(true); // Open the reply dialog
  };

  // Handle reply input change
  const handleReplyInputChange = (e) => {
    setReplyMessage(e.target.value);
  };

  // Send the reply email using EmailJS
  const handleSendReply = async () => {
    if (selectedFeedback) {
      const templateParams = {
        user_email: selectedFeedback.email, // Use the feedback submitter's email
        reply_message: replyMessage,
        event_title: selectedFeedback.eventTitle, // Assuming eventTitle is part of the feedback object
      };

      try {
        await emailjs.send(
          'service_7y9u68n', // Replace with your EmailJS service ID
          'template_pabj3pr', // Replace with your EmailJS template ID
          templateParams,
          '0IB2_j_7JEJvkWewH' // Replace with your EmailJS user ID
        );

        setSnackbar({
          open: true,
          message: 'Reply sent successfully!',
          severity: 'success',
        });

        // Close the dialog and reset the form
        setIsReplyDialogOpen(false);
        setReplyMessage('');
        setSelectedFeedback(null);
      } catch (error) {
        console.error('Error sending reply:', error);
        setSnackbar({
          open: true,
          message: 'Failed to send reply.',
          severity: 'error',
        });
      }
    }
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
            onClick={() => handleReplyClick(params.value)}
            style={{ marginRight: 8 }}
          >
            Reply
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
      <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
        <Typography variant="h4" gutterBottom>
          Manage Feedback for All Events
        </Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={fetchEventsAndFeedback}>
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={generateReport}
            style={{ marginLeft: 10 }}  // Add some space between buttons
          >
            Generate Report
          </Button>
        </Box>
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
      {/* <Dialog
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
      </Dialog> */}

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

      {/* Reply Dialog */}
      <Dialog
        open={isReplyDialogOpen}
        onClose={() => setIsReplyDialogOpen(false)}
        aria-labelledby="reply-feedback-dialog-title"
      >
        <DialogTitle id="reply-feedback-dialog-title">Reply to Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Your Reply"
            variant="outlined"
            multiline
            minRows={3}
            value={replyMessage}
            onChange={handleReplyInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendReply} color="primary" variant="contained">
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
