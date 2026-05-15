import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const msg =
      (typeof data?.message === 'string' && data.message) ||
      err.message ||
      (err.code === 'ERR_NETWORK' ? 'Cannot reach API. Start the backend (npm run dev in backend/) and keep the same origin or set VITE_API_URL.' : 'Request failed');
    const status = err.response?.status;
    const url = String(err.config?.url || '');
    const isLoginAttempt = url.includes('/api/auth/login');

    // Failed login must NOT wipe an existing valid token (401 on /auth/login only).
    if (status === 401 && !isLoginAttempt) {
      localStorage.removeItem('hrms_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

export default api;
