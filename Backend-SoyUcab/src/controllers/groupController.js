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

    // GET /api/groups/:name/posts - Obtener publicaciones
    async getGroupPosts(req, res) {
        try {
            const { name } = req.params;

            const postsRes = await db.query(
                `SELECT p.*, m.nombre_usuario AS publicador_nombre
                 FROM soyucab.publicacion p
                 JOIN soyucab.miembro m ON p.email_publicador = m.email
                 JOIN soyucab.pertenece_a_grupo pag ON pag.email_miembro = p.email_publicador AND pag.nombre_grupo = p.nombre_grupo_publicado
                 WHERE p.nombre_grupo_publicado = $1 AND pag.estado_participante = 'activo'
                 ORDER BY p.fecha_publicacion DESC`,
                [name]
            );

            res.json({ success: true, count: postsRes.rows.length, data: postsRes.rows });
        } catch (error) {
            console.error('Error obteniendo publicaciones del grupo:', error);
            res.status(500).json({ success: false, error: 'Error al obtener publicaciones del grupo' });
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

    // DELETE /api/groups/:name/posts
    async deleteGroupPost(req, res) {
        try {
            const { name } = req.params;
            const { email_publicador, fecha_publicacion, requesterEmail } = req.body;
            // Lógica simple de eliminación
            await db.query(
                `DELETE FROM soyucab.publicacion 
                 WHERE email_publicador = $1 AND fecha_publicacion = $2 AND nombre_grupo_publicado = $3`,
                [email_publicador, fecha_publicacion, name]
            );
            res.json({ success: true, message: 'Publicación eliminada' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al eliminar publicación' });
        }
    },

    // POST /api/groups/:name/posts/:email/:fecha/comments
    async commentPost(req, res) {
        try {
            const { email, fecha } = req.params;
            const { userEmail, texto_comentario } = req.body;
            await db.query(
                `INSERT INTO soyucab.comenta (email_miembro_comenta, email_publicador_publicacion, fecha_publicacion_publicacion, texto_comentario, fecha_comentario)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [userEmail, email, fecha, texto_comentario]
            );
            res.json({ success: true, message: 'Comentario agregado' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error al comentar' });
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

    // POST /api/groups/:name/posts - Crear publicación
    async createGroupPost(req, res) {
        try {
            const { name } = req.params;
            const { userEmail, caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad } = req.body;

            if (!userEmail) return res.status(400).json({ success: false, error: 'Email de autor requerido' });

            const memRes = await db.query(
                `SELECT * FROM soyucab.pertenece_a_grupo WHERE nombre_grupo = $1 AND email_miembro = $2 AND estado_participante = 'activo'`,
                [name, userEmail]
            );
            
            if (memRes.rows.length === 0) return res.status(403).json({ success: false, error: 'No eres miembro activo' });

            const insertRes = await db.query(
                `INSERT INTO soyucab.publicacion (caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, email_publicador, nombre_grupo_publicado)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [caption || null, tipo_contenido || null, descripcion_publicacion || null, configuracion_privacidad || null, userEmail, name]
            );

            res.status(201).json({ success: true, data: insertRes.rows[0] });
        } catch (error) {
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

    // POST /api/groups/:name/posts/:email/:fecha/like - Like
    async likePost(req, res) {
        try {
            const { name, email, fecha } = req.params;
            const { userEmail } = req.body;

            if (!userEmail) return res.status(400).json({ success: false, error: 'Email de usuario requerido' });

            await db.query(`INSERT INTO soyucab.me_gusta (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [userEmail, email, fecha]);
            res.json({ success: true, message: 'Like registrado' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error en like' });
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
    }
};

module.exports = groupController;