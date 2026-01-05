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
            :class="{ 'unread': n.estado === 'pendiente' }"
          >
            <div class="notif-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="notif-body">
              <p>
                <strong>@{{ n.nombre_usuario }}</strong> {{ n.contenido }}
              </p>
              <small>{{ formatDate(n.fecha_hora) }}</small>
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
    async markAllAsRead() {
        // Aquí llamarías a un endpoint para cambiar el estado en la BD
        this.notifications.forEach(n => n.estado = 'leida');
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
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
.notifications-container { background: #f0f2f5; min-height: 100vh; }
.main-layout { max-width: 800px; margin: 20px auto; padding: 0 15px; }
.notifications-content { background: white; border-radius: 12px; padding: 0; overflow: hidden; }
.notif-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.notif-item { display: flex; gap: 15px; padding: 15px 20px; border-bottom: 1px solid #f0f2f5; transition: background 0.2s; }
.notif-item.unread { background: #f0f7ff; border-left: 4px solid #1da1f2; }
.notif-item:hover { background: #f8f9fa; }
.notif-avatar { font-size: 40px; color: #ccd6dd; }
.notif-body p { margin: 0; font-size: 1rem; }
.notif-body small { color: #657786; }
.btn-link { background: none; border: none; color: #1da1f2; cursor: pointer; font-weight: bold; }
</style>