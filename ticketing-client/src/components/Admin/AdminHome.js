import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Box, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails,
  Snackbar, Alert, Card, CardContent, Chip, Tabs, Tab, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminHome = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [soundLighting, setSoundLighting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  // Fetching data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you're using token-based auth
        const response = await axios.get('http://localhost:5000/api/admin/all-details', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Store data in state
        setEvents(response.data.organizerEvents || []);
        setSponsors(response.data.sponsors || []);
        setFeedback(response.data.feedbacks || []);
        setVolunteers(response.data.volunteers || []);
        setOrganizers(response.data.organizers || []);
        setLocations(response.data.locations || []);
        setSoundLighting(response.data.soundLighting || []);
        setLoading(false); // Data loading is complete
      } catch (error) {
        console.error('Error fetching consolidated data', error);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  // Group all data by eventID
  const groupedData = events.map(event => ({
    event,
    sponsors: sponsors.filter(sponsor => sponsor.eventID === event._id),
    feedbacks: feedback.filter(fb => fb.eventId === event._id),
    volunteers: volunteers.filter(vol => vol.eventID === event._id),
    organizers: organizers.filter(org => org.eventID === event._id),
    locations: locations.filter(loc => loc.eventID === event._id),
    soundLighting: soundLighting.filter(sl => sl.eventID === event._id)
  }));

  const renderTable = (title, data, columns) => (
    <Box mb={2}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {data.length > 0 ? (
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell key={index}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>{col.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2">No {title.toLowerCase()} available.</Typography>
      )}
    </Box>
  );

  const totalSponsors = sponsors.length;
  const totalFeedbacks = feedback.length;
  const totalVolunteers = volunteers.length;
  const totalOrganizers = organizers.length;

  // Prepare data for graphs
  const sponsorshipData = events.map(event => {
    const eventSponsors = sponsors.filter(sponsor => sponsor.eventID === event._id);
    const totalAmount = eventSponsors.reduce((sum, sponsor) => sum + sponsor.sponsorshipAmount, 0);
    return { name: event.eventName, amount: totalAmount };
  });

  const volunteerData = events.map(event => {
    const eventVolunteers = volunteers.filter(volunteer => volunteer.eventID === event._id);
    return { name: event.eventName, volunteers: eventVolunteers.length };
  });

  const feedbackData = feedback.map(fb => ({
    date: new Date(fb.createdAt).toLocaleDateString(),
    rating: fb.rating
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} justifyContent="center" mb={3}>
        <Grid item>
          <Card>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <EventIcon fontSize="large" />
                </Grid>
                <Grid item>
                  <Typography variant="h6">Total Events</Typography>
                  <Typography variant="h4">{events.length}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <MonetizationOnIcon fontSize="large" />
                </Grid>
                <Grid item>
                  <Typography variant="h6">Total Sponsors</Typography>
                  <Typography variant="h4">{totalSponsors}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <PeopleIcon fontSize="large" />
                </Grid>
                <Grid item>
                  <Typography variant="h6">Total Volunteers</Typography>
                  <Typography variant="h4">{totalVolunteers}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardContent>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <StarIcon fontSize="large" />
                </Grid>
                <Grid item>
                  <Typography variant="h6">Average Rating</Typography>
                  <Typography variant="h4">
                    {feedback.length > 0 ? (feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length).toFixed(1) : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={3} justifyContent="center" mb={3}>
        {/* Add Event Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <EventAvailableIcon sx={{ fontSize: 50, color: '#1976d2' }} />
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                Add New Event
              </Typography>
              <Box display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/admin/organizer-add-event')}
                >
                  Add Event
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Manage Events Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <ManageAccountsIcon sx={{ fontSize: 50, color: '#1976d2' }} />
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                Manage Existing Events
              </Typography>
              <Box display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/admin/organizer-manage-events')}
                >
                  Manage Events
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Add more cards as needed for other functionalities */}
      </Grid>

      {/* Graphs */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Sponsorship Amount per Event</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sponsorshipData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Volunteer Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volunteerData}
                  dataKey="volunteers"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                >
                  {volunteerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Feedback Ratings Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={feedbackData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for Data Sections */}
      <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ marginBottom: 2 }}>
        <Tab label="Events" />
        <Tab label="Sponsors" />
        <Tab label="Volunteers" />
        <Tab label="Organizers" />
        <Tab label="Feedbacks" />
      </Tabs>

      {/* Content Based on Tab Selection */}
      {tabIndex === 0 && (
        /* Events Accordion */
        groupedData.map(({ event, sponsors, feedbacks, volunteers, organizers, locations, soundLighting }, index) => (
          <Accordion key={event._id} defaultExpanded={index === 0}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography variant="h6">
                {event.eventName} ({new Date(event.eventDate).toLocaleDateString()})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Event Details */}
              <Box mb={2}>
                <Typography variant="body1">
                  <strong>Description:</strong> {event.description || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {event.location || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong>
                  <Chip
                    label={event.status || 'Unknown'}
                    color={event.status === 'Active' ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>

              {/* Locations Table */}
              {renderTable('Locations', locations, [
                { label: 'Location Name', render: (row) => row.locationName },
                { label: 'Capacity', render: (row) => row.capacity },
                { label: 'Payment Status', render: (row) => row.paymentStatus }
              ])}

              {/* Sound and Lighting Table */}
              {renderTable('Sound and Lighting', soundLighting, [
                { label: 'Sound Provider', render: (row) => row.soundProviderName },
                { label: 'Light Provider', render: (row) => row.lightProviderName },
                { label: 'Payment Status', render: (row) => row.paymentStatus }
              ])}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {tabIndex === 1 && (
        /* Sponsors Table */
        renderTable('Sponsors', sponsors, [
          { label: 'Event', render: (row) => events.find(event => event._id === row.eventID)?.eventName || 'N/A' },
          { label: 'Sponsor Name', render: (row) => row.sponsorName },
          { label: 'Contact Person', render: (row) => row.contactPerson },
          { label: 'Amount', render: (row) => `$${row.sponsorshipAmount}` }
        ])
      )}

      {tabIndex === 2 && (
        /* Volunteers Table */
        renderTable('Volunteers', volunteers, [
          { label: 'Event', render: (row) => events.find(event => event._id === row.eventID)?.eventName || 'N/A' },
          { label: 'Name', render: (row) => row.name },
          { label: 'Role', render: (row) => row.role },
          { label: 'Email', render: (row) => row.email }
        ])
      )}

      {tabIndex === 3 && (
        /* Organizers Table */
        renderTable('Organizers', organizers, [
          { label: 'Event', render: (row) => events.find(event => event._id === row.eventID)?.eventName || 'N/A' },
          { label: 'Organizer Name', render: (row) => row.organizerName },
          { label: 'Role', render: (row) => row.organizerRole },
          { label: 'Contact', render: (row) => row.organizerContact }
        ])
      )}

      {tabIndex === 4 && (
        /* Feedbacks Table */
        renderTable('Feedbacks', feedback, [
          { label: 'Event', render: (row) => events.find(event => event._id === row.eventId)?.eventName || 'N/A' },
          { label: 'Feedback Text', render: (row) => row.feedbackText },
          { label: 'Rating', render: (row) => row.rating },
          { label: 'Submitted By', render: (row) => (row.anonymous ? 'Anonymous' : row.name) }
        ])
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminHome;
