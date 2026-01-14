const pool = require('../config/database');

// Obtener todos los roles de un usuario específico
const getUserRoles = async (req, res) => {
    const { email } = req.params;

    try {
        console.log(`[UserRoles] Solicitando roles para: ${email}`);

        if (!email || email.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Email del usuario es requerido'
            });
        }

        // CONSULTA DIRECTA: Todos los roles del usuario, ordenados por fecha
        const query = `
            SELECT 
                ri.email_persona,
                p.nombres,
                p.apellidos,
                p.ci,
                ri.tipo_rol,
                ri.fecha_inicio,
                ri.fecha_finalizacion,
                ri.estatus,
                -- Duración en años
                CASE 
                    WHEN ri.fecha_finalizacion IS NOT NULL 
                    THEN EXTRACT(YEAR FROM AGE(ri.fecha_finalizacion, ri.fecha_inicio))
                    WHEN ri.estatus = 'Activo'
                    THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ri.fecha_inicio))
                    ELSE 0
                END AS duracion_anios,
                -- Formato del período
                CASE 
                    WHEN ri.fecha_finalizacion IS NOT NULL
                    THEN TO_CHAR(ri.fecha_inicio, 'DD/MM/YYYY') || ' - ' || TO_CHAR(ri.fecha_finalizacion, 'DD/MM/YYYY')
                    ELSE TO_CHAR(ri.fecha_inicio, 'DD/MM/YYYY') || ' - Actual'
                END AS periodo_formateado,
                -- Indicador de rol actual
                CASE 
                    WHEN ri.estatus = 'Activo' AND ri.fecha_finalizacion IS NULL 
                    THEN true
                    ELSE false
                END AS es_rol_actual
            FROM soyucab.rolInstitucional ri
            INNER JOIN soyucab.persona p ON ri.email_persona = p.email_persona
            WHERE ri.email_persona = $1
            ORDER BY ri.fecha_inicio DESC;
        `;

        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    email: email,
                    roles: [],
                    mensaje: 'El usuario no tiene roles registrados'
                }
            });
        }

        // Respuesta simple y directa
        const response = {
            success: true,
            data: {
                usuario: {
                    email: email,
                    nombres: result.rows[0]?.nombres || '',
                    apellidos: result.rows[0]?.apellidos || '',
                    ci: result.rows[0]?.ci || ''
                },
                roles: result.rows,
                total_roles: result.rows.length
            }
        };

        console.log(`[UserRoles] Roles encontrados para ${email}: ${result.rows.length}`);
        res.status(200).json(response);

    } catch (error) {
        console.error('[UserRoles] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalle: error.message
        });
    }
};

module.exports = {
    getUserRoles  // Solo esta función
};