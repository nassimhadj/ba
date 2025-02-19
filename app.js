const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Add this before your routes


const rdvRoutes = require('./routes/rdv');
const AppointementRoutes = require('./routes/appointment');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
// src/app.js


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rdv-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch((err) => {
  console.error('Erreur de connexion MongoDB:', err);
});
// Routes
app.use('/api/rdv', rdvRoutes);
app.use('/api/appointments', AppointementRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

module.exports = app;