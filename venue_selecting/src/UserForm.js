// src/UserForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Grid, Typography, Box, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const UserForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    placeName: '',
    address: '',
    phone: '',
    email: '',
    photos: [],
    photoPreviews: [],
    category: '',  // New state for radio button
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const photoPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
      photoPreviews: [...formData.photoPreviews, ...photoPreviews],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to the DisplayPage and pass the formData
    navigate('/display', { state: { formData } });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Place Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Place Name"
            name="placeName"
            value={formData.placeName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>

        {/* Radio Button Group for Category */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Category</FormLabel>
            <RadioGroup
              row
              aria-label="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <FormControlLabel value="restaurant" control={<Radio />} label="Restaurant" />
              <FormControlLabel value="hotel" control={<Radio />} label="Hotel" />
              <FormControlLabel value="park" control={<Radio />} label="Park" />
              <FormControlLabel value="mall" control={<Radio />} label="Mall" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Upload Photos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePhotoChange}
            />
          </Button>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {formData.photoPreviews.map((preview, index) => (
              <Grid item key={index} xs={6} sm={4}>
                <img
                  src={preview}
                  alt={`Selected ${index + 1}`}
                  style={{
                    maxHeight: '100px',
                    maxWidth: '100%',
                    borderRadius: '5px',
                    objectFit: 'cover',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;
