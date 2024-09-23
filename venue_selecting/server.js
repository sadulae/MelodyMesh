const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sadula:1234@cluster0.lhliwgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', 
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Define a schema and model
const placeSchema = new mongoose.Schema({
  placeName: String,
  address: String,
  phoneNum: String,
  email: String,
  category: String,
  photos: String,
  latitude: Number,
  longitude: Number,
});

const Place = mongoose.model('Place', placeSchema);

// Define the POST route to handle form submission
app.post('/submit', async (req, res) => {
  try {
    const newPlace = new Place(req.body);
    await newPlace.save();
    res.status(201).json({ message: 'Place details saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving place details', error });
  }
});

// Route to get all data
app.get('/submit', async (req, res) => {
  try {
    const forms = await Place.find(); // Fetch all data from MongoDB
    res.status(200).send(forms);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Example backend route in Node.js/Express
app.delete('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Place.findByIdAndDelete(id); // Replace `Place` with your actual model
    if (result) {
      res.status(200).send('Place deleted successfully');
    } else {
      res.status(404).send('Place not found');
    }
  } catch (error) {
    res.status(500).send('Error deleting the place');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
