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
import AuthProvider from './context/AuthContext';
import { jwtDecode } from 'jwt-decode'; 
import AdminHome from './components/Admin/AdminHome';
import Profile from './components/Profile'; 
import BandPerformers from './components/Admin/BandPerformers';
import Location from './components/Admin/Location';
import SoundLighting from './components/Admin/SoundLighting';
import Volunteers from './components/Admin/Volunteers';
import Organizers from './components/Admin/Organizers';
import Sponsors from './components/Admin/Sponsors';
import AddOrganizerEvent from './components/organizer/AddOrganizerEvent';
import ManageOrganizerEvents from './components/organizer/ManageOrganizerEvents';
import OrganizerEditEvent from './components/organizer/OrganizerEditEvent'; 
import FeedbackForm from './components/Feedback/FeedbackForm';
import Feedback from './components/Admin/Feedback';
import PublicFeedback from './components/PublicFeedback';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // MUI theme provider
import CssBaseline from '@mui/material/CssBaseline'; // Normalize browser CSS
import { LocalizationProvider } from '@mui/x-date-pickers'; // Date pickers localization provider
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Date-fns adapter for date pickers

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

  const theme = createTheme({
    palette: {
      mode: 'light', // You can change this to 'dark' if needed
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
        <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Wrap with LocalizationProvider */}
          <CssBaseline /> {/* Normalize CSS across browsers */}
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
              <Route path="/feedback" element={<FeedbackForm />} />
              <Route path="/public-feedback" element={<PublicFeedback />} />
      
              
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
                <Route path="band-performers" element={<BandPerformers />} />
                <Route path="location" element={<Location />} />
                <Route path="sound-lighting" element={<SoundLighting />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="organizers" element={<Organizers />} />
                <Route path="sponsors" element={<Sponsors />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="organizer-add-event" element={<AddOrganizerEvent />} />
                <Route path="organizer-manage-events" element={<ManageOrganizerEvents />} />
                <Route path="organizer-edit-event/:eventId" element={<OrganizerEditEvent />} />
              </Route>
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
