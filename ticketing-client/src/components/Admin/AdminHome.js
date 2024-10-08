// src/components/Admin/AdminHome.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Box, Grid, Accordion, AccordionSummary, AccordionDetails,
  Snackbar, Alert, Card, CardContent, Chip, Tabs, Tab, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/animations/loading.json';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import html2canvas from 'html2canvas';

pdfMake.vfs = pdfFonts.pdfMake.vfs; // Set the virtual file system for pdfMake

const AdminHome = () => {
  const navigate = useNavigate();
  const [organizerEvents, setOrganizerEvents] = useState([]); // Added
  const [events, setEvents] = useState([]); // Added for Event model
  const [sponsors, setSponsors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [soundLighting, setSoundLighting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#F5B041', '#16A085', '#FF6384', '#36A2EB', '#FFCE56'];

  // Refs for charts
  const sponsorshipChartRef = useRef(null);
  const volunteerChartRef = useRef(null);
  const feedbackChartRef = useRef(null);

  // Fetching data when component mounts
  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you're using token-based auth
        const response = await axios.get('http://localhost:5000/api/admin/all-details', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) { // Only update state if component is still mounted
          // Store data in state
          setOrganizerEvents(response.data.organizerEvents || []); // Set organizerEvents
          setEvents(response.data.events || []); // Set events from Event model
          setSponsors(response.data.sponsors || []);
          setFeedback(response.data.feedbacks || []);
          setVolunteers(response.data.volunteers || []);
          setOrganizers(response.data.organizers || []);
          setLocations(response.data.locations || []);
          setSoundLighting(response.data.soundLighting || []);
          setLoading(false); // Data loading is complete
        }
      } catch (error) {
        console.error('Error fetching consolidated data', error);
        if (isMounted) {
          setError('Error fetching data. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup flag on unmount
    };
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{ backgroundColor: '#ffffff' }}
      >
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          style={{ width: 200, height: 200 }}
        />
      </Box>
    );
  }

  // Group all data by organizerEventID
  const groupedData = organizerEvents.map(event => ({
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
  const sponsorshipData = organizerEvents.map(event => { // Changed to organizerEvents
    const eventSponsors = sponsors.filter(sponsor => sponsor.eventID === event._id);
    const totalAmount = eventSponsors.reduce((sum, sponsor) => sum + sponsor.sponsorshipAmount, 0);
    return { name: event.eventName, amount: totalAmount };
  });

  const volunteerData = organizerEvents.map(event => { // Changed to organizerEvents
    const eventVolunteers = volunteers.filter(volunteer => volunteer.eventID === event._id);
    return { name: event.eventName, volunteers: eventVolunteers.length };
  });

  const feedbackData = feedback.map(fb => ({
    date: new Date(fb.createdAt).toLocaleDateString(),
    rating: fb.rating
  }));

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Function to capture charts and generate PDF
  const generatePdfReport = async () => {
    try {
      const sponsorshipChartElement = sponsorshipChartRef.current;
      const volunteerChartElement = volunteerChartRef.current;
      const feedbackChartElement = feedbackChartRef.current;

      // Capture charts as images
      const sponsorshipChartCanvas = await html2canvas(sponsorshipChartElement);
      const sponsorshipChartImage = sponsorshipChartCanvas.toDataURL('image/png');

      const volunteerChartCanvas = await html2canvas(volunteerChartElement);
      const volunteerChartImage = volunteerChartCanvas.toDataURL('image/png');

      const feedbackChartCanvas = await html2canvas(feedbackChartElement);
      const feedbackChartImage = feedbackChartCanvas.toDataURL('image/png');

      // Prepare PDF content
      const docDefinition = {
        content: [
          // Header Section
          {
            columns: [
              {
                text: 'MelodyMesh',
                color: '#007BFF',
                fontSize: 24,
                bold: true,
                margin: [0, 0, 0, 0],
              },
              {
                text: [
                  { text: 'Email: ', bold: true },
                  'melodymeshevents@gmail.com\n',
                  { text: 'Date of Issue: ', bold: true },
                  new Date().toLocaleDateString(),
                ],
                alignment: 'right',
                margin: [0, 5, 0, 0],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          // Divider Line
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 1,
                lineColor: '#CED4DA',
              },
            ],
            margin: [0, 10, 0, 10],
          },
          {
            text: 'Admin Dashboard Report',
            style: 'header',
            alignment: 'center',
            margin: [0, 0, 0, 20],
          },
          {
            text: `Date: ${new Date().toLocaleDateString()}`,
            alignment: 'right',
            margin: [0, 0, 0, 10],
          },
          {
            text: 'Summary',
            style: 'subheader',
          },
          {
            columns: [
              {
                width: '25%',
                text: `Total Events: ${organizerEvents.length}`, // Changed to organizerEvents
              },
              {
                width: '25%',
                text: `Total Sponsors: ${totalSponsors}`,
              },
              {
                width: '25%',
                text: `Total Volunteers: ${totalVolunteers}`,
              },
              {
                width: '25%',
                text: `Average Rating: ${
                  feedback.length > 0
                    ? (
                        feedback.reduce((sum, fb) => sum + fb.rating, 0) /
                        feedback.length
                      ).toFixed(1)
                    : 'N/A'
                }`,
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: 'Sponsorship Amount per Event',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            image: sponsorshipChartImage,
            width: 500,
            margin: [0, 0, 0, 20],
          },
          {
            text: 'Volunteer Distribution',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            image: volunteerChartImage,
            width: 500,
            margin: [0, 0, 0, 20],
          },
          {
            text: 'Feedback Ratings Over Time',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            image: feedbackChartImage,
            width: 500,
            margin: [0, 0, 0, 20],
          },
          {
            text: 'Event Details',
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          ...organizerEvents.map((event) => { // Changed to organizerEvents
            const eventSponsors = sponsors.filter((sponsor) => sponsor.eventID === event._id);
            const eventVolunteers = volunteers.filter((volunteer) => volunteer.eventID === event._id);
            const eventFeedbacks = feedback.filter((fb) => fb.eventId === event._id);
            const eventLocations = locations.filter((loc) => loc.eventID === event._id);
            const eventSoundLighting = soundLighting.filter((sl) => sl.eventID === event._id);

            return [
              {
                text: `${event.eventName} (${new Date(event.eventDate).toLocaleDateString()})`,
                style: 'eventHeader',
                margin: [0, 10, 0, 5],
              },
              {
                text: `Description: ${event.description || 'N/A'}`,
              },
              {
                text: `Location: ${event.location || 'N/A'}`,
              },
              {
                text: `Status: ${event.status || 'Unknown'}`,
                margin: [0, 0, 0, 10],
              },
              {
                text: 'Sponsors:',
                style: 'tableHeader',
                margin: [0, 5, 0, 5],
              },
              eventSponsors.length > 0
                ? {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*'],
                      body: [
                        ['Sponsor Name', 'Contact Person', 'Amount', 'Status'],
                        ...eventSponsors.map((sponsor) => [
                          sponsor.sponsorName,
                          sponsor.contactPerson,
                          `LKR${sponsor.sponsorshipAmount}`,
                          sponsor.status || 'N/A',
                        ]),
                      ],
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                  }
                : { text: 'No sponsors for this event.', margin: [0, 0, 0, 10] },
              {
                text: 'Volunteers:',
                style: 'tableHeader',
                margin: [0, 5, 0, 5],
              },
              eventVolunteers.length > 0
                ? {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*'],
                      body: [
                        ['Name', 'Role', 'Email', 'Phone'],
                        ...eventVolunteers.map((volunteer) => [
                          volunteer.name,
                          volunteer.role,
                          volunteer.email,
                          volunteer.phone,
                        ]),
                      ],
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                  }
                : { text: 'No volunteers for this event.', margin: [0, 0, 0, 10] },
              {
                text: 'Feedbacks:',
                style: 'tableHeader',
                margin: [0, 5, 0, 5],
              },
              eventFeedbacks.length > 0
                ? {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*'],
                      body: [
                        ['Feedback Text', 'Rating', 'Submitted By'],
                        ...eventFeedbacks.map((fb) => [
                          fb.feedbackText,
                          fb.rating,
                          fb.anonymous ? 'Anonymous' : fb.name || 'N/A',
                        ]),
                      ],
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 10],
                  }
                : { text: 'No feedbacks for this event.', margin: [0, 0, 0, 10] },
            ];
          }),
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
          },
          subheader: {
            fontSize: 16,
            bold: true,
          },
          eventHeader: {
            fontSize: 14,
            bold: true,
            color: '#007BFF',
          },
          tableHeader: {
            bold: true,
            fillColor: '#E9ECEF',
            color: '#495057',
          },
        },
        defaultStyle: {
          fontSize: 11,
          color: '#212529',
        },
        pageMargins: [40, 60, 40, 60],
        footer: (currentPage, pageCount) => ({
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        }),
      };

      // Generate PDF
      pdfMake.createPdf(docDefinition).download('admin_dashboard_report.pdf');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setError('Error generating PDF report.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}> {/* Updated styles */}
      <Typography variant="h4" gutterBottom align="center">
        Admin Dashboard
      </Typography>

      {/* Download Report Button */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Button variant="contained" color="primary" onClick={generatePdfReport}>
          Download Report
        </Button>
      </Box>

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
                  <Typography variant="h4">{organizerEvents.length}</Typography> {/* Changed */}
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
                    {feedback.length > 0
                      ? (
                          feedback.reduce((sum, fb) => sum + fb.rating, 0) /
                          feedback.length
                        ).toFixed(1)
                      : 'N/A'}
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
            <div ref={sponsorshipChartRef}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sponsorshipData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" name="Sponsorship Amount">
                    {sponsorshipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Volunteer Distribution</Typography>
            <div ref={volunteerChartRef}>
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom align="center">Feedback Ratings Over Time</Typography>
            <div ref={feedbackChartRef}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={feedbackData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rating" stroke="#ff7300" name="Rating" />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
          { 
            label: 'Event', 
            render: (row) => organizerEvents.find(event => event._id === row.eventID)?.eventName || 'N/A' 
          }, // Changed to organizerEvents
          { label: 'Sponsor Name', render: (row) => row.sponsorName },
          { label: 'Contact Person', render: (row) => row.contactPerson },
          { label: 'Amount', render: (row) => `LKR${row.sponsorshipAmount}` }
        ])
      )}

      {tabIndex === 2 && (
        /* Volunteers Table */
        renderTable('Volunteers', volunteers, [
          { 
            label: 'Event', 
            render: (row) => organizerEvents.find(event => event._id === row.eventID)?.eventName || 'N/A' 
          }, // Changed to organizerEvents
          { label: 'Name', render: (row) => row.name },
          { label: 'Role', render: (row) => row.role },
          { label: 'Email', render: (row) => row.email }
        ])
      )}

      {tabIndex === 3 && (
        /* Organizers Table */
        renderTable('Organizers', organizers, [
          { 
            label: 'Event', 
            render: (row) => organizerEvents.find(event => event._id === row.eventID)?.eventName || 'N/A' 
          }, // Changed to organizerEvents
          { label: 'Organizer Name', render: (row) => row.organizerName },
          { label: 'Role', render: (row) => row.organizerRole },
          { label: 'Contact', render: (row) => row.organizerContact }
        ])
      )}

      {tabIndex === 4 && (
        /* Feedbacks Table */
        renderTable('Feedbacks', feedback, [
          { 
            label: 'Event', 
            render: (row) => events.find(event => event._id === row.eventId)?.title || 'N/A' 
          }, // Use events from Event model
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
