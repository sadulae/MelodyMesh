import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, OutlinedInput, Grid } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const SoundLightingForm = () => {
  const [providerName, setProviderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  // const [availability, setAvailability] = useState(null);
  const [rate, setRate] = useState('');

  const equipmentOptions = ['Speakers', 'Microphones', 'Public Address System', 'Analog or Digital Mixers', 'Monitors','Power Amplifier','Equalizer','Stage Boxes and Stage Snakes','Microphone Stands','Direct Input Boxes','Music Stand','Drum Riser','Instrument Tuners'];

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here, you can handle the form submission and send data to the backend or state
    const formData = {
      providerName,
      phoneNumber,
      email,
      equipmentTypes,
      rate,
    };
    console.log(formData);
  };

  // Get the current date to restrict past dates
  // const today = new Date();

  return (
    <div
      style={{backgroundImage: `url(${require('../Assets/broadcast.jpg')})`, backgroundSize: 'cover', height: '100vh', backgroundPosition: 'center', opacity: '1'}}
    >
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box mt={5}
         sx={{backgroundColor:'#eee', mt:5, borderRadius:'20px', opacity:'0.95', fontWeight:'bold'}}>
      <Typography
        variant="h4"
        align='center'
        p={5}
        >
        Visual Providers Details
        </Typography>
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} p={5}  >
        <Grid item xs={12}>
          <TextField
            label="Provider Name"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            fullWidth
            required
            fontWeight='bold'
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Equipment Types</InputLabel>
            <Select
              multiple
              value={equipmentTypes}
              onChange={(e) => setEquipmentTypes(e.target.value)}
              input={<OutlinedInput label="Equipment Types" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {equipmentOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={equipmentTypes.indexOf(type) > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Rate per hour/day"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            fullWidth
            required
            type="number"
          />
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth >
            Submit
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
