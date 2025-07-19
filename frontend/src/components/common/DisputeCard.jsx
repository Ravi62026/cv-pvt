import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const DisputeCard = ({ dispute, onClick }) => {
  return (
    <div onClick={onClick} className="cursor-pointer bg-gray-800 p-4 rounded hover:bg-gray-700 transition">
      <h3 className="text-lg font-semibold text-white truncate">{dispute.title}</h3>
      <p className="text-gray-400 text-sm truncate">{dispute.description}</p>
      <div className="flex justify-between text-gray-400 text-xs mt-2">
        <span className="capitalize">{dispute.status.replace('-', ' ')}</span>
        <span>{formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}</span>
      </div>
    </div>
  );
};

export default DisputeCard; 