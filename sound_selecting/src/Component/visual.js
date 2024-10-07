import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SoundLightingForm = () => {
  const navigate = useNavigate();

  const equipmentOptions = [
    'Speakers', 'Microphones', 'Public Address System', 'Analog or Digital Mixers', 'Monitors', 'Power Amplifier', 'Equalizer',
    'Stage Boxes and Stage Snakes', 'Microphone Stands', 'Direct Input Boxes', 'Music Stand', 'Drum Riser', 'Instrument Tuners'
  ];

  const [formData, setFormData] = useState({
    providerName: '',
    phoneNumber: '',
    email: '',
    equipmentTypes: [],
    rate: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate input
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'providerName':
        if (!value) error = 'Provider Name is required';
        break;
      case 'phoneNumber':
        if (!value) error = 'Phone Number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone Number must be 10 digits';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email is invalid';
        break;
      case 'rate':
        if (!value) error = 'Rate is required';
        else if (isNaN(value) || value <= 0) error = 'Rate must be a positive number';
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleEquipmentChange = (event) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      equipmentTypes: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (errors[key]) newErrors[key] = errors[key];
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/submit', formData);
      console.log(response.data);
      navigate('/', { state: { formData } });
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      providerName: '',
      phoneNumber: '',
      email: '',
      equipmentTypes: [],
      rate: '',
    });
    setErrors({});
  };

  return (
    <div
      style={{
        backgroundImage: `url(${require('../Assets/broadcast.jpg')})`,
        backgroundSize: 'cover',
        height: '100vh',
        backgroundPosition: 'center',
        opacity: '1'
      }}
    >
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Box
          sx={{
            backgroundColor: '#eee',
            mt: 5,
            borderRadius: '20px',
            opacity: '0.95',
            fontWeight: 'bold',
          }}
        >
          <Typography variant="h4" align="center" p={5}>
            Visual Providers Details
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} p={5}>
              <Grid item xs={12}>
                <TextField
                  label="Provider Name"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.providerName}
                  helperText={errors.providerName}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Equipment Types</InputLabel>
                  <Select
                    name="equipmentTypes"
                    multiple
                    value={formData.equipmentTypes}
                    onChange={handleEquipmentChange}
                    input={<OutlinedInput label="Equipment Types" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {equipmentOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={formData.equipmentTypes.indexOf(type) > -1} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Rate per hour/day"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="number"
                  error={!!errors.rate}
                  helperText={errors.rate}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between">
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mr: 1 }}  // Add margin to the right of submit button
                  >
                    Submit
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outlined"
                    fullWidth
                    sx={{ ml: 1, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)' }}  // Add margin to the left of reset button
                  >
                    Reset
                  </Button>
                </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </div>
  );
};

export default SoundLightingForm;