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
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('Using backend URL:', BACKEND_URL);

const api = axios.create({
  baseURL: BACKEND_URL,
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
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },
  addUser: async (username: string, password: string, role: 'admin' | 'user') => {
    const response = await api.post('/api/users', { username, password, role });
    return response.data;
  },
  updateUser: async (id: string, updates: any) => {
    const response = await api.put(`/api/users/${id}`, updates);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
  changePassword: async (userId: string, newPassword: string) => {
    const response = await api.post('/api/change-password', { userId, newPassword });
    return response.data;
  },
};

// Config API
export const configAPI = {
  getConfig: async () => {
    const response = await api.get('/api/config');
    return response.data;
  },
  updateConfig: async (config: any) => {
    const response = await api.put('/api/config', config);
    return response.data;
  },
  getHardware: async () => {
    try {
      const response = await api.get('/api/hardware');
      return response.data;
    } catch (error) {
      console.error('Error fetching hardware:', error);
      // Return cached data if available
      const cachedData = localStorage.getItem('hardware_cache');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      throw error;
    }
  },
  updateHardware: async (hardware: any[]) => {
    try {
      const response = await api.put('/api/hardware', hardware);
      // Update cache
      localStorage.setItem('hardware_cache', JSON.stringify(hardware));
      return response.data;
    } catch (error) {
      console.error('Error updating hardware:', error);
      // Store pending changes for later sync
      const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
      pendingChanges.push({ type: 'hardware', data: hardware });
      localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
      throw error;
    }
  },
  getConnectivity: async () => {
    try {
      const response = await api.get('/api/connectivity');
      return response.data;
    } catch (error) {
      console.error('Error fetching connectivity:', error);
      // Return cached data if available
      const cachedData = localStorage.getItem('connectivity_cache');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      throw error;
    }
  },
  updateConnectivity: async (connectivity: any[]) => {
    try {
      const response = await api.put('/api/connectivity', connectivity);
      // Update cache
      localStorage.setItem('connectivity_cache', JSON.stringify(connectivity));
      return response.data;
    } catch (error) {
      console.error('Error updating connectivity:', error);
      // Store pending changes for later sync
      const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
      pendingChanges.push({ type: 'connectivity', data: connectivity });
      localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
      throw error;
    }
  },
  getLicensing: async () => {
    try {
      const response = await api.get('/api/licensing');
      return response.data;
    } catch (error) {
      console.error('Error fetching licensing:', error);
      throw error;
    }
  },
  updateLicensing: async (licensing: any[]) => {
    try {
      const response = await api.put('/api/licensing', licensing);
      return response.data;
    } catch (error) {
      console.error('Error updating licensing:', error);
      throw error;
    }
  },
  getScales: async () => {
    try {
      const response = await api.get('/api/scales');
      return response.data;
    } catch (error) {
      console.error('Error fetching scales:', error);
      throw error;
    }
  },
  updateScales: async (scales: any) => {
    try {
      const response = await api.put('/api/scales', scales);
      return response.data;
    } catch (error) {
      console.error('Error updating scales:', error);
      throw error;
    }
  },
  getFactors: async () => {
    try {
      const response = await api.get('/api/factors');
      return response.data;
    } catch (error) {
      console.error('Error fetching factors:', error);
      throw error;
    }
  },
  updateFactors: async (factors: any) => {
    console.log('API: sending factors update to server:', JSON.stringify(factors));
    try {
      const response = await api.put('/api/factors', factors);
      console.log('API: server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating factors:', error);
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
