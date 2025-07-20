const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
    
    try {
      const conn = await mongoose.connect(mongoURI);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      return true; // MongoDB is available
    } catch (mongoError) {
      console.warn('⚠️ MongoDB connection failed, using in-memory storage:', mongoError.message);
      console.log('💡 To use MongoDB, install it locally or set up MongoDB Atlas');
      console.log('🔧 The app will work with in-memory storage for now');
      return false; // MongoDB is not available
    }

  } catch (error) {
    console.error('Error in database setup:', error.message);
    return false;
  }
};

module.exports = connectDB; 