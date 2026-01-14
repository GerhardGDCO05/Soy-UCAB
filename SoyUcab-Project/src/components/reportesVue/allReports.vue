<template>
  <div class="reports-page">
    <headerBar />
    
    <div class="reports-dashboard panel">
      <h1 class="dashboard-title">Reportes</h1>
      
      <div class="dashboard-grid">
        
        <div class="dashboard-card card-wide" @click="goToEvent()">
          <h3 class="card-title">Eventos del mes</h3>
        </div>
        
        <div class="dashboard-card" @click="goToUsuarios()">
          <h3 class="card-title">Top usuarios</h3>
        </div>
        
        <div class="dashboard-card" @click="goToEmpresas()">
          <h3 class="card-title">Top empresas con más egresados</h3>
        </div>
        
        <div class="dashboard-card" @click="goToCarreras()">
          <h3 class="card-title">Top carreras</h3>
        </div>
        
        <div class="dashboard-card" @click="goToTutores()">
          <h3 class="card-title">Tutores del semestre</h3>
        </div>
        
        <div class="dashboard-card" @click="goToPromedios()">
          <h3 class="card-title">Mejores promedios</h3>
        </div>
        
        <div class="dashboard-card" @click="goToReconocimientos()">
          <h3 class="card-title">Reconocimientos a profesores</h3>
        </div>

        <div class="dashboard-card" @click="goToMapaEgresados()">
          <h3 class="card-title">Mapa de Egresados</h3>
        </div>
        
        <div class="dashboard-card" id="semaforo" @click="goToSemaforo()">
          <h3 class="card-title">Semáforo de pago</h3>
          <div class="card-content">
            <div class="traffic-light">
              <div class="light red" :class="{ active: paymentStatus === 'red' }"></div>
              <div class="light yellow" :class="{ active: paymentStatus === 'yellow' }"></div>
              <div class="light green" :class="{ active: paymentStatus === 'green' }"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '../header.vue'

export default {
  name: 'ReportsDashboard',
  components: {
    headerBar
  },
  data() {
    return {
      loading: false,
      error: null,
      paymentStatus: 'green' // Ejemplo de estado inicial
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      });
    },

    handleCardClick(cardType) {
      //this.$emit('card-click', cardType);
    },

    refreshData() {
      //this.$emit('refresh-data');
    },

    // Métodos de navegación respetando tus rutas
    goToEvent() {
      // Usamos this.$router para consistencia con Vue
      //this.$router.push('/events-report');
    },

    goToUsuarios() {
      this.$router.push('/reporte-top-usuarios');
    },

    goToEmpresas() {
      this.$router.push('/reporte-top-empresas');
    },

    goToCarreras() {
     this.$router.push('/reporte-top-carreras');
    },

    goToTutores() {
      this.$router.push('/tutores-report');
    },

    goToPromedios() {
      //this.$router.push('/averages-report');
    },

    goToReconocimientos() {
      this.$router.push('/reconocimiento-report');
    },

    goToMapaEgresados() {
      this.$router.push('/map-egresados');
    },

    goToSemaforo() {
     this.$router.push('/semaforo');
    }
  }
};
</script>


