import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true // Uncomment if using cookies for session/auth
});

// Request Interceptor
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (placeholder for token refresh logic in Phase 1)
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We will add token refresh logic here in Phase 1
    return Promise.reject(error);
  }
);

export default httpClient;
