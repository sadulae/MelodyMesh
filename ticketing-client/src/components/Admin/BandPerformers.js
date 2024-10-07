import React, { useState } from 'react';
import AssignBandsPerformers from '../bandperformer/AssignBandsPerformers';
import ManageBandsPerformers from '../bandperformer/ManageBandsPerformers';
import { Button } from '@mui/material';

const BandPerformers = () => {
  const [activeTab, setActiveTab] = useState('assign'); // Track the active tab

  return (
    <div>
      <h2>Manage Bands & Performers</h2>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'assign' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('assign')}
        >
          Assign Bands & Performers
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Bands & Performers
        </Button>
      </div>

      {/* Render the active component */}
      {activeTab === 'assign' && <AssignBandsPerformers />}
      {activeTab === 'manage' && <ManageBandsPerformers />}
    </div>
  );
};

export default BandPerformers;
