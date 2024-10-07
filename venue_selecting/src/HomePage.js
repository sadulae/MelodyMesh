// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Typography, /*TextField, IconButton*/ } from '@mui/material';
import Read from './Read'
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import EditIcon from '@mui/icons-material/Edit';

const HomePage = () => {
  const navigate = useNavigate();

  // Sample data, you can replace this with actual data later
//   const placeData = {
//     placeName: 'SLIIT',
//     phone: '123-456-7890',
//     email: 'sliit@gmail.com',
//   };


  const handleAddPlaceClick = () => {
    // Navigate to your form page where you add a new place
    navigate('/add-place');
  };

  return (
    <Box sx={{ p: 3, width:"80%", mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Venue Details</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPlaceClick}
          sx={{ alignSelf: 'flex-end' }}
        >
          ADD PLACE
        </Button>
      </Box>
      <hr /> 

      <Grid item xs={12} sm={6}>
        <Read />
      </Grid>
    </Box>
  );
};

export default HomePage;
