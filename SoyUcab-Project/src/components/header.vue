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
            <button id="campana" title="Notificaciones"></button>
            <button id="perfil" @click="gotoProfile" title="Mi Perfil"></button>
            
            <button id="reportsButtom" @click="gotoAllReports">
                <div class="contenido-boton">
                <img src="/insignia.png" alt="Reportes">
                <h2>Reportes</h2>
                </div>
            </button>
        </div>
    </header>
</template>

<script>
import { reportButtom, Home } from '@/services/metodosGenerales';

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
        }
    }
};
</script>