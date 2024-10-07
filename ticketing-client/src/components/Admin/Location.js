import React, { useState } from 'react';
import AddLocation from '../location/AddLocation';
import ManageLocation from '../location/ManageLocation';
import { Button } from '@mui/material';

const Location = () => {
  const [activeTab, setActiveTab] = useState('add'); // Track the active tab

  return (
    <div>
      <h2>Manage Locations</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'add' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('add')}
        >
          Add Location
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Locations
        </Button>
      </div>

      {/* Render the active component */}
      {activeTab === 'add' && <AddLocation />}
      {activeTab === 'manage' && <ManageLocation />}
    </div>
  );
};

export default Location;
