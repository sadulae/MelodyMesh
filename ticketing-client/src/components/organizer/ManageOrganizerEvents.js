import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';

const ManageOrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Define the base URL for the API requests
  const baseURL = 'http://localhost:5000/api/admin'; // Use port 5000

  useEffect(() => {
    // Fetch all organizer-related events from the backend
    const fetchEvents = async () => {
      try {
        // Retrieve the JWT token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          alert('User not authenticated');
          return;
        }

        const response = await axios.get(`${baseURL}/organizer-events`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [baseURL]);

  // Handle event deletion
  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token'); // Include the token in the Authorization header

        await axios.delete(`${baseURL}/organizer-events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setEvents(events.filter(event => event._id !== eventId)); // Remove the deleted event from the list
        alert('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete the event.');
      }
    }
  };

  // Handle event editing (navigate to edit page)
  const handleEdit = (eventId) => {
    navigate(`/admin/organizer-edit-event/${eventId}`);
  };

  return (
    <div>
      <h1>Manage Organizer Events</h1>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div>
          {events.map(event => (
            <div key={event._id} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
              <h2>{event.eventName}</h2> {/* Ensure you use correct field names from the backend */}
              <p>Date: {new Date(event.eventDate).toLocaleDateString()}</p>
              <p>Time: {event.eventTime}</p>
              <p>Status: {event.status}</p>
              <Button variant="contained" color="primary" onClick={() => handleEdit(event._id)}>
                Edit
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleDelete(event._id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrganizerEvents;
