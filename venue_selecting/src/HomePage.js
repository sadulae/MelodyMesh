// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, /*TextField,*/ IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const HomePage = () => {
  const navigate = useNavigate();

  // Sample data, you can replace this with actual data later
  const placeData = {
    placeName: 'SLIIT',
    phone: '123-456-7890',
    email: 'sliit@gmail.com',
  };

  const handleViewClick = () => {
    navigate('/display', { state: { formData: placeData } });
  };

  const handleAddPlaceClick = () => {
    // Navigate to your form page where you add a new place
    navigate('/add-place');
  };

  const handleUpdatePageClick = () => {
    // Navigate to your form page where you add a new place
    navigate('/update-place');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Home Page</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPlaceClick}
          sx={{ alignSelf: 'flex-end' }}
        >
          ADD PLACE
        </Button>
      </Box>

      <Box
        sx={{
          p: 2,
          border: '1px solid #ccc',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          boxShadow: '0px 4px 10px #f0f0f0',
          '&:hover':{
            opacity: 0.8,
            backgroundColor: '#eee'
          }
        }}
      >
        <Box>
          <Typography variant="body1">
            <strong>Place Name:</strong> {placeData.placeName}
          </Typography>
          <Typography variant="body1">
            <strong>Phone No.:</strong> {placeData.phone}
          </Typography>
          <Typography variant="body1">
            <strong>Email Address:</strong> {placeData.email}
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={handleViewClick}
          sx={{ marginLeft: 'auto' }}
        >
        <VisibilityIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={handleUpdatePageClick}
          sx={{p : 3
            
          }}
          >
          <EditIcon/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default HomePage;
