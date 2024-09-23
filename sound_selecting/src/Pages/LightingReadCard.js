import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {Card, Grid, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
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
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import PrintIcon from '@mui/icons-material/Print';


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
  const [editData, setEditData] = useState(null);  // Store the data for editing
  const [open, setOpen] = useState(false);  // To control the dialog/modal visibility

  // Fetch form data from the backend
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/submit/Light');
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchFormData();
  }, []);

  const handleExpandClick = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  // Handle the delete action
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/places/${id}`);
      if (response.status === 200) {
        alert('Location Deleted Successfully');
        setFormData(formData.filter(item => item._id !== id));
      } else {
        alert('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('An error occurred while deleting the location');
    }
  };

  // Open the edit dialog
  const handleEditClick = (data) => {
    setEditData(data); // Set the current data to edit
    setOpen(true); // Open the dialog/modal
  };

  // Handle input change in the update form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/generate-report', {
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sound_providers_report.csv'); // Set the file name
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };

  // Handle the update action
  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/Light/${editData._id}`, editData);
      if (response.status === 200) {
        alert('Updated Successfully');
        setFormData(
          formData.map(item => item._id === editData._id ? editData : item)
        );
        setOpen(false);  // Close the dialog/modal
      } else {
        alert('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Updated Successfully');
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {formData.length > 0 ? (
          formData.map((data, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ maxWidth: 345, ml: 5, mt: 5 }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                      {data?.providerName?.[0]?.toUpperCase() || 'N/A'}
                    </Avatar>
                  }
                  title={data?.providerName || 'No provider Name'}
                  subheader={data?.phoneNumber || 'No phone number'}
                />
                <Carousel
                  autoPlay
                  interval={1000}
                  infiniteLoop
                  showThumbs={false}
                  showStatus={false}
                  dynamicHeight
                >
                </Carousel>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {data?.providerName || 'No provider name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {data?.phoneNumber || 'No Phone Number'}
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

                  <IconButton
                    aria-label="edit"
                    onClick={() => handleEditClick(data)}  // Open the edit form
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton 
                    aria-label="Generate Report"
                    onClick={handleGenerateReport}
                  >
                    <PrintIcon/>
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
                    <Typography variant="body2" color="text.secondary">
                      Equipment Types: {data?.equipmentTypes?.join(', ') || 'No Equipment Types'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Rate: {data?.rate || 'No Rate'}
                    </Typography>
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
          <Typography variant="h6" color="text.secondary" align="center">
            No data available
          </Typography>
        )}
      </Grid>

      {/* Edit Dialog/Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Provider Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Provider Name"
            name="providerName"
            value={editData?.providerName || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={editData?.phoneNumber || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={editData?.email || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Rate"
            name="rate"
            value={editData?.rate || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          {/* Add more fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>          
        </DialogActions>
      </Dialog>
    </>
  );
}
