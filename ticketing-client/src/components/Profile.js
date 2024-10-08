import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Avatar,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers if required
          },
        });
        setUserProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUserProfile(null);
    navigate('/login'); // Redirect to login page
  };

  const handleAddFeedback = () => {
    navigate('/feedback'); // Navigate to the feedback submission page
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  const formattedDob = userProfile?.dob ? format(new Date(userProfile.dob), 'MMMM d, yyyy') : '';

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, backgroundColor: '#f9f9f9' }}>
        <Grid container spacing={3} alignItems="center">
          {/* User Avatar */}
          <Grid item xs={12} sm={4}>
            <Avatar
              sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem', mx: 'auto' }}
            >
              <AccountCircleIcon fontSize="inherit" />
            </Avatar>
          </Grid>
          {/* User Details */}
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {userProfile.firstName} {userProfile.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userProfile.email}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Date of Birth: {formattedDob}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Additional Information */}
        <Typography variant="h5" gutterBottom>
          Profile Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            <strong>First Name:</strong> {userProfile.firstName}
          </Typography>
          <Typography variant="body1">
            <strong>Last Name:</strong> {userProfile.lastName}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {userProfile.email}
          </Typography>
          <Typography variant="body1">
            <strong>Date of Birth:</strong> {formattedDob}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          {/* Add Feedback Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddFeedback}
            sx={{
              textTransform: 'none',
              fontFamily: "'Poppins', sans-serif",
              borderRadius: '20px',
              padding: '10px 30px',
              fontSize: '1rem',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            Add Feedback
          </Button>

          {/* Sign Out Button */}
          <Button
            variant="outlined"
            onClick={handleSignOut}
            sx={{
              textTransform: 'none',
              fontFamily: "'Poppins', sans-serif",
              borderRadius: '20px',
              padding: '10px 30px',
              fontSize: '1rem',
              borderColor: 'primary.main',
              color: 'primary.main',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
                borderColor: 'primary.main',
              },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
