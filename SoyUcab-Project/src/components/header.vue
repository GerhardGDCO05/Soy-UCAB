<template>
    <header>
        <div class="logoUcab">
            <img src="/logo-ucab3.png" alt="Logo Ucab">
        </div>
        
        <div class="buscador">
            <input type="text" placeholder="Buscar...">
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
    methods: {
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
        },
    }
};
</script>