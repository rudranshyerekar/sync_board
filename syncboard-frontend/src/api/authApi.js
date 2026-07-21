import httpClient from './httpClient';

export const authApi = {
  login: async (credentials) => {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await httpClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await httpClient.post('/auth/logout');
    } catch (e) {
      console.error("Logout failed on server, cleaning up locally anyway", e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};
