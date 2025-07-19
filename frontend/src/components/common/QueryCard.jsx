import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Play,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SelectLawyerModal from '../modals/SelectLawyerModal';
import { lawyerAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const QueryCard = ({ query, variant = 'full', userRole = 'citizen', onUpdate }) => {
  const [showSelectLawyer, setShowSelectLawyer] = useState(false);
  const handleBooked = () => {
    onUpdate?.();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => window.location.href = `/query/${query._id}`}
        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate mb-1">{query.title}</h3>
            <p className="text-gray-300 text-sm truncate mb-2">{query.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}</span>
              </span>
              <span className="capitalize">{query.category}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(query.status)}`}>
              {query.status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => window.location.href = `/query/${query._id}`}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{query.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(query.status)}`}>
              {getStatusIcon(query.status)}
              <span className="ml-1">{query.status.replace('-', ' ')}</span>
            </span>
            {query.priority !== 'medium' && (
              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(query.priority)}`}>
                {query.priority}
              </span>
            )}
          </div>
          <p className="text-gray-300 mb-4 line-clamp-2">{query.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{userRole === 'lawyer' ? query.createdBy?.name : query.assignedTo?.name || 'Unassigned'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}</span>
          </span>
          <span className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span className="capitalize">{query.category}</span>
          </span>
          {query.attachments?.length > 0 && (
            <span className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{query.attachments.length} files</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {userRole === 'citizen' && query.status === 'open' && (
            <button onClick={() => setShowSelectLawyer(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg transition-colors">
              Find Lawyer
            </button>
          )}
          {userRole === 'lawyer' && query.status === 'open' && (
            <button
              onClick={async () => {
                try {
                  await lawyerAPI.acceptQueryRequest(query._id);
                  toast.success('Query accepted');
                  onUpdate?.();
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to accept query');
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              Accept
            </button>
          )}
          {userRole === 'lawyer' && query.status === 'in-progress' && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              Respond
            </button>
          )}
          <button
            onClick={() => window.location.href = `/query/${query._id}`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {query.responseNotes && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <h4 className="text-green-400 font-medium mb-2">Lawyer Response:</h4>
          <p className="text-gray-300 text-sm">{query.responseNotes}</p>
        </div>
      )}
    </motion.div>
    {showSelectLawyer && (
      <SelectLawyerModal
        isOpen={showSelectLawyer}
        onClose={() => setShowSelectLawyer(false)}
        query={query}
        onBooked={handleBooked}
      />
    )}
    </>
  );
};

export default QueryCard; 