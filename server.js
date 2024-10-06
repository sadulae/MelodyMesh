// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://sadula:1234@cluster0.lhliwgv.mongodb.net/test?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


// bandDetails Shema for MongoDB
const bandSchema = new mongoose.Schema({
  event: { type: String, required: true },
  band: { type: String, required: true },
  performers: { type: String, required: true },
  timeSlot: { type: String, required: true }
});

const BandDetail = mongoose.model('BandDetail', bandSchema);

// Validation schema
const schema = Joi.object({
  event: Joi.string().required(),
  band: Joi.string().required(),
  performers: Joi.string().required(),
  timeSlot: Joi.string().required()
});

// Routes
app.post('/api/save-band', async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const bandDetail = new BandDetail(req.body);
    await bandDetail.save();
    res.status(201).send(bandDetail);
  } catch (err) {
    console.error('Error saving band details:', err);
    res.status(500).send('Server Error');
  }
});


  
// Payment Schema for MongoDB
const paymentSchema = new mongoose.Schema({
  date: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Validation schema for payments using Joi
const paymentValidationSchema = Joi.object({
  date: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().required().min(0)
});

// Route to save payment data
app.post('/api/save-payment', async (req, res) => {
  const { payments } = req.body;
  
  // Validate each payment entry
  for (const payment of payments) {
    const { error } = paymentValidationSchema.validate(payment);
    if (error) return res.status(400).send(error.details[0].message);
  }

  try {
    // Save all payments to MongoDB
    const savedPayments = await Payment.insertMany(payments);
    res.status(201).send(savedPayments);
  } catch (err) {
    console.error('Error saving payment data:', err);
    res.status(500).send('Server Error');
  }
});

// Route to get payment data based on date range and performer
app.post('/api/get-payments', async (req, res) => {
  const { startDate, endDate, performer } = req.body;

  try {
    const query = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (performer) {
      query.description = performer; // Assuming performer is stored in description
    }

    const payments = await Payment.find(query);
    res.status(200).json(payments);
  } catch (err) {
    console.error('Error fetching payment data:', err);
    res.status(500).send('Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
