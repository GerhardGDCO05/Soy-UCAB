//Controlador para manejar los likes y comentarios en las publicaciones normales de los usuarios
const db = require('../config/database');



const interactionController = {
    // LIKE / REACCIÓN
    // En interactionController.js
async toggleLike(req, res) {
  try {
    // Recibimos los datos del frontend
    const { email_miembro, email_publicador, fecha_publicacion } = req.body;

    // 1. Buscamos si ya existe el like usando los nombres reales de la BD
    const checkQuery = `
      SELECT * FROM soyucab.me_gusta 
      WHERE email_miembro_gusta = $1 
      AND email_publicador_publicacion = $2 
      AND fecha_publicacion_publicacion = $3
    `;
    
    const existing = await db.query(checkQuery, [email_miembro, email_publicador, fecha_publicacion]);

    if (existing.rows.length > 0) {
      // Si ya existe, lo eliminamos (Unlike)
      const deleteQuery = `
        DELETE FROM soyucab.me_gusta 
        WHERE email_miembro_gusta = $1 
        AND email_publicador_publicacion = $2 
        AND fecha_publicacion_publicacion = $3
      `;
      await db.query(deleteQuery, [email_miembro, email_publicador, fecha_publicacion]);
      
      return res.json({ success: true, action: 'removed' });
    } else {
      // Si no existe, lo insertamos
      const insertQuery = `
        INSERT INTO soyucab.me_gusta 
        (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) 
        VALUES ($1, $2, $3)
      `;
      await db.query(insertQuery, [email_miembro, email_publicador, fecha_publicacion]);
      
      return res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error("DETALLE ERROR LIKE:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
},

    // COMENTAR
    // interactionController.js
async addComment(req, res) {
    try {
        const { 
            email_comentador, 
            email_creador_publicacion, 
            fecha_creacion_publicacion, 
            contenido 
        } = req.body;

        // Al pasar la fecha como string directo ($3), Node no le sumará horas
        // interactionController.js
const result = await db.query(
    `INSERT INTO soyucab.comentario 
    (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido, fecha_creacion) 
    VALUES ($1, $2, $3, $4, NOW()) RETURNING *`, 
    [email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido]
);
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("ERROR AL INSERTAR COMENTARIO:", error.detail);
        res.status(500).json({ success: false, error: error.detail });
    }
},

// En tu router: router.get('/notifications/:email', getNotifs);

// interactionController.js
async getNotifications(req, res) {
    const { email } = req.params;
    try {
        const query = `
            SELECT n.*, m.nombre_usuario 
            FROM soyucab.notificacion n
            JOIN soyucab.miembro m ON n.email_envia = m.email
            WHERE n.email_destino = $1
            ORDER BY n.fecha_hora DESC 
            LIMIT 15
        `;
        const result = await db.query(query, [email]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
};

module.exports = interactionController;