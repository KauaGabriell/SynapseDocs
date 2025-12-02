// frontend/src/services/api.ts
import axios from "axios";

const raw = import.meta.env.VITE_API_URL;
const baseURL = raw ? String(raw).replace(/\/+$/, '') : "http://localhost:3030";

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Request interceptor (token + metadata)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startTime: typeof performance !== 'undefined' ? performance.now() : Date.now() };
  return config;
});

// Response interceptor (logging + errors)
api.interceptors.response.use(
  (response) => {
    const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - (response.config.metadata?.startTime || 0);
    const endpoint = `${response.config.method?.toUpperCase()} ${response.config.url}`;
    const emoji = duration < 300 ? '⚡' : duration < 1000 ? '🐌' : '🐢';
    console.log(`${emoji} ${endpoint} - ${duration.toFixed(0)}ms`);
    if (duration > 2000) console.warn(`⚠️ SLOW REQUEST: ${endpoint} took ${duration.toFixed(0)}ms`);
    return response;
  },
  (error) => {
    if (error.config?.metadata) {
      const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - error.config.metadata.startTime;
      const endpoint = `${error.config.method?.toUpperCase()} ${error.config.url}`;
      console.error(`❌ ${endpoint} - ${duration.toFixed(0)}ms - ${error.message}`);
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    if (!error.response) {
      console.error('🌐 Erro de rede - verifique sua conexão');
    }
    return Promise.reject(error);
  }
);

export default api;
