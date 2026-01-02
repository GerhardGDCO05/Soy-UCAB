<template>
  <div class="container">
    <headerBar />

    <div class="panel left-panel sidebar">
      <div class="user-info-section">
        <div class="user-header">
          <div class="avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ userFullName }}</h2>
            <p class="username">@{{ userData.nombre_usuario }}</p>
            <p class="user-email">{{ userEmail }}</p>
            <p class="user-type" v-if="userData.tipo_usuario">
              <span class="badge" :class="userData.tipo_usuario">
                {{ formatUserType(userData.tipo_usuario) }}
              </span>
            </p>
          </div>
        </div>

        <div class="user-stats" v-if="userStats.total_seguidores !== undefined">
          <div class="stat-item">
            <span class="stat-number">{{ userStats.total_seguidores || 0 }}</span>
            <span class="stat-label">Seguidores</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userStats.siguiendo || 0 }}</span>
            <span class="stat-label">Siguiendo</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userStats.total_publicaciones || 0 }}</span>
            <span class="stat-label">Publicaciones</span>
          </div>
        </div>

        <div class="user-additional-info" v-if="additionalInfo">
          <div class="info-item" v-if="userData.tipo_usuario === 'estudiante' && additionalInfo.estudiante">
            <strong>Carrera:</strong> {{ additionalInfo.estudiante.carrera_programa }}
          </div>
          <div class="info-item" v-if="userData.tipo_usuario === 'estudiante' && additionalInfo.estudiante">
            <strong>Semestre:</strong> {{ additionalInfo.estudiante.semestre }}
          </div>
          <div class="info-item" v-if="userData.tipo_usuario === 'egresado' && additionalInfo.egresado">
            <strong>Egresado:</strong> {{ additionalInfo.egresado.facultad }}
          </div>
          <div class="info-item" v-if="userData.tipo_usuario === 'profesor' && additionalInfo.profesor">
            <strong>Profesor:</strong> {{ additionalInfo.profesor.categoria }}
          </div>
          <div class="info-item" v-if="userData.tipo_usuario === 'dependencia' && additionalInfo.dependencia">
            <strong>Dependencia:</strong> {{ additionalInfo.dependencia.nombre_institucional }}
            <div style="margin-top:6px;">
              <button @click="followDependency(additionalInfo.dependencia.email_institucional)">Seguir dependencia</button>
            </div>
          </div>
          <div class="info-item" v-if="userData.tipo_usuario === 'organizacion' && additionalInfo.organizacion">
            <strong>Organización:</strong> {{ additionalInfo.organizacion.nombre }}
          </div>
        </div>

        <div class="portfolio-card" v-if="isLoggedIn">
          <div class="portfolio-header-row" style="display: flex; justify-content: space-between; align-items: center;">
            <h4>Portafolio Profesional</h4>
            <button v-if="portfolio" class="delete-icon-btn" @click="deletePortfolio" title="Eliminar Portafolio">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div v-if="portfolio && !portfolioEditing">
            <div class="portfolio-resumen" style="margin-bottom: 10px;">
              <strong>Sobre mí:</strong>
              <p>{{ portfolio.resumen }}</p>
            </div>
            
            <div class="portfolio-titulos" v-if="portfolio.titulos && portfolio.titulos.length">
              <strong>Títulos:</strong>
              <ul style="padding-left: 20px; margin-top: 5px;">
                <li v-for="(t, i) in portfolio.titulos" :key="i">{{ t }}</li>
              </ul>
            </div>

            <div class="portfolio-links" v-if="portfolio.enlaces" style="margin-top: 10px;">
              <small><strong>Enlaces:</strong> {{ portfolio.enlaces }}</small>
            </div>

            <div style="margin-top: 1rem;">
              <button class="account-action-btn" @click="openPortfolioEditor">
                <i class="fas fa-edit"></i> Editar Portafolio
              </button>
            </div>
          </div>

          <div v-else-if="!portfolio && !portfolioEditing">
            <p class="empty-message">Tu portafolio aún no está completo.</p>
            <button class="btn-save" @click="openPortfolioEditor">
              Completar mi portafolio
            </button>
          </div>

          <div v-if="portfolioEditing" class="create-group-form">
            <h5>{{ portfolio ? 'Editar Portafolio' : 'Crear Portafolio' }}</h5>
            
            <label class="input-label">Resumen Profesional</label>
            <textarea v-model="portfolioForm.resumen" placeholder="Describe tu experiencia y habilidades"></textarea>
            
            <label class="input-label">Títulos Obtenidos</label>
            <div v-for="(titulo, index) in portfolioForm.titulos" :key="index" class="dynamic-input-row" style="display:flex; gap:5px; margin-bottom:5px;">
              <input v-model="portfolioForm.titulos[index]" placeholder="Ej: Ingeniero de Sistemas" />
              <button @click="removeTitulo(index)" v-if="portfolioForm.titulos.length > 1" class="remove-btn">×</button>
            </div>
            <button class="add-minor-btn" @click="addTitulo">+ Añadir Título</button>

            <label class="input-label">Enlaces (LinkedIn, GitHub...)</label>
            <input v-model="portfolioForm.enlaces" placeholder="Separa los links con comas" />
            
            <div class="create-group-actions" style="display:flex; gap: 0.5rem; margin-top: 1rem;">
              <button class="btn-save" @click="savePortfolio" :disabled="savingPortfolio">
                {{ savingPortfolio ? 'Guardando...' : 'Guardar' }}
              </button>
              <button class="post-action" @click="portfolioEditing = false">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="activity-section">
        <h3>Actividad Reciente</h3>
        <div class="activity-box">
          <div v-if="recentActivity.length === 0" class="empty-message">
            No hay actividad reciente
          </div>
          <div v-else class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-content">
                <p>{{ activity.description }}</p>
                <small>{{ formatTime(activity.timestamp) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel middle-panel">
      <div class="posts-section">
        <h2>Publicaciones</h2>

        <div class="create-post" v-if="isLoggedIn">
          <div class="create-post-header">
            <div class="post-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <textarea v-model="newPostContent" placeholder="¿Qué estás pensando?" rows="3" class="post-input"></textarea>
          </div>
          <div class="create-post-actions">
            <button class="post-submit-btn" @click="createPost" :disabled="!newPostContent.trim() || posting">
              <i class="fas fa-paper-plane"></i>
              {{ posting ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <div v-if="loadingPosts" class="loading-posts">
          <i class="fas fa-spinner fa-spin"></i> Cargando publicaciones...
        </div>

        <div v-else-if="userPosts.length === 0" class="no-posts">
          <p>No hay publicaciones aún</p>
          <button class="btn-create-post" @click="focusPostInput">
            <i class="fas fa-plus"></i> Crear primera publicación
          </button>
        </div>

        <div v-else class="posts-list">
          <div v-for="post in userPosts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="post-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="post-author">
                <div class="author-name">{{ userFullName }}</div>
                <div class="post-time">{{ formatPostTime(post.created_at) }}</div>
              </div>
              <div class="post-actions-menu" v-if="post.is_owner">
                <button class="action-btn" @click="editPost(post)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" @click="deletePost(post.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="post-content">
              <p>{{ post.content }}</p>
              <div v-if="post.media_url" class="post-media">
                <img :src="post.media_url" alt="Media" class="post-image">
              </div>
            </div>
            <div class="post-stats">
              <span class="stat"><i class="fas fa-heart"></i> {{ post.likes_count || 0 }}</span>
              <span class="stat"><i class="fas fa-comment"></i> {{ post.comments_count || 0 }}</span>
            </div>
            <div class="post-actions">
              <button class="post-action" :class="{ 'active': post.liked_by_user }" @click="toggleLike(post)">
                <i class="fas fa-heart"></i> Me gusta
              </button>
              <button class="post-action" @click="showComments(post)">
                <i class="fas fa-comment"></i> Comentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel right-panel sidebar">
      <div class="suggestions-section">
        <h3>Sugerencias para ti</h3>
        <div class="suggestions-box">
          <div v-if="loadingSuggestions" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Cargando...
          </div>
          <div v-else-if="suggestions.length === 0" class="empty-message">
            No hay sugerencias disponibles
          </div>
          <div v-else class="suggestions-list">
            <div v-for="user in suggestions" :key="user.email" class="suggestion-item">
              <div class="suggestion-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div class="suggestion-details">
                <div class="suggestion-name">{{ user.nombres }} {{ user.apellidos }}</div>
                <div class="suggestion-username">@{{ user.nombre_usuario }}</div>
              </div>
              <button class="follow-btn" @click="followUser(user.email)" :disabled="user.is_following">
                {{ user.is_following ? 'Siguiendo' : 'Seguir' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="trends-section">
        <h3>Tendencias</h3>
        <div class="trends-box">
          <div v-if="loadingTrends" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Cargando...
          </div>
          <div v-else-if="trends.length === 0" class="empty-message">
            No hay tendencias para mostrar
          </div>
          <div v-else class="trends-list">
            <div v-for="trend in trends" :key="trend.hashtag" class="trend-item">
              <div class="trend-tag">#{{ trend.hashtag }}</div>
              <div class="trend-count">{{ trend.count }} publicaciones</div>
            </div>
          </div>
        </div>
      </div>

      <div class="groups-section" v-if="isLoggedIn">
        <h3>Grupos</h3>
        <div class="create-group" style="margin-top:8px;">
          <button class="account-action-btn" @click="showCreateGroupForm = !showCreateGroupForm">
            <i class="fas fa-users"></i>
            {{ showCreateGroupForm ? 'Cancelar' : 'Crear grupo' }}
          </button>

          <div v-if="showCreateGroupForm" class="create-group-form">
            <input v-model="newGroup.nombre" placeholder="Nombre del grupo" />
            <textarea v-model="newGroup.descripcion" placeholder="Descripción breve"></textarea>
            <textarea v-model="newGroup.requisitos_ingreso" placeholder="Requisitos de ingreso"></textarea>

            <div class="form-row">
              <select v-model="newGroup.categoria">
                <option value="academico">Académico</option>
                <option value="cultural">Cultural</option>
                <option value="deportivo">Deportivo</option>
                <option value="profesional">Profesional</option>
                <option value="social">Social</option>
              </select>
              <select v-model="newGroup.privacidad">
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
              </select>
            </div>

            <div class="create-group-actions">
              <button class="btn-save" @click="createGroup" :disabled="creatingGroup">
                {{ creatingGroup ? 'Creando...' : 'Confirmar Creación' }}
              </button>
            </div>
          </div>
        </div>

        <div class="my-groups" style="margin-top: 12px;">
          <h4>Mis grupos</h4>
          <div v-if="myGroupsLoading">Cargando grupos...</div>
          <div v-else-if="myGroups.length === 0">No perteneces a ningún grupo</div>
          <ul v-else class="group-list">
            <li v-for="g in myGroups" :key="g.nombre" class="group-item clickable-group" @click="goToGroup(g.nombre)">
              <div class="group-info">
                <strong>{{ g.nombre }} </strong>
                <span class="badge-category">{{ g.categoria }}</span>
              </div>
              <div class="group-details">
                <small>
                  <i class="fas fa-info-circle"></i> {{ g.estado }} |
                  <i class="fas fa-lock" v-if="g.privacidad === 'privado'"></i>
                  <i class="fas fa-globe" v-else></i> {{ g.privacidad || 'Público' }}
                </small>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from './header.vue'
import api from '@/services/usuarioServices';

export default {
  name: 'Home',
  components: {
    headerBar
  },
  data() {
    return {
      userData: {},
      userEmail: '',
      userStats: {
        total_seguidores: 0,
        siguiendo: 0,
        total_publicaciones: 0
      },
      additionalInfo: null,
      userPosts: [],
      newPostContent: '',
      posting: false,
      loadingPosts: false,
      suggestions: [],
      trends: [],
      loadingSuggestions: false,
      loadingTrends: false,
      recentActivity: [],
      showCreateGroupForm: false,
      newGroup: {
        nombre: '',
        descripcion: '',
        categoria: 'academico',
        privacidad: 'publico',
        requisitos_ingreso: ''
      },
      creatingGroup: false,
      myGroups: [],
      myGroupsLoading: false,
      portfolio: null,
      portfolioEditing: false,
      portfolioForm: { 
        resumen: '', 
        enlaces: '', 
        titulos: [''], 
        visibilidad: 'Publico'
      },
      savingPortfolio: false,
      loading: true,
      error: null
    }
  },
  computed: {
    isLoggedIn() {
      const user = localStorage.getItem('user')
      return user !== null && user !== 'undefined'
    },
    userFullName() {
      if (!this.userData.nombres && !this.userData.apellidos) return 'Usuario'
      return `${this.userData.nombres || ''} ${this.userData.apellidos || ''}`.trim()
    }
  },
  async mounted() {
    await this.loadUserData()
    await Promise.all([
      this.loadUserPosts(),
      this.loadSuggestions(),
      this.loadTrends(),
      this.loadRecentActivity(),
      this.loadMyGroups(),
      this.loadMyPortfolio()
    ])
  },
  methods: {
    async loadUserData() {
      try {
        this.loading = true;
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.email) {
          this.$router.push('/login');
          return;
        }

        this.userEmail = storedUser.email;
        const response = await api.getMemberByEmail(this.userEmail);
        
        if (response.data && response.data.success) {
          this.userData = response.data.data; 
          this.userStats = {
            total_seguidores: this.userData.estadisticas?.seguidores || 0,
            siguiendo: this.userData.estadisticas?.siguiendo || 0,
            total_publicaciones: this.userData.estadisticas?.publicaciones || 0
          };
          this.loadAdditionalInfo();
        } else {
          this.userData = storedUser;
        }
      } catch (error) {
        console.error('Error en loadUserData:', error);
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) this.userData = storedUser;
      } finally {
        this.loading = false;
      }
    },
    loadAdditionalInfo() {
      const u = this.userData;
      if (u.tipo_usuario === 'estudiante') this.additionalInfo = { estudiante: u.estudiante }
      else if (u.tipo_usuario === 'egresado') this.additionalInfo = { egresado: u.egresado }
      else if (u.tipo_usuario === 'profesor') this.additionalInfo = { profesor: u.profesor }
      else if (u.entidad_info) this.additionalInfo = { [u.tipo_usuario]: u.entidad_info }
    },

    async loadMyPortfolio() {
      try {
        const r = await api.getMyPortfolio();
        // Cambio: Verificación más robusta de si el portafolio tiene contenido real
        if (r && r.success && r.data && (r.data.resumen || r.data.titulos?.length > 0)) {
          this.portfolio = r.data;
          this.syncPortfolioForm();
        } else {
          this.portfolio = null;
          this.resetPortfolioForm();
        }
      } catch (error) {
        console.error("Error cargando portafolio:", error);
        this.portfolio = null;
      }
    },

    syncPortfolioForm() {
      if (this.portfolio) {
        this.portfolioForm = {
          resumen: this.portfolio.resumen || '',
          enlaces: this.portfolio.enlaces || '',
          titulos: this.portfolio.titulos && this.portfolio.titulos.length 
                   ? [...this.portfolio.titulos] 
                   : [''],
          visibilidad: this.portfolio.visibilidad || 'Publico'
        };
      }
    },

    resetPortfolioForm() {
      this.portfolioForm = { 
        resumen: '', 
        enlaces: '', 
        titulos: [''], 
        visibilidad: 'Publico' 
      };
    },

    openPortfolioEditor() {
      this.syncPortfolioForm();
      this.portfolioEditing = true;
    },

    addTitulo() {
      this.portfolioForm.titulos.push('');
    },

    removeTitulo(index) {
      this.portfolioForm.titulos.splice(index, 1);
    },

    async savePortfolio() {
      try {
        this.savingPortfolio = true;
        const payload = {
          ...this.portfolioForm,
          titulos: this.portfolioForm.titulos.filter(t => t.trim() !== '')
        };

        const r = await api.updateMyPortfolio(payload);
        if (r.success) {
          alert("Portafolio guardado correctamente");
          this.portfolioEditing = false;
          await this.loadMyPortfolio();
        } else {
          alert("Error: " + r.error);
        }
      } catch (error) {
        alert("Error de conexión");
      } finally {
        this.savingPortfolio = false;
      }
    },

    async deletePortfolio() {
      if (!confirm("¿Seguro que deseas eliminar tu portafolio por completo?")) return;
      try {
        const r = await api.deleteMyPortfolio(); 
        if (r.success) {
          this.portfolio = null;
          this.resetPortfolioForm();
          alert("Portafolio eliminado correctamente");
        } else {
          alert("Error al eliminar: " + r.error);
        }
      } catch (error) {
        alert("Error al eliminar");
      }
    },

    async loadUserPosts() {
      this.loadingPosts = true
      this.userPosts = []
      this.loadingPosts = false
    },
    async createPost() {
      if (!this.newPostContent.trim()) return
      this.posting = true
      this.posting = false
    },
    async loadMyGroups() {
      this.myGroupsLoading = true
      const resp = await api.getMyGroups()
      if (resp.success) this.myGroups = resp.data || []
      this.myGroupsLoading = false
    },
    async createGroup() {
      if (!this.newGroup.nombre.trim()) {
        alert("El nombre del grupo es obligatorio");
        return;
      }
      this.creatingGroup = true;
      try {
        const resp = await api.createGroup(this.newGroup);
        if (resp.success) {
          this.showCreateGroupForm = false;
          this.newGroup = { nombre: '', descripcion: '', categoria: 'academico', privacidad: 'publico' };
          await this.loadMyGroups();
          alert("¡Grupo creado con éxito!");
        } else {
          alert("Error al crear grupo: " + (resp.error || "Desconocido"));
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.creatingGroup = false;
      }
    },
    goToGroup(groupName) {
      if (!groupName) return;
      this.$router.push({ 
        name: 'GroupDashboard', 
        params: { name: groupName } 
      });
    },
    focusPostInput() {
      document.querySelector('.post-input')?.focus()
    },
    formatUserType(type) {
      const types = { estudiante: 'Estudiante', egresado: 'Egresado', profesor: 'Profesor', dependencia: 'Dependencia', organizacion: 'Organización' }
      return types[type] || type
    },
    formatTime(date) {
      return date ? new Date(date).toLocaleTimeString() : ''
    },
    formatPostTime(date) {
      return 'Recientemente'
    },
    getActivityIcon(type) {
      const icons = { like: 'fas fa-heart', comment: 'fas fa-comment', follow: 'fas fa-user-plus' }
      return icons[type] || 'fas fa-bell'
    },
    async followDependency(email) {
      const r = await api.createRelation(email, 'seguimiento')
      if (r.success) alert('Siguiendo dependencia')
    },
    async loadSuggestions() { this.suggestions = [] },
    async loadTrends() { this.trends = [] },
    async loadRecentActivity() { this.recentActivity = [] }
  }
}
</script>