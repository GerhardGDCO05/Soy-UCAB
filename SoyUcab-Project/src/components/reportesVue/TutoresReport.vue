<template>
    <section class="principal-box">
        <HeaderBar />
        
        <section class="filter">
            <h1>Reportes</h1>
            <h2>Tutores Activos</h2>
            <p>Listado de tutores del semestre actual</p>
            
            <div class="filter-controls">
                <div class="combo-box principal-combo">
                    <label for="filter-select">Filtrar por:</label>
                    <select id="filter-select" v-model="selectedFilter" @change="onFilterChange">
                        <option value="" disabled>Seleccionar</option>
                        <option v-for="filter in filters" :key="filter" :value="filter">
                            {{ filter }} 
                        </option>
                    </select>
                </div>

                <div class="combo-box secondary-combo" v-if="selectedFilter === 'Materias'">
                    <label for="materia-select">Materia:</label>
                    <select id="materia-select" v-model="selectedOption" @change="onSecondarySelect">
                        <option value="" disabled>Seleccionar materia</option>
                        <option v-for="materia in materiasList" :key="materia" :value="materia">
                            {{ materia }}
                        </option>
                    </select>
                </div>

                <div class="combo-box secondary-combo" v-if="selectedFilter === 'Facultad'">
                    <label for="facultad-select">Facultad:</label>
                    <select id="facultad-select" v-model="selectedOption" @change="onSecondarySelect">
                        <option value="" disabled>Seleccionar facultad</option>
                        <option v-for="facultad in facultadesList" :key="facultad" :value="facultad">
                            {{ facultad }}
                        </option>
                    </select>
                </div>
            </div>
        </section>

        <section class="Content">
            <section v-if="loading" class="loading-container">
                <div class="loading">Cargando tutores...</div>
            </section>

            <section v-else-if="error" class="error-container">
                <div class="error">{{ error }}</div>
                <button @click="loadTutors" class="retry-button">Reintentar</button>
            </section>

            <section v-else class='info-container'>
                <section v-if="users.length === 0" class="no-data">
                    <p>No hay tutores registrados en el sistema.</p>
                </section>

                <section v-else-if="!selectedOption">
                    <div class='info' v-for="(user, index) in users" :key="'all-' + index">
                        <div class='icono'>
                            <img src='/usuario.png' alt='icono'>
                        </div>
                        <div class='info-personal'>
                            <h2>{{ user.nombre_tutor }}</h2>
                            <p class="username">@{{ user.nombre_usuario }}</p>
                            <p><strong>Título:</strong> {{ user.titulo_academico }}</p>
                            <p><strong>Materias:</strong> {{ user.materias_tutor || 'No especificado' }}</p>
                            <p><strong>Facultad:</strong> {{ user.nombre_facultad || 'No especificado' }}</p>
                            <div class="stats-badge">
                                <strong>Estudiantes a cargo:</strong> {{ user.cantidad_estudiantes }}
                            </div>
                        </div>
                        <button class='btn-ver-perfil' @click="irAPerfil(user.nombre_usuario)">
                            <span>Ver Perfil</span>
                        </button>
                    </div>
                </section>

                <section v-else-if="selectedOption && filteredUsers.length > 0">  
                    <div class='info' v-for="(user, index) in filteredUsers" :key="'filt-' + index">
                        <div class='icono'>
                            <img src='/usuario.png' alt='icono'>
                        </div>
                        <div class='info-personal'>
                            <h2>{{ user.nombre_tutor }}</h2>
                            <p class="username">@{{ user.nombre_usuario }}</p>
                            <p><strong>Título:</strong> {{ user.titulo_academico }}</p>
                            <p><strong>Materias:</strong> {{ user.materias_tutor }}</p>
                            <p><strong>Facultad:</strong> {{ user.nombre_facultad }}</p>
                            <p><strong>Estudiantes:</strong> {{ user.cantidad_estudiantes }}</p>
                        </div>
                        <button class='btn-ver-perfil' @click="irAPerfil(user.nombre_usuario)">
                            <span>Ver Perfil</span>
                        </button>
                    </div>
                </section>

                <section v-else class="no-results">
                    <p>No se encontraron tutores para: <strong>{{ selectedOption }}</strong></p>
                </section>
            </section>
        </section>
    </section>
</template>

<script>
import HeaderBar from '../header.vue';  
import usuarioServices from '../../services/usuarioServices';

export default {
    name: 'TutoresReport',
    components: {
        HeaderBar  
    },
    data() {
        return {
            selectedFilter: '',
            selectedOption: '',
            users: [],
            loading: false,
            error: null,
            filters: ['Facultad', 'Materias']
        };
    },
    computed: {
        // Genera lista única de materias a partir de los strings separados por comas
        materiasList() {
            const materiasSet = new Set();
            this.users.forEach(user => {
                if (user.materias_tutor && user.materias_tutor !== 'No especificado') {
                    user.materias_tutor.split(',').forEach(materia => {
                        const trimmed = materia.trim();
                        if (trimmed) materiasSet.add(trimmed);
                    });
                }
            });
            return Array.from(materiasSet).sort();
        },
        
        // Genera lista única de facultades
        facultadesList() {
            const facultadesSet = new Set();
            this.users.forEach(user => {
                if (user.nombre_facultad && user.nombre_facultad !== 'No especificado') {
                    user.nombre_facultad.split(',').forEach(fac => {
                        const trimmed = fac.trim();
                        if (trimmed) facultadesSet.add(trimmed);
                    });
                }
            });
            return Array.from(facultadesSet).sort();
        },
        
        // Lógica de filtrado reactivo
        filteredUsers() {
            if (!this.selectedOption || !this.selectedFilter) return [];
            
            return this.users.filter(user => {
                const targetField = this.selectedFilter === 'Materias' 
                    ? user.materias_tutor 
                    : user.nombre_facultad;

                if (!targetField || targetField === 'No especificado') return false;

                return targetField.split(',')
                    .map(item => item.trim())
                    .includes(this.selectedOption);
            });
        }
    },
    async created() {
        await this.loadTutors();
    },
    methods: {
        async loadTutors() {
            try {
                this.loading = true;
                this.error = null;
                const result = await usuarioServices.getTutorsReport();
                
                if (result.success && result.data) {
                    this.users = result.data;
                } else {
                    this.error = result.error || 'Error al obtener la lista de tutores';
                }
            } catch (err) {
                this.error = 'Error de conexión: ' + err.message;
            } finally {
                this.loading = false;
            }
        },
        
        onFilterChange() {
            this.selectedOption = ''; // Resetear selección secundaria al cambiar filtro principal
        },
        
        onSecondarySelect() {
            // Lógica adicional si se requiere al seleccionar una opción específica
        },

        irAPerfil(username) {
            this.$router.push(`/profile/${username}`);
        }
    }
};
</script>