import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  Search,
  Filter,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Eye,
  DollarSign,
  Send,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AvailableCases = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    caseType: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchAvailableCases();
  }, [filters, pagination.current]);

  const fetchAvailableCases = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters,
        caseType: filters.caseType === 'all' ? undefined : filters.caseType,
        category: filters.category === 'all' ? undefined : filters.category,
        priority: filters.priority === 'all' ? undefined : filters.priority,
      };

      const response = await lawyerAPI.getAvailableCases(params);

      if (response.success) {
        setCases(response.data.cases);
        setPagination(response.data.pagination);
      } else {
        error('Failed to load available cases');
      }
    } catch (err) {
      console.error('Error fetching available cases:', err);
      error('Failed to load available cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (caseItem) => {
    try {
      const requestData = {
        message: `I would like to handle this ${caseItem.caseType} case. I have experience in ${caseItem.category} law and can provide quality legal assistance.`,
        proposedFee: 1000, // Default fee
        estimatedDuration: '1-2 weeks'
      };

      // Use the offer help method which creates lawyerRequests entries
      const response = await lawyerAPI.offerHelpOnCase(caseItem.caseType, caseItem._id, requestData);

      if (response.success) {
        success('Offer sent successfully!');
        // Refresh the cases list
        fetchAvailableCases();
      } else {
        error(response.error || 'Failed to send offer');
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      error('Failed to send offer');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
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

  if (isLoading && cases.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-6 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Cases</h1>
              <p className="text-gray-600 text-lg">
                Browse and request to handle available legal cases
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
              <select
                value={filters.caseType}
                onChange={(e) => setFilters(prev => ({ ...prev, caseType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="query">Queries</option>
                <option value="dispute">Disputes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="property">Property</option>
                <option value="civil">Civil</option>
                <option value="criminal">Criminal</option>
                <option value="family">Family</option>
                <option value="corporate">Corporate</option>
                <option value="tax">Tax</option>
                <option value="labor">Labor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {cases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center"
          >
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No available cases</h3>
            <p className="text-gray-600 text-lg">
              There are currently no cases available that match your criteria.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cases.map((caseItem, index) => (
              <CaseCard
                key={`${caseItem.caseType}-${caseItem._id}`}
                caseItem={caseItem}
                index={index}
                onSendRequest={handleSendRequest}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Case Card Component
const CaseCard = ({ caseItem, index, onSendRequest, getStatusIcon, getStatusColor, getPriorityColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`p-2 rounded-lg mr-3 ${
              caseItem.caseType === 'query' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {caseItem.caseType === 'query' ? (
                <FileText className="h-5 w-5 text-blue-600" />
              ) : (
                <Scale className="h-5 w-5 text-red-600" />
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              caseItem.caseType === 'query' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}>
              {caseItem.caseType === 'query' ? 'Legal Query' : 'Dispute Case'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{caseItem.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
              {getStatusIcon(caseItem.status)}
              <span className="ml-1.5 capitalize">{caseItem.status}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(caseItem.priority)}`}>
              {caseItem.priority.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {caseItem.category}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {caseItem.description}
        </p>
      </div>

      {/* Dispute Value (for disputes only) */}
      {caseItem.caseType === 'dispute' && caseItem.disputeValue && (
        <div className="flex items-center mb-4 p-3 bg-green-50 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-semibold text-green-800">
            Dispute Value: ₹{caseItem.disputeValue.toLocaleString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {new Date(caseItem.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
        <button
          onClick={() => onSendRequest(caseItem)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
        >
          <Send className="h-4 w-4 mr-1.5" />
          Send Request
        </button>
      </div>
    </motion.div>
  );
};

export default AvailableCases;
