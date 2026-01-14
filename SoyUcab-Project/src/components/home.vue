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
          <div class="stat-item" @click="openStatList('seguidores')">
            <span class="stat-number">{{ userStats.total_seguidores || 0 }}</span>
            <span class="stat-label">Seguidores</span>
          </div>
          <div class="stat-item" @click="openStatList('siguiendo')">
            <span class="stat-number">{{ userStats.siguiendo || 0 }}</span>
            <span class="stat-label">Siguiendo</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ userStats.total_publicaciones || 0 }}</span>
            <span class="stat-label">Posts</span>
          </div>
          
          <div class="stat-item" @click="openStatList('amistades')">
            <span class="stat-number">{{ detailStats.amistades || 0 }}</span>
            <span class="stat-label">Amistades</span>
          </div>
          <div class="stat-item" @click="openStatList('pendientes')">
            <span class="stat-number">{{ detailStats.solicitudes_pendientes || 0 }}</span>
            <span class="stat-label">Solicitudes</span>
          </div>
          <div class="stat-item" @click="openStatList('enviadas')">
            <span class="stat-number">{{ detailStats.solicitudes_enviadas || 0 }}</span>
            <span class="stat-label">Enviadas</span>
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
        <!-- ZONA FIJA SUPERIOR -->
        <div class="feed-header">
            <!-- USUARIOS SUGERIDOS -->
            <div v-if="suggestions.length > 0" class="suggestions-wrapper">
                <h3 class="section-title-sm">Personas que podrías conocer</h3>
                <div class="suggestions-horizontal">
                    <div v-for="user in suggestions" :key="user.email" class="suggestion-card-h">
                        <div class="suggestion-avatar-h">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="suggestion-name-h">
                            {{ user.nombre_usuario }}
                        </div>
                        <div class="suggestion-actions">
                            <button class="btn-follow-sm" @click="followUser(user.email, true)" title="Seguir">
                                Seguir
                            </button>
                            <button class="btn-friend-sm" @click="followUser(user.email, false)" title="Solicitar Amistad">
                                Amistad
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GRUPOS SUGERIDOS -->
            <div v-if="suggestedGroups.length > 0" class="suggestions-wrapper">
                <h3 class="section-title-sm">Grupos recomendados</h3>
                <div class="suggestions-horizontal">
                    <div v-for="group in suggestedGroups" :key="group.nombre" class="suggestion-card-h">
                        <div class="suggestion-avatar-h">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="suggestion-name-h">
                            {{ group.nombre }}
                        </div>
                        <small class="suggestion-meta-h">
                            {{ group.cantidad_miembros || 0 }} miembros
                        </small>
                        <button v-if="group.is_member" class="btn-ver-group" @click="goToGroup(group.nombre)" title="Ver grupo">
                            Ver grupo
                        </button>
                        <button v-else class="btn-join-group" @click="joinGroup(group.nombre)" title="Unirse al grupo">
                            Unirse
                        </button>
                    </div>
                </div>
            </div>

             <!-- BOTÓN PARA VER FEED -->
            <div class="feed-action-wrapper" style="margin-top: 1rem; text-align: center;">
                <button @click="gotoFeed" class="btn-feed" title="Ver todos los posts">
                    <i class="fas fa-stream"></i>
                    <span>Ver Feed de Posts</span>
                </button>
            </div>
        </div>

        
      </div>
    </div>

    <div class="panel right-panel sidebar">
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
  
  <!-- MODAL DE STATS (Seguidores, Amigos, etc) -->
  <div v-if="showStatModal" class="modal-overlay" @click.self="showStatModal = false">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ currentStatTitle }}</h3>
        <button @click="showStatModal = false" style="background:none; color:black; font-size:1.2rem;">&times;</button>
      </div>
      
      <div v-if="modalLoading" class="loading">Cargando...</div>
      <div v-else class="modal-body">
        <div v-if="currentStatList.length === 0">No hay usuarios en esta lista.</div>
        <ul v-else class="user-list">
             <li v-for="item in currentStatList" :key="item.usuario_origen + item.usuario_destino" class="user-list-item">
                <div class="user-list-info">
                    <div class="user-list-avatar"> <i class="fas fa-user-circle"></i> </div>
                    <div>
                        <strong>{{ item.nombre_usuario || item.email_otro }}</strong><br>
                        <small>{{ item.label }}</small>
                    </div>
                </div>
                <div class="user-list-actions">
                    <button v-if="item.isRequest" class="btn-small post-submit-btn" @click="handleRelationAction(item, 'accept')">Aceptar</button>
                    <button v-if="item.isRequest" class="btn-small post-action" @click="handleRelationAction(item, 'reject')">Rechazar</button>
                    
                    <button v-if="item.canRemove" class="btn-small delete-icon-btn" @click="handleRelationAction(item, 'delete')">Eliminar</button>
                    <button v-if="item.canUnfollow" class="btn-small post-action" @click="handleRelationAction(item, 'delete')">Dejar de seguir</button>
                    <button v-if="item.canUnfriend" class="btn-small delete-icon-btn" @click="handleRelationAction(item, 'delete')">Eliminar amigo</button>
                    <button v-if="item.canCancel" class="btn-small post-action" @click="handleRelationAction(item, 'delete')">Cancelar</button>
                </div>
             </li>
        </ul>
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
      // Nuevos contadores detallados
      detailStats: {
        amistades: 0,
        solicitudes_pendientes: 0,
        solicitudes_enviadas: 0
      },
      
      // Modal state
      showStatModal: false,
      currentStatTitle: '',
      currentStatList: [],
      modalLoading: false,

      additionalInfo: null,
      userPosts: [],
      newPostContent: '',
      posting: false,
      loadingPosts: false,
      suggestions: [],
      suggestedGroups: [],
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
      myGroups: [],
      myGroupsLoading: false,
      myGroupNames: [],
      creatingGroup: false,
      portfolioEditing: false,
      portfolio: null,
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
      this.loadSuggestedGroups(),
      this.loadTrends(),
      this.loadRecentActivity(),
      this.loadMyGroups(),
      this.loadMyPortfolio(),
      this.loadRelationStats()
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
    
    // Calcula las estadisticas reales consultando las relaciones
    async loadRelationStats() {
        try {
            const sentRes = await api.getMyRelations('sent'); 
            const receivedRes = await api.getMyRelations('received');
            
            if (sentRes.success && receivedRes.success) {
                const sent = sentRes.data || [];
                const received = receivedRes.data || [];

                this.userStats.total_seguidores = received.filter(r => r.estado === 'aceptada' && r.seguimiento === true).length;
                this.userStats.siguiendo = sent.filter(r => r.estado === 'aceptada' && r.seguimiento === true).length;

                const friendsSent = sent.filter(r => r.estado === 'aceptada' && r.seguimiento === false).length;
                const friendsReceived = received.filter(r => r.estado === 'aceptada' && r.seguimiento === false).length;
                this.detailStats.amistades = friendsSent + friendsReceived;

                this.detailStats.solicitudes_pendientes = received.filter(r => r.estado === 'pendiente').length;
                this.detailStats.solicitudes_enviadas = sent.filter(r => r.estado === 'pendiente').length;
            }
        } catch (e) {
            console.error("Error calculando stats:", e);
        }
    },

    async openStatList(type) {
        this.showStatModal = true;
        this.modalLoading = true;
        this.currentStatList = [];
        
        try {
            const sentRes = await api.getMyRelations('sent');
            const receivedRes = await api.getMyRelations('received');
            const sent = sentRes.data || [];
            const received = receivedRes.data || [];

            switch(type) {
                case 'seguidores':
                    this.currentStatTitle = 'Seguidores';
                    this.currentStatList = received.filter(r => r.estado === 'aceptada' && r.seguimiento === true)
                        .map(r => ({ ...r, label: 'Te sigue', canRemove: true })); 
                    break;
                case 'siguiendo':
                    this.currentStatTitle = 'Siguiendo';
                    this.currentStatList = sent.filter(r => r.estado === 'aceptada' && r.seguimiento === true)
                        .map(r => ({ ...r, label: 'Siguiendo', canUnfollow: true }));
                    break;
                case 'amistades':
                    this.currentStatTitle = 'Mis Amistades';
                    const f1 = sent.filter(r => r.estado === 'aceptada' && r.seguimiento === false);
                    const f2 = received.filter(r => r.estado === 'aceptada' && r.seguimiento === false);
                    this.currentStatList = [...f1, ...f2].map(r => ({ ...r, label: 'Amigo', canUnfriend: true }));
                    break;
                case 'pendientes':
                    this.currentStatTitle = 'Solicitudes de Amistad/Seguimiento';
                    this.currentStatList = received.filter(r => r.estado === 'pendiente')
                        .map(r => ({ ...r, label: 'Solicitante', isRequest: true }));
                    break;
                case 'enviadas':
                    this.currentStatTitle = 'Solicitudes Enviadas';
                    this.currentStatList = sent.filter(r => r.estado === 'pendiente')
                        .map(r => ({ ...r, label: 'Pendiente', canCancel: true }));
                    break;
            }
        } catch (e) {
            console.error(e);
            alert("Error cargando lista");
        } finally {
            this.modalLoading = false;
        }
    },

    async handleRelationAction(item, action) {
        try {
            let res;
            if (action === 'accept') {
                res = await api.respondToRelationRequest(item.usuario_origen, 'aceptada');
            } else if (action === 'reject') {
                res = await api.respondToRelationRequest(item.usuario_origen, 'rechazada');
            } else if (action === 'delete') { 
                res = await api.breakRelation(item.email_otro || (item.usuario_origen === this.userEmail ? item.usuario_destino : item.usuario_origen));
            }

            if (res && res.success) {
                this.currentStatList = this.currentStatList.filter(i => i !== item);
                this.loadRelationStats();
            } else {
                alert("Error: " + (res.error || "Falló la acción"));
            }
        } catch (e) {
            console.error(e);
        }
    },

    // ... RESTO DE MÉTODOS EXISTENTES ...
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
        // Obtener el email directamente desde this.userEmail que ya tienes
        if (!this.userEmail) {
          alert("No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
          this.creatingGroup = false;
          return;
        }
        
        console.log('Email del creador (desde this.userEmail):', this.userEmail);
        
        // Crear el objeto con todos los campos necesarios
        const groupData = {
          nombre: this.newGroup.nombre.trim(),
          descripcion: this.newGroup.descripcion || '',
          categoria: this.newGroup.categoria || 'academico',
          privacidad: this.newGroup.privacidad || 'publico',
          requisitos_ingreso: this.newGroup.requisitos_ingreso || '',
          // Incluir el email aquí para que usuarioServices lo use
          userEmail: this.userEmail  // ¡NUEVO: enviar el email directamente!
        };
        
        console.log('Datos completos enviando al backend:', groupData);
        
        // Llamar al servicio
        const resp = await api.createGroup(groupData);
        
        if (resp.success) {
          this.showCreateGroupForm = false;
          // Resetear formulario
          this.newGroup = { 
            nombre: '', 
            descripcion: '', 
            categoria: 'academico', 
            privacidad: 'publico',
            requisitos_ingreso: ''
          };
          await this.loadMyGroups();
          alert("¡Grupo creado con éxito!");
        } else {
          alert("Error al crear grupo: " + (resp.error || "Desconocido"));
        }
      } catch (e) {
        console.error('Error completo:', e);
        alert("Error: " + (e.message || "Error de conexión"));
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
    async followUser(email, esSeguimiento = true) {
      if (!email) return;
      try {
        const response = await api.createRelation(email, esSeguimiento);
        if (response.success) {
          // Actualizar estado local
          this.suggestions = this.suggestions.filter(u => u.email !== email);
          
          // Actualizar contadores si es necesario
          if (esSeguimiento) {
            this.userStats.siguiendo++;
          }
          this.loadRelationStats(); // Recargar para asegurar consistencia
          
          // Mensaje de confirmación
          alert(esSeguimiento ? 'Ahora sigues a este usuario' : 'Solicitud de amistad enviada');
        } else {
             // Si ya existe la relación, tal vez solo refrescar
             if (response.error && response.error.includes('duplicate')) {
                 this.suggestions = this.suggestions.filter(u => u.email !== email);
             } else {
                 alert("No se pudo crear la relación: " + response.error);
             }
        }
      } catch (e) {
        console.error(e);
        alert('Error al procesar la solicitud');
      }
    },
    
    async loadSuggestions() { 
        this.loadingSuggestions = true;
        try {
            // 1. Obtener todos los miembros
            const membersRes = await api.getAllMembers();
            if (!membersRes.success) throw new Error(membersRes.error);
            const allMembers = membersRes.data || [];

            // 2. Obtener a quienes ya sigo (para excluirlos)
            const relRes = await api.getMyRelations('sent');
            const followingEmails = new Set();
            if (relRes.success && relRes.data) {
                relRes.data.forEach(r => {
                    // Si r.email_otro es a quien sigo. 
                    // Ojo: getMyRelations 'sent' devuelve email_otro como el DESTINO.
                    if (r.email_otro) followingEmails.add(r.email_otro);
                });
            }
            followingEmails.add(this.userEmail); // Excluirme a mí mismo

            // 3. Filtrar
            const candidates = allMembers.filter(m => !followingEmails.has(m.email));

            // 4. Seleccionar aleatorios o los primeros 5
            this.suggestions = candidates.slice(0, 5).map(u => ({ ...u, is_following: false }));

        } catch (e) {
            console.error("Error cargando sugerencias:", e);
        } finally {
            this.loadingSuggestions = false;
        }
    },
    
    async loadSuggestedGroups() {
      try {
        const groupsRes = await api.getAllGroups();
        if (!groupsRes.success) return;
        const allGroups = groupsRes.data || [];

        const myGroupsRes = await api.getMyGroups();
        const myNames = new Set();
        if (myGroupsRes.success && myGroupsRes.data) {
          myGroupsRes.data.forEach(g => {
            if (g.nombre) myNames.add(g.nombre);
          });
        }
        this.myGroupNames = Array.from(myNames);

        // Marcamos si es miembro o no
        // Mostramos una mezcla de grupos (por ahora los primeros 10)
        this.suggestedGroups = allGroups.slice(0, 10).map(g => ({
            ...g,
            is_member: myNames.has(g.nombre)
        }));

      } catch (e) {
        console.error("Error cargando grupos sugeridos:", e);
      }
    },

    async joinGroup(groupName) {
      if (!groupName) return;
      try {
        const res = await api.joinGroup(groupName);
        if (res.success) {
          alert(res.message || 'Te has unido al grupo');
          await this.loadSuggestedGroups();
          await this.loadMyGroups();
        } else {
          alert(res.error || 'No se pudo unir al grupo');
        }
      } catch (e) {
        console.error(e);
        alert('Error al procesar la unión al grupo');
      }
    },
    
    async loadTrends() { this.trends = [] },
    async loadRecentActivity() { this.recentActivity = [] },
    
    goToGroup(name) {
      if (!name) return;
      this.$router.push({ name: 'GroupDashboard', params: { name: name } });
    },

    async loadMyGroups() {
        this.myGroupsLoading = true;
        try {
            const res = await api.getMyGroups();
            if (res.success) {
                this.myGroups = res.data || [];
                this.myGroupNames = this.myGroups.map(g => g.nombre);
            }
        } catch (e) {
            console.error("Error loadMyGroups:", e);
        } finally {
            this.myGroupsLoading = false;
        }
    },
    gotoFeed() {
            if (this.$route.path !== '/my-feed') {
                this.$router.push('/my-feed');
            }
    },
  }
}
</script>