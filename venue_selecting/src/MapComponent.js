import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const MapComponent = () => {
  const mapRef = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);

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

  const calculateAndDisplayRoute = (origin, destination) => {
    console.log('calculateAndDisplayRoute called with:', origin, destination);

    if (!window.google || !directionsService.current || !directionsRenderer.current) {
      console.error('Google Maps API or Directions Service is not initialized.');
      return;
    }

    const google = window.google;
    directionsService.current.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
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
          borderRadius: '5px',
          border: '1px solid #ccc',
          backgroundColor: '#000',
        }}
      ></Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => calculateAndDisplayRoute('Colombo, WP', 'Kandy, CP')}
      >
        Get Directions
      </Button>
    </Box>
  );
};

export default MapComponent;
