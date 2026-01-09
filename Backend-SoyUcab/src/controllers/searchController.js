const db = require('../config/database');

module.exports = {
    async search(req, res) {
        console.log('🔍 Búsqueda recibida:', req.query.q);
        console.log('📝 Ruta completa:', req.originalUrl);

        try {
            const { q } = req.query;

            if (!q || q.trim() === '') {
                console.log('Búsqueda vacía, retornando array vacío');
                return res.json({ success: true, data: [] });
            }

            const searchTerm = `%${q.trim()}%`;
            console.log('Término de búsqueda:', searchTerm);

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
                    email as handle,
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
                    nombre as id,
                    nombre,
                    'Grupo' as handle,
                    'Grupo' as tipo,
                    descripcion,
                    categoria::text as info_extra
                FROM soyucab.grupo
                WHERE nombre ILIKE $1
                
                LIMIT 20
            `;

            console.log('Ejecutando consulta SQL...');
            const result = await db.query(query, [searchTerm]);
            console.log(` Resultados encontrados: ${result.rows.length}`);

            res.json({
                success: true,
                data: result.rows
            });

        } catch (error) {
            console.error(' Error en búsqueda global:', error);
            res.status(500).json({
                success: false,
                error: 'Error en el servidor',
                details: error.message
            });
        }
    }
};