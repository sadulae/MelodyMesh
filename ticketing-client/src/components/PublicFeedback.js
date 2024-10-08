import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Rating,
  Box,
  Skeleton,
} from '@mui/material';
import axios from 'axios';

const PublicFeedback = () => {
  const [eventsWithFeedbacks, setEventsWithFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events and their feedbacks on component mount
  useEffect(() => {
    const fetchEventsAndFeedbacks = async () => {
      try {
        const eventsResponse = await axios.get('http://localhost:5000/api/events');
        const eventsData = eventsResponse.data;

        // Fetch all feedbacks in parallel
        const feedbackPromises = eventsData.map((event) =>
          axios
            .get(`http://localhost:5000/api/public-feedback/${event._id}`)
            .then((response) => ({
              event,
              feedbacks: response.data,
            }))
            .catch((feedbackError) => {
              console.error(`Error fetching feedback for event ${event.title}:`, feedbackError);
              return null; // Exclude events with failed feedback fetch
            })
        );

        const feedbackResults = await Promise.all(feedbackPromises);

        // Filter out events without feedbacks or with fetch errors
        const validEventsWithFeedbacks = feedbackResults.filter(
          (result) => result && result.feedbacks.length > 0
        );

        setEventsWithFeedbacks(validEventsWithFeedbacks);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Unable to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndFeedbacks();
  }, []);

  // Calculate average rating for an event
  const calculateAverageRating = (feedbacks) => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
    return total / feedbacks.length;
  };

  return (
    <Container sx={{ paddingY: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ color: '#3f51b5', fontWeight: 'bold' }}
      >
        Event Feedbacks
      </Typography>

      {loading ? (
        <Grid container spacing={4}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ backgroundColor: '#ffffff', boxShadow: 1 }}>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={20} width="60%" />
                <Box display="flex" alignItems="center" mt={1}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" height={20} width="30%" sx={{ marginLeft: 1 }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ marginTop: 4 }}>
          {error}
        </Alert>
      ) : eventsWithFeedbacks.length > 0 ? (
        <Grid container spacing={4}>
          {eventsWithFeedbacks.map(({ event, feedbacks }) => (
            <Grid item xs={12} key={event._id}>
              <Card sx={{ backgroundColor: '#ffffff', boxShadow: 1, padding: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: '#3f51b5',
                      width: 56,
                      height: 56,
                      marginRight: { md: 2 },
                      marginBottom: { xs: 2, md: 0 },
                      fontSize: 24,
                    }}
                  >
                    {event.title.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(event.date).toLocaleDateString()} | {event.location}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating
                        value={calculateAverageRating(feedbacks)}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ color: '#ffb400' }}
                      />
                      <Typography variant="body2" color="textSecondary" ml={1}>
                        ({feedbacks.length} feedback{feedbacks.length > 1 ? 's' : ''})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ paddingY: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#3f51b5' }}>
                    Feedbacks
                  </Typography>
                  <Grid container spacing={2}>
                    {feedbacks.map((fb) => (
                      <Grid item xs={12} sm={6} md={4} key={fb._id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            backgroundColor: '#fafafa',
                            borderColor: '#c5cae9',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            },
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item>
                                <Avatar sx={{ bgcolor: '#3f51b5', color: '#ffffff' }}>
                                  {fb.anonymous ? 'A' : fb.name.charAt(0)}
                                </Avatar>
                              </Grid>
                              <Grid item>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ color: '#3f51b5', fontWeight: 'medium' }}
                                >
                                  {fb.anonymous ? 'Anonymous' : fb.name}
                                </Typography>
                                {!fb.anonymous && (
                                  <Typography variant="body2" color="textSecondary">
                                    {fb.email}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                            <Typography variant="body1" sx={{ marginTop: 2, color: '#333333' }}>
                              {fb.feedbackText}
                            </Typography>
                            <Rating
                              value={fb.rating}
                              precision={0.5}
                              readOnly
                              sx={{ marginTop: 2, color: '#ffb400' }}
                              size="small"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" align="center" sx={{ marginTop: 4, color: '#757575' }}>
          No reviews available for any events.
        </Typography>
      )}
    </Container>
  );
};

export default PublicFeedback;
