import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only proceed if user is authenticated
    if (!user || !getToken()) {
      console.log('⏳ FRONTEND: Waiting for user authentication...');
      return;
    }

    console.log('👤 FRONTEND: User authenticated, proceeding with chat setup...');

    // Test token validity first
    testTokenValidity().then(() => {
      fetchChatInfo();
      fetchMessages();
    });

    // Join chat room when component mounts
    if (socket && chatId && isConnected) {
      console.log('🏠 FRONTEND: Joining chat room:', chatId);
      socket.emit('join_chat', chatId);
    }

    // Cleanup: leave chat room when component unmounts
    return () => {
      if (socket && chatId) {
        console.log('🚪 FRONTEND: Leaving chat room:', chatId);
        socket.emit('leave_chat', chatId);
      }
    };
  }, [chatId, socket, isConnected, user]);

  const testTokenValidity = async () => {
    try {
      const token = getToken();
      console.log('🧪 FRONTEND: Testing token validity...');

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log('✅ FRONTEND: Token is valid');
      } else {
        console.error('❌ FRONTEND: Token is invalid:', response.status);
        if (response.status === 401) {
          console.log('🔄 FRONTEND: Redirecting to login...');
          // Could redirect to login here
        }
      }
    } catch (error) {
      console.error('🚨 FRONTEND: Token test failed:', error);
    }
  };

  // Socket event handlers
  useSocketEvent('new_message', (messageData) => {
    console.log('💬 FRONTEND: Received new_message:', messageData);
    if (messageData.chatId === chatId) {
      console.log('   ✅ Message is for current chat, adding to messages');
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const messageExists = prev.some(msg =>
          msg._id === messageData._id ||
          (msg.tempId && msg.tempId === messageData.tempId)
        );

        if (messageExists) {
          // Update existing message (replace temp with real)
          return prev.map(msg =>
            msg.tempId === messageData.tempId
              ? { ...messageData, status: 'sent' }
              : msg
          );
        } else {
          // Add new message
          return [...prev, { ...messageData, status: 'received' }];
        }
      });
    }
  }, [chatId]);

  useSocketEvent('message_sent', (data) => {
    console.log('✅ FRONTEND: Message sent confirmation:', data);
    setIsSending(false);

    // Update the temporary message with the real message data
    if (data.tempId) {
      setMessages(prev => prev.map(msg =>
        msg.tempId === data.tempId
          ? { ...msg, _id: data.messageId, status: 'sent', timestamp: data.timestamp }
          : msg
      ));
    }
  }, []);

  useSocketEvent('error', (error) => {
    console.error('❌ FRONTEND: Socket error:', error);
    setIsSending(false);

    // Remove failed messages
    setMessages(prev => prev.filter(msg => msg.status !== 'sending'));
  }, []);

  const fetchChatInfo = async () => {
    try {
      const token = getToken();
      console.log('🔐 FRONTEND: Using token for chat info:', token ? 'Present' : 'Missing');

      const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Extract other user from participants
        const currentUserId = user?.id || user?._id;
        const otherParticipant = data.data.chat.participants.find(
          p => (p.user._id || p.user.id) !== currentUserId
        );

        // Add otherUser to the data for easier access
        const chatData = {
          ...data.data.chat,
          otherUser: otherParticipant?.user
        };

        setChatInfo({ ...data, data: { chat: chatData } });
      } else if (response.status === 404 && chatId.startsWith('direct_')) {
        // If it's a direct chat that doesn't exist, try to create it
        console.log('📝 FRONTEND: Direct chat not found, attempting to create...');
        await createDirectChatIfNeeded();
      } else if (response.status === 401) {
        console.error('🔐 FRONTEND: Authentication failed - token may be expired');
        // Redirect to login or refresh token
      } else {
        console.error('🚨 FRONTEND: Failed to fetch chat info:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching chat info:', error);
    }
  };

  const createDirectChatIfNeeded = async () => {
    try {
      // Extract the other user ID from the chatId
      // chatId format: direct_userId1_userId2
      const parts = chatId.split('_');
      if (parts.length !== 3) return;

      const userId1 = parts[1];
      const userId2 = parts[2];
      const currentUserId = user?.id || user?._id;

      // Determine which user is the other user
      const otherUserId = userId1 === currentUserId ? userId2 : userId1;

      console.log('🔄 FRONTEND: Creating direct chat with user:', otherUserId);

      const response = await fetch(`http://localhost:5000/api/chats/direct/${otherUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ FRONTEND: Direct chat created:', data);

        // Extract other user from participants
        const currentUserId = user?.id || user?._id;
        const otherParticipant = data.data.chat.participants.find(
          p => (p.user._id || p.user.id) !== currentUserId
        );

        // Add otherUser to the data for easier access
        const chatData = {
          ...data.data.chat,
          otherUser: otherParticipant?.user
        };

        setChatInfo({ ...data, data: { chat: chatData } });
        // Fetch messages after creating the chat
        fetchMessages();
      }
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 FRONTEND: Fetched messages:', result);

        if (result.success && result.data && result.data.messages) {
          const messagesData = result.data.messages;
          console.log('📝 FRONTEND: Setting messages:', messagesData.length, 'messages');
          setMessages(Array.isArray(messagesData) ? messagesData : []);
        } else {
          console.log('📝 FRONTEND: No messages in response');
          setMessages([]);
        }
      } else if (response.status === 404) {
        console.log('📝 FRONTEND: Messages not found (chat may not exist yet)');
        setMessages([]);
      } else {
        console.error('Failed to fetch messages:', response.status, response.statusText);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !socket || !isConnected) return;

    const tempId = Date.now().toString();
    const messageData = {
      tempId,
      chatId,
      content: newMessage.trim(),
      sender: {
        _id: user.id || user._id,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date(),
      status: 'sending',
    };

    // Add message to UI immediately (optimistic update)
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    setIsSending(true);

    try {
      const emitData = {
        chatId,
        content: messageData.content,
        tempId,
      };
      console.log('📤 FRONTEND: Sending message via socket:', emitData);
      socket.emit('send_message', emitData);

      // Set a timeout to reset sending state if no confirmation received
      setTimeout(() => {
        setIsSending(false);
      }, 5000);

    } catch (error) {
      console.error('❌ FRONTEND: Failed to send message:', error);
      // Remove the message from UI on error
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
          <p className="text-sm text-gray-500">
            Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {chatInfo?.data?.chat?.otherUser?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {chatInfo?.data?.chat?.otherUser?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-500">
                {chatInfo?.data?.chat?.otherUser?.role === 'lawyer' ? 'Lawyer' : 'Citizen'}
                {!isConnected && (
                  <span className="ml-2 text-red-500">• Disconnected</span>
                )}
                {isConnected && (
                  <span className="ml-2 text-green-500">• Online</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                if (socket) {
                  console.log('🧪 Testing socket connection...');
                  socket.emit('test_connection', { chatId, timestamp: new Date() });
                }
              }}
              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
            >
              Test Socket
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs text-black">
          <p><strong>Debug Info:</strong></p>
          <p>Chat ID: {chatId}</p>
          <p>Socket Connected: {isConnected ? '✅' : '❌'}</p>
          <p>User ID: {user?.id || user?._id}</p>
          <p>User Name: {user?.name}</p>
          <p>Token: {getToken() ? '✅ Present' : '❌ Missing'}</p>
          <p>Messages Count: {messages.length}</p>
          <p>Is Sending: {isSending ? '⏳' : '✅'}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
            <p className="text-sm mt-2">
              Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id || message.tempId}
              className={`flex ${(message.sender._id || message.sender.id) === (user.id || user._id) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  (message.sender._id || message.sender.id) === (user.id || user._id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    (message.sender._id || message.sender.id) === (user.id || user._id) ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.createdAt || message.timestamp)}
                  {message.status === 'sending' && (
                    <span className="ml-1">⏳</span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 text-black">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending || !isConnected}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
