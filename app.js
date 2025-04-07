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