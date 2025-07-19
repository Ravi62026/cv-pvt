import { motion } from 'framer-motion';

export const AuthContent = ({ title, subtitle }) => {
  return (
    <div className="relative z-10 text-center max-w-lg mt-16 sm:mt-20 lg:mt-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300">
          {subtitle}
        </p>
      </motion.div>
    </div>
  );
}; 