/**Intercepta as requisições e passa os token autenticado para todas elas */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // ⚡ Timeout de 30s
});

// ⚡ Performance monitoring
api.interceptors.request.use((config) => {
  // Adicionar token automaticamente
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ⚡ Marcar início da requisição para medir tempo
  config.metadata = { startTime: performance.now() };
  
  return config;
});

// ⚡ Interceptor de resposta com logging de performance
api.interceptors.response.use(
  (response) => {
    // Calcular duração da requisição
    const duration = performance.now() - response.config.metadata.startTime;
    const endpoint = `${response.config.method?.toUpperCase()} ${response.config.url}`;
    
    // Emoji baseado na velocidade
    const emoji = duration < 300 ? '⚡' : duration < 1000 ? '🐌' : '🐢';
    
    // Log de performance
    console.log(`${emoji} ${endpoint} - ${duration.toFixed(0)}ms`);
    
    // Avisar sobre requisições lentas
    if (duration > 2000) {
      console.warn(`⚠️  SLOW REQUEST: ${endpoint} took ${duration.toFixed(0)}ms`);
    }
    
    return response;
  },

  (error) => {
    // Calcular duração mesmo em erro
    if (error.config?.metadata) {
      const duration = performance.now() - error.config.metadata.startTime;
      const endpoint = `${error.config.method?.toUpperCase()} ${error.config.url}`;
      console.error(`❌ ${endpoint} - ${duration.toFixed(0)}ms - ${error.message}`);
    }

    // Se o token expirar → volta para login
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado, redirecionando para login...');
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    // Tratamento de erros de rede
    if (!error.response) {
      console.error('🌐 Erro de rede - verifique sua conexão');
    }

    return Promise.reject(error);
  }
);

// ⚡ Função helper para ver relatório de performance
if (typeof window !== 'undefined') {
  window.apiStats = {
    requests: [],
    log: function() {
      const total = this.requests.length;
      const avg = this.requests.reduce((sum, r) => sum + r.duration, 0) / total;
      const slowest = Math.max(...this.requests.map(r => r.duration));
      const fastest = Math.min(...this.requests.map(r => r.duration));

      console.log('📊 API Performance Report:');
      console.log(`   Total requests: ${total}`);
      console.log(`   Average: ${avg.toFixed(0)}ms`);
      console.log(`   Fastest: ${fastest.toFixed(0)}ms`);
      console.log(`   Slowest: ${slowest.toFixed(0)}ms`);
    },
    clear: function() {
      this.requests = [];
      console.log('✅ Stats cleared');
    }
  };

  // Adicionar requisições ao log
  api.interceptors.response.use(
    response => {
      const duration = performance.now() - response.config.metadata.startTime;
      window.apiStats.requests.push({
        url: response.config.url,
        method: response.config.method,
        duration,
        status: response.status
      });
      return response;
    },
    error => {
      if (error.config?.metadata) {
        const duration = performance.now() - error.config.metadata.startTime;
        window.apiStats.requests.push({
          url: error.config.url,
          method: error.config.method,
          duration,
          status: error.response?.status || 0,
          error: true
        });
      }
      return Promise.reject(error);
    }
  );
}

export default api;