import React, { useState } from 'react';
import AddOrganizer from '../organizers/AddOrganizer';
import ManageOrganizer from '../organizers/ManageOrganizers'; // Corrected path
import { Button, Typography, Container } from '@mui/material';

const Organizers = () => {
  const [activeTab, setActiveTab] = useState('add'); // Track the active tab

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Organizers
      </Typography>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'add' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('add')}
        >
          Add Organizer
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Organizers
        </Button>
      </div>

      {/* Render the active component */}
      {activeTab === 'add' && <AddOrganizer />}
      {activeTab === 'manage' && <ManageOrganizer />}
    </Container>
  );
};

export default Organizers;
