const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use(errorHandler);
app.use('/api/admin', adminRoutes); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
