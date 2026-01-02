const db = require('../config/database');

module.exports = {
    // POST: Crear o solicitar una relación
    async createRelation(req, res) {
        try {
            const { usuario_origen, usuario_destino, seguimiento } = req.body; 
            // seguimiento: true para "Seguir", false para "Amistad"

            if (usuario_origen === usuario_destino) {
                return res.status(400).json({ success: false, error: 'No puedes relacionarte contigo mismo' });
            }

            // El trigger 'relacion_dependencia' en tu SQL limpiará relaciones previas
            // y pondrá el estado en 'aceptada' si el destino es una Dependencia.
            const query = `
                INSERT INTO soyucab.relacion (usuario_origen, usuario_destino, seguimiento, estado)
                VALUES ($1, $2, $3, 'pendiente')
                RETURNING *
            `;

            const result = await db.query(query, [usuario_origen, usuario_destino, seguimiento || false]);

            res.status(201).json({
                success: true,
                message: result.rows[0].estado === 'aceptada' ? 'Relación establecida' : 'Solicitud enviada',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error al crear relación:', error);
            res.status(500).json({ success: false, error: error.message || 'Error al procesar la relación' });
        }
    },

    // GET: Obtener todas las relaciones de un usuario (amigos, seguidos, pendientes)
    async getRelations(req, res) {
        try {
            const { email } = req.params;
            const { estado } = req.query; // Ejemplo: ?estado=aceptada

            let query = `
                SELECT r.*, m.nombre_usuario, m.foto_perfil
                FROM soyucab.relacion r
                JOIN soyucab.miembro m ON r.usuario_destino = m.email
                WHERE r.usuario_origen = $1
            `;
            
            const params = [email];
            if (estado) {
                query += ` AND r.estado = $2`;
                params.push(estado);
            }

            const result = await db.query(query, params);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener relaciones' });
        }
    },

    // PUT: Aceptar o rechazar una solicitud (Cambiar estado)
    async updateRelationStatus(req, res) {
        try {
            const { usuario_origen, usuario_destino, nuevo_estado } = req.body; 
            // nuevo_estado puede ser: 'aceptada', 'rechazada', 'bloqueada'

            const query = `
                UPDATE soyucab.relacion 
                SET estado = $1, 
                    fecha_establecimiento = CASE WHEN $1 = 'aceptada' THEN NOW() ELSE fecha_establecimiento END
                WHERE usuario_origen = $2 AND usuario_destino = $3
                RETURNING *
            `;

            const result = await db.query(query, [nuevo_estado, usuario_origen, usuario_destino]);

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'No se encontró la solicitud de relación' });
            }

            res.json({ 
                success: true, 
                message: `Relación actualizada a ${nuevo_estado}`,
                data: result.rows[0] 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al actualizar la relación' });
        }
    },

    // DELETE: Romper relación (Dejar de seguir o eliminar amigo)
    async deleteRelation(req, res) {
        try {
            const { usuario_origen, usuario_destino } = req.body;

            // Borramos el registro. Si tienes un trigger de conteo de seguidores, 
            // este se activará con el DELETE.
            const query = `
                DELETE FROM soyucab.relacion 
                WHERE (usuario_origen = $1 AND usuario_destino = $2)
                   OR (usuario_origen = $2 AND usuario_destino = $1)
            `;

            const result = await db.query(query, [usuario_origen, usuario_destino]);

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'No existe una relación para eliminar' });
            }

            res.json({ success: true, message: 'Relación finalizada con éxito' });
        } catch (error) {
            console.error('Error al eliminar relación:', error);
            res.status(500).json({ success: false, error: 'Error al romper la relación' });
        }
    }
};