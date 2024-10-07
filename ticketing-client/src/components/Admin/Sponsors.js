import React, { useState } from 'react';
import AddSponsor from '../sponsors/AddSponsor'; // Path to the AddSponsor component
import ManageSponsors from '../sponsors/ManageSponsors'; // Path to the ManageSponsors component
import { Button, Typography, Container } from '@mui/material';

const Sponsors = () => {
  const [activeTab, setActiveTab] = useState('add'); // Track the active tab

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Sponsors
      </Typography>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'add' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('add')}
        >
          Add Sponsor
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Sponsors
        </Button>
      </div>

      {/* Render the active component */}
      {activeTab === 'add' && <AddSponsor />}
      {activeTab === 'manage' && <ManageSponsors />}
    </Container>
  );
};

export default Sponsors;
