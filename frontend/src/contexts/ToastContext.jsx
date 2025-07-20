import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast context
const ToastContext = createContext();

// Toast component
const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return <CheckCircle className="h-6 w-6 text-emerald-400" />;
      case TOAST_TYPES.ERROR:
        return <XCircle className="h-6 w-6 text-red-400" />;
      case TOAST_TYPES.WARNING:
        return <AlertCircle className="h-6 w-6 text-amber-400" />;
      case TOAST_TYPES.INFO:
        return <Info className="h-6 w-6 text-cyan-400" />;
      default:
        return <Info className="h-6 w-6 text-cyan-400" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          background: 'bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-emerald-600/20',
          border: 'border-emerald-400/30',
          iconBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          glow: 'shadow-emerald-500/25'
        };
      case TOAST_TYPES.ERROR:
        return {
          background: 'bg-gradient-to-r from-red-500/20 via-rose-500/15 to-red-600/20',
          border: 'border-red-400/30',
          iconBg: 'bg-gradient-to-r from-red-500 to-rose-500',
          glow: 'shadow-red-500/25'
        };
      case TOAST_TYPES.WARNING:
        return {
          background: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20',
          border: 'border-amber-400/30',
          iconBg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          glow: 'shadow-amber-500/25'
        };
      case TOAST_TYPES.INFO:
        return {
          background: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-600/20',
          border: 'border-cyan-400/30',
          iconBg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          glow: 'shadow-cyan-500/25'
        };
      default:
        return {
          background: 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-600/20',
          border: 'border-cyan-400/30',
          iconBg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          glow: 'shadow-cyan-500/25'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3, rotateX: -15 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: -20,
        transition: { duration: 0.2 }
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`max-w-sm w-full ${styles.background} backdrop-blur-xl border ${styles.border} rounded-2xl shadow-2xl ${styles.glow} pointer-events-auto overflow-hidden relative group toast-shimmer`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
        className={`absolute top-0 left-0 h-1 ${styles.iconBg} rounded-t-2xl`}
      />

      <div className="p-5 relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon with gradient background */}
          <div className={`flex-shrink-0 w-10 h-10 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-bold text-white mb-1">
                {toast.title}
              </p>
            )}
            <p className="text-sm text-gray-200 leading-relaxed">
              {toast.message}
            </p>
          </div>

          {/* Close button */}
          <button
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 group/close"
            onClick={() => onRemove(toast.id)}
          >
            <X className="h-4 w-4 text-white/70 group-hover/close:text-white transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast container component
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-0 right-0 p-6 pointer-events-none z-[9999] max-h-screen overflow-hidden">
      <div className="flex flex-col items-end space-y-3 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }
              }}
              exit={{
                opacity: 0,
                x: 100,
                scale: 0.8,
                transition: { duration: 0.2 }
              }}
            >
              <Toast toast={toast} onRemove={onRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add haptic feedback
  const triggerHaptic = useCallback((type) => {
    if (navigator.vibrate) {
      switch (type) {
        case TOAST_TYPES.SUCCESS:
          navigator.vibrate([50, 30, 50]); // Success pattern
          break;
        case TOAST_TYPES.ERROR:
          navigator.vibrate([100, 50, 100, 50, 100]); // Error pattern
          break;
        case TOAST_TYPES.WARNING:
          navigator.vibrate([80, 40, 80]); // Warning pattern
          break;
        default:
          navigator.vibrate(50); // Default
      }
    }
  }, []);

  // Add toast
  const addToast = useCallback((message, type = TOAST_TYPES.INFO, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, toast]);

    // Add haptic feedback
    triggerHaptic(type);

    // Auto remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [triggerHaptic]);

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.SUCCESS, options);
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.ERROR, options);
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.WARNING, options);
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, TOAST_TYPES.INFO, options);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
