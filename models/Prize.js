const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  value: {
    type: Number,
    required: true
  },
  imageUrl: String,
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  probability: { // Weight for random selection
    type: Number,
    required: true,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prize', prizeSchema);