const db = require('../config/database');

module.exports = {
  // GET /api/portfolio/me - obtener portafolio del usuario autenticado
  async getMyPortfolio(req, res) {
    try {
      const email = req.user && req.user.email;
      if (!email) return res.status(401).json({ success: false, error: 'Autenticación requerida' });

      const p = await db.query(`SELECT * FROM soyucab.portafolio WHERE email_miembro = $1`, [email]);
      if (p.rows.length === 0) return res.json({ success: true, data: null });
      res.json({ success: true, data: p.rows[0] });
    } catch (error) {
      console.error('Error obteniendo portafolio:', error);
      res.status(500).json({ success: false, error: 'Error obteniendo portafolio' });
    }
  },

  // PUT /api/portfolio/me - crear/actualizar portafolio del usuario autenticado
  async upsertMyPortfolio(req, res) {
    try {
      const email = req.user && req.user.email;
      if (!email) return res.status(401).json({ success: false, error: 'Autenticación requerida' });

      const { titulo_profesional, resumen, experiencias, enlaces } = req.body;

      const exists = await db.query(`SELECT * FROM soyucab.portafolio WHERE email_miembro = $1`, [email]);
      if (exists.rows.length === 0) {
        const insert = await db.query(`INSERT INTO soyucab.portafolio (email_miembro, titulo_profesional, resumen, experiencias, enlaces) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [email, titulo_profesional || null, resumen || null, experiencias || null, enlaces || null]);
        return res.status(201).json({ success: true, data: insert.rows[0] });
      } else {
        const update = await db.query(`UPDATE soyucab.portafolio SET titulo_profesional = $1, resumen = $2, experiencias = $3, enlaces = $4 WHERE email_miembro = $5 RETURNING *`, [titulo_profesional || null, resumen || null, experiencias || null, enlaces || null, email]);
        return res.json({ success: true, data: update.rows[0] });
      }
    } catch (error) {
      console.error('Error actualizando portafolio:', error);
      res.status(500).json({ success: false, error: 'Error actualizando portafolio' });
    }
  }
};