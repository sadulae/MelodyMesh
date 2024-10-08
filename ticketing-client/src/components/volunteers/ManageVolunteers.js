// src/components/Admin/ManageVolunteers.js

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs; // Set the virtual file system for pdfMake

const ManageVolunteers = () => {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editVolunteer, setEditVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const roles = [
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
  ];

  useEffect(() => {
    const fetchEventsAndVolunteers = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch events
        const eventsResponse = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(eventsResponse.data);

        // Initialize empty volunteersData
        const volunteersData = {};

        // Fetch volunteers for each event
        for (const event of eventsResponse.data) {
          try {
            const response = await axios.get(`http://localhost:5000/api/admin/volunteers/${event._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            volunteersData[event._id] = response.data;
          } catch (error) {
            volunteersData[event._id] = [];
          }
        }

        setVolunteers(volunteersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({ open: true, message: 'Failed to fetch data.', severity: 'error' });
        setLoading(false);
      }
    };

    fetchEventsAndVolunteers();
  }, []);

  // Regex Patterns for Validation
  const patterns = {
    name: /^[A-Za-z\s]+$/,
    nicOld: /^\d{9}[VX]$/,
    nicNew: /^\d{12}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{10}$/,
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
      const currentYear = new Date().getFullYear();
      const currentYearTwoDigits = currentYear % 100;
      const fullYear = year <= currentYearTwoDigits ? 2000 + year : 1900 + year;
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
      isValid = true;
    } else {
      isValid = false;
    }

    return { isValid, age, derivedGender };
  };

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update editVolunteer state
    setEditVolunteer((prev) => ({ ...prev, [name]: value }));

    // Validate the input
    let errorMsg = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMsg = 'Name is required.';
        } else if (!patterns.name.test(value)) {
          errorMsg = 'Only letters and spaces are allowed.';
        }
        break;
      case 'nic':
        const nicUpper = value.toUpperCase();
        if (!patterns.nicOld.test(nicUpper) && !patterns.nicNew.test(nicUpper)) {
          errorMsg = 'Invalid NIC format.';
        } else {
          const nicValidation = validateNIC(nicUpper);
          if (!nicValidation.isValid) {
            errorMsg = 'Invalid NIC format or voter eligibility.';
          } else if (nicValidation.age < 18) {
            errorMsg = 'Volunteer must be at least 18 years old.';
          }
        }
        break;
      case 'gender':
        if (!value) {
          errorMsg = 'Gender is required.';
        }
        break;
      case 'role':
        if (!value) {
          errorMsg = 'Role is required.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email is required.';
        } else if (!patterns.email.test(value)) {
          errorMsg = 'Invalid email format.';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errorMsg = 'Phone number is required.';
        } else if (!patterns.phone.test(value)) {
          errorMsg = 'Phone number must be exactly 10 digits.';
        }
        break;
      default:
        break;
    }

    // Update errors state
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
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

  const handleDelete = async (eventId, volunteerId) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/volunteers/${volunteerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the volunteers state after deletion
      setVolunteers((prevVolunteers) => ({
        ...prevVolunteers,
        [eventId]: prevVolunteers[eventId].filter((volunteer) => volunteer._id !== volunteerId),
      }));

      setSnackbar({ open: true, message: 'Volunteer deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      setSnackbar({ open: true, message: 'Error occurred while deleting volunteer.', severity: 'error' });
    }
  };

  const handleEdit = (volunteer) => {
    setEditVolunteer(volunteer);
    setOpen(true);
  };

  const handleUpdateSubmit = async () => {
    // Final validation before submission
    if (!editVolunteer.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Name is required.' }));
      setSnackbar({ open: true, message: 'Please fix the Name field.', severity: 'error' });
      return;
    }
    if (!editVolunteer.nic.trim()) {
      setErrors((prev) => ({ ...prev, nic: 'NIC is required.' }));
      setSnackbar({ open: true, message: 'Please fix the NIC field.', severity: 'error' });
      return;
    }
    if (!editVolunteer.gender) {
      setErrors((prev) => ({ ...prev, gender: 'Gender is required.' }));
      setSnackbar({ open: true, message: 'Please fix the Gender field.', severity: 'error' });
      return;
    }
    if (!editVolunteer.role) {
      setErrors((prev) => ({ ...prev, role: 'Role is required.' }));
      setSnackbar({ open: true, message: 'Please fix the Role field.', severity: 'error' });
      return;
    }
    if (!editVolunteer.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required.' }));
      setSnackbar({ open: true, message: 'Please fix the Email field.', severity: 'error' });
      return;
    }
    if (!editVolunteer.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number is required.' }));
      setSnackbar({ open: true, message: 'Please fix the Phone field.', severity: 'error' });
      return;
    }

    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      setSnackbar({ open: true, message: 'Please fix the errors in the form.', severity: 'error' });
      return;
    }

    // Additional NIC and age validation
    const nicValidation = validateNIC(editVolunteer.nic.toUpperCase());
    if (!nicValidation.isValid) {
      setErrors((prev) => ({ ...prev, nic: 'Invalid NIC format or voter eligibility.' }));
      setSnackbar({ open: true, message: 'Please fix the NIC field.', severity: 'error' });
      return;
    }
    if (nicValidation.age < 18) {
      setErrors((prev) => ({ ...prev, nic: 'Volunteer must be at least 18 years old.' }));
      setSnackbar({ open: true, message: 'Volunteer must be at least 18 years old.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/admin/volunteers/${editVolunteer._id}`, editVolunteer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Volunteer updated successfully!', severity: 'success' });
        setOpen(false);

        setVolunteers((prevVolunteers) => ({
          ...prevVolunteers,
          [editVolunteer.eventID]: prevVolunteers[editVolunteer.eventID].map((volunteer) =>
            volunteer._id === editVolunteer._id ? editVolunteer : volunteer
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
      setSnackbar({ open: true, message: 'Error occurred while updating volunteer.', severity: 'error' });
    } finally {
      setLoading(false);
      setEditVolunteer(null);
    }
  };

  const handleInputChangeEdit = (e) => {
    const { name, value } = e.target;

    // Update editVolunteer state
    setEditVolunteer((prev) => ({ ...prev, [name]: value }));

    // Validate the input
    let errorMsg = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          errorMsg = 'Name is required.';
        } else if (!patterns.name.test(value)) {
          errorMsg = 'Only letters and spaces are allowed.';
        }
        break;
      case 'nic':
        const nicUpper = value.toUpperCase();
        if (!patterns.nicOld.test(nicUpper) && !patterns.nicNew.test(nicUpper)) {
          errorMsg = 'Invalid NIC format.';
        } else {
          const nicValidation = validateNIC(nicUpper);
          if (!nicValidation.isValid) {
            errorMsg = 'Invalid NIC format or voter eligibility.';
          } else if (nicValidation.age < 18) {
            errorMsg = 'Volunteer must be at least 18 years old.';
          }
        }
        break;
      case 'gender':
        if (!value) {
          errorMsg = 'Gender is required.';
        }
        break;
      case 'role':
        if (!value) {
          errorMsg = 'Role is required.';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email is required.';
        } else if (!patterns.email.test(value)) {
          errorMsg = 'Invalid email format.';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errorMsg = 'Phone number is required.';
        } else if (!patterns.phone.test(value)) {
          errorMsg = 'Phone number must be exactly 10 digits.';
        }
        break;
      default:
        break;
    }

    // Update errors state
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSortChange = (e) => {
    setSortField(e.target.value);
  };

  const filterVolunteers = (volunteer) => {
    return (
      volunteer.name.toLowerCase().includes(searchTerm) ||
      volunteer.nic.toLowerCase().includes(searchTerm) ||
      volunteer.role.toLowerCase().includes(searchTerm) ||
      volunteer.email.toLowerCase().includes(searchTerm)
    );
  };

  const sortVolunteers = (a, b) => {
    const fieldA = a[sortField] ? a[sortField].toString().toLowerCase() : '';
    const fieldB = b[sortField] ? b[sortField].toString().toLowerCase() : '';

    if (fieldA < fieldB) return -1;
    if (fieldA > fieldB) return 1;
    return 0;
  };

  // Memoize the processed volunteers for each event
  const processedVolunteers = useMemo(() => {
    const result = {};
    events.forEach((event) => {
      const eventVolunteers = volunteers[event._id] || [];
      const filtered = eventVolunteers.filter(filterVolunteers);
      const sorted = filtered.slice().sort(sortVolunteers); // Create a copy before sorting
      result[event._id] = sorted;
    });
    return result;
  }, [events, volunteers, searchTerm, sortField]);

  // Function to generate PDF report
  const generatePdf = () => {
    const content = [];

    // Header with MelodyMesh and contact info
    content.push({
      columns: [
        {
          text: 'MelodyMesh',
          color: '#007BFF',
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
          x2: 770, // Adjusted for landscape orientation
          y2: 0,
          lineWidth: 1,
          lineColor: '#CED4DA',
        },
      ],
      margin: [0, 10, 0, 10],
    });

    events.forEach((event) => {
      content.push({
        text: `Event: ${event.eventName} (${new Date(event.eventDate).toLocaleDateString()})`,
        style: 'eventHeader',
        margin: [0, 20, 0, 10],
      });

      const eventVolunteers = processedVolunteers[event._id] || [];

      if (eventVolunteers.length > 0) {
        const tableBody = [
          [
            { text: 'Name', style: 'tableHeader' },
            { text: 'NIC', style: 'tableHeader' },
            { text: 'Gender', style: 'tableHeader' },
            { text: 'Role', style: 'tableHeader' },
            { text: 'Email', style: 'tableHeader' },
            { text: 'Phone', style: 'tableHeader' },
          ],
        ];

        eventVolunteers.forEach((volunteer) => {
          tableBody.push([
            volunteer.name,
            volunteer.nic,
            volunteer.gender,
            volunteer.role,
            volunteer.email,
            volunteer.phone,
          ]);
        });

        content.push({
          table: {
            headerRows: 1,
            widths: [100, 80, 60, 100, '*', 80], // Adjusted widths
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 15],
        });
      } else {
        content.push({
          text: 'No volunteers assigned to this event.',
          margin: [0, 0, 0, 10],
        });
      }

      // Divider line after each event
      content.push({
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 770, // Adjusted for landscape orientation
            y2: 0,
            lineWidth: 1,
            lineColor: '#CED4DA',
          },
        ],
        margin: [0, 10, 0, 10],
      });
    });

    const docDefinition = {
      pageOrientation: 'landscape', // Changed to landscape
      content,
      styles: {
        eventHeader: {
          fontSize: 16,
          bold: true,
          color: '#007BFF',
          margin: [0, 20, 0, 10],
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

    pdfMake.createPdf(docDefinition).download('volunteers_report.pdf');
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Manage Volunteers by Event
      </Typography>

      {/* Search and Sort Inputs */}
      <Box mb={4}>
        <TextField
          label="Search Volunteers"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Sort By"
          value={sortField}
          onChange={handleSortChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="nic">NIC</MenuItem>
          <MenuItem value="role">Role</MenuItem>
          <MenuItem value="email">Email</MenuItem>
        </TextField>

        {/* PDF Download Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={generatePdf}
          sx={{ mt: 2 }}
        >
          Download Volunteers Report
        </Button>
      </Box>

      {events.length === 0 ? (
        <Typography>No events found.</Typography>
      ) : (
        events.map((event) => (
          <div key={event._id}>
            <Typography variant="h6" gutterBottom>
              Event: {event.eventName} ({new Date(event.eventDate).toLocaleDateString()})
            </Typography>

            {processedVolunteers[event._id]?.length > 0 ? (
              <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>NIC</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processedVolunteers[event._id].map((volunteer) => (
                      <TableRow key={volunteer._id}>
                        <TableCell>{volunteer.name}</TableCell>
                        <TableCell>{volunteer.nic}</TableCell>
                        <TableCell>{volunteer.gender}</TableCell>
                        <TableCell>{volunteer.role}</TableCell>
                        <TableCell>{volunteer.email}</TableCell>
                        <TableCell>{volunteer.phone}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            style={{ marginRight: '10px' }}
                            onClick={() => handleEdit(volunteer)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDelete(event._id, volunteer._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box mb={4} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                <Typography>No volunteers assigned to this event.</Typography>
              </Box>
            )}
          </div>
        ))
      )}

      {/* Edit Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Volunteer Details</DialogTitle>
        <DialogContent>
          {editVolunteer ? (
            <form>
              {/* Name */}
              <TextField
                label="Name"
                name="name"
                value={editVolunteer.name || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.name)}
                helperText={errors.name}
                onKeyPress={handleKeyPress(/[A-Za-z\s]/)}
                onPaste={handlePaste(/[A-Za-z\s]+/)}
              />

              {/* NIC */}
              <TextField
                label="NIC"
                name="nic"
                value={editVolunteer.nic || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
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

              {/* Gender */}
              <TextField
                select
                label="Gender"
                name="gender"
                value={editVolunteer.gender || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.gender)}
                helperText={errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="preferNotToSay">Prefer not to mention</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>

              {/* Preferred Role */}
              <TextField
                select
                label="Preferred Role"
                name="role"
                value={editVolunteer.role || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
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

              {/* Email */}
              <TextField
                label="Email"
                name="email"
                type="email"
                value={editVolunteer.email || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.email)}
                helperText={errors.email}
                onPaste={handlePaste(/[^\s@]+@[^\s@]+\.[^\s@]+/)}
              />

              {/* Phone */}
              <TextField
                label="Phone Number"
                name="phone"
                value={editVolunteer.phone || ''}
                onChange={handleInputChangeEdit}
                fullWidth
                margin="normal"
                required
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                onKeyPress={handleKeyPress(/\d/)}
                onPaste={handlePaste(/\d{10}/)}
                inputProps={{ maxLength: 10 }}
              />
            </form>
          ) : (
            <Typography>No volunteer details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateSubmit}
            color="primary"
            variant="contained"
            disabled={
              loading ||
              !editVolunteer ||
              !editVolunteer.name ||
              !editVolunteer.nic ||
              !editVolunteer.gender ||
              !editVolunteer.role ||
              !editVolunteer.email ||
              !editVolunteer.phone ||
              Object.values(errors).some((error) => error)
            }
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ManageVolunteers;
