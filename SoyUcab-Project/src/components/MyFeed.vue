<template>
  <div class="feed-container">
    <headerBar />

    <router-link to="/notifications" class="notif-link">
      <div style="position: relative; display: inline-block;">
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </div>
    </router-link>
    
    <div class="main-layout">
      <aside class="sidebar-stats panel">
        <div class="profile-mini">
          <div class="avatar-large"><i class="fas fa-user-circle"></i></div>
          <h3>{{ userName }}</h3>
          <p class="user-handle">@{{ userHandle }}</p>
        </div>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="number">{{ postCount }}</span>
            <span class="label">Publicaciones</span>
          </div>
        </div>
        
      </aside>

      <main class="feed-content">
        <div class="create-post panel">
          <textarea 
            v-model="newPost.caption" 
            placeholder="¿Qué estás pensando?"
            rows="3"
          ></textarea>
          
          <div v-if="newPost.tipo_contenido !== 'texto'" class="media-input">
            <input 
              v-model="newPost.descripcion_publicacion" 
              type="text" 
              :placeholder="'Pega el enlace de tu ' + newPost.tipo_contenido"
            />
          </div>

          <div class="post-actions-row">
            <div class="selectors">
              <select v-model="newPost.tipo_contenido">
                <option value="texto">Texto</option>
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
                <option value="enlace">Enlace</option>
              </select>
              <select v-model="newPost.configuracion_privacidad">
                <option value="publico">Público</option>
                <option value="privado">Privado</option>
              </select>
            </div>
            
            <button class="btn-publish" @click="submitPost" :disabled="loading || !newPost.caption.trim()">
              {{ loading ? 'Enviando...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <div v-if="loadingPosts" class="loading-msg panel">
          <i class="fas fa-spinner fa-spin"></i> Cargando publicaciones...
        </div>

        <div v-else-if="posts.length === 0" class="no-posts panel">
          Aún no hay publicaciones. ¡Sé el primero!
        </div>

        <div v-else v-for="post in posts" :key="post.email_publicador + '-' + post.fecha_publicacion" class="post-card panel">
          <div class="post-header">
            <div class="avatar-small"><i class="fas fa-user-circle"></i></div>
            <div class="user-meta">
              <strong>@{{ post.nombre_usuario }}</strong>
              <small>{{ formatDate(post.fecha_publicacion) }}</small>
            </div>

            <button 
              v-if="post.email_publicador === userEmail" 
              @click="confirmDelete(post)" 
              class="btn-delete-post"
              title="Eliminar publicación"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div class="post-body">
  <p>{{ post.caption }}</p>
  
  <!-- Si tiene contenido multimedia/enlace, mostrar como link -->
  <div class="post-body">
  <p></p>
  
  <!-- Si tiene contenido multimedia/enlace, mostrar como link -->
  <div v-if="post.descripcion_publicacion" class="post-link-container">
    <i class="fas fa-link"></i>
    <a :href="formatUrl(post.descripcion_publicacion)" target="_blank" class="post-link">
      {{ post.descripcion_publicacion }}
    </a>
  </div>
</div>
</div>

          <div class="post-footer">
            <button 
              class="action-btn" 
              @click="handleLike(post)"
              :class="{ 'liked-active': post.user_has_liked }"
            >
              <i :class="post.user_has_liked ? 'fas fa-heart' : 'far fa-heart'"></i> 
              {{ post.likes_count || 0 }} Me gusta
            </button>
            
            <button class="action-btn" @click="toggleComments(post)">
              <i class="far fa-comment"></i> {{ post.showComments ? 'Ocultar' : 'Comentar' }}
            </button>
            
            <button class="action-btn" @click="sharePost(post)">
              <i class="far fa-share-square"></i> Compartir
            </button>
          </div>

          <div v-if="post.showComments" class="comments-section">
            <div class="comment-input-area">
              <input 
                v-model="post.newCommentText" 
                placeholder="Escribe un comentario..." 
                @keyup.enter="submitComment(post)"
              />
              <button @click="submitComment(post)">Enviar</button>
            </div>

            <div class="comments-display" v-if="post.comments && post.comments.length > 0">
              <div v-for="comment in post.comments" :key="comment.fecha_creacion" class="single-comment">
                <strong>@{{ comment.nombre_usuario }}:</strong> <span>{{ comment.contenido }}</span>
                <small class="comment-time">{{ formatDate(comment.fecha_creacion) }}</small>
              </div>
            </div>
            <div v-else class="no-comments-msg">No hay comentarios aún.</div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal para compartir -->
    <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Compartir publicación</h3>
          <button @click="showShareModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="share-text">Comparte esta publicación de @{{ sharePostData?.nombre_usuario }}</p>
          
          <!-- Opción 1: Copiar enlace -->
          <div class="share-section">
            <h4 class="share-section-title">📎 Copiar enlace</h4>
            <button @click="copyPostLink" class="share-btn">
              <i class="fas fa-link"></i> Copiar enlace
            </button>
            <div v-if="linkCopied" class="success-msg">
              ✓ Enlace copiado al portapapeles
            </div>
          </div>

          <!-- Opción 2: Compartir con usuarios -->
          <div class="share-section">
            <h4 class="share-section-title">👥 Compartir con usuarios</h4>
            
            <!-- Buscador de usuarios -->
            <div class="user-search-container">
              <input 
                v-model="shareSearchQuery" 
                @input="searchUsersToShare"
                placeholder="Buscar usuarios por nombre o email..."
                class="user-search-input"
              />
              
              <!-- Resultados de búsqueda -->
              <div v-if="shareSearchResults.length > 0" class="search-results">
                <div 
                  v-for="user in shareSearchResults" 
                  :key="user.email"
                  @click="selectUserToShare(user)"
                  class="search-result-item"
                >
                  <i class="fas fa-user-circle"></i>
                  <div class="user-info">
                    <strong>@{{ user.nombre_usuario }}</strong>
                    <small>{{ user.email }}</small>
                  </div>

                  
                </div>
              </div>
            </div>

            <!-- Usuarios seleccionados -->
            <div v-if="shareSelectedUsers.length > 0" class="selected-users">
              <div 
                v-for="user in shareSelectedUsers" 
                :key="user.email"
                class="selected-user-chip"
              >
                <span>@{{ user.nombre_usuario }}</span>
                <button @click="removeUserFromShare(user)" class="remove-chip-btn">&times;</button>
              </div>
            </div>

            <button 
              @click="shareViaNotification" 
              class="share-btn"
              :disabled="shareSelectedUsers.length === 0"
            >
              <i class="fas fa-paper-plane"></i> 
              Enviar a {{ shareSelectedUsers.length || 0 }} usuario(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'
import '@/assets/feed.css';

export default {
  name: 'MyFeed',
  components: { headerBar },
  data() {
    return {
      posts: [],
      postCount: 0,
      loading: false,
      loadingPosts: false,
      userEmail: '',
      userName: '',
      userHandle: '',
      newPost: {
        caption: '',
        tipo_contenido: 'texto',
        descripcion_publicacion: '',
        configuracion_privacidad: 'publico'
      },
      unreadCount: 0,
      showShareModal: false,
      sharePostData: null,
      linkCopied: false,
      followingUsers: [],
      shareSelectedUsers: [],
      shareSearchQuery: '',
      shareSearchResults: []
    }
  },
  async mounted() {
    this.setupUser();
    // Carga con manejo de errores
    try {
      await this.loadFollowing();
    } catch (e) {
      console.log("No se pudieron cargar seguidos, continuando...");
    }
    await this.loadAll();
    try {
      await this.fetchNotifications();
    } catch (e) {
      console.log("No se pudieron cargar notificaciones");
    }
  },
  methods: {
    setupUser() {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userObj = JSON.parse(stored);
        this.userEmail = userObj.email;
        this.userName = `${userObj.nombres || ''} ${userObj.apellidos || ''}`.trim() || 'Usuario';
        this.userHandle = userObj.nombre_usuario || 'usuario';
      }
    },

     formatUrl(url) {
    if (!url) return '';
    // Si ya tiene http:// o https://, dejarlo como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si no, agregar https://
    return 'https://' + url;
  },

    formatPostgresDate(date) {
      if (!date) return null;
      // Si es un objeto Date, convertirlo
      if (date instanceof Date) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      }
      // Si ya es string en formato ISO, convertirlo
      if (typeof date === 'string' && date.includes('T')) {
        const d = new Date(date);
        return d.toISOString().slice(0, 19).replace('T', ' ');
      }
      // Si ya está en formato correcto, devolverlo tal cual
      return date;
    },

    async loadFollowing() {
      try {
        const res = await axios.get(`http://localhost:3000/api/relations/${this.userEmail}?type=sent`);
        if (res.data.success) {
          this.followingUsers = res.data.data
            .filter(r => r.estado === 'aceptada')
            .map(r => r.email_otro);
        }
      } catch (e) {
        console.error("Error cargando seguidos:", e);
        this.followingUsers = [];
      }
    },

    async loadAll() {
      this.loadingPosts = true;
      try {
        const resPosts = await axios.get('http://localhost:3000/api/posts');
        if (resPosts.data.success) {
          let allPosts = resPosts.data.data;

          // Filtrar posts según privacidad
          const filteredPosts = allPosts.filter(p => {
            if (p.configuracion_privacidad === 'publico') return true;
            if (p.configuracion_privacidad === 'privado') {
              return p.email_publicador === this.userEmail || 
                     this.followingUsers.includes(p.email_publicador);
            }
            return true;
          });

          // Verificar likes para cada post
          for (let post of filteredPosts) {
            try {
              const resLike = await axios.get(
                `http://localhost:3000/api/interactions/check-like`,
                {
                  params: {
                    email_miembro: this.userEmail,
                    email_publicador: post.email_publicador,
                    fecha_publicacion: post.fecha_publicacion
                  }
                }
              );
              post.user_has_liked = resLike.data.hasLiked || false;
            } catch (e) {
              post.user_has_liked = false;
            }
          }

          this.posts = filteredPosts.map(p => ({
            ...p,
            showComments: false,
            comments: [],
            newCommentText: '',
            likes_count: parseInt(p.likes_count) || 0
          }));
        }

        if (this.userEmail) {
          const resCount = await axios.get(`http://localhost:3000/api/posts/count/${this.userEmail}`);
          if (resCount.data.success) {
            this.postCount = resCount.data.count;
          }
        }
      } catch (e) {
        console.error("Error cargando datos:", e);
        alert("No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo.");
      } finally {
        this.loadingPosts = false;
      }
    },

    async handleLike(post) {
      try {
        // Usar la fecha exactamente como viene de la BD
        const fechaPost = post.fecha_publicacion;
        
        console.log("💙 Intentando like con fecha:", fechaPost);
        
        const res = await axios.post('http://localhost:3000/api/interactions/like', {
          email_miembro_gusta: this.userEmail, 
          email_publicador_publicacion: post.email_publicador, 
          fecha_publicacion_publicacion: fechaPost
        });

        if (res.data.success) {
          if (res.data.action === 'added') {
            post.likes_count = (parseInt(post.likes_count) || 0) + 1;
            post.user_has_liked = true;
          } else {
            post.likes_count = Math.max(0, (parseInt(post.likes_count) || 0) - 1);
            post.user_has_liked = false;
          }
        }
      } catch (error) {
        console.error("ERROR AL DAR LIKE:", error.response?.data || error);
        if (error.response?.data?.debug) {
          console.log("🔍 Debug info:", error.response.data.debug);
        }
        alert("Error al procesar el like. Revisa la consola para más detalles.");
      }
    },

    async toggleComments(post) {
      post.showComments = !post.showComments;
      
      if (post.showComments && post.comments.length === 0) {
        try {
          const res = await axios.get(
            `http://localhost:3000/api/posts/comments`,
            {
              params: {
                email_publicador: post.email_publicador,
                fecha_publicacion: post.fecha_publicacion
              }
            }
          );
          if (res.data.success) {
            post.comments = res.data.data;
          }
        } catch (e) {
          console.error("Error cargando comentarios:", e);
        }
      }
    },

async submitComment(post) {
  if (!post.newCommentText?.trim()) return;

  try {
    // Normalizar la fecha al formato esperado por el backend
    let fechaFormateada = post.fecha_publicacion;
    
    // Si la fecha tiene milisegundos o zona horaria, limpiarla
    if (typeof fechaFormateada === 'string') {
      // Remover milisegundos y zona horaria si existen
      fechaFormateada = fechaFormateada.split('.')[0]; // Quita milisegundos
      fechaFormateada = fechaFormateada.replace('Z', ''); // Quita la Z de UTC
      fechaFormateada = fechaFormateada.replace('T', ' '); // Cambia T por espacio
    }
    
    console.log('📅 Fecha original:', post.fecha_publicacion);
    console.log('📅 Fecha formateada:', fechaFormateada);

    const payload = {
      email_comentador: this.userEmail,
      email_creador_publicacion: post.email_publicador,
      fecha_creacion_publicacion: fechaFormateada,
      contenido: post.newCommentText
    };

    const response = await axios.post('http://localhost:3000/api/interactions/comment', payload);
    
    if (response.data.success) {
      const nuevoComentario = {
        ...response.data.data,
        nombre_usuario: this.userHandle
      };

      if (!post.comments) post.comments = [];
      post.comments.push(nuevoComentario);
      post.newCommentText = '';
    }
  } catch (e) {
    console.error("Error al comentar:", e.response?.data || e);
    alert("Error al enviar comentario. Verifica la consola para más detalles.");
  }
},

    async submitPost() {
      this.loading = true;
      try {
        const payload = { ...this.newPost, email_publicador: this.userEmail };
        await axios.post('http://localhost:3000/api/posts', payload);
        this.newPost = {
          caption: '',
          tipo_contenido: 'texto',
          descripcion_publicacion: '',
          configuracion_privacidad: 'publico'
        };
        await this.loadAll();
      } catch (e) {
        alert("Error al publicar");
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    async confirmDelete(post) {
      if (confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
        try {
          const res = await axios.delete(
            `http://localhost:3000/api/posts/${post.email_publicador}/${encodeURIComponent(post.fecha_publicacion)}`, 
            {
              data: { email_solicitante: this.userEmail }
            }
          );

          if (res.data.success) {
            alert("Publicación eliminada");
            await this.loadAll(); 
          }
        } catch (e) {
          console.error("Error al eliminar:", e.response?.data || e);
          if (e.response?.data?.debug) {
            console.log("🔍 Debug info:", e.response.data.debug);
          }
          alert(e.response?.data?.error || "Error al eliminar");
        }
      }
    },

    sharePost(post) {
      this.sharePostData = post;
      this.showShareModal = true;
      this.linkCopied = false;
      this.shareSelectedUsers = [];
      this.shareSearchQuery = '';
      this.shareSearchResults = [];
    },

    copyPostLink() {
      const postUrl = `${window.location.origin}/post/${this.sharePostData.email_publicador}/${encodeURIComponent(this.sharePostData.fecha_publicacion)}`;
      navigator.clipboard.writeText(postUrl).then(() => {
        this.linkCopied = true;
        setTimeout(() => {
          this.linkCopied = false;
        }, 3000);
      });
    },

    async searchUsersToShare() {
      if (!this.shareSearchQuery || this.shareSearchQuery.length < 2) {
        this.shareSearchResults = [];
        return;
      }

      try {
        // Asumiendo que tienes un endpoint para buscar usuarios
        const res = await axios.get(`http://localhost:3000/api/members/search?q=${this.shareSearchQuery}`);
        if (res.data.success) {
          // Filtrar el usuario actual y los ya seleccionados
          this.shareSearchResults = res.data.data
            .filter(u => u.email !== this.userEmail)
            .filter(u => !this.shareSelectedUsers.find(s => s.email === u.email))
            .slice(0, 5);
        }
      } catch (e) {
        console.error("Error buscando usuarios:", e);
      }
    },

    selectUserToShare(user) {
      if (!this.shareSelectedUsers.find(u => u.email === user.email)) {
        this.shareSelectedUsers.push(user);
      }
      this.shareSearchQuery = '';
      this.shareSearchResults = [];
    },

    removeUserFromShare(user) {
      this.shareSelectedUsers = this.shareSelectedUsers.filter(u => u.email !== user.email);
    },

    async shareViaNotification() {
      if (this.shareSelectedUsers.length === 0) {
        alert("Selecciona al menos un usuario para compartir");
        return;
      }

      try {
        const payload = {
          email_publicador: this.sharePostData.email_publicador,
          fecha_publicacion: this.sharePostData.fecha_publicacion,
          compartido_por: this.userEmail,
          destinatarios: this.shareSelectedUsers.map(u => u.email)
        };

        const res = await axios.post('http://localhost:3000/api/posts/share', payload);
        
        if (res.data.success) {
          alert(`Post compartido con ${this.shareSelectedUsers.length} usuario(s)`);
          this.showShareModal = false;
          this.shareSelectedUsers = [];
        }
      } catch (e) {
        console.error("Error compartiendo:", e);
        alert("Error al compartir el post");
      }
    },

    async fetchNotifications() {
      try {
        const res = await axios.get(`http://localhost:3000/api/interactions/notifications/${this.userEmail}`);
        if (res.data.success) {
          this.unreadCount = res.data.data.filter(n => n.estado === 'pendiente').length;
        }
      } catch (e) {
        console.error("Error al cargar notificaciones:", e);
      }
    },

    formatDate(date) {
      if (!date) return 'Ahora';
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return d.toLocaleDateString();
    }
  }
}
</script>

