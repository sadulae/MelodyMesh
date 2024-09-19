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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AddEvent from './components/Admin/AddEvent';
import EditEvent from './components/Admin/EditEvent';
import ViewEvents from './components/Admin/ViewEvents';
import TicketSales from './components/Admin/TicketSales';
import EventDetails from './components/EventDetails';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthContext'; // Ensure this path is correct
import {jwtDecode} from 'jwt-decode';

function App() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFirstName(decodedToken.firstName);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token'); // Remove invalid token from storage
      }
    }
  }, []);

  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <Router>
        <Header firstName={firstName} setFirstName={setFirstName} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login setFirstName={setFirstName} />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event/:eventId" element={<EventDetails />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} /> {/* Admin login route */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="add-event" element={<AddEvent />} />
            <Route path="events" element={<ViewEvents />} />
            <Route path="events/edit/:eventId" element={<EditEvent />} />
            <Route path="ticket-sales" element={<TicketSales />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
