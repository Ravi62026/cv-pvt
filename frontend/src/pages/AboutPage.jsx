import { motion } from 'framer-motion';
import { 
  Scale, 
  Users, 
  Shield, 
  Award, 
  Target, 
  Heart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Footer from '../components/common/Footer';

const AboutPage = () => {
  const values = [
    {
      icon: Scale,
      title: 'Justice for All',
      description: 'We believe that legal assistance should be accessible to everyone, regardless of their background or financial status.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your privacy and data security are our top priorities. We maintain the highest standards of confidentiality.'
    },
    {
      icon: Heart,
      title: 'Compassionate Service',
      description: 'We understand that legal issues can be stressful. Our platform is designed with empathy and care.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We connect you with qualified, experienced lawyers who are committed to providing exceptional service.'
    }
  ];

  const features = [
    'AI-powered legal query analysis',
    'Verified lawyer network',
    'Secure document handling',
    'Real-time consultation',
    '24/7 platform availability',
    'Transparent pricing',
    'Multi-language support',
    'Mobile-friendly interface'
  ];

  const stats = [
    { number: '10,000+', label: 'Legal Queries Resolved' },
    { number: '500+', label: 'Verified Lawyers' },
    { number: '50+', label: 'Cities Covered' },
    { number: '98%', label: 'Client Satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 pt-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/6 to-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/8 to-blue-500/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/4 to-gray-500/8 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-gray-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white mb-6 mx-auto"
          >
            <Scale className="w-4 h-4 text-blue-400" />
            <span>About ChainVerdict</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Revolutionizing
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-gray-300 bg-clip-text text-transparent">
                Legal Justice
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to democratize legal services through cutting-edge technology, 
              making professional legal assistance accessible to everyone, everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                ChainVerdict was founded with a simple yet powerful mission: to democratize access to legal services. 
                We leverage cutting-edge technology to bridge the gap between citizens seeking legal help and qualified lawyers.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our platform combines artificial intelligence, blockchain technology, and human expertise to create 
                a transparent, efficient, and trustworthy legal consultation ecosystem.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
                <div className="relative">
                <Target className="h-16 w-16 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-gray-300 leading-relaxed">
                  To create a world where legal assistance is just a click away, where justice is not limited by 
                  geography, language, or economic status, and where every individual has the power to protect their rights.
                </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do at ChainVerdict
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                                  className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                  <div className="card-icon bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl w-fit mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                  <div className="card-content">
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-300">
              Numbers that speak to our commitment to justice
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                  <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="card-content">
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
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

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                What Makes Us Different
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                ChainVerdict isn't just another legal platform. We've built something truly innovative that 
                combines the best of technology with human expertise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-8 border border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
                <div className="relative">
                <Users className="h-16 w-16 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Join Our Community</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Be part of a growing community of legal professionals and citizens working together 
                  to make justice more accessible and transparent.
                </p>
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
                  <span>Get Started Today</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage; 