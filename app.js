require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users.js');

const app = express();

// Middleware
app.use(express.json());

// Configure CORS properly
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database connection setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds for initial connection
      socketTimeoutMS: 30000, // 30 seconds for operations
      maxPoolSize: 10, // Limit connection pool size
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // In serverless, you might want to exit here in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Simplified connection handling
let dbConnected = false;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Request timeout middleware
app.use((req, res, next) => {
  // Set timeout for all HTTP requests (8 seconds for 10s limit)
  req.setTimeout(8000, () => {
    res.status(504).json({ error: 'Request timeout' });
  });
  next();
});

// Routes
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.json({ status: 'API working' });
});

// Start server only after DB connection in development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    dbConnected = true;
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  });
} else {
  // For serverless (Vercel), we don't start a server
  module.exports = app;
}