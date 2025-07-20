const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
    index: true
  },
  socketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isOnline: {
    type: Boolean,
    default: true,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'Hey there! I am using ChatApp',
    maxlength: 100
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 