<<<<<<< Updated upstream
const db = require('../config/database');

const reportController = {
  // GET /api/reports/top-companies - Top empresas contratantes
  async getTopCompanies(req, res) { 
    try { 
      // Se mantiene el límite por query param, sin depender de estados de sesión
      const { limit = 10 } = req.query; 

      const result = await db.query( 
        `SELECT 
          empresa_actual AS nombre_empresa, 
          COUNT(*) AS cantidad_egresados, 
          STRING_AGG(nombres || ' ' || apellidos, ', ') AS egresados 
        FROM soyucab.egresado e 
        JOIN soyucab.persona p ON e.email_egresado = p.email_persona 
        WHERE empresa_actual IS NOT NULL 
        GROUP BY empresa_actual 
        ORDER BY COUNT(*) DESC 
        LIMIT $1`, 
        [parseInt(limit)] 
      ); 
      
      res.json({ success: true, count: result.rows.length, data: result.rows }); 
    } catch (error) { 
      console.error('Error obteniendo top empresas:', error); 
      res.status(500).json({ success: false, error: 'Error al obtener reporte de empresas' }); 
    } 
  },

  // GET /api/reports/tutors
  async getTutorsReport(req, res) {
    try {
     
      const result = await db.query('SELECT * FROM soyucab.verificar_Datos_Tutores()');
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error en reporte de tutores' });
    }
  },

  // GET /api/reports/mentions
  async getMentionsReport(req, res) {
    try {
      
      const result = await db.query('SELECT * FROM soyucab.obtener_menciones()');
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error en reporte de menciones' });
    }
  },

  /// En reportController.js (reemplaza getGraduatesLocation)
  async getGraduatesLocation(req, res) {
    try {
      const result = await db.query(`
        SELECT 
          p.nombres, 
          p.apellidos, 
          e.pais, 
          e.estado, 
          e.fecha_acto_grado 
        FROM soyucab.egresado e
        JOIN soyucab.persona p ON e.email_egresado = p.email_persona
      `);
      
      // IMPORTANTE: Vue espera que el array esté en response.data.data
      res.json({ 
        success: true, 
        data: result.rows 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

=======
const db = require('../config/database');

const reportController = {
  // GET /api/reports/top-companies - Top empresas contratantes
  async getTopCompanies(req, res) { 
    try { 
      // Se mantiene el límite por query param, sin depender de estados de sesión
      const { limit = 10 } = req.query; 

      const result = await db.query( 
        `SELECT 
          empresa_actual AS nombre_empresa, 
          COUNT(*) AS cantidad_egresados, 
          STRING_AGG(nombres || ' ' || apellidos, ', ') AS egresados 
        FROM soyucab.egresado e 
        JOIN soyucab.persona p ON e.email_egresado = p.email_persona 
        WHERE empresa_actual IS NOT NULL 
        GROUP BY empresa_actual 
        ORDER BY COUNT(*) DESC 
        LIMIT $1`, 
        [parseInt(limit)] 
      ); 
      
      res.json({ success: true, count: result.rows.length, data: result.rows }); 
    } catch (error) { 
      console.error('Error obteniendo top empresas:', error); 
      res.status(500).json({ success: false, error: 'Error al obtener reporte de empresas' }); 
    } 
  },

  // GET /api/reports/tutors
  async getTutorsReport(req, res) {
    try {
     
      const result = await db.query('SELECT * FROM soyucab.verificar_Datos_Tutores()');
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Error en reporte de tutores' });
    }
  },

  // GET /api/reports/mentions
  async getMentionsReport(req, res) {
    try {
      
      const result = await db.query('SELECT * FROM soyucab.obtener_menciones()');
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error en reporte de menciones' });
    }
  },

  /// En reportController.js (reemplaza getGraduatesLocation)
  async getGraduatesLocation(req, res) {
    try {
      const result = await db.query(`
        SELECT 
          p.nombres, 
          p.apellidos, 
          e.pais, 
          e.estado, 
          e.fecha_acto_grado 
        FROM soyucab.egresado e
        JOIN soyucab.persona p ON e.email_egresado = p.email_persona
      `);
      
      // IMPORTANTE: Vue espera que el array esté en response.data.data
      res.json({ 
        success: true, 
        data: result.rows 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Reporte: Top carreras con más estudiantes
  async getTopCarreras(req, res) {
      try {
          const result = await db.query(
              `SELECT
                  carrera_programa AS nombre_carrera,
                  COUNT(email_estudiante) AS total_estudiantes_registrados
              FROM
                  soyucab.estudiante
              GROUP BY
                  carrera_programa
              ORDER BY
                  total_estudiantes_registrados DESC, carrera_programa ASC
              LIMIT 10`
          );
          
          res.json({ 
              success: true, 
              data: result.rows 
          });
      } catch (error) {
          console.error('Error en reporte de carreras:', error);
          res.status(500).json({ 
              success: false, 
              error: 'Error al generar el reporte de carreras' 
          });
      }
  },

  async getTopUsers(req, res) {
      try {
          const query = `
              SELECT
                  m.nombres || ' ' || m.apellidos AS nombre_publicador,
                  ra.tipo_rol AS rol_institucional_actual, 
                  COUNT(lg.email_miembro_gusta) AS total_likes_recibidos
              FROM
                  soyucab.me_gusta lg
              JOIN
                  soyucab.publicacion p
                  ON lg.email_publicador_publicacion = p.email_publicador 
                  AND lg.fecha_publicacion_publicacion = p.fecha_publicacion
              JOIN
                  soyucab.persona m
                  ON p.email_publicador = m.email_persona
              LEFT JOIN
                  (
                      SELECT
                          ri1.email_persona,
                          ri1.tipo_rol
                      FROM
                          soyucab.rolInstitucional ri1
                      WHERE
                          ri1.fecha_inicio = (
                              SELECT MAX(ri2.fecha_inicio)
                              FROM soyucab.rolInstitucional ri2
                              WHERE ri2.email_persona = ri1.email_persona
                          )
                  ) AS ra
                  ON m.email_persona = ra.email_persona
              GROUP BY
                  p.email_publicador, 
                  m.nombres, 
                  m.apellidos, 
                  ra.tipo_rol
              ORDER BY
                  total_likes_recibidos DESC
              LIMIT 10`;
          
          const result = await db.query(query);
          res.json({ success: true, data: result.rows });
      } catch (error) {
          console.error("Error en reporte top usuarios:", error);
          res.status(500).json({ success: false, error: 'Error al obtener top usuarios' });
      }
  },

   // GET /api/reports/gestion-eventos - Resumen de gestión de eventos
   async getGestionEventos(req, res) {
    try {
      const { limit } = req.query;

      // Llamar a la función PostgreSQL existente
      const result = await db.query('SELECT * FROM soyucab.resumen_gestion_eventos()');

      // Aplicar límite si se proporciona
      let data = result.rows;
      if (limit) {
        data = data.slice(0, parseInt(limit));
      }

      res.json({
        success: true,
        count: data.length,
        data: data
      });
    } catch (error) {
      console.error('Error obteniendo reporte de gestión de eventos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener reporte de gestión de eventos'
      });
    }
  },
  
  // GET /api/reports/top-promedios-facultad - Mejores promedios por facultad
  async getTopPromediosFacultad(req, res) {
    try {
      const { limit = 10, minPromedio = 0, facultad } = req.query;
      const parsedLimit = parseInt(limit);
      const parsedMinPromedio = parseFloat(minPromedio);

      let query;
      let params;

      // Construir query basada en si hay filtro de facultad o no ($1 y $2 son los parámetros para el promedio y la facultad)
      if (facultad) {
        // Con filtro de facultad
        query = `
          WITH ranked_estudiantes AS (
            SELECT
              e.facultad,
              p.nombres || ' ' || p.apellidos AS nombre_estudiante,
              e.promedio,
              e.carrera_programa,
              e.semestre,
              ROW_NUMBER() OVER (
                PARTITION BY e.facultad
                ORDER BY e.promedio DESC
              ) as ranking
            FROM soyucab.estudiante e
            JOIN soyucab.persona p ON e.email_estudiante = p.email_persona
            JOIN soyucab.miembro m ON e.email_estudiante = m.email
            WHERE e.promedio IS NOT NULL
              AND m.privacidad_perfil = 'publico'
              AND e.promedio >= $1
              AND e.facultad = $2
          )
          SELECT
            facultad,
            nombre_estudiante,
            promedio,
            carrera_programa,
            semestre,
            ranking
          FROM ranked_estudiantes
          WHERE ranking <= $3
          ORDER BY facultad ASC, ranking ASC
        `;
        params = [parsedMinPromedio, facultad, parsedLimit];
      } else {
        // Sin filtro de facultad
        query = `
          WITH ranked_estudiantes AS (
            SELECT
              e.facultad,
              p.nombres || ' ' || p.apellidos AS nombre_estudiante,
              e.promedio,
              e.carrera_programa,
              e.semestre,
              ROW_NUMBER() OVER (
                PARTITION BY e.facultad
                ORDER BY e.promedio DESC
              ) as ranking
            FROM soyucab.estudiante e
            JOIN soyucab.persona p ON e.email_estudiante = p.email_persona
            JOIN soyucab.miembro m ON e.email_estudiante = m.email
            WHERE e.promedio IS NOT NULL
              AND m.privacidad_perfil = 'publico'
              AND e.promedio >= $1
          )
          SELECT
            facultad,
            nombre_estudiante,
            promedio,
            carrera_programa,
            semestre,
            ranking
          FROM ranked_estudiantes
          WHERE ranking <= $2
          ORDER BY facultad ASC, ranking ASC
        `;
        params = [parsedMinPromedio, parsedLimit];
      }

      const result = await db.query(query, params);

      // Agrupar resultados por facultad
      const groupedData = {};
      result.rows.forEach(row => {
        const fac = row.facultad;
        if (!groupedData[fac]) {
          groupedData[fac] = {
            facultad: fac,
            estudiantes: [],
            promedio_maximo: 0,
            total_estudiantes: 0
          };
        }

        const promedio = parseFloat(row.promedio);
        groupedData[fac].estudiantes.push({
          nombre: row.nombre_estudiante,
          promedio: promedio,
          carrera: row.carrera_programa,
          semestre: row.semestre,
          ranking: row.ranking
        });

        groupedData[fac].promedio_maximo = Math.max(
          groupedData[fac].promedio_maximo,
          promedio
        );
        groupedData[fac].total_estudiantes++;
      });

      const data = Object.values(groupedData);

      res.json({
        success: true,
        count: data.length,
        total_estudiantes: result.rows.length,
        data: data
      });
    } catch (error) {
      console.error('Error obteniendo top promedios por facultad:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener reporte de promedios por facultad'
      });
    }
  },

  // GET /api/reports/eventos-detalles - Detalles completos de eventos (NUEVO)
  async getEventosDetalles(req, res) {
    try {
      const result = await db.query('SELECT * FROM soyucab.obtener_detalles_eventos()');

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo detalles de eventos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalles de eventos'
      });
    }
  },

  // GET /api/reports/eventos-participantes - Participantes de un evento específico (NUEVO)
  async getEventoParticipantes(req, res) {
    try {
      const { ubicacion, fecha_inicio } = req.query;

      if (!ubicacion || !fecha_inicio) {
        return res.status(400).json({
          success: false,
          error: 'Se requieren parámetros: ubicacion y fecha_inicio'
        });
      }

      const result = await db.query(
        'SELECT * FROM soyucab.obtener_participantes_evento($1, $2)',
        [ubicacion, fecha_inicio]
      );

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error obteniendo participantes del evento:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener participantes del evento'
      });
    }
  },

  // GET /api/reports/eventos-resumen - Resumen mejorado de eventos (ACTUALIZADO)
  async getEventosResumen(req, res) {
    try {
      const { limit } = req.query;

      // Llamar a la función PostgreSQL mejorada
      const result = await db.query('SELECT * FROM soyucab.resumen_gestion_eventos()');

      // Aplicar límite si se proporciona
      let data = result.rows;
      if (limit) {
        data = data.slice(0, parseInt(limit));
      }

      res.json({
        success: true,
        count: data.length,
        data: data
      });
    } catch (error) {
      console.error('Error obteniendo resumen de eventos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de eventos'
      });
    }
  }

};

>>>>>>> Stashed changes
module.exports = reportController;