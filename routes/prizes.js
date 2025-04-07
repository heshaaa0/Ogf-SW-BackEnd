const express = require('express');
const router = express.Router();
const Prize = require('../models/Prize');

// Get all active prizes with quantity > 0
router.get('/available', async (req, res) => {
  try {
    const prizes = await Prize.find({ 
      isActive: true, 
      quantity: { $gt: 0 } 
    });
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;