const db = require('../config/database');

module.exports = {
    // POST /api/relations - crear relación (seguimiento o amistad)
    async createRelation(req, res) {
        try {
            const origin = req.user && req.user.email;
            if (!origin) return res.status(401).json({ success: false, error: 'Autenticación requerida' });

            const { usuario_destino, tipo } = req.body;
            if (!usuario_destino) return res.status(400).json({ success: false, error: 'usuario_destino requerido' });
            if (usuario_destino === origin) return res.status(400).json({ success: false, error: 'No puedes relacionarte contigo mismo' });

            // Si el destino es una dependencia, fuerza tipo = 'seguimiento'
            const destRes = await db.query(`SELECT tipo_usuario FROM soyucab.miembro WHERE email = $1`, [usuario_destino]);
            if (destRes.rows.length > 0 && destRes.rows[0].tipo_usuario === 'dependencia') {
                // Forzar seguimiento
                const insertRes = await db.query(`INSERT INTO soyucab.relacion (email_miembro_origen, email_miembro_destino, tipo, fecha_solicitud)
                    VALUES ($1, $2, 'seguimiento', NOW()) RETURNING *`, [origin, usuario_destino]);
                return res.status(201).json({ success: true, data: insertRes.rows[0] });
            }

            const relTipo = tipo || 'amistad';

            // Evitar duplicados
            await db.query(`INSERT INTO soyucab.relacion (email_miembro_origen, email_miembro_destino, tipo, fecha_solicitud)
                VALUES ($1, $2, $3, NOW()) ON CONFLICT DO NOTHING`, [origin, usuario_destino, relTipo]);

            // Obtener relación creada o existente
            const getRes = await db.query(`SELECT * FROM soyucab.relacion WHERE email_miembro_origen = $1 AND email_miembro_destino = $2`, [origin, usuario_destino]);
            res.status(201).json({ success: true, data: getRes.rows[0] });
        } catch (error) {
            console.error('Error creando relación:', error);
            res.status(500).json({ success: false, error: 'Error al crear relación' });
        }
    },

    // GET /api/relations/me - obtener relaciones del usuario autenticado
    async getMyRelations(req, res) {
        try {
            const origin = req.user && req.user.email;
            if (!origin) return res.status(401).json({ success: false, error: 'Autenticación requerida' });

            const rels = await db.query(
                `SELECT r.*, m.nombre_usuario AS destino_nombre, md.tipo_usuario AS destino_tipo
                 FROM soyucab.relacion r
                 LEFT JOIN soyucab.miembro m ON r.email_miembro_destino = m.email
                 LEFT JOIN soyucab.miembro md ON r.email_miembro_destino = md.email
                 WHERE r.email_miembro_origen = $1`,
                [origin]
            );

            res.json({ success: true, count: rels.rows.length, data: rels.rows });
        } catch (error) {
            console.error('Error obteniendo relaciones:', error);
            res.status(500).json({ success: false, error: 'Error al obtener relaciones' });
        }
    }
};