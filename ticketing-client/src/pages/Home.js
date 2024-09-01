import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Box, TextField, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '@mui/material';
import EventCard from '../components/EventCard'; // Import the new EventCard component

const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholder, setPlaceholder] = useState(''); // For dynamic placeholder text
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pages/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();

    const typingText = 'Search for events...';
    let index = 0;
    let isDeleting = false;

    const typeEffect = () => {
      if (!isDeleting && index < typingText.length) {
        setPlaceholder((prev) => prev + typingText[index]);
        index++;
        setTimeout(typeEffect, 100); // Typing speed
      } else if (index === typingText.length && !isDeleting) {
        setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, 4000); // Wait 4 seconds before deleting
      } else if (isDeleting && index > 0) {
        setPlaceholder((prev) => prev.slice(0, -1));
        index--;
        setTimeout(typeEffect, 50); // Deleting speed
      } else if (index === 0 && isDeleting) {
        isDeleting = false;
        setTimeout(typeEffect, 1000); // Wait before starting the next loop
      }
    };

    typeEffect();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '60px', marginTop: '20px' }}>
        <TextField
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: '800px',
            backgroundColor: '#5E74C2',
            borderRadius: '30px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              height: '50px',
              '& fieldset': {
                borderColor: '#5E74C2',
              },
              '&:hover fieldset': {
                borderColor: '#5E74C2',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: '#fff',
              fontSize: '18px',
            },
            '& .MuiInputAdornment-root': {
              color: '#fff',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            placeholder: placeholder, // Use the dynamic placeholder text
          }}
        />
      </Box>
      <Grid container spacing={4} justifyContent="center">
        {filteredEvents.length === 0 ? (
          <Grid container justifyContent="center" alignItems="center" style={{ height: '60vh' }}>
            <Grid item xs={12}>
              <Typography variant="h5" style={{ textAlign: 'center', marginBottom: '20px' }}>
                No Events Available
              </Typography>
              <Typography variant="body1" style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                We're sorry, but there are no music events scheduled at the moment. Please check back later for updates.
              </Typography>
            </Grid>
          </Grid>
        ) : (
          filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
              <EventCard event={event} onClick={() => handleEventClick(event._id)} />
            </Grid>
          ))
        )}
      </Grid>
    </div>
  );
};

export default Home;
