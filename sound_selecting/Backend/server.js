const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://sadula:1234@cluster0.lhliwgv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a schema and model
const SoundSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },  // Changed to String
  email: { type: String, required: true },
  equipmentTypes: [String],
  rate: { type: String, required: true },
});

const Sound = mongoose.model('Sound', SoundSchema);

// POST route to handle form submission
app.post('/submit', async (req, res) => {
  try {
    const newSound = new Sound(req.body); // Correct instantiation with 'new'
    await newSound.save();
    res.status(201).json({ message: 'Place details saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving place details', error });
  }
});

// GET route to retrieve all data
app.get('/submit', async (req, res) => {
  try {
    const forms = await Sound.find(); // Fetch all records
    res.status(200).json(forms); // Return as JSON
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving sound provider details', error });
  }
});

// DELETE route to delete a record by ID
app.delete('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Sound.findByIdAndDelete(id); // Delete by ID
    if (result) {
      res.status(200).json({ message: 'Sound provider deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sound provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the sound provider', error });
  }
});

// PUT route to update a record by ID
app.put('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSound = await Sound.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Update by ID

    if (updatedSound) {
      res.status(200).json({ message: 'Sound provider updated successfully', data: updatedSound });
    } else {
      res.status(404).json({ message: 'Sound provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating the sound provider', error });
  }
});

const { Parser } = require('json2csv');

// Endpoint to generate and download a report
app.get('/generate-report', async (req, res) => {
  try {
    const soundProviders = await Sound.find(); // Fetch all sound provider data
    const fields = ['providerName', 'phoneNumber', 'email', 'equipmentTypes', 'rate'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(soundProviders);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('sound_providers_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/* *********************************************************************************************************************** */

//Lighting schema
const LightingSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },  // Changed to String
  email: { type: String, required: true },
  equipmentTypes: [String],
  rate: { type: String, required: true },
});

const Light = mongoose.model('Light', LightingSchema);

// POST route to handle form submission
app.post('/submit/Light', async (req, res) => {
  try {
    const newLight = new Light(req.body); // Correct instantiation with 'new'
    await newLight.save();
    res.status(201).json({ message: 'Place details saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving place details', error });
  }
});

// GET route to retrieve all data
app.get('/submit/Light', async (req, res) => {
  try {
    const forms = await Light.find(); // Fetch all records
    res.status(200).json(forms); // Return as JSON
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving sound provider details', error });
  }
});


// PUT route to update a record by ID
app.put('/api/Light/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSound = await Light.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Update by ID
  
      if (updatedLight) {
        res.status(200).json({ message: 'Sound provider updated successfully', data: updatedLight });
      } else {
        res.status(404).json({ message: 'Sound provider not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating the sound provider', error });
    }
  });


