import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Créer une instance Axios
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Conversion jour français <-> index
export const dayToFrench = (index) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  return days[index];
};

export const frenchToDay = (dayName) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  return days.indexOf(dayName);
};

// ========== AUTHENTIFICATION ==========
export const authAPI = {
  signUp: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  signIn: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// ========== UTILISATEUR ==========
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

// ========== PLANNINGS ==========
export const planningAPI = {
  getAll: async () => {
    const response = await api.get('/plannings');
    return response.data.plannings || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/plannings/${id}`);
    return response.data.planning || response.data;
  },

  create: async (data) => {
    const response = await api.post('/plannings', data);
    return response.data.planning || response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/plannings/${id}`, data);
    return response.data.planning || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/plannings/${id}`);
    return response.data;
  },
};

// ========== ÉVÉNEMENTS ==========
export const eventAPI = {
  getByPlanning: async (planningId) => {
    const response = await api.get(`/plannings/${planningId}/events`);
    return response.data.events || response.data;
  },

  create: async (planningId, data) => {
    const response = await api.post(`/plannings/${planningId}/events`, data);
    return response.data.event || response.data;
  },

  update: async (eventId, data) => {
    const response = await api.put(`/events/${eventId}`, data);
    return response.data.event || response.data;
  },

  delete: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },
};

export default api;