const db = require('../config/database');

module.exports = {
  /**
   * GET /api/portfolio/:email
   * Obtiene el portafolio de un usuario incluyendo sus títulos multivaluados
   */
  async getPortfolioByEmail(req, res) {
    try {
      const email = req.params.email || req.query.email;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'El email es requerido' 
        });
      }

      // Consulta con subconsulta json_agg para traer los títulos como un array de strings
      const query = `
        SELECT 
          po.*, 
          pe.nombres, 
          pe.apellidos,
          (SELECT json_agg(nombre_titulo) 
           FROM soyucab.titulo_obtenido 
           WHERE ci_persona = po.ci_persona) as titulos
        FROM soyucab.Portafolio po
        JOIN soyucab.persona pe ON po.ci_persona = pe.ci
        WHERE pe.email_persona = $1`;

      const p = await db.query(query, [email]);

      if (p.rows.length === 0) {
        return res.json({ 
          success: true, 
          data: null, 
          message: 'No existe portafolio para este usuario' 
        });
      }

      res.json({ success: true, data: p.rows[0] });
    } catch (error) {
      console.error('Error obteniendo portafolio:', error);
      res.status(500).json({ success: false, error: 'Error obteniendo portafolio' });
    }
  },

  /**
   * POST /api/portfolio
   * Crea o actualiza el portafolio y sus títulos asociados mediante una transacción
   */
  async upsertPortfolio(req, res) {
    let client;
    
    try {
      const { email, resumen, enlaces, titulos, visibilidad } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email obligatorio' });
      }

      // Lógica robusta para obtener el cliente sin errores de "not a function"
      if (typeof db.connect === 'function') {
        client = await db.connect();
      } else if (db.pool && typeof db.pool.connect === 'function') {
        client = await db.pool.connect();
      } else {
        throw new Error('No se pudo establecer conexión con el Pool de la base de datos');
      }

      await client.query('BEGIN'); // Inicio de Transacción

      // 1. Obtener CI de la persona mediante el email
      const personaRes = await client.query(
        'SELECT ci FROM soyucab.persona WHERE email_persona = $1',
        [email]
      );

      if (personaRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'No se encontró la persona' });
      }

      const ci_persona = personaRes.rows[0].ci;

      // 2. Ejecutar el UPSERT en la tabla Portafolio
      const upsertPortfolioQuery = `
        INSERT INTO soyucab.Portafolio 
          (ci_persona, nombre_portafolio, resumen, enlaces, visibilidad, ultima_actualizacion) 
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (ci_persona) DO UPDATE SET
          resumen = EXCLUDED.resumen,
          enlaces = EXCLUDED.enlaces,
          visibilidad = EXCLUDED.visibilidad,
          ultima_actualizacion = NOW()
        RETURNING *`;

      const portfolioResult = await client.query(upsertPortfolioQuery, [
        ci_persona, 
        `Portafolio de ${email}`, 
        resumen, 
        enlaces, 
        visibilidad || 'Publico'
      ]);

      // 3. Sincronizar títulos (Tabla multivaluada)
      // Primero eliminamos los títulos viejos para reemplazarlos por los nuevos
      await client.query('DELETE FROM soyucab.titulo_obtenido WHERE ci_persona = $1', [ci_persona]);

      if (titulos && Array.isArray(titulos)) {
        for (const titulo of titulos) {
          if (titulo && titulo.trim() !== '') {
            await client.query(
              'INSERT INTO soyucab.titulo_obtenido (email_persona, ci_persona, nombre_titulo) VALUES ($1, $2, $3)',
              [email, ci_persona, titulo.trim()]
            );
          }
        }
      }

      await client.query('COMMIT'); // Confirmar cambios en la DB

      res.json({ 
        success: true, 
        data: { 
          ...portfolioResult.rows[0], 
          titulos: titulos || [] 
        } 
      });

    } catch (error) {
      if (client) await client.query('ROLLBACK'); // Deshacer cambios si hay error
      console.error('Error en upsertPortfolio:', error);
      res.status(500).json({ success: false, error: 'Error al procesar el portafolio' });
    } finally {
      if (client) client.release(); // Devolver conexión al pool
    }
  },

  /**
   * DELETE /api/portfolio/:email
   * Elimina el portafolio de un usuario
   */
  async deletePortfolio(req, res) {
    const client = await (db.connect ? db.connect() : db.pool.connect());
    try {
      const email = req.params.email;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email requerido' });
      }

      await client.query('BEGIN'); // Iniciamos transacción

      // 1. Buscamos la CI del usuario primero
      const userRes = await client.query(
        'SELECT ci FROM soyucab.persona WHERE email_persona = $1',
        [email]
      );

      if (userRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const ci_persona = userRes.rows[0].ci;

      // 2. Borramos primero los títulos (La tabla hija)
      await client.query(
        'DELETE FROM soyucab.titulo_obtenido WHERE ci_persona = $1',
        [ci_persona]
      );

      // 3. Borramos el portafolio (La tabla padre)
      await client.query(
        'DELETE FROM soyucab.Portafolio WHERE ci_persona = $1',
        [ci_persona]
      );

      await client.query('COMMIT'); // Confirmamos los dos borrados
      res.json({ success: true, message: 'Portafolio y títulos eliminados con éxito' });

    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error eliminando portafolio:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar el portafolio completo' });
    } finally {
      if (client) client.release();
    }
  }
};