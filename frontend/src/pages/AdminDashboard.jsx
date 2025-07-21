import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  FileText,
  Scale,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingLawyers, setPendingLawyers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const { success, error } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsResponse, lawyersResponse] = await Promise.all([
        adminAPI.getDashboardAnalytics(),
        adminAPI.getPendingLawyerVerifications(1, 10),
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      } else {
        error('Failed to load analytics data');
      }

      if (lawyersResponse.success) {
        setPendingLawyers(lawyersResponse.data.lawyers);
      } else {
        error('Failed to load pending lawyers');
      }
    } catch (err) {
      error('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLawyerVerification = async (lawyerId, action, reason = '') => {
    const processingKey = `${lawyerId}-${action}`;
    setIsProcessing(prev => ({ ...prev, [processingKey]: true }));

    try {
      const response = await adminAPI.updateLawyerVerification(lawyerId, action, reason);

      if (response.success) {
        success(response.message || `Lawyer ${action}d successfully`);
        // Remove the lawyer from pending list
        setPendingLawyers(prev => prev.filter(lawyer => lawyer._id !== lawyerId));

        // Refresh analytics to update counts
        const analyticsResponse = await adminAPI.getDashboardAnalytics();
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data);
        }
      } else {
        error(response.error || `Failed to ${action} lawyer`);
      }
    } catch (err) {
      error(`Failed to ${action} lawyer`);
      console.error('Lawyer verification error:', err);
    } finally {
      setIsProcessing(prev => ({ ...prev, [processingKey]: false }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = analytics?.counts || {};
  const monthlyStats = analytics?.monthlyStats || [];
  const recentActivities = analytics?.recentActivities || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage platform operations and monitor system performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Citizens"
            value={stats.totalCitizens || 0}
            icon={Users}
            color="blue"
            trend="+12%"
          />
          <StatsCard
            title="Total Lawyers"
            value={stats.totalLawyers || 0}
            icon={UserCheck}
            color="green"
            trend="+8%"
          />
          <StatsCard
            title="Total Cases"
            value={(stats.totalQueries || 0) + (stats.totalDisputes || 0)}
            icon={FileText}
            color="purple"
            trend="+15%"
          />
          <StatsCard
            title="Pending Verifications"
            value={stats.pendingLawyerVerifications || 0}
            icon={Clock}
            color="orange"
            trend="0%"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Lawyer Verifications */}
          <div className="lg:col-span-2">
            <PendingLawyersSection
              lawyers={pendingLawyers}
              onVerify={handleLawyerVerification}
              isProcessing={isProcessing}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <QuickStatsCard stats={stats} />
            <RecentActivitiesCard activities={recentActivities} />
          </div>
        </div>

        {/* Charts Section */}
        {monthlyStats.length > 0 && (
          <div className="mt-8">
            <MonthlyStatsChart data={monthlyStats} />
          </div>
        )}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value = 0, icon: Icon, color, trend = "0%" }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    orange: 'bg-orange-500 text-orange-600 bg-orange-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{(value || 0).toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">{trend} from last month</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[2]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </motion.div>
  );
};

// Pending Lawyers Section Component
const PendingLawyersSection = ({ lawyers = [], onVerify, isProcessing = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <UserCheck className="h-5 w-5 mr-2 text-orange-500" />
          Pending Lawyer Verifications ({lawyers.length})
        </h2>
      </div>

      <div className="p-6">
        {lawyers.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lawyers.map((lawyer) => (
              <LawyerVerificationCard
                key={lawyer._id}
                lawyer={lawyer}
                onVerify={onVerify}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Individual Lawyer Verification Card
const LawyerVerificationCard = ({ lawyer, onVerify, isProcessing = {} }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isApproving = isProcessing[`${lawyer._id}-approve`] || false;
  const isRejecting = isProcessing[`${lawyer._id}-reject`] || false;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{lawyer.name}</h3>
              <p className="text-sm text-gray-600">{lawyer.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lawyer.lawyerDetails?.verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : lawyer.lawyerDetails?.verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {lawyer.lawyerDetails?.verificationStatus || 'pending'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lawyer.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {lawyer.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="font-medium">Phone:</span> {lawyer.phone}
            </div>
            <div>
              <span className="font-medium">Experience:</span> {lawyer.lawyerDetails?.experience || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Bar ID:</span> {lawyer.lawyerDetails?.barId || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Specialization:</span>
              {lawyer.lawyerDetails?.specialization?.join(', ') || 'N/A'}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <span className="font-medium">Education:</span> {lawyer.lawyerDetails?.education || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Address:</span> {lawyer.address || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Registered:</span> {new Date(lawyer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onVerify(lawyer._id, 'approve')}
            disabled={isApproving || isRejecting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
          >
            {isApproving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Approve
          </button>

          <button
            onClick={() => onVerify(lawyer._id, 'reject', 'Documents verification failed')}
            disabled={isApproving || isRejecting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
          >
            {isRejecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Stats Card Component
const QuickStatsCard = ({ stats = {} }) => {
  const completionRate = (stats.totalQueries || 0) > 0
    ? (((stats.completedQueries || 0) / (stats.totalQueries || 0)) * 100).toFixed(1)
    : 0;

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
          <span className="text-gray-600">Active Queries</span>
          <span className="font-semibold text-gray-900">
            {(stats.totalQueries || 0) - (stats.completedQueries || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Active Disputes</span>
          <span className="font-semibold text-gray-900">
            {(stats.totalDisputes || 0) - (stats.completedDisputes || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-semibold text-green-600">{completionRate}%</span>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-semibold text-gray-900">₹1,25,000</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Activities Card Component
const RecentActivitiesCard = ({ activities = {} }) => {
  const recentQueries = activities.queries || [];
  const recentDisputes = activities.disputes || [];

  const allActivities = [
    ...recentQueries.map(q => ({ ...q, type: 'query' })),
    ...recentDisputes.map(d => ({ ...d, type: 'dispute' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-green-500" />
        Recent Activities
      </h3>

      <div className="space-y-3">
        {allActivities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activities</p>
        ) : (
          allActivities.map((activity, index) => (
            <div key={`${activity.type}-${activity._id}`} className="flex items-start space-x-3">
              <div className={`p-1 rounded-full ${
                activity.type === 'query' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {activity.type === 'query' ? (
                  <FileText className={`h-3 w-3 ${
                    activity.type === 'query' ? 'text-blue-600' : 'text-purple-600'
                  }`} />
                ) : (
                  <Scale className="h-3 w-3 text-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  New {activity.type} by {activity.citizen?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Monthly Stats Chart Component
const MonthlyStatsChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <PieChart className="h-5 w-5 mr-2 text-purple-500" />
        Monthly Case Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((month, index) => (
          <div key={index} className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">{month.month}</div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">{month.queries}</div>
              <div className="text-xs text-gray-500">Queries</div>
              <div className="text-lg font-bold text-purple-600">{month.disputes}</div>
              <div className="text-xs text-gray-500">Disputes</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
