require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users.js');

const app = express();

// Middleware
app.use(express.json());

//set the cors
app.use(cors({
  origin: '*' // Allow all origins (for development)
  // For production, specify your frontend URL:
  // origin: 'http://yourfrontenddomain.com'
}));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // 3 seconds timeout for initial connection
      socketTimeoutMS: 45000 // 45 seconds timeout for queries
    });
    console.log('MongoDB pre-connected');
  } catch (err) {
    console.error('Initial MongoDB connection error:', err);
  }
};


connectDB();

let isConnecting = false;
let connectionQueue = [];

async function handleDBConnection() {
  if (mongoose.connection.readyState === 1) return;
  
  if (isConnecting) {
    return new Promise(resolve => {
      connectionQueue.push(resolve);
    });
  }

  isConnecting = true;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connectionQueue.forEach(resolve => resolve());
    connectionQueue = [];
  } finally {
    isConnecting = false;
  }
}

// Use in your routes:
app.get('/api/data', async (req, res) => {
  await handleDBConnection();
  // ... your route logic
});

let cachedDb = null;

async function getDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return cachedDb;
}

// Routes
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.json({ status: 'API working' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});