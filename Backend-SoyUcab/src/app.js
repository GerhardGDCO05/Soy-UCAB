// src/app.js
process.env.TZ = 'America/Caracas';
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const reportRoutes = require('./routes/reportRoutes');
const groupRoutes = require('./routes/groupRoutes');
const relationRoutes = require('./routes/relationRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const announceRoutes = require('./routes/announceRoutes');
const encuestasRoutes = require('./routes/encuestasRoutes');


const app = express();


// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'] // Eliminamos 'Authorization' ya que no usamos Tokens
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SoyUCAB API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Ruta de documentación (Actualizada para reflejar el cambio a No-Token)
app.get('/api', (req, res) => {
  res.json({
    message: ' API SoyUCAB - Sistema de Red Social Universitaria (Modo sin Tokens)',
    version: '1.0.0',
    documentation: {
      auth: {
        register: {
          method: 'POST',
          endpoint: '/api/auth/register',
          description: 'Registrar nuevo usuario',
          body: { email: 'string', nombre_usuario: 'string', contraseña: '...' }
        },
        login: {
          method: 'POST',
          endpoint: '/api/auth/login',
          description: 'Validar credenciales (retorna datos de usuario)',
          body: { email: 'string', contraseña: '...' }
        }
      },
      members: {
        getOne: {
          method: 'GET',
          endpoint: '/api/members/:email',
          description: 'Obtener miembro por email'
        }
      },
      portfolio: {
        upsert: {
          method: 'POST',
          endpoint: '/api/portfolio',
          description: 'Crear/Actualizar portafolio (incluir email en body)'
        }
      }
    }
  });
});

// Rutas de la API

// ENDPOINT DE BÚSQUEDA - DEBE IR ANTES DE app.use('/api/members', memberRoutes)
app.get('/api/members/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        console.log("🔍 Buscando usuarios con query:", q);
        
        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }
        
        const db = require('./config/database');
        
        const result = await db.query(
            `SELECT email, nombre_usuario
             FROM soyucab.miembro 
             WHERE LOWER(nombre_usuario) LIKE LOWER($1) 
             OR LOWER(email) LIKE LOWER($1)
             LIMIT 10`,
            [`%${q}%`]
        );
        
        console.log("✅ Usuarios encontrados:", result.rows.length);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("❌ Error buscando miembros:", error);
        res.status(500).json({ success: false, error: 'Error en búsqueda' });
    }
});

// Búsqueda avanzada (DEBE IR ANTES de app.use('/api/members', memberRoutes))

app.get('/api/members/advanced-search', async (req, res) => {
    try {
        const { 
            search, 
            tipo, 
            genero, 
            facultad, 
            carrera, 
            pais,
            user_email
        } = req.query;

        console.log("🔍 Búsqueda avanzada:", { search, tipo, genero, facultad, carrera, pais, user_email });

        const db = require('./config/database');

        // Si busca dependencias u organizaciones específicamente
        if (tipo === 'dependencia' || tipo === 'organizacion') {
            let query = '';
            const params = [];
            let paramCount = 0;

            if (tipo === 'dependencia') {
                query = `
                    SELECT 
                        d.email as email,
                        d.nombre_institucional as nombre_usuario,
                        d.nombre_institucional as nombres,
                        '' as apellidos,
                        '' as sexo,
                        'dependencia' as tipo_miembro,
                        '' as facultad,
                        '' as carrera_programa,
                        '' as pais,
                        '' as facultad_egresado,
                        999 as grado_separacion,
                        'Sin conexión' as tipo_conexion,
                        d.descripcion
                    FROM soyucab.dependencia_ucab d
                    WHERE 1=1
                `;

                if (search && search.trim()) {
                    paramCount++;
                    query += ` AND LOWER(d.nombre) LIKE LOWER($${paramCount})`;
                    params.push(`%${search.trim()}%`);
                }

            } else if (tipo === 'organizacion') {
                query = `
                    SELECT 
                        o.email as email,
                        o.nombre as nombre_usuario,
                        o.nombre as nombres,
                        '' as apellidos,
                        '' as sexo,
                        'organizacion' as tipo_miembro,
                        '' as facultad,
                        '' as carrera_programa,
                        '' as pais,
                        '' as facultad_egresado,
                        999 as grado_separacion,
                        'Sin conexión' as tipo_conexion,
                        o.descripcion
                    FROM soyucab.organizacion_asociada o
                    WHERE 1=1
                `;

                if (search && search.trim()) {
                    paramCount++;
                    query += ` AND LOWER(o.nombre) LIKE LOWER($${paramCount})`;
                    params.push(`%${search.trim()}%`);
                }
            }

            query += ` ORDER BY nombres ASC LIMIT 50`;

            console.log("📊 Ejecutando búsqueda de " + tipo + "...");
            const result = await db.query(query, params);

            console.log(`✅ Resultados: ${result.rows.length}`);
            
            res.json({ 
                success: true, 
                data: result.rows,
                total: result.rows.length
            });

        } else {
            // Query original para personas (estudiantes, egresados, etc.)
            let query = `
                WITH RECURSIVE conexiones AS (
                    SELECT 
                        m.email,
                        m.email as email_inicial,
                        0 as grado_separacion,
                        ARRAY[m.email]::VARCHAR[] as ruta
                    FROM soyucab.miembro m
                    WHERE m.email = $1
                    
                    UNION
                    
                    SELECT 
                        r.usuario_destino as email,
                        c.email_inicial,
                        c.grado_separacion + 1 as grado_separacion,
                        c.ruta || r.usuario_destino as ruta
                    FROM conexiones c
                    JOIN soyucab.relacion r ON c.email = r.usuario_origen
                    WHERE r.estado = 'aceptada'
                    AND c.grado_separacion < 3
                    AND NOT (r.usuario_destino = ANY(c.ruta))
                )
                SELECT DISTINCT
                    m.email,
                    m.nombre_usuario,
                    p.nombres,
                    p.apellidos,
                    p.sexo,
                    CASE 
                        WHEN e.email_estudiante IS NOT NULL THEN 'Estudiante'
                        WHEN eg.email_egresado IS NOT NULL THEN 'Egresado'
                        WHEN EXISTS (SELECT 1 FROM soyucab.profesor pr WHERE pr.email_persona = m.email) THEN 'Profesor'
                        WHEN EXISTS (SELECT 1 FROM soyucab.personal_administrativo pa WHERE pa.email_persona = m.email) THEN 'Personal Administrativo'
                        WHEN EXISTS (SELECT 1 FROM soyucab.personal_obrero po WHERE po.email_persona = m.email) THEN 'Personal Obrero'
                        ELSE 'Miembro'
                    END as tipo_miembro,
                    e.facultad,
                    e.carrera_programa,
                    eg.pais,
                    eg.facultad as facultad_egresado,
                    COALESCE(c.grado_separacion, 999) as grado_separacion,
                    CASE 
                        WHEN c.grado_separacion = 0 THEN 'Tú'
                        WHEN c.grado_separacion = 1 THEN 'Conexión directa'
                        WHEN c.grado_separacion = 2 THEN '2do grado'
                        WHEN c.grado_separacion = 3 THEN '3er grado'
                        ELSE 'Sin conexión'
                    END as tipo_conexion
                FROM soyucab.miembro m
                JOIN soyucab.persona p ON m.email = p.email_persona
                LEFT JOIN soyucab.estudiante e ON m.email = e.email_estudiante
                LEFT JOIN soyucab.egresado eg ON m.email = eg.email_egresado
                LEFT JOIN conexiones c ON m.email = c.email
                WHERE m.email != $1
            `;

            const params = [user_email || ''];
            let paramCount = 1;

            if (search && search.trim()) {
                paramCount++;
                query += ` AND (
                    LOWER(m.nombre_usuario) LIKE LOWER($${paramCount})
                    OR LOWER(p.nombres) LIKE LOWER($${paramCount})
                    OR LOWER(p.apellidos) LIKE LOWER($${paramCount})
                )`;
                params.push(`%${search.trim()}%`);
            }

            if (tipo) {
                switch(tipo) {
                    case 'Estudiante':
                        query += ` AND e.email_estudiante IS NOT NULL`;
                        break;
                    case 'Egresado':
                        query += ` AND eg.email_egresado IS NOT NULL`;
                        break;
                    case 'Profesor':
                        query += ` AND EXISTS (SELECT 1 FROM soyucab.profesor pr WHERE pr.email_persona = m.email)`;
                        break;
                    case 'Personal Administrativo':
                        query += ` AND EXISTS (SELECT 1 FROM soyucab.personal_administrativo pa WHERE pa.email_persona = m.email)`;
                        break;
                    case 'Personal Obrero':
                        query += ` AND EXISTS (SELECT 1 FROM soyucab.personal_obrero po WHERE po.email_persona = m.email)`;
                        break;
                }
            }

            if (genero) {
                paramCount++;
                query += ` AND p.sexo = $${paramCount}`;
                params.push(genero);
            }

            if (facultad) {
                paramCount++;
                query += ` AND (e.facultad ILIKE $${paramCount} OR eg.facultad ILIKE $${paramCount})`;
                params.push(`%${facultad}%`);
            }

            if (carrera) {
                paramCount++;
                query += ` AND e.carrera_programa ILIKE $${paramCount}`;
                params.push(`%${carrera}%`);
            }

            if (pais) {
                paramCount++;
                query += ` AND eg.pais = $${paramCount}`;
                params.push(pais.toUpperCase());
            }

            query += ` ORDER BY grado_separacion ASC, p.apellidos ASC LIMIT 50`;

            console.log("📊 Ejecutando búsqueda de personas...");
            const result = await db.query(query, params);

            console.log(`✅ Resultados: ${result.rows.length}`);
            
            res.json({ 
                success: true, 
                data: result.rows,
                total: result.rows.length
            });
        }

    } catch (error) {
        console.error('❌ Error en búsqueda avanzada:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error en búsqueda',
            details: error.message 
        });
    }
});

// Endpoint para buscar dependencias
app.get('/api/dependencies', async (req, res) => {
    try {
        const { search } = req.query;
        const db = require('./config/database');

        let query = `
            SELECT 
                email,
                nombre_institucional,
                descripcion,
                
                pagina_web
            FROM soyucab.dependencia_ucab
            WHERE 1=1
        `;

        const params = [];
        
        if (search && search.trim()) {
            query += ` AND (
                LOWER(email) = LOWER($1)
                OR LOWER(nombre_institucional) LIKE LOWER($1)
            )`;
            params.push(search.includes('@') ? search : `%${search}%`);
        }

        query += ` LIMIT 10`;

        const result = await db.query(query, params);

        res.json({ 
            success: true, 
            data: result.rows 
        });

    } catch (error) {
        console.error('❌ Error buscando dependencias:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al buscar dependencias' 
        });
    }
});

// Endpoint para buscar organizaciones
app.get('/api/organizations', async (req, res) => {
    try {
        const { search } = req.query;
        const db = require('./config/database');

        let query = `
            SELECT 
                email,
                nombre,
                descripcion,
                rif,
                pagina_web,
                logo
            FROM soyucab.organizacion_asociada
            WHERE 1=1
        `;

        const params = [];
        
        if (search && search.trim()) {
            query += ` AND (
                LOWER(email) = LOWER($1)
                OR LOWER(nombre) LIKE LOWER($1)
            )`;
            params.push(search.includes('@') ? search : `%${search}%`);
        }

        query += ` LIMIT 10`;

        const result = await db.query(query, params);

        res.json({ 
            success: true, 
            data: result.rows 
        });

    } catch (error) {
        console.error('❌ Error buscando organizaciones:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al buscar organizaciones' 
        });
    }
});



app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/uploads', express.static('uploads'));
app.use('/api', searchRoutes);
app.use('/api/user-roles', rolesRoutes);
app.use('/api/announcements', announceRoutes);
app.use('/api/encuestas', encuestasRoutes);
// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(' Error global:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Error de validación de datos
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.message
    });
  }

  // Error de PostgreSQL (Se mantiene la validación de base de datos)
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      error: 'Error en la base de datos (Restricción o duplicado)',
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error por defecto
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(` Servidor SoyUCAB iniciado`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Modo: Sin Tokens (Identificación por Email)`);
  console.log('='.repeat(60));
  console.log('\nEndpoints disponibles:');
  console.log('  - GET  /api/health');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/members/:email');
  console.log('='.repeat(60));
  console.log('  - POST /api/posts (Crear publicación)');
  console.log('  - GET  /api/posts (Obtener feed)');
});

const shutdown = (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    console.log('Servidor cerrado exitosamente.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forzando cierre del servidor...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;

