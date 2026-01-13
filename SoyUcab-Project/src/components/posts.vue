<template>
  <div class="post-view-container">
    <headerBar />

    <div class="post-view-content">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando publicación...
      </div>

      <div v-else-if="error" class="error-box">
        <i class="fas fa-exclamation-circle"></i>
        <h3>{{ error }}</h3>
        <router-link to="/" class="btn-back">Volver al inicio</router-link>
      </div>

      <div v-else-if="post" class="post-detail">
        <!-- Header -->
        <div class="post-header">
          <router-link to="/" class="back-link">
            <i class="fas fa-arrow-left"></i> Volver
          </router-link>
          <h2>Publicación</h2>
        </div>

        <!-- Post Card -->
        <div class="post-card panel">
          <div class="post-author">
            <div class="avatar"><i class="fas fa-user-circle"></i></div>
            <div class="author-info">
              <strong>@{{ post.nombre_usuario }}</strong>
              <small>{{ formatDate(post.fecha_publicacion) }}</small>
            </div>
          </div>
          
          <div class="post-body">
            <p>{{ post.caption }}</p>
            <img v-if="post.tipo_contenido === 'imagen'" :src="post.descripcion_publicacion" class="post-media" />
            <video v-if="post.tipo_contenido === 'video'" controls class="post-media">
              <source :src="post.descripcion_publicacion" type="video/mp4">
            </video>
            <a v-if="post.tipo_contenido === 'enlace'" :href="post.descripcion_publicacion" target="_blank" class="post-link">
              Ver enlace externo
            </a>
          </div>

          <div class="post-stats">
            <span><i class="fas fa-heart"></i> {{ post.likes_count || 0 }} Me gusta</span>
            <span><i class="fas fa-comment"></i> {{ post.comments?.length || 0 }} Comentarios</span>
          </div>

          <div class="post-actions">
            <button class="action-btn" @click="handleLike" :class="{ 'liked': post.user_has_liked }">
              <i :class="post.user_has_liked ? 'fas fa-heart' : 'far fa-heart'"></i> Me gusta
            </button>
            <button class="action-btn" @click="showComments = !showComments">
              <i class="far fa-comment"></i> {{ showComments ? 'Ocultar' : 'Ver' }} comentarios
            </button>
          </div>

          <!-- Sección de comentarios -->
          <div v-if="showComments" class="comments-section">
            <div class="comment-input-area" v-if="isLoggedIn">
              <input 
                v-model="newCommentText" 
                placeholder="Escribe un comentario..." 
                @keyup.enter="submitComment"
              />
              <button @click="submitComment">Enviar</button>
            </div>

            <div class="comments-list">
              <div v-if="post.comments && post.comments.length > 0">
                <div v-for="comment in post.comments" :key="comment.fecha_creacion" class="comment-item">
                  <div class="comment-avatar"><i class="fas fa-user-circle"></i></div>
                  <div class="comment-content">
                    <strong>@{{ comment.nombre_usuario }}</strong>
                    <p>{{ comment.contenido }}</p>
                    <small>{{ formatDate(comment.fecha_creacion) }}</small>
                  </div>
                </div>
              </div>
              <div v-else class="no-comments">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </div>
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
  name: 'PostView',
  components: { headerBar },
  data() {
    return {
      post: null,
      loading: true,
      error: null,
      showComments: false,
      newCommentText: '',
      userEmail: ''
    }
  },
  computed: {
    isLoggedIn() {
      const user = localStorage.getItem('user')
      return user !== null && user !== 'undefined'
    }
  },
  async mounted() {
    this.setupUser();
    await this.loadPost();
  },
  methods: {
    setupUser() {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userObj = JSON.parse(stored);
        this.userEmail = userObj.email;
      }
    },

    async loadPost() {
      try {
        const { email, fecha } = this.$route.params;
        const fechaDecoded = decodeURIComponent(fecha);

        console.log("Cargando post:", { email, fecha: fechaDecoded });

        // Obtener el post
        const resPost = await axios.get(
          `http://localhost:3000/api/posts/single/${email}/${encodeURIComponent(fechaDecoded)}`
        );

        if (resPost.data.success) {
          this.post = resPost.data.data;

          // Verificar si el usuario actual dio like
          if (this.userEmail) {
            const resLike = await axios.get(
              `http://localhost:3000/api/interactions/check-like`,
              {
                params: {
                  email_miembro: this.userEmail,
                  email_publicador: this.post.email_publicador,
                  fecha_publicacion: this.post.fecha_publicacion
                }
              }
            );
            this.post.user_has_liked = resLike.data.hasLiked || false;
          }

          // Cargar comentarios
          await this.loadComments();
        } else {
          this.error = 'Publicación no encontrada';
        }
      } catch (e) {
        console.error("Error cargando post:", e);
        this.error = 'No se pudo cargar la publicación';
      } finally {
        this.loading = false;
      }
    },

    async loadComments() {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/posts/comments`,
          {
            params: {
              email_publicador: this.post.email_publicador,
              fecha_publicacion: this.post.fecha_publicacion
            }
          }
        );
        if (res.data.success) {
          this.post.comments = res.data.data;
        }
      } catch (e) {
        console.error("Error cargando comentarios:", e);
      }
    },

    async handleLike() {
      if (!this.isLoggedIn) {
        alert("Debes iniciar sesión para dar like");
        return;
      }

      try {
        const res = await axios.post('http://localhost:3000/api/interactions/like', {
          email_miembro_gusta: this.userEmail, 
          email_publicador_publicacion: this.post.email_publicador, 
          fecha_publicacion_publicacion: this.post.fecha_publicacion
        });

        if (res.data.success) {
          if (res.data.action === 'added') {
            this.post.likes_count = (parseInt(this.post.likes_count) || 0) + 1;
            this.post.user_has_liked = true;
          } else {
            this.post.likes_count = Math.max(0, (parseInt(this.post.likes_count) || 0) - 1);
            this.post.user_has_liked = false;
          }
        }
      } catch (error) {
        console.error("Error al dar like:", error);
        alert("Error al procesar el like");
      }
    },

    async submitComment() {
      if (!this.isLoggedIn) {
        alert("Debes iniciar sesión para comentar");
        return;
      }

      if (!this.newCommentText?.trim()) return;

      try {
        const payload = {
          email_comentador: this.userEmail,
          email_creador_publicacion: this.post.email_publicador,
          fecha_creacion_publicacion: this.post.fecha_publicacion,
          contenido: this.newCommentText
        };

        const response = await axios.post('http://localhost:3000/api/interactions/comment', payload);
        
        if (response.data.success) {
          await this.loadComments();
          this.newCommentText = '';
        }
      } catch (e) {
        console.error("Error al comentar:", e);
        alert("Error al enviar comentario");
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

<style scoped>
.post-view-container {
  background: #f0f2f5;
  min-height: 100vh;
  padding-top: 20px;
}

.post-view-content {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading {
  font-size: 18px;
  color: #1da1f2;
}

.error-box {
  color: #657786;
}

.error-box i {
  font-size: 48px;
  color: #e0245e;
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #1da1f2;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-weight: 600;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1da1f2;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1a8cd8;
}

.post-header h2 {
  margin: 0;
  color: #14171a;
}

.panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.avatar {
  font-size: 48px;
  color: #ccd6dd;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-info strong {
  font-size: 16px;
  color: #14171a;
}

.author-info small {
  color: #657786;
  font-size: 14px;
}

.post-body {
  margin-bottom: 20px;
}

.post-body p {
  font-size: 18px;
  line-height: 1.6;
  color: #14171a;
  margin-bottom: 15px;
}

.post-media {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 15px;
}

.post-link {
  display: inline-block;
  color: #1da1f2;
  text-decoration: none;
  font-weight: 600;
  margin-top: 10px;
}

.post-stats {
  display: flex;
  gap: 30px;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  color: #657786;
  font-size: 14px;
}

.post-stats i {
  margin-right: 5px;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
}

.action-btn {
  background: none;
  border: none;
  color: #657786;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: #f7f9fa;
  color: #1da1f2;
}

.action-btn.liked {
  color: #e0245e;
}

.comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-input-area {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-input-area input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  outline: none;
}

.comment-input-area button {
  background: #1da1f2;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.comment-avatar {
  font-size: 36px;
  color: #ccd6dd;
}

.comment-content {
  flex: 1;
}

.comment-content strong {
  color: #1da1f2;
  font-size: 14px;
}

.comment-content p {
  margin: 5px 0;
  color: #14171a;
  font-size: 15px;
  line-height: 1.5;
}

.comment-content small {
  color: #657786;
  font-size: 13px;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #657786;
  font-style: italic;
}
</style>