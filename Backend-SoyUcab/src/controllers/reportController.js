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
  }

};

module.exports = reportController;