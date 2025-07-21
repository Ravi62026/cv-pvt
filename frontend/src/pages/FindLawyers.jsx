import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  Shield,
  MessageCircle,
  ChevronDown,
  Users,
  Award,
  Briefcase,
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LawyerRequestModal from '../components/LawyerRequestModal';

const FindLawyers = () => {
  const [searchParams] = useSearchParams();
  const [lawyers, setLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: 'all',
    experience: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { success, error } = useToast();

  // Get case information from URL parameters
  const queryId = searchParams.get('queryId');
  const disputeId = searchParams.get('disputeId');
  const caseType = queryId ? 'query' : disputeId ? 'dispute' : null;
  const caseId = queryId || disputeId;

  const specializations = [
    'All Specializations',
    'Civil Law',
    'Criminal Law',
    'Family Law',
    'Property Law',
    'Corporate Law',
    'Tax Law',
    'Labor Law',
    'Constitutional Law',
  ];

  const experienceRanges = [
    'All Experience',
    '0-2 years',
    '3-5 years',
    '6-10 years',
    '10+ years',
  ];

  useEffect(() => {
    fetchLawyers();
  }, [filters, pagination.current]);

  const fetchLawyers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: 12,
        ...filters,
        specialization: filters.specialization === 'all' ? undefined : filters.specialization,
        experience: filters.experience === 'all' ? undefined : filters.experience,
      };

      console.log("🔍 Frontend: Fetching lawyers with params:", params);
      console.log("🔍 Frontend: Current filters:", filters);

      const response = await citizenAPI.getAvailableLawyers(params);

      console.log("📡 Frontend: API Response:", response);

      if (response.success) {
        console.log("✅ Frontend: Successfully fetched lawyers:", response.data.lawyers.length);
        setLawyers(response.data.lawyers);
        setPagination(response.data.pagination);
      } else {
        console.error("❌ Frontend: API returned error:", response.message);
        error('Failed to load lawyers');
      }
    } catch (err) {
      console.error("❌ Frontend: Error fetching lawyers:", err);
      error('Failed to load lawyers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRequestLawyer = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      let response;

      if (queryId) {
        // Send request for query case
        response = await citizenAPI.requestLawyerForQuery(queryId, selectedLawyer._id, requestData);
      } else if (disputeId) {
        // Send request for dispute case
        response = await citizenAPI.requestLawyerForDispute(disputeId, selectedLawyer._id, requestData);
      } else {
        // Send general connection request
        response = await citizenAPI.sendConnectionRequest(selectedLawyer._id, requestData);
      }

      if (response.success) {
        const requestType = queryId ? 'query' : disputeId ? 'dispute' : 'connection';
        success(`${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request sent successfully!`);
        setShowRequestModal(false);
        setSelectedLawyer(null);
      } else {
        error(response.error || 'Failed to send request');
      }
    } catch (err) {
      error('Failed to send request');
      console.error('Request error:', err);
    }
  };

  if (isLoading && lawyers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Lawyers</h1>
          <p className="text-gray-600">
            Browse and connect with verified lawyers across different specializations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search lawyers by name, specialization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange('specialization', e.target.value)}
                  >
                    {specializations.map((spec, index) => (
                      <option key={index} value={index === 0 ? 'all' : spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    {experienceRanges.map((exp, index) => (
                      <option key={index} value={index === 0 ? 'all' : exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="name">Name</option>
                    <option value="experience">Experience</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {lawyers.length} of {pagination.total} lawyers
          </p>
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          )}
        </div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {lawyers.map((lawyer) => (
            <LawyerCard
              key={lawyer._id}
              lawyer={lawyer}
              onRequestLawyer={handleRequestLawyer}
            />
          ))}
        </div>

        {/* Empty State */}
        {lawyers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lawyers found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center">
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

      {/* Request Modal */}
      {showRequestModal && (
        <LawyerRequestModal
          lawyer={selectedLawyer}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedLawyer(null);
          }}
          onSubmit={handleRequestSubmit}
        />
      )}
    </div>
  );
};

// Lawyer Card Component
const LawyerCard = ({ lawyer, onRequestLawyer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{lawyer.name}</h3>
          <p className="text-sm text-gray-600">{lawyer.email}</p>
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.8 (24 reviews)</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="h-4 w-4 mr-2" />
          <span>{lawyer.lawyerDetails?.experience || 'N/A'} years experience</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Award className="h-4 w-4 mr-2" />
          <span>{lawyer.lawyerDetails?.specialization?.join(', ') || 'General Practice'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>Available Online</span>
        </div>
      </div>

      <button
        onClick={() => onRequestLawyer(lawyer)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Request Lawyer</span>
      </button>
    </motion.div>
  );
};

export default FindLawyers;
