<template>
  <div class="group-dashboard panel">
    <headerBar />
    
    <div v-if="loading" class="loading">Cargando grupo...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <h2>{{ group.nombre || 'Grupo no encontrado' }}</h2>
      
      <div class="group-header">
        <div>Creador: <strong>{{ group.creador_nombre || 'Desconocido' }} ({{ group.creador_email || 'Sin email' }})</strong></div>
        <div>Creado: {{ formatDate(group.fecha_creacion) || 'Fecha desconocida' }}</div>
        <div>Miembros: {{ group.cantidad_miembros || 0 }}</div>
        <div>Estado: <span class="badge" :class="group.estado">{{ group.estado || 'cargando...' }}</span>
</div>
      </div>

      <div class="group-info">
        <div v-if="!isEditing">
          <p>{{ group.descripcion || 'Sin descripción' }}</p>
          <p v-if="group.requisitos_ingreso"><strong>Requisitos:</strong> {{ group.requisitos_ingreso }}</p>
          <div v-if="isAdmin" style="margin-top:8px;">
            <button @click="startEdit">Editar información</button>
          </div>
        </div>

        <div v-else class="edit-form">
          <label>Descripción</label>
          <textarea rows="4" v-model="editForm.descripcion"></textarea>

          <label>Requisitos de ingreso</label>
          <textarea rows="3" v-model="editForm.requisitos_ingreso"></textarea>

          <label>Estado</label>
          <select v-model="editForm.estado">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
            <option value="archivado">archivado</option>
          </select>

          <div class="actions" style="margin-top:8px;">
            <button @click="saveEdit" :disabled="saving">Guardar</button>
            <button @click="cancelEdit">Cancelar</button>
          </div>
          <div v-if="editError" class="error">{{ editError }}</div>
        </div>
      </div>

      <div class="group-admins" v-if="group.admins?.length">
        <h3>Administradores</h3>
        <ul>
          <li v-for="a in group.admins" :key="a.email_miembro">
            {{ a.nombre_usuario || a.email_miembro }} — {{ a.rol_grupo }}
          </li>
        </ul>
      </div>

      <div class="group-members">
        <h3>Miembros</h3>
        <div v-if="membersLoading">Cargando miembros...</div>
        <div v-else-if="members.length === 0">No hay miembros.</div>
        <ul v-else>
          <li v-for="m in members" :key="m.email_miembro">
            {{ m.nombre_usuario || m.email_miembro }} <small>({{ m.rol_grupo }})</small>
          </li>
        </ul>
      </div>

      <div v-if="isMember" class="group-create-post">
        <h3>Crear publicación</h3>
        <div class="create-post-form">
          <input type="text" placeholder="Título o caption" v-model="newPost.caption" />
          <textarea rows="3" placeholder="Escribe tu publicación..." v-model="newPost.descripcion_publicacion"></textarea>
          <select v-model="newPost.tipo_contenido">
            <option value="texto">Texto</option>
            <option value="imagen">Imagen</option>
            <option value="video">Video</option>
            <option value="archivo">Archivo</option>
            <option value="enlace">Enlace</option>
          </select>
          <div>
            <button @click="createPost" :disabled="posting || !newPost.descripcion_publicacion.trim()">
              {{ posting ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
          <div v-if="postError" class="error">{{ postError }}</div>
        </div>
      </div>

      <div class="group-posts">
        <h3>Publicaciones ({{ posts.length }})</h3>
        <div v-if="postsLoading">Cargando publicaciones...</div>
        <div v-else-if="posts.length === 0" class="no-posts">
          <p>No hay publicaciones en este grupo.</p>
          <p v-if="isMember">¡Sé el primero en publicar algo!</p>
        </div>
        <div v-else class="posts-list">
          <div v-for="post in posts" :key="post.email_publicador + '-' + post.fecha_publicacion" class="post-item">
            <div class="post-header">
              <div class="post-author">
                <strong>{{ post.publicador_nombre || post.publicador_nombre_completo || post.email_publicador }}</strong>
                <span class="post-date">{{ formatDateTime(post.fecha_publicacion) }}</span>
              </div>
              <div v-if="canEditPost(post)" class="post-actions-menu">
                <button @click="startEditPost(post)">✏️</button>
                <button @click="deletePost(post)" class="delete-btn">🗑️</button>
              </div>
            </div>

            <div class="post-body">
              <div v-if="post.caption" class="post-caption">
                <em>{{ post.caption }}</em>
              </div>
              <div v-if="post.descripcion_publicacion" class="post-content">
                {{ post.descripcion_publicacion }}
              </div>
              <div v-if="post.imagen" class="post-media">
                <img :src="post.imagen" alt="Imagen" class="post-image" />
              </div>
              <div v-if="post.video" class="post-media">
                <video controls class="post-video">
                  <source :src="post.video" type="video/mp4">
                  Tu navegador no soporta videos.
                </video>
              </div>
              <div v-if="post.tipo_contenido" class="post-type">
                <small>Tipo: {{ post.tipo_contenido }}</small>
              </div>
            </div>

            <div class="post-stats">
              <span class="stat">👍 {{ post.contador_comentarios || 0 }} likes</span>
              <span class="stat">💬 {{ post.contador_comentarios || 0 }} comentarios</span>
              <span class="stat">↪️ {{ post.contador_compartidos || 0 }} compartidos</span>
            </div>

            <div class="post-actions">
              <button @click="likePost(post)" :class="{ 'liked': post.user_liked }">
                👍 Me gusta
              </button>
              <button @click="toggleComments(post)">
                💬 Comentar
              </button>
              <button @click="sharePost(post)">
                ↪️ Compartir
              </button>
            </div>

            <div v-if="post.showComments" class="comments-section">
              <p>Comentarios (próximamente)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import headerBar from './header.vue';
    import api from '@/services/usuarioServices';

    export default {
    name: 'GroupDashboard',
    components: { headerBar },
    data() {
        return {
        group: { 
          nombre: '', 
          descripcion: '', 
          creador_nombre: '', 
          creador_email: '', 
          fecha_creacion: '', 
          cantidad_miembros: 0, 
          requisitos_ingreso: '', 
          estado: 'activo', // Inicializa con un valor por defecto o string vacío
          admins: [] 
        },
        loading: true,
        error: null,
        members: [],
        membersLoading: false,
        posts: [],
        postsLoading: false,
        newPost: { caption: '', descripcion_publicacion: '', tipo_contenido: 'texto', configuracion_privacidad: 'publico' },
        posting: false,
        postError: null,
        isEditing: false,
        editForm: { descripcion: '', requisitos_ingreso: '', estado: 'activo' },
        saving: false,
        editError: null
        
        };
        
    },
    async mounted() {
        // Verificamos sesión antes de cargar nada
        if (!localStorage.getItem('user')) {
        this.$router.push('/login');
        return;
        }
        await this.loadGroup();
        await this.loadMembers();
        await this.loadPosts();
    },
    computed: {
        currentUser() {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
            return {};
        }
        },
        isMember() {
        const email = this.currentUser.email || this.currentUser.email_persona;
        if (!email || !this.members.length) return false;
        return this.members.some(m => m.email_miembro === email);
        },
        isAdmin() {
        const email = this.currentUser.email || this.currentUser.email_persona;
        if (!email || !this.group.admins) return false;
        return this.group.admins.some(a => a.email_miembro === email && a.rol_grupo === 'administrador');
        }
    },
    methods: {
        async loadGroup() {
            this.loading = true;
            this.error = null;
            const groupName = this.$route.params.name;
            
            console.log("Cargando grupo:", groupName); // Para depuración

            try {
                const response = await api.getGroupDetails(groupName);
                console.log("Respuesta del servidor:", response); // Revisa esto en la consola F12

                if (response.success && response.data) {
                    this.group = response.data;
                    // Forzamos el estado si llega vacío para que no diga "desconocido"
                    if (!this.group.estado) this.group.estado = 'activo'; 
                } else {
                    this.error = response.error || 'El grupo no existe o no tienes permiso.';
                }
            } catch (error) {
                console.error('Error fatal cargando grupo:', error);
                this.error = 'Error de conexión con el servidor.';
            } finally {
                this.loading = false; // Esto quita el mensaje de "Cargando..."
            }
        },
        async loadMembers() {
    this.membersLoading = true;
    const groupName = this.$route.params.name;
    
    if (!groupName) {
        console.error("No se encontró el nombre del grupo en la URL");
        this.membersLoading = false;
        return;
    }

    try {
        const response = await api.getGroupMembers(groupName);
        if (response.success) {
        this.members = response.data || [];
        } else {
        console.error('API Error (Members):', response.error);
        }
    } catch (error) {
        // Imprime el error completo para ver si es un 404, 500 o error de red
        console.error('Error de red en loadMembers:', error);
    } finally {
        this.membersLoading = false;
    }
    },

    async loadPosts() {
        this.postsLoading = true;
        const groupName = this.$route.params.name;

        if (!groupName) {
            this.postsLoading = false;
            return;
        }

        try {
            const response = await api.getGroupPosts(groupName);
            if (response.success) {
            this.posts = (response.data || []).map(post => ({
                ...post,
                user_liked: false,
                showComments: false
            }));
            } else {
            console.error('API Error (Posts):', response.error);
            }
        } catch (error) {
            console.error('Error de red en loadPosts:', error);
        } finally {
            this.postsLoading = false;
        }
    },
    async createPost() {
        if (!this.newPost.descripcion_publicacion.trim()) return;
        this.posting = true;
        try {
            const postData = { ...this.newPost, nombre_grupo_publicado: this.group.nombre };
            const response = await api.createGroupPost(this.group.nombre, postData);
            if (response.success) {
                this.newPost = { caption: '', descripcion_publicacion: '', tipo_contenido: 'texto', configuracion_privacidad: 'publico' };
                await this.loadPosts();
            } else {
                this.postError = response.error;
            }
        } finally {
            this.posting = false;
        }
    },
    canEditPost(post) {
        const email = this.currentUser.email || this.currentUser.email_persona;
        return this.isAdmin || post.email_publicador === email;
    },
    async likePost(post) {
        try {
            const postIdentifier = { email_publicador: post.email_publicador, fecha_publicacion: post.fecha_publicacion };
            const response = await api.likePost(this.group.nombre, postIdentifier);
            if (response.success) {
            post.user_liked = !post.user_liked;
            post.contador_comentarios = (post.contador_comentarios || 0) + (post.user_liked ? 1 : -1);
            }
        } catch (e) { console.error(e); }
    },
    async deletePost(post) {
        if (!confirm('¿Eliminar esta publicación?')) return;
        try {
            const postIdentifier = { email_publicador: post.email_publicador, fecha_publicacion: post.fecha_publicacion };
            const response = await api.deleteGroupPost(this.group.nombre, postIdentifier);
            if (response.success) await this.loadPosts();
        } catch (e) { alert('Error eliminando'); }
    },
    startEdit() {
        this.isEditing = true;
        this.editForm = { descripcion: this.group.descripcion, requisitos_ingreso: this.group.requisitos_ingreso, estado: this.group.estado };
    },
    cancelEdit() { this.isEditing = false; },
        async saveEdit() {
        this.saving = true;
        try {
            const response = await api.updateGroup(this.group.nombre, this.editForm);
            if (response.success) {
            this.isEditing = false;
            await this.loadGroup();
            } else { this.editError = response.error; }
        } finally { this.saving = false; }
    },
    toggleComments(post) { post.showComments = !post.showComments; },
    sharePost(post) {
        navigator.clipboard.writeText(window.location.href).then(() => alert('Enlace copiado'));
    },
    formatDate(d) { return d ? new Date(d).toLocaleDateString() : 'N/A'; },
    formatDateTime(d) { return d ? new Date(d).toLocaleString() : 'N/A'; }
    }

};
</script>

<style scoped>

.group-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.group-header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.group-info {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: #e8f5e9;
  color: #2e7d32;
}

/* Posts */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.post-author {
  flex: 1;
}

.post-author strong {
  display: block;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.post-date {
  font-size: 12px;
  color: #666;
}

.post-actions-menu {
  display: flex;
  gap: 8px;
}

.post-actions-menu button {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
}

.post-actions-menu .delete-btn {
  color: #f44336;
  border-color: #ffcdd2;
}

.post-body {
  margin-bottom: 16px;
}

.post-caption {
  font-style: italic;
  color: #555;
  margin-bottom: 8px;
}

.post-content {
  line-height: 1.5;
  color: #333;
}

.post-media {
  margin-top: 12px;
}

.post-image {
  max-width: 100%;
  border-radius: 8px;
}

.post-video {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
}

.post-type {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.post-stats {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin: 12px 0;
  color: #666;
  font-size: 13px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.post-actions button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.post-actions button:hover {
  background: #f5f5f5;
}

.post-actions button.liked {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

/* Forms */
.edit-form textarea,
.create-post-form textarea,
.create-post-form input,
.create-post-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
}

.edit-form textarea,
.create-post-form textarea {
  min-height: 100px;
  resize: vertical;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.actions button:first-child {
  background: #2196f3;
  color: white;
}

.actions button:last-child {
  background: #f5f5f5;
  color: #666;
}

/* Error messages */
.error {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
}

.no-posts {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Loading states */
.loading,
.postsLoading,
.membersLoading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
