# 🔄 Real-Time Chat Application with Socket.io

A modern, real-time chat application built with React, Socket.io, and Node.js that demonstrates bidirectional communication between clients and server.

## 🚀 Features Implemented

### ✅ Core Chat Functionality
- **User Authentication**: Simple username-based authentication
- **Global Chat Room**: All users can send and receive messages in real-time
- **Message Display**: Messages show sender's name and timestamp
- **Typing Indicators**: Real-time "user is typing" notifications
- **Online/Offline Status**: Live user status updates with connection indicators

### ✅ Advanced Chat Features
- **Private Messaging**: Direct messaging between users
- **Multiple Chat Rooms**: Global chat and private conversations
- **User List**: Real-time online users sidebar
- **Message Filtering**: Separate views for global and private messages
- **Connection Status**: Visual indicators for connection state

### ✅ Real-Time Notifications
- **In-App Notifications**: Notification panel with message history
- **Browser Notifications**: Web Notifications API integration
- **Sound Notifications**: Audio alerts for new messages
- **Unread Message Count**: Badge showing unread notifications
- **User Join/Leave Notifications**: System messages for user events

### ✅ Performance and UX Optimization
- **Auto-scroll**: Messages automatically scroll to bottom
- **Responsive Design**: Works on desktop and mobile devices
- **Message Animations**: Smooth slide-in animations for new messages
- **Typing Debouncing**: Optimized typing indicators with timeouts
- **Error Handling**: Graceful handling of connection issues
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - Database for persistent storage
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time client communication
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd week-5-web-sockets-assignment-lamev
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup

Create `.env` files in both server and client directories:

**For MongoDB Atlas (cloud):**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string
- Replace `mongodb://localhost:27017/chatapp` with your Atlas connection string

**For local MongoDB:**
- Install MongoDB locally
- Start MongoDB service
- Use the default local connection string

**Server (.env):**
```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatapp
```

**Client (.env):**
```
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Start the Application

**Start the server:**
```bash
cd server
npm run dev
```

**Start the client (in a new terminal):**
```bash
cd client
npm run dev
```

The application will be available at:
- **Client**: http://localhost:5173
- **Server**: http://localhost:5000

## 🎯 How to Use

1. **Join the Chat**: Enter your username and click "Join Chat"
2. **Send Messages**: Type in the message input and press Enter or click Send
3. **Private Messages**: Click on a user in the sidebar to start a private conversation
4. **View Notifications**: Click the bell icon to see recent notifications
5. **User Status**: Green dots indicate online users
6. **Typing Indicators**: See when other users are typing
7. **Logout**: Click the logout button to disconnect

## 🔧 API Endpoints

### Socket.io Events

**Client to Server:**
- `user_join` - Join chat with username
- `send_message` - Send message to global chat
- `private_message` - Send private message to specific user
- `typing` - Update typing status

**Server to Client:**
- `user_list` - Updated list of online users
- `receive_message` - New message received
- `private_message` - Private message received
- `user_joined` - User joined notification
- `user_left` - User left notification
- `typing_users` - List of users currently typing

### REST API Endpoints

- `GET /api/messages` - Get all messages
- `GET /api/users` - Get all online users
- `GET /` - Server status

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes and orientations

## 🔒 Security Features

- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Rate limiting considerations
- Secure WebSocket connections

## 🚀 Deployment

### Server Deployment (Render/Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update the client's `VITE_SOCKET_URL` to point to your deployed server

### Client Deployment (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `dist` folder
3. Ensure the socket URL is correctly configured

## 🧪 Testing

To test the real-time features:
1. Open multiple browser tabs/windows
2. Join with different usernames
3. Send messages and observe real-time updates
4. Test private messaging between users
5. Test typing indicators
6. Test notifications and sound alerts

## 📸 Screenshots

*[Screenshots would be added here showing the login screen, chat interface, and various features]*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created for educational purposes as part of the Week 5 Web Sockets assignment.

## 👨‍💻 Author

Built with ❤️ for real-time communication learning.

---

**Note**: This application demonstrates the power of Socket.io for real-time bidirectional communication, implementing all the required features from the assignment including live messaging, notifications, and online status updates. 