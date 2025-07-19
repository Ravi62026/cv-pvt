import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Shield,
  MessageSquare,
  FileText,
  Clock,
  Users,
  Gavel,
  Search,
  Lock,
  Zap,
  CheckCircle,
  Star,
  Video,
  Phone,
  Calendar,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';
import Footer from '../components/common/Footer';

const mainFeatures = [
  {
    icon: Brain,
    title: 'AI-Powered Legal Assistant',
    description: 'Get instant legal advice with our advanced AI that understands Indian law and provides personalized recommendations.',
    benefits: ['24/7 Availability', 'Instant Responses', 'Case Law References'],
    gradient: 'from-cyan-500 to-teal-500'
  },
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'All your legal documents and communications are secured with military-grade blockchain encryption.',
    benefits: ['Immutable Records', 'Data Privacy', 'Tamper-Proof Storage'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'Verified Lawyer Network',
    description: 'Connect with 500+ verified lawyers across India specializing in different areas of law.',
    benefits: ['Background Verified', 'Experience Ratings', 'Client Reviews'],
    gradient: 'from-green-500 to-emerald-500'
  }
];

const consultationFeatures = [
  {
    icon: MessageSquare,
    title: 'Live Chat Consultation',
    description: 'Get immediate legal advice through secure chat with qualified lawyers.',
    price: 'Starting at ₹500'
  },
  {
    icon: Video,
    title: 'Video Consultation',
    description: 'Face-to-face meetings with lawyers from the comfort of your home.',
    price: 'Starting at ₹1000'
  },
  {
    icon: Phone,
    title: 'Voice Call Support',
    description: 'Direct phone consultation for urgent legal matters.',
    price: 'Starting at ₹800'
  },
  {
    icon: Calendar,
    title: 'Scheduled Meetings',
    description: 'Book appointments with lawyers at your preferred time.',
    price: 'Flexible Pricing'
  }
];

const additionalFeatures = [
  { icon: FileText, title: 'Document Management', description: 'Secure storage and sharing of legal documents' },
  { icon: Search, title: 'Case Law Search', description: 'Access to comprehensive legal database' },
  { icon: Clock, title: 'Real-time Updates', description: 'Live case status and progress tracking' },
  { icon: Gavel, title: 'Dispute Resolution', description: 'Online mediation and arbitration services' },
  { icon: Lock, title: 'Privacy Protection', description: 'End-to-end encryption for all communications' },
  { icon: BookOpen, title: 'Legal Resources', description: 'Access to legal guides and templates' },
  { icon: Award, title: 'Quality Assurance', description: 'Rated lawyers with proven track records' },
  { icon: TrendingUp, title: 'Case Analytics', description: 'Data-driven insights for better outcomes' }
];

const FeaturesPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-cyan-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/4 to-gray-500/8 rounded-full blur-3xl animate-spin-slow"></div>
    </div>

    <div className="relative z-10 pt-24 pb-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-gray-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6"
      >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Powerful Features</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight"
          >
            Revolutionary Legal
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-gray-300 bg-clip-text text-transparent">
              Technology
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Experience the future of legal services with our comprehensive platform that combines
            AI intelligence, blockchain security, and human expertise to deliver unparalleled legal solutions.
          </motion.p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-300">
              The foundation of our revolutionary legal platform
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
              >
                <div className={`card-icon w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className="card-content">
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Consultation Options
            </h2>
            <p className="text-lg text-gray-300">
              Choose the consultation method that works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultationFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="card-icon w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="card-content">
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                  <div className="text-cyan-400 font-semibold">{feature.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Legal Solution
            </h2>
            <p className="text-lg text-gray-300">
              Everything you need for your legal journey in one platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
              >
                <div className="card-icon w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="card-content">
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
              </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Experience the Future of Law?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join ChainVerdict today and get access to the most advanced legal platform in India.
              </p>
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                <span>Get Started</span>
                <Zap className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
      </div>
      </section>
    </div>

    <Footer />
  </div>
);

export default FeaturesPage; 