import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowUp,
  Heart
} from 'lucide-react';
import logCv from '../../assets/log-cv.jpg';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Our Vision', path: '/vision' },
    { name: 'Contact', path: '/contact' }
  ];

  const services = [
    { name: 'Legal Consultation', path: '/consultation' },
    { name: 'Dispute Resolution', path: '/disputes' },
    { name: 'Document Review', path: '/dashboard' },
    { name: 'Case Management', path: '/dashboard' },
    { name: 'Legal Advice', path: '/consultation' },
    { name: 'Court Representation', path: '/profile' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3">
                <img src={logCv} alt="ChainVerdict Logo" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ChainVerdict
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing legal services with cutting-edge AI technology and blockchain security. 
                Making justice accessible to everyone.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:border-transparent transition-all duration-300"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 text-gray-300 hover:text-white" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 rounded-full mr-3"></div>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-gradient-to-r from-blue-500 to-cyan-500 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 via-purple-500 to-cyan-500 rounded-full mr-3"></div>
                Our Services
              </h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <Link 
                      to={service.path} 
                      className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
                Get In Touch
              </h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>support@chainverdict.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>123 Legal Street, Justice City</span>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h5 className="text-white font-medium mb-2">Stay Updated</h5>
                <p className="text-gray-400 text-sm mb-3">Get the latest legal insights and updates</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-r-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300">
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-gray-400">
                <span>&copy; {new Date().getFullYear()} ChainVerdict. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for Justice
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</Link>
              </div>
            </div>
          </div>

          {/* Scroll to Top Button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-700 to-cyan-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 