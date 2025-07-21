import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, User, Shield } from 'lucide-react';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatus = () => {
    if (message.status === 'sending') {
      return <Clock className="h-3 w-3 text-gray-400" />;
    }
    if (message.isRead && message.isRead.length > 0) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            {message.sender.role === 'lawyer' ? (
              <Shield className="h-4 w-4 text-gray-600" />
            ) : (
              <User className="h-4 w-4 text-gray-600" />
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`${showAvatar && !isOwn ? 'ml-2' : ''} ${isOwn ? 'mr-2' : ''}`}>
          {/* Sender Name (for received messages) */}
          {!isOwn && showAvatar && (
            <div className="text-xs text-gray-500 mb-1 px-3">
              {message.sender.name}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`
              px-4 py-2 rounded-2xl relative
              ${isOwn 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-900'
              }
              ${message.status === 'sending' ? 'opacity-70' : ''}
            `}
          >
            {/* Message Text */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Message Time and Status */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
              <span className="text-xs">
                {formatTime(message.timestamp)}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  {getMessageStatus()}
                </div>
              )}
            </div>

            {/* Message Tail */}
            <div
              className={`
                absolute top-3 w-3 h-3 transform rotate-45
                ${isOwn 
                  ? 'bg-blue-600 -right-1' 
                  : 'bg-white border-r border-b border-gray-200 -left-1'
                }
              `}
            />
          </div>

          {/* System Messages */}
          {message.messageType === 'system' && (
            <div className="text-center text-xs text-gray-500 my-2 px-4 py-2 bg-gray-100 rounded-lg">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
