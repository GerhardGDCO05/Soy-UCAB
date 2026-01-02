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

module.exports = reportController;