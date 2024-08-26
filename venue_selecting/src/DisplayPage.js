import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, Grid, Button } from '@mui/material';

const DisplayPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add this line to use the navigate function
  const formData = location.state?.formData || {};
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const API_KEY = 'AIzaSyCpg09_zEJaHr8mRJ24T0F4BWJ_ES9bUBs'; // Your Google Maps API Key

  // Function to dynamically load the Google Maps script
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('googleMaps');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.id = 'googleMaps';
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
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
          console.log('Google Maps API loaded successfully.');
          const map = new window.google.maps.Map(mapRef.current, {
            center: formData.mapLocation || { lat: 6.9271, lng: 79.8612 }, // Default center if no location is provided
            zoom: 15,
          });

          if (formData.mapLocation) {
            new window.google.maps.Marker({
              position: formData.mapLocation,
              map,
              draggable: true, // Allow users to drag the marker
            });
          }

          setMapLoaded(true);
        } else {
          console.error('Google Maps API not loaded properly.');
        }
      })
      .catch((error) => {
        console.error('Failed to load Google Maps script:', error);
      });
  }, [formData.mapLocation]);

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

          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <Typography variant="h6">Capacity:</Typography>
            <Typography>{formData.capacity}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Custom Message:</Typography>
            <Typography>{formData.customMessage}</Typography>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default DisplayPage;
