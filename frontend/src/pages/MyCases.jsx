import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Eye,
  DollarSign,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MyCases = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { error } = useToast(); // Only need error for fetchData

  // Test function for navigation
  const handleTestNavigation = () => {
    console.log('🧪 TEST: Direct navigation test from main component');
    navigate('/chat/query_687e812be025b16185b6f15d');
  };
  
  const [activeTab, setActiveTab] = useState('all');
  const [queries, setQueries] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch real data from the correct API endpoint
      const response = await fetch('/api/citizens/my-cases', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('My Cases API Response:', result);

        if (result.success && result.data && Array.isArray(result.data.cases)) {
          const cases = result.data.cases;

          // Separate queries and disputes
          const queriesData = cases.filter(c => c.caseType === 'query');
          const disputesData = cases.filter(c => c.caseType === 'dispute');

          setQueries(queriesData);
          setDisputes(disputesData);

          console.log('Loaded queries:', queriesData.length);
          console.log('Loaded disputes:', disputesData.length);
          console.log('Sample case with requests:', cases[0]?.requestedLawyers, cases[0]?.receivedOffers);
        } else {
          console.log('No cases found or invalid response structure');
          setQueries([]);
          setDisputes([]);
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        error(errorData.message || 'Failed to load cases');
        setQueries([]);
        setDisputes([]);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      error('Failed to load cases');
      setQueries([]);
      setDisputes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'mediation':
        return <Scale className="h-4 w-4 text-purple-500" />;
      case 'arbitration':
        return <Scale className="h-4 w-4 text-indigo-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'mediation':
        return 'bg-purple-100 text-purple-800';
      case 'arbitration':
        return 'bg-indigo-100 text-indigo-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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



  // Combine and filter data
  const allCases = [
    ...queries.map(q => ({ ...q, type: q.caseType || 'query' })),
    ...disputes.map(d => ({ ...d, type: d.caseType || 'dispute' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredCases = allCases.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'query' && item.type === 'query') ||
                      (activeTab === 'dispute' && item.type === 'dispute');
    return matchesSearch && matchesStatus && matchesTab;
  });

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
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-6 shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Cases</h1>
                <p className="text-gray-600 text-lg">
                  Manage all your legal queries and disputes in one place
                </p>
                {/* Temporary test button */}
                <button
                  onClick={handleTestNavigation}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  🧪 TEST: Direct Chat Navigation
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/citizen/received-offers')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Received Offers
              </button>
              <button
                onClick={() => navigate('/citizen/pending-requests')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <Clock className="h-5 w-5 mr-2" />
                My Requests
              </button>
              <button
                onClick={() => navigate('/citizen/create-query')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Query
              </button>
              <button
                onClick={() => navigate('/citizen/create-dispute')}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center shadow-lg transition-all transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                File Dispute
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8" aria-label="Tabs">
              {[
                { id: 'all', name: 'All Cases', count: allCases.length },
                { id: 'query', name: 'Queries', count: queries.length },
                { id: 'dispute', name: 'Disputes', count: disputes.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-5 px-2 border-b-3 font-semibold text-base transition-all ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className={`ml-3 py-1 px-3 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cases by title, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-500 mr-3" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium shadow-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="mediation">Mediation</option>
                    <option value="arbitration">Arbitration</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center"
          >
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || statusFilter !== 'all' ? 'No cases found' : 'No cases yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                : 'Submit your first legal query or file a dispute to get started with our legal services'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => navigate('/citizen/create-query')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center shadow-lg transition-all transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Submit Query
                </button>
                <button
                  onClick={() => navigate('/citizen/create-dispute')}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center shadow-lg transition-all transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  File Dispute
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases.map((item, index) => (
              <CaseCard
                key={`${item.type}-${item._id}`}
                item={item}
                index={index}
                onViewDetails={() => navigate(`/citizen/${item.type === 'query' ? 'queries' : 'disputes'}/${item._id}`)}
                onFindLawyer={() => navigate(`/citizen/find-lawyers?${item.type}Id=${item._id}`)}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                fetchData={fetchData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Case Card Component
const CaseCard = ({ item, index, onViewDetails, onFindLawyer, getStatusIcon, getStatusColor, getPriorityColor, fetchData }) => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleStartChat = () => {
    console.log('🚀 CITIZEN: Start Chat clicked');
    console.log('   Item data:', item);
    console.log('   Chat room:', item.chatRoom);
    console.log('   Chat ID:', item.chatRoom?.chatId);

    if (item.chatRoom && item.chatRoom.chatId) {
      console.log('✅ Navigating to chat:', `/chat/${item.chatRoom.chatId}`);
      navigate(`/chat/${item.chatRoom.chatId}`);
    } else {
      console.log('❌ No chat room or chat ID available');
      console.log('   Available item properties:', Object.keys(item));
      // Try with the known working chat ID for testing
      console.log('🧪 Testing with known chat ID...');
      navigate('/chat/query_687e812be025b16185b6f15d');
    }
  };

  // Handle accepting lawyer offer
  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await citizenAPI.acceptCaseOffer(offerId);

      if (response.success) {
        success('Lawyer offer accepted successfully! Other pending offers have been automatically rejected.');
        fetchData(); // Refresh the data
      } else {
        error(response.error || 'Failed to accept offer');
      }
    } catch (err) {
      console.error('Accept offer error:', err);
      error('Failed to accept offer');
    }
  };

  // Handle rejecting lawyer offer
  const handleRejectOffer = async (offerId) => {
    try {
      const response = await citizenAPI.rejectCaseOffer(offerId);

      if (response.success) {
        success('Lawyer offer rejected');
        fetchData(); // Refresh the data
      } else {
        error(response.error || 'Failed to reject offer');
      }
    } catch (err) {
      console.error('Reject offer error:', err);
      error('Failed to reject offer');
    }
  };

  const isAssigned = item.status === 'assigned' || item.status === 'in-progress';
  const hasChatRoom = item.chatRoom && item.chatRoom.chatId;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-lg mr-3 ${
              item.type === 'query' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {item.type === 'query' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Scale className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                item.type === 'query' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.type === 'query' ? 'Legal Query' : 'Dispute Case'}
              </span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {getStatusIcon(item.status)}
              <span className="ml-1.5 capitalize">{item.status.replace('-', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(item.priority)}`}>
              {item.priority.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {item.category}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Assigned Lawyer Info */}
      {item.assignedLawyer && (
        <div className="flex items-center mb-4 p-3 bg-blue-50 rounded-lg">
          <User className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <span className="text-sm font-semibold text-blue-800">
              Assigned to: {item.assignedLawyer.name}
            </span>
            {item.assignedLawyer.lawyerDetails?.specialization && (
              <span className="text-xs text-blue-600 ml-2">
                ({item.assignedLawyer.lawyerDetails.specialization.join(', ')})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lawyer Interactions */}
      {!item.assignedLawyer && (
        <>
          {/* Requests sent by citizen to lawyers */}
          {item.requestedLawyers && item.requestedLawyers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Send className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-800">
                  Requests Sent by You ({item.requestedLawyers.length})
                </span>
              </div>
              <div className="space-y-2">
                {item.requestedLawyers.map((request, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-blue-800">
                        {request.lawyerId?.name || 'Unknown Lawyer'}
                      </span>
                      {request.lawyerId?.lawyerDetails?.specialization && (
                        <span className="text-xs text-blue-600 ml-2">
                          ({request.lawyerId.lawyerDetails.specialization.join(', ')})
                        </span>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        You requested this lawyer
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers received from lawyers */}
          {item.receivedOffers && item.receivedOffers.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-semibold text-green-800">
                  Offers from Lawyers ({item.receivedOffers.length})
                </span>
              </div>
              <div className="space-y-3">
                {item.receivedOffers.map((offer, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-green-800">
                            {offer.lawyerId?.name || 'Unknown Lawyer'}
                          </span>
                          {offer.lawyerId?.lawyerDetails?.specialization && (
                            <span className="text-xs text-green-600 ml-2">
                              ({offer.lawyerId.lawyerDetails.specialization.join(', ')})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-green-600 mb-2">
                          Lawyer offered to help
                        </div>
                        {offer.message && (
                          <div className="text-xs text-gray-600 mb-2 italic">
                            "{offer.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {offer.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAcceptOffer(offer._id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectOffer(offer._id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {offer.status}
                            </span>
                            {offer.status === 'accepted' && (
                              <button
                                onClick={() => navigate(`/citizen/chat?caseType=${item.type}&caseId=${item._id}`)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Start Chat
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dispute Value (for disputes only) */}
      {item.type === 'dispute' && item.disputeValue && (
        <div className="flex items-center mb-4 p-3 bg-green-50 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-semibold text-green-800">
            Dispute Value: ₹{item.disputeValue.toLocaleString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View Details
          </button>

          {/* Show different buttons based on case status */}
          {isAssigned && hasChatRoom ? (
            <button
              onClick={handleStartChat}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-sm"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Start Chat
            </button>
          ) : (
            <button
              onClick={onFindLawyer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
            >
              <User className="h-4 w-4 mr-1.5" />
              {isAssigned ? 'Change Lawyer' :
               (item.requestedLawyers && item.requestedLawyers.length > 0 ? 'View Requests' : 'Find Lawyer')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyCases;
