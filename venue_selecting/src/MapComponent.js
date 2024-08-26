import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const MapComponent = () => {
  const mapRef = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps JavaScript API is not loaded.');
      return;
    }

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });

    directionsService.current = new google.maps.DirectionsService();
    directionsRenderer.current = new google.maps.DirectionsRenderer();
    directionsRenderer.current.setMap(map);

    const onClickMap = (event) => {
      const location = event.latLng;
      console.log('New location:', location.toString());
    };

    map.addListener('click', onClickMap);

    return () => {
      google.maps.event.clearListeners(map, 'click');
    };
  }, []);

  const calculateAndDisplayRoute = () => {
    if (!window.google || !directionsService.current || !directionsRenderer.current) {
      console.error('Google Maps API or Directions Service is not initialized.');
      return;
    }

    if (!origin || !destination) {
      console.error('Both origin and destination must be provided.');
      return;
    }

    directionsService.current.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRenderer.current.setDirections(response);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '300px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          backgroundColor: '#000',
        }}
      ></Box>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Start Point"
          variant="outlined"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          fullWidth
        />
        <TextField
          label="End Point"
          variant="outlined"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={calculateAndDisplayRoute}
        >
          Get Directions
        </Button>
      </Box>
    </Box>
  );
};

export default MapComponent;
