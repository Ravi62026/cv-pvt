import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeaturesPage from './pages/FeaturesPage';
import ProfilePage from './pages/ProfilePage';

import HowItWorksPage from './pages/HowItWorksPage';
import OurVisionPage from './pages/OurVisionPage';
import ScrollToTop from './components/ScrollToTop';



// Create dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#121212'
    },
    primary: {
      main: '#2196f3'
    },
    secondary: {
      main: '#f50057'
    }
  }
});

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <ScrollToTop />
            <div className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><LandingPage /></Layout>} />
                <Route path="/home" element={<Layout><HomePage /></Layout>} />
                <Route path="/features" element={<Layout><FeaturesPage /></Layout>} />
                <Route path="/how-it-works" element={<Layout><HowItWorksPage /></Layout>} />
                <Route path="/vision" element={<Layout><OurVisionPage /></Layout>} />
                <Route path="/about" element={<Layout><AboutPage /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

                {/* Auth Routes */}
                <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
                <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
                <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />



                {/* Protected Routes */}
                <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />


                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;