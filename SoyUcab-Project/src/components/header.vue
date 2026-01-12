<template>
    <header>
        <div class="logoUcab">
            <img src="/logo-ucab3.png" alt="Logo Ucab">
        </div>
        
        <div class="buscador">
            <input 
                type="text" 
                placeholder="Buscar personas, grupos, organizaciones..." 
                v-model="searchQuery"
                @input="handleSearch"
                @focus="showResults = true"
            >
            <div v-if="showResults && searchResults.length > 0" class="search-results">
                <div 
                    v-for="result in searchResults" 
                    :key="result.id" 
                    class="search-result-item"
                >
                    <div class="result-info">
                        <strong>{{ result.nombre }}</strong>
                        <small>{{ result.tipo }} • @{{ result.handle }}</small>
                    </div>
                    <div class="result-actions">
                        <button 
                            v-if="result.tipo === 'Persona'" 
                            @click="handleFollow(result.id, true)"
                            class="btn-seguir"
                        >
                            Seguir
                        </button>
                        <button 
                            v-if="result.tipo === 'Persona'" 
                            @click="handleFollow(result.id, false)"
                            class="btn-amistad"
                        >
                            Amistad
                        </button>
                        <button 
                            v-if="result.tipo === 'Dependencia' || result.tipo === 'Organizacion'" 
                            @click="handleFollow(result.id, true)"
                            class="btn-seguir"
                        >
                            Seguir
                        </button>
                        <div v-if="result.tipo === 'Grupo'" class="result-actions">
                            <button 
                                v-if="userGroups.has(result.id)" 
                                @click="goToGroup(result.id)"
                                class="btn-ver"
                            >
                                Ver
                            </button>
                            <button 
                                v-else 
                                @click="handleJoinGroup(result.id)"
                                class="btn-join-group"
                            >
                                Unirse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="NavBar">
            <button id="home" @click="gotoHome" title="Inicio"></button>
            <button id="conversaciones" title="Mensajes"></button>
            <button id="campana" @click="gotoNotifications" title="Notificaciones"></button>
            <button id="perfil" @click="gotoProfile" title="Mi Perfil"></button>
            
            <button id="reportsButtom" @click="gotoAllReports">
                <div class="contenido-boton">
                <img src="/insignia.png" alt="Reportes">
                <h2>Reportes</h2>
                </div>
            </button>
            <button @click="handleLogout" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesión
            </button>
        </div>
    </header>
</template>

<script>
import { reportButtom, Home } from '@/services/metodosGenerales';
import api from '../services/usuarioServices.js'

export default {
    name: 'HeaderBar',
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            showResults: false,
            searchTimeout: null,
            userGroups: new Set()
        };
    },
    async mounted() {
        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', this.handleClickOutside);
        await this.loadUserGroups();
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        handleSearch() {
            clearTimeout(this.searchTimeout);
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
            }
            this.searchTimeout = setTimeout(async () => {
                const result = await api.searchGlobal(this.searchQuery);
                if (result.success) {
                    this.searchResults = result.data;
                    this.showResults = true;
                }
            }, 300);
        },
        
        async handleFollow(targetEmail, esSeguimiento) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.email) {
                alert('Debes iniciar sesión');
                return;
            }
            
            try {
                const result = await api.createRelation(targetEmail, esSeguimiento);
                if (result.success) {
                    alert(esSeguimiento ? 'Ahora sigues a este usuario' : 'Solicitud de amistad enviada');
                    this.searchResults = this.searchResults.filter(r => r.id !== targetEmail);
                } else {
                    alert(result.error || 'Error al crear relación');
                }
            } catch (e) {
                console.error(e);
                alert('Error al procesar la solicitud');
            }
        },
        
        goToGroup(groupName) {
            this.$router.push({ name: 'GroupDashboard', params: { name: groupName } });
            this.showResults = false;
        },

        async loadUserGroups() {
            try {
                const res = await api.getMyGroups();
                if (res.success && res.data) {
                    this.userGroups = new Set(res.data.map(g => g.nombre));
                }
            } catch (e) {
                console.error("Error cargando grupos del usuario:", e);
            }
        },

        async handleJoinGroup(groupName) {
            try {
                const res = await api.joinGroup(groupName);
                if (res.success) {
                    alert(res.message || 'Te has unido al grupo');
                    await this.loadUserGroups(); // Refrescar lista
                    this.showResults = false;
                } else {
                    alert(res.error || 'No se pudo unir al grupo');
                }
            } catch (e) {
                console.error(e);
                alert('Error al unirse al grupo');
            }
        },
        
        handleClickOutside(event) {
            if (!event.target.closest('.buscador')) {
                this.showResults = false;
            }
        },
        
        gotoAllReports() {
            reportButtom();
        },
        gotoHome() {
            Home();
        },
        gotoProfile() {
            if (this.$route.path !== '/profile') {
            this.$router.push('/profile');
            }
        },
        handleLogout() {
            api.logout();
            window.location.href = '/principalview';
        },
        gotoNotifications() {
            if (this.$route.path !== '/notifications') {
                this.$router.push('/notifications');
            }
        }
    }
};
</script>