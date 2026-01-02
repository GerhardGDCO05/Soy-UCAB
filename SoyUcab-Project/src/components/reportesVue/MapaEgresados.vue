<template>
  <div class="reports-page map-view">
    <header>
      <div class="logoUcab">
        <img src="../../../public/logo-ucab3.png" alt="Logo Ucab">
      </div>
      <div class="buscador">
        <input 
          type="text" 
          placeholder="Buscar..."
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
        <button id='home' @click="Home()"></button>
        <button id='conversaciones'></button>
        <button id='campana'></button>
        <button id='perfil' @click="gotoProfile()"></button>
        <button id='reportsButtom' @click="reportButtom()">
          <div class="contenido-boton">
            <img src='../../../public/insignia.png' alt='Reportes'>
            <h2>Reportes</h2>
          </div>
        </button>
         <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
              Cerrar Sesión
          </button>
      </div>
    </header>

    <div class="map-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Reportes | Mapa</h2>
          <h3>Amigos en el mapa</h3>
        </div>

        <div class="statistics-section">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-content">
              <h3>Total de egresados</h3>
              <p class="stat-number">{{ totalEgresados }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-globe-americas"></i></div>
            <div class="stat-content">
              <h3>Países con egresados</h3>
              <p class="stat-number">{{ uniqueCountriesCount }}</p>
            </div>
          </div>

          <div v-if="loading" class="loading-small">
            <p>Cargando estadísticas...</p>
          </div>

          <div v-if="error" class="error-small">
            <p>{{ error }}</p>
          </div>
        </div>

        <div class="map-instructions">
          <h4>Instrucciones</h4>
          <ul>
            <li>Haz clic en los marcadores del mapa para ver egresados por país</li>
            <li>Cada marcador muestra el número de egresados en ese país</li>
            <li>El panel lateral mostrará los detalles al seleccionar un país</li>
          </ul>
        </div>
      </div>

      <div class="map-wrapper">
        <div ref="mapContainer" id="map"></div>
        <div v-if="loading" class="map-loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
        <div v-if="error" class="error-overlay">
          <div class="error-message">
            <p>{{ error }}</p>
            <button @click="initMap">Reintentar</button>
          </div>
        </div>
      </div>

      <div class="detail-panel" :class="{ 'active': selectedLocation }">
        <div class="detail-header">
          <h3>
            <span v-if="selectedLocation" class="country-flag-header">{{ getFlagEmoji(selectedLocation) }}</span>
            Egresados en {{ selectedLocationName }}
          </h3>
          <button class="close-btn" @click="closeDetailPanel">×</button>
        </div>

        <div class="detail-content">
          <div v-if="selectedLocation" class="detail-summary">
            <p><strong>Total en {{ selectedLocationName }}:</strong> {{ filteredEgresados.length }} egresado(s)</p>
          </div>

          <div v-if="filteredEgresados.length > 0">
            <div class="egresado-card" v-for="(egresado, index) in filteredEgresados" :key="index">
              <div class="card-header">
                <span class="name">{{ egresado.nombres }} {{ egresado.apellidos }}</span>
                <span class="country-flag">{{ getFlagEmoji(egresado.pais) }}</span>
              </div>
              <div class="card-body">
                <p><strong>Graduación:</strong> {{ formatDate(egresado.fecha_acto_grado) }}</p>
                <p><strong>Ubicación:</strong>
                  <span v-if="egresado.estado">{{ egresado.estado }}, </span>
                  {{ getCountryName(egresado.pais) }}
                </p>
              </div>
            </div>
          </div>
          <div v-else-if="selectedLocation && !loading" class="no-data">
            <p>No hay egresados en esta ubicación con el filtro actual.</p>
          </div>
          <div v-else-if="!selectedLocation" class="no-data">
            <p>Selecciona un país en el mapa para ver sus egresados</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import service from '../../services/usuarioServices'; // Tu servicio de API
import { reportButtom, Home } from '@/services/metodosGenerales';
import { useRouter } from 'vue-router';
import 'leaflet/dist/leaflet.css';

const router = useRouter();

const handleLogout = () => {
  service.logout();
  window.location.href = '/principalview';     
};
const gotoProfile = () => router.push('/profile');

// Variables reactivas
const mapContainer = ref(null);
const egresados = ref([]);
const selectedLocation = ref(null);
const loading = ref(true);
const error = ref(null);

// Búsqueda
const searchQuery = ref('');
const searchResults = ref([]);
const showResults = ref(false);
const userGroups = ref(new Set());
let searchTimeout = null;

const handleSearch = () => {
    clearTimeout(searchTimeout);
    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
    }
    searchTimeout = setTimeout(async () => {
        const result = await service.searchGlobal(searchQuery.value);
        if (result.success) {
            searchResults.value = result.data;
            showResults.value = true;
        }
    }, 300);
};

const handleFollow = async (targetEmail, esSeguimiento) => {
    const user = service.getStoredUser();
    if (!user?.email) {
        alert('Debes iniciar sesión');
        return;
    }
    
    try {
        const result = await service.createRelation(targetEmail, esSeguimiento);
        if (result.success) {
            alert(esSeguimiento ? 'Ahora sigues a este usuario' : 'Solicitud de amistad enviada');
            searchResults.value = searchResults.value.filter(r => r.id !== targetEmail);
        } else {
            alert(result.error || 'Error al crear relación');
        }
    } catch (e) {
        console.error(e);
        alert('Error al procesar la solicitud');
    }
};

const goToGroup = (groupName) => {
    router.push({ name: 'GroupDashboard', params: { name: groupName } });
    showResults.value = false;
};

const loadUserGroups = async () => {
    try {
        const res = await service.getMyGroups();
        if (res.success && res.data) {
            userGroups.value = new Set(res.data.map(g => g.nombre));
        }
    } catch (e) {
        console.error("Error cargando grupos del usuario:", e);
    }
};

const handleJoinGroup = async (groupName) => {
    try {
        const res = await service.joinGroup(groupName);
        if (res.success) {
            alert(res.message || 'Te has unido al grupo');
            await loadUserGroups(); // Refrescar lista
            showResults.value = false;
        } else {
            alert(res.error || 'No se pudo unir al grupo');
        }
    } catch (e) {
        console.error(e);
        alert('Error al unirse al grupo');
    }
};

const handleClickOutside = (event) => {
    if (!event.target.closest('.buscador')) {
        showResults.value = false;
    }
};

let map = null;
let L = null;
let markers = [];

// DICCIONARIO para convertir nombres de países a códigos ISO y coordenadas

  const countryMapping = {

    // América

    'Venezuela': { code: 'VE', coordinates: [8.0000, -66.0000] },

    'Estados Unidos': { code: 'US', coordinates: [37.0902, -95.7129] },

    'Colombia': { code: 'CO', coordinates: [4.0000, -72.0000] },

    'México': { code: 'MX', coordinates: [23.6345, -102.5528] },

    'Argentina': { code: 'AR', coordinates: [-38.4161, -63.6167] },

    'Chile': { code: 'CL', coordinates: [-35.6751, -71.5429] },

    'Perú': { code: 'PE', coordinates: [-9.1900, -75.0152] },

    'Brasil': { code: 'BR', coordinates: [-14.2350, -51.9253] },

    'Ecuador': { code: 'EC', coordinates: [-1.8312, -78.1834] },

    'Bolivia': { code: 'BO', coordinates: [-16.2902, -63.5887] },

    'Paraguay': { code: 'PY', coordinates: [-23.4425, -58.4438] },

    'Uruguay': { code: 'UY', coordinates: [-32.5228, -55.7658] },

    'Panamá': { code: 'PA', coordinates: [8.5375, -80.7821] },

    'Costa Rica': { code: 'CR', coordinates: [9.7489, -83.7534] },

    'Nicaragua': { code: 'NI', coordinates: [12.8654, -85.2072] },

    'Honduras': { code: 'HN', coordinates: [15.2000, -86.2419] },

    'El Salvador': { code: 'SV', coordinates: [13.7942, -88.8965] },

    'Guatemala': { code: 'GT', coordinates: [15.7835, -90.2308] },

    'Cuba': { code: 'CU', coordinates: [21.5218, -77.7812] },

    'República Dominicana': { code: 'DO', coordinates: [18.7357, -70.1627] },

    'Puerto Rico': { code: 'PR', coordinates: [18.2208, -66.5901] },

    'Canadá': { code: 'CA', coordinates: [56.1304, -106.3468] },

    

    // Europa

    'España': { code: 'ES', coordinates: [40.4637, -3.7492] },

    'Francia': { code: 'FR', coordinates: [46.6034, 1.8883] },

    'Italia': { code: 'IT', coordinates: [41.8719, 12.5674] },

    'Alemania': { code: 'DE', coordinates: [51.1657, 10.4515] },

    'Reino Unido': { code: 'GB', coordinates: [55.3781, -3.4360] },

    'Portugal': { code: 'PT', coordinates: [39.3999, -8.2245] },

    'Países Bajos': { code: 'NL', coordinates: [52.1326, 5.2913] },

    'Bélgica': { code: 'BE', coordinates: [50.5039, 4.4699] },

    'Suiza': { code: 'CH', coordinates: [46.8182, 8.2275] },

    'Austria': { code: 'AT', coordinates: [47.5162, 14.5501] },

    'Suecia': { code: 'SE', coordinates: [60.1282, 18.6435] },

    'Noruega': { code: 'NO', coordinates: [60.4720, 8.4689] },

    'Finlandia': { code: 'FI', coordinates: [61.9241, 25.7482] },

    'Dinamarca': { code: 'DK', coordinates: [56.2639, 9.5018] },

    'Polonia': { code: 'PL', coordinates: [51.9194, 19.1451] },

    'Rusia': { code: 'RU', coordinates: [61.5240, 105.3188] },

    'Ucrania': { code: 'UA', coordinates: [48.3794, 31.1656] },

    'Grecia': { code: 'GR', coordinates: [39.0742, 21.8243] },

    'Turquía': { code: 'TR', coordinates: [38.9637, 35.2433] },

    

    // Asia

    'China': { code: 'CN', coordinates: [35.8617, 104.1954] },

    'Japón': { code: 'JP', coordinates: [36.2048, 138.2529] },

    'India': { code: 'IN', coordinates: [20.5937, 78.9629] },

    'Corea del Sur': { code: 'KR', coordinates: [35.9078, 127.7669] },

    'Singapur': { code: 'SG', coordinates: [1.3521, 103.8198] },

    'Tailandia': { code: 'TH', coordinates: [15.8700, 100.9925] },

    'Vietnam': { code: 'VN', coordinates: [14.0583, 108.2772] },

    'Filipinas': { code: 'PH', coordinates: [12.8797, 121.7740] },

    'Malasia': { code: 'MY', coordinates: [4.2105, 101.9758] },

    'Indonesia': { code: 'ID', coordinates: [-0.7893, 113.9213] },

    'Israel': { code: 'IL', coordinates: [31.0461, 34.8516] },

    'Emiratos Árabes Unidos': { code: 'AE', coordinates: [23.4241, 53.8478] },

    'Arabia Saudita': { code: 'SA', coordinates: [23.8859, 45.0792] },

    'Qatar': { code: 'QA', coordinates: [25.3548, 51.1839] },

    

    // África

    'Sudáfrica': { code: 'ZA', coordinates: [-30.5595, 22.9375] },

    'Egipto': { code: 'EG', coordinates: [26.8206, 30.8025] },

    'Nigeria': { code: 'NG', coordinates: [9.0820, 8.6753] },

    'Kenia': { code: 'KE', coordinates: [-1.2864, 36.8172] },

    'Marruecos': { code: 'MA', coordinates: [31.7917, -7.0926] },

    'Argelia': { code: 'DZ', coordinates: [28.0339, 1.6596] },

    'Túnez': { code: 'TN', coordinates: [33.8869, 9.5375] },

    'Ghana': { code: 'GH', coordinates: [7.9465, -1.0232] },

    'Costa de Marfil': { code: 'CI', coordinates: [7.5400, -5.5471] },

    'Senegal': { code: 'SN', coordinates: [14.4974, -14.4524] },

    'Etiopía': { code: 'ET', coordinates: [9.1450, 40.4897] },

    

    // Oceanía

    'Australia': { code: 'AU', coordinates: [-25.2744, 133.7751] },

    'Nueva Zelanda': { code: 'NZ', coordinates: [-40.9006, 174.8860] },

    

    // Centroamérica y Caribe

    'Jamaica': { code: 'JM', coordinates: [18.1096, -77.2975] },

    'Trinidad y Tobago': { code: 'TT', coordinates: [10.6918, -61.2225] },

    'Bahamas': { code: 'BS', coordinates: [25.0343, -77.3963] },

    'Barbados': { code: 'BB', coordinates: [13.1939, -59.5432] },

    

    // Países adicionales importantes

    'Irlanda': { code: 'IE', coordinates: [53.1424, -7.6921] },

    'Islandia': { code: 'IS', coordinates: [64.9631, -19.0208] },

    'Luxemburgo': { code: 'LU', coordinates: [49.8153, 6.1296] },

    'Mónaco': { code: 'MC', coordinates: [43.7384, 7.4246] },

    'Andorra': { code: 'AD', coordinates: [42.5462, 1.6016] },

    'Malta': { code: 'MT', coordinates: [35.9375, 14.3754] },

    'Chipre': { code: 'CY', coordinates: [35.1264, 33.4299] },

    'Liechtenstein': { code: 'LI', coordinates: [47.1660, 9.5554] },

    'San Marino': { code: 'SM', coordinates: [43.9424, 12.4578] },

    'Vaticano': { code: 'VA', coordinates: [41.9029, 12.4534] }

  };

// Computed properties
const totalEgresados = computed(() => egresados.value.length || 0);

const uniqueCountriesCount = computed(() => {
  if (!Array.isArray(egresados.value) || egresados.value.length === 0) return 0;
  const uniqueCountries = new Set();
  egresados.value.forEach(egresado => {
    if (egresado && egresado.pais) uniqueCountries.add(egresado.pais);
  });
  return uniqueCountries.size;
});

const filteredEgresados = computed(() => {
  if (!selectedLocation.value) return [];
  return egresados.value.filter(egresado => 
    egresado && egresado.pais && egresado.pais === selectedLocation.value
  );
});

const selectedLocationName = computed(() => selectedLocation.value || '');

// Métodos de carga y lógica de Mapa
const loadEgresados = async () => {
  try {
    loading.value = true;
    error.value = null;
    const result = await service.getGraduatesLocation();
    if (result && result.success && result.data) {
      egresados.value = Array.isArray(result.data) ? result.data : [];
      if (map) addMarkers();
    } else {
      error.value = result?.error || 'Error al cargar los egresados';
    }
  } catch (err) {
    error.value = 'Error interno: ' + (err.message || 'Error desconocido');
    egresados.value = [];
  } finally {
    loading.value = false;
  }
};

const initMap = async () => {
  try {
    error.value = null;
    L = await import('leaflet');
    
    // Solución para iconos Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    map = L.map(mapContainer.value).setView([15, -60], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    await loadEgresados();
  } catch (err) {
    error.value = 'Error al cargar el mapa: ' + err.message;
    loading.value = false;
  }
};

const getCountryInfo = (countryName) => {
  if (!countryName) return { code: '??', coordinates: [0, 0] };
  let countryInfo = countryMapping[countryName];
  if (!countryInfo) {
    for (const [name, info] of Object.entries(countryMapping)) {
      if (info.code === countryName.toUpperCase()) return { code: info.code, coordinates: info.coordinates };
    }
    return { code: countryName.length === 2 ? countryName.toUpperCase() : '??', coordinates: [0, 0] };
  }
  return countryInfo;
};

const addMarkers = () => {
  if (!map || !L) return;
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  const egresadosPorPais = {};
  egresados.value.forEach(egresado => {
    if (egresado?.pais) {
      if (!egresadosPorPais[egresado.pais]) egresadosPorPais[egresado.pais] = [];
      egresadosPorPais[egresado.pais].push(egresado);
    }
  });

  Object.keys(egresadosPorPais).forEach(paisNombre => {
    const countryInfo = getCountryInfo(paisNombre);
    const coordenadas = countryInfo.coordinates;
    if (coordenadas[0] !== 0 || coordenadas[1] !== 0) {
      const icono = L.divIcon({
        html: `<div class="custom-marker">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c" width="30" height="30">
                  <path d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span class="marker-count">${egresadosPorPais[paisNombre].length}</span>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker(coordenadas, { icon: icono }).addTo(map);
      marker.on('click', () => showGraduates(paisNombre));
      markers.push(marker);
    }
  });
};

const showGraduates = (pais) => { selectedLocation.value = pais; };
const closeDetailPanel = () => { selectedLocation.value = null; };
const getFlagEmoji = (name) => {
  const info = getCountryInfo(name);
  if (!info.code || info.code === '??') return '🏳️';
  return info.code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};
const getCountryName = (name) => name || 'Desconocido';
const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible';

onMounted(() => {
  initMap();
  loadUserGroups();
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => { 
  if (map) map.remove(); 
  document.removeEventListener('click', handleClickOutside);
});
</script>