import React, { useState, useEffect } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import axios from 'axios';

const OrgManageEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await axios.get('/api/organizer-events');
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">Manage Organizer Events</Typography>
      </Grid>
      {events.map((event) => (
        <Grid item xs={12} key={event._id}>
          <Typography variant="h6">{event.eventName}</Typography>
          <Typography variant="body1">{event.eventDate}</Typography>
          <Button variant="outlined" onClick={() => alert(`Viewing ${event.eventName}`)}>
            View Details
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default OrgManageEvents;
