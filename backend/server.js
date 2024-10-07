const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const pageRoutes = require('./routes/pageRoutes'); // Remove if not used
const userRoutes = require('./routes/userRoutes');
const organizerEvents = require('./routes/organizerEvents');
const bandsPerformersRoutes = require('./routes/bandsPerformers');
const newLocationRoutes = require('./routes/NewLocationRoutes'); 
const soundLightingRoutes = require('./routes/soundLightingRoutes');
const volunteersRoutes = require('./routes/volunteers');
const organizersRoutes = require('./routes/organizers');
const sponsorRoutes = require('./routes/sponsors');
const feedbackRoutes = require('./routes/feedbackRoutes');
const feedbackUserRoutes = require('./routes/feedbackUserRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust to your frontend's URL
  credentials: true
}));
app.use(express.json()); // for parsing application/json

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/pages', pageRoutes); // Include only if you have pageRoutes
app.use('/api/users', userRoutes);
app.use('/api/feedback-user', feedbackUserRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', feedbackRoutes);
app.use('/api/admin', organizerEvents);
app.use('/api/admin', bandsPerformersRoutes);
app.use('/api/admin/new-locations', newLocationRoutes); // Register new location route
app.use('/api/admin/sound-lighting', soundLightingRoutes);
app.use('/api/admin/volunteers', volunteersRoutes);
app.use('/api/admin/organizers', organizersRoutes);
app.use('/api/admin/sponsors', sponsorRoutes);


// Error handling middleware (should be after routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
