import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Box, Grid } from '@mui/material';

const DisplayPage = () => {
  const location = useLocation();
  const formData = location.state?.formData || {};
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const API_KEY = 'AIzaSyCpg09_zEJaHr8mRJ24T0F4BWJ_ES9bUBs'; // API KEY = {AIzaSyCpg09_zEJaHr8mRJ24T0F4BWJ_ES9bUBs}

  // Function to dynamically load the Google Maps script
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('googleMaps');

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.id = 'googleMaps';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      } else {
        resolve();
      }
    });
  };

  // Initialize the map once the script is loaded
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        if (window.google && window.google.maps) {
          // Initialize the map
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 6.9271, lng: 79.8612 }, // Default center point (Colombo, Sri Lanka)
            zoom: 15,
          });

          // Create a marker
          new window.google.maps.Marker({
            position: { lat: 6.9271, lng: 79.8612 },
            map,
            draggable: true, // Allow users to drag the marker
          });

          setMapLoaded(true);
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Maps script', error);
      });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, black, #333)',
        padding: '20px',
      }}
    >
      <Box
        sx={{
          p: 3,
          maxWidth: 800,
          mx: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {formData.placeName || 'Submitted Data'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6">Photos:</Typography>
            {formData.photoPreviews?.[0] && (
              <img
                src={formData.photoPreviews[0]}
                alt="Uploaded"
                style={{
                  maxHeight: '200px',
                  maxWidth: '100%',
                  borderRadius: '5px',
                  objectFit: 'cover',
                }}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Location on Map:</Typography>
            {mapLoaded ? (
              <div
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                }}
              ></div>
            ) : (
              <Typography>Loading map...</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Address:</Typography>
            <Typography>{formData.address}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6">Phone Number:</Typography>
            <Typography>{formData.phone}</Typography>
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
      </Box>
    </div>
  );
};

export default DisplayPage;
