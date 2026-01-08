<template>
  <div class="report-container">
    <headerBar />
    
    <div class="main-content">
      <div class="report-card panel">
        <div class="report-header">
          <i class="fas fa-building"></i>
          <h1>Top Empresas por Egresados Contratados</h1>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Cargando reporte...
        </div>

        <table v-else class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre de la Empresa</th>
              <th>Cantidad</th>
              <th>Nombres de Egresados</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(empresa, index) in empresas" :key="empresa.nombre_empresa">
              <td class="index-col">{{ index + 1 }}</td>
              <td class="name-col">{{ empresa.nombre_empresa }}</td>
              <td class="count-col">
                <span class="badge">{{ empresa.cantidad_egresados }}</span>
              </td>
              <td class="list-col">
                <small class="egresados-list">{{ empresa.egresados }}</small>
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
  name: 'TopEmpresas',
  components: { headerBar },
  data() {
    return {
      empresas: [],
      loading: true
    }
  },
  async mounted() {
    try {
      // Ajusta la URL según tu configuración de rutas
      const response = await axios.get('http://localhost:3000/api/reports/top-companies');
      if (response.data.success) {
        this.empresas = response.data.data;
      }
    } catch (error) {
      console.error("Error al cargar reporte de empresas:", error);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.report-container { background: #f0f2f5; min-height: 100vh; }
.main-content { max-width: 900px; margin: 30px auto; padding: 0 20px; }
.panel { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

.report-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 2px solid #f0f2f5; padding-bottom: 15px; }
.report-header i { font-size: 30px; color: #1da1f2; }
.report-header h1 { font-size: 22px; color: #14171a; margin: 0; }

.report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
.report-table th { text-align: left; padding: 12px; background: #f8f9fa; color: #657786; text-transform: uppercase; font-size: 11px; }
.report-table td { padding: 15px 12px; border-bottom: 1px solid #eee; vertical-align: middle; }

.index-col { font-weight: bold; color: #1da1f2; width: 40px; }
.name-col { font-weight: 600; color: #14171a; width: 250px; }
.count-col { width: 100px; text-align: center; }
.list-col { max-width: 300px; }

.egresados-list { color: #657786; font-style: italic; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.egresados-list:hover { white-space: normal; cursor: help; }

.badge { background: #1da1f2; color: white; padding: 5px 12px; border-radius: 15px; font-weight: bold; }
.btn-back { background: #657786; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
</style>