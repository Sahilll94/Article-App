import axios from 'axios';
import config from './config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timezone header for proper date formatting
    config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    
    // Only log errors in development (no sensitive URLs)
    if (config.isDevelopment()) {
      console.error('API Error:', error.response?.status || 'Network Error');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (authData) => api.post('/auth/google', authData),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
};

// Articles API
export const articlesAPI = {
  // Get all articles (public)
  getArticles: (params = {}) => api.get('/articles', { params }),
  
  // Get user's articles (private)
  getUserArticles: (params = {}) => api.get('/articles/my-articles', { params }),
  
  // Get single article by slug
  getArticle: (slug) => api.get(`/articles/${slug}`),
  
  // Get rendered article with processed markdown
  getRenderedArticle: (slug) => api.get(`/articles/${slug}/render`),
  
  // Create new article
  createArticle: (articleData) => api.post('/articles', articleData),
  
  // Update article by ID
  updateArticle: (id, articleData) => api.put(`/articles/${id}`, articleData),
  
  // Delete article by ID
  deleteArticle: (id) => api.delete(`/articles/${id}`),
  
  // Like/unlike article
  likeArticle: (id) => api.post(`/articles/${id}/like`),
  
  // Add comment to article
  addComment: (id, commentData) => api.post(`/articles/${id}/comments`, commentData),
  
  // Delete comment
  deleteComment: (articleId, commentId) => api.delete(`/articles/${articleId}/comments/${commentId}`),
  
  // Upload featured image for article
  uploadFeaturedImage: (articleId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/articles/${articleId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Upload content image (for embedding in articles)
  uploadContentImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/articles/upload-content-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Users API
export const usersAPI = {
  // Get current user profile
  getCurrentUser: () => api.get('/auth/me'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Upload user avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Change password
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  
  // Get user by ID
  getUser: (userId) => api.get(`/users/${userId}`),
  
  // Get user by username
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  
  // Get user's articles
  getUserArticles: (userId, params = {}) => api.get(`/users/${userId}/articles`, { params }),
  
  // Get user's articles by username
  getUserArticlesByUsername: (username, params = {}) => api.get(`/users/username/${username}/articles`, { params }),
  
  // Follow/unfollow user
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/users/${userId}/follow`), // Changed to POST since backend handles both follow/unfollow
  
  // Get follow status
  getFollowStatus: (userId) => api.get(`/users/${userId}/follow-status`),
  
  // Get user followers
  getUserFollowers: (userId, params = {}) => api.get(`/users/${userId}/followers`, { params }),
  
  // Get user following
  getUserFollowing: (userId, params = {}) => api.get(`/users/${userId}/following`, { params }),
  
  // Search users
  searchUsers: (params = {}) => api.get('/users/search', { params }),
  
  // Get all users
  getAllUsers: (params = {}) => api.get('/users', { params }),
};

export default api;
