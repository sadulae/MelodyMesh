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
        {/* Link to redirect to Admin Dashboard */}
        <Typography
          variant="h6"
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider', fontWeight: 'bold' }}
          component={Link} // Use Link to redirect
          to="/admin" // Redirect to /admin on click
          style={{ textDecoration: 'none', color: 'inherit' }} // Keep default styling
        >
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

          {/* New Tabs */}
          <ListItem
            button
            component={Link}
            to="band-performers"
            sx={{
              backgroundColor: location.pathname.includes('band-performers') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Band & Performers" sx={{ fontWeight: location.pathname.includes('band-performers') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="location"
            sx={{
              backgroundColor: location.pathname.includes('location') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Location" sx={{ fontWeight: location.pathname.includes('location') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="sound-lighting"
            sx={{
              backgroundColor: location.pathname.includes('sound-lighting') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Sound & Lighting" sx={{ fontWeight: location.pathname.includes('sound-lighting') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="volunteers"
            sx={{
              backgroundColor: location.pathname.includes('volunteers') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Volunteer Handling" sx={{ fontWeight: location.pathname.includes('volunteers') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="organizers"
            sx={{
              backgroundColor: location.pathname.includes('organizers') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Organizer Handling" sx={{ fontWeight: location.pathname.includes('organizers') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="sponsors"
            sx={{
              backgroundColor: location.pathname.includes('sponsors') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Sponsor Handling" sx={{ fontWeight: location.pathname.includes('sponsors') ? 'bold' : 'normal' }} />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="feedback"
            sx={{
              backgroundColor: location.pathname.includes('feedback') ? 'primary.light' : 'inherit',
              '&:hover': { backgroundColor: 'primary.light' },
            }}
          >
            <ListItemText primary="Feedback" sx={{ fontWeight: location.pathname.includes('feedback') ? 'bold' : 'normal' }} />
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
