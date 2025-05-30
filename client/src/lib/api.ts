import axios from 'axios';

// Define Vite environment variables type
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Create axios instance with base URL
// Important: We use the root URL without /api prefix
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  addUser: async (username: string, password: string, role: 'admin' | 'user') => {
    const response = await api.post('/users', { username, password, role });
    return response.data;
  },
  updateUser: async (id: string, updates: any) => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  changePassword: async (userId: string, newPassword: string) => {
    const response = await api.post('/change-password', { userId, newPassword });
    return response.data;
  },
};

// Config API
export const configAPI = {
  getConfig: async () => {
    const response = await api.get('/config');
    return response.data;
  },
  updateConfig: async (config: any) => {
    const response = await api.put('/config', config);
    return response.data;
  },
  getHardware: async () => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.get('http://localhost:5000/api/hardware', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error getting hardware:', error);
      throw error;
    }
  },
  updateHardware: async (hardware: any[]) => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.put('http://localhost:5000/api/hardware', hardware, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error updating hardware:', error);
      throw error;
    }
  },
  getConnectivity: async () => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.get('http://localhost:5000/api/connectivity', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error getting connectivity:', error);
      throw error;
    }
  },
  updateConnectivity: async (connectivity: any[]) => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.put('http://localhost:5000/api/connectivity', connectivity, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error updating connectivity:', error);
      throw error;
    }
  },
  getLicensing: async () => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.get('http://localhost:5000/api/licensing', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error getting licensing:', error);
      throw error;
    }
  },
  updateLicensing: async (licensing: any[]) => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.put('http://localhost:5000/api/licensing', licensing, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error updating licensing:', error);
      throw error;
    }
  },
  getScales: async () => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.get('http://localhost:5000/api/scales', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error getting scales:', error);
      throw error;
    }
  },
  updateScales: async (scales: any) => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.put('http://localhost:5000/api/scales', scales, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error updating scales:', error);
      throw error;
    }
  },
  getFactors: async () => {
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.get('http://localhost:5000/api/factors', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      return response.data;
    } catch (error) {
      console.error('API: error getting factors:', error);
      throw error;
    }
  },
  updateFactors: async (factors: any) => {
    console.log('API: sending factors update to server:', JSON.stringify(factors));
    console.log('API: using direct URL: http://localhost:5000/api/factors');
    try {
      // Use a direct URL instead of relying on the baseURL
      const response = await axios.put('http://localhost:5000/api/factors', factors, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log('API: server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: error updating factors:', error);
      throw error;
    }
  },
};

// Offline support
export const offlineAPI = {
  // Process pending changes when back online
  processPendingChanges: async (pendingChanges: any[]) => {
    const results = [];
    for (const change of pendingChanges) {
      try {
        switch (change.type) {
          case 'scales':
            await configAPI.updateScales(change.data);
            break;
          case 'hardware':
            await configAPI.updateHardware(change.data);
            break;
          case 'connectivity':
            await configAPI.updateConnectivity(change.data);
            break;
          case 'licensing':
            await configAPI.updateLicensing(change.data);
            break;
        }
        results.push({ success: true, change });
      } catch (error) {
        results.push({ success: false, change, error });
      }
    }
    return results;
  },
};

export default api;
