import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './AdminDashboard.css'; // Import custom CSS for transitions

const AdminDashboard = () => {
  const location = useLocation(); // Get current route

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
        <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider', fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <List component="nav" sx={{ mt: 2 }}>
          <ListItem
            button
            component={Link}
            to="add-event"
            sx={{
              backgroundColor: location.pathname.includes('add-event') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Add Event" sx={{ fontWeight: location.pathname.includes('add-event') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="events"
            sx={{
              backgroundColor: location.pathname.includes('events') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Manage Events" sx={{ fontWeight: location.pathname.includes('events') ? 'bold' : 'normal' }} />
          </ListItem>
        </List>
      </Box>

      {/* Main Content with smooth transition */}
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={location.pathname} // Ensure transition happens when route changes
            classNames="fade"
            timeout={300}
          >
            <Outlet />
          </CSSTransition>
        </SwitchTransition>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
