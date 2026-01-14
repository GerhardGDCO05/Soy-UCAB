const db = require('../config/database');

// Helper para convertir timestamp a ISO sin milisegundos (en zona horaria local)
function formatTimestamp(timestamp) {
    if (!timestamp) return null;
    const d = new Date(timestamp);
    // Obtenemos la fecha en zona horaria local del servidor
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    // Devolvemos en formato ISO local (sin Z al final significa "local time")
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const interactionController = {
    // LIKE / REACCIÓN
    async toggleLike(req, res) {
        try {
            const { email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion } = req.body;

            if (!email_miembro_gusta || !email_publicador_publicacion || !fecha_publicacion_publicacion) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Faltan parámetros requeridos' 
                });
            }

            console.log("❤️ Toggle like - Fecha recibida:", fecha_publicacion_publicacion);

            // Verificar si ya existe el like
            const checkQuery = `
                SELECT * FROM soyucab.me_gusta 
                WHERE email_miembro_gusta = $1 
                AND email_publicador_publicacion = $2 
                AND fecha_publicacion_publicacion = $3::timestamp
            `;
            
            const existing = await db.query(checkQuery, [
                email_miembro_gusta, 
                email_publicador_publicacion, 
                fecha_publicacion_publicacion
            ]);

            if (existing.rows.length > 0) {
                // Si ya existe, lo eliminamos (Unlike)
                const deleteQuery = `
                    DELETE FROM soyucab.me_gusta 
                    WHERE email_miembro_gusta = $1 
                    AND email_publicador_publicacion = $2 
                    AND fecha_publicacion_publicacion = $3::timestamp
                `;
                await db.query(deleteQuery, [
                    email_miembro_gusta, 
                    email_publicador_publicacion, 
                    fecha_publicacion_publicacion
                ]);
                
                console.log("✅ Like eliminado");
                return res.json({ success: true, action: 'removed' });
            } else {
                // Si no existe, lo insertamos directamente
                const insertQuery = `
                    INSERT INTO soyucab.me_gusta 
                    (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) 
                    VALUES ($1, $2, $3::timestamp)
                `;
                
                await db.query(insertQuery, [
                    email_miembro_gusta, 
                    email_publicador_publicacion, 
                    fecha_publicacion_publicacion
                ]);
                
                console.log("✅ Like agregado");
                return res.json({ success: true, action: 'added' });
            }
        } catch (error) {
            console.error("❌ ERROR EN LIKE:", error.message);
            console.error("Detalle:", error.detail);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Verificar si un usuario dio like a un post específico
    async checkLike(req, res) {
        try {
            const { email_miembro, email_publicador, fecha_publicacion } = req.query;

            if (!email_miembro || !email_publicador || !fecha_publicacion) {
                return res.json({ hasLiked: false });
            }

            const query = `
                SELECT * FROM soyucab.me_gusta 
                WHERE email_miembro_gusta = $1 
                AND email_publicador_publicacion = $2 
                AND fecha_publicacion_publicacion = $3::timestamp
            `;
            
            const result = await db.query(query, [
                email_miembro, 
                email_publicador, 
                fecha_publicacion
            ]);

            res.json({ hasLiked: result.rows.length > 0 });
        } catch (error) {
            console.error("ERROR AL VERIFICAR LIKE:", error);
            res.json({ hasLiked: false });
        }
    },

    // COMENTAR
    // En interactionController.js, método addComment

async addComment(req, res) {
    try {
        const { 
            email_comentador, 
            email_creador_publicacion, 
            fecha_creacion_publicacion, 
            contenido 
        } = req.body;

        if (!email_comentador || !email_creador_publicacion || !fecha_creacion_publicacion || !contenido) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan parámetros requeridos' 
            });
        }

        console.log("💬 Crear comentario - Fecha recibida:", fecha_creacion_publicacion);

        const result = await db.query(
            `INSERT INTO soyucab.comentario 
            (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido, fecha_creacion) 
            VALUES ($1, $2, $3::timestamp, $4, date_trunc('second', NOW())) 
            RETURNING *`, 
            [email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido]
        );
        
        const comment = result.rows[0];
        comment.fecha_creacion = formatTimestamp(comment.fecha_creacion);
        
        // ❌ ELIMINAR TODO EL CÓDIGO DE NOTIFICACIÓN
        // El trigger se encarga de eso automáticamente
        
        console.log("✅ Comentario creado");
        res.json({ success: true, data: comment });
    } catch (error) {
        console.error("❌ ERROR AL COMENTAR:", error.message);
        console.error("Detalle:", error.detail);
        res.status(500).json({ success: false, error: error.message });
    }
},

    // Obtener notificaciones
   // Obtener notificaciones
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
        
        const notifications = result.rows.map(notif => ({
            ...notif,
            fecha_hora: formatTimestamp(notif.fecha_hora)  // ✅ Cambiar a fecha_hora
        }));
        
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res.status(500).json({ success: false, error: error.message });
    }
},

async markNotificationAsRead(req, res) {
    try {
        const { email } = req.params;
        const { fecha_hora } = req.body;  // ✅ Cambiar a fecha_hora

        await db.query(
            `UPDATE soyucab.notificacion 
             SET estado = 'leida'
             WHERE email_destino = $1 
             AND fecha_hora = $2::timestamptz`,  // ✅ Cambiar a fecha_hora
            [email, fecha_hora]
        );

        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error("Error marcando notificación:", error);
        res.status(500).json({ success: false, error: error.message });
    }
},

async markAllNotificationsAsRead(req, res) {
    try {
        const { email } = req.params;

        await db.query(
            `UPDATE soyucab.notificacion 
             SET estado = 'leida'
             WHERE email_destino = $1 
             AND estado = 'pendiente'`,
            [email]
        );

        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error("Error marcando todas las notificaciones:", error);
        res.status(500).json({ success: false, error: error.message });
    }
},

async markAllNotificationsAsRead(req, res) {
    try {
        const { email } = req.params;

        await db.query(
            `UPDATE soyucab.notificacion 
             SET estado = 'leida'
             WHERE email_destino = $1 
             AND estado = 'pendiente'`,
            [email]
        );

        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error("Error marcando todas las notificaciones:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}
};

module.exports = interactionController;