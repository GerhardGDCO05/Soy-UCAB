const db = require('../config/database');

module.exports = {
    // POST /api/relations - crear relación (seguimiento o amistad)
    async createRelation(req, res) {
        try {
            // Se elimina la dependencia de req.user.email
            // Se espera que el origen venga en el cuerpo de la petición
            const { usuario_origen, usuario_destino, tipo } = req.body;

            if (!usuario_origen) return res.status(400).json({ success: false, error: 'usuario_origen requerido' });
            if (!usuario_destino) return res.status(400).json({ success: false, error: 'usuario_destino requerido' });
            
            if (usuario_destino === usuario_origen) {
                return res.status(400).json({ success: false, error: 'No puedes relacionarte contigo mismo' });
            }

            // Si el destino es una dependencia, fuerza tipo = 'seguimiento'
            const destRes = await db.query(
                `SELECT tipo_usuario FROM soyucab.miembro WHERE email = $1`, 
                [usuario_destino]
            );

            if (destRes.rows.length > 0 && destRes.rows[0].tipo_usuario === 'dependencia') {
                const insertRes = await db.query(
                    `INSERT INTO soyucab.relacion (email_miembro_origen, email_miembro_destino, tipo, fecha_solicitud)
                     VALUES ($1, $2, 'seguimiento', NOW()) 
                     ON CONFLICT (email_miembro_origen, email_miembro_destino) DO UPDATE SET tipo = 'seguimiento'
                     RETURNING *`, 
                    [usuario_origen, usuario_destino]
                );
                return res.status(201).json({ success: true, data: insertRes.rows[0] });
            }

            const relTipo = tipo || 'amistad';

            // Evitar duplicados con ON CONFLICT
            await db.query(
                `INSERT INTO soyucab.relacion (email_miembro_origen, email_miembro_destino, tipo, fecha_solicitud)
                 VALUES ($1, $2, $3, NOW()) 
                 ON CONFLICT (email_miembro_origen, email_miembro_destino) DO NOTHING`, 
                [usuario_origen, usuario_destino, relTipo]
            );

            // Obtener relación creada o existente
            const getRes = await db.query(
                `SELECT * FROM soyucab.relacion WHERE email_miembro_origen = $1 AND email_miembro_destino = $2`, 
                [usuario_origen, usuario_destino]
            );
            
            res.status(201).json({ success: true, data: getRes.rows[0] });
        } catch (error) {
            console.error('Error creando relación:', error);
            res.status(500).json({ success: false, error: 'Error al crear relación' });
        }
    },

    // GET /api/relations/:email - obtener relaciones de un usuario específico
    async getRelationsByEmail(req, res) {
        try {
            // Ahora el email viene de los parámetros de la URL
            const { email } = req.params;

            if (!email) {
                return res.status(400).json({ success: false, error: 'Email requerido' });
            }

            const rels = await db.query(
                `SELECT r.*, m.nombre_usuario AS destino_nombre, md.tipo_usuario AS destino_tipo
                 FROM soyucab.relacion r
                 LEFT JOIN soyucab.miembro m ON r.email_miembro_destino = m.email
                 LEFT JOIN soyucab.miembro md ON r.email_miembro_destino = md.email
                 WHERE r.email_miembro_origen = $1`,
                [email]
            );

            res.json({ success: true, count: rels.rows.length, data: rels.rows });
        } catch (error) {
            console.error('Error obteniendo relaciones:', error);
            res.status(500).json({ success: false, error: 'Error al obtener relaciones' });
        }
    }
};