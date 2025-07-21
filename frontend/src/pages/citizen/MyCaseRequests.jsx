import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  User,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { citizenAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaseRequests();
  }, []);

  const fetchCaseRequests = async () => {
    setIsLoading(true);
    try {
      const response = await citizenAPI.getMyCaseRequests();
      if (response.success) {
        setRequests(response.data.requests || []);
      } else {
        error('Failed to load case requests');
      }
    } catch (err) {
      error('Failed to load case requests');
      console.error('Case requests fetch error:', err);
    } finally {
      setIsLoading(false);
    }
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
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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

  const handleStartChat = (request) => {
    // The chat ID format is: {caseType}_{caseId}
    const chatId = `${request.caseType}_${request.caseId}`;
    console.log('🚀 CITIZEN: Starting chat with ID:', chatId);
    console.log('   Request data:', request);
    navigate(`/chat/${chatId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Case Requests</h1>
              <p className="mt-2 text-gray-600">
                Track the status of your requests to lawyers for specific cases
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Send className="h-4 w-4" />
              <span>{requests.length} total requests</span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Send className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No case requests sent</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't sent any requests to lawyers for cases yet.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/citizen/my-cases')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FileText className="h-4 w-4 mr-2" />
                View My Cases
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Request Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.lawyer?.name || 'Unknown Lawyer'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {request.lawyer?.specialization || 'General Practice'}
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </div>
                    </div>

                    {/* Case Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Case Details</h4>
                        <span className="text-xs text-gray-500 capitalize">
                          {request.caseType} Case
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Title:</strong> {request.caseTitle || request.case?.title || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {request.caseDescription || request.case?.description || 'N/A'}
                      </p>
                    </div>

                    {/* Request Message */}
                    {request.message && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Your Message</h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {/* Lawyer Response */}
                    {request.response && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Lawyer's Response</h4>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                          {request.response}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                        {request.respondedAt && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Request accepted! You can now chat with the lawyer.
                      </p>
                      <button
                        onClick={() => handleStartChat(request)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCaseRequests;
