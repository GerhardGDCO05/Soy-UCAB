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

    // GET: Obtener relaciones. 
    // Query params: 
    // - type: 'sent' (default, yo seguí/solicité) | 'received' (me solicitaron/siguen)
    // - estado: 'pendiente', 'aceptada', etc.
    async getRelations(req, res) {
        try {
            const { email } = req.params;
            const { type, estado } = req.query;

            let query = "";
            let params = [email];

            if (type === 'received') {
                // Buscamos donde yo soy el destino (quien recibe la solicitud o el que es seguido)
                query = `
                    SELECT r.*, m.nombre_usuario, m.email as email_otro
                    FROM soyucab.relacion r
                    JOIN soyucab.miembro m ON r.usuario_origen = m.email
                    WHERE r.usuario_destino = $1
                `;
            } else {
                // Default: Buscamos donde yo soy el origen (a quien sigo o solicito)
                query = `
                    SELECT r.*, m.nombre_usuario, m.email as email_otro
                    FROM soyucab.relacion r
                    JOIN soyucab.miembro m ON r.usuario_destino = m.email
                    WHERE r.usuario_origen = $1
                `;
            }

            if (estado) {
                query += ` AND r.estado = $2`;
                params.push(estado);
            }

            const result = await db.query(query, params);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error(error);
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
                    fecha_establecimiento = CASE WHEN $4 = 'aceptada' THEN NOW() ELSE fecha_establecimiento END
                WHERE usuario_origen = $2 AND usuario_destino = $3
                RETURNING *
            `;

            const result = await db.query(query, [nuevo_estado, usuario_origen, usuario_destino, nuevo_estado]);

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

    // DELETE: Romper relación
    // Puede ser usada para:
    // 1. Cancelar una solicitud enviada (origen=yo, destino=otro)
    // 2. Dejar de seguir / Eliminar amigo (origen=yo, destino=otro)
    // 3. Rechazar solicitud / Eliminar seguidor (origen=otro, destino=yo)
    async deleteRelation(req, res) {
        try {
            const { usuario_origen, usuario_destino } = req.body;

            // Eliminamos cualquier registro que vincule a estos dos usuarios en esa dirección específica
            // OJO: Si se quiere 'Eliminar amigo' (bidireccional conceptualmente), se rompe el vínculo.
            // Para mantener consistencia simple, borramos la fila específica. 
            // Si A sigue a B, y A llama a esto, se borra A->B.
            // Si B quiere que A deje de seguirlo, B llama a esto (con origen=A, destino=B) ?? 
            // Generalmente el usuario que llama a la API es el que ejecuta la acción.

            // Supongamos que recibimos explicitamente quien es origen y destino de la fila a borrar.

            const query = `
                DELETE FROM soyucab.relacion 
                WHERE usuario_origen = $1 AND usuario_destino = $2
            `;

            const result = await db.query(query, [usuario_origen, usuario_destino]);

            if (result.rowCount === 0) {
                // Intento inverso por si se mandaron al revés (opcional, pero útil para "Eliminar amigo")
                const queryInverse = `
                    DELETE FROM soyucab.relacion 
                    WHERE usuario_origen = $2 AND usuario_destino = $1
                 `;
                const resultInverse = await db.query(queryInverse, [usuario_origen, usuario_destino]);

                if (resultInverse.rowCount === 0) {
                    return res.status(404).json({ success: false, error: 'No se encontró relación para eliminar' });
                }
            }

            res.json({ success: true, message: 'Relación eliminada' });
        } catch (error) {
            console.error('Error al eliminar relación:', error);
            res.status(500).json({ success: false, error: 'Error al romper la relación' });
        }
    }
};