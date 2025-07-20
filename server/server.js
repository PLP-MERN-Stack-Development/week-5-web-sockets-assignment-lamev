// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const Message = require('./models/Message');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and typing users (in-memory for real-time features)
const users = {};
const typingUsers = {};
let isMongoDBAvailable = false;

// Socket.io connection handler
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', async (username) => {
    try {
      if (isMongoDBAvailable) {
        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser.socketId !== socket.id) {
          socket.emit('username_taken', { message: 'Username is already taken' });
          return;
        }

        // Create or update user in database
        const user = await User.findOneAndUpdate(
          { username },
          { 
            username, 
            socketId: socket.id, 
            isOnline: true, 
            lastSeen: new Date() 
          },
          { upsert: true, new: true }
        );
      } else {
        // Check if username is already taken in memory
        const existingUser = Object.values(users).find(u => u.username === username);
        if (existingUser && existingUser.id !== socket.id) {
          socket.emit('username_taken', { message: 'Username is already taken' });
          return;
        }
      }

      // Store in memory for real-time features
      users[socket.id] = { username, id: socket.id };
      
      // Get all online users
      const onlineUsers = isMongoDBAvailable 
        ? await User.find({ isOnline: true })
        : Object.values(users);
      
      io.emit('user_list', onlineUsers);
      io.emit('user_joined', { username, id: socket.id });
      
      console.log(`${username} joined the chat`);
    } catch (error) {
      console.error('Error joining user:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (messageData) => {
    try {
      const messageObj = {
        id: Date.now(),
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message: messageData.message,
        room: 'global',
        timestamp: new Date().toISOString()
      };

      if (isMongoDBAvailable) {
        const message = new Message(messageObj);
        await message.save();
        messageObj.id = message._id;
      }
      
      io.emit('receive_message', messageObj);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', async ({ to, message }) => {
    try {
      const messageObj = {
        id: Date.now(),
        sender: users[socket.id]?.username || 'Anonymous',
        senderId: socket.id,
        message,
        isPrivate: true,
        recipientId: to,
        timestamp: new Date().toISOString()
      };

      if (isMongoDBAvailable) {
        const messageData = new Message(messageObj);
        await messageData.save();
        messageObj.id = messageData._id;
      }
      
      socket.to(to).emit('private_message', messageObj);
      socket.emit('private_message', messageObj);
    } catch (error) {
      console.error('Error saving private message:', error);
      socket.emit('error', { message: 'Failed to send private message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      if (users[socket.id]) {
        const { username } = users[socket.id];
        
        if (isMongoDBAvailable) {
          // Update user status in database
          await User.findOneAndUpdate(
            { socketId: socket.id },
            { 
              isOnline: false, 
              lastSeen: new Date() 
            }
          );
        }
        
        io.emit('user_left', { username, id: socket.id });
        console.log(`${username} left the chat`);
      }
      
      delete users[socket.id];
      delete typingUsers[socket.id];
      
      // Get updated online users
      const onlineUsers = isMongoDBAvailable 
        ? await User.find({ isOnline: true })
        : Object.values(users);
      
      io.emit('user_list', onlineUsers);
      io.emit('typing_users', Object.values(typingUsers));
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// API routes
app.get('/api/messages', async (req, res) => {
  try {
    if (isMongoDBAvailable) {
      const { page = 1, limit = 50, room = 'global' } = req.query;
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({ room })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      res.json(messages.reverse()); // Return in chronological order
    } else {
      res.json([]); // Return empty array when MongoDB is not available
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    if (isMongoDBAvailable) {
      const users = await User.find({ isOnline: true }).lean();
      res.json(users);
    } else {
      res.json(Object.values(users)); // Return in-memory users
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/messages/private/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({
      isPrivate: true,
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching private messages:', error);
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    isMongoDBAvailable = await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready for connections`);
      if (!isMongoDBAvailable) {
        console.log(`💾 Using in-memory storage (MongoDB not available)`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io }; 