const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  // console.log('Conectado a PostgreSQL'); // Opcional: silenciar en producción
});

pool.on('error', (err) => {
  console.error('❌ Error crítico en pool de PostgreSQL:', err.message);
});

// Métodos para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query ejecutada (${duration}ms):`, {
        rows: result.rowCount,
        text: text.trim().substring(0, 100).replace(/\s+/g, ' ') + '...'
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error en ejecución SQL:');
    console.error('   Mensaje:', error.message);
    console.error('   Query:', text.substring(0, 200));
    if (params && params.length > 0) console.error('   Parámetros:', params);
    throw error;
  }
};

/**
 * Método para llamar funciones de PostgreSQL
 * @param {string} functionName - Nombre de la función
 * @param {Array} params - Arreglo de parámetros
 * @param {string} schema - Esquema opcional (por defecto soyucab)
 */
const callFunction = async (functionName, params = [], schema = 'soyucab') => {
  // Si no hay parámetros, el string de placeholders queda vacío
  const placeholders = params.length > 0 
    ? params.map((_, i) => `$${i + 1}`).join(', ') 
    : '';
  
  const queryText = `SELECT * FROM ${schema}.${functionName}(${placeholders})`;
  return query(queryText, params);
};

module.exports = {
  query,
  callFunction,
  pool
};