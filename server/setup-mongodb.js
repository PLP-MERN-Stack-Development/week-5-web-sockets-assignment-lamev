const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');

const setupMongoDB = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');

    // Create indexes
    await Message.createIndexes();
    await User.createIndexes();

    console.log('✅ Database indexes created');

    // Test database operations
    const testUser = new User({
      username: 'test_user',
      socketId: 'test_socket_id',
      isOnline: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    await User.deleteOne({ username: 'test_user' });
    console.log('✅ Test user cleaned up');

    console.log('🎉 MongoDB setup completed successfully!');
    console.log('📝 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running locally');
    console.log('2. Or use MongoDB Atlas connection string');
    console.log('3. Check your .env file has MONGODB_URI set');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

setupMongoDB(); 