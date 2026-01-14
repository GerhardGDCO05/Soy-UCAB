<template>
  <div class="registration-container">
    <div class="background-overlay"></div>
    <div class="logo-section">
      <h1 class="app-title">SoyUCAB</h1>
      <p class="app-subtitle">Comunidad universitaria conectada</p>
    </div>

    <div class="form-container" :class="{ 'active': isLoginActive }">
      
      <div class="registration-view" v-if="!isLoginActive && currentStep === 1">
        <h2>Crea una cuenta</h2>
        <p class="subtitle">Ingrese tu correo electrónico para registrarte en esta app</p>
        
        <div class="form-group">
          <input 
            type="email" 
            v-model="email" 
            placeholder="correoelectrónico@dominio.com" 
            class="email-input"
            @keyup.enter="handleEmailSubmit"
          />
          <div class="input-underline"></div>
        </div>

        <button class="primary-btn" @click="handleEmailSubmit">
          Registrarse con correo electrónico
        </button>

        <div class="divider">
          <span>o</span>
        </div>

        <button class="secondary-btn" @click="switchToLogin">
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>

      <div class="login-view" v-if="isLoginActive">
        <h2>Iniciar Sesión</h2>
        <div class="form-group">
          <input 
            type="email" 
            v-model="loginEmail" 
            placeholder="correoelectrónico@dominio.com" 
            class="email-input"
          />
          <div class="input-underline"></div>
        </div>
        
        <div class="form-group">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="loginPassword" 
            placeholder="Contraseña" 
            class="password-input"
          />
          <div class="input-underline"></div>
          <span class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </span>
        </div>

        <button class="primary-btn" @click="handleLogin" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>

        <button class="secondary-btn" @click="switchToRegister">
          ¿No tienes cuenta? Regístrate
        </button>
      </div>

      <div class="step-view" v-if="currentStep === 2">
        <h2>Información Básica</h2>
        <p class="step-indicator">Paso 2 de {{ totalSteps }}</p>
        
        <div class="form-group">
          <label>Teléfono *</label>
          <input 
            type="tel" 
            v-model="userData.telefono" 
            placeholder="Ej: 04121234567" 
            maxlength="15"
          />
          <small class="hint">Máximo 15 dígitos</small>
        </div>

        <div class="form-group">
          <label>Nombre de usuario *</label>
          <input 
            type="text" 
            v-model="userData.nombre_usuario" 
            placeholder="usuario_123" 
            maxlength="20"
          />
          <small class="hint">Letras, números, _ , .</small>
        </div>

        <div class="form-group">
          <label>Contraseña *</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="userData.contrasena" 
              placeholder="Mínimo 8 caracteres" 
              maxlength="20"
              @input="validatePassword"
            />
            <span class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </div>
          <div class="password-rules" :class="{ 'valid': passwordStrength.valid }">
            <span v-if="!passwordStrength.valid">Debe tener: Mayúscula, minúscula, número, símbolo ($-_.%&!)</span>
            <span v-else class="valid-text">✓ Contraseña válida</span>
          </div>
        </div>

        <div class="form-group">
          <label>Biografía</label>
          <textarea 
            v-model="userData.biografia" 
            placeholder="Cuéntanos sobre ti..." 
            maxlength="1000" 
            rows="3"
          ></textarea>
          <small class="char-count">{{ userData.biografia?.length || 0 }}/1000</small>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 1">Atrás</button>
          <button class="primary-btn" @click="handleBasicInfoSubmit">Continuar</button>
        </div>
      </div>

      <div class="step-view" v-if="currentStep === 3">
        <h2>Tipo de Usuario</h2>
        <p class="step-indicator">Paso 3 de {{ totalSteps }}</p>
        <p class="subtitle">Selecciona el tipo de cuenta que mejor se adapte a ti</p>
        
        <div class="user-type-grid">
          <div class="user-type-card" :class="{ 'selected': userType === 'persona' }" @click="selectUserType('persona')">
            <div class="icon">👤</div>
            <h3>Persona</h3>
            <p>Estudiante, egresado, profesor, personal</p>
          </div>

          <div class="user-type-card" :class="{ 'selected': userType === 'dependencia' }" @click="selectUserType('dependencia')">
            <div class="icon">🏛️</div>
            <h3>Dependencia</h3>
            <p>Departamento, oficina, unidad</p>
          </div>

          <div class="user-type-card" :class="{ 'selected': userType === 'organizacion' }" @click="selectUserType('organizacion')">
            <div class="icon">🤝</div>
            <h3>Organización</h3>
            <p>Asociación, grupo, club</p>
          </div>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 2">Atrás</button>
          <button class="primary-btn" @click="handleUserTypeSubmit" :disabled="!userType">
            Continuar
          </button>
        </div>
      </div>

      <div class="step-view" v-if="currentStep === 4 && userType === 'persona'">
        <h2>Información Personal</h2>
        <p class="step-indicator">Paso 4 de {{ totalSteps }}</p>
        
        <div class="form-row">
          <div class="form-group">
            <label>Cédula de Identidad *</label>
            <input type="text" v-model="personaData.ci" placeholder="Ej: V12345678" maxlength="10" />
          </div>

          <div class="form-group">
            <label>Sexo *</label>
            <select v-model="personaData.sexo">
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nombres *</label>
            <input type="text" v-model="personaData.nombres" placeholder="Ej: Juan Carlos" />
          </div>

          <div class="form-group">
            <label>Apellidos *</label>
            <input type="text" v-model="personaData.apellidos" placeholder="Ej: Pérez González" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha de Nacimiento *</label>
            <input type="date" v-model="personaData.fecha_nacimiento" @change="calculateAge" />
          </div>

          <div class="form-group">
            <label>Edad</label>
            <input type="number" v-model="personaData.edad" disabled class="disabled-input" />
          </div>
        </div>

        <div class="form-group">
          <label>Idiomas</label>
          <div class="multivalue-input">
            <input type="text" v-model="currentIdioma" placeholder="Ej: Español" @keyup.enter="addIdioma" />
            <button type="button" class="add-btn" @click="addIdioma">+</button>
          </div>
          <div class="tag-container">
            <span v-for="(idioma, index) in personaData.idiomas" :key="index" class="tag">
              {{ idioma }} <span class="remove-tag" @click="removeIdioma(index)">×</span>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Persona *</label>
          <div class="person-type-buttons">
            <button class="type-btn" :class="{ 'active': personaTipo === 'estudiante' }" @click="personaTipo = 'estudiante'">👨‍🎓 Estudiante</button>
            <button class="type-btn" :class="{ 'active': personaTipo === 'egresado' }" @click="personaTipo = 'egresado'">🎓 Egresado</button>
            <button class="type-btn" :class="{ 'active': personaTipo === 'profesor' }" @click="personaTipo = 'profesor'">👨‍🏫 Profesor</button>
          </div>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handlePersonaInfoSubmit">Continuar</button>
        </div>
      </div>

      <div class="step-view" v-if="currentStep === 5 && userType === 'persona'">
        <h2>Detalles de {{ personaTipo }}</h2>
        
        <div v-if="personaTipo === 'estudiante'">
          <div class="form-group">
            <label>Carrera *</label>
            <input type="text" v-model="estudianteData.carrera_programa" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Facultad *</label>
              <input type="text" v-model="estudianteData.facultad" />
            </div>
            <div class="form-group">
              <label>Semestre *</label>
              <input type="number" v-model="estudianteData.semestre" />
            </div>
          </div>
        </div>

        <div v-if="personaTipo === 'egresado'">
          <div class="form-group">
            <label>Título(s) *</label>
            <div class="multivalue-input">
              <input type="text" v-model="currentTitulo" @keyup.enter="addTitulo" />
              <button class="add-btn" @click="addTitulo">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(t, i) in egresadoData.titulos" :key="i" class="tag">
                {{ t }} <span class="remove-tag" @click="removeTitulo(i)">×</span>
              </span>
            </div>
          </div>
        </div>
        <div v-if="personaTipo === 'profesor'">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Ingreso *</label>
              <input type="date" v-model="profesorData.fecha_ingreso" />
            </div>
            <div class="form-group">
              <label>Dedicación *</label>
              <input type="text" v-model="profesorData.dedicacion" placeholder="Ej: Tiempo Completo" />
            </div>
          </div>
          
          <div class="form-group">
            <label>Categoría *</label>
            <input type="text" v-model="profesorData.categoria" placeholder="Ej: Instructor, Agregado, Titular" />
          </div>

          <div class="form-group">
            <label>Facultad(es)</label>
            <div class="multivalue-input">
              <input type="text" v-model="currentFacultad" placeholder="Ej: Ingeniería" @keyup.enter="addFacultad" />
              <button class="add-btn" @click="addFacultad">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(f, i) in profesorData.facultades" :key="i" class="tag">
                {{ f }} <span class="remove-tag" @click="removeFacultad(i)">×</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Departamento(s)</label>
            <div class="multivalue-input">
              <input type="text" v-model="currentDepartamento" placeholder="Ej: Informática" @keyup.enter="addDepartamento" />
              <button class="add-btn" @click="addDepartamento">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(d, i) in profesorData.departamentos" :key="i" class="tag">
                {{ d }} <span class="remove-tag" @click="removeDepartamento(i)">×</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Materia(s) Impartida(s)</label>
            <div class="multivalue-input">
              <input type="text" v-model="currentMateria" placeholder="Ej: Base de Datos" @keyup.enter="addMateria" />
              <button class="add-btn" @click="addMateria">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(m, i) in profesorData.materias" :key="i" class="tag">
                {{ m }} <span class="remove-tag" @click="removeMateria(i)">×</span>
              </span>
            </div>
          </div>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 4">Atrás</button>
          <button class="primary-btn" @click="handleRegistration" :disabled="loading">
            {{ loading ? 'Registrando...' : 'Finalizar Registro' }}
          </button>
        </div>
      </div>

      <div class="step-view" v-if="currentStep === 4 && userType === 'dependencia'">
        <h2>Información de Dependencia</h2>
        <div class="form-group">
          <label>Nombre Institucional *</label>
          <input type="text" v-model="dependenciaData.nombre_institucional" />
        </div>
        <div class="form-group">
          <label>Descripción *</label>
          <textarea v-model="dependenciaData.descripcion" rows="4"></textarea>
        </div>
        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handleRegistration" :disabled="loading">Finalizar</button>
        </div>
      </div>

      <div class="step-view" v-if="currentStep === 4 && userType === 'organizacion'">
        <h2>Información de Organización</h2>
        <div class="form-group">
          <label>RIF *</label>
          <input type="text" v-model="organizacionData.rif" />
        </div>
        <div class="form-group">
          <label>Nombre *</label>
          <input type="text" v-model="organizacionData.nombre" />
        </div>
        
        <!-- ZONA AGREGADA: Datos Adicionales -->
        <div class="form-group">
          <label>Descripción (Opcional)</label>
          <textarea v-model="organizacionData.descripcion" rows="3" placeholder="Descripción de la organización"></textarea>
        </div>

        <div class="form-group">
          <label>Página Web (Opcional)</label>
          <input type="url" v-model="organizacionData.pagina_web" placeholder="https://..." />
        </div>

        <div class="form-group">
          <label>Tipos de Colaboración (Opcional)</label>
          <div class="multivalue-input">
            <input type="text" v-model="currentColaboracion" placeholder="Ej: Pasantías" @keyup.enter="addColaboracion" />
            <button class="add-btn" @click="addColaboracion">+</button>
          </div>
          <div class="tag-container">
            <span v-for="(colab, index) in organizacionData.tipos_colaboracion" :key="index" class="tag">
              {{ colab }} <span class="remove-tag" @click="removeColaboracion(index)">×</span>
            </span>
          </div>
        </div>
        <!-- FIN ZONA AGREGADA -->
        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handleRegistration" :disabled="loading">Finalizar</button>
        </div>
      </div>

      <div class="step-view confirmation-view" v-if="currentStep === 6">
        <div class="confirmation-icon">✅</div>
        <h2>¡Cuenta Creada!</h2>
        <p class="confirmation-message">Bienvenido a la plataforma.</p>
        <button class="primary-btn" @click="$router.push('/home')">
          Continuar
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import api from '../services/usuarioServices';

export default {
  name: 'RegistrationComponent',
  
  data() {
    return {
      // Estados principales
      isLoginActive: false,
      currentStep: 1,
      showPassword: false,
      loading: false,
      errorMessage: '',
      
      // Datos básicos
      email: '',
      loginEmail: '',
      loginPassword: '',
      
      // Tipo de usuario
      userType: '',
      personaTipo: '',
      
      // Datos del formulario (comunes a todos)
      userData: {
        telefono: '',
        nombre_usuario: '',
        contrasena: '',
        biografia: '',
        privacidad_perfil: 'publico'
      },
      
      passwordStrength: {
        valid: false
      },
      
      // Datos de persona
      personaData: {
        ci: '',
        sexo: 'M',
        nombres: '',
        apellidos: '',
        fecha_nacimiento: '',
        edad: 0,
        empresa_actual: '',
        idiomas: [],
        habilidades: []
      },
      
      // Datos específicos por tipo de persona
      estudianteData: {
        carrera_programa: '',
        facultad: '',
        semestre: '',
        promedio: ''
      },
      
      egresadoData: {
        facultad: '',
        titulos: [],
        fecha_grado: '',
        pais: '',
        estado: '',
        menciones: [],
        empresas: []
      },
      
      profesorData: {
        fecha_ingreso: '',
        categoria: '',
        dedicacion: '',
        estado: 'activo',
        fecha_fin: '',
        facultades: [],
        departamentos: [],
        materias: []
      },
      
      // Datos para dependencia
      dependenciaData: {
        nombre_institucional: '',
        descripcion: '',
        logo: '',
        pagina_web: '',
        fecha_creacion: new Date().toISOString().split('T')[0],
        estado: 'activa',
        responsable: '',
        ubicacion_fisica: '',
        edificio: '',
        tipo: ''
      },
      
      // Datos para organización
      organizacionData: {
        rif: '',
        nombre: '',
        descripcion: '',
        logo: '',
        pagina_web: '',
        tipos_colaboracion: [],
        tipo: ''
      },
      
      // Estados para inputs multivalor
      currentIdioma: '',
      currentHabilidad: '',
      currentTitulo: '',
      currentMencion: '',
      currentEmpresa: '',
      currentFacultad: '',
      currentDepartamento: '',
      currentMateria: '',
      currentColaboracion: '',
      
      // Estados de países y estados
      estadosDisponibles: [],
      descripcionError: '',
      
      estadosPorPais: {
        'VE': ['Distrito Capital', 'Zulia', 'Miranda', 'Carabobo', 'Aragua', 'Lara', 'Bolívar', 'Táchira', 'Mérida', 'Anzoátegui'],
        'CO': ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Santander', 'Cundinamarca', 'Atlántico', 'Bolívar'],
        'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Andalucía', 'Cataluña', 'País Vasco'],
        'US': ['Florida', 'California', 'Texas', 'Nueva York', 'Illinois', 'Washington', 'Massachusetts'],
        'MX': ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Veracruz', 'Estado de México', 'Guanajuato']
      }
    };
  },
  
  computed: {
    totalSteps() {
      return this.userType === 'persona' ? 5 : 4;
    },
    isLastStep() {
      return this.currentStep === this.totalSteps;
    },
    isPersonaTypeValid() {
      const validTypes = ['estudiante', 'egresado', 'profesor'];
      return validTypes.includes(this.personaTipo);
    }
  },
  
  methods: {
    // ========== MÉTODOS DE NAVEGACIÓN ==========
    switchToLogin() {
      this.isLoginActive = true;
    },
    
    switchToRegister() {
      this.isLoginActive = false;
      this.currentStep = 1;
      this.resetFormData();
    },
    
    handleEmailSubmit() {
      if (this.validateEmail(this.email)) {
        this.currentStep = 2;
      } else {
        alert('Por favor ingresa un correo electrónico válido');
      }
    },
    
    resetFormData() {
      if (this.userType === 'persona') {
        this.personaData = { ci: '', sexo: 'M', nombres: '', apellidos: '', fecha_nacimiento: '', edad: 0, empresa_actual: '', idiomas: [], habilidades: [] };
      } else if (this.userType === 'dependencia') {
        this.dependenciaData = { nombre_institucional: '', descripcion: '', logo: '', pagina_web: '', fecha_creacion: new Date().toISOString().split('T')[0], estado: 'activa', responsable: '', ubicacion_fisica: '', edificio: '', tipo: '' };
      } else if (this.userType === 'organizacion') {
        this.organizacionData = { rif: '', nombre: '', descripcion: '', logo: '', pagina_web: '', tipos_colaboracion: [], tipo: '' };
      }
    },
    
    // ========== MÉTODOS DE VALIDACIÓN ==========
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    
    validatePassword() {
      const password = this.userData.contrasena;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[$_\.%&!-]/.test(password);
      const hasMinLength = password.length >= 8;
      this.passwordStrength.valid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength;
    },
    
    calculateAge() {
      if (this.personaData.fecha_nacimiento) {
        const birthDate = new Date(this.personaData.fecha_nacimiento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        this.personaData.edad = age;
      }
    },
    
    // ========== MÉTODOS DE LOGIN (CORREGIDO) ==========
    async handleLogin() {
      if (!this.loginEmail || !this.loginPassword) {
        alert('Por favor ingresa correo y contraseña');
        return;
      }
      
      try {
        this.loading = true;
        this.errorMessage = '';
        
        const result = await api.login({
          email: this.loginEmail,
          contraseña: this.loginPassword
        });
        
        if (result.success) {
          const userData = result.data;
          const userName = userData?.nombres || userData?.nombre_institucional || userData?.nombre || 'Usuario';
          
          alert(`¡Bienvenido ${userName}!`);
          
          // No guardamos token, solo el usuario. El router detectará esto.
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Redirección limpia usando Vue Router
          this.$router.push('/home');
          
        } else {
          this.errorMessage = result.error || 'Credenciales incorrectas';
          alert(`Error: ${this.errorMessage}`);
        }
      } catch (error) {
        console.error('Error en handleLogin:', error);
        this.errorMessage = 'Error de conexión con el servidor';
        alert(this.errorMessage);
      } finally {
        this.loading = false;
      }
    },
    
    // ========== REGISTRO (CORREGIDO) ==========
    async handleRegistration() {
      if (!this.email || !this.userData.nombre_usuario || !this.userData.contrasena) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }
      
      if (!this.passwordStrength.valid) {
        alert('La contraseña no cumple con los requisitos de seguridad');
        return;
      }
      
      try {
        this.loading = true;
        
        const baseData = {
          email: this.email,
          nombre_usuario: this.userData.nombre_usuario,
          contraseña: this.userData.contrasena,
          telefono: this.userData.telefono || null,
          biografia: this.userData.biografia || '',
          privacidad_perfil: this.userData.privacidad_perfil || 'publico'
        };
        
        let finalData;
        
        if (this.userType === 'persona') {
          if (!this.personaData.ci || !this.personaData.nombres || !this.personaData.apellidos || !this.personaData.fecha_nacimiento) {
            alert('Por favor completa los campos de persona');
            this.loading = false;
            return;
          }
          
          finalData = {
            ...baseData,
            nombres: this.personaData.nombres,
            apellidos: this.personaData.apellidos,
            ci: this.personaData.ci,
            sexo: this.personaData.sexo,
            fecha_nacimiento: this.formatDateForAPI(this.personaData.fecha_nacimiento),
            tipo_miembro: this.personaTipo.charAt(0).toUpperCase() + this.personaTipo.slice(1)
          };
          
          if (this.personaTipo === 'estudiante') {
            Object.assign(finalData, { 
              ...this.estudianteData, 
              promedio: this.estudianteData.promedio || null,
              email_dominio_estudiante: this.generateInstitutionalEmail(this.email) 
            });
          } else if (this.personaTipo === 'egresado') {
            Object.assign(finalData, { ...this.egresadoData, fecha_acto_grado: this.formatDateForAPI(this.egresadoData.fecha_grado) });
          } else if (this.personaTipo === 'profesor') {
            Object.assign(finalData, { ...this.profesorData, fecha_ingreso_profesor: this.formatDateForAPI(this.profesorData.fecha_ingreso) });
          }
          
        } else if (this.userType === 'dependencia') {
          finalData = { ...baseData, tipo_entidad: 'dependencia', ...this.dependenciaData, fecha_creacion: this.formatDateForAPI(this.dependenciaData.fecha_creacion) };
        } else if (this.userType === 'organizacion') {
          finalData = { ...baseData, tipo_entidad: 'organizacion', ...this.organizacionData };
        }
        
        const result = await api.registerUser(finalData);
        
        if (result.success) {
          alert('¡Cuenta creada exitosamente!');
          // Intentar login automático
          await this.autoLoginAfterRegister(finalData.email, finalData.contraseña);
        } else {
          alert(result.error || 'Error en el registro');
        }
        
      } catch (error) {
        console.error('Error en handleRegistration:', error);
        alert('Error de conexión');
      } finally {
        this.loading = false;
      }
    },
    
    async autoLoginAfterRegister(email, password) {
      try {
        const loginResult = await api.login({ email, contraseña: password });
        if (loginResult.success && loginResult.data) {
          localStorage.setItem('user', JSON.stringify(loginResult.data));
          this.$router.push('/home');
        } else {
          this.switchToLogin();
        }
      } catch (e) {
        this.switchToLogin();
      }
    },
    
    // ========== MÉTODOS AUXILIARES Y UI ==========
    formatDateForAPI(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toISOString().split('T')[0];
    },
    
    generateInstitutionalEmail(personalEmail) {
      return `${personalEmail.split('@')[0]}@ucab.edu.ve`;
    },
    
    updateEstados() {
      this.estadosDisponibles = this.estadosPorPais[this.egresadoData.pais] || [];
      this.egresadoData.estado = '';
    },

    // Handlers de pasos (simplificados para brevedad, mantienen tu lógica)
    handleBasicInfoSubmit() {
      if(this.passwordStrength.valid) this.currentStep = 3; else alert('Revisa la contraseña'); 
    },
    selectUserType(type) { 
      this.userType = type; this.resetFormData(); 
    },
    handleUserTypeSubmit() { 
      if(this.userType) this.currentStep = 4; 
    },
    handlePersonaInfoSubmit() {
      if(this.isPersonaTypeValid) this.currentStep = 5; 
    },
    handleSpecificInfoSubmit() { 
      this.currentStep = 6; 
    },
    handleDependenciaSubmit() { 
      this.currentStep = 6; 
    },
    handleOrganizacionSubmit() { 
      this.currentStep = 6; 
    },
    handleConfirmation() { 
      this.handleRegistration(); 
    },

    // Métodos para arrays (idiomas, habilidades, etc)
    addIdioma() { 
      if (this.currentIdioma.trim()) { 
        this.personaData.idiomas.push(this.currentIdioma.trim()); this.currentIdioma = ''; 
      } 
    },
    removeIdioma(index) { 
      this.personaData.idiomas.splice(index, 1); 
    },
    addHabilidad() { 
      if (this.currentHabilidad.trim()) { 
        this.personaData.habilidades.push(this.currentHabilidad.trim()); this.currentHabilidad = ''; 
      } 
    },
    removeHabilidad(index) { 
      this.personaData.habilidades.splice(index, 1); 
    },
    addTitulo() { 
      if (this.currentTitulo.trim()) { 
        this.egresadoData.titulos.push(this.currentTitulo.trim()); this.currentTitulo = ''; 
      }
    },
    removeTitulo(index) { 
      this.egresadoData.titulos.splice(index, 1); 
    },
    addMencion() { if (this.currentMencion.trim()) { 
      this.egresadoData.menciones.push(this.currentMencion.trim()); this.currentMencion = ''; 
    } 
  },
    removeMencion(index) { 
      this.egresadoData.menciones.splice(index, 1); 
    },
    addEmpresa() { 
      if (this.currentEmpresa.trim()) { 
        this.egresadoData.empresas.push(this.currentEmpresa.trim()); this.currentEmpresa = ''; 
      } 
    },
    removeEmpresa(index) { 
      this.egresadoData.empresas.splice(index, 1); 
    },
    addFacultad() { 
      if (this.currentFacultad.trim()) { 
        this.profesorData.facultades.push(this.currentFacultad.trim()); this.currentFacultad = ''; 
      } 
    },
    removeFacultad(index) { 
      this.profesorData.facultades.splice(index, 1);
    },
    addDepartamento() { 
      if (this.currentDepartamento.trim()) { 
        this.profesorData.departamentos.push(this.currentDepartamento.trim()); this.currentDepartamento = ''; 
      } 
    },
    removeDepartamento(index) { 
      this.profesorData.departamentos.splice(index, 1); 
    },
    addMateria() { 
      if (this.currentMateria.trim()) { 
        this.profesorData.materias.push(this.currentMateria.trim()); this.currentMateria = ''; 
      } 
    },
    removeMateria(index) { 
      this.profesorData.materias.splice(index, 1); 
    },
    addColaboracion() { 
      if (this.currentColaboracion.trim()) { 
        this.organizacionData.tipos_colaboracion.push(this.currentColaboracion.trim()); this.currentColaboracion = ''; 
      } 
    },
    removeColaboracion(index) { 
      this.organizacionData.tipos_colaboracion.splice(index, 1); 
    }
  }
};
</script>