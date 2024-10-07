import React, { useState } from 'react';
import AddSoundLighting from '../SoundLighting/AddSoundLighting';
import ManageSoundLighting from '../SoundLighting/ManageSoundLighting';
import { Button } from '@mui/material';

const SoundLighting = () => {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div>
      <h2>Manage Sound and Lighting</h2>

      <div style={{ marginBottom: '20px' }}>
        <Button
          variant={activeTab === 'add' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setActiveTab('add')}
        >
          Add Sound & Lighting
        </Button>
        <Button
          variant={activeTab === 'manage' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setActiveTab('manage')}
          style={{ marginLeft: '10px' }}
        >
          Manage Sound & Lighting
        </Button>
      </div>

      {activeTab === 'add' && <AddSoundLighting />}
      {activeTab === 'manage' && <ManageSoundLighting />}
    </div>
  );
};

export default SoundLighting;
