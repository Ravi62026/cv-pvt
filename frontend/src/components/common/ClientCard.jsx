import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  MessageSquare, 
  Star,
  Calendar,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ClientCard = ({ client }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={client.profileImage?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMyIgeT0iMTMiPgo8cGF0aCBkPSJNMjAgMjFWMTlBNCA0IDAgMCAwIDE2IDE1SDhBNCA0IDAgMCAwIDQgMTlWMjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='}
            alt={client.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
          <p className="text-gray-300 text-sm">{client.email}</p>
          <div className="flex items-center space-x-1 text-sm text-gray-400 mt-1">
            <Calendar className="h-3 w-3" />
            <span>
              Client since {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-lg font-semibold text-white">
            {client.consultationHistory?.length || 0}
          </div>
          <div className="text-xs text-gray-400">Cases</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-white">
            {client.totalPaid ? `₹${client.totalPaid.toLocaleString()}` : '₹0'}
          </div>
          <div className="text-xs text-gray-400">Paid</div>
        </div>
        <div>
          <div className="flex items-center justify-center">
            {client.averageRating ? (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{client.averageRating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">No rating</span>
            )}
          </div>
          <div className="text-xs text-gray-400">Rating</div>
        </div>
      </div>

      {/* Last Consultation */}
      {client.lastConsultation && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-blue-400 font-medium text-sm">Last Consultation</h4>
              <p className="text-gray-300 text-xs">
                {client.lastConsultation.title || 'Consultation'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-blue-400 text-sm">
                {formatDistanceToNow(new Date(client.lastConsultation.date), { addSuffix: true })}
              </div>
              <div className="text-xs text-gray-400">
                {client.lastConsultation.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Queries */}
      {client.activeQueries > 0 && (
        <div className="mb-4 flex items-center space-x-2 text-sm">
          <FileText className="h-4 w-4 text-yellow-400" />
          <span className="text-gray-300">
            {client.activeQueries} active {client.activeQueries === 1 ? 'query' : 'queries'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg transition-all duration-200">
          <MessageSquare className="h-4 w-4" />
          <span>Message</span>
        </button>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default ClientCard; 