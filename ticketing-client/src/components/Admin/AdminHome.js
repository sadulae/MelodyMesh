import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Button 
        variant="contained" 
        onClick={() => navigate('/admin/organizer-add-event')}
      >
        Add Event
      </Button>
      <Button 
        variant="contained" 
        onClick={() => navigate('/admin/organizer-manage-events')}
      >
        Manage Events
      </Button>
    </div>
  );
};

export default AdminHome;
