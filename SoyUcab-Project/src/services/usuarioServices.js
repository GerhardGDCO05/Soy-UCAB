import api from './ApiServices';

export default {
  // ==================== AUTHENTICATION ====================
  
  async registerUser(userData) {
    try {
      let endpoint;
      let formattedData = { ...userData };
      
      if (userData.tipo_entidad && (userData.tipo_entidad === 'dependencia' || userData.tipo_entidad === 'organizacion')) {
        endpoint = '/auth/register';
      } else {
        endpoint = '/members';
        if (!userData.fecha_nacimiento) {
          return { success: false, error: 'La fecha de nacimiento es requerida' };
        }
        formattedData = {
          ...userData,
          fecha_nacimiento: this.formatDateDB(userData.fecha_nacimiento)
        };
      }
      
      const response = await api.post(endpoint, formattedData);
      
      if (response.data.data) {
        const userToStore = response.data.data.miembro || response.data.data.persona || response.data.data;
        delete userToStore.contraseña;
        localStorage.setItem('user', JSON.stringify(userToStore));
      }
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Registro exitoso'
      };
    } catch (error) {
      return { success: false, error: error.message || 'Error en el registro' };
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.success) {
        const userData = response.data.data || response.data.user;
        if (userData.contraseña) delete userData.contraseña;
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData, message: 'Login exitoso' };
      }
      return { success: false, error: 'Respuesta inválida del servidor' };
    } catch (error) {
      return { success: false, error: error.message || 'Error en el login' };
    }
  },

  // ==================== AUTH UTILS ====================

  async verifyAuth() {
    const user = this.getStoredUser();
    if (!user || !user.email) return { isAuthenticated: false };
    const result = await this.getCurrentUser();
    return { isAuthenticated: result.success, user: result.data };
  },

  async getCurrentUser() {
    try {
      const user = this.getStoredUser();
      if (!user?.email) return { success: false, error: 'No hay usuario en sesión' };
      // Ruta actualizada para el nuevo backend
      const response = await api.get(`/auth/me/${encodeURIComponent(user.email)}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ==================== MEMBERS ====================

  async getMemberByEmail(email) {
    return api.get(`/members/${encodeURIComponent(email)}`);
  },

  async updateMember(email, updates) {
    return api.put(`/members/${encodeURIComponent(email)}`, updates);
  },

  // ==================== REPORTS ====================
  
  async getTopCompanies(limit = 10) {
    return api.get(`/reports/top-companies?limit=${limit}`);
  },

  async getGraduatesLocation() {
    try {
      const response = await api.get('/reports/graduates-location');
      
      // Verificamos si la respuesta es exitosa y tiene datos
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Transformamos los datos antes de enviarlos al componente Vue
        const transformedData = response.data.data.map(egresado => ({
          ...egresado,
          // Si el país viene como 'VE', getCountryName lo convertirá a 'Venezuela'
          pais: this.getCountryName(egresado.pais)
        }));

        return {
          success: true,
          data: transformedData
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error transformando países:', error);
      return { success: false, error: error.message };
    }
  },
  // Para el reporte de Menciones de Profesores
  async getMentionsReport() {
    try {
      const response = await api.get('/reports/mentions');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Para el reporte de Tutores Activos
  async getTutorsReport() {
    try {
      const response = await api.get('/reports/tutors');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },



  // ==================== GROUPS ====================

  async getMyGroups() {
    try {
      const user = this.getStoredUser();
      if (!user || !user.email) return { success: false, data: [] };
      
      const response = await api.get(`/groups/user/${encodeURIComponent(user.email)}`);
      

      return {
        success: response.data.success,
        data: response.data.data || []
      };
    } catch (error) {
      console.error("Error obteniendo grupos:", error);
      return { success: false, data: [] };
    }
  },

  async createGroup(groupData) {
    try {
      const user = this.getStoredUser();
      // Ajustamos el payload para que coincida con lo que espera el backend y la DB
      const payload = {
        nombre: groupData.nombre,
        descripcion: groupData.descripcion,
        categoria: groupData.categoria,
        requisitos_ingreso: groupData.requisitos_ingreso || '',
        email: user.email, // El creador según la tabla soyucab.grupo
        estado: 'activo',  // Valor por defecto del enum soyucab.estado_grupo
        privacidad: groupData.privacidad // 'publico' o 'privado'
      };
      
      const response = await api.post('/groups', payload);
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error("Error creando grupo:", error);
      return { success: false, error: error.message };
    }
  },
  // Obtener detalles básicos del grupo
  async getGroupDetails(name) {
    try {
      const user = this.getStoredUser();
      const emailParam = user ? `?userEmail=${encodeURIComponent(user.email)}` : '';
      const response = await api.get(`/groups/${encodeURIComponent(name)}${emailParam}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  async getGroupMembers(name) {
    try {
      const user = this.getStoredUser();
      const emailParam = user ? `?userEmail=${encodeURIComponent(user.email)}` : '';
      const response = await api.get(`/groups/${encodeURIComponent(name)}/members${emailParam}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },


  async getGroupPosts(name) {
    try {
      const response = await api.get(`/groups/${encodeURIComponent(name)}/posts`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Para crear publicaciones
  async createGroupPost(name, postData) {
    try {
      const user = this.getStoredUser();
      const payload = { ...postData, userEmail: user.email };
      const response = await api.post(`/groups/${encodeURIComponent(name)}/posts`, payload);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Para editar el grupo
  async updateGroup(name, groupData) {
    try {
      const user = this.getStoredUser();
      const payload = { ...groupData, userEmail: user.email };
      const response = await api.put(`/groups/${encodeURIComponent(name)}`, payload);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Para dar Like
  async likePost(groupName, postIdentifier) {
    try {
      const user = this.getStoredUser();
      const { email_publicador, fecha_publicacion } = postIdentifier;
      const response = await api.post(
        `/groups/${encodeURIComponent(groupName)}/posts/${encodeURIComponent(email_publicador)}/${encodeURIComponent(fecha_publicacion)}/like`,
        { userEmail: user.email }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Para borrar post
  async deleteGroupPost(groupName, postIdentifier) {
    try {
      const user = this.getStoredUser();
      // Usamos data para enviar el cuerpo en un DELETE con axios
      const response = await api.delete(`/groups/${encodeURIComponent(groupName)}/posts`, {
        data: { ...postIdentifier, requesterEmail: user.email }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ==================== RELATIONS ====================

  async createRelation(usuario_destino, tipo) {
    const user = this.getStoredUser();
    return api.post('/relations', { 
      usuario_origen: user.email, 
      usuario_destino, 
      tipo 
    });
  },

  async getMyRelations() {
    const user = this.getStoredUser();
    if (!user) return { success: false, data: [] };
    return api.get(`/relations/${encodeURIComponent(user.email)}`);
  },

  // ==================== PORTFOLIO ====================

  /**
   * Obtiene el portafolio completo del usuario actual, 
   * incluyendo la lista de títulos, resumen y enlaces.
   */
  async getMyPortfolio() {
    try {
      const user = this.getStoredUser();
      if (!user?.email) return { success: false, error: 'No hay sesión activa' };
      
      const response = await api.get(`/portfolio/${encodeURIComponent(user.email)}`);
      
      // La respuesta del backend ahora incluye data.titulos (un array)
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error("Error obteniendo portafolio:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Crea o actualiza el portafolio.
   * El payload debe contener: { resumen, enlaces, titulos: [], visibilidad }
   */
  async updateMyPortfolio(payload) {
    try {
      const user = this.getStoredUser();
      if (!user?.email) return { success: false, error: 'No hay sesión activa' };

      // Limpiamos los títulos para no enviar strings vacíos
      const cleanTitulos = Array.isArray(payload.titulos) 
        ? payload.titulos.filter(t => t && t.trim() !== '') 
        : [];

      const formattedPayload = { 
        ...payload, 
        email: user.email,
        titulos: cleanTitulos
      };

      // Usamos POST ya que el backend implementa un "Upsert" (INSERT ... ON CONFLICT)
      const response = await api.post('/portfolio', formattedPayload);
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || 'Portafolio actualizado correctamente'
      };
    } catch (error) {
      console.error("Error actualizando portafolio:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al guardar los cambios' 
      };
    }
  },

  /**
   * Elimina el portafolio del usuario.
   * Nota: Esto activará el ON DELETE CASCADE en la BD, borrando también los títulos.
   */
  async deleteMyPortfolio() {
    try {
      const user = this.getStoredUser();
      if (!user?.email) return { success: false, error: 'No hay sesión activa' };

      const response = await api.delete(`/portfolio/${encodeURIComponent(user.email)}`);
      
      return {
        success: response.data.success,
        message: response.data.message || 'Portafolio eliminado'
      };
    } catch (error) {
      console.error("Error eliminando portafolio:", error);
      return { success: false, error: error.message };
    }
  },

  // ==================== UTILITIES ====================
  
  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
    return { success: true };
  },

  isAuthenticated() {
    return !!localStorage.getItem('user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  formatDateDB(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toISOString().split('T')[0];
  },

  getCountryName(code) {
    const countries = {
      'CO': 'Colombia',
      'ES': 'España', 
      'US': 'Estados Unidos',
      'VE': 'Venezuela',
      'MX': 'México',
      'AR': 'Argentina',
      'CL': 'Chile',
      'PE': 'Perú',
      'BR': 'Brasil',
      'EC': 'Ecuador'
    };
    return countries[code] || code;
  }
};