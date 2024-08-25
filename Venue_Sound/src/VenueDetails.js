import React from 'react';
import { Box, Grid, Typography, Button, TextField, Paper } from '@mui/material';

const VenueDetails = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Place Name */}
      <Typography variant="h4" align="center" gutterBottom>
        Place Name
      </Typography>

      <Grid container spacing={3}>
        {/* Image Gallery */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {/* Dummy images for gallery */}
              {[...Array(5)].map((_, index) => (
                <Grid item xs={6} key={index}>
                  <img
                    src="https://via.placeholder.com/150"
                    alt={`gallery-${index}`}
                    style={{ width: '100%', borderRadius: '4px' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        );
      }