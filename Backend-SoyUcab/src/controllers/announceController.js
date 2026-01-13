const db = require('../config/database');

const announceController = {
    // 1. Crear Anuncio (Solo para Dependencias u Organizaciones)
    async createAnnouncement(req, res) {
        try {
            const { 
                creador_email, titulo, contenido, tipo_anuncio, 
                prioridad, fecha_publicacion, fecha_expiracion, 
                creador_tipo, destinatarios 
            } = req.body;

            console.log(" Datos recibidos:", { creador_email, titulo, tipo_anuncio, prioridad, creador_tipo, destinatarios });

            // Validaciones básicas
            if (!creador_email || !titulo || !contenido) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Faltan campos obligatorios: email, título o contenido' 
                });
            }

            if (!destinatarios || destinatarios.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Debes seleccionar al menos un destinatario' 
                });
            }

            // TIMESTAMP sin milisegundos (formato: '2026-01-10 15:30:45')
            const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            // Si no viene fecha_publicacion, usar ahora
            const fecha_pub = fecha_publicacion || fecha_creacion;
            
            // Fecha de expiración (puede ser NULL)
            const fecha_exp = fecha_expiracion || null;

            console.log(" Fechas a insertar:", { fecha_creacion, fecha_pub, fecha_exp });

            // Insertar en la tabla principal
            const insertAnuncio = await db.query(
                `INSERT INTO soyucab.anuncio 
                (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`,
                [fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_pub, fecha_exp, creador_tipo]
            );

            console.log(" Anuncio insertado:", insertAnuncio.rows[0]);

            // Insertar los destinatarios (Segmentación)
            for (const rol of destinatarios) {
                await db.query(
                    `INSERT INTO soyucab.destinatarios (fecha_creacion, creador_email, valor) 
                     VALUES ($1, $2, $3)`,
                    [fecha_creacion, creador_email, rol]
                );
                console.log(` Destinatario agregado: ${rol}`);
            }

            res.json({ 
                success: true, 
                message: "Anuncio publicado exitosamente",
                data: insertAnuncio.rows[0]
            });

        } catch (error) {
            console.error(" Error al crear anuncio:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                detail: error.detail || 'Error en base de datos'
            });
        }
    },

    // 2. Obtener Anuncios filtrados
    async getAnnouncements(req, res) {
        try {
            const { mi_rol, creador_email } = req.query;

            console.log("🔍 Filtros de búsqueda:", { mi_rol, creador_email });

            let sql, params;

            // Si viene creador_email: mostrar solo los anuncios de esa organización/dependencia
            if (creador_email) {
                sql = `
                    SELECT a.*, 
                           ARRAY_AGG(DISTINCT d.valor) as destinatarios_lista
                    FROM soyucab.anuncio a
                    LEFT JOIN soyucab.destinatarios d 
                        ON a.fecha_creacion = d.fecha_creacion 
                        AND a.creador_email = d.creador_email
                    WHERE a.creador_email = $1
                      AND (a.fecha_expiracion > NOW() OR a.fecha_expiracion IS NULL)
                    GROUP BY a.fecha_creacion, a.creador_email
                    ORDER BY a.prioridad DESC, a.fecha_publicacion DESC
                `;
                params = [creador_email];
            } 
            // Si viene mi_rol: filtrar por destinatarios (para personas)
            else if (mi_rol) {
                sql = `
                    SELECT DISTINCT a.*,
                           ARRAY_AGG(DISTINCT d.valor) as destinatarios_lista
                    FROM soyucab.anuncio a
                    JOIN soyucab.destinatarios d 
                        ON a.fecha_creacion = d.fecha_creacion 
                        AND a.creador_email = d.creador_email
                    WHERE d.valor = $1 
                      AND (a.fecha_expiracion > NOW() OR a.fecha_expiracion IS NULL)
                    GROUP BY a.fecha_creacion, a.creador_email
                    ORDER BY a.prioridad DESC, a.fecha_publicacion DESC
                `;
                params = [mi_rol];
            }
            // Si no viene nada: mostrar todos los anuncios activos
            else {
                sql = `
                    SELECT a.*,
                           ARRAY_AGG(DISTINCT d.valor) as destinatarios_lista
                    FROM soyucab.anuncio a
                    LEFT JOIN soyucab.destinatarios d 
                        ON a.fecha_creacion = d.fecha_creacion 
                        AND a.creador_email = d.creador_email
                    WHERE (a.fecha_expiracion > NOW() OR a.fecha_expiracion IS NULL)
                    GROUP BY a.fecha_creacion, a.creador_email
                    ORDER BY a.prioridad DESC, a.fecha_publicacion DESC
                `;
                params = [];
            }
            
            const result = await db.query(sql, params);
            
            console.log(` Anuncios encontrados: ${result.rows.length}`);
            
            res.json(result.rows);

        } catch (error) {
            console.error(" Error al obtener anuncios:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },

    // 3. Métrica de vistas (VERSIÓN AVANZADA - Sin duplicados)
    async trackView(req, res) {
        try {
            const { fecha_creacion, creador_email, viewer_email } = req.body;
            
            if (!viewer_email) {
                return res.json({ success: false, error: 'Falta viewer_email' });
            }
            
            console.log(` Registrando vista de ${viewer_email} en anuncio de ${creador_email}`);
            
            // Insertar vista única (si ya existe, no hace nada por el ON CONFLICT)
            await db.query(
                `INSERT INTO soyucab.anuncio_vistas (fecha_creacion, creador_email, viewer_email)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (fecha_creacion, creador_email, viewer_email) DO NOTHING`,
                [fecha_creacion, creador_email, viewer_email]
            );
            
            // Contar vistas únicas (usuarios diferentes que vieron este anuncio)
            const viewCount = await db.query(
                `SELECT COUNT(DISTINCT viewer_email) as total 
                 FROM soyucab.anuncio_vistas 
                 WHERE fecha_creacion = $1 AND creador_email = $2`,
                [fecha_creacion, creador_email]
            );
            
            // Actualizar el contador en la tabla principal
            await db.query(
                `UPDATE soyucab.anuncio 
                 SET vistas = $3 
                 WHERE fecha_creacion = $1 AND creador_email = $2`,
                [fecha_creacion, creador_email, viewCount.rows[0].total]
            );
            
            console.log(` Total vistas únicas: ${viewCount.rows[0].total}`);
            
            res.json({ 
                success: true, 
                vistas_unicas: viewCount.rows[0].total 
            });
            
        } catch (error) {
            console.error(" Error tracking view:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },

    // 4. NUEVO: Eliminar anuncio
    async deleteAnnouncement(req, res) {
        try {
            const { fecha_creacion, creador_email } = req.params;
            const { email_solicitante } = req.body;

            // Verificar que quien elimina es el creador
            if (email_solicitante !== creador_email) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'No tienes permiso para eliminar este anuncio' 
                });
            }

            // Primero eliminar destinatarios (por FK)
            await db.query(
                `DELETE FROM soyucab.destinatarios 
                 WHERE fecha_creacion = $1 AND creador_email = $2`,
                [fecha_creacion, creador_email]
            );

            // Eliminar vistas registradas
            await db.query(
                `DELETE FROM soyucab.anuncio_vistas 
                 WHERE fecha_creacion = $1 AND creador_email = $2`,
                [fecha_creacion, creador_email]
            );

            // Luego eliminar el anuncio
            const result = await db.query(
                `DELETE FROM soyucab.anuncio 
                 WHERE fecha_creacion = $1 AND creador_email = $2
                 RETURNING *`,
                [fecha_creacion, creador_email]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Anuncio no encontrado' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Anuncio eliminado exitosamente' 
            });

        } catch (error) {
            console.error("Error eliminando anuncio:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },

    
};

module.exports = announceController;