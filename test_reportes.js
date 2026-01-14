#!/usr/bin/env node

/**
 * Script de prueba para los endpoints de reportes implementados
 * 
 * Uso:
 *   node test_reportes.js
 * 
 * Asegúrate de que el servidor backend esté corriendo en http://localhost:3000
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api/reports';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

// Función para hacer requests HTTP
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 3000,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        raw: data
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: null,
                        raw: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Función para probar un endpoint
async function testEndpoint(name, url, description) {
    console.log(`${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}Prueba: ${name}${colors.reset}`);
    console.log(`${colors.cyan}URL: ${url}${colors.reset}`);
    console.log(`${colors.cyan}Descripción: ${description}${colors.reset}`);
    console.log('');

    try {
        const result = await makeRequest(url);

        if (result.status === 200) {
            console.log(`${colors.green}✓ Status: ${result.status} OK${colors.reset}`);
            console.log('');
            console.log('Respuesta:');
            console.log(JSON.stringify(result.data, null, 2));
        } else {
            console.log(`${colors.red}✗ Status: ${result.status}${colors.reset}`);
            console.log('');
            console.log('Error:');
            console.log(result.raw);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error de conexión${colors.reset}`);
        console.log(error.message);
    }

    console.log('');
    console.log('');
}

// Función principal
async function runTests() {
    console.log('==========================================');
    console.log('  PRUEBAS DE ENDPOINTS DE REPORTES');
    console.log('==========================================');
    console.log('');

    // Verificar que el servidor esté corriendo
    try {
        await makeRequest('http://localhost:3000/api/health');
        console.log(`${colors.green}✓ Servidor está corriendo${colors.reset}`);
        console.log('');
    } catch (error) {
        console.log(`${colors.red}✗ Error: El servidor no está corriendo en http://localhost:3000${colors.reset}`);
        console.log('');
        console.log('Para iniciar el servidor, ejecuta:');
        console.log('  cd Backend-SoyUcab');
        console.log('  npm start');
        console.log('');
        process.exit(1);
    }

    // ============================================
    // PRUEBA 1: Gestión de Eventos
    // ============================================
    await testEndpoint(
        'Gestión de Eventos (sin límite)',
        `${BASE_URL}/gestion-eventos`,
        'Obtiene resumen de todos los eventos'
    );

    await testEndpoint(
        'Gestión de Eventos (con límite=1)',
        `${BASE_URL}/gestion-eventos?limit=1`,
        'Obtiene resumen limitado a 1 evento'
    );

    // ============================================
    // PRUEBA 2: Top Promedios por Facultad
    // ============================================
    await testEndpoint(
        'Top Promedios por Facultad (default)',
        `${BASE_URL}/top-promedios-facultad`,
        'Obtiene top 10 estudiantes por facultad (default)'
    );

    await testEndpoint(
        'Top Promedios por Facultad (limit=5)',
        `${BASE_URL}/top-promedios-facultad?limit=5`,
        'Obtiene top 5 estudiantes por facultad'
    );

    await testEndpoint(
        'Top Promedios por Facultad (minPromedio=17)',
        `${BASE_URL}/top-promedios-facultad?minPromedio=17`,
        'Obtiene estudiantes con promedio mínimo de 17'
    );

    await testEndpoint(
        'Top Promedios por Facultad (facultad específica)',
        `${BASE_URL}/top-promedios-facultad?facultad=Ingeniería&limit=3`,
        'Obtiene top 3 estudiantes de Ingeniería'
    );

    await testEndpoint(
        'Top Promedios por Facultad (combinado)',
        `${BASE_URL}/top-promedios-facultad?facultad=Ingeniería&minPromedio=16&limit=2`,
        'Obtiene top 2 estudiantes de Ingeniería con promedio >= 16'
    );

    console.log('==========================================');
    console.log(`${colors.green}  PRUEBAS COMPLETADAS${colors.reset}`);
    console.log('==========================================');
}

// Ejecutar pruebas
runTests().catch(console.error);

