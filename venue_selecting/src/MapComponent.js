import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
// import { Typography } from '@mui/material';

const MapComponent = ({ setLatitude, setLongitude }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    console.log('Received setLatitude:', setLatitude);  // Debug log
    console.log('Received setLongitude:', setLongitude);  // Debug log

    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    const google = window.google;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 6.88, lng: 79.880 },
      zoom: 8,
    });

    const input = document.getElementById('search-box');
    const searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (!places || places.length === 0) return;

      const location = places[0].geometry.location;

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
      });

      map.setCenter(location);
      setLatitude(location.lat());
      setLongitude(location.lng());
    });

    map.addListener('click', (event) => {
      const location = event.latLng;

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
      });

      setLatitude(location.lat());
      setLongitude(location.lng());
    });
  }, [setLatitude, setLongitude]);

  return (
    <Box sx={{ p: 3,
      maxWidth: 800,
      mx: 'auto',
      backgroundColor: '#f7f7f7',
      borderRadius: '10px',
      color: 'Black',
      boxShadow: '8px 8px 8px 4px rgba(0,0,0,0.2)'
    }}>
      <TextField id="search-box" label="Search Location" variant="outlined" fullWidth />
      <Box ref={mapRef} sx={{ width: '100%', height: '300px', marginTop: '16px' }} />
    <Box>
    <Box sx={{ mt: 2,
                color: '#000',
                borderRadius: '8px',
                backgroundColor: '#fff',
                padding: '10px',
                textAlign: 'center',
                '&:hover': {
                  opacity: 0.8,
                  background: 'linear-gradient(to right, #FADCD9, #FADCD9)',
                },
      }}>
       Select Your Location
      </Box>
    </Box>
    </Box>
  );
};

export default MapComponent;
