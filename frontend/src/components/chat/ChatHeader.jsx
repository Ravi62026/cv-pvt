import React from 'react';
import {
  ArrowLeft,
  User,
  Shield,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';

const ChatHeader = ({ otherParticipant, isOnline, onBack }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              {otherParticipant?.user.role === 'lawyer' ? (
                <Shield className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            {/* Online Status */}
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.user.name || 'Unknown User'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="capitalize">{otherParticipant?.user.role}</span>
              {otherParticipant?.user.role === 'lawyer' && 
               otherParticipant?.user.lawyerDetails?.specialization && (
                <>
                  <span>•</span>
                  <span>{otherParticipant.user.lawyerDetails.specialization.join(', ')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
