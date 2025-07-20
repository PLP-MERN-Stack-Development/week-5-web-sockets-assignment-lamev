const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    trim: true
  },
  senderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  recipientId: {
    type: String,
    default: null
  },
  room: {
    type: String,
    default: 'global'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    userId: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    userId: String,
    reaction: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ room: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema); 