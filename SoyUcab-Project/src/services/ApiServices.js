const API_BASE_URL = (function() {
  try {
    const globalOverride = (typeof window !== 'undefined' && window.__API_BASE_URL) || null;
    const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || null;

    if (globalOverride) return globalOverride;
    if (viteEnv) return viteEnv;

    if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:3000/api';
    }

    return '/api';
  } catch (e) {
    return 'http://localhost:3000/api';
  }
})();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof console !== 'undefined' && typeof this.baseURL === 'string') {
      console.info('[ApiService] Modo: Sin Tokens (Identificación por Email)');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    // LOGS DE DEPURACIÓN
    console.log(`[API Request] ${options.method || 'GET'} -> ${url}`);
    if (options.body) console.log('Body:', JSON.parse(options.body));

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors'
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('[API Error Response]:', errorData);
        } catch (e) {
          console.error('[API Error Status]:', response.status);
        }

        throw {
          status: response.status,
          message: errorMessage
        };
      }

      const data = await response.json();
      return { data, status: response.status };

    } catch (error) {
      if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
        throw {
          message: `Error de conexión: No se pudo contactar al servidor en ${this.baseURL}`,
          isNetworkError: true
        };
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiService();