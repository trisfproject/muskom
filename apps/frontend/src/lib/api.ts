import axios from 'axios';
import Cookies from 'js-cookie';

const isServer = typeof window === 'undefined';
const baseURL = isServer 
  ? process.env.INTERNAL_API_URL || 'http://api:8080/api/v1' 
  : process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const eventId = typeof window !== 'undefined' ? localStorage.getItem('muskom_active_event_id') : null;
  if (eventId) {
    config.headers['X-Event-ID'] = eventId;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user_data');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
