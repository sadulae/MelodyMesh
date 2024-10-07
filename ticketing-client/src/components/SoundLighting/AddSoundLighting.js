import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Container,
  Grid,
  Checkbox,
  ListItemText,
} from '@mui/material';
import axios from 'axios';

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

const AddSoundLighting = () => {
  const [eventID, setEventID] = useState('');
  const [events, setEvents] = useState([]); // State to store events
  const [eventsWithDetails, setEventsWithDetails] = useState([]); // State for events with existing sound and lighting details
  const [soundProviderName, setSoundProviderName] = useState('');
  const [lightProviderName, setLightProviderName] = useState('');
  const [soundPhoneNumber, setSoundPhoneNumber] = useState('');
  const [lightPhoneNumber, setLightPhoneNumber] = useState('');
  const [soundEmail, setSoundEmail] = useState('');
  const [lightEmail, setLightEmail] = useState('');
  const [soundEquipment, setSoundEquipment] = useState([]);
  const [lightingEquipment, setLightingEquipment] = useState([]);
  const [soundEquipmentQuantities, setSoundEquipmentQuantities] = useState({});
  const [lightingEquipmentQuantities, setLightingEquipmentQuantities] = useState({});
  const [soundPayment, setSoundPayment] = useState('');
  const [lightPayment, setLightPayment] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Fetch events and existing sound/lighting details from the backend when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const eventsResponse = await axios.get(
          'http://localhost:5000/api/admin/organizer-events',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvents(eventsResponse.data); // Store fetched events

        const detailsResponse = await axios.get('http://localhost:5000/api/admin/sound-lighting', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Extract event IDs and ensure they are strings
        const eventIdsWithDetails = detailsResponse.data.map((detail) =>
          detail.eventID.toString()
        );
        setEventsWithDetails(eventIdsWithDetails); // Store event IDs that have sound and lighting details
      } catch (error) {
        console.error('Error fetching events or sound/lighting details:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload for the API request
    const payload = {
      eventID,
      soundProviderName,
      lightProviderName,
      soundPhoneNumber,
      lightPhoneNumber,
      soundEmail,
      lightEmail,
      soundEquipment: soundEquipment.map((equipmentName) => ({
        equipmentName,
        quantity: soundEquipmentQuantities[equipmentName] || 0,
      })),
      lightingEquipment: lightingEquipment.map((equipmentName) => ({
        equipmentName,
        quantity: lightingEquipmentQuantities[equipmentName] || 0,
      })),
      soundPayment,
      lightPayment,
      paymentStatus,
    };

    try {
      const token = localStorage.getItem('token'); // Get token from local storage
      const response = await axios.post(
        'http://localhost:5000/api/admin/sound-lighting',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        alert('Sound and lighting details added successfully!');
        // Reset the form if needed
      } else {
        alert('Failed to add sound and lighting details.');
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      alert('There was an error submitting the form.');
    }
  };

  const handleSoundEquipmentChange = (event) => {
    const {
      target: { value },
    } = event;
    setSoundEquipment(typeof value === 'string' ? value.split(',') : value);
  };

  const handleLightingEquipmentChange = (event) => {
    const {
      target: { value },
    } = event;
    setLightingEquipment(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSoundEquipmentQuantityChange = (equipment, quantity) => {
    setSoundEquipmentQuantities((prev) => ({
      ...prev,
      [equipment]: quantity,
    }));
  };

  const handleLightingEquipmentQuantityChange = (equipment, quantity) => {
    setLightingEquipmentQuantities((prev) => ({
      ...prev,
      [equipment]: quantity,
    }));
  };

  // Filter events to exclude those with existing details
  const availableEvents = events.filter(
    (event) => !eventsWithDetails.includes(event._id.toString())
  );

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Add Sound and Lighting Details
      </Typography>
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
            >
              {availableEvents.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sound and Lighting Provider Names */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sound Provider Name"
              value={soundProviderName}
              onChange={(e) => setSoundProviderName(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lighting Provider Name"
              value={lightProviderName}
              onChange={(e) => setLightProviderName(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Phone Numbers */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sound Provider Phone Number"
              value={soundPhoneNumber}
              onChange={(e) => setSoundPhoneNumber(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lighting Provider Phone Number"
              value={lightPhoneNumber}
              onChange={(e) => setLightPhoneNumber(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Emails */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sound Provider Email"
              type="email"
              value={soundEmail}
              onChange={(e) => setSoundEmail(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lighting Provider Email"
              type="email"
              value={lightEmail}
              onChange={(e) => setLightEmail(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Equipment Selections with Quantity */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Select Sound Equipment"
              value={soundEquipment}
              onChange={handleSoundEquipmentChange}
              fullWidth
              SelectProps={{
                multiple: true,
                renderValue: (selected) => selected.join(', '),
              }}
            >
              {soundEquipmentOptions.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  <Checkbox checked={soundEquipment.indexOf(option.name) > -1} />
                  <ListItemText primary={option.name} />
                </MenuItem>
              ))}
            </TextField>

            {/* Quantity for Selected Sound Equipment */}
            {soundEquipment.map((equipment) => (
              <Grid item xs={12} key={equipment}>
                <TextField
                  label={`Quantity for ${equipment}`}
                  type="number"
                  value={soundEquipmentQuantities[equipment] || ''}
                  onChange={(e) =>
                    handleSoundEquipmentQuantityChange(equipment, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Select Lighting Equipment"
              value={lightingEquipment}
              onChange={handleLightingEquipmentChange}
              fullWidth
              SelectProps={{
                multiple: true,
                renderValue: (selected) => selected.join(', '),
              }}
            >
              {lightingEquipmentOptions.map((option) => (
                <MenuItem key={option.id} value={option.name}>
                  <Checkbox checked={lightingEquipment.indexOf(option.name) > -1} />
                  <ListItemText primary={option.name} />
                </MenuItem>
              ))}
            </TextField>

            {/* Quantity for Selected Lighting Equipment */}
            {lightingEquipment.map((equipment) => (
              <Grid item xs={12} key={equipment}>
                <TextField
                  label={`Quantity for ${equipment}`}
                  type="number"
                  value={lightingEquipmentQuantities[equipment] || ''}
                  onChange={(e) =>
                    handleLightingEquipmentQuantityChange(equipment, e.target.value)
                  }
                  fullWidth
                />
              </Grid>
            ))}
          </Grid>

          {/* Payments */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sound Payment"
              type="number"
              value={soundPayment}
              onChange={(e) => setSoundPayment(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lighting Payment"
              type="number"
              value={lightPayment}
              onChange={(e) => setLightPayment(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12}>
            <TextField
              select
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Add Sound and Lighting Details
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddSoundLighting;
