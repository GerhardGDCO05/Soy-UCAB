<template>
  <div class="top-promedios-container">
    <headerBar />

    <div class="back-button">
      <button @click="$router.go(-1)" class="btn-back">
        <i class="fas fa-arrow-left"></i> Atrás
      </button>
    </div>

    <div class="content-wrapper">
      <div class="header-section">
        <h1><i class="fas fa-graduation-cap"></i> Mejores Promedios por Facultad</h1>
        <p class="subtitle">Estudiantes con los promedios más altos de cada facultad</p>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="facultadSelect">Filtrar por Facultad:</label>
          <select
            v-model="selectedFacultad"
            @change="fetchData"
            id="facultadSelect"
            class="filter-select"
          >
            <option value="">Todas las facultades</option>
            <option v-for="fac in facultades" :key="fac" :value="fac">
              {{ fac }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="limitSelect">Cantidad por Facultad:</label>
          <select v-model.number="limit" @change="fetchData" id="limitSelect" class="filter-select">
            <option :value="5">5 estudiantes</option>
            <option :value="10">10 estudiantes</option>
            <option :value="15">15 estudiantes</option>
            <option :value="20">20 estudiantes</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="minPromedioInput">Promedio Mínimo:</label>
          <input
            v-model.number="minPromedio"
            @input="validatePromedioInput"
            @keydown="preventInvalidKeys"
            @change="fetchData"
            @blur="sanitizePromedio"
            id="minPromedioInput"
            type="number"
            min="0"
            max="20"
            step="0.5"
            class="filter-input"
            placeholder="0"
          />
        </div>

        <button @click="fetchData" class="btn-refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Actualizar
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando datos de estudiantes...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchData" class="btn-retry">Reintentar</button>
      </div>

      <div v-else-if="facultadesData.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <p>No se encontraron estudiantes con los criterios especificados</p>
      </div>

      <div v-else class="facultades-grid">
        <div v-for="facultad in facultadesData" :key="facultad.facultad" class="facultad-card">
          <div class="card-header">
            <h2>{{ facultad.facultad }}</h2>
            <span class="total-estudiantes">{{ facultad.total_estudiantes }} estudiantes</span>
          </div>

          <div class="card-stats">
            <div class="stat">
              <span class="stat-label">Promedio Máximo</span>
              <span class="stat-value">{{ formatPromedio(facultad.promedio_maximo) }}</span>
            </div>
          </div>

          <div class="estudiantes-list">
            <div
              v-for="(estudiante, index) in facultad.estudiantes"
              :key="index"
              class="estudiante-item"
            >
              <div class="ranking-badge">
                <span :class="getRankingClass(estudiante.ranking)">
                  {{ estudiante.ranking }}º
                </span>
              </div>

              <div class="estudiante-info">
                <h3>{{ estudiante.nombre }}</h3>
                <p class="carrera">{{ estudiante.carrera }}</p>
                <p class="semestre">Semestre: {{ estudiante.semestre }}</p>
              </div>

              <div class="promedio-badge" :class="getPromedioClass(estudiante.promedio)">
                <span class="promedio-value">{{ formatPromedio(estudiante.promedio) }}</span>
                <span class="promedio-label">Promedio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && facultadesData.length > 0" class="summary-section">
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total de Facultades</h3>
            <p class="summary-value">{{ facultadesData.length }}</p>
          </div>
          <div class="summary-card">
            <h3>Total de Estudiantes</h3>
            <p class="summary-value">{{ totalEstudiantes }}</p>
          </div>
          <div class="summary-card">
            <h3>Promedio General</h3>
            <p class="summary-value">{{ formatPromedio(promedioGeneral) }}</p>
          </div>
          <div class="summary-card">
            <h3>Promedio Máximo</h3>
            <p class="summary-value">{{ formatPromedio(promedioMaximo) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from "@/components/header.vue";
import axios from "axios";

export default {
  name: "TopPromediosFacultad",
  components: {
    headerBar,
  },
  data() {
    return {
      facultadesData: [],
      facultades: [],
      loading: false,
      error: null,
      selectedFacultad: "",
      limit: 10,
      minPromedio: 0,
    };
  },
  computed: {
    totalEstudiantes() {
      return this.facultadesData.reduce((sum, fac) => sum + (fac.total_estudiantes || 0), 0);
    },
    promedioGeneral() {
      if (this.totalEstudiantes === 0) return 0;
      const sumPromedios = this.facultadesData.reduce((sum, fac) => {
        return sum + fac.estudiantes.reduce((facSum, est) => facSum + parseFloat(est.promedio), 0);
      }, 0);
      return (sumPromedios / this.totalEstudiantes).toFixed(2);
    },
    promedioMaximo() {
      if (this.facultadesData.length === 0) return 0;
      return Math.max(...this.facultadesData.map((fac) => parseFloat(fac.promedio_maximo)));
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        const params = new URLSearchParams();
        params.append("limit", this.limit);
        params.append("minPromedio", this.minPromedio);
        if (this.selectedFacultad) {
          params.append("facultad", this.selectedFacultad);
        }

        const response = await axios.get(
          `http://localhost:3000/api/reports/top-promedios-facultad?${params.toString()}`
        );

        if (response.data.success) {
          this.facultadesData = response.data.data || [];
          // Extract unique facultades for filter dropdown
          if (this.facultades.length === 0 && this.facultadesData.length > 0) {
            this.facultades = this.facultadesData.map((f) => f.facultad).sort();
          }
        } else {
          this.error = response.data.error || "Error al obtener los datos";
        }
      } catch (err) {
        console.error("Error fetching top promedios:", err);
        this.error = "Error al conectar con el servidor";
      } finally {
        this.loading = false;
      }
    },
    formatPromedio(value) {
      if (!value) return "N/A";
      return parseFloat(value).toFixed(2);
    },
    getRankingClass(ranking) {
      if (ranking === 1) return "ranking-first";
      if (ranking === 2) return "ranking-second";
      if (ranking === 3) return "ranking-third";
      return "ranking-other";
    },
    getPromedioClass(promedio) {
      const prom = parseFloat(promedio);
      if (prom >= 18) return "promedio-excellent";
      if (prom >= 16) return "promedio-good";
      if (prom >= 14) return "promedio-fair";
      return "promedio-regular";
    },
    // Validar entrada de promedio: solo números positivos entre 0 y 20
    validatePromedioInput(event) {
      const value = event.target.value;

      // Si está vacío, permitir (se reseteará a 0)
      if (value === "" || value === null || value === undefined) {
        return;
      }

      // Convertir a número
      const numValue = parseFloat(value);

      // Si no es un número válido, limpiar el campo
      if (isNaN(numValue)) {
        this.minPromedio = 0;
        event.target.value = "0";
        return;
      }

      // Asegurar que esté en el rango 0-20
      if (numValue < 0) {
        this.minPromedio = 0;
        event.target.value = "0";
      } else if (numValue > 20) {
        this.minPromedio = 20;
        event.target.value = "20";
      } else {
        this.minPromedio = numValue;
      }
    },
    // Prevenir teclas no válidas (letras, símbolos, signos negativos)
    preventInvalidKeys(event) {
      const key = event.key;
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      // Permitir teclas de control
      if (allowedKeys.includes(key)) {
        return;
      }

      // Permitir Ctrl/Cmd + A, C, V, X (copiar, pegar, etc.)
      if (event.ctrlKey || event.metaKey) {
        if (["a", "c", "v", "x"].includes(key.toLowerCase())) {
          return;
        }
      }

      // Permitir solo números y punto decimal
      const isNumber = /^[0-9]$/.test(key);
      const isDecimal = key === "." || key === ",";

      // Si no es número ni punto decimal, prevenir
      if (!isNumber && !isDecimal) {
        event.preventDefault();
        return;
      }

      // Si es punto decimal, verificar que no haya ya uno
      if (isDecimal) {
        const currentValue = event.target.value;
        if (currentValue.includes(".") || currentValue.includes(",")) {
          event.preventDefault();
        }
      }

      // Prevenir signo negativo
      if (key === "-" || key === "+") {
        event.preventDefault();
      }
    },
    // Sanitizar el valor cuando el campo pierde el foco
    sanitizePromedio(event) {
      const value = event.target.value;

      // Si está vacío o no es válido, establecer a 0
      if (value === "" || value === null || value === undefined || isNaN(parseFloat(value))) {
        this.minPromedio = 0;
        event.target.value = "0";
        return;
      }

      const numValue = parseFloat(value);

      // Asegurar rango 0-20
      if (numValue < 0) {
        this.minPromedio = 0;
        event.target.value = "0";
      } else if (numValue > 20) {
        this.minPromedio = 20;
        event.target.value = "20";
      } else {
        // Redondear a 0.5 si es necesario
        this.minPromedio = Math.max(0, Math.min(20, numValue));
        event.target.value = this.minPromedio.toString();
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
@import "../../assets/reportes/topPromediosFacultad.css";
</style>
