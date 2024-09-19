// src/components/Admin/AdminDashboard.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '250px',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          height: '100vh',
        }}
      >
        <Typography variant="h6" sx={{ p: 2 }}>
          Admin Dashboard
        </Typography>
        <List component="nav">
          <ListItem button component={Link} to="add-event">
            <ListItemText primary="Add Event" />
          </ListItem>
          <ListItem button component={Link} to="events">
            <ListItemText primary="Manage Events" />
          </ListItem>
          <ListItem button component={Link} to="ticket-sales">
            <ListItemText primary="Ticket Sales" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
