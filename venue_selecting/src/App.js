import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserForm from './UserForm';
import DisplayPage from './DisplayPage';
import MapComponent from './MapComponent';
import Read from './Read';
import View from './MapView';
import HomePage from './HomePage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="add-place" element={<UserForm />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path='/map' element={<MapComponent />} />
        <Route path='/read' element={<Read/>} />
        <Route path='/map-view' element={<View/>} />
      </Routes>
    </Router>
  );
}

export default App;
