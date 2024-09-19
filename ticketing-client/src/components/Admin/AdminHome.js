
import React from 'react';
import { Typography, Box } from '@mui/material';

const AdminHome = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Admin Dashboard
      </Typography>
      <Typography variant="body1">
        Please select an option from the sidebar to manage events, add new events, or view ticket sales.
      </Typography>
    </Box>
  );
};

export default AdminHome;
