const db = require('../config/database');

module.exports = {
    async search(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim() === '') {
                return res.json({ success: true, data: [] });
            }

            const searchTerm = `%${q.trim()}%`;

            // Consulta unificada
            // 1. Personas (nombre, apellido, usuario)
            // 2. Dependencias (nombre)
            // 3. Organizaciones (nombre)
            // 4. Grupos (nombre)

            const query = `
                SELECT 
                    email as id,
                    CONCAT(p.nombres, ' ', p.apellidos) as nombre,
                    m.nombre_usuario as handle,
                    'Persona' as tipo,
                    m.biografia as descripcion,
                    NULL as info_extra
                FROM soyucab.persona p
                JOIN soyucab.miembro m ON p.email_persona = m.email
                WHERE (p.nombres ILIKE $1 OR p.apellidos ILIKE $1 OR m.nombre_usuario ILIKE $1)
                
                UNION ALL
                
                SELECT 
                    email as id,
                    nombre_institucional as nombre,
                    email as handle, -- Dependencias no tienen usuario siempre, usamos email
                    'Dependencia' as tipo,
                    descripcion,
                    NULL as info_extra
                FROM soyucab.dependencia_ucab
                WHERE nombre_institucional ILIKE $1
                
                UNION ALL
                
                SELECT 
                    email as id,
                    nombre,
                    email as handle,
                    'Organizacion' as tipo,
                    descripcion,
                    NULL as info_extra
                FROM soyucab.organizacion_asociada
                WHERE nombre ILIKE $1
                
                UNION ALL
                
                SELECT 
                    nombre as id, -- Grupos usan nombre como PK
                    nombre,
                    'Grupo' as handle,
                    'Grupo' as tipo,
                    descripcion,
                    categoria::text as info_extra
                FROM soyucab.grupo
                WHERE nombre ILIKE $1
                
                LIMIT 20
            `;

            const result = await db.query(query, [searchTerm]);

            res.json({ success: true, data: result.rows });

        } catch (error) {
            console.error('Error en búsqueda global:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
};
