import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Check,
  MessageCircle,
  UserPlus,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSocket } from '../hooks/useSocket';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Listen for various notification events
      socket.on('new_connection_request', handleConnectionRequest);
      socket.on('connection_request_accepted', handleConnectionAccepted);
      socket.on('connection_request_rejected', handleConnectionRejected);
      socket.on('new_message', handleNewMessage);
      socket.on('new_lawyer_offer', handleLawyerOffer);
      socket.on('case_request_accepted', handleCaseRequestAccepted);

      return () => {
        socket.off('new_connection_request');
        socket.off('connection_request_accepted');
        socket.off('connection_request_rejected');
        socket.off('new_message');
        socket.off('new_lawyer_offer');
        socket.off('case_request_accepted');
      };
    }
  }, [socket]);

  const handleConnectionRequest = (data) => {
    console.log('🔔 FRONTEND: Received new_connection_request:', data);
    const notification = {
      id: Date.now(),
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${data.citizen.name} wants to connect with you`,
      data: data,
      timestamp: new Date(),
      read: false,
    };

    addNotification(notification);
    info(`New connection request from ${data.citizen.name}`);
  };

  const handleConnectionAccepted = (data) => {
    console.log('🔔 FRONTEND: Received connection_request_accepted:', data);
    const notification = {
      id: Date.now(),
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${data.lawyer.name} accepted your connection request`,
      data: data,
      timestamp: new Date(),
      read: false,
    };

    addNotification(notification);
    success(`${data.lawyer.name} accepted your connection request!`);
  };

  const handleConnectionRejected = (data) => {
    const notification = {
      id: Date.now(),
      type: 'connection_rejected',
      title: 'Connection Request Declined',
      message: `${data.lawyer.name} declined your connection request`,
      data: data,
      timestamp: new Date(),
      read: false,
    };

    addNotification(notification);
    info(`${data.lawyer.name} declined your connection request`);
  };

  const handleNewMessage = (data) => {
    // Only show notification if user is not currently in the chat
    const currentPath = window.location.pathname;
    if (!currentPath.includes(`/chat/${data.chatId}`)) {
      const notification = {
        id: Date.now(),
        type: 'new_message',
        title: 'New Message',
        message: `${data.sender.name}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`,
        data: data,
        timestamp: new Date(),
        read: false,
      };

      addNotification(notification);
      info(`New message from ${data.sender.name}`);
    }
  };

  const handleLawyerOffer = (data) => {
    const notification = {
      id: Date.now(),
      type: 'lawyer_offer',
      title: 'New Lawyer Offer',
      message: `${data.from.name} offered to help with your ${data.caseType}`,
      data: data,
      timestamp: new Date(),
      read: false,
    };

    addNotification(notification);
    success(`${data.from.name} offered to help with your case!`);
  };

  const handleCaseRequestAccepted = (data) => {
    const notification = {
      id: Date.now(),
      type: 'case_request_accepted',
      title: 'Case Request Accepted!',
      message: `${data.lawyer.name} accepted your case request. You can now start chatting!`,
      data: data,
      timestamp: new Date(),
      read: false,
    };

    addNotification(notification);
    success(`${data.lawyer.name} accepted your case request!`);

    // Auto-navigate to chat after a short delay
    setTimeout(() => {
      window.location.href = `/chat/${data.chatId}`;
    }, 2000);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'connection_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connection_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'new_message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'lawyer_offer':
        return <Info className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onRemove={removeNotification}
                      getIcon={getNotificationIcon}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

// Individual Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onRemove, getIcon }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'connection_request':
        window.location.href = '/lawyer/incoming-requests';
        break;
      case 'connection_accepted':
        window.location.href = '/citizen/connected-lawyers';
        break;
      case 'new_message':
        window.location.href = `/chat/${notification.data.chatId}`;
        break;
      case 'lawyer_offer':
        window.location.href = '/citizen/my-cases';
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 hover:bg-gray-50 cursor-pointer ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              !notification.read ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationSystem;
