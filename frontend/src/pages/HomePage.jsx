import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Clock, 
  Shield, 
  Award,
  Search,
  BookOpen,
  Phone,
  Video
} from 'lucide-react';
import Footer from '../components/common/Footer';

const HomePage = () => {
  const services = [
    {
      icon: MessageSquare,
      title: 'Legal Consultation',
      description: 'Get expert legal advice from qualified lawyers across various domains.',
      features: ['24/7 Availability', 'Instant Responses', 'Expert Guidance']
    },
    {
      icon: FileText,
      title: 'Document Review',
      description: 'Professional review and analysis of your legal documents.',
      features: ['Contract Analysis', 'Document Drafting', 'Legal Compliance']
    },
    {
      icon: Users,
      title: 'Case Management',
      description: 'Comprehensive case tracking and management services.',
      features: ['Progress Tracking', 'Timeline Updates', 'Status Reports']
    }
  ];

  const consultationTypes = [
    {
      icon: MessageSquare,
      title: 'Chat Consultation',
      description: 'Quick text-based legal advice',
      price: 'Starting at ₹500'
    },
    {
      icon: Phone,
      title: 'Voice Call',
      description: 'Direct phone consultation',
      price: 'Starting at ₹800'
    },
    {
      icon: Video,
      title: 'Video Call',
      description: 'Face-to-face video consultation',
      price: 'Starting at ₹1000'
    }
  ];

  const legalCategories = [
    'Criminal Law',
    'Civil Law',
    'Family Law',
    'Corporate Law',
    'Property Law',
    'Labor Law',
    'Tax Law',
    'Constitutional Law',
    'Intellectual Property',
    'Consumer Law',
    'Environment Law',
    'Cyber Law'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-600/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Our Legal Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Comprehensive legal solutions tailored to your needs. Connect with expert lawyers 
              and get professional guidance for all your legal matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-300">
              Professional legal services designed for the modern world
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sexy bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
              >
                <div className="card-icon bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <div className="card-content">
                <h3 className="text-xl font-semibold text-white mb-4">{service.title}</h3>
                <p className="text-gray-300 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Types */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Consultation Options
            </h2>
            <p className="text-xl text-gray-300">
              Choose the consultation method that works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {consultationTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sexy bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
              >
                <div className="card-icon bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                <div className="card-content">
                <h3 className="text-xl font-semibold text-white mb-4">{type.title}</h3>
                <p className="text-gray-300 mb-4">{type.description}</p>
                  <div className="text-cyan-400 font-semibold text-lg">{type.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Categories */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Legal Expertise Areas
            </h2>
            <p className="text-xl text-gray-300">
              Our lawyers specialize in various areas of law
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {legalCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="card-sexy bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center cursor-pointer"
              >
                <div className="card-content text-white font-medium">
                  {category}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Need Legal Help?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Don't wait. Get the legal support you need today from our expert lawyers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
              >
                <span>Get Started Now</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage; 