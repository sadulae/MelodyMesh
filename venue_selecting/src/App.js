// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DisplayPage from './DisplayPage';
import UserForm from './UserForm'; // Import UserForm

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/add-place" element={<UserForm />} /> {/* Route for UserForm */}
      </Routes>
    </Router>
  );
}

export default App;
