import React, { useState } from 'react';
import { Container, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import axios from 'axios';
import addYears from 'date-fns/addYears';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null); // Use null as the initial state for date
  const [location, setLocation] = useState('');
  const [tiers, setTiers] = useState([{ name: '', price: '', benefits: '' }]);
  const [poster, setPoster] = useState(null);
  const today = new Date();
  const maxDate = addYears(today, 5);

  const handleAddTier = () => {
    setTiers([...tiers, { name: '', price: '', benefits: '' }]);
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = tiers.slice();
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const handlePosterChange = (event) => {
    setPoster(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date.toISOString().slice(0, 10)); // Convert date to ISO string
    formData.append('location', location);
    formData.append('poster', poster);
    formData.append('tiers', JSON.stringify(tiers));

    try {
      await axios.post('http://localhost:5000/api/admin/add-event', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error.response ? error.response.data : error.message);
      alert('Failed to add event');
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="md" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}
    >
      <Typography variant="h5" color="primary" style={{ marginBottom: '20px' }}>
        Add Event
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', borderRadius: '15px', textAlign: 'center', width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                multiline
                rows={6} // Increase the number of rows for a larger text area
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="yyyy/MM/dd"
                minDate={today}
                maxDate={maxDate}
                placeholderText="Select a date"
                customInput={
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Date"
                    InputProps={{
                      style: { borderRadius: '10px' },
                      inputProps: { readOnly: true } // Prevent typing in the input field
                    }}
                  />
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  style: { borderRadius: '10px' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePosterChange} 
                style={{ 
                  display: 'block', 
                  margin: '10px auto', 
                  padding: '10px', 
                  borderRadius: '10px', 
                  border: '1px solid #ccc' 
                }} 
              />
            </Grid>
            {tiers.map((tier, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Tier Name"
                    value={tier.name}
                    onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                    InputProps={{
                      style: { borderRadius: '10px' }
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Price"
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                    InputProps={{
                      style: { borderRadius: '10px' }
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    label="Benefits"
                    value={tier.benefits}
                    onChange={(e) => handleTierChange(index, 'benefits', e.target.value)}
                    InputProps={{
                      style: { borderRadius: '10px' }
                    }}
                  />
                </Grid>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button 
                onClick={handleAddTier} 
                fullWidth 
                variant="outlined" 
                color="primary" 
                style={{ borderRadius: '10px' }}
              >
                Add Tier
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                color="primary" 
                style={{ borderRadius: '10px' }}
              >
                Add Event
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AdminPage;
