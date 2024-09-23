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
import AdminDashboard from './components/Admin/AdminDashboard';
import AddEvent from './components/Admin/AddEvent';
import EditEvent from './components/Admin/EditEvent';
import ViewEvents from './components/Admin/ViewEvents';
import TicketSales from './components/Admin/TicketSales';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import EventDetails from './components/EventDetails';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthContext'; // Ensure this path is correct
import {jwtDecode} from 'jwt-decode'; // Corrected import
import AdminHome from './components/Admin/AdminHome';
import Profile from './components/Profile'; // Ensure Profile component is imported

function App() {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Now correctly imported
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login setFirstName={setFirstName} />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          
          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Checkout Route */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Confirmation Route */}
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly={true}> {/* Ensure adminOnly prop is passed */}
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} /> {/* Default admin route */}
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
