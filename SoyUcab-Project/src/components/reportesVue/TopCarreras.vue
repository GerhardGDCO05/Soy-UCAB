<template>
  <div class="report-container">
    <headerBar />
    
    <div class="main-content">
      <div class="report-card panel">
        <div class="report-header">
          <i class="fas fa-chart-bar"></i>
          <h1>Top 10 Carreras con más Estudiantes</h1>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Cargando reporte...
        </div>

        <table v-else class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Carrera / Programa</th>
              <th>Total Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(carrera, index) in carreras" :key="carrera.nombre_carrera">
              <td class="index-col">{{ index + 1 }}</td>
              <td class="name-col">{{ carrera.nombre_carrera }}</td>
              <td class="count-col">
                <span class="badge">{{ carrera.total_estudiantes_registrados }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
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
  name: 'TopCarreras',
  components: { headerBar },
  data() {
    return {
      carreras: [],
      loading: true
    }
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:3000/api/reports/top-carreras');
      if (response.data.success) {
        this.carreras = response.data.data;
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.report-container { background: #f0f2f5; min-height: 100vh; }
.main-content { max-width: 800px; margin: 30px auto; padding: 0 20px; }
.panel { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

.report-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 2px solid #f0f2f5; padding-bottom: 15px; }
.report-header i { font-size: 30px; color: #1da1f2; }
.report-header h1 { font-size: 22px; color: #14171a; margin: 0; }

.report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.report-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #657786; text-transform: uppercase; font-size: 12px; }
.report-table td { padding: 15px 12px; border-bottom: 1px solid #eee; }

.index-col { font-weight: bold; color: #1da1f2; width: 50px; }
.name-col { font-weight: 500; color: #14171a; }
.count-col { text-align: right; width: 150px; }

.badge { background: #e8f5fe; color: #1da1f2; padding: 6px 12px; border-radius: 20px; font-weight: bold; }
.btn-back { background: #657786; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px; }
.btn-back:hover { background: #4b5963; }
</style>