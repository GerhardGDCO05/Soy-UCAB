const db = require('../config/database');
const bcrypt = require('bcrypt');

const memberController = {
  // GET /api/members - Obtener todos los miembros (con filtros)
  async getAllMembers(req, res) {
    try {
      const { 
        limit = 50, 
        page = 1, 
        tipo, 
        estado, 
        search,
        sortBy = 'fecha_registro',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      
      let query = 
          `SELECT 
          m.email,
          m.nombre_usuario,
          m.estado_cuenta,
          m.privacidad_perfil,
          m.fecha_registro,
          m.biografia,
          p.nombres,
          p.apellidos,
          p.ci,
          p.sexo,
          p.fecha_nacimiento,
          p.ocupacion_actual,
          p.empresa_actual,
          p.influencer,
          p.tutor,
          CASE 
            WHEN e.email_estudiante IS NOT NULL THEN 'Estudiante'
            WHEN eg.email_egresado IS NOT NULL THEN 'Egresado'
            WHEN pr.email_persona IS NOT NULL THEN 'Profesor'
            WHEN pa.email_persona IS NOT NULL THEN 'Personal Administrativo'
            WHEN po.email_persona IS NOT NULL THEN 'Personal Obrero'
            ELSE 'Miembro'
          END as tipo_miembro
        FROM soyucab.miembro m
        JOIN soyucab.persona p ON m.email = p.email_persona
        LEFT JOIN soyucab.estudiante e ON m.email = e.email_estudiante
        LEFT JOIN soyucab.egresado eg ON m.email = eg.email_egresado
        LEFT JOIN soyucab.profesor pr ON m.email = pr.email_persona
        LEFT JOIN soyucab.personal_administrativo pa ON m.email = pa.email_persona
        LEFT JOIN soyucab.personal_obrero po ON m.email = po.email_persona
        WHERE 1=1`;

      const params = [];
      let paramCount = 0;

      // Filtro por tipo
      if (tipo) {
        switch(tipo.toLowerCase()) {
          case 'estudiante':
            query += ` AND e.email_estudiante IS NOT NULL`;
            break;
          case 'egresado':
            query += ` AND eg.email_egresado IS NOT NULL`;
            break;
          case 'profesor':
            query += ` AND pr.email_persona IS NOT NULL`;
            break;
          case 'administrativo':
            query += ` AND pa.email_persona IS NOT NULL`;
            break;
          case 'obrero':
            query += ` AND po.email_persona IS NOT NULL`;
            break;
        }
      }

      // Filtro por estado
      if (estado) {
        paramCount++;
        query += ` AND m.estado_cuenta = $${paramCount}`;
        params.push(estado);
      }

      // Búsqueda
      if (search) {
        paramCount++;
        query += ` AND (
          m.email ILIKE $${paramCount} OR 
          m.nombre_usuario ILIKE $${paramCount} OR 
          p.nombres ILIKE $${paramCount} OR 
          p.apellidos ILIKE $${paramCount} OR
          p.ci ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      // Ordenamiento
      const validSortColumns = ['fecha_registro', 'nombre_usuario', 'nombres', 'apellidos'];
      const sortColumn = validSortColumns.includes(sortBy) ? 
        (sortBy === 'nombres' || sortBy === 'apellidos' ? `p.${sortBy}` : `m.${sortBy}`) : 
        'm.fecha_registro';
      
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${order}`;

      // Paginación
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));

      const result = await db.query(query, params);

      // Contar total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM soyucab.miembro m
        JOIN soyucab.persona p ON m.email = p.email_persona
        WHERE 1=1
      `;
      
      const countParams = [];
      let countParamCount = 0;

      if (tipo) {
        switch(tipo.toLowerCase()) {
          case 'estudiante':
            countQuery += ` AND EXISTS (SELECT 1 FROM soyucab.estudiante e WHERE e.email_estudiante = m.email)`;
            break;
          case 'egresado':
            countQuery += ` AND EXISTS (SELECT 1 FROM soyucab.egresado eg WHERE eg.email_egresado = m.email)`;
            break;
          case 'profesor':
            countQuery += ` AND EXISTS (SELECT 1 FROM soyucab.profesor pr WHERE pr.email_persona = m.email)`;
            break;
        }
      }

      if (estado) {
        countParamCount++;
        countQuery += ` AND m.estado_cuenta = $${countParamCount}`;
        countParams.push(estado);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (
          m.email ILIKE $${countParamCount} OR 
          m.nombre_usuario ILIKE $${countParamCount} OR 
          p.nombres ILIKE $${countParamCount} OR 
          p.apellidos ILIKE $${countParamCount}
        )`;
        countParams.push(`%${search}%`);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        count: result.rows.length,
        total: total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        data: result.rows
      });

    } catch (error) {
      console.error('Error obteniendo miembros:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener miembros' 
      });
    }
  },

  // GET /api/members/:email - Obtener miembro por email
  async getMemberByEmail(req, res) {
    try {
      const { email } = req.params;

      const result = await db.query(
        `SELECT 
          m.*,
          p.*,
          e.semestre,
          e.carrera_programa,
          e.facultad as facultad_estudiante,
          e.promedio,
          e.email_dominio_estudiante,
          eg.facultad as facultad_egresado,
          eg.fecha_acto_grado,
          eg.pais,
          eg.estado,
          pr.categoria as categoria_profesor,
          pr.dedicacion as dedicacion_profesor,
          pr.fecha_ingreso as fecha_ingreso_profesor,
          pa.cargo as cargo_administrativo,
          pa.ubicacion_de_trabajo as ubicacion_admin,
          pa.dedicacion as dedicacion_admin,
          po.cargo as cargo_obrero,
          po.dedicacion as dedicacion_obrero,
          po.empresa_a_la_que_pertenece as empresa_obrero,
          (SELECT COUNT(*) FROM soyucab.relacion r WHERE r.usuario_destino = m.email AND r.estado = 'aceptada') as seguidores,
          (SELECT COUNT(*) FROM soyucab.relacion r WHERE r.usuario_origen = m.email AND r.estado = 'aceptada') as siguiendo,
          (SELECT COUNT(*) FROM soyucab.grupo g WHERE g.email = m.email) as grupos_creados,
          (SELECT COUNT(*) FROM soyucab.pertenece_a_grupo pag WHERE pag.email_miembro = m.email AND pag.estado_participante = 'activo') as grupos_pertenece
          FROM soyucab.miembro m
          LEFT JOIN soyucab.persona p ON m.email = p.email_persona
          LEFT JOIN soyucab.estudiante e ON m.email = e.email_estudiante
          LEFT JOIN soyucab.egresado eg ON m.email = eg.email_egresado
          LEFT JOIN soyucab.profesor pr ON m.email = pr.email_persona
          LEFT JOIN soyucab.personal_administrativo pa ON m.email = pa.email_persona
          LEFT JOIN soyucab.personal_obrero po ON m.email = po.email_persona
          WHERE m.email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Miembro no encontrado' 
        });
      }

      const member = result.rows[0];
      
      let tipo_miembro = 'Miembro';
      if (member.semestre || member.carrera_programa) tipo_miembro = 'Estudiante';
      else if (member.facultad_egresado || member.fecha_acto_grado) tipo_miembro = 'Egresado';
      else if (member.categoria_profesor) tipo_miembro = 'Profesor';
      else if (member.cargo_administrativo) tipo_miembro = 'Personal Administrativo';
      else if (member.cargo_obrero) tipo_miembro = 'Personal Obrero';

      let info_adicional = {};
      
      if (tipo_miembro === 'Estudiante') {
        const materias = await db.query(
          `SELECT materia_nombre FROM soyucab.materias_impartidas WHERE email_persona = $1`,
          [email]
        );
        info_adicional = {
          estudiante: {
            semestre: member.semestre,
            carrera_programa: member.carrera_programa,
            facultad: member.facultad_estudiante,
            promedio: member.promedio,
            email_institucional: member.email_dominio_estudiante,
            materias: materias.rows.map(m => m.materia_nombre)
          }
        };
      } else if (tipo_miembro === 'Egresado') {
        const [titulos, empresas] = await Promise.all([
          db.query(`SELECT nombre_titulo FROM soyucab.titulo_obtenido WHERE email_egresado = $1`, [email]),
          db.query(`SELECT nombre_empresa FROM soyucab.empresa WHERE email_egresado = $1`, [email])
        ]);
        info_adicional = {
          egresado: {
            facultad: member.facultad_egresado,
            fecha_acto_grado: member.fecha_acto_grado,
            pais: member.pais,
            estado: member.estado,
            titulos: titulos.rows.map(t => t.nombre_titulo),
            empresas: empresas.rows.map(e => e.nombre_empresa)
          }
        };
      }

      const { contraseña, ...memberData } = member;
      
      res.json({ 
        success: true, 
        data: {
          ...memberData,
          tipo_miembro,
          estadisticas: {
            seguidores: member.seguidores || 0,
            siguiendo: member.siguiendo || 0,
            grupos_creados: member.grupos_creados || 0,
            grupos_pertenece: member.grupos_pertenece || 0
          },
          ...info_adicional
        }
      });

    } catch (error) {
      console.error('Error obteniendo miembro:', error);
      res.status(500).json({ success: false, error: 'Error al obtener miembro' });
    }
  },
  // GET /api/members/stats - Estadísticas globales para reportes
  async getStats(req, res) {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM soyucab.miembro) as total_miembros,
          (SELECT COUNT(*) FROM soyucab.estudiante) as total_estudiantes,
          (SELECT COUNT(*) FROM soyucab.profesor) as total_profesores,
          (SELECT COUNT(*) FROM soyucab.egresado) as total_egresados,
          (SELECT COUNT(*) FROM soyucab.grupo) as total_grupos
      `;
      const result = await db.query(query);
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  },

  // GET /api/members/:email/followers-analysis - Análisis de seguidores
  async getFollowersAnalysis(req, res) {
    try {
      const { email } = req.params;
      const query = `
        SELECT 
          p.sexo, 
          COUNT(*) as cantidad
        FROM soyucab.relacion r
        JOIN soyucab.persona p ON r.usuario_origen = p.email_persona
        WHERE r.usuario_destino = $1 AND r.estado = 'aceptada'
        GROUP BY p.sexo
      `;
      const result = await db.query(query, [email]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error en followers-analysis:', error);
      res.status(500).json({ success: false, error: 'Error en análisis de seguidores' });
    }
  },

  // POST /api/members - Crear miembro
  async createMember(req, res) {
    try {
      const {
        email, nombre_usuario, contraseña, nombres, apellidos, ci, telefono,
        biografia, sexo = 'M', fecha_nacimiento, estado_cuenta = 'activa',
        privacidad_perfil = 'publico', ocupacion_actual, empresa_actual,
        influencer = false, tutor = false, tipo_miembro, semestre,
        carrera_programa, facultad, promedio, email_dominio_estudiante,
        fecha_acto_grado, pais, estado_egresado, categoria_profesor,
        dedicacion_profesor, fecha_ingreso_profesor
      } = req.body;

      await db.query('BEGIN');

      try {
        await db.query(
          `INSERT INTO soyucab.miembro 
            (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña, fecha_registro)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [email, telefono, biografia || '', estado_cuenta, privacidad_perfil, nombre_usuario, contraseña]
        );

        await db.query(
          `INSERT INTO soyucab.persona 
            (email_persona, ci, nombres, apellidos, sexo, fecha_nacimiento, ocupacion_actual, empresa_actual, influencer, tutor)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [email, ci, nombres, apellidos, sexo, fecha_nacimiento, ocupacion_actual, empresa_actual, influencer, tutor]
        );

        if (tipo_miembro === 'Estudiante') {
          await db.query(
            `INSERT INTO soyucab.estudiante 
              (email_estudiante, ci_estudiante, semestre, carrera_programa, facultad, promedio, email_dominio_estudiante)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [email, ci, semestre, carrera_programa, facultad, promedio, email_dominio_estudiante]
          );
        }

        await db.query('COMMIT');
        res.status(201).json({ success: true, message: 'Miembro creado exitosamente' });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear miembro' });
    }
  },

  // PUT /api/members/:email - Actualizar miembro
  async updateMember(req, res) {
    try {
      const { email } = req.params;
      const updates = req.body;

      await db.query('BEGIN');

      try {
        // Actualizar tabla miembro
        const miembroFields = ['telefono', 'biografia', 'estado_cuenta', 'privacidad_perfil', 'nombre_usuario'];
        const mUpdates = Object.keys(updates).filter(k => miembroFields.includes(k));
        
        if (mUpdates.length > 0) {
          const setClause = mUpdates.map((k, i) => `${k} = $${i + 2}`).join(', ');
          await db.query(`UPDATE soyucab.miembro SET ${setClause} WHERE email = $1`, [email, ...mUpdates.map(k => updates[k])]);
        }

        // Actualizar contraseña si se provee (Sin validación de token de sesión)
        if (updates.contraseña) {
            // Nota: En un entorno real, aquí deberías validar que el 'currentPassword' 
            // coincida con el de la DB antes de cambiarlo si no hay tokens de por medio.
            await db.query('UPDATE soyucab.miembro SET contraseña = $1 WHERE email = $2', [updates.contraseña, email]);
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Miembro actualizado' });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar' });
    }
  },

  // DELETE /api/members/:email - Desactivar miembro
  async deactivateMember(req, res) {
    try {
      const { email } = req.params;
      await db.query("UPDATE soyucab.miembro SET estado_cuenta = 'inactiva' WHERE email = $1", [email]);
      res.json({ success: true, message: 'Miembro desactivado' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al desactivar' });
    }
  }
};

module.exports = memberController;