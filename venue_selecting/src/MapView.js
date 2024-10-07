import React, { useEffect, useRef } from 'react';
import RoomIcon from '@mui/icons-material/Room';
import Box from '@mui/material/Box';


  const MapView = ({ onLocationChange, latitude, longitude }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null); // Reference for the marker

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps JavaScript API is not loaded.');
      return;
    }

    const google = window.google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 6.88, lng: 79.880 },
      zoom: 8,
      StreetviewControl:false,
      mapTypeControl: false,
    });

    const input = document.getElementById('search-box');
    const searchBox = new google.maps.places.SearchBox(input);

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      const location = place.geometry.location;
      // onLocationChange(location.lat(), location.lng());

      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
        title: place.name,
      });

      map.setCenter(location);
      map.setZoom(14);
    });

    const onClickMap = (event) => {
      const location = event.latLng;

      if (markerRef.current) markerRef.current.setMap(null);

      markerRef.current = new google.maps.Marker({
        position: location,
        map: map,
        icon: RoomIcon,
      });

      // onLocationChange(location.lat(), location.lng());
    };

    map.addListener('click', onClickMap);

    return () => {
      google.maps.event.clearInstanceListeners(map, 'click');
      google.maps.event.clearInstanceListeners(searchBox);
    };
  }, [onLocationChange]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '200%',
        height: '200px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        backgroundColor: '#000',
      }}
    ></Box>
  );
};

export default MapView;