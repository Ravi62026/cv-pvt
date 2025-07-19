import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Static forgot password - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const msg = 'Password reset email sent successfully!';
      setMessage(msg);
      setError('');
      toast.success(msg, { duration: 4000 });
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage('');
      // Extract error message from response
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message;
      if (err.response?.status === 404) {
        toast.error('No account found with that email. Please sign up first.', { duration: 4000 });
      } else {
        toast.error(errMsg || 'An error occurred', { duration: 4000 });
      }
      setError(errMsg || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/80 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/10 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10 space-y-8 relative z-10 mx-auto"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">Forgot Password</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                Email address
              </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              placeholder="Enter your email"
                />
              </div>
          {typeof message === 'string' && message && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-green-400 text-sm text-center font-semibold">{message}</div>
            )}
          {typeof error === 'string' && error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm text-center font-semibold">{error}</div>
            )}
              <button
                type="submit"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 mr-2 inline-block align-middle">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </span>
            ) : null}
            {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
          </form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage; 