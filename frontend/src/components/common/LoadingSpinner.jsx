import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center flex flex-col items-center">
        <motion.div
          className={`relative ${sizeClasses[size]} flex items-center justify-center`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute inline-block w-full h-full rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 opacity-30 blur-xl animate-pulse"></span>
          <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="6" opacity="0.15" />
            <motion.circle
              cx="32" cy="32" r="28"
              stroke="url(#spinner-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="120 100"
              strokeDashoffset="0"
              initial={{ strokeDashoffset: 120 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="spinner-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="0.5" stopColor="#06b6d4" />
                <stop offset="1" stopColor="#a21caf" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <div className="flex gap-1 justify-center mt-4 mb-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-tr from-blue-400 via-cyan-400 to-purple-400"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="text-white text-lg font-semibold tracking-wide drop-shadow-lg animate-pulse">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 