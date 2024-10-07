import React, { useState } from 'react';
import axios from 'axios';

const AddOrganizerEvent = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [poster, setPoster] = useState(null); // For file upload

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the date into the required format (if necessary)
    const formattedDate = new Date(date); // JavaScript Date object will convert it to the correct format

    const formData = new FormData(); // Use FormData for file upload
    formData.append('eventName', name); // Ensure backend expects this field name
    formData.append('eventDate', formattedDate); // Append the correctly formatted date
    formData.append('eventTime', time); // Ensure backend expects this field name
    formData.append('status', status); // Ensure backend expects this field name
    if (poster) {
      formData.append('poster', poster); // Append the poster file
    }

    try {
      // Get token from localStorage for authorization
      const token = localStorage.getItem('token');

      if (!token) {
        alert('User not authenticated');
        return;
      }

      await axios.post('http://localhost:5000/api/admin/organizer-add-event', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Include JWT token in the Authorization header
        },
      });
      alert('Event added successfully!');
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert('Failed to add event: ' + error.response.data.message);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Event Name"
        required
        name="eventName" // Correct field name
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        name="eventDate" // Correct field name
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
        name="eventTime" // Correct field name
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)} name="status">
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option> {/* Ensure your backend allows this enum value */}
        <option value="completed">Completed</option>
      </select>
      <input
        type="file"
        onChange={(e) => setPoster(e.target.files[0])} // Handle file upload
      />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default AddOrganizerEvent;
