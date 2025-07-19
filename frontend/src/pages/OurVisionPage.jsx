import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Heart,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Award,
  Lightbulb,
  Scale,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Lock,
  Zap
} from 'lucide-react';
import Footer from '../components/common/Footer';

const OurVisionPage = () => {
  const visionPillars = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To democratize access to justice by making legal services affordable, transparent, and accessible to every citizen of India.',
      details: 'We believe that justice should not be a privilege of the wealthy but a fundamental right accessible to all.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'A world where legal assistance is just one click away, where every individual can protect their rights regardless of their location or economic status.',
      details: 'We envision a future where technology bridges the gap between citizens and the justice system.',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'Integrity, transparency, empathy, and unwavering commitment to justice guide every decision we make.',
      details: 'We prioritize human dignity and fair treatment in every interaction on our platform.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Our Promise',
      description: 'We promise secure, reliable, and ethical legal solutions that put your interests first while maintaining the highest standards of professionalism.',
      details: 'Your trust is our foundation, and we safeguard it with cutting-edge security and ethical practices.',
      gradient: 'from-sky-500 to-indigo-500'
    }
  ];

  const impactStats = [
    { number: '1M+', label: 'Lives Impacted', icon: Users },
    { number: '500+', label: 'Cities Covered', icon: Globe },
    { number: '98%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'Support Available', icon: Shield }
  ];

  const futureGoals = [
    {
      icon: Brain,
      title: 'AI-Powered Justice',
      description: 'Advanced AI that can predict case outcomes and provide strategic legal advice'
    },
    {
      icon: Globe,
      title: 'Global Expansion',
      description: 'Bringing our legal technology to emerging markets worldwide'
    },
    {
      icon: Lock,
      title: 'Blockchain Integration',
      description: 'Immutable legal records and smart contracts for transparent transactions'
    },
    {
      icon: Scale,
      title: 'Justice for All',
      description: 'Making legal services accessible in every village and city across India'
    }
  ];

  return (
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
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Our Vision</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight"
            >
              Shaping the Future of
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-gray-300 bg-clip-text text-transparent">
                Legal Justice
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
            >
              We're building a world where justice is not a privilege but a fundamental right accessible to everyone.
              Through innovative technology and unwavering commitment, we're transforming how legal services are delivered in India.
            </motion.p>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
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
                      <div className="text-gray-300 font-medium">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Pillars */}
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
                The Pillars of Our Vision
              </h2>
              <p className="text-lg text-gray-300">
                The core principles that drive everything we do
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {visionPillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                >
                  <div className={`card-icon w-16 h-16 bg-gradient-to-r ${pillar.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="card-content">
                    <h3 className="text-2xl font-bold text-white mb-4">{pillar.title}</h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{pillar.description}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{pillar.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Future Goals */}
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
                The Road Ahead
              </h2>
              <p className="text-lg text-gray-300">
                Our ambitious goals for transforming the legal landscape
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {futureGoals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="card-icon w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <goal.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="card-content">
                  <h3 className="text-lg font-semibold text-white mb-3">{goal.title}</h3>
                  <p className="text-gray-300 text-sm">{goal.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center">
                <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                  "The first duty of society is justice. We are committed to making this a reality for all Indians."
                </blockquote>
                <cite className="block mt-6 text-gray-400 not-italic">
                  - The Founders, ChainVerdict
                </cite>
              </div>
            </motion.div>
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
                  Join Us in Building the Future
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Be a part of the legal revolution. Whether you're a citizen seeking justice or a lawyer looking to expand your practice, ChainVerdict is your platform.
                </p>
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  <span>Get Started Today</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default OurVisionPage; 