import React, { useState, useEffect } from 'react';
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
        const response = await axios.get(`http://localhost:5000/api/admin/bands-performers/${selectedEvent}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.bands.length > 0 || response.data.performers.length > 0) {
          setExistingDetails(true); // Event already has bands/performers
          setBands(response.data.bands.length > 0 ? response.data.bands : bands);
          setPerformers(response.data.performers.length > 0 ? response.data.performers : performers);
        } else {
          setExistingDetails(false); // No bands/performers found
          setBands([{ name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' }]);
          setPerformers([{ name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' }]);
        }
      } catch (error) {
        console.error('Error fetching existing bands and performers:', error);
        setExistingDetails(false); // Assume no details if there's an error
      }
    };

    fetchBandsPerformers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent]);

  // Handle adding a new band
  const addBand = () => {
    setBands([...bands, { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' }]);
  };

  // Handle adding a new performer
  const addPerformer = () => {
    setPerformers([
      ...performers,
      { name: '', email: '', phone: '', paymentAmount: '', paymentStatus: 'pending' },
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
    } else if (removeType === 'performer') {
      const updatedPerformers = performers.filter((_, i) => i !== removeIndex);
      setPerformers(updatedPerformers);
    }
    handleCloseConfirm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    for (let band of bands) {
      if (!band.name || !band.email || !band.phone || !band.paymentAmount) {
        setError('Please fill in all required fields for bands.');
        return;
      }
    }
    for (let performer of performers) {
      if (!performer.name || !performer.email || !performer.phone || !performer.paymentAmount) {
        setError('Please fill in all required fields for performers.');
        return;
      }
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
      setError('Failed to assign bands and performers. Please try again.');
      setSuccess('');
    }
  };

  // Handle input changes for bands and performers
  const handleInputChange = (index, type, field, value) => {
    if (type === 'band') {
      const updatedBands = [...bands];
      updatedBands[index][field] = value;
      setBands(updatedBands);
    } else if (type === 'performer') {
      const updatedPerformers = [...performers];
      updatedPerformers[index][field] = value;
      setPerformers(updatedPerformers);
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
                    />
                  </Grid>
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
                    />
                  </Grid>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Payment Amount"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      value={band.paymentAmount}
                      onChange={(e) =>
                        handleInputChange(index, 'band', 'paymentAmount', e.target.value)
                      }
                    />
                  </Grid>
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
                    />
                  </Grid>
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
                    />
                  </Grid>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Payment Amount"
                      variant="outlined"
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: "0", step: "0.01" }}
                      value={performer.paymentAmount}
                      onChange={(e) =>
                        handleInputChange(index, 'performer', 'paymentAmount', e.target.value)
                      }
                    />
                  </Grid>
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
              <Button type="submit" variant="contained" color="success" size="large">
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
