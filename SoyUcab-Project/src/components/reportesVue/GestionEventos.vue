<template>
  <div class="gestion-eventos-container">
    <headerBar />

    <div class="back-button">
      <button @click="$router.go(-1)" class="btn-back">
        <i class="fas fa-arrow-left"></i> Atrás
      </button>
    </div>

    <div class="content-wrapper">
      <div class="header-section">
        <h1><i class="fas fa-calendar-check"></i> Gestión de Eventos Institucionales</h1>
        <p class="subtitle">Detalles completos, logística y gestión de participantes</p>
      </div>

      <div class="controls-section">
        <div class="filter-group">
          <label for="limitSelect">Mostrar eventos:</label>
          <select v-model.number="limit" @change="fetchData" id="limitSelect" class="filter-select">
            <option :value="null">Sin límite</option>
            <option :value="5">5 eventos</option>
            <option :value="10">10 eventos</option>
            <option :value="15">15 eventos</option>
            <option :value="20">20 eventos</option>
          </select>
        </div>
        <button @click="fetchData" class="btn-refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Actualizar
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando datos de eventos...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="btn-retry">Reintentar</button>
      </div>

      <div v-else-if="eventos.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No hay eventos registrados</p>
      </div>

      <div v-else class="eventos-list">
        <div v-for="(evento, index) in eventos" :key="index" class="evento-card">
          <!-- Encabezado del evento -->
          <div class="evento-header">
            <div class="titulo-seccion">
              <h2>{{ evento.titulo }}</h2>
              <span class="badge-estado" :class="`estado-${evento.estado_evento}`">
                {{ evento.estado_evento }}
              </span>
            </div>
          </div>

          <!-- Detalles básicos -->
          <div class="evento-detalles">
            <div class="detalle-item">
              <label><i class="fas fa-align-left"></i> Descripción:</label>
              <p>{{ evento.descripcion || 'N/A' }}</p>
            </div>
          </div>

          <!-- Información de categoría y modalidad -->
          <div class="info-row">
            <div class="info-item">
              <label><i class="fas fa-tag"></i> Categoría:</label>
              <span>{{ evento.categoria }}</span>
            </div>
            <div class="info-item">
              <label><i class="fas fa-broadcast-tower"></i> Modalidad:</label>
              <span>{{ evento.modalidad }}</span>
            </div>
          </div>

          <!-- Información logística -->
          <div class="seccion-logistica">
            <h3><i class="fas fa-map-marker-alt"></i> Información Logística</h3>
            <div class="logistica-grid">
              <div class="logistica-item">
                <label>Fecha y Hora:</label>
                <span>{{ formatDateTime(evento.fecha_hora_inicio) }}</span>
              </div>
              <div class="logistica-item">
                <label>Ubicación Física:</label>
                <span>{{ evento.lugar_fisico || evento.ubicacion_referencia || 'Virtual' }}</span>
              </div>
              <div class="logistica-item">
                <label>Capacidad Máxima:</label>
                <span>{{ evento.capacidad_maxima || 'Sin límite' }}</span>
              </div>
              <div class="logistica-item">
                <label>Enlace Virtual:</label>
                <span v-if="evento.enlace_virtual">
                  <a :href="evento.enlace_virtual" target="_blank" class="link-virtual">
                    <i class="fas fa-link"></i> Ver enlace
                  </a>
                </span>
                <span v-else>No disponible</span>
              </div>
            </div>
          </div>

          <!-- Gestión de participantes -->
          <div class="seccion-participantes">
            <h3><i class="fas fa-users"></i> Gestión de Participantes</h3>
            <div class="participantes-grid">
              <div class="participante-stat">
                <div class="stat-numero" :class="{ 'highlight': evento.total_inscritos > 0 }">
                  {{ evento.total_inscritos }}
                </div>
                <div class="stat-label">Inscritos</div>
              </div>
              <div class="participante-stat">
                <div class="stat-numero confirmado" :class="{ 'highlight': evento.total_confirmados > 0 }">
                  {{ evento.total_confirmados }}
                </div>
                <div class="stat-label">Confirmados</div>
              </div>
              <div class="participante-stat">
                <div class="stat-numero espera" :class="{ 'highlight': evento.total_lista_espera > 0 }">
                  {{ evento.total_lista_espera }}
                </div>
                <div class="stat-label">Lista de Espera</div>
              </div>
              <div class="participante-stat">
                <div class="stat-numero">
                  {{ evento.capacidad_maxima ? `${evento.total_confirmados}/${evento.capacidad_maxima}` : 'Ilimitado' }}
                </div>
                <div class="stat-label">Ocupación</div>
              </div>
            </div>
          </div>

          <!-- Relaciones institucionales -->
          <div class="seccion-relaciones">
            <h3><i class="fas fa-link"></i> Relaciones Institucionales</h3>
            <div class="relaciones-grid">
              <div class="relacion-item" v-if="evento.dependencias_organizadoras">
                <label>Dependencias UCAB:</label>
                <div class="relacion-valores">
                  <span v-for="dep in splitRelaciones(evento.dependencias_organizadoras)"
                        :key="dep"
                        class="badge-relacion">
                    {{ dep }}
                  </span>
                </div>
              </div>
              <div class="relacion-item" v-if="evento.organizaciones_asociadas">
                <label>Organizaciones Asociadas:</label>
                <div class="relacion-valores">
                  <span v-for="org in splitRelaciones(evento.organizaciones_asociadas)"
                        :key="org"
                        class="badge-relacion org">
                    {{ org }}
                  </span>
                </div>
              </div>
              <div class="relacion-item" v-if="!evento.dependencias_organizadoras && !evento.organizaciones_asociadas">
                <p class="sin-relaciones">Sin relaciones institucionales</p>
              </div>
            </div>
          </div>

          <!-- Separador -->
          <div class="evento-separator"></div>
        </div>
      </div>

      <!-- Resumen General -->
      <div v-if="!loading && eventos.length > 0" class="summary-section">
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total de Eventos</h3>
            <p class="summary-value">{{ eventos.length }}</p>
          </div>
          <div class="summary-card">
            <h3>Total Inscritos</h3>
            <p class="summary-value">{{ totalInscritos }}</p>
          </div>
          <div class="summary-card">
            <h3>Confirmados</h3>
            <p class="summary-value confirmado">{{ totalConfirmados }}</p>
          </div>
          <div class="summary-card">
            <h3>En Espera</h3>
            <p class="summary-value espera">{{ totalEnEspera }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue';
import axios from 'axios';

export default {
  name: 'GestionEventos',
  components: {
    headerBar
  },
  data() {
    return {
      eventos: [],
      loading: false,
      error: null,
      limit: null
    };
  },
  computed: {
    totalInscritos() {
      return this.eventos.reduce((sum, evt) => sum + (evt.total_inscritos || 0), 0);
    },
    totalConfirmados() {
      return this.eventos.reduce((sum, evt) => sum + (evt.total_confirmados || 0), 0);
    },
    totalEnEspera() {
      return this.eventos.reduce((sum, evt) => sum + (evt.total_lista_espera || 0), 0);
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        // Usar nuevo endpoint de eventos detalles
        let url = 'http://localhost:3000/api/reports/eventos-detalles';
        if (this.limit) {
          url += `?limit=${this.limit}`;
        }

        const response = await axios.get(url);

        if (response.data.success) {
          this.eventos = response.data.data || [];
        } else {
          this.error = response.data.error || 'Error al obtener los datos';
        }
      } catch (err) {
        console.error('Error fetching eventos:', err);
        this.error = 'Error al conectar con el servidor';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    splitRelaciones(texto) {
      if (!texto) return [];
      return texto.split(', ').filter(item => item.trim() !== '');
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
@import '../../assets/reportes/gestionEventos.css';
</style>
