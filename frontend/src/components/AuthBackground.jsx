import { motion } from 'framer-motion';
import { Scale, Gavel, FileText } from 'lucide-react';

export const AuthBackground = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Gradient Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#1A1B3D] to-[#0A0B1C]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 60%),
              linear-gradient(180deg, #1A1B3D 0%, #0A0B1C 100%)
            `
          }}
        />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(#7C3AED 0.5px, transparent 0.5px), linear-gradient(90deg, #7C3AED 0.5px, transparent 0.5px)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl"
        />

        {/* Legal Tech Icons with Glow */}
        <div className="relative w-full h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl" />
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 relative z-10">
                <Scale className="w-10 h-10 text-white/70" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-2/3 right-1/3 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 relative z-10">
                <Gavel className="w-10 h-10 text-white/70" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl" />
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 relative z-10">
                <FileText className="w-10 h-10 text-white/70" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M 25 25 L 75 50 L 66 66"
            stroke="url(#gradient)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M 75 25 L 25 50 L 33 66"
            stroke="url(#gradient)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}; 