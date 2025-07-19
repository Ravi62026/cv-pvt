import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Scale,
  Users,
  CheckCircle,
  UserCheck,
  AlertCircle,
  Info,
  Gavel,
  FileText
} from 'lucide-react';

import ReCAPTCHA from 'react-google-recaptcha';
import { AuthBackground } from '../components/AuthBackground';
import { AuthContent } from '../components/AuthContent';

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    barId: '',
    studentId: '',
    aadhaar: '',
    acceptTerms: false,
    captcha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Password strength criteria
  const strengthChecks = {
    length: password => password.length >= 8,
    uppercase: password => /[A-Z]/.test(password),
    lowercase: password => /[a-z]/.test(password),
    number: password => /[0-9]/.test(password),
    special: password => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // Debounce typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    Object.values(strengthChecks).forEach(check => {
      if (check(password)) strength += 1;
    });
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const roles = [
    {
      id: 'citizen',
      title: 'Citizen',
      description: 'Seeking legal advice and consultation',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'lawyer',
      title: 'Lawyer',
      description: 'Providing legal services and consultation',
      icon: Scale,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsTyping(true);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters.';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.role === 'lawyer' && !formData.barId) {
      newErrors.barId = 'Bar ID is required for lawyers';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleCaptchaChange = (value) => {
    setFormData({
      ...formData,
      captcha: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    if (!formData.captcha) {
      setApiError('Please complete the CAPTCHA verification');
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'lawyer' && { barId: formData.barId }),
        ...(formData.role === 'citizen' && { aadhaar: formData.aadhaar }),
        acceptTerms: formData.acceptTerms.toString(),
        captcha: formData.captcha
      };

      // Static signup - just navigate to login for now
      console.log('Signup attempt:', userData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - redirect to login
      navigate('/login');
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0B1C]">
      {/* Animated Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-cyan-500/10 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/20 blur-2xl rounded-full animate-pulse delay-1000" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/10 blur-2xl rounded-full animate-pulse delay-500" />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-float" />
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-blue-400/40 rounded-full animate-float delay-1000" />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-cyan-300/50 rounded-full animate-float delay-3000" />

        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-xl animate-float delay-500" />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-xl animate-float delay-1500" />
      </div>
      {/* Left Side */}
      <AuthBackground />
      <div className="absolute top-24 left-0 lg:left-1/4 transform lg:-translate-x-1/2 z-20 pointer-events-none">
        <AuthContent 
          title="Join ChainVerdict"
          subtitle="Your journey to transparent justice begins here"
        />
      </div>
      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-[#0A0B1C] relative z-10">
        <div className="w-full max-w-lg mt-30">
          {/* Logo and Navigation (Mobile Only) */}
          <div className="lg:hidden flex items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                CV
              </div>
              <span className="text-white text-xl font-semibold">ChainVerdict</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-2"
            >
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Home
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center space-x-4 mb-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: step >= 1 ? [1, 1.1, 1] : 1,
                opacity: 1
              }}
              transition={{ duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${
                step >= 1 ? 'bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-[#1D1F3B] text-gray-400'
              }`}
            >
              {step >= 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 animate-pulse"
                />
              )}
              <span className="relative z-10">1</span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= 2 ? 1 : 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`w-16 h-1 rounded-full transition-all duration-500 ${
                step >= 2 ? 'bg-gradient-to-r from-blue-700 via-purple-500 to-cyan-500' : 'bg-[#1D1F3B]'
              }`}
            >
              {step >= 2 && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-full w-4 bg-white/30 rounded-full"
                />
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: step >= 2 ? [1, 1.1, 1] : 1,
                opacity: 1
              }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${
                step >= 2 ? 'bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-[#1D1F3B] text-gray-400'
              }`}
            >
              {step >= 2 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 animate-pulse"
                />
              )}
              <span className="relative z-10">2</span>
            </motion.div>
          </motion.div>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-900/30 relative overflow-hidden hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-700/30 via-cyan-400/10 to-purple-500/10 animate-gradient-move" style={{zIndex:0}} />

                {/* Floating icons */}
                <div className="absolute top-4 right-4 opacity-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Scale className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>

                <motion.h3
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-white mb-6 relative z-10"
                >
                  Choose your role
                </motion.h3>
                <div className="space-y-4 relative z-10">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 relative overflow-hidden group ${
                        formData.role === role.id
                          ? 'bg-gradient-to-r from-blue-700 to-cyan-500 border-transparent shadow-lg shadow-cyan-500/25'
                          : 'bg-[#181B2E]/80 border-blue-900/40 hover:bg-[#252849] hover:border-blue-700/60'
                      }`}
                    >
                      {/* Hover effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className={`flex items-center space-x-4 relative z-10`}>
                        <motion.div
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            formData.role === role.id ? 'bg-white/20' : 'bg-[#16182F] group-hover:bg-blue-900/30'
                          }`}
                          whileHover={{ rotate: 5 }}
                        >
                          <role.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white">{role.title}</h4>
                          <p className="text-sm text-gray-300">{role.description}</p>
                        </div>
                        <AnimatePresence>
                          {formData.role === role.id && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", duration: 0.5 }}
                            >
                              <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {errors.role && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.role}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleNext}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 via-cyan-500 to-purple-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 relative overflow-hidden group"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex items-center gap-2">
                    Continue
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-blue-900/30 relative overflow-hidden hover:shadow-cyan-500/10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Animated border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-700/30 via-cyan-400/10 to-purple-500/10 animate-gradient-move" style={{zIndex:0}} />

                {/* Floating icons */}
                <div className="absolute top-4 right-4 opacity-20">
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Gavel className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </div>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-4 left-4 flex items-center gap-1"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-1 h-1 bg-cyan-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence>
                    {apiError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{apiError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative z-10"
                  >
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <motion.div
                          animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <User className="h-5 w-5 text-cyan-400" />
                        </motion.div>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#181B2E]/80 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-blue-700/60 ${
                          errors.name ? 'border-red-500 ring-red-500/20' : 'border-blue-900/40'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {/* Animated underline */}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.phone ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                        }`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                        }`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <motion.div
                              key={level}
                              className={`h-1 w-full rounded-full ${
                                level <= passwordStrength
                                  ? level <= 2
                                    ? 'bg-red-500'
                                    : level <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.2, delay: level * 0.1 }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Password strength: {
                            passwordStrength <= 2 ? 'Weak' :
                            passwordStrength <= 3 ? 'Medium' :
                            'Strong'
                          }
                        </p>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                          errors.confirmPassword ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Aadhaar Field (for citizens) */}
                  {formData.role === 'citizen' && (
                    <div>
                      <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-200 mb-2">
                        Aadhaar Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          id="aadhaar"
                          name="aadhaar"
                          type="text"
                          value={formData.aadhaar}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                            errors.aadhaar ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                          }`}
                          placeholder="Enter your 12-digit Aadhaar number"
                          maxLength="12"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.aadhaar && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-400 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.aadhaar}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Bar ID Field (for lawyers) */}
                  {formData.role === 'lawyer' && (
                    <div>
                      <label htmlFor="barId" className="block text-sm font-medium text-gray-200 mb-2">
                        Bar Council ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCheck className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          id="barId"
                          name="barId"
                          type="text"
                          value={formData.barId}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-3 bg-[#1D1F3B] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                            errors.barId ? 'border-red-500 ring-red-500/20' : 'border-gray-700'
                          }`}
                          placeholder="Enter your Bar Council ID"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.barId && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-400 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.barId}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                        I agree to the{' '}
                        <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors duration-300 underline">
                          Privacy Policy
                        </Link>
                      </label>
                      <AnimatePresence>
                        {errors.acceptTerms && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-2 text-sm text-red-400 flex items-center gap-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.acceptTerms}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* reCAPTCHA */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-center relative z-10"
                  >
                    {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
                      <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        theme="dark"
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg"
                      >
                        <p className="text-yellow-300 text-sm">
                          I'm not a robot ✓
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="flex gap-4 relative z-10"
                  >
                    <motion.button
                      type="button"
                      onClick={handleBack}
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#181B2E]/80 text-white rounded-lg font-medium border border-blue-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] transition-all duration-300 hover:bg-[#252849] hover:border-blue-700/60"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 via-cyan-500 to-purple-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#16182F] shadow-lg transition-all duration-300 relative overflow-hidden ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-2xl hover:shadow-cyan-500/25'
                      }`}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-400 opacity-0 hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-400">
              Already have an account?{' '}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline underline-offset-4 decoration-2 inline-flex items-center gap-1"
                >
                  Sign in
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 