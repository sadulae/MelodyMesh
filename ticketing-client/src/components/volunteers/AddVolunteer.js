// src/components/Admin/AddVolunteer.js

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Container,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const AddVolunteer = () => {
  const [eventID, setEventID] = useState('');
  const [events, setEvents] = useState([]); // State to store events
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [gender, setGender] = useState(''); // Gender state
  const [role, setRole] = useState(''); // Preferred role state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState([
    'Stage Manager',
    'Sound Engineer',
    'Lighting Technician',
    'Security',
    'Usher',
    'Front of House',
    'Artist Liaison',
    'Catering',
    'Ticketing',
    'Backstage Assistant',
  ]); // Example roles for dropdown

  const [errors, setErrors] = useState({}); // State for form errors
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Snackbar state
  const [loading, setLoading] = useState(false); // Loading state for form submission

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data); // Store fetched events
      } catch (error) {
        console.error('Error fetching events:', error);
        setSnackbar({ open: true, message: 'Failed to fetch events.', severity: 'error' });
      }
    };

    fetchEvents();
  }, []);

  // Regex Patterns for Validation
  const patterns = {
    name: /^[A-Za-z\s]+$/, // Only letters and spaces
    nicOld: /^\d{9}[VX]$/, // Old NIC: 9 digits followed by V or X
    nicNew: /^\d{12}$/, // New NIC: 12 digits
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Standard email format
    phone: /^\d{10}$/, // Exactly 10 digits
  };

  // Helper function to calculate age
  const calculateAge = (birthYear, birthMonth, birthDay) => {
    const today = new Date();
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate NIC and return an object with validity, age, gender
  const validateNIC = (nicInput) => {
    let isValid = false;
    let age = null;
    let derivedGender = '';
    let voterEligibility = '';

    if (patterns.nicOld.test(nicInput)) {
      // Old NIC
      const year = parseInt(nicInput.substring(0, 2), 10);
      const month = parseInt(nicInput.substring(2, 4), 10);
      const day = parseInt(nicInput.substring(4, 6), 10);
      const uniqueCode = parseInt(nicInput.substring(6, 9), 10);
      voterEligibility = nicInput.charAt(9);

      // Assuming year is between 1900 and 1999 for simplicity
      const fullYear = year >= 0 && year <= new Date().getFullYear() % 100 ? 2000 + year : 1900 + year;
      age = calculateAge(fullYear, month, day);

      if (uniqueCode < 500) {
        derivedGender = 'male';
      } else {
        derivedGender = 'female';
      }

      // Voter Eligibility for old NIC
      if (voterEligibility === 'V' || voterEligibility === 'X') {
        isValid = true;
      } else {
        isValid = false;
      }
    } else if (patterns.nicNew.test(nicInput)) {
      // New NIC
      const year = parseInt(nicInput.substring(0, 4), 10);
      const month = parseInt(nicInput.substring(4, 6), 10);
      const day = parseInt(nicInput.substring(6, 8), 10);
      const uniqueCode = parseInt(nicInput.substring(8, 11), 10);

      age = calculateAge(year, month, day);

      if (uniqueCode < 500) {
        derivedGender = 'male';
      } else {
        derivedGender = 'female';
      }

      // Voter Eligibility not allowed for new NIC
      isValid = true; // Since V and X are not allowed, any 12-digit number is considered valid
    } else {
      isValid = false;
    }

    return { isValid, age, derivedGender };
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update state based on input name
    switch (name) {
      case 'name':
        setName(value);
        if (!patterns.name.test(value)) {
          setErrors((prev) => ({ ...prev, name: 'Only letters and spaces are allowed.' }));
        } else {
          setErrors((prev) => ({ ...prev, name: '' }));
        }
        break;
      case 'nic':
        setNic(value.toUpperCase()); // Ensure NIC is uppercase
        const nicValidation = validateNIC(value.toUpperCase());
        if (!patterns.nicOld.test(value.toUpperCase()) && !patterns.nicNew.test(value.toUpperCase())) {
          setErrors((prev) => ({ ...prev, nic: 'Invalid NIC format.' }));
        } else if (nicValidation.isValid) {
          if (nicValidation.age < 18) {
            setErrors((prev) => ({ ...prev, nic: 'Volunteer must be at least 18 years old.' }));
          } else {
            setGender(nicValidation.derivedGender); // Automatically set gender based on NIC
            setErrors((prev) => ({ ...prev, nic: '' }));
          }
        } else {
          setErrors((prev) => ({ ...prev, nic: 'Invalid NIC format or voter eligibility.' }));
        }
        break;
      case 'gender':
        setGender(value);
        break;
      case 'role':
        setRole(value);
        break;
      case 'email':
        setEmail(value);
        if (!patterns.email.test(value)) {
          setErrors((prev) => ({ ...prev, email: 'Invalid email format.' }));
        } else {
          setErrors((prev) => ({ ...prev, email: '' }));
        }
        break;
      case 'phone':
        setPhone(value);
        if (!patterns.phone.test(value)) {
          setErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits.' }));
        } else {
          setErrors((prev) => ({ ...prev, phone: '' }));
        }
        break;
      default:
        break;
    }
  };

  // Prevent typing unwanted characters
  const handleKeyPress = (pattern) => (e) => {
    const regex = new RegExp(pattern);
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  // Prevent pasting unwanted characters
  const handlePaste = (pattern) => (e) => {
    const pasteData = e.clipboardData.getData('text');
    const regex = new RegExp(`^${pattern}$`);
    if (!regex.test(pasteData)) {
      e.preventDefault();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    const nicValidation = validateNIC(nic);
    if (!nicValidation.isValid) {
      setErrors((prev) => ({ ...prev, nic: 'Invalid NIC format or voter eligibility.' }));
      setSnackbar({ open: true, message: 'Please fix the NIC field errors.', severity: 'error' });
      return;
    }

    if (nicValidation.age < 18) {
      setErrors((prev) => ({ ...prev, nic: 'Volunteer must be at least 18 years old.' }));
      setSnackbar({ open: true, message: 'Volunteer must be at least 18 years old.', severity: 'error' });
      return;
    }

    if (!patterns.phone.test(phone)) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits.' }));
      setSnackbar({ open: true, message: 'Please fix the phone number field.', severity: 'error' });
      return;
    }

    // Check for any existing errors
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      setSnackbar({ open: true, message: 'Please fix the errors in the form.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Get token from local storage
      const payload = {
        eventID,
        name,
        nic,
        gender,
        role,
        email,
        phone,
      };

      const response = await axios.post('http://localhost:5000/api/admin/volunteers', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setSnackbar({ open: true, message: 'Volunteer details added successfully!', severity: 'success' });
        // Reset form fields
        setEventID('');
        setName('');
        setNic('');
        setGender('');
        setRole('');
        setEmail('');
        setPhone('');
        setErrors({});
      } else {
        setSnackbar({ open: true, message: 'Failed to add volunteer details.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      setSnackbar({ open: true, message: 'There was an error submitting the form.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>Add Volunteer Details</Typography>
      <form onSubmit={handleSubmit}>
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
              error={Boolean(errors.eventID)}
              helperText={errors.eventID}
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Name */}
          <Grid item xs={12}>
            <TextField
              label="Name"
              name="name"
              value={name}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(errors.name)}
              helperText={errors.name}
              onKeyPress={handleKeyPress(/[A-Za-z\s]/)}
              onPaste={handlePaste(/[A-Za-z\s]+/)}
            />
          </Grid>

          {/* NIC */}
          <Grid item xs={12}>
            <TextField
              label="NIC"
              name="nic"
              value={nic}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(errors.nic)}
              helperText={errors.nic}
              onKeyPress={handleKeyPress(/[0-9VX]/)}
              onPaste={handlePaste(/[0-9VX]+/)}
              inputProps={{ maxLength: 12 }}
            />
            <Typography variant="caption" color="textSecondary">
              Enter Old NIC (e.g., 790029871V) or New NIC (12 digits)
            </Typography>
          </Grid>

          {/* Gender */}
          <Grid item xs={12}>
            <TextField
              select
              label="Gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.gender)}
              helperText={errors.gender}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>

          {/* Preferred Role */}
          <Grid item xs={12}>
            <TextField
              select
              label="Preferred Role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              required
              error={Boolean(errors.role)}
              helperText={errors.role}
            >
              {roles.map((roleOption) => (
                <MenuItem key={roleOption} value={roleOption}>
                  {roleOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(errors.email)}
              helperText={errors.email}
              onPaste={handlePaste(/[^\s@]+@[^\s@]+\.[^\s@]+/)}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              name="phone"
              value={phone}
              onChange={handleInputChange}
              fullWidth
              required
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              onKeyPress={handleKeyPress(/\d/)}
              onPaste={handlePaste(/\d{10}/)}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={
                loading ||
                !eventID ||
                !name ||
                !nic ||
                !gender ||
                !role ||
                !email ||
                !phone ||
                Object.values(errors).some((error) => error)
              }
            >
              {loading ? 'Submitting...' : 'Add Volunteer'}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar for Notifications */}
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
    </Container>
  );
};

export default AddVolunteer;
