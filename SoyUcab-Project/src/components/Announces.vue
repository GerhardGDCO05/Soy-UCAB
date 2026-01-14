<template>
  <div class="feed-container">
    <headerBar />

    <div v-if="loading" class="loading-state panel">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <div v-else class="main-layout">
      <aside class="sidebar-stats panel">
        <div class="announcement-nav">
          <i class="fas fa-bullhorn icon-main"></i>
          <h2>Anuncios</h2>
          <p>Cartelera Institucional</p>
          <hr />
          
          <!-- PESTAÑAS DE NAVEGACIÓN -->
          <div class="view-tabs">
            <button 
              @click="vistaActual = 'anuncios'" 
              :class="{ active: vistaActual === 'anuncios' }"
            >
              <i class="fas fa-list"></i> Lista
            </button>
            <button 
              @click="vistaActual = 'calendario'" 
              :class="{ active: vistaActual === 'calendario' }"
            >
              <i class="fas fa-calendar"></i> Calendario
            </button>
          </div>

          <hr />
          <div class="user-context-box">
            <small>Usuario:</small>
            <strong>{{ user.nombre_usuario || 'Cargando...' }}</strong>
            <span class="role-tag">{{ user.tipo_rol || 'Sin rol' }}</span>
          </div>
        </div>
      </aside>

      <main class="feed-content">
        
        <!-- VISTA DE ANUNCIOS (Original) -->
        <div v-if="vistaActual === 'anuncios'">
          <div v-if="puedeCrear" class="create-post panel announce-form">
            <h3><i class="fas fa-plus"></i> Publicar nuevo anuncio</h3>
            
            <input 
              v-model="announceForm.titulo" 
              type="text" 
              placeholder="Título del anuncio" 
              class="input-title"
            />

            <textarea 
              v-model="announceForm.contenido" 
              placeholder="¿Qué quieres informar a la comunidad?"
              rows="3"
            ></textarea>
            
            <div class="post-actions-row">
              <div class="selectors">
                <select v-model="announceForm.prioridad">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>

                <select v-model="announceForm.tipo_anuncio">
                  <option value="informativo">Informativo</option>
                  <option value="laboral">Laboral</option>
                  <option value="cultural">Cultural</option>
                  <option value="academico">Académico</option>
                </select>
                
                <input type="date" v-model="announceForm.fecha_expiracion" title="Fecha de vencimiento" />
              </div>
            </div>

            <div class="destinatarios-section">
              <p><strong>Dirigido a:</strong></p>
              <div class="check-group">
                <label v-for="rol in rolesDisponibles" :key="rol">
                  <input type="checkbox" :value="rol" v-model="announceForm.destinatarios"> {{ rol }}
                </label>
              </div>
            </div>

            <button class="btn-publish" @click="submit" :disabled="saving || !announceForm.titulo">
              {{ saving ? 'Publicando...' : 'Publicar Anuncio' }}
            </button>
          </div>

          <div v-if="anuncios.length === 0" class="no-posts panel">
            No hay anuncios para tu rol ({{ user.tipo_rol }}) en este momento.
          </div>

          <div v-for="ann in anuncios" :key="ann.fecha_creacion" :class="['post-card', 'panel', ann.prioridad]">
            <div class="post-header">
              <div class="user-meta">
                <span class="priority-badge">{{ ann.prioridad.toUpperCase() }}</span>
                <h3>{{ ann.titulo }}</h3>
                <small>De: {{ ann.creador_email }} | {{ formatDate(ann.fecha_creacion) }}</small>
              </div>
            </div>
            
            <div class="post-body">
              <p>{{ ann.contenido }}</p>
            </div>

            <div class="metrics-bar">
              <div class="metric-item">
                <i class="fas fa-users"></i>
                <span>{{ ann.destinatarios_lista?.length || 0 }} grupos</span>
              </div>
              <div class="metric-item" v-if="ann.destinatarios_lista">
                <i class="fas fa-bullseye"></i>
                <span>{{ ann.destinatarios_lista.join(', ') }}</span>
              </div>
            </div>

            <div class="post-footer">
              <span><i class="far fa-clock"></i> Expira: {{ ann.fecha_expiracion ? formatDate(ann.fecha_expiracion) : 'Permanente' }}</span>
              <span class="type-label">{{ ann.tipo_anuncio }}</span>
            </div>
          </div>
        </div>

        <!-- VISTA DE CALENDARIO (Nueva) -->
        <div v-else-if="vistaActual === 'calendario'" class="calendar-container panel">
          <h3><i class="fas fa-calendar-alt"></i> Calendario de Anuncios</h3>
          <FullCalendar :options="calendarOptions" />
        </div>

      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import headerBar from './header.vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export default {
  components: { 
    headerBar,
    FullCalendar 
  },
  data() {
    return {
      vistaActual: 'anuncios', // 'anuncios' o 'calendario'
      user: {
        email: '',
        nombre_usuario: '',
        tipo_rol: ''
      },
      loading: true,
      saving: false,
      anuncios: [],
      rolesDisponibles: ['Estudiante', 'Profesor', 'Egresado', 'Personal Administrativo'],
      announceForm: {
        titulo: '',
        contenido: '',
        prioridad: 'media',
        tipo_anuncio: 'informativo',
        fecha_expiracion: '',
        destinatarios: []
      },
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        },
        events: [],
        eventClick: this.handleEventClick,
        height: 'auto',
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }
      }
    };
  },
  computed: {
    puedeCrear() {
      return this.user.tipo_rol === 'dependencia' || this.user.tipo_rol === 'organizacion';
    }
  },
  watch: {
    // Actualizar eventos del calendario cuando cambian los anuncios
    anuncios: {
      handler() {
        this.actualizarEventosCalendario();
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.getAnuncios();
  },
  methods: {
    async loadUserData() {
      this.loading = true;
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          console.log("📦 Datos del usuario completos:", userData);
          
          let tipoDetectado = '';
          
          if (userData.tipo_usuario === 'organizacion') {
            tipoDetectado = 'organizacion';
            console.log("✅ Detectado por tipo_usuario: ORGANIZACIÓN");
          } 
          else if (userData.tipo_usuario === 'dependencia') {
            tipoDetectado = 'dependencia';
            console.log("✅ Detectado por tipo_usuario: DEPENDENCIA");
          }
          else if (userData.tipo_usuario === 'persona') {
            tipoDetectado = userData.tipo_miembro || 'Estudiante';
            console.log("✅ Detectado por tipo_usuario: PERSONA -", tipoDetectado);
          }
          else {
            if (userData.rif) {
              tipoDetectado = 'organizacion';
              console.log("⚠️ Detectado por RIF: ORGANIZACIÓN (sin tipo_usuario)");
            } 
            else if (userData.nombre_institucional && !userData.ci) {
              tipoDetectado = 'dependencia';
              console.log("⚠️ Detectado por nombre_institucional: DEPENDENCIA (sin tipo_usuario)");
            }
            else if (userData.ci || userData.nombres) {
              tipoDetectado = userData.tipo_miembro || 'Estudiante';
              console.log("⚠️ Detectado por CI/nombres: PERSONA (sin tipo_usuario)");
            }
          }
          
          this.user = {
            email: userData.email,
            nombre_usuario: userData.nombre_usuario || userData.nombre_institucional || userData.nombre || 'Usuario',
            tipo_rol: tipoDetectado
          };
          
          console.log("✅ Usuario final configurado:", this.user);
        } else {
          console.warn('⚠ No hay usuario en localStorage');
          this.$router.push('/principalview');
        }
      } catch (err) {
        console.error("❌ Error cargando usuario:", err);
      } finally {
        this.loading = false;
      }
    },

    async getAnuncios() {
      try {
        let rolParaFiltro = this.user.tipo_rol;
        
        if (this.user.tipo_rol === 'organizacion' || this.user.tipo_rol === 'dependencia') {
          const res = await axios.get('http://localhost:3000/api/announcements', {
            params: { creador_email: this.user.email }
          });
          this.anuncios = res.data;
        } else {
          const res = await axios.get('http://localhost:3000/api/announcements', {
            params: { mi_rol: rolParaFiltro }
          });
          this.anuncios = res.data;
        }
        
        console.log("📢 Anuncios cargados:", this.anuncios.length);
      } catch (e) {
        console.error("Error cargando anuncios:", e);
      }
    },

    async submit() {
      if (!this.announceForm.destinatarios.length) {
        alert("Selecciona al menos un destinatario");
        return;
      }
      
      if (!this.announceForm.titulo.trim() || !this.announceForm.contenido.trim()) {
        alert("Completa el título y contenido del anuncio");
        return;
      }
      
      if (this.announceForm.fecha_expiracion) {
        const fechaExp = new Date(this.announceForm.fecha_expiracion);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaExp < hoy) {
          alert("La fecha de expiración no puede ser anterior a hoy");
          return;
        }
      }
      
      this.saving = true;
      try {
        const ahora = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        let fecha_exp = null;
        if (this.announceForm.fecha_expiracion) {
          fecha_exp = new Date(this.announceForm.fecha_expiracion).toISOString().slice(0, 19).replace('T', ' ');
        }
        
        const data = {
          titulo: this.announceForm.titulo,
          contenido: this.announceForm.contenido,
          tipo_anuncio: this.announceForm.tipo_anuncio,
          prioridad: this.announceForm.prioridad,
          creador_email: this.user.email,
          creador_tipo: this.user.tipo_rol,
          fecha_publicacion: ahora,
          fecha_expiracion: fecha_exp,
          destinatarios: this.announceForm.destinatarios
        };
        
        console.log("📤 Enviando anuncio:", data);
        
        const res = await axios.post('http://localhost:3000/api/announcements', data);
        
        if (res.data.success) {
          this.announceForm = {
            titulo: '',
            contenido: '',
            prioridad: 'media',
            tipo_anuncio: 'informativo',
            fecha_expiracion: '',
            destinatarios: []
          };
          
          alert('¡Anuncio publicado exitosamente!');
          await this.getAnuncios();
        } else {
          alert(res.data.error || "Error al publicar el anuncio");
        }
      } catch (e) {
        console.error("Error publicando anuncio:", e);
        console.error("Respuesta del servidor:", e.response?.data);
        alert(e.response?.data?.error || "Error al publicar el anuncio");
      } finally {
        this.saving = false;
      }
    },

    // NUEVOS MÉTODOS PARA EL CALENDARIO
    actualizarEventosCalendario() {
      this.calendarOptions.events = this.anuncios.map(ann => {
        // Determinar color según prioridad
        let color = '#3498db'; // azul por defecto (media)
        if (ann.prioridad === 'urgente') color = '#e74c3c'; // rojo
        else if (ann.prioridad === 'alta') color = '#f39c12'; // naranja
        else if (ann.prioridad === 'baja') color = '#95a5a6'; // gris

        return {
          title: ann.titulo,
          start: ann.fecha_publicacion,
          end: ann.fecha_expiracion || undefined,
          color: color,
          extendedProps: {
            contenido: ann.contenido,
            prioridad: ann.prioridad,
            tipo: ann.tipo_anuncio,
            creador: ann.creador_email,
            destinatarios: ann.destinatarios_lista
          }
        };
      });
    },

    handleEventClick(info) {
      const props = info.event.extendedProps;
      const fechaInicio = new Date(info.event.start).toLocaleDateString('es-ES');
      const fechaFin = info.event.end ? new Date(info.event.end).toLocaleDateString('es-ES') : 'Sin expiración';
      
      alert(`
🔔 ${info.event.title}

📝 ${props.contenido}

⚠️ Prioridad: ${props.prioridad.toUpperCase()}
🏷️ Tipo: ${props.tipo}
👤 Creador: ${props.creador}
📅 Desde: ${fechaInicio}
📅 Hasta: ${fechaFin}
🎯 Dirigido a: ${props.destinatarios ? props.destinatarios.join(', ') : 'Todos'}
      `);
    },

    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
};
</script>

<style scoped>
.feed-container { 
  margin-top: 70px; 
  min-height: 100vh; 
  background: #f5f8fa; 
  padding: 20px 0; 
}

.main-layout { 
  display: flex; 
  gap: 20px; 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 15px; 
}

.sidebar-stats { 
  flex: 0 0 280px; 
  height: fit-content; 
  position: sticky; 
  top: 80px; 
}

.feed-content { 
  flex: 1; 
}

.panel { 
  background: white; 
  border-radius: 12px; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  margin-bottom: 20px; 
  padding: 20px; 
}

.loading-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.loading-state i {
  margin-right: 10px;
  color: #007bff;
}

.announcement-nav {
  text-align: center;
}

.icon-main { 
  font-size: 2.5rem; 
  color: #007bff; 
  margin-bottom: 10px; 
}

.announcement-nav h2 {
  margin: 10px 0 5px;
  color: #333;
}

.announcement-nav p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.announcement-nav hr {
  border: none;
  border-top: 1px solid #e1e8ed;
  margin: 15px 0;
}

/* ESTILOS DE LAS PESTAÑAS */
.view-tabs {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.view-tabs button {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-tabs button i {
  font-size: 14px;
}

.view-tabs button:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.view-tabs button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.user-context-box { 
  background: #f8f9fa; 
  padding: 15px; 
  border-radius: 8px; 
  margin-top: 15px; 
}

.user-context-box small {
  display: block;
  color: #666;
  font-size: 11px;
  margin-bottom: 5px;
}

.user-context-box strong {
  display: block;
  color: #333;
  font-size: 16px;
  margin-bottom: 8px;
}

.role-tag { 
  display: inline-block; 
  background: #007bff; 
  color: white; 
  padding: 4px 12px; 
  border-radius: 12px; 
  font-size: 11px; 
  font-weight: bold; 
}

.announce-form h3 {
  margin: 0 0 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-title { 
  width: 100%; 
  padding: 12px; 
  border: 1px solid #ddd; 
  border-radius: 8px; 
  margin-bottom: 15px; 
  font-weight: bold; 
  font-size: 16px;
}

.announce-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  margin-bottom: 15px;
  font-family: inherit;
}

.post-actions-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 15px;
}

.selectors {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.selectors select,
.selectors input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.destinatarios-section { 
  background: #f1f3f5; 
  padding: 15px; 
  border-radius: 8px; 
  margin-bottom: 15px; 
}

.destinatarios-section p {
  margin: 0 0 10px;
  font-weight: bold;
}

.check-group { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 15px; 
}

.check-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.check-group input[type="checkbox"] {
  cursor: pointer;
}

.btn-publish {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-publish:hover:not(:disabled) {
  background: #0056b3;
}

.btn-publish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.post-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.post-card.urgente { 
  border-left: 6px solid #e74c3c; 
}

.post-card.alta {
  border-left: 6px solid #f39c12;
}

.post-card.media {
  border-left: 6px solid #3498db;
}

.post-header {
  margin-bottom: 15px;
}

.user-meta h3 {
  margin: 5px 0 8px;
  color: #333;
  font-size: 20px;
}

.user-meta small {
  color: #999;
  font-size: 13px;
}

.priority-badge { 
  display: inline-block;
  font-size: 10px; 
  color: #666; 
  font-weight: bold; 
  background: #e9ecef;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.post-body {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
  font-size: 14px;
  color: #666;
}

.post-footer i {
  margin-right: 5px;
}

.type-label { 
  background: #e3f2fd; 
  color: #1976d2; 
  padding: 4px 12px; 
  border-radius: 4px; 
  font-size: 12px; 
  font-weight: bold;
}

.metrics-bar {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f2f5;
  border-bottom: 1px solid #f0f2f5;
  margin: 10px 0;
  font-size: 13px;
  color: #666;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-item i {
  color: #999;
  font-size: 14px;
}

.metric-item:hover {
  color: #007bff;
}

.metric-item:hover i {
  color: #007bff;
}

/* ESTILOS DEL CALENDARIO */
.calendar-container h3 {
  margin: 0 0 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Estilos para personalizar FullCalendar */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-button) {
  background: #007bff !important;
  border-color: #007bff !important;
  text-transform: capitalize;
}

:deep(.fc-button:hover) {
  background: #0056b3 !important;
}

:deep(.fc-button-active) {
  background: #0056b3 !important;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 600;
}

:deep(.fc-daygrid-event:hover) {
  opacity: 0.8;
}

:deep(.fc-col-header-cell) {
  background: #f8f9fa;
  font-weight: 600;
  padding: 10px 0;
}

:deep(.fc-day-today) {
  background: #e3f2fd !important;
}

@import '@fullcalendar/core/main.css';
@import '@fullcalendar/daygrid/main.css';
</style>