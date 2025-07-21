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
import CitizenDashboard from './pages/CitizenDashboard';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import AvailableCases from './pages/lawyer/AvailableCases';
import PendingCaseRequests from './pages/lawyer/PendingCaseRequests';
import ReceivedCaseRequests from './pages/lawyer/ReceivedCaseRequests';
import FindLawyers from './pages/FindLawyers';
import ConnectedLawyers from './pages/ConnectedLawyers';
import IncomingRequests from './pages/IncomingRequests';
import ConnectedClients from './pages/ConnectedClients';
import ReceivedOffers from './pages/citizen/ReceivedOffers';
import PendingRequests from './pages/citizen/PendingRequests';
import MyCaseRequests from './pages/citizen/MyCaseRequests';
import MyCaseOffers from './pages/citizen/MyCaseOffers';
import ChatPage from './pages/ChatPage';
import CreateQuery from './pages/CreateQuery';
import CreateDispute from './pages/CreateDispute';
import MyQueries from './pages/MyQueries';
import MyDisputes from './pages/MyDisputes';
import MyCases from './pages/MyCases';

import ProtectedRoute from './components/ProtectedRoute';


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

                {/* Citizen Routes */}
                <Route path="/citizen/dashboard" element={<Layout><CitizenDashboard /></Layout>} />
                <Route path="/citizen/find-lawyers" element={<Layout><FindLawyers /></Layout>} />
                <Route path="/citizen/connected-lawyers" element={<Layout><ConnectedLawyers /></Layout>} />

                {/* Citizen Query & Dispute Routes */}
                <Route path="/citizen/create-query" element={<Layout><CreateQuery /></Layout>} />
                <Route path="/citizen/create-dispute" element={<Layout><CreateDispute /></Layout>} />
                <Route path="/citizen/my-queries" element={<Layout><MyQueries /></Layout>} />
                <Route path="/citizen/my-disputes" element={<Layout><MyDisputes /></Layout>} />
                <Route path="/citizen/my-cases" element={<Layout><MyCases /></Layout>} />
                <Route path="/citizen/received-offers" element={<Layout><ReceivedOffers /></Layout>} />
                <Route path="/citizen/pending-requests" element={<Layout><PendingRequests /></Layout>} />
                <Route path="/citizen/my-case-requests" element={<Layout><MyCaseRequests /></Layout>} />
                <Route path="/citizen/my-case-offers" element={<Layout><MyCaseOffers /></Layout>} />

                {/* Lawyer Routes */}
                <Route path="/lawyer/dashboard" element={<Layout><LawyerDashboard /></Layout>} />
                <Route path="/lawyer/available-cases" element={<Layout><AvailableCases /></Layout>} />
                <Route path="/lawyer/pending-case-requests" element={<Layout><PendingCaseRequests /></Layout>} />
                <Route path="/lawyer/received-case-requests" element={<Layout><ReceivedCaseRequests /></Layout>} />
                <Route path="/lawyer/incoming-requests" element={<Layout><IncomingRequests /></Layout>} />
                <Route path="/lawyer/connected-clients" element={<Layout><ConnectedClients /></Layout>} />

                {/* Chat Routes */}
                <Route path="/chat/:chatId" element={<Layout><ChatPage /></Layout>} />

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