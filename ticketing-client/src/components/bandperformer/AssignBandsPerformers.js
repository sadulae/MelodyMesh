// src/components/Admin/AssignBandsPerformers.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const AssignBandsPerformers = () => {
  const [events, setEvents] = useState([]); // For selecting events
  const [selectedEvent, setSelectedEvent] = useState('');
  const [bands, setBands] = useState([
    { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
  ]);
  const [performers, setPerformers] = useState([
    { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
  ]);
  const [existingDetails, setExistingDetails] = useState(false); // Flag to check if details already exist
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error message
  const [success, setSuccess] = useState(''); // Success message
  const [openConfirm, setOpenConfirm] = useState(false); // Confirmation dialog state
  const [removeType, setRemoveType] = useState(''); // 'band' or 'performer'
  const [removeIndex, setRemoveIndex] = useState(null); // Index of item to remove

  // Error states for bands and performers
  const [bandsErrors, setBandsErrors] = useState([
    { name: '', email: '', phone: '', paymentAmount: '' },
  ]);
  const [performersErrors, setPerformersErrors] = useState([
    { name: '', email: '', phone: '', paymentAmount: '' },
  ]);

  // Regex Patterns
  const namePattern = /^[A-Za-z0-9 ]*$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const paymentAmountPattern = /^\d+(\.\d{1,2})?$/;
  const phonePattern = /^[0-9()+\- ]*$/; // Allows numbers, parentheses, plus, minus, and spaces

  // Fetch events to associate bands/performers with an event
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
        setError('Failed to fetch events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch existing bands/performers for the selected event
  useEffect(() => {
    const fetchBandsPerformers = async () => {
      if (!selectedEvent) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/admin/bands-performers/${selectedEvent}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.bands.length > 0 || response.data.performers.length > 0) {
          setExistingDetails(true); // Event already has bands/performers
          setBands(response.data.bands.length > 0 ? response.data.bands : bands);
          setPerformers(
            response.data.performers.length > 0 ? response.data.performers : performers
          );

          // Initialize error states based on existing data
          setBandsErrors(
            response.data.bands.map(() => ({
              name: '',
              email: '',
              phone: '',
              paymentAmount: '',
            }))
          );
          setPerformersErrors(
            response.data.performers.map(() => ({
              name: '',
              email: '',
              phone: '',
              paymentAmount: '',
            }))
          );
        } else {
          setExistingDetails(false); // No bands/performers found
          setBands([{ name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' }]);
          setPerformers([
            { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
          ]);
          setBandsErrors([{ name: '', email: '', phone: '', paymentAmount: '' }]);
          setPerformersErrors([{ name: '', email: '', phone: '', paymentAmount: '' }]);
        }
      } catch (error) {
        console.error('Error fetching existing bands and performers:', error);
        setExistingDetails(false); // Assume no details if there's an error
        setBands([{ name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' }]);
        setPerformers([
          { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
        ]);
        setBandsErrors([{ name: '', email: '', phone: '', paymentAmount: '' }]);
        setPerformersErrors([{ name: '', email: '', phone: '', paymentAmount: '' }]);
      }
    };

    fetchBandsPerformers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent]);

  // Handle adding a new band
  const addBand = () => {
    setBands([
      ...bands,
      { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
    ]);
    setBandsErrors([
      ...bandsErrors,
      { name: '', email: '', phone: '', paymentAmount: '' },
    ]);
  };

  // Handle adding a new performer
  const addPerformer = () => {
    setPerformers([
      ...performers,
      { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
    ]);
    setPerformersErrors([
      ...performersErrors,
      { name: '', email: '', phone: '', paymentAmount: '' },
    ]);
  };

  // Open confirmation dialog before removing a band or performer
  const handleOpenConfirm = (type, index) => {
    setRemoveType(type);
    setRemoveIndex(index);
    setOpenConfirm(true);
  };

  // Close confirmation dialog
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setRemoveType('');
    setRemoveIndex(null);
  };

  // Confirm removal of a band or performer
  const handleConfirmRemove = () => {
    if (removeType === 'band') {
      const updatedBands = bands.filter((_, i) => i !== removeIndex);
      setBands(updatedBands);
      const updatedBandsErrors = bandsErrors.filter((_, i) => i !== removeIndex);
      setBandsErrors(updatedBandsErrors);
    } else if (removeType === 'performer') {
      const updatedPerformers = performers.filter((_, i) => i !== removeIndex);
      setPerformers(updatedPerformers);
      const updatedPerformersErrors = performersErrors.filter((_, i) => i !== removeIndex);
      setPerformersErrors(updatedPerformersErrors);
    }
    handleCloseConfirm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    let formIsValid = true;

    // Validate Bands
    const updatedBandsErrors = bands.map((band) => {
      const errors = { name: '', email: '', phone: '', paymentAmount: '' };
      if (!band.name.trim()) {
        errors.name = 'Band name is required';
        formIsValid = false;
      } else if (!namePattern.test(band.name.trim())) {
        errors.name = 'Only letters and numbers are allowed';
        formIsValid = false;
      }

      if (!band.email.trim()) {
        errors.email = 'Band email is required';
        formIsValid = false;
      } else if (!emailPattern.test(band.email.trim())) {
        errors.email = 'Invalid email format';
        formIsValid = false;
      }

      if (!band.phone.trim()) {
        errors.phone = 'Band phone number is required';
        formIsValid = false;
      } else if (!phonePattern.test(band.phone.trim())) {
        errors.phone = 'Only numbers and allowed symbols (+, -, (, )) are allowed';
        formIsValid = false;
      }

      if (!band.paymentAmount.toString().trim()) {
        errors.paymentAmount = 'Payment amount is required';
        formIsValid = false;
      } else if (!paymentAmountPattern.test(band.paymentAmount.toString().trim())) {
        errors.paymentAmount = 'Invalid payment amount';
        formIsValid = false;
      }

      return errors;
    });
    setBandsErrors(updatedBandsErrors);

    // Validate Performers
    const updatedPerformersErrors = performers.map((performer) => {
      const errors = { name: '', email: '', phone: '', paymentAmount: '' };
      if (!performer.name.trim()) {
        errors.name = 'Performer name is required';
        formIsValid = false;
      } else if (!namePattern.test(performer.name.trim())) {
        errors.name = 'Only letters and numbers are allowed';
        formIsValid = false;
      }

      if (!performer.email.trim()) {
        errors.email = 'Performer email is required';
        formIsValid = false;
      } else if (!emailPattern.test(performer.email.trim())) {
        errors.email = 'Invalid email format';
        formIsValid = false;
      }

      if (!performer.phone.trim()) {
        errors.phone = 'Performer phone number is required';
        formIsValid = false;
      } else if (!phonePattern.test(performer.phone.trim())) {
        errors.phone = 'Only numbers and allowed symbols (+, -, (, )) are allowed';
        formIsValid = false;
      }

      if (!performer.paymentAmount.toString().trim()) {
        errors.paymentAmount = 'Payment amount is required';
        formIsValid = false;
      } else if (!paymentAmountPattern.test(performer.paymentAmount.toString().trim())) {
        errors.paymentAmount = 'Invalid payment amount';
        formIsValid = false;
      }

      return errors;
    });
    setPerformersErrors(updatedPerformersErrors);

    // Additional validations for selectedEvent
    if (!selectedEvent) {
      setError('Please select an event.');
      formIsValid = false;
    } else {
      setError('');
    }

    if (!formIsValid) {
      setError('Please fix the errors in the form.');
      setSuccess('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = { eventID: selectedEvent, bands, performers };

      console.log('Data being sent:', JSON.stringify(data, null, 2));

      await axios.post('http://localhost:5000/api/admin/bands-performers', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Bands and performers assigned successfully!');
      setError('');
      // Optionally, reset the form or keep the data
    } catch (error) {
      console.error('Error assigning bands and performers:', error);
      setError(
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to assign bands and performers. Please try again.'
      );
      setSuccess('');
    }
  };

  // Handle input changes for bands and performers with validation
  const handleInputChange = (index, type, field, value) => {
    if (type === 'band') {
      const updatedBands = [...bands];
      updatedBands[index][field] = value;
      setBands(updatedBands);

      // Validate the input
      const updatedBandsErrors = [...bandsErrors];
      let errorMsg = '';

      if (field === 'name') {
        if (!value.trim()) {
          errorMsg = 'Band name is required';
        } else if (!namePattern.test(value.trim())) {
          errorMsg = 'Only letters and numbers are allowed';
        }
      } else if (field === 'email') {
        if (!value.trim()) {
          errorMsg = 'Band email is required';
        } else if (!emailPattern.test(value.trim())) {
          errorMsg = 'Invalid email format';
        }
      } else if (field === 'phone') {
        if (!value.trim()) {
          errorMsg = 'Band phone number is required';
        } else if (!phonePattern.test(value.trim())) {
          errorMsg = 'Only numbers and allowed symbols (+, -, (, )) are allowed';
        }
      } else if (field === 'paymentAmount') {
        if (!value.toString().trim()) {
          errorMsg = 'Payment amount is required';
        } else if (!paymentAmountPattern.test(value.toString().trim())) {
          errorMsg = 'Invalid payment amount';
        }
      }

      updatedBandsErrors[index][field] = errorMsg;
      setBandsErrors(updatedBandsErrors);
    } else if (type === 'performer') {
      const updatedPerformers = [...performers];
      updatedPerformers[index][field] = value;
      setPerformers(updatedPerformers);

      // Validate the input
      const updatedPerformersErrors = [...performersErrors];
      let errorMsg = '';

      if (field === 'name') {
        if (!value.trim()) {
          errorMsg = 'Performer name is required';
        } else if (!namePattern.test(value.trim())) {
          errorMsg = 'Only letters and numbers are allowed';
        }
      } else if (field === 'email') {
        if (!value.trim()) {
          errorMsg = 'Performer email is required';
        } else if (!emailPattern.test(value.trim())) {
          errorMsg = 'Invalid email format';
        }
      } else if (field === 'phone') {
        if (!value.trim()) {
          errorMsg = 'Performer phone number is required';
        } else if (!phonePattern.test(value.trim())) {
          errorMsg = 'Only numbers and allowed symbols (+, -, (, )) are allowed';
        }
      } else if (field === 'paymentAmount') {
        if (!value.toString().trim()) {
          errorMsg = 'Payment amount is required';
        } else if (!paymentAmountPattern.test(value.toString().trim())) {
          errorMsg = 'Invalid payment amount';
        }
      }

      updatedPerformersErrors[index][field] = errorMsg;
      setPerformersErrors(updatedPerformersErrors);
    }
  };

  // Prevent typing invalid characters in Name, Email, and Phone fields
  const handleKeyPress = (e, type, field) => {
    const char = String.fromCharCode(e.which);
    let regex;

    if (field === 'name') {
      regex = namePattern;
    } else if (field === 'email') {
      // Allow standard email characters
      regex = /^[A-Za-z0-9@._\-+]$/;
    } else if (field === 'phone') {
      regex = phonePattern;
    } else {
      return;
    }

    if (!regex.test(char)) {
      e.preventDefault();
    }
  };

  // Prevent pasting invalid characters
  const handlePaste = (e, type, field) => {
    const pasteData = e.clipboardData.getData('text');
    let regex;

    if (field === 'name') {
      regex = namePattern;
    } else if (field === 'email') {
      regex = /^[A-Za-z0-9@._\-+]+$/;
    } else if (field === 'phone') {
      regex = phonePattern;
    } else {
      return;
    }

    if (!regex.test(pasteData)) {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Assign Bands and Performers to Event
      </Typography>

      {/* Display error message */}
      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {/* Display success message */}
      {success && (
        <Snackbar
          open={Boolean(success)}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this {removeType === 'band' ? 'band' : 'performer'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="secondary" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Event */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="select-event-label">Select Event</InputLabel>
          <Select
            labelId="select-event-label"
            id="select-event"
            value={selectedEvent}
            label="Select Event"
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {events.map((event) => (
              <MenuItem key={event._id} value={event._id}>
                {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* If event already has details, show a message */}
        {selectedEvent && existingDetails ? (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="error">
              This event already has bands and performers assigned.
            </Typography>
            <Typography variant="body1">
              To modify the existing bands or performers, please contact the administrator.
            </Typography>
          </Paper>
        ) : selectedEvent ? (
          <>
            {/* Bands Section */}
            <Typography variant="h5" gutterBottom>
              Bands
            </Typography>
            {bands.map((band, index) => (
              <Paper key={index} elevation={2} sx={{ p: 3, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Band Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Band Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={band.name}
                      onChange={(e) =>
                        handleInputChange(index, 'band', 'name', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'band', 'name')}
                      onPaste={(e) => handlePaste(e, 'band', 'name')}
                      error={Boolean(bandsErrors[index]?.name)}
                      helperText={bandsErrors[index]?.name}
                    />
                  </Grid>
                  {/* Band Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Band Email"
                      variant="outlined"
                      fullWidth
                      required
                      type="email"
                      value={band.email}
                      onChange={(e) =>
                        handleInputChange(index, 'band', 'email', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'band', 'email')}
                      onPaste={(e) => handlePaste(e, 'band', 'email')}
                      error={Boolean(bandsErrors[index]?.email)}
                      helperText={bandsErrors[index]?.email}
                    />
                  </Grid>
                  {/* Band Phone Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Band Phone Number"
                      variant="outlined"
                      fullWidth
                      required
                      type="tel"
                      value={band.phone}
                      onChange={(e) =>
                        handleInputChange(index, 'band', 'phone', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'band', 'phone')}
                      onPaste={(e) => handlePaste(e, 'band', 'phone')}
                      error={Boolean(bandsErrors[index]?.phone)}
                      helperText={bandsErrors[index]?.phone}
                    />
                  </Grid>
                  {/* Payment Amount */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Payment Amount ($)"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      value={band.paymentAmount}
                      onChange={(e) =>
                        handleInputChange(index, 'band', 'paymentAmount', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'band', 'paymentAmount')}
                      onPaste={(e) => handlePaste(e, 'band', 'paymentAmount')}
                      error={Boolean(bandsErrors[index]?.paymentAmount)}
                      helperText={bandsErrors[index]?.paymentAmount}
                    />
                  </Grid>
                  {/* Payment Status */}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth required>
                      <InputLabel id={`payment-status-label-band-${index}`}>
                        Payment Status
                      </InputLabel>
                      <Select
                        labelId={`payment-status-label-band-${index}`}
                        id={`payment-status-band-${index}`}
                        value={band.paymentStatus}
                        label="Payment Status"
                        onChange={(e) =>
                          handleInputChange(index, 'band', 'paymentStatus', e.target.value)
                        }
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Remove Button */}
                  <Grid item xs={12} sm={12}>
                    {bands.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleOpenConfirm('band', index)}
                        aria-label="remove band"
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={addBand}
              sx={{ mb: 3 }}
            >
              Add Band
            </Button>

            {/* Performers Section */}
            <Typography variant="h5" gutterBottom>
              Performers
            </Typography>
            {performers.map((performer, index) => (
              <Paper key={index} elevation={2} sx={{ p: 3, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Performer Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Performer Name"
                      variant="outlined"
                      fullWidth
                      required
                      value={performer.name}
                      onChange={(e) =>
                        handleInputChange(index, 'performer', 'name', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'performer', 'name')}
                      onPaste={(e) => handlePaste(e, 'performer', 'name')}
                      error={Boolean(performersErrors[index]?.name)}
                      helperText={performersErrors[index]?.name}
                    />
                  </Grid>
                  {/* Performer Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Performer Email"
                      variant="outlined"
                      fullWidth
                      required
                      type="email"
                      value={performer.email}
                      onChange={(e) =>
                        handleInputChange(index, 'performer', 'email', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'performer', 'email')}
                      onPaste={(e) => handlePaste(e, 'performer', 'email')}
                      error={Boolean(performersErrors[index]?.email)}
                      helperText={performersErrors[index]?.email}
                    />
                  </Grid>
                  {/* Performer Phone Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Performer Phone Number"
                      variant="outlined"
                      fullWidth
                      required
                      type="tel"
                      value={performer.phone}
                      onChange={(e) =>
                        handleInputChange(index, 'performer', 'phone', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'performer', 'phone')}
                      onPaste={(e) => handlePaste(e, 'performer', 'phone')}
                      error={Boolean(performersErrors[index]?.phone)}
                      helperText={performersErrors[index]?.phone}
                    />
                  </Grid>
                  {/* Payment Amount */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Payment Amount ($)"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      value={performer.paymentAmount}
                      onChange={(e) =>
                        handleInputChange(index, 'performer', 'paymentAmount', e.target.value)
                      }
                      onKeyPress={(e) => handleKeyPress(e, 'performer', 'paymentAmount')}
                      onPaste={(e) => handlePaste(e, 'performer', 'paymentAmount')}
                      error={Boolean(performersErrors[index]?.paymentAmount)}
                      helperText={performersErrors[index]?.paymentAmount}
                    />
                  </Grid>
                  {/* Payment Status */}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth required>
                      <InputLabel id={`payment-status-label-performer-${index}`}>
                        Payment Status
                      </InputLabel>
                      <Select
                        labelId={`payment-status-label-performer-${index}`}
                        id={`payment-status-performer-${index}`}
                        value={performer.paymentStatus}
                        label="Payment Status"
                        onChange={(e) =>
                          handleInputChange(index, 'performer', 'paymentStatus', e.target.value)
                        }
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* Remove Button */}
                  <Grid item xs={12} sm={12}>
                    {performers.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleOpenConfirm('performer', index)}
                        aria-label="remove performer"
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={addPerformer}
              sx={{ mb: 3 }}
            >
              Add Performer
            </Button>

            {/* Submit Button */}
            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                disabled={
                  !selectedEvent ||
                  bands.some(
                    (band, index) =>
                      !band.name.trim() ||
                      !band.email.trim() ||
                      !band.phone.trim() ||
                      !band.paymentAmount.toString().trim() ||
                      bandsErrors[index].name ||
                      bandsErrors[index].email ||
                      bandsErrors[index].phone ||
                      bandsErrors[index].paymentAmount
                  ) ||
                  performers.some(
                    (performer, index) =>
                      !performer.name.trim() ||
                      !performer.email.trim() ||
                      !performer.phone.trim() ||
                      !performer.paymentAmount.toString().trim() ||
                      performersErrors[index].name ||
                      performersErrors[index].email ||
                      performersErrors[index].phone ||
                      performersErrors[index].paymentAmount
                  )
                }
              >
                Assign Bands and Performers
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Container>
  );
};

export default AssignBandsPerformers;
