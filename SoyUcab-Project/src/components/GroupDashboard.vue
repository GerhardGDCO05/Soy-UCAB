<template>
  <div class="group-dashboard panel">
    <headerBar />

    <div v-if="showLeaveModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirmar petición</h3>
        <p>¿Estás seguro de que deseas salir del grupo <strong>{{ group.nombre }}</strong>?</p>
        <div class="modal-actions">
          <button @click="confirmLeave" class="btn-confirm" :disabled="leaving">
            {{ leaving ? 'Saliendo...' : 'Salir' }}
          </button>
          <button @click="showLeaveModal = false" class="btn-cancel" :disabled="leaving">
            Cancelar
          </button>
        </div>
        <div v-if="leaveError" class="error">{{ leaveError }}</div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">Cargando grupo...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <div v-if="!isMember" class="no-member-view">
         <h2>{{ group.nombre }}</h2>
         <div class="restriction-notice">
           <i class="fas fa-lock"></i>
           <p>Este es un grupo de la comunidad. Debes unirte para ver su contenido y participantes.</p>
           <button @click="handleJoinGroup" class="btn-join-main" :disabled="joining">
              {{ joining ? 'Procesando...' : 'Unirse al grupo' }}
           </button>
         </div>
      </div>

      <div v-else>
        <h2>{{ group.nombre || 'Grupo no encontrado' }}</h2>
        
        <div class="group-header">
          <div>Creador: <strong>{{ group.creador_nombre || 'Desconocido' }} ({{ group.creador_email || 'Sin email' }})</strong></div>
          <div>Creado: {{ formatDate(group.fecha_creacion) || 'Fecha desconocida' }}</div>
          <div>Miembros: {{ group.cantidad_miembros || 0 }}</div>
          <div>Estado: <span class="badge" :class="group.estado">{{ group.estado || 'cargando...' }}</span></div>
          <button v-if="isMember && !isAdmin" @click="showLeaveModal = true" class="btn-leave-trigger">Salir del grupo</button>
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
            
            <div v-if="editingPost && editingPost.email_publicador === post.email_publicador && editingPost.fecha_publicacion === post.fecha_publicacion" class="edit-post-form">
              <div class="create-post-form">
                <label><strong>Editar Título:</strong></label>
                <input type="text" v-model="editingPost.caption" />
                <label><strong>Editar Contenido:</strong></label>
                <textarea rows="3" v-model="editingPost.descripcion_publicacion"></textarea>
                <label><strong>Tipo de contenido:</strong></label>
                <select v-model="editingPost.tipo_contenido">
                  <option value="texto">Texto</option>
                  <option value="imagen">Imagen</option>
                  <option value="video">Video</option>
                  <option value="archivo">Archivo</option>
                  <option value="enlace">Enlace</option>
                </select>
                <div class="actions">
                  <button @click="saveEditPost" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar Cambios' }}</button>
                  <button @click="cancelEditPost" :disabled="saving">Cancelar</button>
                </div>
                <div v-if="editError" class="error">{{ editError }}</div>
              </div>
            </div>

            <div v-else>
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
                <div v-if="post.caption" class="post-caption"><em>{{ post.caption }}</em></div>
                <div v-if="post.descripcion_publicacion" class="post-content">{{ post.descripcion_publicacion }}</div>
                <div v-if="post.imagen" class="post-media"><img :src="post.imagen" alt="Imagen" class="post-image" /></div>
                <div v-if="post.video" class="post-media">
                  <video controls class="post-video">
                    <source :src="post.video" type="video/mp4">Tu navegador no soporta videos.
                  </video>
                </div>
                <div v-if="post.tipo_contenido" class="post-type"><small>Tipo: {{ post.tipo_contenido }}</small></div>
              </div>

              <div class="post-stats">
                <span class="stat">👍 {{ post.contador_likes || 0 }} likes</span>
                <span class="stat">💬 {{ post.contador_comentarios || 0 }} comentarios</span>
                <span class="stat">↪️ {{ post.contador_compartidos || 0 }} compartidos</span>
              </div>

              <div class="post-actions">
                <button v-if="!post.user_liked" @click="handleLike(post)">👍 Me gusta</button>
                <button v-else @click="handleUnlike(post)" class="liked">❤️ no me gusta</button>
                <button @click="console.log('Click en post:', post); toggleComments(post)">💬 Comentar ({{ post.contador_comentarios }})</button>
                <button @click="sharePost(post)">↪️ Compartir</button>
              </div>

              <div v-if="post.showComments" class="comments-section" style="margin-top: 15px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                
                <div style="display: flex; gap: 8px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                  <input 
                    type="text" 
                    v-model="post.newCommentText" 
                    placeholder="Escribe un comentario..." 
                    style="flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ccc; outline: none;"
                    @keyup.enter="handleAddComment(post)"
                  />
                  <button @click="handleAddComment(post)" style="padding: 8px 20px; background: #2196f3; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: bold;">
                    Enviar
                  </button>
                </div>

                <div v-if="post.loadingComments" class="loading">Cargando comentarios...</div>
                
                <div v-else>
                  <div v-if="post.comments && post.comments.length > 0">
                    <div v-for="c in post.comments" :key="c.fecha_creacion" class="comment-item" style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                      <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <strong style="color: #2c3e50;">{{ c.nombre_usuario || c.email_comentador }}</strong>
                        <small style="color: #888;">{{ formatDateTime(c.fecha_creacion) }}</small>
                      </div>
                      
                      <div v-if="c.isEditing">
                        <textarea v-model="c.nuevoTexto" style="width: 100%; margin-top:5px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                        <div style="margin-top: 5px; display: flex; gap: 5px;">
                          <button @click="saveEditComment(c, post)" style="font-size: 11px; padding: 4px 8px; background: #4caf50; color: white; border: none; border-radius: 3px; cursor: pointer;">Guardar</button>
                          <button @click="c.isEditing = false" style="font-size: 11px; padding: 4px 8px; background: #9e9e9e; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancelar</button>
                        </div>
                      </div>
                      
                      <p v-else style="margin: 5px 0; font-size: 14px; color: #333;">{{ c.contenido }}</p>

                      <div v-if="c.email_comentador === (currentUser.email || currentUser.email_persona)" style="font-size: 11px; margin-top: 4px;">
                        <span @click="c.isEditing = true; c.nuevoTexto = c.contenido" style="cursor:pointer; color: #2196f3; font-weight: bold;">Editar</span> | 
                        <span @click="handleDeleteComment(c, post)" style="cursor:pointer; color: #f44336; font-weight: bold;">Eliminar</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else style="text-align: center; color: #888; font-size: 13px; padding: 10px;">
                    Aún no hay comentarios.
                  </div>
                </div>
              </div>
            </div>
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
            editError: null,
            showLeaveModal: false,
            leaving: false,
            leaveError: null,
            joining: false,
            editingPost: null, // Guardará los datos temporales del post a editar
            polling: null
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
        try {
            const name = this.$route.params.name;
            const res = await api.getGroupDetails(name);
            if (res.success) {
                this.group = res.data;
            } else {
                this.error = res.error || 'No se pudo cargar la información del grupo';
            }
        } catch (e) {
            this.error = 'Error inesperado al cargar grupo';
        } finally {
            this.loading = false;
        }
    },

    async handleJoinGroup() {
      this.joining = true;
      try {
        const res = await api.joinGroup(this.group.nombre);
        if (res.success) {
          alert(res.message || 'Te has unido al grupo');
          await this.loadGroup();
          await this.loadMembers();
          await this.loadPosts();
        } else {
          alert(res.error || 'Error al unirse');
        }
      } catch (e) {
        alert('Error al procesar unión');
      } finally {
        this.joining = false;
      }
    },
    async confirmLeave() {
      this.leaving = true;
      this.leaveError = null;
      try {
        const response = await api.leaveGroup(this.group.nombre);
        if (response.success) {
          this.showLeaveModal = false;
          alert('Has salido del grupo correctamente');
          this.$router.push('/home'); 
        } else {
          this.leaveError = response.error;
        }
      } catch (error) {
        this.leaveError = "Error al procesar la solicitud.";
      } finally {
        this.leaving = false;
      }
    },
    async loadMembers() {
      this.membersLoading = true;
      const groupName = this.$route.params.name;
      if (!groupName) {
        this.membersLoading = false;
        return;
      }
      try {
        const response = await api.getGroupMembers(groupName);
        if (response.success) {
          this.members = response.data || [];
        }
      } catch (error) {
        console.error('Error loadMembers:', error);
      } finally {
        this.membersLoading = false;
      }
    },

        async loadPosts() {
          const response = await api.getGroupPosts(this.$route.params.name, this.currentUser.email);
          if (response.success) {
            this.posts = response.data.map(post => ({
              ...post,
              // Convertimos a número inmediatamente al recibir del servidor
              contador_likes: parseInt(post.contador_likes) || 0,
              contador_comentarios: parseInt(post.contador_comentarios) || 0,
              contador_compartidos: parseInt(post.contador_compartidos) || 0,
              showComments: false,
              newCommentText: ''
            }));
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
        async deletePost(post) {
            // Usamos el confirm nativo como ya tenías planteado
            if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;
            
            try {
                // El identificador según tu DB es el email del autor y la fecha exacta
                const postIdentifier = { 
                    email_publicador: post.email_publicador, 
                    fecha_publicacion: post.fecha_publicacion 
                };
                
                const response = await api.deleteGroupPost(this.group.nombre, postIdentifier);
                
                if (response.success) {
                    // Filtramos localmente para no tener que recargar todo
                    this.posts = this.posts.filter(p => 
                        !(p.email_publicador === post.email_publicador && 
                          p.fecha_publicacion === post.fecha_publicacion)
                    );
                    alert('Publicación eliminada correctamente');
                } else {
                    alert('Error al eliminar: ' + response.error);
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión al intentar eliminar');
            }
        },

        // Inicia el modo edición de un post específico
        startEditPost(post) {

            this.editingPost = { 
                ...post,
                
                originalRef: post 
            };
        },

        // Cancela la edición
        cancelEditPost() {
            this.editingPost = null;
        },

        // Guarda los cambios de la publicación editada
        async saveEditPost() {
            if (!this.editingPost.descripcion_publicacion.trim()) return;

            try {
                const postIdentifier = { 
                    email_publicador: this.editingPost.email_publicador, 
                    fecha_publicacion: this.editingPost.fecha_publicacion 
                };
                
                const updatedData = {
                    caption: this.editingPost.caption,
                    descripcion_publicacion: this.editingPost.descripcion_publicacion,
                    tipo_contenido: this.editingPost.tipo_contenido
                };

                const response = await api.updateGroupPost(this.group.nombre, postIdentifier, updatedData);

                if (response.success) {
                    // Actualizamos el post en la lista local
                    const index = this.posts.findIndex(p => 
                        p.email_publicador === postIdentifier.email_publicador && 
                        p.fecha_publicacion === postIdentifier.fecha_publicacion
                    );
                    
                    if (index !== -1) {
                        // Combinamos los datos nuevos con los antiguos (como likes/comentarios)
                        this.posts[index] = { ...this.posts[index], ...updatedData };
                    }
                    
                    this.editingPost = null;
                    alert('Publicación actualizada');
                } else {
                    alert('Error al actualizar: ' + response.error);
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión');
            }
        },
        canEditPost(post) {
            const email = this.currentUser.email || this.currentUser.email_persona;
            return this.isAdmin || post.email_publicador === email;
        },
        async handleLike(post) {
            const postIdentifier = { 
                email_publicador: post.email_publicador, 
                fecha_publicacion: post.fecha_publicacion 
            };
            try {
                const res = await api.likePost(this.group.nombre, postIdentifier);
                if (res.success) {
                    post.user_liked = true;
                    
                    post.contador_likes = Number(post.contador_likes || 0) + 1;
                }
            } catch (error) {
                console.error("Error al dar like:", error);
            }
        },

        async handleUnlike(post) {
            try {
                const res = await api.unlikePost(
                    this.group.nombre,
                    post.email_publicador,
                    post.fecha_publicacion,
                    this.currentUser.email
                );
                
                if (res.success) {
                    post.user_liked = false;
                    
                    post.contador_likes = Math.max(0, Number(post.contador_likes || 0) - 1);
                }
            } catch (error) {
                console.error("Error en la petición Unlike:", error);
            }
        },
        async deleteComment(comment, post) {
            if (!confirm('¿Eliminar comentario?')) return;
            const res = await api.deleteComment(this.group.nombre, comment);
            if (res.success) {
                // Recargar posts para ver el cambio o filtrar localmente
                await this.loadPosts(); 
            }
        },
        // Método para alternar la visualización de comentarios
        async toggleComments(post) {
          console.log('toggleComments llamado para el post:', post);

          if (post.showComments) {
              post.showComments = false;
              return;
          }

          post.showComments = true;
          post.loadingComments = true;
          post.comments = [];

          try {
              const userEmail = this.currentUser.email || this.currentUser.email_persona;
              console.log('Email del usuario actual:', userEmail);

              // Formatear la fecha para asegurarse de que esté en el formato correcto
              const formattedDate = post.fecha_publicacion.replace('T', ' ').split('.')[0];
              console.log('Fecha formateada:', formattedDate);

              // Llamar al servicio para obtener los comentarios
              console.log('Llamando a getPostComments con:', this.group.nombre, post.email_publicador, formattedDate, userEmail);

              const response = await api.getPostComments(
                  this.group.nombre,
                  post.email_publicador,
                  formattedDate,
                  userEmail
              );

              console.log('Respuesta de getPostComments:', response);

              if (response.success) {
                  post.comments = response.data || [];
                  console.log('Comentarios cargados:', post.comments);
              } else {
                  console.error('Error al cargar comentarios:', response.error);
              }
          } catch (error) {
              console.error("Error cargando comentarios:", error);
              post.comments = [];
          } finally {
              post.loadingComments = false;
          }
      },


        async handleAddComment(post) {
            if (!post.newCommentText?.trim()) return;

            const postIdentifier = {
                email_publicador: post.email_publicador,
                fecha_publicacion: post.fecha_publicacion
            };

            const res = await api.commentPost(
                this.group.nombre, 
                postIdentifier, 
                post.newCommentText
            );

            if (res.success) {
                post.newCommentText = '';
                
                // CORRECCIÓN AQUÍ:
                post.contador_comentarios = Number(post.contador_comentarios || 0) + 1;
                
                post.showComments = false; 
                await this.toggleComments(post); 
            } else {
                alert(res.error || "No se pudo publicar el comentario");
            }
        },

        async handleDeleteComment(comment, post) {
            if (!confirm('¿Eliminar comentario?')) return;
            // La PK ahora son 4 campos: comentador + post(email+fecha) + fecha_comentario
            const payload = {
                email_comentador: comment.email_comentador,
                email_pub: post.email_publicador,
                fecha_pub: post.fecha_publicacion,
                fecha_com: comment.fecha_creacion
            };
            const res = await api.deleteComment(this.group.nombre, payload);
            if (res.success) {
                post.comments = post.comments.filter(c => c.fecha_creacion !== comment.fecha_creacion);
                post.contador_comentarios--;
            }
        },

        async saveEditComment(comment, post) {
            if (!comment.nuevoTexto.trim()) return;
            const payload = {
                email_comentador: comment.email_comentador,
                email_pub: post.email_publicador,
                fecha_pub: post.fecha_publicacion,
                fecha_com: comment.fecha_creacion,
                nuevo_contenido: comment.nuevoTexto
            };
            const res = await api.updateComment(this.group.nombre, payload);
            if (res.success) {
                comment.contenido = comment.nuevoTexto;
                comment.isEditing = false;
                comment.editado = true;
            }
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

        sharePost(post) {
            navigator.clipboard.writeText(window.location.href).then(() => alert('Enlace copiado'));
        },
        formatDate(d) { return d ? new Date(d).toLocaleDateString() : 'N/A'; },
        formatDateTime(d) { return d ? new Date(d).toLocaleString() : 'N/A'; },

        // Función para formatear fechas en el formato esperado por el backend
        formatDateForBackend(dateString) {
            // Si la fecha ya está en el formato correcto, devuélvela tal cual
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
                return dateString;
            }

            // Si la fecha está en formato ISO (ej: "2024-01-18T09:15:00.000Z")
            if (dateString.includes('T')) {
                return dateString.replace('T', ' ').split('.')[0];
            }

            // Si la fecha está en otro formato, intenta convertirla
            try {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            } catch (error) {
                console.error('Error al formatear la fecha:', error);
                return dateString;
            }
        }
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

/* Botón para activar el modal */
.btn-leave-trigger {
  margin-left: 15px; /* Separación del badge */
  background-color: #ffeded;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-leave-trigger:hover {
  background-color: #d32f2f;
  color: white;
}

/* Modal Overlay (El fondo oscuro que cubre todo) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Oscurece el fondo */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Asegura que esté por encima de todo */
}

/* Contenido del Modal */
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease-out;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.btn-confirm {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-confirm:hover { background-color: #b71c1c; }
.btn-cancel:hover { background-color: #e0e0e0; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.no-member-view {
  text-align: center;
  padding: 40px 20px;
}

.restriction-notice {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #eee;
  max-width: 500px;
  margin: 20px auto;
}

.restriction-notice i {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 20px;
  display: block;
}

.btn-join-main {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
}

.btn-join-main:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}
</style>
