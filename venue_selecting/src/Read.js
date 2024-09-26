import React, { useEffect, useState } from 'react';  
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid } from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';

// import image1 from '';
// import image2 from './images/download (1).jpg';
// import image3 from '';
import image4 from './assets/Gunner.gif';
import MapView from './MapView';

// const imageStyle = {
//   height: '400px',
//   objectFit: 'cover',
//   width: '100%'
// };

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

export default function RecipeReviewCard() {
  const [expanded, setExpanded] = useState(null);
  const [formData, setFormData] = useState([]);

  // Fetch form data from the backend
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/submit');
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchFormData();
  }, []);

  // Handle the expand action
  const handleExpandClick = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  // Handle the delete action
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/places/${id}`);
      if (response.status === 200) {
        alert('Location Deleted Successfully');
        // Remove the deleted item from the formData state
        setFormData(formData.filter(item => item._id !== id));
      } else {
        alert('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('An error occurred while deleting the location');
    }
  };

  return (
    <Grid container spacing={3}>
      {formData.length > 0 ? (
        formData.map((data, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ maxWidth: 345, ml: 5, mt: 10, mb:5}}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                    {data?.placeName?.[0]?.toUpperCase() || 'N/A'}
                  </Avatar>
                }
                title={data?.placeName || 'No Place Name'}
                subheader={data?.category || 'No Category'}
              />
              <Carousel
                autoPlay
                interval={1000}
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                dynamicHeight
              >
                {/* <div>
                  <img src={image1} alt="Dish 1" style={imageStyle} />
                </div> */}
                {/* <div>
                  <img src={image2} alt="Another dish" style={imageStyle} />
                </div> */}
                {/* <div>
                  <img src={image3} alt="Yet another dish" style={imageStyle} />
                </div> */}
              </Carousel>
              <CardContent>
                <Grid item xs={12} sm={6}>
                  <MapView />
                </Grid>
                <Typography variant="body2" color="text.secondary">
                  Address: {data?.address || 'No Address'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {data?.phoneNum || 'No Phone Number'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {data?.email || 'No Email'}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
                <IconButton aria-label="share">
                  <ShareIcon />
                </IconButton>
                <ExpandMore
                  expand={expanded === index}
                  onClick={() => handleExpandClick(index)}
                  aria-expanded={expanded === index}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              <Collapse in={expanded === index} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography paragraph>More Details:</Typography>
                  <Typography paragraph>{data?.additionalDetails || 'No additional details available.'}</Typography>
                  <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(data._id)} // Pass the _id to the delete handler
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))
      ) : (
        <div>
          <Typography variant="h6" color="text.secondary" align="center">
            No data available
          </Typography>
          <Grid item xs={12}>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', height:'200px'}}>
              <img src={image4} alt='Gunner' />
            </div>
          </Grid>
        </div>
      )}
    </Grid>
  );
}
