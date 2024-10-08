import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Grid, MenuItem } from '@mui/material';
import axios from 'axios';

const AddSponsor = () => {
  const [sponsorName, setSponsorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [brandPoster, setBrandPoster] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [eventID, setEventID] = useState('');
  const [events, setEvents] = useState([]);

  const [errors, setErrors] = useState({});

  // Fetch events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handlePosterChange = (e) => {
    setBrandPoster(e.target.files[0]);
  };

  // Live Validation
  const validateSponsorName = (name) => {
    if (!/^[A-Za-z\s]+$/.test(name)) {
      setErrors((prevErrors) => ({ ...prevErrors, sponsorName: 'Sponsor name must contain only letters and spaces.' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, sponsorName: '' }));
    }
  };

  const validateContactPerson = (person) => {
    if (!/^[A-Za-z\s]+$/.test(person)) {
      setErrors((prevErrors) => ({ ...prevErrors, contactPerson: 'Contact person must contain only letters and spaces.' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, contactPerson: '' }));
    }
  };

  const validateContactNumber = (number) => {
    if (!/^07\d{8}$/.test(number)) {
      setErrors((prevErrors) => ({ ...prevErrors, contactNumber: 'Contact number must start with "07" and contain exactly 10 digits.' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, contactNumber: '' }));
    }
  };
  
  const validatePaymentAmount = (amount) => {
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || parseFloat(amount) < 0) {
      setErrors((prevErrors) => ({ ...prevErrors, paymentAmount: 'Payment amount must be a positive number.' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, paymentAmount: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some((error) => error)) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('sponsorName', sponsorName);
    formData.append('contactPerson', contactPerson);
    formData.append('contactEmail', contactEmail);
    formData.append('contactNumber', contactNumber);
    formData.append('brandInfo', brandInfo);
    formData.append('brandPoster', brandPoster);
    formData.append('paymentAmount', paymentAmount);
    formData.append('paymentStatus', paymentStatus);
    formData.append('eventID', eventID);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/sponsors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert('Sponsor added successfully!');
        // Clear the form
        setSponsorName('');
        setContactPerson('');
        setContactEmail('');
        setContactNumber('');
        setBrandInfo('');
        setBrandPoster(null);
        setPaymentAmount('');
        setPaymentStatus('');
        setEventID('');
      }
    } catch (error) {
      console.error('Error adding sponsor:', error.response?.data || error.message);
      alert('Error occurred while adding sponsor.');
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Add Sponsor
      </Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={2}>
          {/* Dropdown to select Event */}
          <Grid item xs={12}>
            <TextField
              select
              label="Select Event"
              value={eventID}
              onChange={(e) => setEventID(e.target.value)}
              fullWidth
              required
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sponsor Details */}
          <Grid item xs={12}>
          <TextField
  label="Sponsor Name"
  value={sponsorName}
  onChange={(e) => {
    setSponsorName(e.target.value);
    validateSponsorName(e.target.value);
  }}
  onKeyPress={(e) => {
    if (!/^[A-Za-z\s]*$/.test(e.key)) {
      e.preventDefault(); // Prevents typing of numbers or special characters
    }
  }}
  fullWidth
  required
  error={!!errors.sponsorName}
  helperText={errors.sponsorName}
/>
</Grid>

<Grid item xs={12}>
<TextField
  label="Contact Person"
  value={contactPerson}
  onChange={(e) => {
    setContactPerson(e.target.value);
    validateContactPerson(e.target.value);
  }}
  onKeyPress={(e) => {
    if (!/^[A-Za-z\s]*$/.test(e.key)) {
      e.preventDefault(); // Prevents typing of numbers or special characters
    }
  }}
  fullWidth
  required
  error={!!errors.contactPerson}
  helperText={errors.contactPerson}
/>
</Grid>

          

          <Grid item xs={12}>
            <TextField
              label="Contact Email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
  <TextField
    label="Contact Number"
    value={contactNumber}
    onChange={(e) => {
      const value = e.target.value;

      // Allow only numeric input
      if (/^\d*$/.test(value)) {
        setContactNumber(value);
      }

      // Only run validation if the value is more than 2 characters
      if (value.length >= 2) {
        validateContactNumber(value);
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          contactNumber: 'Contact number must start with "07" and be 10 digits long.',
        }));
      }
    }}
    fullWidth
    required
    error={!!errors.contactNumber}
    helperText={errors.contactNumber}
  />
</Grid>



          <Grid item xs={12}>
            <TextField
              label="Brand Info"
              value={brandInfo}
              onChange={(e) => setBrandInfo(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <input type="file" accept="image/*" onChange={handlePosterChange} required />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Payment Amount"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                validatePaymentAmount(e.target.value);
              }}
              fullWidth
              required
              error={!!errors.paymentAmount}
              helperText={errors.paymentAmount}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Sponsor
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddSponsor;
