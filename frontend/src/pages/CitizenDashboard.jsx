import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  FileText,
  Scale,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  UserPlus,
  MessageSquare,
  BarChart3,
  Activity,
  ArrowRight,
  Send,
  Gift,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { citizenAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CitizenDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await citizenAPI.getDashboard();
      if (response.success) {
        setStats(response.data);
      } else {
        error('Failed to load dashboard data');
      }
    } catch (err) {
      error('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Manage your legal matters and connect with verified lawyers
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Legal Support</p>
                    <p className="text-sm opacity-90">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Submit Legal Query Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/citizen/create-query')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Submit Legal Query
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Get expert legal advice from verified lawyers for your questions
              </p>

              <div className="mt-6 flex items-center text-blue-100">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Available 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* File Dispute Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/citizen/create-dispute')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                File Dispute
              </h3>
              <p className="text-red-100 text-lg leading-relaxed">
                Resolve legal disputes with professional mediation and support
              </p>

              <div className="mt-6 flex items-center text-red-100">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Expert Resolution</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Cases Card */}
        <div className="mb-8">
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/citizen/my-cases')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent"></div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    My Cases
                  </h3>
                  <p className="text-indigo-100">
                    View and manage all your queries & disputes
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </motion.div>
        </div>

        {/* Secondary Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Find Lawyers */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/find-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Lawyers</h3>
              <p className="text-sm text-gray-600">Browse verified legal professionals</p>
            </motion.div>

            {/* Connected Lawyers */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/connected-lawyers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connected Lawyers</h3>
              <p className="text-sm text-gray-600">View your legal connections</p>
            </motion.div>

            {/* My Case Requests */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-case-requests')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Requests</h3>
              <p className="text-sm text-gray-600">Requests sent to lawyers</p>
            </motion.div>

            {/* My Case Offers */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-case-offers')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Gift className="h-5 w-5 text-indigo-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Offers Received</h3>
              <p className="text-sm text-gray-600">Lawyers offering help</p>
            </motion.div>

            {/* My Queries */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/citizen/my-queries')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">My Queries</h3>
              <p className="text-sm text-gray-600">Manage legal questions</p>
            </motion.div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Cases */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalCases || 0}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            {/* Active Cases */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Cases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.activeCases || 0}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+8%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            {/* Connected Lawyers */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Connected Lawyers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.connectedLawyers || 0}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+15%</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">Awaiting</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivitySection />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <QuickStatsCard stats={stats} />
            <RecentConnectionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${colorClasses[color]} text-white p-6 rounded-lg shadow-lg cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8" />
        <ArrowRight className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-sm text-green-600 font-medium">{trend}</span>
        <span className="text-sm text-gray-500 ml-1">from last month</span>
      </div>
    </motion.div>
  );
};

// Recent Activity Section
const RecentActivitySection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Recent Activity
        </h2>
      </div>
      <div className="p-6">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-2">
            Your recent cases and lawyer interactions will appear here
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Quick Stats Card
const QuickStatsCard = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
        Quick Stats
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Resolved Cases</span>
          <span className="font-semibold text-green-600">{stats?.resolvedCases || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Received Offers</span>
          <span className="font-semibold text-blue-600">{stats?.receivedOffers || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Success Rate</span>
          <span className="font-semibold text-purple-600">95%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Connections Card
const RecentConnectionsCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-green-500" />
        Recent Connections
      </h3>
      <div className="text-center py-4">
        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No recent connections</p>
        <p className="text-xs text-gray-400 mt-1">
          Connect with lawyers to see them here
        </p>
      </div>
    </motion.div>
  );
};

export default CitizenDashboard;
