import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Box, TextField, InputAdornment, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EventCard from '../components/EventCard'; // Ensure this component exists
import Lottie from 'lottie-react';
import loadingAnimation from '../assets/animations/loading.json'; // Adjust the path as needed

const Home = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholder, setPlaceholder] = useState(''); // For dynamic placeholder text
  const [isDeleting, setIsDeleting] = useState(false); // Track deleting
  const [loopNum, setLoopNum] = useState(0); // Keep track of typing loop
  const [delta, setDelta] = useState(150); // Typing speed
  const [isPaused, setIsPaused] = useState(false); // To control pauses between typing/deleting phases
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/pages/events');
        setEvents(response.data);
        setLoading(false); // Data fetched successfully
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setLoading(false); // Stop loading even if there's an error
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const typingText = 'Search for events...';

    const handleTyping = () => {
      if (!isPaused) {
        const currentText = typingText.substring(0, loopNum); // Get the current substring based on loopNum
        setPlaceholder(currentText); // Update the placeholder text

        if (!isDeleting && loopNum === typingText.length) {
          setIsPaused(true); // Pause before starting to delete
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(true);
          }, 2000); // Wait 2 seconds before starting to delete
        } else if (isDeleting && loopNum === 0) {
          setIsPaused(true); // Pause before typing again
          setTimeout(() => {
            setIsPaused(false);
            setIsDeleting(false);
          }, 500); // Short pause before starting to type again
        } else {
          setLoopNum((prev) => prev + (isDeleting ? -1 : 1)); // Increment or decrement loopNum
        }
      }
    };

    const ticker = setTimeout(handleTyping, delta);

    return () => clearTimeout(ticker); // Clear timeout on component unmount
  }, [loopNum, isDeleting, delta, isPaused]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#fff' }}>
      {/* Search Bar */}
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

      {/* Loading Animation */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Lottie animationData={loadingAnimation} loop={true} style={{ width: 300, height: 300 }} />
        </Box>
      ) : error ? (
        // Error Message
        <Grid container justifyContent="center" alignItems="center" style={{ height: '60vh' }}>
          <Grid item xs={12} style={{ textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        // Events Grid
        <Grid container spacing={4} justifyContent="center">
          {filteredEvents.length === 0 ? (
            // No Events Available Message
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
            // Display EventCards
            filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                <EventCard event={event} onClick={() => handleEventClick(event._id)} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </div>
  );
};

export default Home;
