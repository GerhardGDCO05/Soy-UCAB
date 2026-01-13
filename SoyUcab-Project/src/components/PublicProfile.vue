<template>
  <div class="feed-container">
    <headerBar />
    
    <div v-if="!profileUser && !error" class="loading-screen">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando perfil...</p>
    </div>

    <div v-else-if="error" class="error-screen panel">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="fetchProfileData" class="btn-retry">
        <i class="fas fa-redo"></i> Reintentar
      </button>
    </div>

    <div class="main-layout" v-else-if="profileUser">
      <aside class="sidebar-stats panel">
        <div class="profile-mini">
          <div class="avatar-large"><i class="fas fa-user-circle"></i></div>
          <h3>{{ profileUser.nombres }} {{ profileUser.apellidos }}</h3>
          <p class="user-handle">@{{ profileUser.nombre_usuario || 'usuario' }}</p>
          <span class="badge badge-info">{{ profileUser.tipo_miembro || 'Miembro' }}</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <span class="number">{{ postCount }}</span>
            <span class="label">Publicaciones</span>
          </div>
        </div>

        <div class="profile-actions" v-if="!isOwnProfile">
          <div v-if="!relationStatus" class="action-buttons">
            <button @click="followUser(true)" class="btn-follow">
              <i class="fas fa-user-plus"></i> Seguir
            </button>
            <button @click="followUser(false)" class="btn-friend">
              <i class="fas fa-user-friends"></i> Solicitar Amistad
            </button>
          </div>

          <div v-else class="relation-status">
            <div v-if="relationStatus.estado === 'aceptada' && relationStatus.seguimiento" class="status-badge following">
              <i class="fas fa-check-circle"></i> Siguiendo
              <button @click="unfollowUser" class="btn-unfollow">
                <i class="fas fa-user-times"></i> Dejar de seguir
              </button>
            </div>

            <div v-if="relationStatus.estado === 'aceptada' && !relationStatus.seguimiento" class="status-badge friends">
              <i class="fas fa-user-friends"></i> Amigos
              <button @click="unfriendUser" class="btn-unfriend">
                <i class="fas fa-user-minus"></i> Eliminar amigo
              </button>
            </div>

            <div v-if="relationStatus.estado === 'pendiente'" class="status-badge pending">
              <i class="fas fa-clock"></i> Solicitud pendiente
              <button @click="cancelRequest" class="btn-cancel">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>

        <div class="user-details-list">
           <div v-if="profileUser.facultad || profileUser.facultad_estudiante || profileUser.facultad_egresado" class="detail-item">
             <i class="fas fa-building"></i> {{ profileUser.facultad || profileUser.facultad_estudiante || profileUser.facultad_egresado }}
           </div>
           <div v-if="profileUser.carrera_programa" class="detail-item">
             <i class="fas fa-graduation-cap"></i> {{ profileUser.carrera_programa }}
           </div>
           <div v-if="profileUser.pais" class="detail-item">
             <i class="fas fa-globe"></i> {{ profileUser.pais }}
           </div>
        </div>
      </aside>

      <main class="feed-content">
        <div v-if="loadingPosts" class="loading-msg panel">
          <i class="fas fa-spinner fa-spin"></i> Cargando publicaciones...
        </div>

        <div v-else-if="posts.length === 0" class="no-posts panel">
          <i class="fas fa-inbox"></i>
          <p>Este usuario no tiene publicaciones públicas o aún no lo sigues.</p>
        </div>

        <div v-else v-for="post in posts" :key="post.fecha_publicacion" class="post-card panel">
          <div class="post-header">
            <div class="avatar-small"><i class="fas fa-user-circle"></i></div>
            <div class="user-meta">
              <strong>@{{ post.nombre_usuario }}</strong>
              <small>{{ formatDate(post.fecha_publicacion) }}</small>
            </div>
          </div>
          
          <div class="post-body">
            <p>{{ post.caption }}</p>
            <img v-if="post.tipo_contenido === 'imagen'" :src="post.descripcion_publicacion" class="post-media" alt="Imagen del post" />
            <video v-if="post.tipo_contenido === 'video'" controls class="post-media">
              <source :src="post.descripcion_publicacion" type="video/mp4">
            </video>
            <a v-if="post.tipo_contenido === 'enlace'" :href="post.descripcion_publicacion" target="_blank" class="post-link">
              Ver enlace externo
            </a>
          </div>

          <div class="post-footer">
            <button class="action-btn" @click="handleLike(post)" :class="{ 'liked-active': post.user_has_liked }">
              <i :class="post.user_has_liked ? 'fas fa-heart' : 'far fa-heart'"></i> 
              {{ post.likes_count || 0 }} Me gusta
            </button>
            
            <button class="action-btn" @click="toggleComments(post)">
              <i class="far fa-comment"></i> {{ post.showComments ? 'Ocultar' : 'Comentar' }}
            </button>
          </div>

          <div v-if="post.showComments" class="comments-section">
            <div class="comment-input-area">
              <input v-model="post.newCommentText" placeholder="Escribe un comentario..." @keyup.enter="submitComment(post)" />
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
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'

export default {
  name: 'PublicProfile',
  props: ['email'],
  components: { headerBar },
  data() {
    return {
      profileUser: null,
      posts: [],
      postCount: 0,
      loadingPosts: false,
      currentUserEmail: '',
      error: null,
      relationStatus: null,
      loadingRelation: false
    }
  },
  computed: {
    isOwnProfile() {
      return this.currentUserEmail === this.email
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.currentUserEmail = user.email || ''
    await this.fetchProfileData()
  },
  watch: {
    email(newEmail) {
      this.fetchProfileData()
    }
  },
  methods: {
    async fetchProfileData() {
      this.loadingPosts = true
      this.error = null
      
      try {
        if (!this.email) throw new Error('No se proporcionó un email de usuario')

        const resUser = await axios.get('http://localhost:3000/api/members', {
          params: { search: this.email, limit: 1 }
        })
        
        if (resUser.data.success && resUser.data.data && resUser.data.data.length > 0) {
          this.profileUser = resUser.data.data.find(u => u.email === this.email) || resUser.data.data[0]
        } else {
          throw new Error('Usuario no encontrado')
        }

        const resCount = await axios.get(`http://localhost:3000/api/posts/count/${this.email}`)
        this.postCount = resCount.data.count || 0

        const resPosts = await axios.get(`http://localhost:3000/api/posts/profile/${this.email}`, {
          params: { viewer_email: this.currentUserEmail }
        })
        
        this.posts = resPosts.data.data || []

        for (let post of this.posts) {
          post.showComments = false
          post.comments = []
          post.newCommentText = ''
          post.likes_count = parseInt(post.likes_count) || 0
          
          try {
            const resLike = await axios.get('http://localhost:3000/api/interactions/check-like', {
              params: {
                email_miembro: this.currentUserEmail,
                email_publicador: post.email_publicador,
                fecha_publicacion: post.fecha_publicacion
              }
            })
            post.user_has_liked = resLike.data.hasLiked || false
          } catch (e) {
            post.user_has_liked = false
          }
        }

        if (!this.isOwnProfile) await this.checkRelationStatus()
      } catch (error) {
        this.error = error.response?.data?.error || error.message || 'Error al cargar el perfil'
      } finally {
        this.loadingPosts = false
      }
    },

    async checkRelationStatus() {
      try {
        this.loadingRelation = true
        const response = await axios.get('http://localhost:3000/api/relations/my-relations', {
          params: { user_email: this.currentUserEmail, direction: 'sent' }
        })
        if (response.data.success && response.data.data) {
          this.relationStatus = response.data.data.find(r => r.email_otro === this.email) || null
        }
      } catch (error) {
        this.relationStatus = null
      } finally {
        this.loadingRelation = false
      }
    },

    async followUser(isSeguimiento = true) {
      try {
        const response = await axios.post('http://localhost:3000/api/relations', {
          usuario_origen: this.currentUserEmail,
          usuario_destino: this.email,
          seguimiento: isSeguimiento
        })
        if (response.data.success) {
          alert(isSeguimiento ? 'Ahora sigues a este usuario' : 'Solicitud de amistad enviada')
          await this.checkRelationStatus()
        } else {
          alert('Error: ' + (response.data.error || 'No se pudo crear la relación'))
        }
      } catch (error) {
        alert('Error al procesar la solicitud')
      }
    },

    async unfollowUser() {
      if (!confirm('¿Dejar de seguir a este usuario?')) return
      await this.breakRelation()
    },

    async unfriendUser() {
      if (!confirm('¿Eliminar esta amistad?')) return
      await this.breakRelation()
    },

    async cancelRequest() {
      if (!confirm('¿Cancelar esta solicitud?')) return
      await this.breakRelation()
    },

    async breakRelation() {
      try {
        const response = await axios.delete('http://localhost:3000/api/relations', {
          data: { usuario_origen: this.currentUserEmail, usuario_destino: this.email }
        })
        if (response.data.success) {
          alert('Relación eliminada correctamente')
          this.relationStatus = null
          await this.fetchProfileData()
        }
      } catch (error) {
        alert('Error al procesar la solicitud')
      }
    },
    
    async handleLike(post) {
      try {
        const res = await axios.post('http://localhost:3000/api/interactions/like', {
          email_miembro_gusta: this.currentUserEmail,
          email_publicador_publicacion: post.email_publicador,
          fecha_publicacion_publicacion: post.fecha_publicacion
        })
        if (res.data.success) {
          if (res.data.action === 'added') {
            post.likes_count = (parseInt(post.likes_count) || 0) + 1
            post.user_has_liked = true
          } else {
            post.likes_count = Math.max(0, (parseInt(post.likes_count) || 0) - 1)
            post.user_has_liked = false
          }
        }
      } catch (error) {
        alert("Error al procesar el like")
      }
    },

    async toggleComments(post) {
      post.showComments = !post.showComments
      if (post.showComments && post.comments.length === 0) {
        try {
          const res = await axios.get('http://localhost:3000/api/posts/comments', {
            params: { email_publicador: post.email_publicador, fecha_publicacion: post.fecha_publicacion }
          })
          if (res.data.success) post.comments = res.data.data
        } catch (e) {
          console.error("Error cargando comentarios:", e)
        }
      }
    },

    async submitComment(post) {
      if (!post.newCommentText?.trim()) return
      
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        
        // Normalizar la fecha al formato esperado por el backend
        let fechaFormateada = post.fecha_publicacion
        
        // Si la fecha tiene milisegundos o zona horaria, limpiarla
        if (typeof fechaFormateada === 'string') {
          // Remover milisegundos y zona horaria si existen
          fechaFormateada = fechaFormateada.split('.')[0] // Quita milisegundos
          fechaFormateada = fechaFormateada.replace('Z', '') // Quita la Z de UTC
          fechaFormateada = fechaFormateada.replace('T', ' ') // Cambia T por espacio
        }
        
        console.log('📅 Fecha original:', post.fecha_publicacion)
        console.log('📅 Fecha formateada:', fechaFormateada)
        
        const response = await axios.post('http://localhost:3000/api/interactions/comment', {
          email_comentador: this.currentUserEmail,
          email_creador_publicacion: post.email_publicador,
          fecha_creacion_publicacion: fechaFormateada,
          contenido: post.newCommentText
        })
        
        if (response.data.success) {
          if (!post.comments) post.comments = []
          post.comments.push({ 
            ...response.data.data, 
            nombre_usuario: user.nombre_usuario || 'usuario' 
          })
          post.newCommentText = ''
        }
      } catch (e) {
        console.error("Error al comentar:", e.response?.data || e)
        alert("Error al enviar comentario. Verifica la consola para más detalles.")
      }
    },
    
    formatDate(date) {
      if (!date) return 'Hace poco'
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      } catch (e) {
        return 'Fecha inválida'
      }
    }
  }
}
</script>

<style scoped>
.feed-container { background: #f0f2f5; min-height: 100vh; padding-top: 20px; }
.loading-screen, .error-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: #657786; }
.loading-screen i, .error-screen i { font-size: 48px; margin-bottom: 20px; }
.error-screen { background: white; max-width: 500px; margin: 40px auto; padding: 40px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.error-screen i { color: #e74c3c; }
.btn-retry { margin-top: 20px; padding: 10px 20px; background: #1da1f2; color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; }
.btn-retry:hover { background: #1a8cd8; }
.main-layout { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
.panel { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
.sidebar-stats { height: fit-content; position: sticky; top: 80px; }
.profile-mini { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
.avatar-large { font-size: 80px; color: #1da1f2; margin-bottom: 15px; }
.profile-mini h3 { margin: 10px 0 5px 0; color: #14171a; font-size: 20px; }
.user-handle { color: #657786; margin: 0 0 10px 0; }
.badge-info { background: #e1f5fe; color: #01579b; padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; display: inline-block; }
.stats-grid { padding: 20px 0; border-bottom: 1px solid #eee; }
.stat-box { text-align: center; }
.stat-box .number { display: block; font-size: 24px; font-weight: bold; color: #14171a; }
.stat-box .label { display: block; font-size: 14px; color: #657786; margin-top: 5px; }
.user-details-list { margin-top: 20px; text-align: left; font-size: 14px; color: #657786; }
.detail-item { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.detail-item i { color: #1da1f2; width: 20px; }
.profile-actions { padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin: 15px 0; }
.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.btn-follow, .btn-friend, .btn-unfollow, .btn-unfriend, .btn-cancel { width: 100%; padding: 10px 15px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; font-size: 14px; }
.btn-follow { background: #1da1f2; color: white; }
.btn-follow:hover { background: #1a8cd8; }
.btn-friend { background: #17bf63; color: white; }
.btn-friend:hover { background: #14a855; }
.relation-status { display: flex; flex-direction: column; gap: 10px; }
.status-badge { padding: 12px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.status-badge.following { background: #e1f5fe; color: #01579b; }
.status-badge.friends { background: #e8f5e9; color: #2e7d32; }
.status-badge.pending { background: #fff3e0; color: #f57c00; }
.btn-unfollow, .btn-unfriend, .btn-cancel { width: 100%; background: #657786; color: white; margin-top: 5px; }
.btn-unfollow:hover, .btn-unfriend:hover, .btn-cancel:hover { background: #57656f; }
.feed-content { max-width: 600px; }
.loading-msg, .no-posts { text-align: center; padding: 40px 20px; color: #657786; }
.no-posts i { font-size: 48px; display: block; margin-bottom: 15px; color: #ccc; }
.post-card { margin-bottom: 15px; }
.post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
.avatar-small { font-size: 40px; color: #1da1f2; }
.user-meta { flex: 1; }
.user-meta strong { display: block; color: #14171a; font-size: 15px; }
.user-meta small { color: #657786; font-size: 13px; }
.post-body p { margin: 0 0 15px 0; color: #14171a; line-height: 1.5; }
.post-media { width: 100%; max-height: 500px; object-fit: cover; border-radius: 12px; margin-top: 10px; }
.post-link { display: inline-block; margin-top: 10px; color: #1da1f2; text-decoration: none; font-weight: 500; }
.post-link:hover { text-decoration: underline; }
.post-footer { display: flex; justify-content: space-around; border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px; }
.action-btn { background: none; border: none; color: #657786; cursor: pointer; font-weight: bold; font-size: 14px; transition: color 0.2s; display: flex; align-items: center; gap: 5px; padding: 5px 10px; }
.action-btn:hover { color: #1da1f2; }
.action-btn.liked-active { color: #e0245e; }
.comments-section { margin-top: 15px; padding-top: 10px; border-top: 1px solid #f0f2f5; }
.comment-input-area { display: flex; gap: 10px; margin-bottom: 15px; }
.comment-input-area input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; outline: none; font-size: 14px; }
.comment-input-area input:focus { border-color: #1da1f2; }
.comment-input-area button { background: #1da1f2; color: white; border: none; padding: 5px 15px; border-radius: 15px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
.comment-input-area button:hover { background: #1a8cd8; }
.comments-display { background: #f8f9fa; padding: 10px; border-radius: 8px; font-size: 13px; }
.single-comment { margin-bottom: 8px; border-bottom: 1px solid #edf0f2; padding-bottom: 8px; }
.single-comment:last-child { border-bottom: none; }
.single-comment strong { color: #1da1f2; margin-right: 5px; }
.comment-time { display: block; color: #657786; font-size: 11px; margin-top: 2px; }
.no-comments-msg { color: #657786; font-style: italic; text-align: center; padding: 10px; }
@media (max-width: 768px) {
  .main-layout { grid-template-columns: 1fr; }
  .sidebar-stats { position: relative; top: 0; }
}
</style>