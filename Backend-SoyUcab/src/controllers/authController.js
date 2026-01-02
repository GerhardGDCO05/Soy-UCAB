const db = require('../config/database');
const bcrypt = require('bcrypt'); // Se mantiene por si decides usarlo en el futuro

const authController = {
  /**
   * POST /api/auth/register
   * Registra una nueva entidad (dependencia u organización)
   */
  async register(req, res) {
    try {
      const {
        email,
        nombre_usuario,
        contraseña,
        telefono,
        biografia,
        tipo_entidad,
        privacidad_perfil = 'publico',
        // Campos dependencia
        nombre_institucional,
        descripcion,
        logo,
        pagina_web,
        fecha_creacion,
        estado,
        responsable,
        ubicacion_fisica,
        edificio,
        tipo_dependencia,
        // Campos organización
        rif,
        nombre,
        tipos_colaboracion,
        tipo_organizacion
      } = req.body;

      // 1. Validaciones de tipo
      if (!tipo_entidad || (tipo_entidad !== 'dependencia' && tipo_entidad !== 'organizacion')) {
        return res.status(400).json({ success: false, error: 'Tipo de entidad inválido.' });
      }

      // 2. Verificar existencia previa (Email y Usuario)
      const checkMiembro = await db.query(
        'SELECT email, nombre_usuario FROM soyucab.miembro WHERE email = $1 OR nombre_usuario = $2',
        [email, nombre_usuario]
      );

      if (checkMiembro.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'El email o nombre de usuario ya existe.' });
      }

      await db.query('BEGIN');

      try {
        // 3. Insertar en tabla Miembro
        const miembroResult = await db.query(
          `INSERT INTO soyucab.miembro
           (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña, fecha_registro)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING email, nombre_usuario, telefono, biografia, estado_cuenta`,
          [email, telefono || null, biografia || '', 'activa', privacidad_perfil, nombre_usuario, contraseña]
        );

        let entidadResult = null;

        if (tipo_entidad === 'dependencia') {
          entidadResult = await db.query(
            `INSERT INTO soyucab.dependencia_ucab
             (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, responsable, ubicacion_fisica, edificio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [nombre_institucional, email, descripcion, logo || null, pagina_web || null, 
             fecha_creacion || new Date().toISOString().split('T')[0], estado || 'activa', 
             responsable || 'Admin', ubicacion_fisica || null, edificio || null]
          );
        } else {
          const tiposColab = Array.isArray(tipos_colaboracion) ? JSON.stringify(tipos_colaboracion) : tipos_colaboracion;
          entidadResult = await db.query(
            `INSERT INTO soyucab.organizacion_asociada
             (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [rif, email, nombre, logo || null, pagina_web || null, descripcion || biografia || null, tiposColab]
          );
        }

        await db.query('COMMIT');

        res.status(201).json({
          success: true,
          message: 'Registro exitoso',
          data: { miembro: miembroResult.rows[0], entidad: entidadResult.rows[0], tipo_entidad }
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },

  /**
   * POST /api/auth/login
   * Autenticación simple sin JWT
   */
  async login(req, res) {
    try {
      const { email, contraseña } = req.body;

      if (!email || !contraseña) {
        return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
      }

      const userRes = await db.query('SELECT * FROM soyucab.miembro WHERE email = $1', [email]);
      const user = userRes.rows[0];

      if (!user || user.contraseña !== contraseña) {
        return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
      }

      if (user.estado_cuenta !== 'activa') {
        return res.status(403).json({ success: false, error: 'Cuenta no activa' });
      }

      // Obtener toda la información extendida según el tipo
      const extraInfo = await authController._getUserDetails(email);

      const { contraseña: _, ...safeUser } = user;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: { ...safeUser, ...extraInfo }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
  },

  /**
   * GET /api/auth/me/:email
   * Obtiene el perfil actual basado en el email enviado como parámetro
   */
  async me(req, res) {
    try {
      const { email } = req.params;

      const userRes = await db.query('SELECT * FROM soyucab.miembro WHERE email = $1', [email]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const extraInfo = await authController._getUserDetails(email);
      const { contraseña: _, ...safeUser } = userRes.rows[0];

      res.json({
        success: true,
        data: { ...safeUser, ...extraInfo }
      });
    } catch (error) {
      console.error('Error en me:', error);
      res.status(500).json({ success: false, error: 'Error al obtener datos' });
    }
  },

  /**
   * Métodos de Actualización (Se mantienen lógicas de validación)
   */
  async updateDependencia(req, res) {
    try {
      const { email } = req.params;
      const updates = req.body;
      
      const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = [email, ...Object.values(updates)];

      const result = await db.query(
        `UPDATE soyucab.dependencia_ucab SET ${setClause} WHERE email = $1 RETURNING *`,
        values
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar' });
    }
  },

  async updateOrganizacion(req, res) {
    try {
      const { email } = req.params;
      const updates = req.body;
      
      const setClause = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = [email, ...Object.values(updates)];

      const result = await db.query(
        `UPDATE soyucab.organizacion_asociada SET ${setClause} WHERE email = $1 RETURNING *`,
        values
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al actualizar' });
    }
  },

  /**
   * MÉTODO PRIVADO (Auxiliar)
   * Centraliza la búsqueda de roles e información académica
   */
  async _getUserDetails(email) {
    let tipo_usuario = 'persona';
    let entidad_info = null;
    let persona_info = null;
    let academicInfo = {};

    // 1. ¿Es Dependencia?
    const dep = await db.query('SELECT * FROM soyucab.dependencia_ucab WHERE email = $1', [email]);
    if (dep.rows.length > 0) return { tipo_usuario: 'dependencia', entidad_info: dep.rows[0] };

    // 2. ¿Es Organización?
    const org = await db.query('SELECT * FROM soyucab.organizacion_asociada WHERE email = $1', [email]);
    if (org.rows.length > 0) return { tipo_usuario: 'organizacion', entidad_info: org.rows[0] };

    // 3. Es Persona (Estudiante/Profesor/Egresado)
    const per = await db.query('SELECT * FROM soyucab.persona WHERE email_persona = $1', [email]);
    if (per.rows.length > 0) {
      persona_info = per.rows[0];
      
      // Estudiante
      const est = await db.query('SELECT * FROM soyucab.estudiante WHERE email_estudiante = $1', [email]);
      if (est.rows.length > 0) academicInfo.estudiante = est.rows[0];

      // Profesor
      const prof = await db.query('SELECT * FROM soyucab.profesor WHERE email_persona = $1', [email]);
      if (prof.rows.length > 0) academicInfo.profesor = prof.rows[0];

      // Egresado
      const egr = await db.query('SELECT * FROM soyucab.egresado WHERE email_egresado = $1', [email]);
      if (egr.rows.length > 0) academicInfo.egresado = egr.rows[0];
    }

    return { tipo_usuario, persona_info, academicInfo };
  }
};

module.exports = authController;