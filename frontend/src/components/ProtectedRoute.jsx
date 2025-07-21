import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [], requireAuth = true }) => {
  const { isAuthenticated, isLoading, user, canAccess } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has access
  if (roles.length > 0 && !canAccess(roles)) {
    // Redirect to appropriate dashboard or unauthorized page
    if (isAuthenticated && user) {
      // Redirect to user's appropriate dashboard
      switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        case 'lawyer':
          return <Navigate to="/lawyer/dashboard" replace />;
        case 'citizen':
          return <Navigate to="/citizen/dashboard" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    
    // If not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User has access, render the protected component
  return children;
};

export default ProtectedRoute;
