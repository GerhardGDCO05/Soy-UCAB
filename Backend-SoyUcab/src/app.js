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