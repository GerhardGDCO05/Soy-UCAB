<template>
  <div class="semaphore-container">
    <headerBar/>
    <!-- Encabezado -->
    <header class="semaphore-header">
      <h1 class="title">Reportes</h1>
      <h2 class="subtitle">Semáforo de pago</h2>
    </header>

    <!-- Selector de mes y año -->
    <div class="controls">
      <div class="month-year-selector">
        <button @click="previousMonth" class="nav-button">
          ←
        </button>
        <div class="current-month">
          <span class="month-name">{{ mesActual.toUpperCase() }}</span>
          <span class="year">{{ anioSeleccionado }}</span>
        </div>
        <button @click="nextMonth" class="nav-button">
          →
        </button>
      </div>
    </div>

    <!-- Tabla del semáforo -->
    <div class="calendar-container">
      <table class="semaphore-table">
        <thead>
          <tr class="weekdays-header">
            <th class="category-header">Concepto de Pago</th>
            <th class="day-header">DO</th>
            <th class="day-header">LUN</th>
            <th class="day-header">MAR</th>
            <th class="day-header">MIE</th>
            <th class="day-header">JUE</th>
            <th class="day-header">VIE</th>
            <th class="day-header">SAB</th>
          </tr>
        </thead>
        <tbody>
          <!-- Fila 1: Pago sin recargo -->
          <tr class="semaphore-row">
            <td class="category-cell">
              <div class="category-content">
                <div class="color-indicator green"></div>
                <span class="category-text">Pago sin recargo</span>
              </div>
            </td>
            <td 
              v-for="(dia, index) in primeraSemana" 
              :key="'primera-' + index"
              class="day-cell"
            >
              <div 
                v-if="dia"
                class="day-content"
                :class="getDayClasses(1, dia)"
              >
                <span class="day-number">{{ dia }}</span>
              </div>
            </td>
          </tr>

          <!-- Fila 2: Último día de pago sin recargo -->
          <tr class="semaphore-row">
            <td class="category-cell">
              <div class="category-content">
                <div class="color-indicator red"></div>
                <span class="category-text">Último día de pago sin recargo</span>
              </div>
            </td>
            <td 
              v-for="(dia, index) in segundaSemana" 
              :key="'segunda-' + index"
              class="day-cell"
            >
              <div 
                v-if="dia"
                class="day-content"
                :class="getDayClasses(2, dia)"
              >
                <span class="day-number">{{ dia }}</span>
              </div>
            </td>
          </tr>

          <!-- Fila 3: Pago con recargo (primera parte) -->
          <tr class="semaphore-row">
            <td class="category-cell" rowspan="3">
              <div class="category-content">
                <div class="color-indicator yellow"></div>
                <span class="category-text">Pago con recargo</span>
              </div>
            </td>
            <td 
              v-for="(dia, index) in terceraSemana" 
              :key="'tercera-' + index"
              class="day-cell"
            >
              <div 
                v-if="dia"
                class="day-content"
                :class="getDayClasses(3, dia)"
              >
                <span class="day-number">{{ dia }}</span>
              </div>
            </td>
          </tr>

          <!-- Fila 4: Pago con recargo (segunda parte) -->
          <tr class="semaphore-row">
            <td 
              v-for="(dia, index) in cuartaSemana" 
              :key="'cuarta-' + index"
              class="day-cell"
            >
              <div 
                v-if="dia"
                class="day-content"
                :class="getDayClasses(4, dia)"
              >
                <span class="day-number">{{ dia }}</span>
              </div>
            </td>
          </tr>

          <!-- Fila 5: Pago con recargo (tercera parte) -->
          <tr class="semaphore-row">
            <td 
              v-for="(dia, index) in quintaSemana" 
              :key="'quinta-' + index"
              class="day-cell"
            >
              <div 
                v-if="dia"
                class="day-content"
                :class="getDayClasses(5, dia)"
              >
                <span class="day-number">{{ dia }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Leyenda simplificada -->
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color green"></div>
        <span class="legend-text">Pago sin recargo</span>
      </div>
      <div class="legend-item">
        <div class="legend-color red"></div>
        <span class="legend-text">Último día sin recargo</span>
      </div>
      <div class="legend-item">
        <div class="legend-color yellow"></div>
        <span class="legend-text">Pago con recargo</span>
      </div>
      <div class="legend-item">
        <div class="legend-color gray"></div>
        <span class="legend-text">Fuera del semestre</span>
      </div>
    </div>

    <!-- Información del semestre -->
    <div v-if="mostrarInfoSemestre" class="semester-info">
      <div class="info-card" :class="getSemesterClass()">
        <h3 class="info-title">Semestre</h3>
        <p class="info-dates">{{ getSemesterDates() }}</p>
        <p class="info-note" v-if="esMesEspecial">
          En {{ mesActual.toLowerCase() }} los pagos sin recargo se extienden desde el día 25 hasta el 8 del mes siguiente.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import headerBar from '@/components/header.vue'

// Configuración de semestres
const SEMESTRES = {
  'Primer Semestre': {
    inicio: { mes: 8, dia: 25 }, // 25 de Septiembre (mes 8 = septiembre)
    fin: { mes: 0, dia: 18 }     // 18 de Enero (mes 0 = enero)
  },
  'Segundo Semestre': {
    inicio: { mes: 2, dia: 25 }, // 25 de Marzo (mes 2 = marzo)
    fin: { mes: 6, dia: 15 }     // 15 de Julio (mes 6 = julio)
  }
}

// Estado
const mesSeleccionado = ref(new Date().getMonth())
const anioSeleccionado = ref(new Date().getFullYear())

// Nombres de los meses
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Computed properties
const mesActual = computed(() => nombresMeses[mesSeleccionado.value])
const esMesEspecial = computed(() => mesSeleccionado.value === 2 || mesSeleccionado.value === 8) // Marzo o Septiembre

// Determinar si el mes está en algún semestre
const estaEnSemestre = computed(() => {
  const mes = mesSeleccionado.value
  const anio = anioSeleccionado.value
  
  // Verificar primer semestre (Septiembre a Enero)
  if (mes >= 8 || mes <= 0) { // Septiembre (8) a Enero (0)
    if (mes === 8) { // Septiembre
      // Solo días desde el 25 en adelante
      return true
    } else if (mes === 0) { // Enero
      // Solo días hasta el 18
      return true
    } else if (mes >= 9) { // Octubre, Noviembre, Diciembre
      return true
    }
  }
  
  // Verificar segundo semestre (Marzo a Julio)
  if (mes >= 2 && mes <= 6) { // Marzo (2) a Julio (6)
    if (mes === 2) { // Marzo
      // Solo días desde el 25 en adelante
      return true
    } else if (mes === 6) { // Julio
      // Solo días hasta el 15
      return true
    } else if (mes >= 3 && mes <= 5) { // Abril, Mayo, Junio
      return true
    }
  }
  
  return false
})

// Determinar semestre actual
const semestreActual = computed(() => {
  const mes = mesSeleccionado.value
  
  // Primer semestre: Septiembre a Enero
  if (mes >= 8 || mes <= 0) {
    return 'Primer Semestre'
  }
  
  // Segundo semestre: Marzo a Julio
  if (mes >= 2 && mes <= 6) {
    return 'Segundo Semestre'
  }
  
  return null
})

// Obtener días del mes
const getDiasDelMes = () => {
  return new Date(anioSeleccionado.value, mesSeleccionado.value + 1, 0).getDate()
}

// Determinar si un día específico está dentro del semestre
const diaEnSemestre = (dia) => {
  const mes = mesSeleccionado.value
  
  // Si el mes no está en semestre, todos los días son grises
  if (!estaEnSemestre.value) return false
  
  // Reglas específicas por mes
  switch (mes) {
    case 8: // Septiembre
      return dia >= 25
    case 0: // Enero
      return dia <= 18
    case 2: // Marzo
      return dia >= 25
    case 6: // Julio
      return dia <= 15
    default:
      return true // Abril, Mayo, Junio, Octubre, Noviembre, Diciembre
  }
}

// Obtener clases CSS para cada día
const getDayClasses = (fila, dia) => {
  const clases = ['day-inner']
  
  // Si no está en semestre, gris
  if (!diaEnSemestre(dia)) {
    clases.push('gray-day')
    return clases.join(' ')
  }
  
  const esMarzo = mesSeleccionado.value === 2
  const esSeptiembre = mesSeleccionado.value === 8
  
  // Lógica simplificada:
  // 1. Verde hasta el día 8
  // 2. Rojo en el día 9 (último día sin recargo)
  // 3. Amarillo del día 10 en adelante
  
  if (esMarzo || esSeptiembre) {
    // Meses especiales: verde del 25 al 8 del mes siguiente
    if ((dia >= 25 && dia <= 31) || (dia >= 1 && dia <= 8)) {
      clases.push('green-day')
    } else if (dia === 9) {
      clases.push('red-day')
    } else if (dia >= 10 && dia <= 24) {
      clases.push('yellow-day')
    }
  } else {
    // Otros meses: verde primeros 8 días
    if (dia <= 8) {
      clases.push('green-day')
    } else if (dia === 9) {
      clases.push('red-day')
    } else {
      clases.push('yellow-day')
    }
  }
  
  return clases.join(' ')
}

// Dividir días en semanas
const primeraSemana = computed(() => {
  const dias = getDiasDelMes()
  return Array.from({ length: 7 }, (_, i) => (i + 1 <= dias ? i + 1 : null))
})

const segundaSemana = computed(() => {
  const dias = getDiasDelMes()
  return Array.from({ length: 7 }, (_, i) => {
    const dia = i + 8
    return dia <= dias ? dia : null
  })
})

const terceraSemana = computed(() => {
  const dias = getDiasDelMes()
  return Array.from({ length: 7 }, (_, i) => {
    const dia = i + 15
    return dia <= dias ? dia : null
  })
})

const cuartaSemana = computed(() => {
  const dias = getDiasDelMes()
  return Array.from({ length: 7 }, (_, i) => {
    const dia = i + 22
    return dia <= dias ? dia : null
  })
})

const quintaSemana = computed(() => {
  const dias = getDiasDelMes()
  return Array.from({ length: 7 }, (_, i) => {
    const dia = i + 29
    return dia <= dias ? dia : null
  })
})

// Navegación
const previousMonth = () => {
  let nuevoMes = mesSeleccionado.value - 1
  let nuevoAnio = anioSeleccionado.value
  
  if (nuevoMes < 0) {
    nuevoMes = 11
    nuevoAnio--
  }
  
  mesSeleccionado.value = nuevoMes
  anioSeleccionado.value = nuevoAnio
}

const nextMonth = () => {
  let nuevoMes = mesSeleccionado.value + 1
  let nuevoAnio = anioSeleccionado.value
  
  if (nuevoMes > 11) {
    nuevoMes = 0
    nuevoAnio++
  }
  
  mesSeleccionado.value = nuevoMes
  anioSeleccionado.value = nuevoAnio
}

// Información del semestre
const mostrarInfoSemestre = computed(() => semestreActual.value !== null)

const getSemesterClass = () => {
  return semestreActual.value === 'Primer Semestre' ? 'first-semester' : 'second-semester'
}

const getSemesterName = () => {
  return semestreActual.value
}

const getSemesterDates = () => {
  if (!semestreActual.value) return ''
  
  const semestre = SEMESTRES[semestreActual.value]
  const mesInicio = nombresMeses[semestre.inicio.mes].toLowerCase()
  const mesFin = nombresMeses[semestre.fin.mes].toLowerCase()
  
  return `Del ${semestre.inicio.dia} de ${mesInicio} al ${semestre.fin.dia} de ${mesFin}`
}

// Estado del mes
const getMonthStatusClass = () => {
  if (!estaEnSemestre.value) return 'out-of-semester'
  return 'in-semester'
}

const getMonthStatusText = () => {
  if (!estaEnSemestre.value) {
    return `${mesActual} está fuera del período académico`
  }
  return `${mesActual} - ${semestreActual.value}`
}

onMounted(() => {
  // Inicialización si es necesario
})
</script>

<style scoped>
.semaphore-container {
  width: 100vw;
  height: 100vh;
  padding: min(2vw, 2rem);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: auto;
}

.semaphore-header {
  text-align: center;
  margin-bottom: min(3vh, 3rem);
}

.title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700;
  color: #dc2626;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: min(2vh, 2rem);
}

.month-year-selector {
  display: flex;
  align-items: center;
  gap: min(2vw, 2rem);
  background: white;
  padding: min(1vw, 1rem) min(2vw, 2rem);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nav-button {
  background: #f1f5f9;
  border: none;
  width: clamp(2.5rem, 6vw, 3rem);
  height: clamp(2.5rem, 6vw, 3rem);
  border-radius: 50%;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.current-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 12rem;
}

.month-name {
  font-size: clamp(1.3rem, 3.5vw, 1.8rem);
  font-weight: 700;
  color: #0f172a;
}

.year {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: #64748b;
  font-weight: 500;
}

.calendar-container {
  flex: 1;
  overflow: auto;
  margin-bottom: min(2vh, 2rem);
}

.semaphore-table {
  width: 100%;
  min-height: 60vh;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-collapse: collapse;
  table-layout: fixed;
}

.weekdays-header {
  background: #0f172a;
}

.category-header {
  width: 25%;
  padding: min(2vh, 1.5rem) min(1vw, 1rem);
  text-align: left;
  color: white;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  letter-spacing: 0.05em;
}

.day-header {
  width: calc(75% / 7);
  padding: min(2vh, 1.5rem) min(0.5vw, 0.5rem);
  text-align: center;
  color: #cbd5e1;
  font-weight: 600;
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  letter-spacing: 0.05em;
  border-right: 1px solid #334155;
}

.semaphore-row {
  border-bottom: 1px solid #e2e8f0;
}

.semaphore-row:last-child {
  border-bottom: none;
}

.category-cell {
  padding: min(2vh, 1.5rem) min(1vw, 1rem);
  background: #f8fafc;
  vertical-align: top;
}

.category-content {
  display: flex;
  align-items: center;
  gap: min(1vw, 0.75rem);
}

.color-indicator {
  width: clamp(0.75rem, 2vw, 1rem);
  height: clamp(0.75rem, 2vw, 1rem);
  border-radius: 50%;
  flex-shrink: 0;
}

.color-indicator.green {
  background: #10b981;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.color-indicator.yellow {
  background: #f59e0b;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.color-indicator.red {
  background: #ef4444;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.category-text {
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.day-cell {
  padding: min(0.5vh, 0.5rem);
  border-right: 1px solid #e2e8f0;
  vertical-align: middle;
}

.day-cell:last-child {
  border-right: none;
}

.day-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(3rem, 8vh, 4rem);
}

.day-inner {
  width: clamp(2.5rem, 7vw, 3.5rem);
  height: clamp(2.5rem, 7vw, 3.5rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.day-number {
  font-size: clamp(0.9rem, 2.2vw, 1.1rem);
  font-weight: 600;
}

/* Colores de días - REGLAS SIMPLIFICADAS */
.green-day {
  background: #10b981;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.yellow-day {
  background: #f59e0b;
  color: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
}

.red-day {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.gray-day {
  background: #cbd5e1;
  color: #64748b;
  opacity: 0.6;
}

/* Leyenda simplificada */
.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(15rem, 100%), 1fr));
  gap: min(1vw, 1rem);
  margin-bottom: min(2vh, 2rem);
  padding: 0 min(1vw, 1rem);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: min(1vw, 0.75rem);
  background: white;
  padding: min(1vh, 0.75rem) min(1.5vw, 1.5rem);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.legend-color {
  width: clamp(0.75rem, 2vw, 1rem);
  height: clamp(0.75rem, 2vw, 1rem);
  border-radius: 50%;
}

.legend-color.green {
  background: #10b981;
}

.legend-color.yellow {
  background: #f59e0b;
}

.legend-color.red {
  background: #ef4444;
}

.legend-color.gray {
  background: #cbd5e1;
}

.legend-text {
  font-size: clamp(0.8rem, 1.8vw, 0.95rem);
  color: #475569;
  font-weight: 500;
}

/* Información del semestre */
.semester-info {
  margin-bottom: min(2vh, 2rem);
  padding: 0 min(1vw, 1rem);
}

.info-card {
  padding: min(2vh, 1.5rem) min(2vw, 2rem);
  border-radius: 1rem;
  color: white;
  box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.2);
}

.info-card.first-semester {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.info-card.second-semester {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.info-title {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.info-dates {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  opacity: 0.9;
  margin-bottom: 0.75rem;
}

.info-note {
  font-size: clamp(0.85rem, 1.8vw, 1rem);
  opacity: 0.8;
  font-style: italic;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

/* Estado del mes */
.month-status {
  padding: 0 min(1vw, 1rem);
}

.status-indicator {
  display: inline-block;
  padding: min(1vh, 0.75rem) min(2vw, 2rem);
  border-radius: 2rem;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  font-weight: 600;
  text-align: center;
}

.status-indicator.in-semester {
  background: #dcfce7;
  color: #166534;
  border: 2px solid #86efac;
}

.status-indicator.out-of-semester {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .semaphore-table {
    font-size: 0.9em;
  }
  
  .category-text {
    font-size: 0.85em;
  }
  
  .day-inner {
    width: 2.2rem;
    height: 2.2rem;
  }
  
  .legend {
    grid-template-columns: 1fr;
  }
}

/* Animaciones para destacar los días */
@keyframes pulse-green {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-red {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.green-day:hover {
  animation: pulse-green 0.5s ease;
}

.red-day {
  animation: pulse-red 1s ease infinite;
}

.red-day:hover {
  animation: pulse-red 0.5s ease infinite;
}
</style>