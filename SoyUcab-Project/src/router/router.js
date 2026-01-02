import { createRouter, createWebHistory } from 'vue-router'
import usuarioServices from '@/services/usuarioServices' // Importamos el servicio

const routes = [
  {
    path: '/',
    redirect: '/principalview'
  },
  {
    path: '/principalview',
    name: 'firstview',
    component: () => import('../components/PrincipalView.vue'),
    meta: { requiresAuth: false } // Ruta pública (landing/login)
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/home.vue'),
    meta: { requiresAuth: true } // Ruta protegida
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../components/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/groupdashboard/:name',
    name: 'GroupDashboard',
    component: () => import('../components/GroupDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Reportes protegidos
  {
    path: '/tutores-report',
    name: 'TutoresReport',
    component: () => import('../components/reportesVue/TutoresReport.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reconocimiento-report',
    name: 'ReconocimientoReport',
    component: () => import('../components/reportesVue/ReconocimientoProfesores.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/map-egresados',
    name: 'GraduatesMap',
    component: () => import('../components/reportesVue/MapaEgresados.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/all-reports',
    name: 'AllReports',
    component: () => import('../components/reportesVue/allReports.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- GUARD DE NAVEGACIÓN (PROTECCIÓN) ---
router.beforeEach((to, from, next) => {
  const isLogged = usuarioServices.isAuthenticated();

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isLogged) {
    console.warn('Acceso denegado: Se requiere inicio de sesión');
    next('/principalview'); // Redirigir al login/landing
  }
  // Si el usuario ya está logueado e intenta ir al login/landing
  else if (to.path === '/principalview' && isLogged) {
    next('/home'); // Redirigir al home
  }
  else {
    next(); // Permitir el paso
  }
})

export default router