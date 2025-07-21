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
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReceivedCaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingRequest, setProcessingRequest] = useState(null);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  const fetchReceivedRequests = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getReceivedCaseRequests();
      if (response.success) {
        setRequests(response.data?.requests || []);
      } else {
        error('Failed to load received requests');
      }
    } catch (err) {
      console.error('Error fetching received requests:', err);
      error('Failed to load received requests');
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
        fetchReceivedRequests(); // Refresh the list
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
        fetchReceivedRequests(); // Refresh the list
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



  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'accepted') return request.status === 'accepted';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-2xl mr-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Received Requests</h1>
              <p className="text-gray-600 text-lg">
                Citizens who want you to handle their cases
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {[
                { id: 'all', name: 'All Requests', count: requests.length },
                { id: 'pending', name: 'Pending', count: requests.filter(r => r.status === 'pending').length },
                { id: 'accepted', name: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
                { id: 'rejected', name: 'Rejected', count: requests.filter(r => r.status === 'rejected').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-2 border-b-3 font-semibold text-base transition-all ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-3 py-1 px-3 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
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
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'all' ? 'No requests received' : `No ${activeTab} requests`}
            </h3>
            <p className="text-gray-600 text-lg">
              {activeTab === 'all' 
                ? 'When citizens request you for their cases, they will appear here.'
                : `You don't have any ${activeTab} requests at the moment.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.map((request, index) => (
              <RequestCard
                key={`${request.caseType}-${request.caseId}-${request.requestId}`}
                request={request}
                index={index}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, index, onAccept, onReject, navigate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Case Info */}
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3 ${
              request.caseType === 'query' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {request.caseType === 'query' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Scale className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{request.caseTitle}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  request.caseType === 'query' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {request.caseType === 'query' ? 'Legal Query' : 'Dispute Case'}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                  {request.priority?.toUpperCase()}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                  {request.category}
                </span>
              </div>
            </div>
          </div>

          {/* Case Description */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
          </div>

          {/* Dispute Value (for disputes only) */}
          {request.caseType === 'dispute' && request.disputeValue && (
            <div className="flex items-center mb-4 p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-800">
                Dispute Value: ₹{request.disputeValue.toLocaleString()}
              </span>
            </div>
          )}

          {/* Citizen Info */}
          <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{request.citizen.name}</h4>
              <p className="text-xs text-gray-600">{request.citizen.email}</p>
            </div>
          </div>

          {/* Citizen's Message */}
          {request.message && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">Citizen's message: "{request.message}"</p>
            </div>
          )}

          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusIcon(request.status)}
                <span className="ml-1.5 capitalize">{request.status}</span>
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(request.requestedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => onReject(request.requestId)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </button>
                <button
                  onClick={() => onAccept(request.requestId)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Accept
                </button>
              </div>
            )}

            {/* Chat Button for Accepted Requests */}
            {request.status === 'accepted' && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-green-600 font-medium">
                  ✅ Request accepted! You can now chat with the citizen.
                </p>
                <button
                  onClick={() => {
                    const chatId = `${request.caseType}_${request.caseId}`;
                    console.log('🚀 LAWYER: Starting chat with ID:', chatId);
                    console.log('   Request data:', request);
                    navigate(`/chat/${chatId}`);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReceivedCaseRequests;
