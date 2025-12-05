const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Health check
app.get('/', (req, res) => res.json({ success: true, msg: 'charity-backend alive' }));

// routes
const authRoutes = require('./routes/authRoutes');        // /api/auth
const protectedRoutes = require('./routes/protected');   // /api/protected
const causeRoutes = require("./routes/causeRoutes");
const donationRoutes = require("./routes/donationRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use("/api/causes", causeRoutes);
app.use("/api/donations", donationRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

module.exports = app;
