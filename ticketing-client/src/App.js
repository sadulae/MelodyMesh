import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home'; 
import Contact from './pages/ContactUs';
import About from './pages/About'; 
import Login from './pages/Login';
import ForgotPasswordForm from './pages/ForgotPasswordForm';
import ResetPasswordForm from './pages/ResetPasswordForm';
import Signup from './pages/Signup';
import AdminPage from './pages/AdminPage';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    // Load the firstName from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setFirstName(decodedToken.firstName);
    }
  }, []);

  return (
    <Router>
      <Header firstName={firstName} setFirstName={setFirstName} /> {/* Pass the firstName and setFirstName as props */}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login setFirstName={setFirstName} />} /> {/* Pass setFirstName to Login */}
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminPage />} /> {/* AdminPage route */}
      </Routes>
    </Router>
  );
}

export default App;
