import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PendingConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getPendingConnectionRequests();
      if (response.success) {
        setRequests(response.data?.requests || []);
      } else {
        error(response.message || 'Failed to load pending requests');
      }
    } catch (err) {
      console.error('Fetch pending requests error:', err);
      error('Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    setProcessingRequest(connectionId);
    try {
      const response = await lawyerAPI.acceptConnectionRequest(connectionId);
      if (response.success) {
        success('Connection request accepted successfully!');
        fetchPendingRequests(); // Refresh the list
      } else {
        error(response.message || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Accept request error:', err);
      error('Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (connectionId) => {
    setProcessingRequest(connectionId);
    try {
      const response = await lawyerAPI.rejectConnectionRequest(connectionId);
      if (response.success) {
        success('Connection request rejected');
        fetchPendingRequests(); // Refresh the list
      } else {
        error(response.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      error('Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const filteredRequests = requests.filter(request => 
    request.citizen?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.citizen?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl mr-6 shadow-lg">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pending Connection Requests</h1>
                <p className="text-gray-600 mt-1">Review and respond to direct connection requests from citizens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search requests by citizen name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => {
                    const today = new Date().toDateString();
                    return new Date(r.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.message && r.message.trim()).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'No requests match your search criteria.' 
                : 'You have no pending connection requests at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.citizen?.name || 'Unknown Citizen'}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-gray-600 text-sm flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {request.citizen?.email || 'No email provided'}
                        </p>
                        {request.citizen?.phone && (
                          <p className="text-gray-600 text-sm flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {request.citizen.phone}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Requested {new Date(request.createdAt).toLocaleDateString()} at{' '}
                          {new Date(request.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {request.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                          <p className="text-sm text-gray-600">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={processingRequest === request._id}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingRequest === request._id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request._id)}
                      disabled={processingRequest === request._id}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingRequest === request._id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingConnectionRequests;
