// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Client class
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from localStorage
  getAuthToken() {
    try {
      return localStorage.getItem('cv_access_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Create headers with auth token
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.headers),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry - auto logout on 401
        if (response.status === 401 && data.message?.includes('token')) {
          // Clear stored auth data
          localStorage.removeItem('cv_access_token');
          localStorage.removeItem('cv_user_data');

          // Redirect to login page
          window.location.href = '/login';

          throw new Error('Session expired. Please login again.');
        }

        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // File upload method
  async uploadFile(endpoint, formData, options = {}) {
    const headers = { ...options.headers };
    delete headers['Content-Type']; // Let browser set content-type for FormData
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers,
      ...options,
    });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API services
export const authAPI = {
  // Login
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        captchaToken: credentials.captcha || 'test-captcha', // Default for development
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        captchaToken: userData.captchaToken || 'test-captcha',
        ...(userData.role === 'citizen' && userData.aadhaar && {
          aadhaar: userData.aadhaar,
        }),
        ...(userData.role === 'lawyer' && userData.lawyerDetails && {
          lawyerDetails: userData.lawyerDetails,
        }),
      });
      
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      // Try to extract validation errors from the response
      let errorMessage = error.message;

      // If it's a fetch error with response data, try to parse it
      if (error.message && error.message.includes('Validation failed')) {
        // The error message already contains the validation details
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Logout
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reset password
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update password
  async updatePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await apiClient.put('/auth/update-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Admin API services
export const adminAPI = {
  // Get dashboard analytics
  async getDashboardAnalytics() {
    try {
      const response = await apiClient.get('/admin/dashboard/analytics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get pending lawyer verifications
  async getPendingLawyerVerifications(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/admin/lawyers/pending-verifications?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update lawyer verification status
  async updateLawyerVerification(lawyerId, action, reason = '') {
    try {
      const response = await apiClient.patch(`/admin/lawyers/${lawyerId}/verification`, {
        action,
        reason,
      });
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get all users
  async getAllUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiClient.get(`/admin/users?${queryParams}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Toggle user status
  async toggleUserStatus(userId) {
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/toggle-status`);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get system stats
  async getSystemStats() {
    try {
      const response = await apiClient.get('/admin/system/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Citizen API services
export const citizenAPI = {
  // Get citizen dashboard stats
  async getDashboard() {
    try {
      const response = await apiClient.get('/citizens/dashboard');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get available lawyers
  async getAvailableLawyers(params = {}) {
    try {
      // Filter out undefined values to prevent them from becoming 'undefined' strings
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(cleanParams).toString();
      const response = await apiClient.get(`/citizens/available-lawyers?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Send direct connection request
  async sendConnectionRequest(lawyerId, data) {
    console.log('📡 FRONTEND API: Sending connection request');
    console.log('   To Lawyer ID:', lawyerId);
    console.log('   Request Data:', data);

    try {
      const response = await apiClient.post(`/citizens/direct-connection-request/${lawyerId}`, data);
      console.log('   ✅ API Response:', response);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('   ❌ API Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get connected lawyers
  async getConnectedLawyers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/connected-lawyers?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get direct chats
  async getDirectChats(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/direct-chats?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my cases
  async getMyCases(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/my-cases?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Request lawyer for query
  async requestLawyerForQuery(queryId, lawyerId, data) {
    console.log('📡 FRONTEND API: Requesting lawyer for query');
    console.log('   Query ID:', queryId);
    console.log('   Lawyer ID:', lawyerId);
    console.log('   Request Data:', data);

    try {
      const response = await apiClient.post(`/citizens/request-lawyer-for-query/${queryId}/${lawyerId}`, data);
      console.log('   ✅ API Response:', response);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('   ❌ API Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Request lawyer for dispute
  async requestLawyerForDispute(disputeId, lawyerId, data) {
    console.log('📡 FRONTEND API: Requesting lawyer for dispute');
    console.log('   Dispute ID:', disputeId);
    console.log('   Lawyer ID:', lawyerId);
    console.log('   Request Data:', data);

    try {
      const response = await apiClient.post(`/citizens/request-lawyer-for-dispute/${disputeId}/${lawyerId}`, data);
      console.log('   ✅ API Response:', response);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error('   ❌ API Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my cases (queries and disputes)
  async getMyCases(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/my-cases?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get pending requests
  async getPendingRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/pending-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get received offers
  async getReceivedOffers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/received-offers?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my case requests
  async getMyCaseRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/my-case-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my case offers
  async getMyCaseOffers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/citizens/my-case-offers?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Accept case offer
  async acceptCaseOffer(offerId, data = {}) {
    try {
      const response = await apiClient.post(`/citizens/accept-case-offer/${offerId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reject case offer
  async rejectCaseOffer(offerId, data = {}) {
    try {
      const response = await apiClient.post(`/citizens/reject-case-offer/${offerId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Lawyer API services
export const lawyerAPI = {
  // Get lawyer dashboard stats
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/lawyers/dashboard/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get pending connection requests
  async getPendingConnectionRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/pending-connection-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Accept connection request
  async acceptConnectionRequest(connectionId, data = {}) {
    try {
      const response = await apiClient.post(`/lawyers/accept-connection-request/${connectionId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reject connection request
  async rejectConnectionRequest(connectionId, data = {}) {
    try {
      const response = await apiClient.post(`/lawyers/reject-connection-request/${connectionId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get connected citizens
  async getConnectedCitizens(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/connected-citizens?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get available cases for lawyers
  async getAvailableCases(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/available-cases?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Send request to handle query
  async sendQueryRequest(queryId, data) {
    try {
      const response = await apiClient.post(`/queries/${queryId}/send-request`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Send request to handle dispute
  async sendDisputeRequest(disputeId, data) {
    try {
      const response = await apiClient.post(`/disputes/${disputeId}/send-request`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Offer help on case (creates lawyerRequests entries)
  async offerHelpOnCase(caseType, caseId, data) {
    try {
      const response = await apiClient.post(`/lawyers/offer-help/${caseType}/${caseId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Respond to query request
  async respondToQueryRequest(queryId, requestId, data) {
    try {
      const response = await apiClient.post(`/queries/${queryId}/requests/${requestId}/respond`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Respond to dispute request
  async respondToDisputeRequest(disputeId, requestId, data) {
    try {
      const response = await apiClient.post(`/disputes/${disputeId}/requests/${requestId}/respond`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update query status
  async updateQueryStatus(queryId, data) {
    try {
      const response = await apiClient.patch(`/queries/${queryId}/status`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update dispute status
  async updateDisputeStatus(disputeId, data) {
    try {
      const response = await apiClient.patch(`/disputes/${disputeId}/status`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my case requests
  async getMyCaseRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/my-case-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get received case requests
  async getReceivedCaseRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/received-case-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Accept case request
  async acceptCaseRequest(requestId, data = {}) {
    try {
      const response = await apiClient.post(`/lawyers/accept-case-request/${requestId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reject case request
  async rejectCaseRequest(requestId, data = {}) {
    try {
      const response = await apiClient.post(`/lawyers/reject-case-request/${requestId}`, data);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get my direct clients
  async getMyDirectClients(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/my-direct-clients?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get pending connection requests
  async getPendingConnectionRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/pending-connection-requests?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Accept connection request
  async acceptConnectionRequest(connectionId) {
    try {
      const response = await apiClient.post(`/lawyers/accept-connection-request/${connectionId}`);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reject connection request
  async rejectConnectionRequest(connectionId) {
    try {
      const response = await apiClient.post(`/lawyers/reject-connection-request/${connectionId}`);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get connected citizens
  async getMyConnectedCitizens(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/lawyers/connected-citizens?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Chat API services
export const chatAPI = {
  // Get chat details and messages
  async getChatDetails(chatId) {
    try {
      const response = await apiClient.get(`/chat/${chatId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Send a message
  async sendMessage(chatId, messageData) {
    try {
      const response = await apiClient.post(`/chat/${chatId}/messages`, messageData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Mark message as read
  async markMessageAsRead(chatId, messageId) {
    try {
      const response = await apiClient.post(`/chat/${chatId}/messages/${messageId}/read`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get chat history
  async getChatHistory(chatId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/chat/${chatId}/history?${queryString}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// Export API client for other services
export default apiClient;
