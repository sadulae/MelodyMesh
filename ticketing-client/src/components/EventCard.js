import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

const EventCard = ({ event, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box display="flex" justifyContent="center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Card
        style={{
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: '15px',
          maxWidth: '280px',
          transition: 'transform 0.3s ease-in-out',
          transform: hovered ? 'scale(1.05)' : 'scale(1)',
          overflow: 'hidden', // Ensure content stays within the card
          position: 'relative', // Necessary for the overlay positioning
        }}
      >
        {event.posterUrl && (
          <CardMedia
            component="img"
            image={`http://localhost:5000${event.posterUrl}`}
            alt={event.title}
            style={{
              cursor: 'pointer',
              width: '100%',
              height: '380px', // Increased height for better portrait display
              objectFit: 'cover',
              filter: hovered ? 'brightness(50%)' : 'brightness(100%)', // Darken image on hover
              transition: 'filter 0.3s ease-in-out',
            }}
            onClick={onClick}
          />
        )}

        {hovered && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
              padding: '20px',
            }}
          >
            <Typography variant="h6" component="div" style={{ fontWeight: 'bold', marginBottom: '10px' }}>
              {event.title}
            </Typography>
            <Typography variant="body2" style={{ marginBottom: '20px' }}>
              {event.description}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onClick}
              style={{
                borderRadius: '30px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Purchase Tickets
            </Button>
          </Box>
        )}

        {!hovered && (
          <CardContent>
            <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
              {event.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" style={{ margin: '10px 0' }}>
              {new Date(event.date).toLocaleDateString()}
            </Typography>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};

export default EventCard;
