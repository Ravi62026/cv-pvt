import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Star,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { citizenAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyCaseOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOffer, setProcessingOffer] = useState(null);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaseOffers();
  }, []);

  const fetchCaseOffers = async () => {
    setIsLoading(true);
    try {
      const response = await citizenAPI.getMyCaseOffers();
      if (response.success) {
        setOffers(response.data.offers || []);
      } else {
        error('Failed to load case offers');
      }
    } catch (err) {
      error('Failed to load case offers');
      console.error('Case offers fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setProcessingOffer(offerId);
    try {
      const response = await citizenAPI.acceptCaseOffer(offerId);
      if (response.success) {
        success('Offer accepted successfully!');

        // Navigate to chat if chat info is available
        if (response.data?.chat?.chatId) {
          console.log('🚀 FRONTEND: Navigating to chat:', response.data.chat.chatId);
          navigate(`/chat/${response.data.chat.chatId}`);
        } else {
          fetchCaseOffers(); // Refresh the list if no chat info
        }
      } else {
        error('Failed to accept offer');
      }
    } catch (err) {
      error('Failed to accept offer');
      console.error('Accept offer error:', err);
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setProcessingOffer(offerId);
    try {
      const response = await citizenAPI.rejectCaseOffer(offerId);
      if (response.success) {
        success('Offer rejected');
        fetchCaseOffers(); // Refresh the list
      } else {
        error('Failed to reject offer');
      }
    } catch (err) {
      error('Failed to reject offer');
      console.error('Reject offer error:', err);
    } finally {
      setProcessingOffer(null);
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

  const handleStartChat = (offer) => {
    // For accepted offers, we need to get the chat info from the backend
    // The chat ID format is: {caseType}_{caseId}
    const chatId = `${offer.caseType}_${offer.caseId}`;
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
              <h1 className="text-3xl font-bold text-gray-900">My Case Offers</h1>
              <p className="mt-2 text-gray-600">
                Offers from lawyers who want to help with your cases
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Gift className="h-4 w-4" />
              <span>{offers.length} total offers</span>
            </div>
          </div>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No offers received</h3>
            <p className="mt-1 text-sm text-gray-500">
              No lawyers have offered to help with your cases yet.
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
            {offers.map((offer) => (
              <div
                key={offer.requestId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Offer Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {offer.lawyer?.name || 'Unknown Lawyer'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{offer.lawyer?.specialization || 'General Practice'}</span>
                            {offer.lawyer?.rating && (
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="ml-1">{offer.lawyer.rating}</span>
                              </div>
                            )}
                          </div>
                          {offer.lawyer?.location && (
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{offer.lawyer.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
                        {getStatusIcon(offer.status)}
                        <span className="ml-1 capitalize">{offer.status}</span>
                      </div>
                    </div>

                    {/* Case Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Case Details</h4>
                        <span className="text-xs text-gray-500 capitalize">
                          {offer.caseType} Case
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Title:</strong> {offer.caseTitle || offer.case?.title || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Description:</strong> {offer.caseDescription || offer.case?.description || 'N/A'}
                      </p>
                    </div>

                    {/* Lawyer's Offer Message */}
                    {offer.message && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Lawyer's Offer</h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {offer.message}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Received: {new Date(offer.createdAt).toLocaleDateString()}</span>
                        </div>
                        {offer.respondedAt && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Responded: {new Date(offer.respondedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {offer.status === 'pending' && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        This lawyer wants to help with your case. Would you like to accept their offer?
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRejectOffer(offer.requestId)}
                          disabled={processingOffer === offer.requestId}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(offer.requestId)}
                          disabled={processingOffer === offer.requestId}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Offer
                        </button>
                      </div>
                    </div>
                  )}

                  {offer.status === 'accepted' && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 font-medium">
                        ✅ Offer accepted! You can now chat with the lawyer.
                      </p>
                      <button
                        onClick={() => handleStartChat(offer)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </button>
                    </div>
                  )}

                  {offer.status === 'rejected' && (
                    <p className="text-sm text-red-600">
                      ❌ You rejected this offer.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCaseOffers;
