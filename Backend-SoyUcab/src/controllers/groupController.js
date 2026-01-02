const db = require('../config/database');

const groupController = {
    // GET /api/groups/:name - Obtener detalles del grupo
    async getGroupDetails(req, res) {
        try {
            const { name } = req.params;
            const { userEmail } = req.query; // Se puede pasar el email por query para ver privacidad

            const groupRes = await db.query(
                `SELECT g.nombre, g.descripcion, g.fecha_creacion, g.cantidad_miembros, g.requisitos_ingreso, g.estado AS estado_grupo, g.categoria, g.email as creador_email,
                        m.nombre_usuario AS creador_nombre, g.privacidad
                 FROM soyucab.grupo g
                 LEFT JOIN soyucab.miembro m ON g.email = m.email
                 WHERE g.nombre = $1`,
                [name]
            );

            if (groupRes.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
            }

            const group = groupRes.rows[0];

            let admins = [];
            // Si es público o el usuario envía su email (simulando sesión)
            if (group.privacidad === 'publico' || userEmail) {
                const adminsRes = await db.query(
                    `SELECT pag.email_miembro, pag.rol_grupo, m.nombre_usuario
                     FROM soyucab.pertenece_a_grupo pag
                     LEFT JOIN soyucab.miembro m ON pag.email_miembro = m.email
                     WHERE pag.nombre_grupo = $1 AND pag.rol_grupo IN ('administrador', 'moderador')`,
                    [name]
                );
                admins = adminsRes.rows;
            }

            res.json({ success: true, data: { ...group, admins } });
        } catch (error) {
            console.error('Error obteniendo detalles del grupo:', error);
            res.status(500).json({ success: false, error: 'Error al obtener detalles del grupo' });
        }
    },

    // GET /api/groups/:name/members - Obtener miembros del grupo
    async getGroupMembers(req, res) {
        try {
            const { name } = req.params;
            const { userEmail } = req.query; // Email del solicitante enviado desde el cliente

            const groupRes = await db.query(`SELECT privacidad, estado FROM soyucab.grupo WHERE nombre = $1`, [name]);
            if (groupRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Grupo no encontrado' });

            const { privacidad } = groupRes.rows[0];

            // Validación de acceso si no es público
            if (privacidad !== 'publico') {
                if (!userEmail) return res.status(401).json({ success: false, error: 'Email de usuario requerido para grupos privados' });
                const memRes = await db.query(`SELECT * FROM soyucab.pertenece_a_grupo WHERE nombre_grupo = $1 AND email_miembro = $2 AND estado_participante = 'activo'`, [name, userEmail]);
                if (memRes.rows.length === 0) return res.status(403).json({ success: false, error: 'Acceso denegado: solo miembros pueden ver la lista' });
            }

            const membersRes = await db.query(
                `SELECT pag.email_miembro, pag.rol_grupo, pag.fecha_union, pag.estado_participante, m.nombre_usuario, p.nombres, p.apellidos
                 FROM soyucab.pertenece_a_grupo pag
                 LEFT JOIN soyucab.miembro m ON pag.email_miembro = m.email
                 LEFT JOIN soyucab.persona p ON pag.email_miembro = p.email_persona
                 WHERE pag.nombre_grupo = $1`,
                [name]
            );

            res.json({ success: true, count: membersRes.rows.length, data: membersRes.rows });
        } catch (error) {
            console.error('Error obteniendo miembros del grupo:', error);
            res.status(500).json({ success: false, error: 'Error al obtener miembros del grupo' });
        }
    },

    // GET /api/groups/user/:email
    async getMyGroups(req, res) {
        try {
            const { email } = req.params;
            const result = await db.query(
                `SELECT g.* FROM soyucab.grupo g
                 JOIN soyucab.pertenece_a_grupo pag ON g.nombre = pag.nombre_grupo
                 WHERE pag.email_miembro = $1 AND pag.estado_participante = 'activo'`,
                [email]
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al obtener grupos del usuario' });
        }
    },

    // GET /api/groups - Obtener todos los grupos
    async getAllGroups(req, res) {
        try {
            const result = await db.query(
                `SELECT nombre, descripcion, fecha_creacion, cantidad_miembros, categoria, privacidad, email as creador_email
                 FROM soyucab.grupo 
                 WHERE estado = 'activo'
                 ORDER BY cantidad_miembros DESC`
            );
            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error obteniendo todos los grupos:', error);
            res.status(500).json({ success: false, error: 'Error al obtener lista de grupos' });
        }
    },




    // POST /api/groups - Crear grupo
    async createGroup(req, res) {
        const { nombre, descripcion, categoria, requisitos_ingreso, privacidad, userEmail } = req.body;

        if (!userEmail) return res.status(400).json({ success: false, error: 'Email del creador es requerido' });
        if (!nombre) return res.status(400).json({ success: false, error: 'El nombre del grupo es obligatorio' });

        const client = await db.pool.connect();
        try {
            const exists = await client.query('SELECT 1 FROM soyucab.grupo WHERE nombre = $1', [nombre]);
            if (exists.rows.length > 0) return res.status(409).json({ success: false, error: 'Nombre de grupo ya existe' });

            await client.query('BEGIN');

            const estadoGrupo = req.body.estado || 'activo';
            const groupRes = await client.query(
                `INSERT INTO soyucab.grupo (nombre, descripcion, categoria, requisitos_ingreso, estado, privacidad, email, cantidad_miembros)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 1) RETURNING *`,
                [nombre, descripcion, categoria, requisitos_ingreso || null, estadoGrupo, privacidad || 'publico', userEmail]
            );

            await client.query(
                `INSERT INTO soyucab.pertenece_a_grupo (email_miembro, nombre_grupo, rol_grupo, estado_participante)
                 VALUES ($1, $2, 'administrador', 'activo')`,
                [userEmail, nombre]
            );

            await client.query('COMMIT');
            return res.status(201).json({ success: true, data: groupRes.rows[0] });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, error: 'Error al crear grupo' });
        } finally {
            client.release();
        }
    },

    // POST /api/groups/:name/join - Unirse a grupo
    async joinGroup(req, res) {
        const groupName = req.params.name;
        const { userEmail } = req.body;

        if (!userEmail) return res.status(400).json({ success: false, error: 'Email de usuario requerido' });

        const client = await db.pool.connect();
        try {
            const groupResult = await client.query('SELECT privacidad FROM soyucab.grupo WHERE nombre = $1', [groupName]);
            if (groupResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Grupo no encontrado' });

            const { privacidad } = groupResult.rows[0];

            const membership = await client.query(
                `SELECT * FROM soyucab.pertenece_a_grupo WHERE email_miembro = $1 AND nombre_grupo = $2`,
                [userEmail, groupName]
            );

            if (membership.rows.length > 0 && membership.rows[0].estado_participante === 'activo') {
                return res.status(409).json({ success: false, error: 'Ya eres miembro del grupo' });
            }

            if (privacidad === 'publico') {
                await client.query('BEGIN');
                await client.query(`INSERT INTO soyucab.pertenece_a_grupo (email_miembro, nombre_grupo, rol_grupo, estado_participante)
                    VALUES ($1, $2, 'miembro', 'activo') ON CONFLICT (email_miembro, nombre_grupo) DO UPDATE SET estado_participante = 'activo'`, [userEmail, groupName]);

                await client.query(`UPDATE soyucab.grupo SET cantidad_miembros = (SELECT COUNT(*) FROM soyucab.pertenece_a_grupo WHERE nombre_grupo = $1 AND estado_participante = 'activo') WHERE nombre = $1`, [groupName]);

                await client.query('COMMIT');
                return res.json({ success: true, message: 'Te uniste al grupo' });
            }

            if (privacidad === 'privado') {
                await client.query(`INSERT INTO soyucab.solicitud_unirse_grupo (nombre_grupo, email_miembro) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [groupName, userEmail]);
                return res.status(202).json({ success: true, message: 'Solicitud enviada' });
            }

            return res.status(403).json({ success: false, error: 'Grupo secreto. Requiere invitación.' });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({ success: false, error: 'Error al procesar solicitud' });
        } finally {
            client.release();
        }
    },


    // PUT /api/groups/:name - Actualizar datos del grupo
    async updateGroup(req, res) {
        try {
            const { name } = req.params;
            const { userEmail, ...updatesBody } = req.body;

            if (!userEmail) return res.status(400).json({ success: false, error: 'Email del administrador requerido' });

            const adminCheck = await db.query(
                `SELECT 1 FROM soyucab.pertenece_a_grupo WHERE nombre_grupo = $1 AND email_miembro = $2 AND rol_grupo = 'administrador'`,
                [name, userEmail]
            );

            if (adminCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Solo administradores pueden editar' });

            const allowed = ['descripcion', 'requisitos_ingreso', 'estado', 'privacidad', 'categoria'];
            const updates = {};
            allowed.forEach(f => { if (updatesBody[f] !== undefined) updates[f] = updatesBody[f]; });

            const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
            const values = [name, ...Object.values(updates)];

            const updated = await db.query(`UPDATE soyucab.grupo SET ${setClause} WHERE nombre = $1 RETURNING *`, values);
            res.json({ success: true, data: updated.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al actualizar grupo' });
        }
    },

    // DELETE /api/groups/:groupName/leave
    async leaveGroup(req, res) {
        try {
            const { groupName } = req.params;
            const { email } = req.body;

            if (!email || !groupName) {
                return res.status(400).json({ success: false, error: 'Email y grupo requeridos' });
            }

            // 1. Validar si es el creador principal
            const ownerCheck = await db.query(
                'SELECT email FROM soyucab.grupo WHERE nombre = $1',
                [groupName]
            );

            if (ownerCheck.rows.length > 0 && ownerCheck.rows[0].email === email) {
                return res.status(400).json({
                    success: false,
                    error: 'El creador no puede salir del grupo sin eliminarlo o cederlo.'
                });
            }

            // 2. CORRECCIÓN: El nombre de la tabla en tu SQL es 'pertenece_a_grupo'
            const result = await db.query(
                `DELETE FROM soyucab.pertenece_a_grupo 
                WHERE email_miembro = $1 AND nombre_grupo = $2`,
                [email, groupName]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: 'No eres miembro de este grupo' });
            }

            res.json({ success: true, message: 'Has salido del grupo correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error interno' });
        }
    },


    //=============Publicaciones del grupo=============

    // GET /api/groups/:name/posts - Obtener publicaciones
    async getGroupPosts(req, res) {
        try {
            const { name } = req.params;
            const { userEmail } = req.query;

            const postsRes = await db.query(
                `SELECT 
                    p.email_publicador,
                    p.nombre_grupo_publicado,
                    TO_CHAR(p.fecha_publicacion, 'YYYY-MM-DD HH24:MI:SS') as fecha_publicacion,
                    p.caption,
                    p.tipo_contenido,
                    p.descripcion_publicacion,
                    m.nombre_usuario AS publicador_nombre,
                    
                    -- Contar likes de la tabla me_gusta
                    (SELECT COUNT(*) FROM soyucab.me_gusta 
                    WHERE email_publicador_publicacion = p.email_publicador 
                    AND fecha_publicacion_publicacion = p.fecha_publicacion) AS contador_likes,
                    
                    -- Contar comentarios de la tabla comentario
                    (SELECT COUNT(*) FROM soyucab.comentario 
                    WHERE email_creador_publicacion = p.email_publicador 
                    AND fecha_creacion_publicacion = p.fecha_publicacion) AS contador_comentarios,
                    
                    -- Por ahora en 0 si no tienes tabla de compartidos
                    0 AS contador_compartidos,

                    -- Esto permite que el corazón se mantenga marcado al recargar
                    EXISTS (
                        SELECT 1 FROM soyucab.me_gusta 
                        WHERE email_publicador_publicacion = p.email_publicador 
                        AND fecha_publicacion_publicacion = p.fecha_publicacion
                        AND email_miembro_gusta = $2
                    ) AS user_liked

                FROM soyucab.publicacion p
                JOIN soyucab.miembro m ON p.email_publicador = m.email
                JOIN soyucab.pertenece_a_grupo pag ON pag.email_miembro = p.email_publicador 
                    AND pag.nombre_grupo = p.nombre_grupo_publicado
                WHERE p.nombre_grupo_publicado = $1 AND pag.estado_participante = 'activo'
                ORDER BY p.fecha_publicacion DESC`,
                [name, userEmail || null]
            );

            res.json({ success: true, count: postsRes.rows.length, data: postsRes.rows });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, error: 'Error al obtener publicaciones' });
        }
    },

    // POST /api/groups/:name/posts - Crear publicación
    async createGroupPost(req, res) {
        try {
            const { name } = req.params;
            const { userEmail, caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad } = req.body;

            if (!userEmail) return res.status(400).json({ success: false, error: 'Email de autor requerido' });

            // --- SOLUCIÓN FECHA: Generar formato YYYY-MM-DD HH:MM:SS ---
            const ahora = new Date();
            const fechaLimpia = ahora.toISOString()
                .slice(0, 19)       // Corta "2026-01-02T13:45:00.935Z" -> "2026-01-02T13:45:00"
                .replace('T', ' '); // Cambia T por espacio -> "2026-01-02 13:45:00"

            const insertRes = await db.query(
                `INSERT INTO soyucab.publicacion 
                (caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador, nombre_grupo_publicado, fecha_publicacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [caption || null, tipo_contenido || null, descripcion_publicacion || null, configuracion_privacidad || null, userEmail, name, fechaLimpia]
            );

            res.status(201).json({ success: true, data: insertRes.rows[0] });
        } catch (error) {
            console.error('Error al crear publicación:', error);
            res.status(500).json({ success: false, error: 'Error al crear publicación' });
        }
    },

    // PUT /api/groups/:name/posts - Actualizar publicación
    async updateGroupPost(req, res) {
        try {
            const { name } = req.params;
            const { email_publicador, fecha_publicacion, requesterEmail } = req.body;

            if (!requesterEmail) return res.status(400).json({ success: false, error: 'Email del solicitante requerido' });

            const postRes = await db.query(`SELECT * FROM soyucab.publicacion WHERE email_publicador = $1 AND fecha_publicacion = $2 AND nombre_grupo_publicado = $3`, [email_publicador, fecha_publicacion, name]);
            if (postRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Publicación no encontrada' });

            const isAdmin = await db.query(`SELECT 1 FROM soyucab.pertenece_a_grupo WHERE nombre_grupo = $1 AND email_miembro = $2 AND rol_grupo = 'administrador'`, [name, requesterEmail]);

            if (requesterEmail !== email_publicador && isAdmin.rows.length === 0) {
                return res.status(403).json({ success: false, error: 'No tienes permiso' });
            }

            const allowed = ['caption', 'descripcion_publicacion', 'tipo_contenido', 'configuracion_privacidad'];
            const updates = {};
            allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

            const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 4}`).join(', ');
            const values = [email_publicador, fecha_publicacion, name, ...Object.values(updates)];

            const updated = await db.query(`UPDATE soyucab.publicacion SET ${setClause} WHERE email_publicador = $1 AND fecha_publicacion = $2 AND nombre_grupo_publicado = $3 RETURNING *`, values);
            res.json({ success: true, data: updated.rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al actualizar' });
        }
    },
    async deleteGroupPost(req, res) {
        try {
            const { name } = req.params; // Nombre del grupo
            const { email_publicador, fecha_publicacion, requesterEmail } = req.body;

            if (!email_publicador || !fecha_publicacion || !requesterEmail) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan datos identificadores de la publicación o del solicitante'
                });
            }

            //  Verificar si la publicación existe y quién es el autor
            const postCheck = await db.query(
                `SELECT email_publicador FROM soyucab.publicacion 
                WHERE email_publicador = $1 AND fecha_publicacion = $2 AND nombre_grupo_publicado = $3`,
                [email_publicador, fecha_publicacion, name]
            );

            if (postCheck.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Publicación no encontrada' });
            }

            //  Verificar si el solicitante es el autor O es el administrador del grupo
            const adminCheck = await db.query(
                `SELECT rol_grupo FROM soyucab.pertenece_a_grupo 
                WHERE nombre_grupo = $1 AND email_miembro = $2 AND estado_participante = 'activo'`,
                [name, requesterEmail]
            );

            const isAuthor = postCheck.rows[0].email_publicador === requesterEmail;
            const isAdmin = adminCheck.rows.length > 0 && adminCheck.rows[0].rol_grupo === 'administrador';

            if (!isAuthor && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'No tienes permisos para eliminar esta publicación'
                });
            }

            //  Ejecutar la eliminación
            await db.query(
                `DELETE FROM soyucab.publicacion 
                WHERE email_publicador = $1 AND fecha_publicacion = $2 AND nombre_grupo_publicado = $3`,
                [email_publicador, fecha_publicacion, name]
            );

            res.json({ success: true, message: 'Publicación eliminada correctamente' });

        } catch (error) {
            console.error('Error al eliminar publicación:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    },
    // POST /api/groups/:name/posts/:email/:fecha/like
    async likePost(req, res) {
        try {
            const { name, email, fecha } = req.params; // 'fecha' es la que viene del frontend (aprox)
            const { userEmail } = req.body;

            if (!userEmail) return res.status(400).json({ success: false, error: 'Email de usuario requerido' });

            // 1. Buscamos la publicación real para obtener la FECHA DE ORIGEN exacta
            const pubCheck = await db.query(
                `SELECT fecha_publicacion 
                FROM soyucab.publicacion 
                WHERE email_publicador = $1 
                AND nombre_grupo_publicado = $2
                AND fecha_publicacion::date = $3::date
                LIMIT 1`,
                [email, name, fecha]
            );

            if (pubCheck.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Publicación original no encontrada' });
            }

            const fechaIdentificadorPost = pubCheck.rows[0].fecha_publicacion;


            await db.query(
                `INSERT INTO soyucab.me_gusta 
                (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion, fecha_like) 
                VALUES ($1, $2, $3, NOW()) 
                ON CONFLICT (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) 
                DO NOTHING`,
                [userEmail, email, fechaIdentificadorPost]
            );

            res.json({ success: true, message: '¡Like guardado con éxito!' });
        } catch (error) {
            console.error("Error en likePost:", error);
            res.status(500).json({ success: false, error: 'Error al procesar el like' });
        }
    },
    async unlikePost(req, res) {
        try {
            const { name, email, fecha } = req.params; // fecha viene como string
            const { userEmail } = req.body;

            if (!userEmail || !email || !fecha) {
                return res.status(400).json({ success: false, message: 'Faltan parámetros' });
            }

            // 1) Buscar la publicación (casteando la fecha recibida a timestamp)
            const pubRes = await db.query(
                `SELECT fecha_publicacion
                FROM soyucab.publicacion
                WHERE LOWER(email_publicador) = LOWER($1)
                AND nombre_grupo_publicado = $2
                AND fecha_publicacion::date = $3::date`,
                [email, name, fecha]
            );

            if (pubRes.rowCount === 0) {
                // Intento alternativo: buscar por rango pequeño si hay desajuste por zona/milisegundos
                const altRes = await db.query(
                    `SELECT fecha_publicacion
                FROM soyucab.publicacion
                WHERE LOWER(email_publicador) = LOWER($1)
                AND fecha_publicacion BETWEEN ($2::timestamp - INTERVAL '5 minutes') AND ($2::timestamp + INTERVAL '5 minutes')
                LIMIT 1`,
                    [email, fecha]
                );

                if (altRes.rowCount === 0) {
                    return res.status(404).json({ success: false, message: 'Publicación no encontrada' });
                }

                pubRes.rows[0] = altRes.rows[0];
            }

            const fechaExactaBD = pubRes.rows[0].fecha_publicacion;

            // 2) Borrar el like usando la fecha exacta de la BD
            const result = await db.query(
                `DELETE FROM soyucab.me_gusta
            WHERE LOWER(email_miembro_gusta) = LOWER($1)
                AND LOWER(email_publicador_publicacion) = LOWER($2)
                AND fecha_publicacion_publicacion = $3`,
                [userEmail, email, fechaExactaBD]
            );

            return res.json({ success: true, count: result.rowCount });
        } catch (err) {
            console.error('Error en unlikePost:', err);
            return res.status(500).json({ success: false, error: 'Error interno' });
        }
    },

    // POST /api/groups/:name/posts/:email/:fecha/comments
    async commentPost(req, res) {
        try {
            const { email, fecha } = req.params;
            const { userEmail, texto_comentario } = req.body;

            // Buscamos la publicación real para sincronizar fechas exactas por si hay desajuste de milisegundos
            const pub = await db.query(
                `SELECT fecha_publicacion FROM soyucab.publicacion 
                 WHERE email_publicador = $1 
                 ORDER BY ABS(EXTRACT(EPOCH FROM (fecha_publicacion - $2::timestamp))) ASC 
                 LIMIT 1`,
                [email, fecha]
            );

            if (pub.rows.length === 0) return res.status(404).json({ success: false, error: 'Post no encontrado' });

            await db.query(
                `INSERT INTO soyucab.comentario 
                (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido, fecha_creacion)
                VALUES ($1, $2, $3, $4, NOW())`,
                [userEmail, email, pub.rows[0].fecha_publicacion, texto_comentario]
            );

            res.json({ success: true, message: 'Comentario guardado' });
        } catch (error) {
            console.error("Error al comentar:", error);
            res.status(500).json({ success: false, error: 'Error interno al guardar comentario' });
        }
    },

    // Función para obtener comentarios de una publicación específica
    // En groupController.js
    async getPostComments(req, res) {
        const { name, email, fecha } = req.params;
        const userEmail = req.query.userEmail;

        try {
            // Limpiar la fecha para eliminar caracteres especiales
            const fechaLimpia = decodeURIComponent(fecha).replace(/%20/g, ' ').replace(/%3A/g, ':');

            // Verificar que la fecha tenga el formato correcto (YYYY-MM-DD HH:MM:SS)
            if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fechaLimpia)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato de fecha inválido. Se espera YYYY-MM-DD HH:MM:SS'
                });
            }

            // CORREGIDO: Eliminada la columna inexistente 'nombre_grupo_publicado'
            // La relación es directa con la Publicación (email_creador + fecha_publicacion)
            const query = `
                SELECT c.*, m.nombre_usuario
                FROM soyucab.comentario c
                JOIN soyucab.miembro m ON c.email_comentador = m.email
                WHERE c.email_creador_publicacion = $1
                AND c.fecha_creacion_publicacion = $2::timestamp
                ORDER BY c.fecha_creacion ASC
            `;

            // Quitamos 'name' de los parámetros porque no es parte de la PK de comentarios
            const result = await db.query(query, [email, fechaLimpia]);

            res.json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },
    // Eliminar un comentario
    async deleteComment(req, res) {
        try {
            const { email_comentador, email_pub, fecha_pub } = req.body;
            await db.query(
                `DELETE FROM soyucab.comentario 
                WHERE email_comentador = $1 
                AND email_creador_publicacion = $2 
                AND fecha_creacion_publicacion = $3`,
                [email_comentador, email_pub, fecha_pub]
            );
            res.json({ success: true, message: 'Comentario eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al eliminar' });
        }
    },

    // Editar un comentario
    async updateComment(req, res) {
        try {
            const { email_comentador, email_pub, fecha_pub, nuevo_contenido } = req.body;
            await db.query(
                `UPDATE soyucab.comentario 
                SET contenido = $1, editado = TRUE, fecha_actualizacion = NOW()
                WHERE email_comentador = $2 
                AND email_creador_publicacion = $3 
                AND fecha_creacion_publicacion = $4`,
                [nuevo_contenido, email_comentador, email_pub, fecha_pub]
            );
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    }
};




module.exports = groupController;