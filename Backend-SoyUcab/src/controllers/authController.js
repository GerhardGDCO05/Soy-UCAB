const db = require('../config/database');
const bcrypt = require('bcrypt');

const authController = {
  // POST /api/auth/register - Registrar nuevo miembro
  async register(req, res) {
    try {
      const {
        email,
        nombre_usuario,
        contraseña,
        nombres,
        apellidos,
        ci,
        sexo,
        fecha_nacimiento,
        telefono,
        biografia,
        privacidad_perfil = 'publico'
      } = req.body;

      console.log('📝 Registrando nuevo miembro:', email);

      // Validaciones básicas
      if (!email || !nombre_usuario || !contraseña || !nombres || !apellidos || !ci) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos'
        });
      }

      // Verificar si el email ya existe
      const emailExists = await db.query(
        'SELECT 1 FROM soyucab.miembro WHERE email = $1',
        [email]
      );

      if (emailExists.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }

      // Verificar si el nombre de usuario ya existe
      const usernameExists = await db.query(
        'SELECT 1 FROM soyucab.miembro WHERE nombre_usuario = $1',
        [nombre_usuario]
      );

      if (usernameExists.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'El nombre de usuario ya está en uso'
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contraseña, 10);

      // Iniciar transacción
      await db.query('BEGIN');

      try {
        // 1. Insertar en tabla miembro
        const miembroResult = await db.query(
          `INSERT INTO soyucab.miembro 
           (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña, fecha_registro)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING *`,
          [
            email,
            telefono || null,
            biografia || '',
            'activa',
            privacidad_perfil,
            nombre_usuario,
            hashedPassword
          ]
        );

        // 2. Insertar en tabla persona
        const personaResult = await db.query(
          `INSERT INTO soyucab.persona 
           (email_persona, ci, nombres, apellidos, sexo, fecha_nacimiento, ocupacion_actual, empresa_actual, influencer, tutor)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            email,
            ci,
            nombres,
            apellidos,
            sexo || 'M',
            fecha_nacimiento,
            null, // ocupacion_actual
            null, // empresa_actual
            false, // influencer
            false  // tutor
          ]
        );

        await db.query('COMMIT');

        // Excluir contraseña de la respuesta
        const { contraseña: _, ...miembroSinPassword } = miembroResult.rows[0];

        res.status(201).json({
          success: true,
          message: 'Usuario registrado exitosamente',
          data: {
            miembro: miembroSinPassword,
            persona: personaResult.rows[0]
          }
        });

      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error(' Error en registro:', error);
      
      // Errores específicos de PostgreSQL
      if (error.code === '23505') { // Violación de unicidad
        return res.status(409).json({
          success: false,
          error: 'El email o CI ya está registrado'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al registrar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // POST /api/auth/login - Iniciar sesión
  async login(req, res) {
    try {
      const { email, contraseña } = req.body;

      if (!email || !contraseña) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const userResult = await db.query(
        `SELECT m.*, p.nombres, p.apellidos 
         FROM soyucab.miembro m
         LEFT JOIN soyucab.persona p ON m.email = p.email_persona
         WHERE m.email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      const user = userResult.rows[0];

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Verificar estado de la cuenta
      if (user.estado_cuenta !== 'activa') {
        return res.status(403).json({
          success: false,
          error: `Cuenta ${user.estado_cuenta}. Contacta al administrador.`
        });
      }

      // Excluir contraseña de la respuesta
      const { contraseña: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login exitoso',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error(' Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar sesión'
      });
    }
  }
};

module.exports = authController;