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

const postController = {
    // 1. Crear Publicación
    async createPost(req, res) {
        try {
            const { email_publicador, caption, tipo_contenido, configuracion_privacidad, descripcion_publicacion } = req.body;
            
            const result = await db.query(
                `INSERT INTO soyucab.publicacion 
                (caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador, fecha_publicacion)
                VALUES ($1, $2, $3, $4, $5, date_trunc('second', NOW())) 
                RETURNING *`, 
                [caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador]
            );
            
            const post = result.rows[0];
            post.fecha_publicacion = formatTimestamp(post.fecha_publicacion);
            
            console.log("✅ Post creado:", post);
            res.status(201).json({ success: true, data: post });
        } catch (error) {
            console.error("Error en createPost:", error);
            res.status(500).json({ success: false, error: 'Error al crear post' });
        }
    },

    // 2. Feed General
    async getHomeFeed(req, res) {
        try {
            const result = await db.query(
                `SELECT p.*, m.nombre_usuario,
                (SELECT COUNT(*) FROM soyucab.me_gusta mg 
                 WHERE mg.email_publicador_publicacion = p.email_publicador 
                 AND mg.fecha_publicacion_publicacion = p.fecha_publicacion) as likes_count
                 FROM soyucab.publicacion p
                 JOIN soyucab.miembro m ON p.email_publicador = m.email
                 WHERE p.nombre_grupo_publicado IS NULL
                 ORDER BY p.fecha_publicacion DESC`
            );
            
            // Convertir todas las fechas al formato correcto
            const posts = result.rows.map(post => ({
                ...post,
                fecha_publicacion: formatTimestamp(post.fecha_publicacion)
            }));
            
            res.json({ success: true, data: posts });
        } catch (error) {
            console.error("Error en getHomeFeed:", error);
            res.status(500).json({ success: false, error: 'Error al obtener feed' });
        }
    },

    // 3. Contador Real
    async getPostCount(req, res) {
        try {
            const { email } = req.params;
            
            const result = await db.query(
                `SELECT COUNT(*)::int as total 
                 FROM soyucab.publicacion 
                 WHERE email_publicador = $1 
                 AND nombre_grupo_publicado IS NULL`,
                [email]
            );
            
            console.log(`Contador para ${email}:`, result.rows[0].total);
            res.json({ success: true, count: result.rows[0].total });
        } catch (error) {
            console.error("Error al contar:", error);
            res.status(500).json({ success: false, error: 'Error al contar' });
        }
    },

    // 4. Posts por Usuario
    async getPostsByEmail(req, res) {
        try {
            const { email } = req.params;
            const result = await db.query(
                `SELECT p.*, m.nombre_usuario
                 FROM soyucab.publicacion p
                 JOIN soyucab.miembro m ON p.email_publicador = m.email
                 WHERE p.email_publicador = $1 AND p.nombre_grupo_publicado IS NULL
                 ORDER BY p.fecha_publicacion DESC`,
                [email]
            );
            
            const posts = result.rows.map(post => ({
                ...post,
                fecha_publicacion: formatTimestamp(post.fecha_publicacion)
            }));
            
            res.json({ success: true, data: posts });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener posts' });
        }
    },

    // 5. Eliminar Post
    async deletePost(req, res) {
        try {
            const { email, fecha } = req.params;
            const userRequesting = req.body.email_solicitante;

            const fechaDecoded = decodeURIComponent(fecha);

            console.log("🗑️ DELETE Post - Buscando:", {
                email,
                fecha: fechaDecoded,
                solicitante: userRequesting
            });

            if (email !== userRequesting) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'No tienes permiso para eliminar este post' 
                });
            }

            // PostgreSQL maneja la conversión de timezone automáticamente
            // Convertimos la fecha ISO a timestamp y PostgreSQL la ajusta a su timezone
            const result = await db.query(
                `DELETE FROM soyucab.publicacion 
                 WHERE email_publicador = $1 
                 AND fecha_publicacion = $2::timestamptz
                 RETURNING *`,
                [email, fechaDecoded]
            );
            
            if (result.rowCount === 0) {
                // Si falla, intentar buscar por aproximación (dentro de 1 segundo)
                const result2 = await db.query(
                    `DELETE FROM soyucab.publicacion 
                     WHERE email_publicador = $1 
                     AND fecha_publicacion BETWEEN 
                         ($2::timestamptz - interval '1 second') AND 
                         ($2::timestamptz + interval '1 second')
                     RETURNING *`,
                    [email, fechaDecoded]
                );
                
                if (result2.rowCount === 0) {
                    console.log("❌ Post no encontrado");
                    return res.status(404).json({ 
                        success: false, 
                        error: 'Publicación no encontrada'
                    });
                }
            }
            
            console.log("✅ Post eliminado exitosamente");
            res.json({ success: true, message: 'Publicación eliminada correctamente' });
        } catch (error) {
            console.error("💥 Error al eliminar:", error);
            res.status(500).json({ success: false, error: 'Error al eliminar la publicación' });
        }
    },

    // 6. Mostrar comentarios
    async getCommentsByPost(req, res) {
        try {
            const { email_publicador, fecha_publicacion } = req.query;
            
            console.log("📝 GET Comments - Parámetros:", {
                email_publicador,
                fecha_publicacion
            });
            
            const result = await db.query(
                `SELECT c.*, m.nombre_usuario
                FROM soyucab.comentario c
                JOIN soyucab.miembro m ON c.email_comentador = m.email
                WHERE c.email_creador_publicacion = $1 
                AND c.fecha_creacion_publicacion = $2::timestamp
                ORDER BY c.fecha_creacion ASC`,
                [email_publicador, fecha_publicacion]
            );
            
            const comments = result.rows.map(comment => ({
                ...comment,
                fecha_creacion: formatTimestamp(comment.fecha_creacion)
            }));
            
            res.json({ success: true, data: comments });
        } catch (error) {
            console.error("Error al obtener comentarios:", error);
            res.status(500).json({ success: false, error: 'Error al obtener comentarios' });
        }
    },
    // 7. Compartir posts 
    // Al final de postController, antes del module.exports
async sharePost(req, res) {
    try {
        const { email_publicador, fecha_publicacion, compartido_por, destinatarios } = req.body;

        // Crear notificaciones para cada destinatario
        for (const destinatario of destinatarios) {
            await db.query(
                `INSERT INTO soyucab.notificacion 
                (email_destino, email_envia, titulo, contenido, tipo_notificacion, estado, prioridad, fecha_hora)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [
                    destinatario,
                    compartido_por,
                    'Post compartido',
                    `ha compartido una publicación contigo`,
                    'publicacion',
                    'pendiente',
                    'media'
                ]
            );
        }

        res.json({ success: true, message: 'Post compartido exitosamente' });
    } catch (error) {
        console.error("Error compartiendo post:", error);
        res.status(500).json({ success: false, error: 'Error al compartir' });
    }
},
// Agregar esto en postController.js
async getSinglePost(req, res) {
    try {
        const { email, fecha } = req.params;
        const fechaDecoded = decodeURIComponent(fecha);

        console.log("📄 GET Single Post:", { email, fecha: fechaDecoded });

        const result = await db.query(
            `SELECT p.*, m.nombre_usuario,
            (SELECT COUNT(*) FROM soyucab.me_gusta mg 
             WHERE mg.email_publicador_publicacion = p.email_publicador 
             AND mg.fecha_publicacion_publicacion = p.fecha_publicacion) as likes_count
             FROM soyucab.publicacion p
             JOIN soyucab.miembro m ON p.email_publicador = m.email
             WHERE p.email_publicador = $1 
             AND p.fecha_publicacion = $2::timestamptz`,
            [email, fechaDecoded]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Publicación no encontrada' 
            });
        }

        const post = result.rows[0];
        post.fecha_publicacion = formatTimestamp(post.fecha_publicacion);

        res.json({ success: true, data: post });
    } catch (error) {
        console.error("Error obteniendo post:", error);
        res.status(500).json({ success: false, error: 'Error al obtener publicación' });
    }
},
// Al final de postController.js, antes de module.exports

async sharePost(req, res) {
    try {
        const { email_publicador, fecha_publicacion, compartido_por, destinatarios } = req.body;

        console.log("📤 Compartiendo post con:", destinatarios);

        // Crear notificaciones para cada destinatario
        for (const destinatario of destinatarios) {
            await db.query(
                `INSERT INTO soyucab.notificacion 
                (email_destino, email_envia, titulo, contenido, tipo_notificacion, estado, prioridad, fecha_hora, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
                [
                    destinatario,
                    compartido_por,
                    'Post compartido',
                    'ha compartido una publicación contigo',
                    'publicacion',
                    'pendiente',
                    'media',
                    JSON.stringify({
                        post_email: email_publicador,
                        post_fecha: fecha_publicacion
                    })
                ]
            );
        }

        console.log("✅ Post compartido con", destinatarios.length, "usuarios");
        res.json({ success: true, message: 'Post compartido exitosamente' });
    } catch (error) {
        console.error("❌ Error compartiendo post:", error);
        res.status(500).json({ success: false, error: 'Error al compartir' });
    }
}, 
// Dentro del objeto postController = { ... }

async getPostsByEmailForViewer(req, res) {
    try {
        const { email } = req.params; // El usuario del perfil que queremos ver
        const { viewer_email } = req.query; // El usuario que está logueado mirando

        // Esta consulta verifica:
        // 1. Que el post sea del usuario buscado.
        // 2. Que no sea de un grupo.
        // 3. Que sea público O que el visitante sea el dueño O que el visitante lo siga (relación aceptada).
        const query = `
            SELECT p.*, m.nombre_usuario,
            (SELECT COUNT(*) FROM soyucab.me_gusta mg 
             WHERE mg.email_publicador_publicacion = p.email_publicador 
             AND mg.fecha_publicacion_publicacion = p.fecha_publicacion) as likes_count
            FROM soyucab.publicacion p
            JOIN soyucab.miembro m ON p.email_publicador = m.email
            WHERE p.email_publicador = $1 
            AND p.nombre_grupo_publicado IS NULL
            AND (
                p.configuracion_privacidad = 'publico'
                OR p.email_publicador = $2
                OR EXISTS (
                    SELECT 1 FROM soyucab.relacion r
                    WHERE r.usuario_origen = $2 
                    AND r.usuario_destino = $1 
                    AND r.estado = 'aceptada'
                )
            )
            ORDER BY p.fecha_publicacion DESC
        `;

        const result = await db.query(query, [email, viewer_email]);
        
        // Usamos tu función formatTimestamp para mantener la consistencia de las fechas
        const posts = result.rows.map(post => ({
            ...post,
            fecha_publicacion: formatTimestamp(post.fecha_publicacion)
        }));
        
        res.json({ success: true, data: posts });
    } catch (error) {
        console.error("Error en getPostsByEmailForViewer:", error);
        res.status(500).json({ success: false, error: 'Error al obtener publicaciones del perfil' });
    }
},
};

module.exports = postController;