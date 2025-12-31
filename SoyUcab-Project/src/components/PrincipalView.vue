<template>
  <div class="registration-container">
    <!-- Fondo y logo -->
    <div class="background-overlay"></div>
    <div class="logo-section">
      <h1 class="app-title">SoyUCAB</h1>
      <p class="app-subtitle">Comunidad universitaria conectada</p>
    </div>

    <!-- Contenedor principal del formulario -->
    <div class="form-container" :class="{ 'active': isLoginActive }">
      
      <!-- Vista de registro inicial -->
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

      <!-- Vista de login -->
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

        <button class="primary-btn" @click="handleLogin">
          Iniciar Sesión
        </button>

        <button class="secondary-btn" @click="switchToRegister">
          ¿No tienes cuenta? Regístrate
        </button>
      </div>

      <!-- Paso 2: Información básica de usuario -->
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

      <!-- Paso 3: Selección de tipo de usuario -->
      <div class="step-view" v-if="currentStep === 3">
        <h2>Tipo de Usuario</h2>
        <p class="step-indicator">Paso 3 de {{ totalSteps }}</p>
        <p class="subtitle">Selecciona el tipo de cuenta que mejor se adapte a ti</p>
        
        <div class="user-type-grid">
          <div 
            class="user-type-card" 
            :class="{ 'selected': userType === 'persona' }"
            @click="selectUserType('persona')"
          >
            <div class="icon">👤</div>
            <h3>Persona</h3>
            <p>Estudiante, egresado, profesor, personal</p>
          </div>

          <div 
            class="user-type-card" 
            :class="{ 'selected': userType === 'dependencia' }"
            @click="selectUserType('dependencia')"
          >
            <div class="icon">🏛️</div>
            <h3>Dependencia</h3>
            <p>Departamento, oficina, unidad</p>
          </div>

          <div 
            class="user-type-card" 
            :class="{ 'selected': userType === 'organizacion' }"
            @click="selectUserType('organizacion')"
          >
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

      <!-- Paso 4: Información específica de PERSONA -->
      <div class="step-view" v-if="currentStep === 4 && userType === 'persona'">
        <h2>Información Personal</h2>
        <p class="step-indicator">Paso 4 de {{ totalSteps }}</p>
        
        <div class="form-row">
          <div class="form-group">
            <label>Cédula de Identidad *</label>
            <input 
              type="text" 
              v-model="personaData.ci" 
              placeholder="Ej: V12345678" 
              maxlength="10"
            />
          </div>

          <div class="form-group">
            <label>Sexo *</label>
            <select v-model="personaData.sexo">
              <option value="" disabled>Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nombres *</label>
            <input 
              type="text" 
              v-model="personaData.nombres" 
              placeholder="Ej: Juan Carlos" 
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label>Apellidos *</label>
            <input 
              type="text" 
              v-model="personaData.apellidos" 
              placeholder="Ej: Pérez González" 
              maxlength="100"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha de Nacimiento *</label>
            <input 
              type="date" 
              v-model="personaData.fecha_nacimiento" 
              @change="calculateAge"
            />
          </div>

          <div class="form-group">
            <label>Edad</label>
            <input 
              type="number" 
              v-model="personaData.edad" 
              disabled 
              class="disabled-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Empresa Actual</label>
          <input 
            type="text" 
            v-model="personaData.empresa_actual" 
            placeholder="Empresa donde trabajas" 
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label>Idiomas</label>
          <div class="multivalue-input">
            <input 
              type="text" 
              v-model="currentIdioma" 
              placeholder="Ej: Español" 
              @keyup.enter="addIdioma"
            />
            <button type="button" class="add-btn" @click="addIdioma">+</button>
          </div>
          <div class="tag-container">
            <span v-for="(idioma, index) in personaData.idiomas" :key="index" class="tag">
              {{ idioma }}
              <span class="remove-tag" @click="removeIdioma(index)">×</span>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>Habilidades</label>
          <div class="multivalue-input">
            <input 
              type="text" 
              v-model="currentHabilidad" 
              placeholder="Ej: Python" 
              @keyup.enter="addHabilidad"
            />
            <button type="button" class="add-btn" @click="addHabilidad">+</button>
          </div>
          <div class="tag-container">
            <span v-for="(habilidad, index) in personaData.habilidades" :key="index" class="tag">
              {{ habilidad }}
              <span class="remove-tag" @click="removeHabilidad(index)">×</span>
            </span>
          </div>
        </div>

        <!-- Sub-tipo de persona -->
        <div class="form-group">
          <label>Tipo de Persona *</label>
          <div class="person-type-buttons">
            <button 
              class="type-btn" 
              :class="{ 'active': personaTipo === 'estudiante' }"
              @click="personaTipo = 'estudiante'"
            >
              👨‍🎓 Estudiante
            </button>
            <button 
              class="type-btn" 
              :class="{ 'active': personaTipo === 'egresado' }"
              @click="personaTipo = 'egresado'"
            >
              🎓 Egresado
            </button>
            <button 
              class="type-btn" 
              :class="{ 'active': personaTipo === 'profesor' }"
              @click="personaTipo = 'profesor'"
            >
              👨‍🏫 Profesor
            </button>
            <button 
              class="type-btn" 
              :class="{ 'active': personaTipo === 'administrativo' }"
              @click="personaTipo = 'administrativo'"
            >
              💼 Administrativo
            </button>
            <button 
              class="type-btn" 
              :class="{ 'active': personaTipo === 'obrero' }"
              @click="personaTipo = 'obrero'"
            >
              🔧 Obrero
            </button>
          </div>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handlePersonaInfoSubmit">Continuar</button>
        </div>
      </div>

      <!-- Paso 5: Información específica según sub-tipo de PERSONA -->
      <div class="step-view" v-if="currentStep === 5 && userType === 'persona'">
        <h2>Información {{ getPersonaTipoTitle() }}</h2>
        <p class="step-indicator">Paso 5 de {{ totalSteps }}</p>

        <!-- ESTUDIANTE -->
        <div v-if="personaTipo === 'estudiante'">
          <div class="form-group">
            <label>Carrera/Programa *</label>
            <select v-model="estudianteData.carrera">
              <option value="" disabled>Seleccionar carrera...</option>
              <option value="Ingeniería en Computación">Ingeniería en Computación</option>
              <option value="Ingeniería Civil">Ingeniería Civil</option>
              <option value="Administración de Empresas">Administración de Empresas</option>
              <option value="Derecho">Derecho</option>
              <option value="Psicología">Psicología</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Facultad *</label>
              <select v-model="estudianteData.facultad">
                <option value="" disabled>Seleccionar facultad...</option>
                <option value="Ingeniería">Ingeniería</option>
                <option value="Ciencias Económicas y Sociales">Ciencias Económicas y Sociales</option>
                <option value="Derecho">Derecho</option>
                <option value="Humanidades y Educación">Humanidades y Educación</option>
              </select>
            </div>

            <div class="form-group">
              <label>Semestre *</label>
              <select v-model="estudianteData.semestre">
                <option value="" disabled>Seleccionar semestre...</option>
                <option v-for="n in 10" :value="n" :key="n">Semestre {{ n }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Promedio</label>
            <input 
              type="number" 
              v-model="estudianteData.promedio" 
              placeholder="Ej: 18.50" 
              step="0.01" 
              min="0" 
              max="20"
            />
            <small class="hint">Opcional, escala 0-20</small>
          </div>
        </div>

        <!-- EGRESADO -->
        <div v-if="personaTipo === 'egresado'">
          <div class="form-group">
            <label>Facultad *</label>
            <select v-model="egresadoData.facultad">
              <option value="" disabled>Seleccionar facultad...</option>
              <option value="Ingeniería">Ingeniería</option>
              <option value="Ciencias Económicas y Sociales">Ciencias Económicas y Sociales</option>
              <option value="Derecho">Derecho</option>
              <option value="Humanidades y Educación">Humanidades y Educación</option>
            </select>
          </div>

          <div class="form-group">
            <label>Título(s) Obtenido(s) *</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentTitulo" 
                placeholder="Ej: Ingeniero en Computación" 
                @keyup.enter="addTitulo"
              />
              <button type="button" class="add-btn" @click="addTitulo">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(titulo, index) in egresadoData.titulos" :key="index" class="tag">
                {{ titulo }}
                <span class="remove-tag" @click="removeTitulo(index)">×</span>
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Graduación *</label>
              <input 
                type="date" 
                v-model="egresadoData.fecha_grado" 
                max="2024-12-31"
              />
            </div>

            <div class="form-group">
              <label>País *</label>
              <select v-model="egresadoData.pais" @change="updateEstados">
                <option value="" disabled>Seleccionar país...</option>
                <option value="VE">Venezuela</option>
                <option value="CO">Colombia</option>
                <option value="ES">España</option>
                <option value="US">Estados Unidos</option>
                <option value="MX">México</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Estado *</label>
            <select v-model="egresadoData.estado" :disabled="!egresadoData.pais">
              <option value="" disabled>Seleccionar estado...</option>
              <option v-for="estado in estadosDisponibles" :value="estado" :key="estado">
                {{ estado }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Menciones</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentMencion" 
                placeholder="Ej: Cum Laude" 
                @keyup.enter="addMencion"
              />
              <button type="button" class="add-btn" @click="addMencion">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(mencion, index) in egresadoData.menciones" :key="index" class="tag">
                {{ mencion }}
                <span class="remove-tag" @click="removeMencion(index)">×</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Empresa(s) Actual(es)</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentEmpresa" 
                placeholder="Ej: Google" 
                @keyup.enter="addEmpresa"
              />
              <button type="button" class="add-btn" @click="addEmpresa">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(empresa, index) in egresadoData.empresas" :key="index" class="tag">
                {{ empresa }}
                <span class="remove-tag" @click="removeEmpresa(index)">×</span>
              </span>
            </div>
          </div>
        </div>

        <!-- PROFESOR -->
        <div v-if="personaTipo === 'profesor'">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Ingreso *</label>
              <input 
                type="date" 
                v-model="profesorData.fecha_ingreso" 
                max="2024-12-31"
              />
            </div>

            <div class="form-group">
              <label>Categoría *</label>
              <select v-model="profesorData.categoria">
                <option value="" disabled>Seleccionar categoría...</option>
                <option value="Ordinario">Ordinario</option>
                <option value="Contratado">Contratado</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Dedicación *</label>
              <select v-model="profesorData.dedicacion">
                <option value="" disabled>Seleccionar dedicación...</option>
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
              </select>
            </div>

            <div class="form-group">
              <label>Estado *</label>
              <select v-model="profesorData.estado">
                <option value="" disabled>Seleccionar estado...</option>
                <option value="activo">Activo</option>
                <option value="Jubilado">Jubilado</option>
              </select>
            </div>
          </div>

          <div v-if="profesorData.estado === 'Jubilado'" class="form-group">
            <label>Fecha de Retiro</label>
            <input 
              type="date" 
              v-model="profesorData.fecha_fin" 
              :min="profesorData.fecha_ingreso"
            />
          </div>

          <div class="form-group">
            <label>Facultades</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentFacultad" 
                placeholder="Ej: Ingeniería" 
                @keyup.enter="addFacultad"
              />
              <button type="button" class="add-btn" @click="addFacultad">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(facultad, index) in profesorData.facultades" :key="index" class="tag">
                {{ facultad }}
                <span class="remove-tag" @click="removeFacultad(index)">×</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Departamentos</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentDepartamento" 
                placeholder="Ej: Departamento de Computación" 
                @keyup.enter="addDepartamento"
              />
              <button type="button" class="add-btn" @click="addDepartamento">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(depto, index) in profesorData.departamentos" :key="index" class="tag">
                {{ depto }}
                <span class="remove-tag" @click="removeDepartamento(index)">×</span>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label>Materias Impartidas</label>
            <div class="multivalue-input">
              <input 
                type="text" 
                v-model="currentMateria" 
                placeholder="Ej: Programación I" 
                @keyup.enter="addMateria"
              />
              <button type="button" class="add-btn" @click="addMateria">+</button>
            </div>
            <div class="tag-container">
              <span v-for="(materia, index) in profesorData.materias" :key="index" class="tag">
                {{ materia }}
                <span class="remove-tag" @click="removeMateria(index)">×</span>
              </span>
            </div>
          </div>
        </div>

        <!-- ADMINISTRATIVO -->
        <div v-if="personaTipo === 'administrativo'">
          <div class="form-group">
            <label>Cargo *</label>
            <input 
              type="text" 
              v-model="administrativoData.cargo" 
              placeholder="Ej: Jefe de Departamento" 
              maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>Ubicación de Trabajo *</label>
            <input 
              type="text" 
              v-model="administrativoData.ubicacion" 
              placeholder="Ej: Edificio A, Piso 3" 
              maxlength="200"
            />
          </div>

          <div class="form-group">
            <label>Dedicación *</label>
            <select v-model="administrativoData.dedicacion">
              <option value="" disabled>Seleccionar dedicación...</option>
              <option value="Tiempo Completo">Tiempo Completo</option>
              <option value="Medio Tiempo">Medio Tiempo</option>
            </select>
          </div>
        </div>

        <!-- OBRERO -->
        <div v-if="personaTipo === 'obrero'">
          <div class="form-group">
            <label>Cargo *</label>
            <input 
              type="text" 
              v-model="obreroData.cargo" 
              placeholder="Ej: Mantenimiento" 
              maxlength="50"
            />
          </div>

          <div class="form-group">
            <label>Dedicación *</label>
            <select v-model="obreroData.dedicacion">
              <option value="" disabled>Seleccionar dedicación...</option>
              <option value="Tiempo Completo">Tiempo Completo</option>
              <option value="Medio Tiempo">Medio Tiempo</option>
            </select>
          </div>

          <div class="form-group">
            <label>Empresa a la que pertenece *</label>
            <input 
              type="text" 
              v-model="obreroData.empresa" 
              placeholder="Ej: UCAB o Empresa Contratista" 
              maxlength="50"
            />
          </div>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 4">Atrás</button>
          <button class="primary-btn" @click="handleSpecificInfoSubmit">
            {{ isLastStep ? 'Crear Cuenta' : 'Continuar' }}
          </button>
        </div>
      </div>

      <!-- Paso 4-5: DEPENDENCIA -->
      <div class="step-view" v-if="currentStep === 4 && userType === 'dependencia'">
        <h2>Información de Dependencia</h2>
        <p class="step-indicator">Paso 4 de {{ totalSteps }}</p>
        
        <div class="form-group">
          <label>Nombre Institucional *</label>
          <input 
            type="text" 
            v-model="dependenciaData.nombre" 
            placeholder="Ej: Departamento de Computación" 
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label>Descripción *</label>
          <textarea 
            v-model="dependenciaData.descripcion" 
            placeholder="Describe las funciones de la dependencia..." 
            rows="4"
            @input="validateDescripcion"
          ></textarea>
          <small class="char-count">{{ dependenciaData.descripcion?.length || 0 }}/500</small>
          <small v-if="descripcionError" class="error-text">{{ descripcionError }}</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Logo (URL)</label>
            <input 
              type="url" 
              v-model="dependenciaData.logo" 
              placeholder="https://ejemplo.com/logo.png" 
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label>Página Web</label>
            <input 
              type="url" 
              v-model="dependenciaData.pagina_web" 
              placeholder="https://ejemplo.com" 
              maxlength="255"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha de Creación</label>
            <input 
              type="date" 
              v-model="dependenciaData.fecha_creacion" 
            />
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select v-model="dependenciaData.estado">
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Responsable</label>
            <input 
              type="text" 
              v-model="dependenciaData.responsable" 
              placeholder="Nombre del responsable" 
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label>Edificio</label>
            <input 
              type="text" 
              v-model="dependenciaData.edificio" 
              placeholder="Ej: Edificio A" 
              maxlength="50"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Ubicación Física</label>
          <textarea 
            v-model="dependenciaData.ubicacion" 
            placeholder="Ubicación exacta en el campus..." 
            rows="2"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Tipo de Dependencia *</label>
          <select v-model="dependenciaData.tipo">
            <option value="" disabled>Seleccionar tipo...</option>
            <option value="Académica">Académica</option>
            <option value="Administrativa">Administrativa</option>
            <option value="Servicios">Servicios</option>
          </select>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handleDependenciaSubmit">
            {{ isLastStep ? 'Crear Cuenta' : 'Continuar' }}
          </button>
        </div>
      </div>

      <!-- Paso 4-5: ORGANIZACIÓN -->
      <div class="step-view" v-if="currentStep === 4 && userType === 'organizacion'">
        <h2>Información de Organización</h2>
        <p class="step-indicator">Paso 4 de {{ totalSteps }}</p>
        
        <div class="form-group">
          <label>RIF *</label>
          <input 
            type="text" 
            v-model="organizacionData.rif" 
            placeholder="Ej: J-12345678-9" 
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label>Nombre/Razón Social *</label>
          <input 
            type="text" 
            v-model="organizacionData.nombre" 
            placeholder="Nombre de la organización" 
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea 
            v-model="organizacionData.descripcion" 
            placeholder="Describe las actividades y propósito de la organización..." 
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Logo (URL)</label>
            <input 
              type="url" 
              v-model="organizacionData.logo" 
              placeholder="https://ejemplo.com/logo.png" 
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label>Página Web</label>
            <input 
              type="url" 
              v-model="organizacionData.pagina_web" 
              placeholder="https://ejemplo.com" 
              maxlength="255"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Tipos de Colaboración</label>
          <div class="multivalue-input">
            <input 
              type="text" 
              v-model="currentColaboracion" 
              placeholder="Ej: Investigación, Eventos" 
              @keyup.enter="addColaboracion"
            />
            <button type="button" class="add-btn" @click="addColaboracion">+</button>
          </div>
          <div class="tag-container">
            <span v-for="(colab, index) in organizacionData.colaboraciones" :key="index" class="tag">
              {{ colab }}
              <span class="remove-tag" @click="removeColaboracion(index)">×</span>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Organización *</label>
          <select v-model="organizacionData.tipo">
            <option value="" disabled>Seleccionar tipo...</option>
            <option value="Estudiantil">Estudiantil</option>
            <option value="Académica">Académica</option>
            <option value="Cultural">Cultural</option>
            <option value="Deportiva">Deportiva</option>
          </select>
        </div>

        <div class="button-group">
          <button class="secondary-btn" @click="currentStep = 3">Atrás</button>
          <button class="primary-btn" @click="handleOrganizacionSubmit">
            {{ isLastStep ? 'Crear Cuenta' : 'Continuar' }}
          </button>
        </div>
      </div>

      <!-- Paso final: Confirmación -->
      <div class="step-view confirmation-view" v-if="currentStep === 6">
        <div class="confirmation-icon">✅</div>
        <h2>¡Cuenta Creada Exitosamente!</h2>
        <p class="confirmation-message">
          Bienvenido/a a SoyUCAB, {{ getUserDisplayName() }}.
          Tu cuenta ha sido registrada correctamente.
        </p>
        <button class="primary-btn" @click="handleConfirmation">
          Continuar a la Plataforma
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';

// Estados principales
const isLoginActive = ref(false);
const currentStep = ref(1);
const showPassword = ref(false);

// Datos básicos
const email = ref('');
const loginEmail = ref('');
const loginPassword = ref('');

// Tipo de usuario
const userType = ref('');
const personaTipo = ref('');

// Datos del formulario
const userData = reactive({
  telefono: '',
  nombre_usuario: '',
  contrasena: '',
  biografia: ''
});

const passwordStrength = reactive({
  valid: false
});

// Datos de persona
const personaData = reactive({
  ci: '',
  sexo: '',
  nombres: '',
  apellidos: '',
  fecha_nacimiento: '',
  edad: 0,
  empresa_actual: '',
  idiomas: [],
  habilidades: []
});

// Datos específicos por tipo
const estudianteData = reactive({
  carrera: '',
  facultad: '',
  semestre: '',
  promedio: ''
});

const egresadoData = reactive({
  facultad: '',
  titulos: [],
  fecha_grado: '',
  pais: '',
  estado: '',
  menciones: [],
  empresas: []
});

const profesorData = reactive({
  fecha_ingreso: '',
  categoria: '',
  dedicacion: '',
  estado: '',
  fecha_fin: '',
  facultades: [],
  departamentos: [],
  materias: []
});

const administrativoData = reactive({
  cargo: '',
  ubicacion: '',
  dedicacion: ''
});

const obreroData = reactive({
  cargo: '',
  dedicacion: '',
  empresa: ''
});

const dependenciaData = reactive({
  nombre: '',
  descripcion: '',
  logo: '',
  pagina_web: '',
  fecha_creacion: '',
  estado: 'Activa',
  responsable: '',
  ubicacion: '',
  edificio: '',
  tipo: ''
});

const organizacionData = reactive({
  rif: '',
  nombre: '',
  descripcion: '',
  logo: '',
  pagina_web: '',
  colaboraciones: [],
  tipo: ''
});

// Estados para inputs multivalor
const currentIdioma = ref('');
const currentHabilidad = ref('');
const currentTitulo = ref('');
const currentMencion = ref('');
const currentEmpresa = ref('');
const currentFacultad = ref('');
const currentDepartamento = ref('');
const currentMateria = ref('');
const currentColaboracion = ref('');

// Estados de países y estados
const estadosDisponibles = ref([]);
const descripcionError = ref('');

// Computed properties
const totalSteps = computed(() => {
  if (userType.value === 'persona') return 5;
  return 4;
});

const isLastStep = computed(() => {
  return currentStep.value === totalSteps.value;
});

// Mapeo de estados por país
const estadosPorPais = {
  'VE': ['Caracas', 'Zulia', 'Miranda', 'Carabobo', 'Aragua', 'Lara', 'Bolívar'],
  'CO': ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Santander', 'Cundinamarca'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Andalucía'],
  'US': ['Florida', 'California', 'Texas', 'Nueva York', 'Illinois'],
  'MX': ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Veracruz']
};

// Métodos
const switchToLogin = () => {
  isLoginActive.value = true;
};

const switchToRegister = () => {
  isLoginActive.value = false;
  currentStep.value = 1;
};

const handleEmailSubmit = () => {
  if (email.value && email.value.includes('@')) {
    currentStep.value = 2;
  } else {
    alert('Por favor ingresa un correo electrónico válido');
  }
};

const handleLogin = () => {
  // Aquí iría la lógica de autenticación
  alert('Login functionality would be implemented here');
};

const validatePassword = () => {
  const password = userData.contrasena;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[$_\.%&!-]/.test(password);
  const hasMinLength = password.length >= 8;
  
  passwordStrength.valid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength;
};

const handleBasicInfoSubmit = () => {
  if (!userData.telefono || !userData.nombre_usuario || !userData.contrasena) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  if (!passwordStrength.valid) {
    alert('La contraseña no cumple con los requisitos de seguridad');
    return;
  }
  
  currentStep.value = 3;
};

const selectUserType = (type) => {
  userType.value = type;
};

const handleUserTypeSubmit = () => {
  if (!userType.value) {
    alert('Por favor selecciona un tipo de usuario');
    return;
  }
  
  if (userType.value === 'persona') {
    currentStep.value = 4;
  } else {
    // Dependencia u Organización van directo al paso 4 (que es su último paso)
    currentStep.value = 4;
  }
};

const calculateAge = () => {
  if (personaData.fecha_nacimiento) {
    const birthDate = new Date(personaData.fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    personaData.edad = age;
  }
};

// Métodos para arrays multivalor (idiomas)
const addIdioma = () => {
  if (currentIdioma.value.trim()) {
    personaData.idiomas.push(currentIdioma.value.trim());
    currentIdioma.value = '';
  }
};

const removeIdioma = (index) => {
  personaData.idiomas.splice(index, 1);
};

// Métodos para arrays multivalor (habilidades)
const addHabilidad = () => {
  if (currentHabilidad.value.trim()) {
    personaData.habilidades.push(currentHabilidad.value.trim());
    currentHabilidad.value = '';
  }
};

const removeHabilidad = (index) => {
  personaData.habilidades.splice(index, 1);
};

// Métodos para arrays multivalor (egresado)
const addTitulo = () => {
  if (currentTitulo.value.trim()) {
    egresadoData.titulos.push(currentTitulo.value.trim());
    currentTitulo.value = '';
  }
};

const removeTitulo = (index) => {
  egresadoData.titulos.splice(index, 1);
};

const addMencion = () => {
  if (currentMencion.value.trim()) {
    egresadoData.menciones.push(currentMencion.value.trim());
    currentMencion.value = '';
  }
};

const removeMencion = (index) => {
  egresadoData.menciones.splice(index, 1);
};

const addEmpresa = () => {
  if (currentEmpresa.value.trim()) {
    egresadoData.empresas.push(currentEmpresa.value.trim());
    currentEmpresa.value = '';
  }
};

const removeEmpresa = (index) => {
  egresadoData.empresas.splice(index, 1);
};

// Métodos para arrays multivalor (profesor)
const addFacultad = () => {
  if (currentFacultad.value.trim()) {
    profesorData.facultades.push(currentFacultad.value.trim());
    currentFacultad.value = '';
  }
};

const removeFacultad = (index) => {
  profesorData.facultades.splice(index, 1);
};

const addDepartamento = () => {
  if (currentDepartamento.value.trim()) {
    profesorData.departamentos.push(currentDepartamento.value.trim());
    currentDepartamento.value = '';
  }
};

const removeDepartamento = (index) => {
  profesorData.departamentos.splice(index, 1);
};

const addMateria = () => {
  if (currentMateria.value.trim()) {
    profesorData.materias.push(currentMateria.value.trim());
    currentMateria.value = '';
  }
};

const removeMateria = (index) => {
  profesorData.materias.splice(index, 1);
};

// Métodos para arrays multivalor (organización)
const addColaboracion = () => {
  if (currentColaboracion.value.trim()) {
    organizacionData.colaboraciones.push(currentColaboracion.value.trim());
    currentColaboracion.value = '';
  }
};

const removeColaboracion = (index) => {
  organizacionData.colaboraciones.splice(index, 1);
};

const handlePersonaInfoSubmit = () => {
  // Validar campos obligatorios
  if (!personaData.ci || !personaData.sexo || !personaData.nombres || !personaData.apellidos || 
      !personaData.fecha_nacimiento || !personaTipo.value) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  // Validar edad
  if (personaData.edad < 16 || personaData.edad > 110) {
    alert('La edad debe estar entre 16 y 110 años');
    return;
  }
  
  // Validar CI
  if (personaData.ci.length < 7) {
    alert('La cédula debe tener al menos 7 caracteres');
    return;
  }
  
  currentStep.value = 5;
};

const getPersonaTipoTitle = () => {
  const titles = {
    'estudiante': 'Estudiantil',
    'egresado': 'de Egresado',
    'profesor': 'Profesoral',
    'administrativo': 'Administrativa',
    'obrero': 'de Personal Obrero'
  };
  return titles[personaTipo.value] || '';
};

const updateEstados = () => {
  if (egresadoData.pais && estadosPorPais[egresadoData.pais]) {
    estadosDisponibles.value = estadosPorPais[egresadoData.pais];
    egresadoData.estado = '';
  } else {
    estadosDisponibles.value = [];
    egresadoData.estado = '';
  }
};

const validateDescripcion = () => {
  const desc = dependenciaData.descripcion;
  if (desc && desc.length < 50) {
    descripcionError.value = 'La descripción debe tener al menos 50 caracteres';
  } else if (desc && desc.length > 500) {
    descripcionError.value = 'La descripción no puede exceder 500 caracteres';
  } else {
    descripcionError.value = '';
  }
};

const handleSpecificInfoSubmit = () => {
  // Validaciones específicas según tipo
  let isValid = true;
  let errorMessage = '';
  
  if (personaTipo.value === 'estudiante') {
    if (!estudianteData.carrera || !estudianteData.facultad || !estudianteData.semestre) {
      isValid = false;
      errorMessage = 'Por favor completa todos los campos obligatorios del estudiante';
    }
  } else if (personaTipo.value === 'egresado') {
    if (!egresadoData.facultad || !egresadoData.titulos.length || !egresadoData.fecha_grado || 
        !egresadoData.pais || !egresadoData.estado) {
      isValid = false;
      errorMessage = 'Por favor completa todos los campos obligatorios del egresado';
    }
  } else if (personaTipo.value === 'profesor') {
    if (!profesorData.fecha_ingreso || !profesorData.categoria || !profesorData.dedicacion || 
        !profesorData.estado) {
      isValid = false;
      errorMessage = 'Por favor completa todos los campos obligatorios del profesor';
    }
  } else if (personaTipo.value === 'administrativo') {
    if (!administrativoData.cargo || !administrativoData.ubicacion || !administrativoData.dedicacion) {
      isValid = false;
      errorMessage = 'Por favor completa todos los campos obligatorios del administrativo';
    }
  } else if (personaTipo.value === 'obrero') {
    if (!obreroData.cargo || !obreroData.dedicacion || !obreroData.empresa) {
      isValid = false;
      errorMessage = 'Por favor completa todos los campos obligatorios del personal obrero';
    }
  }
  
  if (!isValid) {
    alert(errorMessage);
    return;
  }
  
  // Simular creación de cuenta
  currentStep.value = 6;
};

const handleDependenciaSubmit = () => {
  if (!dependenciaData.nombre || !dependenciaData.descripcion || !dependenciaData.tipo) {
    alert('Por favor completa todos los campos obligatorios de la dependencia');
    return;
  }
  
  if (dependenciaData.descripcion.length < 50) {
    alert('La descripción debe tener al menos 50 caracteres');
    return;
  }
  
  // Simular creación de cuenta
  currentStep.value = 6;
};

const handleOrganizacionSubmit = () => {
  if (!organizacionData.rif || !organizacionData.nombre || !organizacionData.tipo) {
    alert('Por favor completa todos los campos obligatorios de la organización');
    return;
  }
  
  // Simular creación de cuenta
  currentStep.value = 6;
};

const getUserDisplayName = () => {
  if (userType.value === 'persona') {
    return `${personaData.nombres} ${personaData.apellidos}`;
  } else if (userType.value === 'dependencia') {
    return dependenciaData.nombre;
  } else if (userType.value === 'organizacion') {
    return organizacionData.nombre;
  }
  return 'Usuario';
};

const handleConfirmation = () => {
  // Aquí se redirigiría al dashboard o página principal
  alert('Redirigiendo a la plataforma...');
  // window.location.href = '/dashboard';
};
</script>

