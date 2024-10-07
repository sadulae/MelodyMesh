import React, { useState } from 'react';
import AddVolunteer from '../volunteers/AddVolunteer';
import ManageVolunteers from '../volunteers/ManageVolunteers';
import { Button } from '@mui/material';

const Volunteers = () => {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div>
      <h2>Manage Volunteers</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'add' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('add')}
        >
          Add Volunteers
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Volunteers
        </Button>
      </div>

      {/* Render the active component */}
      {activeTab === 'add' && <AddVolunteer />}
      {activeTab === 'manage' && <ManageVolunteers />}
    </div>
  );
};

export default Volunteers;
