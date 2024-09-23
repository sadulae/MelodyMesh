import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminHome = () => {
  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper
        elevation={4}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 2,
          maxWidth: 600,
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
          Welcome, Admin
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 3, color: '#555' }}>
          Manage your events with ease. From creating new events to keeping track of the ones already planned, everything you need is just a few clicks away.
        </Typography>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 500, color: '#666' }}>
          What would you like to do today?
        </Typography>

        <Typography variant="body2" sx={{ color: '#777' }}>
          Use the sidebar to navigate through different options and get started with managing your events.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminHome;
