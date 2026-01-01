const API_BASE_URL = (function() {
 
  try {
    const globalOverride = (typeof window !== 'undefined' && window.__API_BASE_URL) || null;
    const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || null;

    if (globalOverride) return globalOverride;
    if (viteEnv) return viteEnv;

    // Si estamos en el navegador y es localhost, apuntar al backend local (puerto 3000)
    if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // Si el dev server corre en un puerto diferente (p. ej. 5173), forzamos el backend en 3000
      try {
        const port = (window.location.port || '').toString();
        if (port && port !== '3000') {
          return 'http://localhost:3000/api';
        }
      } catch (e) {
        // ignore
      }
      return 'http://localhost:3000/api';
    }

    // Producción o no-determined: usar ruta relativa
    return '/api';
  } catch (e) {
    if (typeof window !== 'undefined' && window.__API_BASE_URL) return window.__API_BASE_URL;
    return 'http://localhost:3000/api';
  }
})();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Informar en consola la URL usada para las peticiones API (útil en dev)
    if (typeof console !== 'undefined' && typeof this.baseURL === 'string') {
      console.info('[ApiService] API_BASE_URL =', this.baseURL);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configurar headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors'
      });
      
      // Manejar respuesta no OK
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o acceso denegado
          console.error('API 401 on', url);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          data: errorData,
          message: errorData.error || `HTTP ${response.status}`
        };
      }
      
      // Parsear respuesta JSON
      const data = await response.json();
      return { data, status: response.status };
      
    } catch (error) {
      console.error('API Error:', error);

      // Errores de red / conexión
      try {
        if (error && (error.name === 'TypeError' || (error.message && error.message.includes('Failed to fetch')))) {
          throw { message: `No se pudo conectar al servidor en ${API_BASE_URL}. Verifica que el backend esté corriendo y que la URL sea correcta.` };
        }
      } catch (e) {
        // ignore
      }

      throw error;
    }
  }

  // Métodos HTTP
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

// Exportar instancia única
export default new ApiService();