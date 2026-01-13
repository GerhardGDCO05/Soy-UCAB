<template>
  <div class="advanced-search-container">
    <headerBar />
    
    <div class="search-layout">
      <div class="search-panel panel">
        <h2><i class="fas fa-search"></i> Búsqueda Avanzada</h2>
        
        <div class="filters-grid">
          <!-- Búsqueda por texto -->
          <div class="filter-group">
            <label>Nombre o Usuario</label>
            <input 
              v-model="filters.searchText" 
              type="text" 
              placeholder="Buscar por nombre o @usuario"
              @input="debouncedSearch"
            />
          </div>

          <!-- Tipo de Usuario -->
          <div class="filter-group">
            <label>Tipo de Usuario</label>
            <select v-model="filters.tipoUsuario" @change="performSearch">
              <option value="">Todos</option>
              <option value="Estudiante">Estudiante</option>
              <option value="Egresado">Egresado</option>
              <option value="Profesor">Profesor</option>
              <option value="Personal Administrativo">Personal Administrativo</option>
              <option value="Personal Obrero">Personal Obrero</option>
            </select>
          </div>

          <!-- Género -->
          <div class="filter-group">
            <label>Género</label>
            <select v-model="filters.genero" @change="performSearch">
              <option value="">Todos</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>

          <!-- Facultad (para estudiantes y egresados) -->
          <div class="filter-group" v-if="filters.tipoUsuario === 'Estudiante' || filters.tipoUsuario === 'Egresado' || filters.tipoUsuario === ''">
            <label>Facultad</label>
            <select v-model="filters.facultad" @change="performSearch">
              <option value="">Todas</option>
              <option value="Ingeniería">Ingeniería</option>
              <option value="Derecho">Derecho</option>
              <option value="Ciencias Económicas y Sociales">Ciencias Económicas y Sociales</option>
              <option value="Humanidades y Educación">Humanidades y Educación</option>
              <option value="Teología">Teología</option>
            </select>
          </div>

          <!-- Carrera (solo para estudiantes) -->
          <div class="filter-group" v-if="filters.tipoUsuario === 'Estudiante' || filters.tipoUsuario === ''">
            <label>Carrera</label>
            <input 
              v-model="filters.carrera" 
              type="text" 
              placeholder="Ej: Ingeniería Informática"
              @input="debouncedSearch"
            />
          </div>

          <!-- País (solo para egresados) -->
          <div class="filter-group" v-if="filters.tipoUsuario === 'Egresado' || filters.tipoUsuario === ''">
            <label>País</label>
            <input 
              v-model="filters.pais" 
              type="text" 
              placeholder="Código de país (VE, US, etc.)"
              maxlength="2"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <div class="search-actions">
          <button @click="performSearch" class="btn-search">
            <i class="fas fa-search"></i> Buscar
          </button>
          <button @click="clearFilters" class="btn-clear">
            <i class="fas fa-times"></i> Limpiar
          </button>
        </div>
      </div>

      <!-- Resultados -->
      <div class="results-section">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Buscando...
        </div>

        <div v-else-if="results.length === 0 && hasSearched" class="no-results">
          <i class="fas fa-search"></i>
          <p>No se encontraron resultados con estos filtros</p>
        </div>

        <div v-else-if="results.length > 0" class="results-grid">
          <div 
            v-for="user in results" 
            :key="user.email"
            class="user-card panel"
            @click="goToProfile(user.email)"
          >
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <h3>{{ user.nombres }} {{ user.apellidos }}</h3>
              <p class="username">@{{ user.nombre_usuario }}</p>
              <div class="user-meta">
                <span class="badge" :class="getBadgeClass(user.tipo_miembro)">
                  {{ user.tipo_miembro }}
                </span>
                <span v-if="user.tipo_conexion && user.grado_separacion < 999" class="badge badge-connection">
                  <i class="fas fa-link"></i> {{ user.tipo_conexion }}
                </span>
                <span v-if="user.facultad || user.facultad_egresado" class="meta-item">
                  <i class="fas fa-building"></i> {{ user.facultad || user.facultad_egresado }}
                </span>
                <span v-if="user.carrera_programa" class="meta-item">
                  <i class="fas fa-graduation-cap"></i> {{ user.carrera_programa }}
                </span>
                <span v-if="user.pais" class="meta-item">
                  <i class="fas fa-globe"></i> {{ user.pais }}
                </span>
              </div>
            </div>
            <div class="user-actions">
              <button @click.stop="followUser(user.email)" class="btn-follow">
                <i class="fas fa-user-plus"></i> Seguir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'

export default {
  name: 'AdvancedSearch',
  components: { headerBar },
  data() {
    return {
      filters: {
        searchText: '',
        tipoUsuario: '',
        genero: '',
        facultad: '',
        carrera: '',
        pais: ''
      },
      results: [],
      loading: false,
      hasSearched: false,
      searchTimeout: null
    }
  },
  methods: {
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 500);
    },

    async performSearch() {
      this.loading = true;
      this.hasSearched = true;

      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Construir query params
        const params = {
          user_email: user.email || '' // Para calcular grados de separación
        };
        
        if (this.filters.searchText) params.search = this.filters.searchText;
        if (this.filters.tipoUsuario) params.tipo = this.filters.tipoUsuario;
        if (this.filters.genero) params.genero = this.filters.genero;
        if (this.filters.facultad) params.facultad = this.filters.facultad;
        if (this.filters.carrera) params.carrera = this.filters.carrera;
        if (this.filters.pais) params.pais = this.filters.pais;

        const response = await axios.get('http://localhost:3000/api/members/advanced-search', { params });

        if (response.data.success) {
          this.results = response.data.data;
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
        alert('Error al realizar la búsqueda');
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.filters = {
        searchText: '',
        tipoUsuario: '',
        genero: '',
        facultad: '',
        carrera: '',
        pais: ''
      };
      this.results = [];
      this.hasSearched = false;
    },
// AdvancedSearch.vue - Esto ya lo tienes, solo asegúrate que el router de Vue tenga ese name
goToProfile(email) {
  this.$router.push({ name: 'PublicProfile', params: { email } });
},

    async followUser(email) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.email) {
        alert('Debes iniciar sesión');
        return;
      }

      try {
        const response = await axios.post('http://localhost:3000/api/relations', {
          usuario_origen: user.email,
          usuario_destino: email,
          seguimiento: true
        });

        if (response.data.success) {
          alert('Ahora sigues a este usuario');
        }
      } catch (error) {
        console.error('Error al seguir:', error);
        alert('Error al seguir usuario');
      }
    },

    getBadgeClass(tipo) {
      const classes = {
        'Estudiante': 'badge-student',
        'Egresado': 'badge-graduate',
        'Profesor': 'badge-teacher',
        'Personal Administrativo': 'badge-admin',
        'Personal Obrero': 'badge-worker'
      };
      return classes[tipo] || 'badge-default';
    }
  }
}
</script>

<style scoped>
.advanced-search-container {
  background: #f0f2f5;
  min-height: 100vh;
  padding-top: 20px;
}

.search-layout {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.search-panel h2 {
  margin: 0 0 20px 0;
  color: #14171a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #14171a;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #1da1f2;
}

.search-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-search,
.btn-clear {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-search {
  background: #1da1f2;
  color: white;
}

.btn-search:hover {
  background: #1a8cd8;
}

.btn-clear {
  background: #657786;
  color: white;
}

.btn-clear:hover {
  background: #57656f;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #657786;
  font-size: 18px;
}

.no-results i {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
  color: #ccc;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.user-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.user-avatar {
  font-size: 64px;
  color: #1da1f2;
  margin-bottom: 15px;
}

.user-info {
  flex: 1;
  width: 100%;
}

.user-info h3 {
  margin: 0 0 5px 0;
  color: #14171a;
  font-size: 18px;
}

.username {
  color: #657786;
  margin: 0 0 15px 0;
  font-size: 14px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 15px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-student { background: #e3f2fd; color: #1976d2; }
.badge-graduate { background: #f3e5f5; color: #7b1fa2; }
.badge-teacher { background: #e8f5e9; color: #388e3c; }
.badge-admin { background: #fff3e0; color: #f57c00; }
.badge-worker { background: #fce4ec; color: #c2185b; }
.badge-default { background: #f5f5f5; color: #616161; }

.badge-connection {
  background: #e8f5e9;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #657786;
}

.meta-item i {
  color: #1da1f2;
}

.user-actions {
  width: 100%;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn-follow {
  width: 100%;
  padding: 10px;
  background: #1da1f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-follow:hover {
  background: #1a8cd8;
}
</style>