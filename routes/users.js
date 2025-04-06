const express = require('express');
const router = express.Router();
const User = require('../models/Users');

// Check user existence or create new user
router.get('/check-or-create/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    
    // Validate phone number
    if (!phoneNumber || !/^[0-9]{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid phone number format. Must be 10-15 digits.' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phoneNumber });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists',
        user: {
          id: existingUser._id,
          phoneNumber: existingUser.phoneNumber,
          createdAt: existingUser.createdAt
        }
      });
    }

    // Create new user if not exists
    const newUser = new User({ phoneNumber });
    const savedUser = await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'New user created successfully',
      user: {
        id: savedUser._id,
        phoneNumber: savedUser.phoneNumber,
        createdAt: savedUser.createdAt
      }
    });

  } catch (err) {
    console.error('Error in user check-or-create:', err);
    
    // Handle duplicate key error (in case of race condition)
    if (err.code === 11000) {
      const existingUser = await User.findOne({ phoneNumber: req.params.phoneNumber });
      return res.status(409).json({ 
        success: false,
        message: 'User already exists (race condition handled)',
        user: {
          id: existingUser._id,
          phoneNumber: existingUser.phoneNumber,
          createdAt: existingUser.createdAt
        }
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error while processing user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;