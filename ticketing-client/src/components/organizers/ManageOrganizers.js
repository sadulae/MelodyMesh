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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ManageOrganizers = () => {
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState({});
  const [loading, setLoading] = useState(true);
  const [editOrganizer, setEditOrganizer] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  
    if (name === 'organizerName') {
      const regex = /^[a-zA-Z\s]*$/; // Regex to allow only letters and spaces
      if (!regex.test(value)) {
        return; // If the value contains invalid characters, do not update the state
      }
  
      // Automatically capitalize the first letter of each word
      const capitalizedValue = value
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  
      setEditOrganizer((prev) => ({
        ...prev,
        [name]: capitalizedValue,
      }));
    } else if (name === 'organizerContact') {
      const contactRegex = /^[0-9]*$/; // Regex to allow only numbers
  
      // Check if the value is numeric and does not exceed ten digits
      if (contactRegex.test(value) && value.length <= 10) {
        setEditOrganizer((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (name === 'organizerEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for validating email

      // If the email format is invalid, do not update the state
      if (!emailRegex.test(value)) {
        return; // If the value contains invalid email format, do not update the state
      }
      setEditOrganizer((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      // For other fields, just update the value as usual
      setEditOrganizer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  // Function to generate PDF report
  const generateReport = () => {
    const doc = new jsPDF();

    // Add 'Melody Mesh' title
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(0, 0, 255); // Set text color to blue
    doc.text('Melody Mesh', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

    // Add contact details
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Set text color to black
    doc.setFontSize(10); // Set font size to smaller
    doc.text('Email: melodymeshevents@gmail.com', doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });
    doc.text('Contact No: 011 0203030', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFontSize(12); 
    doc.setFont('Helvetica', 'bold'); 
    doc.text('Organizer Report', 14, 30); 
    doc.setFont('Helvetica', 'normal'); 

    let startY = 40; 

    // Loop through each event and its organizers
    events.forEach((event) => {
      
      doc.text(`Event Name: ${event.eventName}`, 14, startY);
      
      const data = (organizers[event._id] || []).map((organizer) => ({
        Name: organizer.organizerName,
        Role: organizer.organizerRole,
        Contact: organizer.organizerContact,
        Email: organizer.organizerEmail,
        StartTime: new Date(organizer.startTime).toLocaleString(),
        EndTime: new Date(organizer.endTime).toLocaleString(),
      }));

      const columns = ['Name', 'Role', 'Contact', 'Email', 'Start Time', 'End Time'];
      const rows = data.map((item) => [
        item.Name,
        item.Role,
        item.Contact,
        item.Email,
        item.StartTime,
        item.EndTime,
      ]);

      const tableY = startY + 10;

      // Add the table
      doc.autoTable({
        head: [columns],
        body: rows,
        startY: tableY,
      });

      startY = doc.autoTable.previous.finalY + 15; 
    });

    doc.save('organizer_report.pdf');
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Organizers
      </Typography>
      <TextField
        label="Search Organizers"
        variant="outlined"
        onChange={handleSearchChange}
        fullWidth
        margin="normal"
      />

      <Button variant="contained" color="primary" onClick={generateReport}>
        Generate Report
      </Button>

      {events.map((event) => (
        <div key={event._id}>
          <Typography variant="h6" gutterBottom>
            {event.eventName}
          </Typography>

          {organizers[event._id] && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {filterOrganizers(organizers[event._id]).length > 0 ? (
    filterOrganizers(organizers[event._id]).map((organizer) => (
      <TableRow key={organizer._id}>
        <TableCell>{organizer.organizerName}</TableCell>
        <TableCell>{organizer.organizerRole}</TableCell>
        <TableCell>{organizer.organizerContact}</TableCell>
        <TableCell>{organizer.organizerEmail}</TableCell>
        <TableCell>{new Date(organizer.startTime).toLocaleString()}</TableCell>
        <TableCell>{new Date(organizer.endTime).toLocaleString()}</TableCell>
        <TableCell>
          <Button onClick={() => handleEdit(organizer)} variant="contained" color="primary" sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button onClick={() => handleDelete(event._id, organizer._id)} variant="contained" color="error" sx={{ mr: 1 }}>
            Delete
          </Button>
          <Button onClick={() => handleSendNotification(organizer)} variant="contained" color="default">
            Send Notification
          </Button>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} align="center">
        No matching item found
      </TableCell>
    </TableRow>
  )}
</TableBody>

              </Table>
            </TableContainer>
          )}
        </div>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Organizer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="organizerName"
            value={editOrganizer?.organizerName || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Role"
            name="organizerRole"
            value={editOrganizer?.organizerRole || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="organizerContact"
            value={editOrganizer?.organizerContact || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="organizerEmail"
            value={editOrganizer?.organizerEmail || ''}
            onChange={handleInputChange}
            fullWidth
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Time"
              value={editOrganizer?.startTime || null}
              onChange={(newValue) => setEditOrganizer((prev) => ({ ...prev, startTime: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DateTimePicker
              label="End Time"
              value={editOrganizer?.endTime || null}
              onChange={(newValue) => setEditOrganizer((prev) => ({ ...prev, endTime: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageOrganizers;
