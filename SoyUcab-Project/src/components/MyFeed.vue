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
            placeholder="¿Qué estás pensando, Mike?"
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

        <div v-if="posts.length === 0" class="no-posts panel">
          Aún no hay publicaciones. ¡Sé el primero!
        </div>

        <div v-for="post in posts" :key="post.fecha_publicacion" class="post-card panel">
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
            <img v-if="post.tipo_contenido === 'imagen'" :src="post.descripcion_publicacion" class="post-media" />
            <video v-if="post.tipo_contenido === 'video'" controls class="post-media">
              <source :src="post.descripcion_publicacion" type="video/mp4">
            </video>
            <a v-if="post.tipo_contenido === 'enlace'" :href="post.descripcion_publicacion" target="_blank" class="post-link">
              Ver enlace externo
            </a>
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
            
            <button class="action-btn"><i class="far fa-share-square"></i> Compartir</button>
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

            <div class="user-meta">
                <strong>@{{ post.nombre_usuario }}</strong>
                <code style="font-size: 10px; color: red;"> 
                    Post: {{ post.email_publicador }} | Yo: {{ userEmail }} 
                </code>
                <small>{{ formatDate(post.fecha_publicacion) }}</small>
            </div>

            <div class="comments-display" v-if="post.comments && post.comments.length > 0">
              <div v-for="comment in post.comments" :key="comment.fecha_creacion" class="single-comment">
                <strong>@{{ comment.nombre_usuario }}:</strong> <span>{{ comment.contenido }}</span>
              </div>
            </div>
            <div v-else class="no-comments-msg">No hay comentarios aún.</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'

export default {
  name: 'MyFeed',
  components: { headerBar },
  data() {
    return {
      posts: [],
      postCount: 0,
      loading: false,
      userEmail: '',
      userName: 'Mike W',
      userHandle: 'mike89',
      newPost: {
        caption: '',
        tipo_contenido: 'texto',
        descripcion_publicacion: '',
        configuracion_privacidad: 'publico'
      },
      showNotifs: false,      // Controla si el "Inbox" está abierto
    notifications: [],      // Aquí se guardarán las notifs que traigas del backend
    unreadCount: 0          // El número para el puntito rojo
    }
  },
  async mounted() {
    this.setupUser();
    await this.loadAll();
  },
  methods: {
    setupUser() {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userObj = JSON.parse(stored);
        this.userEmail = userObj.email;
        this.userName = `${userObj.nombres || 'Mike'} ${userObj.apellidos || 'W'}`;
        this.userHandle = userObj.nombre_usuario || 'mike89';
      }
    },
    // MyFeed.vue -> loadAll
    async loadAll() {
    try {
        const resPosts = await axios.get('http://localhost:3000/api/posts');
        if (resPosts.data.success) {
        this.posts = resPosts.data.data.map(p => ({
            ...p,
            showComments: false,
            comments: [],
            newCommentText: '',
            likes_count: parseInt(p.likes_count) || 0
        }));
        }

        // VERIFICACIÓN CLAVE:
        if (this.userEmail) {
        console.log("Cargando contador para:", this.userEmail);
        const resCount = await axios.get(`http://localhost:3000/api/posts/count/${this.userEmail}`);
        if (resCount.data.success) {
            this.postCount = resCount.data.count;
        }
        } else {
        console.warn("No hay email de usuario para contar publicaciones");
        }
    } catch (e) {
        console.error("Error cargando datos:", e);
    }
    },
    async handleLike(post) {
    try {
        // Limpieza de fecha para que coincida con el timestamp(0) de la BD
        const fechaLimpia = post.fecha_publicacion
        .replace('T', ' ')
        .replace(/\..+/, '')
        .replace('Z', '');

        const res = await axios.post('http://localhost:3000/api/interactions/like', {
        email_miembro: this.userEmail, // Mike
        email_publicador: post.email_publicador,
        fecha_publicacion: fechaLimpia 
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
    } catch (e) {
        console.error("Error en like:", e.response?.data || e.message);
    }
    },
    async toggleComments(post) {
      post.showComments = !post.showComments;
      if (post.showComments) {
        await this.fetchComments(post);
      }
    },
    async fetchComments(post) {
      try {
        const res = await axios.get(`http://localhost:3000/api/posts/comments`, {
          params: {
            email_publicador: post.email_publicador,
            fecha_publicacion: post.fecha_publicacion
          }
        });
        if (res.data.success) {
          post.comments = res.data.data;
        }
      } catch (e) {
        console.error("Error cargando comentarios", e);
      }
    },
    async createPost(req, res) {
        try {
            const { email_publicador, caption, tipo_contenido, configuracion_privacidad, descripcion_publicacion } = req.body;
            
            const result = await db.query(
                `INSERT INTO soyucab.publicacion 
                (caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador, fecha_publicacion)
                VALUES ($1, $2, $3, $4, $5, date_trunc('second', NOW())) RETURNING *`, 
                [caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador]
            );
            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error("Error en createPost:", error);
            res.status(500).json({ success: false, error: 'Error al crear post' });
        }
    },
    async submitComment(post) {
        if (!post.newCommentText.trim()) return;
        try {
            // Limpiamos la fecha para que sea un string plano sin Timezone
            // Ejemplo: '2026-01-04T19:52:55.000Z' -> '2026-01-04 19:52:55'
            const fechaLimpia = post.fecha_publicacion.replace('T', ' ').replace(/\..+/, '').replace('Z', '');

            const payload = {
                email_comentador: this.userEmail,
                email_creador_publicacion: post.email_publicador,
                fecha_creacion_publicacion: fechaLimpia, 
                contenido: post.newCommentText
            };

            console.log("Payload enviado (Limpio):", payload);

            const res = await axios.post('http://localhost:3000/api/interactions/comment', payload);
            if (res.data.success) {
                post.newCommentText = '';
                await this.fetchComments(post); 
            }
        } catch (e) {
            console.error("Detalle error:", e.response?.data);
            alert("Error de coincidencia: Revisa que la fecha sea idéntica a la de la BD.");
        }
    },
    async submitPost() {
      this.loading = true;
      try {
        const payload = { ...this.newPost, email_publicador: this.userEmail };
        await axios.post('http://localhost:3000/api/posts', payload);
        this.newPost.caption = '';
        await this.loadAll();
      } catch (e) {
        alert("Error al publicar");
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : 'Ahora';
    },
    async confirmDelete(post) {
        if (confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.")) {
            try {
            // Enviamos el email del usuario logueado en el body para validar en el back
            const res = await axios.delete(`http://localhost:3000/api/posts/${post.email_publicador}/${post.fecha_publicacion}`, {
                data: { email_solicitante: this.userEmail }
            });

            if (res.data.success) {
                // Recargamos el feed y el contador
                await this.loadAll(); 
            }
            } catch (e) {
            console.error("Error eliminando post:", e);
            alert("No se pudo eliminar la publicación.");
            }
        }
    },

    toggleNotifs() {
        this.showNotifs = !this.showNotifs;
        if (this.showNotifs) {
        this.fetchNotifications(); // Trae las notifs cuando se abre el panel
        }
    },
  
    async fetchNotifications() {
        try {
        const res = await axios.get(`http://localhost:3000/api/interactions/notifications/${this.userEmail}`);
        if (res.data.success) {
            this.notifications = res.data.data;
            this.unreadCount = this.notifications.filter(n => n.estado === 'pendiente').length;
        }
        } catch (e) {
        console.error("Error al cargar notificaciones:", e);
        }
    },
  }
}
</script>

<style scoped>
/* ESTILOS EXISTENTES */
.feed-container { background: #f0f2f5; min-height: 100vh; padding-top: 20px; }
.main-layout { display: flex; gap: 20px; max-width: 1000px; margin: 0 auto; padding: 0 15px; }
.sidebar-stats { flex: 1; height: fit-content; text-align: center; position: sticky; top: 80px; }
.feed-content { flex: 2; }
.panel { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 15px; }

/* ESTILO PARA EL CORAZÓN ROJO */
.liked-active {
  color: #e0245e !important;
}


/* Agrégalo al final de tu <style> */
.post-header {
  position: relative !important; /* Permite posicionar el botón */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-right: 40px; /* Deja espacio para la papelera */
}

.btn-delete-post {
  position: absolute !important;
  right: 10px !important;
  top: 10px !important;
  background: #ff4444 !important; /* Fondo rojo temporal para verlo */
  color: white !important;
  border: none;
  border-radius: 4px;
  padding: 5px 8px;
  cursor: pointer;
  z-index: 999;
}

.btn-delete-post i {
  font-size: 16px;
}
.avatar-large { font-size: 60px; color: #ccd6dd; margin-bottom: 10px; }
.avatar-small { font-size: 40px; color: #ccd6dd; }
.number { display: block; font-size: 24px; font-weight: bold; color: #1da1f2; }
.label { font-size: 12px; color: #657786; text-transform: uppercase; }

.create-post textarea { width: 100%; border: 1px solid #e1e8ed; border-radius: 8px; padding: 12px; resize: none; margin-bottom: 10px; }
.post-actions-row { display: flex; justify-content: space-between; align-items: center; }
.btn-publish { background: #1da1f2; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }

.post-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.user-meta { display: flex; flex-direction: column; }
.post-media { width: 100%; border-radius: 8px; margin-top: 10px; }

.post-footer { display: flex; justify-content: space-around; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; }
.action-btn { background: none; border: none; color: #657786; cursor: pointer; font-weight: bold; font-size: 14px; transition: color 0.2s; }
.action-btn:hover { color: #1da1f2; }

.comments-section { margin-top: 15px; padding-top: 10px; border-top: 1px solid #f0f2f5; }
.comment-input-area { display: flex; gap: 10px; margin-bottom: 15px; }
.comment-input-area input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; outline: none; }
.comment-input-area button { background: #1da1f2; color: white; border: none; padding: 5px 15px; border-radius: 15px; cursor: pointer; }

.comments-display { background: #f8f9fa; padding: 10px; border-radius: 8px; font-size: 13px; }
.single-comment { margin-bottom: 8px; border-bottom: 1px solid #edf0f2; padding-bottom: 4px; }
.single-comment strong { color: #1da1f2; }



/* Estilo para que el panel flote correctamente */
.notif-section {
    position: sticky;
    top: 0;
    z-index: 1000;
}

.notif-icon-container {
    position: absolute;
    right: 20px;
    top: 15px; /* Ajusta esto para que quede alineado con tu logo/texto del header */
}

.notif-dropdown {
    display: block !important; /* Asegura que el v-if funcione */
    position: absolute;
    right: 0;
    top: 40px;
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 9999; /* Esto garantiza que flote sobre el feed */
}
</style>