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
  MenuItem
} from '@mui/material';
import axios from 'axios';

const ManageVolunteers = () => {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editVolunteer, setEditVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');

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
    'Backstage Assistant'
  ]; // Roles for dropdown

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
        setLoading(false);
      }
    };

    fetchEventsAndVolunteers();
  }, []);

  const handleDelete = async (eventId, volunteerId) => {
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

      alert('Volunteer deleted successfully!');
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Error occurred while deleting volunteer.');
    }
  };

  const handleEdit = (volunteer) => {
    setEditVolunteer(volunteer);
    setOpen(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/admin/volunteers/${editVolunteer._id}`, editVolunteer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        alert('Volunteer updated successfully!');
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
      alert('Error occurred while updating volunteer.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditVolunteer((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  if (loading) {
    return <Typography>Loading...</Typography>;
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
          {editVolunteer && (
            <form>
              <TextField
                label="Name"
                name="name"
                value={editVolunteer.name || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="NIC"
                name="nic"
                value={editVolunteer.nic || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                select
                label="Gender"
                name="gender"
                value={editVolunteer.gender || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="preferNotToSay">Prefer not to mention</MenuItem>
              </TextField>
              <TextField
                select
                label="Role"
                name="role"
                value={editVolunteer.role || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Email"
                name="email"
                value={editVolunteer.email || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                name="phone"
                value={editVolunteer.phone || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageVolunteers;
