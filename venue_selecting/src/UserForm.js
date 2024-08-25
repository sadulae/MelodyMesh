import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import MapComponent from './MapComponent'; // Import the MapComponent



const UserForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    placeName: '',
    address: '',
    phone: '',
    email: '',
    photos: [],
    photoPreviews: [],
    category: '',
    capacity: '',
    customMessage: '',
    mapLocation: null,
  })

  const [formErrors, setFormErrors] = useState({});

  // Validation functions
  const validatePlaceName = (name) => {
    const sinhalaRegex = /^[A-Za-z\s\u0D80-\u0DFF]+$/;
    return sinhalaRegex.test(name);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{0,15}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valid = true;

    if (name === 'placeName' && !validatePlaceName(value)) {
      valid = false;
      setFormErrors({ ...formErrors, placeName: 'Place name must only contain valid letters (Sinhala allowed).' });
    } else if (name === 'phone' && !validatePhone(value)) {
      valid = false;
      setFormErrors({ ...formErrors, phone: 'Phone number must contain only digits (up to 15).' });
    } else if (name === 'email' && !validateEmail(value)) {
      valid = false;
      setFormErrors({ ...formErrors, email: 'Invalid email address format.' });
    } else {
      setFormErrors({ ...formErrors, [name]: '' });
    }

    if (valid) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 2 || files.length > 6) {
      setFormErrors({ ...formErrors, photos: 'Please select between 2 to 6 photos.' });
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setFormErrors({ ...formErrors, photos: 'Only JPEG, PNG, and WEBP formats are allowed.' });
        return;
      }
    }

    const photoPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
      photoPreviews: [...formData.photoPreviews, ...photoPreviews],
    });
    setFormErrors({ ...formErrors, photos: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that all required fields are filled out
    if (
      !formData.placeName ||
      !formData.address ||
      !formData.phone ||
      !formData.email ||
      !formData.category ||
      !formData.capacity ||
      !formData.customMessage ||
      formData.photos.length < 2
    ) {
      setFormErrors({ ...formErrors, submit: 'Please fill in all required fields correctly.' });
      return;
    }

    // Navigate to the DisplayPage and pass the formData
    navigate('/display', { state: { formData } });
  };

  return (

    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 4,
        borderRadius: 2,
        boxShadow: '0px 4px 10px black',
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Add Place Details
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
            error={!!formErrors.placeName}
            helperText={formErrors.placeName}
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
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <MenuItem value="Hotel">Hotel</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Park">Park</MenuItem>
              <MenuItem value="Mall">Mall</MenuItem>
              <MenuItem value="Garden">Garden</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset" required>
            <FormLabel component="legend">Capacity</FormLabel>
            <RadioGroup
              row
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              sx={{ border: '1px solid #ddd', borderRadius: 1, padding: 2 }}
            >
              <FormControlLabel value="1to20" control={<Radio />}label="1 to 20" />
              <FormControlLabel value="50to100" control={<Radio />} label="50 to 100" />
              <FormControlLabel value="100to500" control={<Radio />} label="100 to 500" />
              <FormControlLabel value="500to1000" control={<Radio />} label="500 to 1000" />
              <FormControlLabel value="1000+" control={<Radio />} label="1000+" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Custom Message"
            name="customMessage"
            value={formData.customMessage}
            onChange={handleChange}
            error={!!formErrors.customMessage}
            helperText={formErrors.customMessage}
            inputProps={{ maxLength: 150 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Select Location on Map:</Typography>
          <MapComponent />
        </Grid>
            <br /><br /><br />    
           <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
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
          {formErrors.photos && (
            <Typography color="error">{formErrors.photos}</Typography>
          )}
          <Grid container spacing={2} mt={2}>
            {formData.photoPreviews.map((preview, index) => (
              <Grid item xs={4} key={index}>
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  style={{
                    width: '100%',
                    height: '100px',
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
        {formErrors.submit && (
          <Grid item xs={12}>
            <Typography color="error" align="center">{formErrors.submit}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserForm;
