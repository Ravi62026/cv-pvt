import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  User,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { lawyerAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DirectClients = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDirectClients();
  }, []);

  const fetchDirectClients = async () => {
    setIsLoading(true);
    try {
      const response = await lawyerAPI.getMyDirectClients();
      if (response.success) {
        setClients(response.data?.clients || []);
      } else {
        error(response.message || 'Failed to load direct clients');
      }
    } catch (err) {
      console.error('Fetch direct clients error:', err);
      error('Failed to load direct clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (client) => {
    navigate(`/lawyer/chat?type=direct&clientId=${client._id}`);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mr-6 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Direct Clients</h1>
                <p className="text-gray-600 mt-1">Manage your direct client connections</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
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
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.status === 'active').length}
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
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Chats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.filter(c => c.lastMessage).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Direct Clients</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No clients match your search criteria.' 
                : 'You haven\'t connected with any clients directly yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-gray-600 text-sm">{client.email}</p>
                      {client.phone && (
                        <p className="text-gray-500 text-sm flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-1" />
                          {client.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {client.status || 'active'}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Connected {new Date(client.connectedAt || client.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleStartChat(client)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>

                {client.lastMessage && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Last message:</p>
                    <p className="text-sm text-gray-800 truncate">{client.lastMessage.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(client.lastMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectClients;
