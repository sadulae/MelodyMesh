// src/pages/Confirmation.js

import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home'); // Adjust the path as necessary
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Thank You for Your Purchase!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your tickets have been successfully booked.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={handleGoHome}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Confirmation;
