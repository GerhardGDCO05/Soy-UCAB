const db = require('../config/database');

const postController = {
    // 1. Crear Publicación (Con soporte para Multer y Archivos)
    // postController.js
// En postController.js
async createPost(req, res) {
    try {
        const { email_publicador, caption, tipo_contenido, configuracion_privacidad, descripcion_publicacion } = req.body;
        
        const result = await db.query(
            `INSERT INTO soyucab.publicacion 
            (caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador, fecha_publicacion)
            VALUES ($1, $2, $3, $4, $5, date_trunc('second', NOW())) RETURNING *`, 
            [caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error("Error en createPost:", error);
        res.status(500).json({ success: false, error: 'Error al crear post' });
    }
},

    // 2. Feed General (SIN CAMBIOS EN LA LÓGICA DE BÚSQUEDA)
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
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener feed' });
        }
    },

    // 3. Contador Real
    /*async getPostCount(req, res) {
        try {
            const { email } = req.params;
            const result = await db.query(
                `SELECT COUNT(*) as total FROM soyucab.publicacion WHERE email_publicador = $1`,
                [email]
            );
            res.json({ success: true, count: parseInt(result.rows[0].total) });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al contar' });
        }
    },*/

    
async getPostCount(req, res) {
    try {
        const { email } = req.params;
        
        // Contamos solo las publicaciones que NO son de grupos (según tu lógica de Feed)
        const result = await db.query(
            `SELECT COUNT(*)::int as total 
             FROM soyucab.publicacion 
             WHERE email_publicador = $1 
             AND nombre_grupo_publicado IS NULL`,
            [email]
        );
        
        console.log(`Contador para ${email}:`, result.rows[0].total); // Para que verifiques en la consola
        res.json({ success: true, count: result.rows[0].total });
    } catch (error) {
        console.error("Error al contar:", error);
        res.status(500).json({ success: false, error: 'Error al contar' });
    }
},

    // 4. Posts por Usuario (SIN CAMBIOS)
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
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener posts' });
        }
    },

    // 5. Eliminar Post
    async deletePost(req, res) {
        try {
            const { email, fecha } = req.params;
            await db.query(
                `DELETE FROM soyucab.publicacion 
                 WHERE email_publicador = $1 AND fecha_publicacion = $2`,
                [email, fecha]
            );
            res.json({ success: true, message: 'Eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al eliminar' });
        }
    },

    // 6. Mostrar comentarios (CORREGIDO PARA TU BASE DE DATOS)
    async getCommentsByPost(req, res) {
        try {
            const { email_publicador, fecha_publicacion } = req.query;
            const result = await db.query(
                `SELECT c.*, m.nombre_usuario 
                FROM soyucab.comentario c
                JOIN soyucab.miembro m ON c.email_comentador = m.email
                WHERE c.email_creador_publicacion = $1 
                AND c.fecha_creacion_publicacion = $2
                ORDER BY c.fecha_creacion ASC`, // Cambiado de fecha_comentario a fecha_creacion
                [email_publicador, fecha_publicacion]
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener comentarios' });
        }
    },
    // postController.js
async deletePost(req, res) {
    try {
        const { email, fecha } = req.params;
        const userRequesting = req.body.email_solicitante; // Validamos identidad

        if (email !== userRequesting) {
            return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este post' });
        }

        await db.query(
            `DELETE FROM soyucab.publicacion 
             WHERE email_publicador = $1 AND fecha_publicacion = $2`,
            [email, fecha]
        );
        
        res.json({ success: true, message: 'Publicación eliminada correctamente' });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ success: false, error: 'Error al eliminar la publicación' });
    }
}
};

module.exports = postController;