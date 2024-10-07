import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

const OrganizerEditEvent = () => {
  const { eventId } = useParams(); // Get eventId from the URL
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [status, setStatus] = useState('');
  const [poster, setPoster] = useState(null);
  const [existingPosterUrl, setExistingPosterUrl] = useState('');

  useEffect(() => {
    // Fetch event details using the eventId
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token for authorization
        const response = await axios.get(`http://localhost:5000/api/admin/organizer-events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const event = response.data;
        setEventName(event.eventName);
        setEventDate(new Date(event.eventDate).toISOString().split('T')[0]); // Format date for input
        setEventTime(event.eventTime);
        setStatus(event.status);
        setExistingPosterUrl(event.posterUrl); // Store existing poster URL
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('eventName', eventName);
    formData.append('eventDate', eventDate);
    formData.append('eventTime', eventTime);
    formData.append('status', status);
    if (poster) {
      formData.append('poster', poster); // Only append new poster if it’s updated
    }

    try {
      const token = localStorage.getItem('token'); // Get token for authorization
      await axios.put(`http://localhost:5000/api/admin/organizer-events/${eventId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Event updated successfully!');
      navigate('/admin/organizer-manage-events'); // Redirect after successful update
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    }
  };

  return (
    <div>
      <h1>Edit Organizer Event</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event Name"
          required
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        {existingPosterUrl && (
          <div>
            <p>Current Poster:</p>
            <img src={existingPosterUrl} alt="Event Poster" style={{ width: '200px' }} />
          </div>
        )}
        <input type="file" onChange={(e) => setPoster(e.target.files[0])} />
        <Button type="submit" variant="contained" color="primary">
          Update Event
        </Button>
      </form>
    </div>
  );
};

export default OrganizerEditEvent;
