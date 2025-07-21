import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  User,
  Shield,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ 
  chatId, 
  onBack, 
  className = "",
  showHeader = true,
  autoJoin = true 
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { socket } = useSocket();
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get other participant info
  const otherParticipant = chat?.participants?.find(
    p => p.user._id !== user._id
  );

  useEffect(() => {
    if (chatId) {
      fetchChatData();
      if (autoJoin) {
        joinChatRoom();
      }
    }

    return () => {
      if (socket && chatId) {
        socket.emit('leave_chat', chatId);
      }
    };
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('new_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('typing_start', handleTypingStart);
      socket.on('typing_stop', handleTypingStop);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);

      return () => {
        socket.off('new_message');
        socket.off('message_sent');
        socket.off('typing_start');
        socket.off('typing_stop');
        socket.off('user_online');
        socket.off('user_offline');
      };
    }
  }, [socket]);

  const fetchChatData = async () => {
    setIsLoading(true);
    try {
      console.log('📡 FRONTEND: Fetching chat data for chatId:', chatId);
      const response = await chatAPI.getChatDetails(chatId);
      console.log('📡 FRONTEND: Chat API response:', response);
      
      if (response.success) {
        setChat(response.data.chat);
        setMessages(response.data.chat.messages || []);
      } else {
        error('Failed to load chat');
        if (onBack) onBack();
      }
    } catch (err) {
      console.error('❌ FRONTEND: Failed to fetch chat:', err);
      error('Failed to load chat');
      if (onBack) onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const joinChatRoom = () => {
    if (socket && chatId) {
      console.log('🏠 FRONTEND: Joining chat room:', chatId);
      socket.emit('join_chat', chatId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewMessage = (messageData) => {
    console.log('💬 FRONTEND: Received new_message:', messageData);
    if (messageData.chatId === chatId) {
      console.log('   ✅ Message is for current chat, adding to messages');
      setMessages(prev => [...prev, messageData]);
      
      // Mark message as read if it's not from current user
      if (messageData.sender._id !== user._id) {
        console.log('   📖 Marking message as read');
        markMessageAsRead(messageData._id);
      }
    } else {
      console.log('   ❌ Message is for different chat, ignoring');
    }
  };

  const handleMessageSent = (messageData) => {
    if (messageData.chatId === chatId) {
      setMessages(prev => 
        prev.map(msg => 
          msg.tempId === messageData.tempId 
            ? { ...messageData, status: 'sent' }
            : msg
        )
      );
    }
  };

  const handleTypingStart = (data) => {
    if (data.chatId === chatId && data.userId !== user._id) {
      setIsTyping(true);
      setTypingUser(data.userName);
    }
  };

  const handleTypingStop = (data) => {
    if (data.chatId === chatId && data.userId !== user._id) {
      setIsTyping(false);
      setTypingUser(null);
    }
  };

  const handleUserOnline = (data) => {
    setOnlineUsers(prev => new Set([...prev, data.userId]));
  };

  const handleUserOffline = (data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  };

  const markMessageAsRead = async (messageId) => {
    try {
      if (socket) {
        socket.emit('mark_messages_read', {
          chatId,
          messageIds: [messageId],
        });
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const tempId = Date.now().toString();
    const messageData = {
      tempId,
      chatId,
      content: newMessage.trim(),
      sender: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
      timestamp: new Date(),
      status: 'sending',
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    setIsSending(true);

    // Stop typing indicator
    if (socket) {
      socket.emit('stop_typing', { chatId, userId: user._id });
    }

    try {
      if (socket) {
        const emitData = {
          chatId,
          content: messageData.content,
          tempId,
        };
        console.log('📤 FRONTEND: Sending message via socket:', emitData);
        socket.emit('send_message', emitData);
      } else {
        console.log('❌ FRONTEND: No socket connection available');
      }
    } catch (err) {
      console.error('❌ FRONTEND: Failed to send message:', err);
      error('Failed to send message');
      // Remove the message from UI on error
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing indicator
    if (socket && e.target.value.trim()) {
      socket.emit('start_typing', { 
        chatId, 
        userId: user._id, 
        userName: user.name 
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId, userId: user._id });
      }, 1000);
    } else if (socket) {
      socket.emit('stop_typing', { chatId, userId: user._id });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">Chat not found</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Chat Header */}
      {showHeader && (
        <ChatHeader 
          otherParticipant={otherParticipant}
          isOnline={isUserOnline(otherParticipant?.user._id)}
          onBack={onBack}
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message._id || message.tempId}
              message={message}
              isOwn={message.sender._id === user._id}
              showAvatar={
                index === 0 || 
                messages[index - 1]?.sender._id !== message.sender._id
              }
            />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center space-x-2 text-gray-500 text-sm"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUser} is typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onSend={sendMessage}
        isSending={isSending}
      />
    </div>
  );
};

export default ChatWindow;
