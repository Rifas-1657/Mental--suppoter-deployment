import axios from 'axios';

// In dev, default to same-origin so Vite proxy handles /api → backend.
// In prod, default to same-origin unless VITE_API_URL is set.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : window.location.origin);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // uncomment if backend uses cookies for auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me'),
  checkAlias: (alias) => api.post('/api/auth/check-alias', { alias }),  // fixed here
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Match API
export const matchAPI = {
  getEmotions: () => api.get('/api/match/emotions'),
  findMatches: (params) => api.get('/api/match/find', { params }),
  createMatch: (matchData) => api.post('/api/match/create', matchData),
  getMyMatches: () => api.get('/api/match/my-matches'),
  updateMatchStatus: (matchId, status) => api.put(`/api/match/${matchId}/status`, { status }),
  deleteMatch: (matchId) => api.delete(`/api/match/${matchId}`),
};

// Chat API
export const chatAPI = {
  getRooms: () => api.get('/api/chat/rooms'),
  getMessages: (roomId, params) => api.get(`/api/chat/${roomId}`, { params }),
  sendMessage: (roomId, messageData) => api.post(`/api/chat/${roomId}/message`, messageData),
  editMessage: (messageId, content) => api.put(`/api/chat/message/${messageId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/api/chat/message/${messageId}`),
  addReaction: (messageId, reaction) => api.post(`/api/chat/message/${messageId}/reaction`, { reaction }),
  removeReaction: (messageId, reaction) =>
    api.delete(`/api/chat/message/${messageId}/reaction`, { data: { reaction } }),
  getSummary: (roomId) => api.get(`/api/chat/${roomId}/summarize`),
  getSuggestions: (roomId) => api.get(`/api/chat/${roomId}/suggestions`),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/api/profile/me'),
  updateProfile: (profileData) => api.put('/api/profile/update', profileData),
  updatePreferences: (preferences) => api.put('/api/profile/preferences', preferences),
  getStats: () => api.get('/api/profile/stats'),
  getUserProfile: (userId) => api.get(`/api/profile/${userId}`),
  completeOnboarding: (onboardingData) => api.post('/api/profile/onboarding', onboardingData),
  deleteAccount: () => api.delete('/api/profile/'),
  uploadAvatar: (formData) =>
    api.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  searchUsers: (query) => api.get('/api/profile/search', { params: { q: query } }),
};

export default api;
