import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  FileSearch,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import Footer from '../components/common/Footer';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in just 2 minutes with your basic information. Choose between citizen, lawyer, or organization account types.',
    details: ['Email verification', 'Profile setup', 'Document upload'],
    duration: '2 mins'
  },
  {
    icon: FileSearch,
    title: 'Describe Your Legal Issue',
    description: 'Use our AI-powered form to describe your legal problem. Get instant suggestions for relevant legal areas and required documents.',
    details: ['Smart questionnaire', 'AI analysis', 'Document checklist'],
    duration: '5-10 mins'
  },
  {
    icon: Users,
    title: 'Find the Right Lawyer',
    description: 'Browse verified lawyers by specialization, location, and ratings. View their profiles, success rates, and client reviews.',
    details: ['Filter by expertise', 'Compare lawyers', 'Check availability'],
    duration: '10-15 mins'
  },
  {
    icon: MessageSquare,
    title: 'Start Consultation',
    description: 'Choose from chat, voice, or video consultation. Get immediate advice and a clear roadmap for your legal matter.',
    details: ['Multiple consultation modes', 'Screen sharing', 'Document review'],
    duration: '30-60 mins'
  },
  {
    icon: FileText,
    title: 'Receive Legal Documents',
    description: 'Get professionally drafted legal documents, petitions, or contracts. All documents are reviewed and legally compliant.',
    details: ['Professional drafting', 'Legal compliance', 'Instant download'],
    duration: '1-3 days'
  },
  {
    icon: CreditCard,
    title: 'Secure Payment & Follow-up',
    description: 'Pay securely through multiple payment options. Track your case progress and get regular updates from your lawyer.',
    details: ['Multiple payment options', 'Case tracking', 'Regular updates'],
    duration: 'Ongoing'
  }
];

const features = [
  { icon: Shield, title: 'Bank-Grade Security', description: 'Your data is protected with 256-bit encryption' },
  { icon: Clock, title: '24/7 Availability', description: 'Access legal help anytime, anywhere' },
  { icon: Star, title: 'Verified Lawyers', description: 'All lawyers are background-verified professionals' },
  { icon: Zap, title: 'Instant Matching', description: 'AI-powered lawyer matching in under 5 minutes' }
];

const HowItWorksPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/6 to-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/8 to-blue-500/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/3 to-gray-500/6 rounded-full blur-3xl animate-spin-slow"></div>
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
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Simple Process</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight"
          >
            How ChainVerdict
            <span className="block bg-gradient-to-r from-blue-400 via-gray-300 to-blue-400 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Getting legal help has never been easier. Follow our simple 6-step process to connect with
            qualified lawyers and resolve your legal matters efficiently.
          </motion.p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        className="text-center mb-16"
      >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Journey to Justice
            </h2>
            <p className="text-lg text-gray-300">
              From problem to solution in 6 simple steps
        </p>
      </motion.div>
      
      <div className="relative">
            {/* Animated Timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/30 via-gray-500/20 to-blue-500/30 hidden lg:block">
              <motion.div
                className="w-1 bg-gradient-to-b from-blue-500 to-gray-400"
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
                viewport={{ once: true }}
              />
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
            <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
                  className="relative flex items-start gap-8"
            >
                  {/* Step Icon */}
              <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      className="card-sexy w-20 h-20 bg-gradient-to-r from-blue-500 to-gray-600 rounded-full flex items-center justify-center border border-white/20"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content Card */}
                  <motion.div
                    className={`card-sexy flex-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20`}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="card-content">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                        <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-6 leading-relaxed text-lg">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-gray-400">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-300">
              Built with security, efficiency, and user experience in mind
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
              >
                <div className="card-icon w-12 h-12 bg-gradient-to-r from-blue-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
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
            className="bg-gradient-to-br from-blue-600/20 to-gray-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-gray-500/5 rounded-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of satisfied clients who have resolved their legal matters through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
          href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-gray-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  <span>Start Your Legal Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Have Questions?
                </motion.a>
              </div>
            </div>
      </motion.div>
        </div>
      </section>
    </div>

    <Footer />
  </div>
);

export default HowItWorksPage; 