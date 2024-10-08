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
import jsPDF from 'jspdf';  // Import jsPDF for PDF generation
import 'jspdf-autotable'; // Import the autoTable plugin for jsPDF

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

  const generateReport = () => {
    const doc = new jsPDF();
  
    // Add logo image
    const logoImg = new Image();
    logoImg.src = '/logom.png'; // Path to your logo
  
    logoImg.onload = () => {
      // Add the logo to the document (top right corner)
      doc.addImage(logoImg, 'PNG', 160, 10, 30, 30); // Adjust dimensions as needed
  
      // Example title
      doc.setFontSize(18);
      doc.text('Sponsors Report', 14, 20);
  
      // Add date to the report
      const date = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.text(`Date: ${date}`, 14, 30);
  
      // Prepare the data for the report
      const reportData = [];
      filteredEvents.forEach(event => {
        event.sponsors.forEach(sponsor => {
          reportData.push({
            Event: event.eventName,
            'Sponsor Name': sponsor.sponsorName,
            'Contact Person': sponsor.contactPerson,
            Email: sponsor.contactEmail,
            'Contact Number': sponsor.contactPhone,
            'Brand Info': sponsor.brandInfo,
            'Payment Amount': sponsor.paymentAmount,
            'Payment Status': sponsor.paymentStatus,
          });
        });
      });
  
      // Generate a table
      doc.autoTable({
        head: [['Event', 'Sponsor Name',  'Contact Number',  'Payment Amount', 'Payment Status']],
        body: reportData.map(item => [
          item.Event,
          item['Sponsor Name'],
          item['Contact Person'],
          // item.Email,
          item['Contact Number'],
          // item['Brand Info'],
          item['Payment Amount'],
          item['Payment Status']
        ]),
        startY: 40, // Start below the title and date
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'center', // Center text in cells
        },
        headStyles: {
          fillColor: [0, 51, 102], // Dark Blue
          textColor: [255, 255, 255], // White
          fontSize: 12,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light Gray
        },
      });
  
      // Add footer
      const footerY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text('Generated by Melody Mesh', 14, footerY);
      doc.text(`Contact: melodymesh@gmail.com`, 14, footerY + 5);
  
      // Save the generated PDF to the user's computer
      doc.save('sponsors-report.pdf');
    };
  
    // Trigger the logo load
    logoImg.onerror = () => {
      console.error("Logo image could not be loaded.");
    };
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

      {/* Generate Report Button */}
      <Button
        variant="contained"
        color="success"
        onClick={generateReport}
        style={{ marginBottom: '20px' }} // Space below the button
      >
        Generate Report
      </Button>

      {/* Event and Sponsor List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Sponsor Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Brand Info</TableCell>
              <TableCell>Payment Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) =>
              event.sponsors.map((sponsor) => (
                <TableRow key={sponsor._id}>
                  <TableCell>{event.eventName}</TableCell>
                  <TableCell>{sponsor.sponsorName}</TableCell>
                  <TableCell>{sponsor.contactPerson}</TableCell>
                  <TableCell>{sponsor.contactEmail}</TableCell>
                  <TableCell>{sponsor.contactPhone}</TableCell>
                  <TableCell>{sponsor.brandInfo}</TableCell>
                  <TableCell>{sponsor.paymentAmount}</TableCell>
                  <TableCell>{sponsor.paymentStatus}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(sponsor)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(sponsor)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Sponsor Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Sponsor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sponsor Name"
            type="text"
            fullWidth
            name="sponsorName"
            value={editSponsor?.sponsorName || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Contact Person"
            type="text"
            fullWidth
            name="contactPerson"
            value={editSponsor?.contactPerson || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Contact Email"
            type="email"
            fullWidth
            name="contactEmail"
            value={editSponsor?.contactEmail || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Contact Phone"
            type="text"
            fullWidth
            name="contactPhone"
            value={editSponsor?.contactPhone || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Brand Info"
            type="text"
            fullWidth
            name="brandInfo"
            value={editSponsor?.brandInfo || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Payment Amount"
            type="number"
            fullWidth
            name="paymentAmount"
            value={editSponsor?.paymentAmount || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Payment Status"
            type="text"
            fullWidth
            name="paymentStatus"
            value={editSponsor?.paymentStatus || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this sponsor?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageSponsors;
