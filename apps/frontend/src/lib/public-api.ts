import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
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
