import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
//import { Start } from '@mui/icons-material';
import RoomIcon from '@mui/icons-material/Room';


const MapComponent = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null); // Reference for the marker
  //const searchBoxRef = useRef(null); // Reference for the search box
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps JavaScript API is not loaded.');
      return;
    }

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 6.88, lng: 79.880 },
      zoom: 8,
    });

    // Initialize search box
    const input = document.getElementById('search-box');
    const searchBox = new google.maps.places.SearchBox(input);

    // Listen for search box place change
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) {
        return;
      }

      const place = places[0];
      if (!place.geometry || !place.geometry.location) {
        return;
      }

      const location = place.geometry.location;

      // Update latitude and longitude states
      setLatitude(location.lat());
      setLongitude(location.lng());

      // Set marker position on searched location
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
        title: place.name,
      });

      // Center the map to the searched location
      map.setCenter(location);
      map.setZoom(14);
    });

    // Add click event to the map
    const onClickMap = (event) => {
      const location = event.latLng;
      console.log('New location:', location.toString());

      // Check if there's already a marker, if so, remove it
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create a custom marker
      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
        StartIcon:RoomIcon,
        // icon: {
        //   url: 'https://example.com/custom-icon.png', // Replace with the URL of your custom icon
        //   scaledSize: new google.maps.Size(40, 40), // Adjust the size of the icon
        // },
      });

      // Update latitude and longitude states for clicked position
      setLatitude(location.lat());
      setLongitude(location.lng());
    };

    map.addListener('click', onClickMap);

    // Clean up event listeners when component unmounts
    return () => {
      google.maps.event.clearInstanceListeners(map, 'click');
      google.maps.event.clearInstanceListeners(searchBox);
    };
  }, []);

  return (
    <Box sx={{ p: 2, backgroundColor: '#f0f0f0', borderRadius: '8px', mr: 5 }}>
      {/* Search Box */}
      <TextField
        id="search-box"
        label="Search Location"
        variant="outlined"
        fullWidth
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />

      {/* Map */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '300px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          backgroundColor: '#000',
          mt: 2,
        }}
      ></Box>

      {/* Display Latitude and Longitude */}
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
        <p>Latitude {latitude}</p>
        <p>Longitude {longitude}</p>
      </Box>
    </Box>
  );
};

export default MapComponent;
