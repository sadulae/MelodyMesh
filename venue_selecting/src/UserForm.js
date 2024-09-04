import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Typography, TextField, MenuItem, InputLabel, Select, FormControl, Button} from '@mui/material';
import MapComponent from './MapComponent';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';
//import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const UserForm = () => {

  const navigate = useNavigate();

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

  const [formData, setFormData] = useState({
    placeName: '', 
    address: '',  
    phoneNum: '',
    email: '',
    category: '',
    photos: [],
    photoPreviews: [],
    mapLocation: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  const handleReset = () => {
    setFormData({
      placeName: '',
      address: '',
      phoneNum: '',
      email: '',
      category: '',
      photos: [],
      photoPreviews: [],
      mapLocation: null,
    });
  };

  return (
    <Box sx={{ mt: 5, mr: 5, ml: 5, mb: 5 }}
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
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: '#FADCD9',
                padding: 2,
                borderRadius: 2,
              }}
            >
              Add Place Details
            </Typography>
          </Grid>

          {/* Text Fields aligned to the left */}
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
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{
                  marginTop: 2,
                  border: '2px dashed #FFA500',
                  borderRadius: 2.5,
                  padding: '10px 20px',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(to right, #FFC107, #FF9800)',
                  },
                }}
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
              <Grid container spacing={2} mt={2} justifyContent="center">
                {formData.photoPreviews.map((preview, index) => (
                  <Grid item xs={4} sm={2} key={index}>
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: 5,
                        border: '1px solid #ccc',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Map aligned to the right */}
          <Grid item xs={12} sm={6}>
            <MapComponent />
            <Typography variant="h6" align="center">
              Select Location on Map
            </Typography>
          </Grid>
        </Grid>
      </Stack>

      <Grid item xs={12} sx={{ textAlign: 'right', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            marginRight: 2,
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(to right, #FFC107, #FF9800)',
            },
          }}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            '&:hover': {
              background: 'linear-gradient(to right, #FFC107, #FF9800)',
              borderColor: '#FF9800',
            },
          }}
        >
          Reset
        </Button>
      </Grid>
    </Box>
  );
};

export default UserForm;