import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Zap, Star, CheckCircle, Scale, FileText, Brain, Lock, Sparkles, Globe, Award, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import ladyJusticeImage from '../assets/lady.png';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const animatedWords = ['Revolutionary', 'Transparent', 'Secure', 'Intelligent'];
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Legal Intelligence',
      description: 'Advanced AI analyzes your case and provides intelligent recommendations for optimal outcomes.',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records and smart contracts ensure complete transparency and trust.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Scale,
      title: 'Digital Justice Platform',
      description: 'Streamlined legal processes with real-time case tracking and automated workflows.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Sparkles,
      title: 'Smart Automation',
      description: 'Automated document generation, case analysis, and legal research powered by AI.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Cases Resolved', icon: Award },
    { number: '2K+', label: 'Legal Experts', icon: Users },
    { number: '99.8%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'AI Support', icon: Globe }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Corporate Lawyer',
      content: 'ChainVerdict transformed how I handle cases. The AI insights are incredibly accurate.',
      rating: 5,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNSIgeT0iMTUiPgo8cGF0aCBkPSJNMjAgMjFWMTlBNCA0IDAgMCAwIDE2IDE1SDhBNCA0IDAgMCAwIDQgMTlWMjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='
    },
    {
      name: 'Rajesh Kumar',
      role: 'Legal Consultant',
      content: 'The blockchain transparency gives my clients complete confidence in the process.',
      rating: 5,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNSIgeT0iMTUiPgo8cGF0aCBkPSJNMjAgMjFWMTlBNCA0IDAgMCAwIDE2IDE1SDhBNCA0IDAgMCAwIDQgMTlWMjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='
    },
    {
      name: 'Anita Desai',
      role: 'Citizen',
      content: 'Finally, a platform that makes legal services accessible and transparent for everyone.',
      rating: 5,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNSIgeT0iMTUiPgo8cGF0aCBkPSJNMjAgMjFWMTlBNCA0IDAgMCAwIDE2IDE1SDhBNCA0IDAgMCAwIDQgMTlWMjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/80 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-gray-500/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-500/10 to-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-gray-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-8 lg:space-y-12 z-10"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500/20 to-gray-500/20 backdrop-blur-sm border border-white/10 rounded-full text-xs sm:text-sm font-medium text-white"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Powered by AI & Blockchain</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>

              <div className="space-y-6 lg:space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight"
                >
                  Justice Made
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-gray-300 bg-clip-text text-transparent"
                  >
                    {animatedWords[currentWordIndex]}
                  </motion.span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-xl text-gray-300 leading-relaxed max-w-2xl"
                >
                  Experience the future of legal services with our revolutionary platform that combines 
                  <span className="text-blue-400 font-semibold"> AI intelligence</span>, 
                  <span className="text-cyan-400 font-semibold"> blockchain security</span>, and 
                  <span className="text-gray-300 font-semibold"> transparent processes</span>.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 pt-4"
              >
                <Link
                  to="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transform"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  to="/features"
                  className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  Explore Features
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex items-center gap-8 pt-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Govt. Certified</div>
                    <div className="text-gray-400 text-sm">ISO 27001 Compliant</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Bank-Grade Security</div>
                    <div className="text-gray-400 text-sm">256-bit Encryption</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              className="relative lg:justify-self-end"
            >
              <div className="relative">
                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-gray-500/5 rounded-3xl blur-3xl animate-pulse"></div>
                
                {/* Main image container */}
                <div className="relative p-8">
                  <motion.img 
                    src={ladyJusticeImage}
                    alt="Lady Justice - Symbol of Fair Legal System" 
                    className="w-full h-auto max-h-[600px] object-contain filter drop-shadow-2xl"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))'
                    }}
                    animate={{ 
                      y: [0, -15, 0],
                      rotateZ: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Floating elements */}
                {[
                  { icon: FileText, position: 'top-4 -left-4', color: 'blue', delay: 0 },
                  { icon: Scale, position: 'bottom-4 -right-4', color: 'cyan', delay: 1 },
                  { icon: Shield, position: 'top-1/3 -left-6', color: 'green', delay: 2 },
                  { icon: Brain, position: 'bottom-1/3 -right-6', color: 'blue', delay: 3 }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`absolute ${item.position} w-16 h-16 bg-gradient-to-r from-${item.color}-500/20 to-${item.color}-600/20 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center`}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4 + item.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: item.delay
                    }}
                  >
                    <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-white/60"
          >
            <span className="text-sm mb-3 font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-3 bg-gradient-to-b from-blue-400 to-cyan-600 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Thousands</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the legal revolution that's transforming how justice is delivered
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group text-center"
              >
                <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="card-icon w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="card-content">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ChainVerdict?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of legal services with cutting-edge technology and unparalleled transparency
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="card-sexy bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 h-full">
                  <div className={`card-icon w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="card-content">
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-black text-white mb-6">
              What Our <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real stories from real people who've experienced the ChainVerdict difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 group-hover:scale-105 h-full">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-gray-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-gray-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h2 className="text-5xl font-black text-white mb-6">
                Ready to Transform Your Legal Experience?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands who trust ChainVerdict for secure, transparent, and intelligent legal services
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage; 