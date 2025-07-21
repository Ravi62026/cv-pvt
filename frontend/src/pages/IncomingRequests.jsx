import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  User,
  Calendar,
  MessageCircle,
  Check,
  X,
  Clock,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { lawyerAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [processingRequest, setProcessingRequest] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [pagination.current]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
      };

      const response = await lawyerAPI.getPendingConnectionRequests(params);
      if (response.success) {
        setRequests(response.data.requests);
        setPagination(response.data.pagination);
      } else {
        error('Failed to load pending requests');
      }
    } catch (err) {
      error('Failed to load pending requests');
      console.error('Fetch pending requests error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, responseMessage = '') => {
    setProcessingRequest(requestId);
    try {
      const response = await lawyerAPI.acceptConnectionRequest(requestId, {
        responseMessage,
      });
      
      if (response.success) {
        success('Connection request accepted successfully!');
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req._id !== requestId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        error(response.error || 'Failed to accept request');
      }
    } catch (err) {
      error('Failed to accept request');
      console.error('Accept request error:', err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId, responseMessage = '') => {
    setProcessingRequest(requestId);
    try {
      const response = await lawyerAPI.rejectConnectionRequest(requestId, {
        responseMessage,
      });
      
      if (response.success) {
        success('Connection request rejected');
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req._id !== requestId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        error(response.error || 'Failed to reject request');
      }
    } catch (err) {
      error('Failed to reject request');
      console.error('Reject request error:', err);
    } finally {
      setProcessingRequest(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Inbox className="h-8 w-8 mr-3 text-blue-600" />
            Incoming Requests
          </h1>
          <p className="text-gray-600">
            Review and respond to connection requests from citizens
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">95%</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">2h</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="space-y-6">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                isProcessing={processingRequest === request._id}
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

// Request Card Component
const RequestCard = ({ request, onAccept, onReject, isProcessing }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'

  const citizen = request.citizen;
  const requestedAt = new Date(request.requestedAt).toLocaleString();

  const handleAction = (type) => {
    setActionType(type);
    setShowResponseForm(true);
  };

  const handleSubmitResponse = () => {
    if (actionType === 'accept') {
      onAccept(request._id, responseMessage);
    } else if (actionType === 'reject') {
      onReject(request._id, responseMessage);
    }
    setShowResponseForm(false);
    setResponseMessage('');
    setActionType(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* Citizen Info */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{citizen.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>{citizen.email}</span>
            </div>
            {citizen.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{citizen.phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Requested on {requestedAt}</span>
            </div>
            {citizen.address?.city && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{citizen.address.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Message */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Request Message
        </h4>
        <p className="text-gray-700">{request.requestMessage}</p>
        
        {request.metadata?.connectionType && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {request.metadata.connectionType.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Response Form */}
      {showResponseForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Message (Optional)
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder={`Add a ${actionType === 'accept' ? 'welcome' : 'polite rejection'} message...`}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex space-x-3 mt-3">
            <button
              onClick={handleSubmitResponse}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                actionType === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {isProcessing ? 'Processing...' : `Confirm ${actionType === 'accept' ? 'Accept' : 'Reject'}`}
            </button>
            <button
              onClick={() => {
                setShowResponseForm(false);
                setResponseMessage('');
                setActionType(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!showResponseForm && (
        <div className="flex space-x-3">
          <button
            onClick={() => handleAction('accept')}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Accept</span>
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={isProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Reject</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
      <p className="text-gray-500">
        New connection requests from citizens will appear here
      </p>
    </div>
  );
};

export default IncomingRequests;
