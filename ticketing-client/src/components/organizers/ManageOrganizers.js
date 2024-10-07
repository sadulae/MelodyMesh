import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const ManageOrganizers = () => {
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState({});
  const [loading, setLoading] = useState(true);
  const [editOrganizer, setEditOrganizer] = useState(null); // Organizer details for editing
  const [open, setOpen] = useState(false); // Modal state
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    const fetchEventsAndOrganizers = async () => {
      const token = localStorage.getItem('token');
      try {
        const eventsResponse = await axios.get('http://localhost:5000/api/admin/organizer-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(eventsResponse.data);

        const organizerData = {};
        for (const event of eventsResponse.data) {
          try {
            const response = await axios.get(`http://localhost:5000/api/admin/organizers/${event._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            organizerData[event._id] = response.data;
          } catch (error) {
            organizerData[event._id] = [];
          }
        }

        setOrganizers(organizerData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchEventsAndOrganizers();
  }, []);

  const handleDelete = async (eventId, organizerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/organizers/${organizerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrganizers((prevOrganizers) => ({
        ...prevOrganizers,
        [eventId]: prevOrganizers[eventId].filter((organizer) => organizer._id !== organizerId),
      }));

      alert('Organizer deleted successfully!');
    } catch (error) {
      console.error('Error deleting organizer:', error);
      alert('Error occurred while deleting organizer.');
    }
  };

  const handleEdit = (organizer) => {
    setEditOrganizer(organizer);
    setOpen(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/admin/organizers/${editOrganizer._id}`, editOrganizer, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert('Organizer updated successfully!');
        setOpen(false);

        setOrganizers((prevOrganizers) => ({
          ...prevOrganizers,
          [editOrganizer.eventID]: prevOrganizers[editOrganizer.eventID].map((organizer) =>
            organizer._id === editOrganizer._id ? editOrganizer : organizer
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating organizer:', error);
      alert('Error occurred while updating organizer.');
    }
  };

  const handleSendNotification = async (organizer) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        organizerEmail: organizer.organizerEmail,
        organizerName: organizer.organizerName,
        organizerRole: organizer.organizerRole,
        eventID: organizer.eventID,
        startTime: organizer.startTime,
        endTime: organizer.endTime,
      };

      await axios.post(`http://localhost:5000/api/admin/organizers/send-notification`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Notification sent to organizer successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error occurred while sending notification.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditOrganizer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to filter organizers based on search query
  const filterOrganizers = (organizerList) => {
    if (!searchQuery.trim()) return organizerList;

    const query = searchQuery.toLowerCase();
    return organizerList.filter(
      (organizer) =>
        (organizer.organizerName && organizer.organizerName.toLowerCase().includes(query)) ||
        (organizer.organizerEmail && organizer.organizerEmail.toLowerCase().includes(query)) ||
        (organizer.organizerRole && organizer.organizerRole.toLowerCase().includes(query)) ||
        (organizer.organizerContact && organizer.organizerContact.toLowerCase().includes(query))
    );
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Manage Organizers by Event
      </Typography>

      {/* Search Bar */}
      <Box mb={4}>
        <TextField
          label="Search Organizers"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, email, role, or contact"
        />
      </Box>

      {events.length === 0 ? (
        <Typography>No events found.</Typography>
      ) : (
        events.map((event) => {
          // Filter organizers for the current event based on search query
          const filteredOrganizers = filterOrganizers(organizers[event._id]);

          // If there's a search query and no organizers match for this event, skip rendering this event
          if (searchQuery.trim() && filteredOrganizers.length === 0) {
            return null;
          }

          return (
            <div key={event._id}>
              <Typography variant="h6" gutterBottom>
                Event: {event.eventName} ({new Date(event.eventDate).toLocaleDateString()})
              </Typography>

              {filteredOrganizers.length > 0 ? (
                <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Organizer Name</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrganizers.map((organizer) => (
                        <TableRow key={organizer._id}>
                          <TableCell>{organizer.organizerName}</TableCell>
                          <TableCell>{organizer.organizerRole}</TableCell>
                          <TableCell>{organizer.organizerContact}</TableCell>
                          <TableCell>{organizer.organizerEmail}</TableCell>
                          <TableCell>
                            {new Date(organizer.startTime).toLocaleTimeString()} -{' '}
                            {new Date(organizer.endTime).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              style={{ marginRight: '10px' }}
                              onClick={() => handleEdit(organizer)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              style={{ marginRight: '10px' }}
                              onClick={() => handleDelete(event._id, organizer._id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="contained"
                              color="default"
                              onClick={() => handleSendNotification(organizer)}
                            >
                              Send Notification
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box mb={4} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                  <Typography>No organizers assigned to this event.</Typography>
                </Box>
              )}
            </div>
          );
        })
      )}

      {/* Edit Organizer Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Organizer Details</DialogTitle>
        <DialogContent>
          {editOrganizer && (
            <form>
              <TextField
                label="Organizer Name"
                name="organizerName"
                value={editOrganizer.organizerName || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Role"
                name="organizerRole"
                value={editOrganizer.organizerRole || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Contact"
                name="organizerContact"
                value={editOrganizer.organizerContact || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="organizerEmail"
                value={editOrganizer.organizerEmail || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={editOrganizer.startTime}
                  onChange={(newValue) =>
                    setEditOrganizer((prev) => ({ ...prev, startTime: newValue }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
                <DateTimePicker
                  label="End Time"
                  value={editOrganizer.endTime}
                  onChange={(newValue) =>
                    setEditOrganizer((prev) => ({ ...prev, endTime: newValue }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </LocalizationProvider>
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

export default ManageOrganizers;
