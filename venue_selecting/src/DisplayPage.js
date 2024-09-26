import React, { /*useEffect, useState*/ } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, Grid, Button } from '@mui/material';
import MapView from './MapView';

const DisplayPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add this line to use the navigate function
  const formData = location.state?.formData || {};

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'white',
        padding: '20px',
      }}
    >
      <Box
        sx={{
          p: 3,
          maxWidth: 800,
          mx: 'auto',
          backgroundColor: '#f7f7f7',
          borderRadius: '10px',
          color: 'Black',
          boxShadow: '8px 8px 8px 4px rgba(0,0,0,0.2)',
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {formData.placeName || 'Submitted Data'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Photos:</Typography>
            {formData.photoPreviews?.length > 0 && (
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                {formData.photoPreviews.map((preview, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <img
                      src={preview}
                      alt={`Uploaded ${index}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '5px',
                        objectFit: 'cover',
                        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
                  <MapView />
                </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Address:</Typography>
            <Typography>{formData.address}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6">Phone Number:</Typography>
            <Typography>{formData.phoneNum}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Email Address:</Typography>
            <Typography>{formData.email}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Category:</Typography>
            <Typography>{formData.category}</Typography>
          </Grid>

        </Grid>

        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default DisplayPage;
