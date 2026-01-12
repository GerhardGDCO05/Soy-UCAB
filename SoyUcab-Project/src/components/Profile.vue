<template>
  <div class="profile-page">
    <headerBar />
    <div class="profile-container panel">
      <h2>Mi perfil</h2>

      <div v-if="loading">Cargando...</div>

      <form v-else @submit.prevent="save">
        <div class="field">
          <label>Email (no editable)</label>
          <input type="email" :value="user.email" disabled />
        </div>

        <template v-if="user.tipo_usuario === 'persona'">
          <div class="field">
            <label>Cédula (no editable)</label>
            <input type="text" :value="user.persona_info?.ci || 'N/A'" disabled />
          </div>

          <div class="field">
            <label>Nombre de usuario</label>
            <input v-model="form.nombre_usuario" />
          </div>

          <div class="field">
            <label>Teléfono</label>
            <input v-model="form.telefono" />
          </div>

          <div class="field">
            <label>Biografía</label>
            <textarea rows="4" v-model="form.biografia"></textarea>
          </div>

          <div class="field">
            <label>Nombres</label>
            <input v-model="form.nombres" />
          </div>

          <div class="field">
            <label>Apellidos</label>
            <input v-model="form.apellidos" />
          </div>

          <!-- NUEVO: HISTORIAL COMPLETO DE ROLES -->
          <div class="field roles-section" v-if="userRoles.length > 0">
            <label>Historial Completo de Roles ({{ userRoles.length }})</label>
            <div class="roles-table">
              <table>
                <thead>
                  <tr>
                    <th>Tipo de Rol</th>
                    <th>Estado</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Período</th>
                    <th>Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rol in userRoles" :key="rol.fecha_inicio" :class="{'current-role': rol.es_rol_actual}">
                    <td>
                      <strong>{{ rol.tipo_rol }}</strong>
                      <span v-if="rol.es_rol_actual" class="current-badge">(Actual)</span>
                    </td>
                    <td>
                      <span :class="`status-${rol.estatus.toLowerCase()}`">
                        {{ rol.estatus }}
                      </span>
                    </td>
                    <td>{{ formatDate(rol.fecha_inicio) }}</td>
                    <td>{{ rol.fecha_finalizacion ? formatDate(rol.fecha_finalizacion) : 'Actual' }}</td>
                    <td>{{ rol.periodo_formateado }}</td>
                    <td>{{ rol.duracion_anios || 0 }} año(s)</td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Estadísticas -->
              <div class="roles-stats" v-if="rolesStats">
                <div class="stat">
                  <span class="stat-value">{{ rolesStats.total }}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ rolesStats.activos }}</span>
                  <span class="stat-label">Activos</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ rolesStats.inactivos }}</span>
                  <span class="stat-label">Inactivos</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ rolesStats.graduados }}</span>
                  <span class="stat-label">Graduados</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información académica específica (opcional - puedes mantenerla o quitarla) -->
          <div v-if="user.academicInfo?.estudiante" class="field academic-info">
            <label>Información de Estudiante</label>
            <div class="academic-details">
              <p><strong>Facultad:</strong> {{ user.academicInfo.estudiante.facultad }}</p>
              <p><strong>Carrera:</strong> {{ user.academicInfo.estudiante.carrera_programa }}</p>
              <p><strong>Semestre:</strong> {{ user.academicInfo.estudiante.semestre }}</p>
              <p><strong>Promedio:</strong> {{ user.academicInfo.estudiante.promedio }}</p>
              <p v-if="user.academicInfo.estudiante.email_dominio_estudiante">
                <strong>Email Institucional:</strong> {{ user.academicInfo.estudiante.email_dominio_estudiante }}
              </p>
            </div>
          </div>

          <div v-if="user.academicInfo?.egresado" class="field academic-info">
            <label>Información de Egresado</label>
            <div class="academic-details">
              <p><strong>Facultad:</strong> {{ user.academicInfo.egresado.facultad }}</p>
              <p><strong>Fecha de Graduación:</strong> {{ formatDate(user.academicInfo.egresado.fecha_acto_grado) }}</p>
              <p><strong>País:</strong> {{ user.academicInfo.egresado.pais }}</p>
              <p><strong>Estado:</strong> {{ user.academicInfo.egresado.estado }}</p>
              <p v-if="user.academicInfo.egresado.titulos?.length">
                <strong>Títulos:</strong> {{ user.academicInfo.egresado.titulos.join(', ') }}
              </p>
            </div>
          </div>

          <hr />

          <div class="field">
            <label>Contraseña</label>
            <div class="pw-inline">
              <input type="password" :value="maskedPassword" disabled />
              <button type="button" @click="toggleChangePassword">Cambiar contraseña</button>
            </div>
          </div>

          <div v-if="showChangePassword" class="field pw-change">
            <label>Contraseña actual</label>
            <input type="password" v-model="passwordFields.currentPassword" />
            <label>Nueva contraseña</label>
            <input type="password" v-model="passwordFields.newPassword" />
            <label>Confirmar nueva contraseña</label>
            <input type="password" v-model="passwordFields.confirmPassword" />
            <div class="actions" style="margin-top:0.5rem;">
              <button type="button" @click="changePassword" :disabled="changingPassword">Guardar contraseña</button>
              <button type="button" @click="cancelChangePassword">Cancelar</button>
            </div>
            <div v-if="pwError" class="error">{{ pwError }}</div>
            <div v-if="pwSuccess" class="success">{{ pwSuccess }}</div>
          </div>
        </template>

        <!-- Resto del código para dependencia y organización -->
        <template v-if="user.tipo_usuario === 'dependencia'">
          <!-- ... código existente ... -->
        </template>

        <template v-if="user.tipo_usuario === 'organizacion'">
          <!-- ... código existente ... -->
        </template>

        <div class="actions" style="margin-top:1rem;">
          <button type="submit" :disabled="saving">Guardar</button>
          <button type="button" @click="cancel">Cancelar</button>
        </div>

        <div v-if="success" class="success">{{ success }}</div>
        <div v-if="error" class="error">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import headerBar from './header.vue';
import api from '@/services/usuarioServices';

export default {
  name: 'Profile',
  components: { headerBar },
  data() {
    return {
      user: {},
      userRoles: [],        // NUEVO: Array para los roles
      rolesStats: null,     // NUEVO: Estadísticas de roles
      form: {},
      loading: true,
      saving: false,
      success: null,
      error: null,
      showChangePassword: false,
      changingPassword: false,
      passwordFields: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      pwError: null,
      pwSuccess: null
    };
  },
  computed: {
    maskedPassword() {
      return '********';
    }
  },
  async mounted() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        // 1. Cargar información básica del usuario
        const resp = await api.getCurrentUser();
        if (resp.success) {
          this.user = resp.data;
          
          // 2. Cargar los roles del usuario usando nuestro nuevo endpoint
          await this.loadUserRoles();
          
          // 3. Llenar el formulario
          this.fillForm();
        } else {
          this.error = 'No se pudo cargar el perfil.';
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
        this.error = 'Error cargando perfil.';
      } finally {
        this.loading = false;
      }
    },

    // NUEVO: Método para cargar roles del usuario
    async loadUserRoles() {
      try {
        // Usamos el método getMyRoles() que agregamos al servicio
        const rolesResult = await api.getMyRoles();
        
        if (rolesResult.success && rolesResult.data) {
          this.userRoles = rolesResult.data.roles || [];
          
          // Calcular estadísticas
          this.calculateRolesStats();
        } else {
          console.warn('No se pudieron cargar los roles:', rolesResult.error);
          this.userRoles = [];
        }
      } catch (err) {
        console.error('Error cargando roles:', err);
        this.userRoles = [];
      }
    },

    // NUEVO: Calcular estadísticas de roles
    calculateRolesStats() {
      const stats = {
        total: this.userRoles.length,
        activos: this.userRoles.filter(r => r.estatus === 'Activo' && r.es_rol_actual).length,
        inactivos: this.userRoles.filter(r => r.estatus === 'Inactivo').length,
        graduados: this.userRoles.filter(r => r.estatus === 'Graduado').length
      };
      
      this.rolesStats = stats;
    },

    // NUEVO: Formatear fecha
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-VE');
    },

    fillForm() {
      this.form = {
        nombre_usuario: this.user.nombre_usuario || '',
        telefono: this.user.telefono || '',
        biografia: this.user.biografia || '',
        nombres: this.user.persona_info?.nombres || '',
        apellidos: this.user.persona_info?.apellidos || '',

        // Dependencia
        nombre_institucional: this.user.entidad_info?.nombre_institucional || '',
        descripcion: this.user.entidad_info?.descripcion || '',
        responsable: this.user.entidad_info?.responsable || '',
        ubicacion_fisica: this.user.entidad_info?.ubicacion_fisica || '',
        edificio: this.user.entidad_info?.edificio || '',
        pagina_web: this.user.entidad_info?.pagina_web || '',

        // Organización
        nombre: this.user.entidad_info?.nombre || '',
        tipos_colaboracion_raw: this.user.entidad_info?.tipos_colaboracion 
          ? (Array.isArray(this.user.entidad_info.tipos_colaboracion) 
              ? this.user.entidad_info.tipos_colaboracion.join(', ') 
              : this.user.entidad_info.tipos_colaboracion) 
          : ''
      };
    },

    async save() {
      this.saving = true;
      this.success = null;
      this.error = null;

      try {
        const email = this.user.email;
        let resp;

        if (this.user.tipo_usuario === 'persona') {
          const updates = {
            nombre_usuario: this.form.nombre_usuario,
            telefono: this.form.telefono,
            biografia: this.form.biografia,
            nombres: this.form.nombres,
            apellidos: this.form.apellidos
          };
          resp = await api.updateMember(email, updates);
        } else if (this.user.tipo_usuario === 'dependencia') {
          resp = await api.updateDependencia(email, { ...this.form });
        } else if (this.user.tipo_usuario === 'organizacion') {
          const tipos = this.form.tipos_colaboracion_raw 
            ? this.form.tipos_colaboracion_raw.split(',').map(s => s.trim()).filter(Boolean) 
            : [];
          resp = await api.updateOrganizacion(email, { ...this.form, tipos_colaboracion: tipos });
        }

        if (resp && resp.success) {
          this.success = 'Perfil actualizado';
          
          // Actualizar LocalStorage
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ 
            ...stored, 
            nombre_usuario: this.form.nombre_usuario,
            nombres: this.form.nombres,
            apellidos: this.form.apellidos
          }));
          
          // Recargar datos
          await this.load();
        } else {
          this.error = resp.error || 'Error al guardar cambios';
        }
      } catch (err) {
        this.error = 'Error de conexión';
      } finally {
        this.saving = false;
      }
    },

    cancel() {
      this.$router.push('/home');
    },

    toggleChangePassword() {
      this.showChangePassword = !this.showChangePassword;
      this.pwError = null;
      this.pwSuccess = null;
      this.passwordFields = { currentPassword: '', newPassword: '', confirmPassword: '' };
    },

    cancelChangePassword() {
      this.toggleChangePassword();
    },

    async changePassword() {
      const { currentPassword, newPassword, confirmPassword } = this.passwordFields;
      if (!currentPassword || !newPassword || !confirmPassword) {
        this.pwError = 'Complete todos los campos';
        return;
      }
      if (newPassword !== confirmPassword) {
        this.pwError = 'Las contraseñas no coinciden';
        return;
      }

      this.changingPassword = true;
      try {
        const resp = await api.updateMember(this.user.email, { currentPassword, contraseña: newPassword });
        if (resp.success) {
          this.pwSuccess = 'Contraseña actualizada';
          setTimeout(() => this.toggleChangePassword(), 2000);
        } else {
          this.pwError = resp.error || 'Error al cambiar contraseña';
        }
      } catch (err) {
        this.pwError = 'Error al cambiar contraseña';
      } finally {
        this.changingPassword = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 1.5rem auto;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
.field input, .field textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  box-sizing: border-box;
}

/* NUEVO: Estilos para la tabla de roles */
.roles-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.roles-table table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.roles-table th, .roles-table td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: left;
}

.roles-table th {
  background-color: #e9ecef;
  font-weight: 600;
}

.roles-table tr.current-role {
  background-color: #e7f5ff;
}

.roles-table .current-badge {
  font-size: 0.8rem;
  background: #007bff;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

/* Estilos para los estados */
.status-activo {
  color: #28a745;
  font-weight: 600;
}
.status-inactivo {
  color: #6c757d;
}
.status-graduado {
  color: #007bff;
  font-weight: 600;
}

/* Estadísticas */
.roles-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
}

.roles-stats .stat {
  text-align: center;
  flex: 1;
}

.roles-stats .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.roles-stats .stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Información académica */
.academic-info {
  background: #f0f8ff;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1e7ff;
}

.academic-details p {
  margin: 0.3rem 0;
}

.pw-inline { 
  display:flex; 
  gap:0.5rem; 
  align-items:center; 
}
.pw-change input { 
  margin-bottom:0.5rem; 
}
.actions { 
  display:flex; 
  gap:0.5rem; 
}
.actions button { 
  padding:0.5rem 0.9rem; 
  border-radius:0.4rem; 
  border:none; 
  cursor:pointer; 
}
.actions button:first-child { 
  background: #4CAF50; 
  color:white; 
}
.success { 
  margin-top:0.75rem; 
  color:#2e7d32; 
}
.error { 
  margin-top:0.75rem; 
  color:#c62828; 
}
</style>