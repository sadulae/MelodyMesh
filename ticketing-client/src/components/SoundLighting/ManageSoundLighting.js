import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Container,
  CircularProgress,
  Grid,
  TextField,
  Checkbox,
  MenuItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import axios from 'axios';

// Equipment options
const soundEquipmentOptions = [
  { name: 'Speakers', id: 'speakers' },
  { name: 'Microphones', id: 'microphones' },
  { name: 'Amplifiers', id: 'amplifiers' },
  { name: 'Mixing Console', id: 'mixing-console' },
  { name: 'Subwoofers', id: 'subwoofers' },
  { name: 'Equalizers', id: 'equalizers' },
  { name: 'Wireless Microphones', id: 'wireless-microphones' },
];

const lightingEquipmentOptions = [
  { name: 'LED Lights', id: 'led-lights' },
  { name: 'Spotlights', id: 'spotlights' },
  { name: 'Stage Lighting', id: 'stage-lighting' },
  { name: 'Flood Lights', id: 'flood-lights' },
  { name: 'Lasers', id: 'lasers' },
  { name: 'Strobes', id: 'strobes' },
  { name: 'Fog Machines', id: 'fog-machines' },
  { name: 'Uplights', id: 'uplights' },
];

const ManageSoundLighting = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editSoundLighting, setEditSoundLighting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);  // To check if no sound and lighting details exist

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

  const fetchSoundLightingData = async (eventId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/admin/sound-lighting/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      if (data && data.length > 0) {
        const soundEquipmentQuantities = {};
        const selectedSoundEquipment = [];
        data[0].soundEquipment.forEach((item) => {
          selectedSoundEquipment.push(item.equipmentName);
          soundEquipmentQuantities[item.equipmentName] = item.quantity;
        });

        const lightingEquipmentQuantities = {};
        const selectedLightingEquipment = [];
        data[0].lightingEquipment.forEach((item) => {
          selectedLightingEquipment.push(item.equipmentName);
          lightingEquipmentQuantities[item.equipmentName] = item.quantity;
        });

        setEditSoundLighting({
          ...data[0],
          soundEquipment: selectedSoundEquipment,
          lightingEquipment: selectedLightingEquipment,
          soundEquipmentQuantities,
          lightingEquipmentQuantities,
        });
        setIsEmpty(false); // Data found, not empty
      } else {
        setEditSoundLighting(null);
        setIsEmpty(true); // No data found, mark as empty
      }
      setOpen(true);
    } catch (error) {
      console.error('Error fetching sound and lighting data:', error);
      setEditSoundLighting(null);
      setIsEmpty(true); // Mark as empty when error occurs
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSoundLighting = (event) => {
    setSelectedEvent(event);
    fetchSoundLightingData(event._id);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...editSoundLighting,
        soundEquipment: editSoundLighting.soundEquipment.map((name) => ({
          equipmentName: name,
          quantity: editSoundLighting.soundEquipmentQuantities[name] || 0,
        })),
        lightingEquipment: editSoundLighting.lightingEquipment.map((name) => ({
          equipmentName: name,
          quantity: editSoundLighting.lightingEquipmentQuantities[name] || 0,
        })),
      };
  
      if (editSoundLighting._id) {
        // Update existing details (PUT request)
        await axios.put(
          `http://localhost:5000/api/admin/sound-lighting/${editSoundLighting._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert('Sound and lighting details updated successfully!');
      } else {
        // Create new details (POST request)
        await axios.post(`http://localhost:5000/api/admin/sound-lighting`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Sound and lighting details created successfully!');
      }
      setOpen(false);
    } catch (error) {
      console.error('Error updating sound and lighting data:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/sound-lighting/${editSoundLighting._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Sound and lighting details deleted successfully!');
      setOpen(false);
    } catch (error) {
      console.error('Error deleting sound and lighting data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditSoundLighting((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (event, field) => {
    const {
      target: { value },
    } = event;
    setEditSoundLighting((prev) => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleQuantityChange = (equipment, field, quantity) => {
    setEditSoundLighting((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [equipment]: quantity,
      },
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Manage Sound and Lighting Providers
      </Typography>

      <TextField
        label="Search Event"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} key={event._id}>
                <Box padding={2}>
                  <Typography variant="h6">{event.eventName}</Typography>
                  <Typography>{new Date(event.eventDate).toLocaleDateString()}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleManageSoundLighting(event)}
                  >
                    Manage Sound & Lighting
                  </Button>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography>No events found.</Typography>
          )}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Sound and Lighting Details</DialogTitle>
        <DialogContent>
          {isEmpty ? (
            <Typography variant="body1" color="textSecondary">
              No sound and lighting details found for this event. Please add new details.
            </Typography>
          ) : (
            <form onSubmit={handleUpdateSubmit}>
              {/* General Info */}
              <TextField
                label="Sound Provider Name"
                name="soundProviderName"
                value={editSoundLighting?.soundProviderName || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Lighting Provider Name"
                name="lightProviderName"
                value={editSoundLighting?.lightProviderName || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Sound Provider Phone Number"
                name="soundPhoneNumber"
                value={editSoundLighting?.soundPhoneNumber || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Lighting Provider Phone Number"
                name="lightPhoneNumber"
                value={editSoundLighting?.lightPhoneNumber || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Sound Provider Email"
                name="soundEmail"
                value={editSoundLighting?.soundEmail || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Lighting Provider Email"
                name="lightEmail"
                value={editSoundLighting?.lightEmail || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />

              {/* Equipment Selections */}
              <Typography variant="subtitle1" gutterBottom>
                Sound Equipment
              </Typography>
              <TextField
                select
                label="Select Sound Equipment"
                value={editSoundLighting?.soundEquipment || []}
                onChange={(e) => handleEquipmentChange(e, 'soundEquipment')}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => selected.join(', '), // Render selected items correctly
                }}
              >
                {soundEquipmentOptions.map((option) => (
                  <MenuItem key={option.id} value={option.name}>
                    <Checkbox
                      checked={editSoundLighting?.soundEquipment?.indexOf(option.name) > -1}
                    />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </TextField>
              {editSoundLighting?.soundEquipment?.map((equipment) => (
                <TextField
                  key={equipment}
                  label={`Quantity for ${equipment}`}
                  type="number"
                  value={editSoundLighting?.soundEquipmentQuantities?.[equipment] || ''}
                  onChange={(e) =>
                    handleQuantityChange(equipment, 'soundEquipmentQuantities', e.target.value)
                  }
                  fullWidth
                  margin="normal"
                />
              ))}

              <Typography variant="subtitle1" gutterBottom>
                Lighting Equipment
              </Typography>
              <TextField
                select
                label="Select Lighting Equipment"
                value={editSoundLighting?.lightingEquipment || []}
                onChange={(e) => handleEquipmentChange(e, 'lightingEquipment')}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => selected.join(', '), // Render selected items correctly
                }}
              >
                {lightingEquipmentOptions.map((option) => (
                  <MenuItem key={option.id} value={option.name}>
                    <Checkbox
                      checked={editSoundLighting?.lightingEquipment?.indexOf(option.name) > -1}
                    />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </TextField>
              {editSoundLighting?.lightingEquipment?.map((equipment) => (
                <TextField
                  key={equipment}
                  label={`Quantity for ${equipment}`}
                  type="number"
                  value={editSoundLighting?.lightingEquipmentQuantities?.[equipment] || ''}
                  onChange={(e) =>
                    handleQuantityChange(equipment, 'lightingEquipmentQuantities', e.target.value)
                  }
                  fullWidth
                  margin="normal"
                />
              ))}

              {/* Payments */}
              <TextField
                label="Sound Payment"
                name="soundPayment"
                value={editSoundLighting?.soundPayment || ''}
                onChange={handleInputChange}
                type="number"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Lighting Payment"
                name="lightPayment"
                value={editSoundLighting?.lightPayment || ''}
                onChange={handleInputChange}
                type="number"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                select
                label="Payment Status"
                name="paymentStatus"
                value={editSoundLighting?.paymentStatus || 'pending'}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>

              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" color="primary" variant="contained">
                  Update
                </Button>
                <Button
                  onClick={handleDelete}
                  color="secondary"
                  variant="contained"
                  style={{ marginLeft: '10px' }}
                >
                  Delete
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ManageSoundLighting;
