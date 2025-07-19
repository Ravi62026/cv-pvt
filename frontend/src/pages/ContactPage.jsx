import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Globe, CheckCircle } from 'lucide-react';
import Footer from '../components/common/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get in touch via email',
      value: 'support@chainverdict.com',
      action: 'mailto:support@chainverdict.com',
      gradient: 'from-gray-500 to-slate-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '24/7 customer service',
      value: '+91 98765 43210',
      action: 'tel:+919876543210',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant support available',
      value: 'Chat Now',
      action: '#',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      description: 'Visit our headquarters',
      value: 'Mumbai, Maharashtra, India',
      action: '#',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const officeHours = [
    { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', time: 'Closed' }
  ];

  const stats = [
    { number: '2K+', label: 'Happy Clients', icon: Users },
    { number: '24/7', label: 'Support Available', icon: Clock },
    { number: '50+', label: 'Countries Served', icon: Globe },
    { number: '99.9%', label: 'Uptime Guarantee', icon: CheckCircle }
  ];

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-cyan-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/4 to-gray-500/8 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-gray-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6"
          >
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span>Get in Touch</span>
          </motion.div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Let's Start a <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-gray-300 bg-clip-text text-transparent">Conversation</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about our legal services? Need support? Our team is here to help you navigate your legal journey with confidence.
            </p>
          </motion.div>

        {/* Stats Section */}
              <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              className="text-center"
            >
              <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="card-icon w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="card-content">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
            </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
            <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
              <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
              
              {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                        placeholder="Enter your email"
                      />
                    </div>
                </div>

                  <div className="grid md:grid-cols-2 gap-6">
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company
                  </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                    onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                        placeholder="Your company name"
                      />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                      placeholder="What's this about?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                      required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-white/30"
                    placeholder="Tell us more about your needs..."
                  ></textarea>
                </div>

                  <div className="text-center">
                  <motion.button
                  type="submit"
                    disabled={isSubmitting}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </motion.button>
                      </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white">Thank you!</h3>
                  <p className="text-gray-300 mt-2">Your message has been sent successfully. We will get back to you shortly.</p>
                </motion.div>
              )}
              </div>
            </div>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-8"
          >
              {contactMethods.map((method, index) => (
              <a
                  key={index}
                  href={method.action}
                className="group"
                >
                <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex items-center gap-6">
                  <div className={`card-icon w-12 h-12 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center`}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                  <div className="card-content">
                      <h3 className="text-lg font-semibold text-white">{method.title}</h3>
                  <p className="text-gray-400">{method.description}</p>
                    <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${method.gradient}">
                    {method.value}
                  </p>
                    </div>
                  </div>
              </a>
              ))}

            {/* Office Hours */}
            <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="card-icon w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="card-content">
                <h3 className="text-lg font-semibold text-white mb-4">Office Hours</h3>
                <ul className="space-y-2">
                  {officeHours.map((item, index) => (
                    <li key={index} className="flex justify-between text-gray-300">
                      <span>{item.day}</span>
                      <span>{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage; 