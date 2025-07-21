import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MessageCircle,
  DollarSign,
  Send,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCaseRequests = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState(null);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        lawyerAPI.getMyCaseRequests(),
        lawyerAPI.getReceivedCaseRequests()
      ]);

      if (sentResponse.success) {
        setSentRequests(sentResponse.data?.requests || []);
      }

      if (receivedResponse.success) {
        setReceivedRequests(receivedResponse.data?.requests || []);
      }

      console.log('📋 LAWYER: Fetched requests - Sent:', sentResponse.data?.requests?.length || 0, 'Received:', receivedResponse.data?.requests?.length || 0);
    } catch (err) {
      console.error('Error fetching requests:', err);
      error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await lawyerAPI.acceptCaseRequest(requestId);
      if (response.success) {
        success('Request accepted successfully!');
        
        // Navigate to chat if chat info is available
        if (response.data?.chat?.chatId) {
          console.log('🚀 LAWYER: Navigating to chat:', response.data.chat.chatId);
          navigate(`/chat/${response.data.chat.chatId}`);
        } else {
          fetchAllRequests(); // Refresh the list if no chat info
        }
      } else {
        error('Failed to accept request');
      }
    } catch (err) {
      error('Failed to accept request');
      console.error('Accept request error:', err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const response = await lawyerAPI.rejectCaseRequest(requestId);
      if (response.success) {
        success('Request rejected');
        fetchAllRequests(); // Refresh the list
      } else {
        error('Failed to reject request');
      }
    } catch (err) {
      error('Failed to reject request');
      console.error('Reject request error:', err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleStartChat = (request) => {
    // For accepted requests, navigate to chat
    const chatId = `${request.caseType}_${request.caseId}`;
    navigate(`/chat/${chatId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentRequests = () => {
    const requests = activeTab === 'sent' ? sentRequests : receivedRequests;
    if (statusFilter === 'all') return requests;
    return requests.filter(request => request.status === statusFilter);
  };

  const filteredRequests = getCurrentRequests();

  const getTabCounts = (requests) => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const sentCounts = getTabCounts(sentRequests);
  const receivedCounts = getTabCounts(receivedRequests);
  const currentCounts = activeTab === 'sent' ? sentCounts : receivedCounts;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-2xl mr-6 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Case Requests</h1>
              <p className="text-gray-600 text-lg">
                Manage your case requests and offers
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('sent');
                  setStatusFilter('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Sent Requests
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {sentRequests.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('received');
                  setStatusFilter('all');
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Inbox className="h-5 w-5 mr-2" />
                  Received Requests
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {receivedRequests.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'accepted', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    statusFilter === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {currentCounts[status]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center"
          >
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              {activeTab === 'sent' ? (
                <Send className="h-12 w-12 text-gray-400 mx-auto" />
              ) : (
                <Inbox className="h-12 w-12 text-gray-400 mx-auto" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No {statusFilter === 'all' ? '' : statusFilter} {activeTab} requests
            </h3>
            <p className="text-gray-600 text-lg">
              {activeTab === 'sent' 
                ? 'When you request to handle cases, they will appear here.'
                : 'When citizens request you for their cases, they will appear here.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request, index) => (
              <RequestCard
                key={`${request.caseType}-${request.caseId}-${request.requestId}`}
                request={request}
                index={index}
                activeTab={activeTab}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onStartChat={handleStartChat}
                processingRequest={processingRequest}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ 
  request, 
  index, 
  activeTab, 
  onAccept, 
  onReject, 
  onStartChat, 
  processingRequest, 
  getStatusIcon, 
  getStatusColor 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Request Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg mr-4">
                {request.caseType === 'query' ? (
                  <FileText className="h-6 w-6 text-white" />
                ) : (
                  <Scale className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {request.caseTitle}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="capitalize">{request.caseType}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{request.category}</span>
                  {request.priority && (
                    <>
                      <span className="mx-2">•</span>
                      <span className={`capitalize ${
                        request.priority === 'high' ? 'text-red-600' :
                        request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {request.priority} priority
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </div>
          </div>

          {/* Case Description */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Request Message */}
          {request.message && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                {activeTab === 'sent' ? 'Your Message:' : 'Citizen\'s Message:'}
              </h4>
              <p className="text-gray-700 text-sm">{request.message}</p>
            </div>
          )}

          {/* Client/Lawyer Info */}
          {activeTab === 'received' && request.citizen && (
            <div className="mb-4 flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                Requested by: <span className="font-medium">{request.citizen.name}</span>
              </span>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
            {request.respondedAt && (
              <>
                <span className="mx-2">•</span>
                <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200">
            {activeTab === 'received' && request.status === 'pending' && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  This citizen wants you to handle their case. Would you like to accept?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onReject(request.requestId)}
                    disabled={processingRequest === request.requestId}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => onAccept(request.requestId)}
                    disabled={processingRequest === request.requestId}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {processingRequest === request.requestId ? 'Processing...' : 'Accept'}
                  </button>
                </div>
              </div>
            )}

            {request.status === 'accepted' && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-600 font-medium">
                  ✅ Request accepted - You can now chat with the {activeTab === 'sent' ? 'citizen' : 'client'}
                </p>
                <button
                  onClick={() => onStartChat(request)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}

            {request.status === 'rejected' && (
              <p className="text-sm text-red-600">
                ❌ Request was rejected
              </p>
            )}

            {activeTab === 'sent' && request.status === 'pending' && (
              <p className="text-sm text-yellow-600">
                ⏳ Waiting for citizen's response
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyCaseRequests;
