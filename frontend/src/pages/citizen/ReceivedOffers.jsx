import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Award,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { citizenAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ReceivedOffers = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { success, error } = useToast();

  useEffect(() => {
    fetchReceivedOffers();
  }, []);

  const fetchReceivedOffers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/citizens/my-case-offers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data.data?.offers || []);
      } else {
        error('Failed to load received offers');
      }
    } catch (err) {
      console.error('Error fetching received offers:', err);
      error('Failed to load received offers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOffer = async (offer) => {
    try {
      // Call API to accept the offer using the correct endpoint
      const response = await fetch(`http://localhost:5000/api/citizens/accept-case-offer/${offer.requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ response: 'Accepted your offer to help with my case.' })
      });

      if (response.ok) {
        const data = await response.json();
        success('Offer accepted successfully!');
        fetchReceivedOffers(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Accept offer error:', errorData);
        error(errorData.message || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Error accepting offer:', err);
      error('Failed to accept offer');
    }
  };

  const handleRejectOffer = async (offer) => {
    try {
      // Call API to reject the offer using the correct endpoint
      const response = await fetch(`http://localhost:5000/api/citizens/reject-case-offer/${offer.requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ response: 'Thank you for the offer, but I have decided to go with another lawyer.' })
      });

      if (response.ok) {
        success('Offer rejected');
        fetchReceivedOffers(); // Refresh the list
      } else {
        const errorData = await response.json();
        console.error('Reject offer error:', errorData);
        error(errorData.message || 'Failed to reject offer');
      }
    } catch (err) {
      console.error('Error rejecting offer:', err);
      error('Failed to reject offer');
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return offer.status === 'pending';
    if (activeTab === 'accepted') return offer.status === 'accepted';
    if (activeTab === 'rejected') return offer.status === 'rejected';
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-2xl mr-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Received Offers</h1>
              <p className="text-gray-600 text-lg">
                Lawyers who want to handle your cases
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {[
                { id: 'all', name: 'All Offers', count: offers.length },
                { id: 'pending', name: 'Pending', count: offers.filter(o => o.status === 'pending').length },
                { id: 'accepted', name: 'Accepted', count: offers.filter(o => o.status === 'accepted').length },
                { id: 'rejected', name: 'Rejected', count: offers.filter(o => o.status === 'rejected').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-2 border-b-3 font-semibold text-base transition-all ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-3 py-1 px-3 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center"
          >
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'all' ? 'No offers received' : `No ${activeTab} offers`}
            </h3>
            <p className="text-gray-600 text-lg">
              {activeTab === 'all' 
                ? 'When lawyers are interested in your cases, their offers will appear here.'
                : `You don't have any ${activeTab} offers at the moment.`
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOffers.map((offer, index) => (
              <OfferCard
                key={`${offer.caseType}-${offer.caseId}-${offer.requestId}`}
                offer={offer}
                index={index}
                onAccept={handleAcceptOffer}
                onReject={handleRejectOffer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Offer Card Component
const OfferCard = ({ offer, index, onAccept, onReject }) => {
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
              offer.caseType === 'query' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {offer.caseType === 'query' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Scale className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{offer.caseTitle}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                offer.caseType === 'query' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>
                {offer.caseType === 'query' ? 'Legal Query' : 'Dispute Case'}
              </span>
            </div>
          </div>

          {/* Lawyer Info */}
          <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{offer.lawyer.name}</h4>
              <p className="text-sm text-gray-600">{offer.lawyer.email}</p>
              {offer.lawyer.specialization && (
                <div className="flex items-center mt-1">
                  <Award className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {offer.lawyer.specialization.join(', ')}
                  </span>
                </div>
              )}
              {offer.lawyer.experience && (
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {offer.lawyer.experience} years experience
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {offer.message && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{offer.message}"</p>
            </div>
          )}

          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                {getStatusIcon(offer.status)}
                <span className="ml-1.5 capitalize">{offer.status}</span>
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {new Date(offer.requestedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {offer.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => onReject(offer)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </button>
                <button
                  onClick={() => onAccept(offer)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReceivedOffers;
