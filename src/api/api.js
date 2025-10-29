import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // NestJS backend
});

// Store navigate function globally (will be set by the hook)
let navigateFn = null

export const setNavigate = (navigate) => {
  navigateFn = navigate
}

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to invalid/expired token (401 Unauthorized)
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (navigateFn) {
        navigateFn('/login', {
          state: { error: 'Your session has expired. Please log in again.' },
        })
      }
    }
    return Promise.reject(error)
  },
);

export default api;
