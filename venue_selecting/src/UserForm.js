import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Box, Stack, Typography, TextField, MenuItem, InputLabel, Select, FormControl, Button } from '@mui/material';
import axios from 'axios'; // Import axios for HTTP requests
import MapComponent from './MapComponent'; // Import the MapComponent
import { PhotoCamera } from '@mui/icons-material'; // Import the PhotoCamera icon

const UserForm = () => {
  const navigate = useNavigate();

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [formData, setFormData] = useState({
    placeName: '',
    address: '',
    phoneNum: '',
    email: '',
    category: '',
    photos: [],
    photoPreviews: [], // Ensure it's initialized
    latitude: '',
    longitude: '',
  });

  const handleRemoveImage = (index) => {
    const updatedPreviews = formData.photoPreviews.filter((_, i) => i !== index);
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photoPreviews: updatedPreviews, photos: updatedPhotos });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/submit', formData);
      console.log(response.data);
      navigate('/display', { state: { formData } });
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      placeName: '',
      address: '',
      phoneNum: '',
      email: '',
      category: '',
      photos: [],
      photoPreviews: [],
      latitude: '',
      longitude: '',
    });
  };

  return (
    <Box
      sx={{ mt: 5, mr: 5, ml: 5, mb: 5 }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {/* Title */}
          <Grid item xs={12}>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 'semibold',
                color: '#333',
                backgroundColor: '#FADCD9',
                padding: 2,
                borderRadius: 2,
              }}
            >
              Add Place Details
            </Typography>
          </Grid>

          {/* Form fields */}
          <Grid item xs={8} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="placeName"
                label="Place Name"
                value={formData.placeName}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 4, mt: 4 }}
              />
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 4 }}
              />
              <Stack direction="row">
                <TextField
                  name="phoneNum"
                  label="Phone Number"
                  value={formData.phoneNum}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 4 }}
                />
                <TextField
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 4, ml: 2 }}
                />
              </Stack>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="Hotel">Hotel</MenuItem>
                  <MenuItem value="Restaurant">Restaurant</MenuItem>
                  <MenuItem value="Park">Park</MenuItem>
                  <MenuItem value="Mall">Mall</MenuItem>
                  <MenuItem value="Garden">Garden</MenuItem>
                </Select>
              </FormControl>

              {/* Disabled Latitude and Longitude fields */}
              <TextField
                name="latitude"
                label="Latitude"
                value={latitude || formData.latitude}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 4 }}
                disabled
              />
              <TextField
                name="longitude"
                label="Longitude"
                value={longitude || formData.longitude}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 4 }}
                disabled
              />
            </Box>
          </Grid>

          {/* Map */}
          <Grid item xs={12} sm={6} mt={4}>
            <MapComponent setLatitude={setLatitude} setLongitude={setLongitude} />
          </Grid>
        </Grid>

          {/* Photo upload */}
          <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  marginTop: 2,
                  border: '2px dashed #FFA500',
                  borderRadius: 2.5,
                  padding: '12px 24px',
                  color: '#fff',
                  backgroundColor: '#FF9800',
                  '&:hover': {
                    background: 'linear-gradient(to right, #FFC107, #FF9800)',
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                value={formData.photos}
                onChange={handlePhotoChange}
              >
                Upload Photos
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  hidden
                  onChange={handlePhotoChange}
                />
              </Button>

              {/* Image Previews */}
              <Grid container spacing={2} mt={2} justifyContent="center">
                {formData.photoPreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: 10,
                          border: '2px solid #FFA500',
                          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          minWidth: 'auto',
                          padding: '4px',
                          borderRadius: '50%',
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        X
                      </Button>
                    </div>
                  </Grid>
                ))}
              </Grid>
      </Stack>

      {/* Submit and Reset buttons */}
      <Grid container justifyContent="center" mt={5} gap={3}>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          sx={{ ml: 1, mt: 2,
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
           }}
        >
          Submit
        </Button>
        <Button
          onClick={handleReset}
          variant="outlined"
          outlined
          sx={{ ml: 1, mt: 2, 
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          Reset
        </Button>
      </Grid>
    </Box>
  );
};

export default UserForm;
 