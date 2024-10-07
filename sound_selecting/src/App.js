import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './Pages/HomePage';
import SoundForm from './Component/soundForm';
import LightingForm from './Component/lighting';
import VisualForm from './Component/visual';
import Displaydetails from './Component/display-details';
import SoundLightVisualRead from './Pages/SoundLightVisualRead';
import SoundReadCard from './Pages/SoundReadCard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sound-form" element={<SoundForm />} />
        <Route path="/lighting-form" element={<LightingForm />} />
        <Route path="/visual-form" element={<VisualForm />} />
        <Route path="/display-details" element={<Displaydetails />} />
        <Route path="/SLV" element={<SoundLightVisualRead />} />
        <Route path="/SoundRC" element={<SoundReadCard />} />
      </Routes>
    </Router>
  );
}

export default App;
