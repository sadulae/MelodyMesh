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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const ManageSponsors = () => {
  const [events, setEvents] = useState([]); // Events data
  const [sponsors, setSponsors] = useState({}); // Sponsors data keyed by event ID
  const [loading, setLoading] = useState(true);
  const [editSponsor, setEditSponsor] = useState(null); // Sponsor details for editing
  const [openEditDialog, setOpenEditDialog] = useState(false); // Edit dialog state
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Snackbar for notifications
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, sponsor: null }); // Delete confirmation dialog

  useEffect(() => {
    const fetchEventsAndSponsors = async () => {
      const token = localStorage.getItem('token');
      try {
        const eventsResponse = await axios.get(
          'http://localhost:5000/api/admin/organizer-events',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(eventsResponse.data || []);

        // Fetch sponsors for each event
        const sponsorsData = {};
        for (const event of eventsResponse.data || []) {
          try {
            const response = await axios.get(
              `http://localhost:5000/api/admin/sponsors/${event._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            sponsorsData[event._id] = response.data || [];
          } catch (error) {
            console.error(`Error fetching sponsors for event ${event._id}:`, error);
            sponsorsData[event._id] = [];
          }
        }

        setSponsors(sponsorsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events and sponsors:', error);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Error fetching events and sponsors.',
          severity: 'error',
        });
      }
    };

    fetchEventsAndSponsors();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter sponsors based on search query
  const filterSponsors = (sponsorList = []) => {
    if (!searchQuery.trim()) return sponsorList;

    const query = searchQuery.toLowerCase();
    return sponsorList.filter(
      (sponsor) =>
        (sponsor.sponsorName && sponsor.sponsorName.toLowerCase().includes(query)) ||
        (sponsor.contactPerson && sponsor.contactPerson.toLowerCase().includes(query)) ||
        (sponsor.contactEmail && sponsor.contactEmail.toLowerCase().includes(query)) ||
        (sponsor.contactPhone && sponsor.contactPhone.toLowerCase().includes(query)) ||
        (sponsor.brandInfo && sponsor.brandInfo.toLowerCase().includes(query)) ||
        (sponsor.paymentStatus && sponsor.paymentStatus.toLowerCase().includes(query))
    );
  };

  // Compute filtered events based on search query
  const filteredEvents = events
    .map((event) => ({
      ...event,
      sponsors: filterSponsors(sponsors[event._id] || []),
    }))
    .filter((event) => event.sponsors.length > 0);

  // Handle Edit button click
  const handleEdit = (sponsor) => {
    setEditSponsor({ ...sponsor }); // Clone to avoid direct state mutation
    setOpenEditDialog(true);
  };

  // Handle input changes in the edit dialog
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditSponsor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Save button click in the edit dialog
  const handleUpdateSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/sponsors/${editSponsor._id}`,
        editSponsor,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update sponsors state with the edited sponsor
      setSponsors((prevSponsors) => ({
        ...prevSponsors,
        [editSponsor.eventID]: prevSponsors[editSponsor.eventID].map((sponsor) =>
          sponsor._id === editSponsor._id ? editSponsor : sponsor
        ),
      }));
      setSnackbar({ open: true, message: 'Sponsor updated successfully.', severity: 'success' });
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating sponsor:', error);
      setSnackbar({ open: true, message: 'Failed to update sponsor.', severity: 'error' });
    }
  };

  // Handle Delete button click
  const handleDelete = (sponsor) => {
    setConfirmDeleteDialog({ open: true, sponsor });
  };

  // Confirm Delete action
  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    const { sponsor } = confirmDeleteDialog;
    try {
      await axios.delete(`http://localhost:5000/api/admin/sponsors/${sponsor._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove sponsor from state
      setSponsors((prevSponsors) => ({
        ...prevSponsors,
        [sponsor.eventID]: prevSponsors[sponsor.eventID].filter((s) => s._id !== sponsor._id),
      }));
      setSnackbar({ open: true, message: 'Sponsor deleted successfully.', severity: 'success' });
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      setSnackbar({ open: true, message: 'Failed to delete sponsor.', severity: 'error' });
    }
    setConfirmDeleteDialog({ open: false, sponsor: null });
  };

  // Close Delete confirmation dialog
  const closeDeleteDialog = () => {
    setConfirmDeleteDialog({ open: false, sponsor: null });
  };

  // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Sponsors by Event
      </Typography>

      {/* Search Bar */}
      <Box mb={4}>
        <TextField
          label="Search Sponsors"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name, contact person, email, phone, brand info, or payment status"
        />
      </Box>

      {/* Determine what to render based on filtered events */}
      {filteredEvents.length === 0 ? (
        <Typography>No sponsors found.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <div key={event._id}>
            <Typography variant="h6" gutterBottom>
              Event: {event.eventName} ({new Date(event.eventDate).toLocaleDateString()})
            </Typography>

            {event.sponsors.length > 0 ? (
              <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sponsor Name</TableCell>
                      <TableCell>Contact Person</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Contact Number</TableCell>
                      <TableCell>Brand Info</TableCell>
                      <TableCell>Payment Amount</TableCell>
                      <TableCell>Payment Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {event.sponsors.map((sponsor) => (
                      <TableRow key={sponsor._id}>
                        <TableCell>{sponsor.sponsorName}</TableCell>
                        <TableCell>{sponsor.contactPerson}</TableCell>
                        <TableCell>{sponsor.contactEmail}</TableCell>
                        <TableCell>{sponsor.contactPhone}</TableCell>
                        <TableCell>{sponsor.brandInfo}</TableCell>
                        <TableCell>{sponsor.paymentAmount}</TableCell>
                        <TableCell>{sponsor.paymentStatus}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Sponsor">
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(sponsor)}
                              size="large"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Sponsor">
                            <IconButton
                              color="secondary"
                              onClick={() => handleDelete(sponsor)}
                              size="large"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                mb={4}
                p={2}
                border={1}
                borderColor="grey.300"
                borderRadius={4}
                bgcolor="grey.100"
              >
                <Typography>No sponsors assigned to this event.</Typography>
              </Box>
            )}
          </div>
        ))
      )}

      {/* Edit Sponsor Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Sponsor Details</DialogTitle>
        <DialogContent>
          {editSponsor && (
            <form>
              <TextField
                label="Sponsor Name"
                name="sponsorName"
                value={editSponsor.sponsorName || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Contact Person"
                name="contactPerson"
                value={editSponsor.contactPerson || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="contactEmail"
                value={editSponsor.contactEmail || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Contact Number"
                name="contactPhone"
                value={editSponsor.contactPhone || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Brand Info"
                name="brandInfo"
                value={editSponsor.brandInfo || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                minRows={2}
              />
              <TextField
                label="Payment Amount"
                name="paymentAmount"
                type="number"
                value={editSponsor.paymentAmount || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Payment Status"
                name="paymentStatus"
                value={editSponsor.paymentStatus || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                select
                SelectProps={{ native: true }}
              >
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
                <option value="Overdue">Overdue</option>
              </TextField>
              <TextField
                label="Notes"
                name="notes"
                value={editSponsor.notes || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                minRows={2}
              />
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete sponsor "{confirmDeleteDialog.sponsor?.sponsorName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="secondary"
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

export default ManageSponsors;