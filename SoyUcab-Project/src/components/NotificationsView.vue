<template>
  <div class="notifications-container">
    <headerBar />
    <div class="main-layout">
      <main class="notifications-content panel">
        <div class="notif-header">
          <h2>Notificaciones</h2>
          <button @click="markAllAsRead" class="btn-link">Marcar todas como leídas</button>
        </div>

        <div v-if="loading" class="loading">Cargando...</div>

        <div v-else-if="notifications.length === 0" class="no-notifs">
          No tienes actividad reciente.
        </div>

        <div v-else class="notif-list">
          <div 
            v-for="n in notifications" 
            :key="n.fecha_hora" 
            class="notif-item" 
            :class="{ 'unread': n.estado === 'pendiente', 'clickable': isClickable(n) }"
            @click="handleNotificationClick(n)"
          >
            <div class="notif-avatar">
              <i :class="getNotifIcon(n)"></i>
            </div>
            <div class="notif-body">
              <p>
                <strong>@{{ n.nombre_usuario }}</strong> {{ n.contenido }}
              </p>
              <small>{{ formatDate(n.fecha_hora) }}</small>
            </div>
            <div v-if="isClickable(n)" class="notif-action">
              <i class="fas fa-chevron-right"></i>
            </div>
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
  name: 'NotificationsView',
  components: { headerBar },
  data() {
    return {
      notifications: [],
      loading: false,
      userEmail: ''
    }
  },
  methods: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const res = await axios.get(`http://localhost:3000/api/interactions/notifications/${this.userEmail}`);
        if (res.data.success) {
          this.notifications = res.data.data;
        }
      } catch (e) {
        console.error("Error al cargar notificaciones", e);
      } finally {
        this.loading = false;
      }
    },

    isClickable(notif) {
      // Es clickable si tiene metadata con información del post
      return notif.metadata && 
             (notif.metadata.post_email || notif.tipo_notificacion === 'publicacion');
    },

    async handleNotificationClick(notif) {
      // Si no es clickable, no hacer nada
      if (!this.isClickable(notif)) return;

      try {
        // Marcar como leída
        await this.markAsRead(notif);

        // Si tiene metadata del post, redirigir
        if (notif.metadata && notif.metadata.post_email && notif.metadata.post_fecha) {
          this.$router.push({
            name: 'PostView',
            params: {
              email: notif.metadata.post_email,
              fecha: encodeURIComponent(notif.metadata.post_fecha)
            }
          });
        } else if (notif.tipo_notificacion === 'publicacion') {
          // Si es notificación de publicación pero no tiene metadata,
          // redirigir al feed principal
          this.$router.push('/');
        }
      } catch (e) {
        console.error("Error manejando click en notificación:", e);
      }
    },

    async markAsRead(notif) {
      try {
        // Actualizar localmente
        notif.estado = 'leida';

        // Actualizar en el servidor
        await axios.put(
          `http://localhost:3000/api/interactions/notifications/${this.userEmail}/mark-read`,
          { fecha_hora: notif.fecha_hora }
        );
      } catch (e) {
        console.error("Error marcando notificación como leída:", e);
      }
    },

    async markAllAsRead() {
      try {
        await axios.put(
          `http://localhost:3000/api/interactions/notifications/${this.userEmail}/mark-all-read`
        );
        
        // Actualizar localmente
        this.notifications.forEach(n => n.estado = 'leida');
        
        alert("Todas las notificaciones marcadas como leídas");
      } catch (e) {
        console.error("Error marcando todas como leídas:", e);
        alert("Error al marcar notificaciones");
      }
    },

    getNotifIcon(notif) {
      const icons = {
        'publicacion': 'fas fa-share-square',
        'comentario': 'fas fa-comment',
        'like': 'fas fa-heart',
        'seguimiento': 'fas fa-user-plus',
        'grupo': 'fas fa-users'
      };
      
      // Si tiene metadata de post compartido, usar icono de compartir
      if (notif.metadata && notif.metadata.post_email) {
        return 'fas fa-share-square';
      }
      
      return icons[notif.tipo_notificacion] || 'fas fa-bell';
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `Hace ${minutes}m`;
      if (hours < 24) return `Hace ${hours}h`;
      if (days < 7) return `Hace ${days}d`;
      return d.toLocaleDateString();
    }
  },
  mounted() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      this.userEmail = userData.email;
      this.fetchNotifications();
    }
  }
}
</script>

<style scoped>
.notifications-container { background: #f0f2f5; min-height: 100vh; padding-top: 20px; }
.main-layout { max-width: 800px; margin: 20px auto; padding: 0 15px; }
.notifications-content { background: white; border-radius: 12px; padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.notif-header { 
  padding: 20px; 
  border-bottom: 1px solid #eee; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.notif-header h2 {
  margin: 0;
  font-size: 20px;
  color: #14171a;
}

.loading, .no-notifs {
  text-align: center;
  padding: 60px 20px;
  color: #657786;
  font-size: 16px;
}

.notif-item { 
  display: flex; 
  gap: 15px; 
  padding: 15px 20px; 
  border-bottom: 1px solid #f0f2f5; 
  transition: background 0.2s;
  position: relative;
}

.notif-item.clickable {
  cursor: pointer;
}

.notif-item.clickable:hover {
  background: #f8f9fa;
}

.notif-item.unread { 
  background: #f0f7ff; 
  border-left: 4px solid #1da1f2; 
}

.notif-avatar { 
  font-size: 40px; 
  color: #1da1f2;
  flex-shrink: 0;
}

.notif-body { 
  flex: 1;
}

.notif-body p { 
  margin: 0 0 5px 0; 
  font-size: 15px; 
  line-height: 1.4;
  color: #14171a;
}

.notif-body strong { 
  color: #1da1f2; 
  font-weight: 600;
}

.notif-body small { 
  color: #657786; 
  font-size: 13px;
}

.notif-action {
  display: flex;
  align-items: center;
  color: #657786;
  font-size: 14px;
}

.btn-link { 
  background: none; 
  border: none; 
  color: #1da1f2; 
  cursor: pointer; 
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #1a8cd8;
  text-decoration: underline;
}
</style>