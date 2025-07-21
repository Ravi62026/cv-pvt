import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Shield,
  Calendar,
  Star,
  MapPin,
  Briefcase,
  Award,
  Users,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ConnectedLawyers = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnectedLawyers();
  }, [pagination.current]);

  const fetchConnectedLawyers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
      };

      const response = await citizenAPI.getConnectedLawyers(params);
      if (response.success) {
        setConnections(response.data.connections);
        setPagination(response.data.pagination);
      } else {
        error('Failed to load connected lawyers');
      }
    } catch (err) {
      error('Failed to load connected lawyers');
      console.error('Fetch connected lawyers error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (connection) => {
    if (connection.chatInfo?.chatId) {
      navigate(`/chat/${connection.chatInfo.chatId}`);
    } else {
      error('Chat room not available');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connected Lawyers</h1>
          <p className="text-gray-600">
            Lawyers who have accepted your connection requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Connections"
            value={pagination.total}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Active Chats"
            value={connections.filter(c => c.chatInfo?.status === 'active').length}
            icon={MessageCircle}
            color="green"
          />
          <StatsCard
            title="Response Rate"
            value="95%"
            icon={CheckCircle}
            color="purple"
          />
        </div>

        {/* Connected Lawyers List */}
        {connections.length > 0 ? (
          <div className="space-y-6">
            {connections.map((connection) => (
              <ConnectedLawyerCard
                key={connection._id}
                connection={connection}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  className={`px-3 py-2 rounded-lg ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Connected Lawyer Card Component
const ConnectedLawyerCard = ({ connection, onStartChat }) => {
  const lawyer = connection.lawyer;
  const chatInfo = connection.chatInfo;
  const connectedAt = new Date(connection.connectedAt).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Lawyer Info */}
        <div className="flex items-start space-x-4 mb-4 lg:mb-0">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{lawyer.name}</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-2">{lawyer.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{lawyer.lawyerDetails?.experience || 'N/A'} years experience</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                <span>{lawyer.lawyerDetails?.specialization?.join(', ') || 'General Practice'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Connected on {connectedAt}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                <span>4.8 rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Info & Actions */}
        <div className="flex flex-col lg:items-end space-y-3">
          {/* Chat Status */}
          {chatInfo && (
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                chatInfo.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-gray-600">
                {chatInfo.status === 'active' ? 'Chat Active' : 'Chat Inactive'}
              </span>
              {chatInfo.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {chatInfo.unreadCount}
                </span>
              )}
            </div>
          )}

          {/* Last Message */}
          {chatInfo?.lastMessage && (
            <div className="text-sm text-gray-500 max-w-xs">
              <p className="truncate">
                Last: {chatInfo.lastMessage.content}
              </p>
              <p className="text-xs">
                {new Date(chatInfo.lastMessage.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => onStartChat(connection)}
              disabled={!chatInfo?.chatId}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      {connection.requestMessage && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your request:</span> {connection.requestMessage}
          </p>
          {connection.responseMessage && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Their response:</span> {connection.responseMessage}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Empty State Component
const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No connected lawyers yet</h3>
      <p className="text-gray-500 mb-6">
        Start by finding and connecting with lawyers who can help with your legal needs
      </p>
      <button
        onClick={() => navigate('/citizen/find-lawyers')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
      >
        <Users className="h-5 w-5" />
        <span>Find Lawyers</span>
      </button>
    </div>
  );
};

export default ConnectedLawyers;
