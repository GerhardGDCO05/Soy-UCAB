<template>
  <div class="report-container">
    <headerBar />
    
    <div class="main-content">
      <div class="report-card panel">
        <div class="report-header">
          <i class="fas fa-trophy"></i>
          <h1>Top 10 Usuarios con más Likes</h1>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Cargando ranking...
        </div>

        <div v-else class="ranking-list">
          <div v-for="(user, index) in users" :key="index" class="user-rank-item">
            <div class="rank-badge" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            
            <div class="user-info">
              <span class="user-name">{{ user.nombre_publicador }}</span>
              <span class="user-role">{{ user.rol_institucional_actual || 'Miembro' }}</span>
            </div>

            <div class="likes-count">
              <i class="fas fa-heart"></i>
              <span>{{ user.total_likes_recibidos }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button @click="$router.go(-1)" class="btn-back">Volver</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'

export default {
  name: 'TopUsuarios',
  components: { headerBar },
  data() {
    return {
      users: [],
      loading: true
    }
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:3000/api/reports/top-users');
      if (response.data.success) {
        this.users = response.data.data;
      }
    } catch (error) {
      console.error("Error cargando reporte:", error);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.report-container { background: #f0f2f5; min-height: 100vh; }
.main-content { max-width: 700px; margin: 30px auto; padding: 0 20px; }
.panel { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }

.report-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.report-header i { color: #ffad1f; font-size: 35px; }
.report-header h1 { font-size: 24px; margin: 0; color: #14171a; }

.user-rank-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fff;
  border: 1px solid #f0f2f5;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: transform 0.2s;
}
.user-rank-item:hover { transform: scale(1.02); background: #f8f9fa; }

.rank-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  background: #f0f2f5;
}
.rank-1 { background: #ffd700; color: #fff; } /* Oro */
.rank-2 { background: #c0c0c0; color: #fff; } /* Plata */
.rank-3 { background: #cd7f32; color: #fff; } /* Bronce */

.user-info { flex-grow: 1; display: flex; flex-direction: column; }
.user-name { font-weight: bold; color: #14171a; font-size: 16px; }
.user-role { font-size: 13px; color: #657786; }

.likes-count { display: flex; align-items: center; gap: 8px; color: #e0245e; font-weight: bold; font-size: 18px; }

.btn-back { margin-top: 20px; padding: 10px 25px; border-radius: 20px; border: none; background: #1da1f2; color: white; cursor: pointer; }
</style>