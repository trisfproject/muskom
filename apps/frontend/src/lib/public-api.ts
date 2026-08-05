import axios from 'axios';

const isServer = typeof window === 'undefined';
const baseURL = isServer 
  ? process.env.INTERNAL_API_URL || 'http://api:8080/api/v1' 
  : process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const publicApi = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We do NOT attach JWT tokens or redirect on 401. 
// This instance is specifically for public pages where 401s are handled gracefully
// by the UI (e.g. Empty States) without forcing a redirect to /admin/login.
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default publicApi;
