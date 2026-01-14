<template>
    <section class="principal-box">
        <HeaderBar/>
        
        <section class="filter">
            <h1>Reportes</h1>
            <h2>Reconocimiento a Profesores</h2>
            
            <div v-if="error" class="error-state">
                <span class="error-message">{{ error }}</span>
                <button @click="loadMentions" class="retry-button">
                    Reintentar
                </button>
            </div>
        </section>

        <section class="Content">
            <section class='info-container'>
                
                <section v-if="profesores.length > 0">
                    <div class='info' v-for="profesor in profesores" :key="profesor.nombre_usuario + profesor.nombre_reconocimiento">
                        
                        <div class='icono'>
                            <img src='/usuario.png' alt='icono'>
                        </div>
                        
                        <div class='info-personal info-prof'>
                            <h2>{{ profesor.nombre_completo || 'Nombre no disponible' }}</h2>
                            <p class="titulo">{{ profesor.nombre_titulo || 'Título no especificado' }}</p>
                            <p class="usuario">@{{ profesor.nombre_usuario || 'usuario' }}</p>
                            
                            <div class='card-body'>
                                <div class='reconocimiento-info'>
                                    <p>
                                        <strong>Reconocimiento:</strong> 
                                        {{ profesor.nombre_reconocimiento || 'No especificado' }} 
                                        <span v-if="profesor.anio_reconocimiento">({{ profesor.anio_reconocimiento }})</span>
                                    </p>
                                    <p><strong>Tipo:</strong> {{ profesor.tipo_reconocimiento || 'No especificado' }}</p>
                                    <p v-if="profesor.nombre_facultad"><strong>Facultad:</strong> {{ profesor.nombre_facultad }}</p>
                                </div>
                                
                                <button class='btn-ver-perfil' @click="verPerfil(profesor.nombre_usuario)">
                                    <span>Ver perfil</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div v-if="!loading && !error && profesores.length === 0" class="no-data-message">
                    No hay reconocimientos registrados actualmente.
                </div>
            </section>
        </section>
    </section>
</template>

<script>
import HeaderBar from '../header.vue';
import usuarioServices from '../../services/usuarioServices';

export default {
    name: 'ReconocimientoReport',
    components: {
        HeaderBar  
    },
    data() {
        return {
            profesores: [],
            loading: true,
            error: null,
        };
    },
    async mounted() {
        await this.loadMentions();
    },
    methods: {
        async loadMentions() {
            try {
                this.loading = true;
                this.error = null;
                
                // Llamada al servicio
                const result = await usuarioServices.getMentionsReport();
                
                if (result && result.success) {
                    // Validamos que sea un array antes de asignar
                    this.profesores = Array.isArray(result.data) ? result.data : [];
                } else {
                    this.error = result?.error || 'Error al cargar los reconocimientos';
                }
            } catch (error) {
                console.error('Error en loadMentions:', error);
                this.error = 'Error de conexión con el servidor';
            } finally {
                this.loading = false;
            }
        },
        verPerfil(username) {
            if (username) {
                this.$router.push(`/profile/${username}`);
            }
        }
    }
};
</script>