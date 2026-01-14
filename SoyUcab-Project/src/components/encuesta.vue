<template>
  <div class="encuestas-container">
    <headerBar />
    
    <div class="main-content">
      <div class="header-section">
        <h1>📊 Encuestas</h1>
        <button 
          v-if="canCreateEncuestas" 
          @click="showCreateModal = true" 
          class="btn-create"
        >
          <i class="fas fa-plus"></i> Crear Encuesta
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          @click="currentTab = 'activas'" 
          :class="{ active: currentTab === 'activas' }"
        >
          Encuestas Activas
        </button>
        <button 
          v-if="canCreateEncuestas"
          @click="currentTab = 'mis-encuestas'" 
          :class="{ active: currentTab === 'mis-encuestas' }"
        >
          Mis Encuestas
        </button>
      </div>

      <!-- Lista de encuestas activas -->
      <div v-if="currentTab === 'activas'" class="encuestas-grid">
        <div v-if="loadingEncuestas" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Cargando encuestas...
        </div>

        <div v-else-if="encuestas.length === 0" class="empty-state">
          <i class="fas fa-poll"></i>
          <p>No hay encuestas activas en este momento</p>
        </div>

        <div 
          v-else 
          v-for="encuesta in encuestas" 
          :key="encuesta.tipo_encuesta + encuesta.titulo"
          class="encuesta-card"
          @click="verEncuesta(encuesta)"
        >
          <div class="encuesta-header">
            <h3>{{ encuesta.titulo }}</h3>
            <span class="badge-tipo">{{ encuesta.tipo_encuesta }}</span>
          </div>
          
          <p class="encuesta-desc">{{ encuesta.descripcion }}</p>
          
          <div class="encuesta-meta">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ encuesta.nombre_usuario }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-users"></i>
              <span>{{ encuesta.total_votos }} votos</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>Termina: {{ formatDate(encuesta.fecha_fin) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mis encuestas -->
      <div v-if="currentTab === 'mis-encuestas'" class="encuestas-grid">
        <div v-if="loadingMisEncuestas" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Cargando...
        </div>

        <div v-else-if="misEncuestas.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No has creado ninguna encuesta</p>
        </div>

        <div 
          v-else 
          v-for="encuesta in misEncuestas" 
          :key="encuesta.tipo_encuesta + encuesta.titulo"
          class="encuesta-card"
        >
          <div class="encuesta-header">
            <h3>{{ encuesta.titulo }}</h3>
            <span 
              class="badge-estado" 
              :class="'estado-' + encuesta.estado_encuesta"
            >
              {{ encuesta.estado_encuesta }}
            </span>
          </div>
          
          <p class="encuesta-desc">{{ encuesta.descripcion }}</p>
          
          <div class="encuesta-meta">
            <div class="meta-item">
              <i class="fas fa-users"></i>
              <span>{{ encuesta.total_votos }} votos</span>
            </div>
          </div>

          <div class="encuesta-actions">
            <button 
              v-if="encuesta.estado_encuesta === 'borrador'"
              @click.stop="publicarEncuesta(encuesta)"
              class="btn-publicar"
            >
              <i class="fas fa-bullhorn"></i> Publicar
            </button>
            <button 
              @click.stop="verResultados(encuesta)"
              class="btn-resultados"
            >
              <i class="fas fa-chart-bar"></i> Ver Resultados
            </button>
            <button 
              @click.stop="eliminarEncuesta(encuesta)"
              class="btn-eliminar"
            >
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Crear Encuesta -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Crear Nueva Encuesta</h2>
          <button @click="showCreateModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Tipo de Encuesta</label>
            <input v-model="newEncuesta.tipo_encuesta" placeholder="Ej: Satisfacción, Opinión" />
          </div>

          <div class="form-group">
            <label>Título</label>
            <input v-model="newEncuesta.titulo" placeholder="Título de la encuesta" />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="newEncuesta.descripcion" rows="3" placeholder="Describe el propósito de la encuesta"></textarea>
          </div>

          <div class="form-group">
            <label>Instrucciones (opcional)</label>
            <textarea v-model="newEncuesta.instrucciones" rows="2" placeholder="Instrucciones para los participantes"></textarea>
          </div>

          <div class="form-group">
            <label>Fecha de Finalización</label>
            <input type="datetime-local" v-model="newEncuesta.fecha_fin" />
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newEncuesta.anonimato" />
              Votación anónima
            </label>
          </div>

          <div class="form-group">
            <label>Opciones de Respuesta</label>
            <div v-for="(opcion, index) in newEncuesta.opciones" :key="index" class="opcion-row">
              <span class="opcion-numero">{{ index + 1 }}.</span>
              <input 
                v-model="opcion.texto" 
                placeholder="Texto de la opción"
                class="opcion-input"
              />
              <button 
                v-if="newEncuesta.opciones.length > 2"
                @click="removeOpcion(index)" 
                class="btn-remove"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button @click="addOpcion" class="btn-add-opcion">
              <i class="fas fa-plus"></i> Agregar Opción
            </button>
          </div>

          <div class="form-group">
            <label>Audiencia (opcional)</label>
            <input 
              v-model="audienciaInput" 
              @keyup.enter="addAudiencia"
              placeholder="Presiona Enter para agregar"
            />
            <div class="tags">
              <span v-for="(aud, i) in newEncuesta.audiencia" :key="i" class="tag">
                {{ aud }}
                <button @click="newEncuesta.audiencia.splice(i, 1)">&times;</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Requisitos (opcional)</label>
            <input 
              v-model="requisitosInput" 
              @keyup.enter="addRequisito"
              placeholder="Presiona Enter para agregar"
            />
            <div class="tags">
              <span v-for="(req, i) in newEncuesta.requisitos" :key="i" class="tag">
                {{ req }}
                <button @click="newEncuesta.requisitos.splice(i, 1)">&times;</button>
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="crearEncuesta" :disabled="creatingEncuesta" class="btn-primary">
            {{ creatingEncuesta ? 'Creando...' : 'Crear Encuesta' }}
          </button>
          <button @click="showCreateModal = false" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Ver/Votar Encuesta -->
    <div v-if="showVotarModal" class="modal-overlay" @click.self="showVotarModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ encuestaActual.titulo }}</h2>
          <button @click="showVotarModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <p class="encuesta-descripcion">{{ encuestaActual.descripcion }}</p>
          
          <div v-if="encuestaActual.instrucciones" class="instrucciones">
            <strong>Instrucciones:</strong>
            <p>{{ encuestaActual.instrucciones }}</p>
          </div>

          <div v-if="yaVoto" class="ya-voto-msg">
            <i class="fas fa-check-circle"></i>
            Ya has votado en esta encuesta
          </div>

          <div v-else class="opciones-votar">
            <h3>Selecciona una opción:</h3>
            <div 
              v-for="opcion in encuestaActual.opciones" 
              :key="opcion.numero_opcion"
              class="opcion-votar"
              :class="{ selected: opcionSeleccionada === opcion.numero_opcion }"
              @click="opcionSeleccionada = opcion.numero_opcion"
            >
              <div class="radio-custom">
                <div v-if="opcionSeleccionada === opcion.numero_opcion" class="radio-dot"></div>
              </div>
              <span>{{ opcion.texto_opcion }}</span>
            </div>
          </div>

          <div class="resultados-preview">
            <h3>Resultados actuales:</h3>
            <div 
              v-for="opcion in encuestaActual.opciones" 
              :key="'result-' + opcion.numero_opcion"
              class="resultado-bar"
            >
              <div class="resultado-label">
                <span>{{ opcion.texto_opcion }}</span>
                <span class="resultado-votos">{{ opcion.votos }} votos</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getPercentage(opcion.votos) + '%' }"
                ></div>
              </div>
              <span class="resultado-percent">{{ getPercentage(opcion.votos) }}%</span>
            </div>
          </div>
        </div>

        <div v-if="!yaVoto" class="modal-footer">
          <button 
            @click="votar" 
            :disabled="!opcionSeleccionada || votando"
            class="btn-primary"
          >
            {{ votando ? 'Votando...' : 'Confirmar Voto' }}
          </button>
          <button @click="showVotarModal = false" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import headerBar from '@/components/header.vue'
import axios from 'axios'

export default {
  name: 'Encuestas',
  components: { headerBar },
  data() {
    return {
      currentTab: 'activas',
      encuestas: [],
      misEncuestas: [],
      loadingEncuestas: false,
      loadingMisEncuestas: false,
      userEmail: '',
      userType: '',
      canCreateEncuestas: false,
      
      showCreateModal: false,
      showVotarModal: false,
      
      newEncuesta: {
        tipo_encuesta: '',
        titulo: '',
        descripcion: '',
        instrucciones: '',
        fecha_fin: '',
        anonimato: true,
        opciones: [
          { numero: 1, texto: '' },
          { numero: 2, texto: '' }
        ],
        audiencia: [],
        requisitos: []
      },
      
      audienciaInput: '',
      requisitosInput: '',
      creatingEncuesta: false,
      
      encuestaActual: null,
      opcionSeleccionada: null,
      yaVoto: false,
      votando: false
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userEmail = user.email
    this.userType = user.tipo_usuario || ''
    
    console.log('📧 Email del usuario:', this.userEmail)
    console.log('👤 Tipo de usuario:', this.userType)
    
    // Verificar si puede crear encuestas
    this.canCreateEncuestas = this.userType === 'dependencia' || this.userType === 'organizacion'
    
    console.log('✅ Puede crear encuestas:', this.canCreateEncuestas)
    
    await this.loadEncuestas()
    if (this.canCreateEncuestas) {
      await this.loadMisEncuestas()
    }
  },
  methods: {
    async loadEncuestas() {
      this.loadingEncuestas = true
      try {
        const res = await axios.get('http://localhost:3000/api/encuestas')
        if (res.data.success) {
          this.encuestas = res.data.data
        }
      } catch (e) {
        console.error('Error cargando encuestas:', e)
      } finally {
        this.loadingEncuestas = false
      }
    },

async loadMisEncuestas() {
  this.loadingMisEncuestas = true
  try {
    const emailCodificado = encodeURIComponent(this.userEmail)
    const res = await axios.get(`http://localhost:3000/api/encuestas/mis-encuestas/${emailCodificado}`)
    if (res.data.success) {
      this.misEncuestas = res.data.data
    }
  } catch (e) {
    console.error('Error cargando mis encuestas:', e)
  } finally {
    this.loadingMisEncuestas = false
  }
},

    async verEncuesta(encuesta) {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/encuestas/${encuesta.tipo_encuesta}/${encuesta.titulo}`
        )
        if (res.data.success) {
          this.encuestaActual = res.data.data
          
          // Verificar si ya votó
          const votoRes = await axios.get('http://localhost:3000/api/encuestas/check-voto', {
            params: {
              tipo_encuesta: encuesta.tipo_encuesta,
              titulo: encuesta.titulo,
              email: this.userEmail
            }
          })
          this.yaVoto = votoRes.data.yaVoto
          
          this.showVotarModal = true
        }
      } catch (e) {
        console.error('Error cargando encuesta:', e)
        alert('Error al cargar la encuesta')
      }
    },

    async votar() {
      if (!this.opcionSeleccionada) return
      
      this.votando = true
      try {
        const res = await axios.post('http://localhost:3000/api/encuestas/votar', {
          tipo_encuesta: this.encuestaActual.tipo_encuesta,
          titulo_encuesta: this.encuestaActual.titulo,
          numero_opcion: this.opcionSeleccionada,
          email_encuestado: this.userEmail
        })
        
        if (res.data.success) {
          alert('¡Voto registrado exitosamente!')
          this.yaVoto = true
          await this.verEncuesta(this.encuestaActual)
        }
      } catch (e) {
        console.error('Error votando:', e)
        alert(e.response?.data?.error || 'Error al registrar el voto')
      } finally {
        this.votando = false
      }
    },

    addOpcion() {
      const nuevoNumero = this.newEncuesta.opciones.length + 1
      this.newEncuesta.opciones.push({ numero: nuevoNumero, texto: '' })
    },

    removeOpcion(index) {
      this.newEncuesta.opciones.splice(index, 1)
      // Renumerar
      this.newEncuesta.opciones.forEach((op, i) => {
        op.numero = i + 1
      })
    },

    addAudiencia() {
      if (this.audienciaInput.trim()) {
        this.newEncuesta.audiencia.push(this.audienciaInput.trim())
        this.audienciaInput = ''
      }
    },

    addRequisito() {
      if (this.requisitosInput.trim()) {
        this.newEncuesta.requisitos.push(this.requisitosInput.trim())
        this.requisitosInput = ''
      }
    },

    async crearEncuesta() {
      if (!this.newEncuesta.tipo_encuesta || !this.newEncuesta.titulo || 
          !this.newEncuesta.descripcion || !this.newEncuesta.fecha_fin) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }

      if (this.newEncuesta.opciones.some(op => !op.texto.trim())) {
        alert('Todas las opciones deben tener texto')
        return
      }

      this.creatingEncuesta = true
      try {
        const res = await axios.post('http://localhost:3000/api/encuestas', {
          ...this.newEncuesta,
          email_encuestador: this.userEmail,
          tipo_encuestador: this.userType
        })
        
        if (res.data.success) {
          alert('Encuesta creada exitosamente')
          this.showCreateModal = false
          this.resetForm()
          await this.loadMisEncuestas()
        }
      } catch (e) {
        console.error('Error creando encuesta:', e)
        alert('Error al crear la encuesta')
      } finally {
        this.creatingEncuesta = false
      }
    },

    async publicarEncuesta(encuesta) {
      if (!confirm('¿Publicar esta encuesta? Una vez publicada, será visible para todos.')) return
      
      try {
        const res = await axios.post('http://localhost:3000/api/encuestas/publicar', {
          tipo_encuesta: encuesta.tipo_encuesta,
          titulo: encuesta.titulo
        })
        
        if (res.data.success) {
          alert('Encuesta publicada exitosamente')
          await this.loadMisEncuestas()
        }
      } catch (e) {
        console.error('Error publicando:', e)
        alert('Error al publicar la encuesta')
      }
    },

    verResultados(encuesta) {
      this.verEncuesta(encuesta)
    },

    async eliminarEncuesta(encuesta) {
      if (!confirm('¿Estás seguro de eliminar esta encuesta? Esta acción no se puede deshacer.')) return
      
      try {
        const res = await axios.delete(
          `http://localhost:3000/api/encuestas/${encuesta.tipo_encuesta}/${encuesta.titulo}`,
          {
            data: { email_encuestador: this.userEmail }
          }
        )
        
        if (res.data.success) {
          alert('Encuesta eliminada exitosamente')
          await this.loadMisEncuestas()
        }
      } catch (e) {
        console.error('Error eliminando:', e)
        alert(e.response?.data?.error || 'Error al eliminar la encuesta')
      }
    },

    resetForm() {
      this.newEncuesta = {
        tipo_encuesta: '',
        titulo: '',
        descripcion: '',
        instrucciones: '',
        fecha_fin: '',
        anonimato: true,
        opciones: [
          { numero: 1, texto: '' },
          { numero: 2, texto: '' }
        ],
        audiencia: [],
        requisitos: []
      }
    },

    getPercentage(votos) {
      if (!this.encuestaActual || this.encuestaActual.total_votos === 0) return 0
      return Math.round((votos / this.encuestaActual.total_votos) * 100)
    },

    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>


