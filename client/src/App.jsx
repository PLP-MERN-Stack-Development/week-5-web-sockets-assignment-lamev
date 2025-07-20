import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './socket/socket';
import { Send, Users, MessageCircle, Bell, Settings, LogOut } from 'lucide-react';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  const {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new messages and notifications
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Don't show notification for own messages
      if (lastMessage.senderId !== socket.id && !lastMessage.system) {
        addNotification(`New message from ${lastMessage.sender}: ${lastMessage.message}`);
        playNotificationSound();
      }
    }
  }, [messages, socket.id]);

  // Handle typing indicators
  useEffect(() => {
    if (typingUsers.length > 0) {
      const typingText = typingUsers.join(', ');
      if (typingUsers.length === 1) {
        setShowNotifications(true);
        setTimeout(() => setShowNotifications(false), 3000);
      }
    }
  }, [typingUsers]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      connect(username);
      setIsLoggedIn(true);
      localStorage.setItem('username', username);
    }
  };

  const handleLogout = () => {
    disconnect();
    setIsLoggedIn(false);
    setUsername('');
    setSelectedUser(null);
    localStorage.removeItem('username');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (selectedUser) {
        sendPrivateMessage(selectedUser.id || selectedUser.socketId, message);
      } else {
        sendMessage(message);
      }
      setMessage('');
      setTyping(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false);
    }, 1000);
  };

  const addNotification = (text) => {
    const newNotification = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    setUnreadCount(prev => prev + 1);

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Message', { body: text });
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentUser = () => {
    return users.find(user => user.id === socket.id);
  };

  const filteredMessages = selectedUser 
    ? messages.filter(msg => 
        (msg.senderId === selectedUser.id && msg.senderId !== socket.id) ||
        (msg.senderId === socket.id && msg.isPrivate) ||
        (msg.recipientId === selectedUser.id && msg.senderId === socket.id)
      )
    : messages.filter(msg => !msg.isPrivate);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Chat</h1>
            <p className="text-gray-600">Enter your username to start chatting</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900">Real-Time Chat</h1>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Users className="w-5 h-5" />
                  <span className="ml-1 text-sm font-medium">{users.length}</span>
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm">No notifications</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notifications.map(notification => (
                            <div key={notification.id} className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                              {notification.text}
                              <div className="text-xs text-gray-500 mt-1">
                                {formatTime(notification.timestamp)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* User List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Users</h2>
              <div className="space-y-2 max-h-full overflow-y-auto">
                <button
                  onClick={() => setSelectedUser(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    !selectedUser 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Global Chat</span>
                  </div>
                </button>
                
                {users.map(user => (
                  <button
                    key={user.id || user.socketId}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUser?.id === user.id || selectedUser?.socketId === user.socketId
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">{user.username}</span>
                        {(user.id === socket.id || user.socketId === socket.id) && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedUser ? `Chat with ${selectedUser.username}` : 'Global Chat'}
                </h2>
                {typingUsers.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-enter ${
                      msg.system 
                        ? 'text-center' 
                        : msg.senderId === socket.id 
                          ? 'text-right' 
                          : 'text-left'
                    }`}
                  >
                    {msg.system ? (
                      <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                        {msg.message}
                      </div>
                    ) : (
                      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderId === socket.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="font-medium text-sm mb-1">
                          {msg.sender}
                          {msg.isPrivate && (
                            <span className="ml-2 text-xs opacity-75">(Private)</span>
                          )}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                        <div className={`text-xs mt-1 ${
                          msg.senderId === socket.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    placeholder={selectedUser ? `Message ${selectedUser.username}...` : "Type your message..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 