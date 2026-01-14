-- Cuentas de Miembro
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('leo.dicaprio@gmail.com', '04121111111', 'Actor, Productor y Ambientalista. UCAB Honoris Causa.', 'activa', 'publico', 'leo_en_el_ucab', 'oscar2016'),
('zendaya@gmail.com', '04122222222', 'Actriz y fashion icon. Estudiante de Artes.', 'activa', 'solo conexiones', 'zendaya_oficial', 'mj12345'),
('cillian.murphy@gmail.com', '04123333333', 'By order of the Peaky Blinders... and UCAB.', 'activa', 'privado', 'cillian_m', 'oppenheimer1'),
('scarlett.j@gmail.com', '04124444444', 'Black Widow en la gran pantalla, egresada en la vida real.', 'activa', 'publico', 'scarlett_j', 'avengers123'),
('admin.ucab@ucab.edu.ve', '02124074111', 'Cuenta Oficial de la Universidad.', 'activa', 'publico', 'soyucab_oficial', 'admin2026');

-- Perfiles de Persona
INSERT INTO soyucab.persona (email_persona, ci, nombres, apellidos, sexo, fecha_nacimiento, ocupacion_actual, empresa_actual, tutor) VALUES
('leo.dicaprio@gmail.com', '10101010', 'Leonardo', 'DiCaprio', 'M', '1974-11-11', 'Actor/Filántropo', 'Appian Way', FALSE),
('zendaya@gmail.com', '20202020', 'Zendaya', 'Coleman', 'F', '1996-09-01', 'Actriz', 'Disney/Sony', FALSE),
('cillian.murphy@gmail.com', '30303030', 'Cillian', 'Murphy', 'M', '1976-05-25', 'Actor', 'Syncopy Inc.', FALSE),
('scarlett.j@gmail.com', '40404040', 'Scarlett', 'Johansson', 'F', '1984-11-22', 'Productora', 'Marvel Studios', TRUE);

-- Roles Institucionales
INSERT INTO soyucab.rolInstitucional (email_persona, tipo_rol, fecha_inicio, estatus) VALUES
('scarlett.j@gmail.com', 'Egresado', '2010-07-20', 'Graduado'),
('cillian.murphy@gmail.com', 'Egresado', '2005-07-15', 'Graduado'),
('zendaya@gmail.com', 'Estudiante', '2023-09-15', 'Activo'),
('leo.dicaprio@gmail.com', 'Profesor', '2024-01-10', 'Activo');

-- Detalles de Egresados
INSERT INTO soyucab.egresado (email_egresado, fecha_inicio_rol, ci_egresado, facultad, fecha_acto_grado, pais, estado) VALUES
('scarlett.j@gmail.com', '2010-07-20', '40404040', 'Humanidades y Educación', '2010-07-20', 'US', 'New York'),
('cillian.murphy@gmail.com', '2005-07-15', '30303030', 'FACES', '2005-07-15', 'IE', 'Cork');

-- Empresas Contratantes (Llenará tu informe de "Top Empresas")
INSERT INTO soyucab.empresa (email_egresado, fecha_inicio_rol, nombre_empresa) VALUES
('scarlett.j@gmail.com', '2010-07-20', 'Marvel Studios'),
('scarlett.j@gmail.com', '2010-07-20', 'Disney'),
('cillian.murphy@gmail.com', '2005-07-15', 'Universal Pictures'),
('cillian.murphy@gmail.com', '2005-07-15', 'Marvel Studios'); -- ¡Ambos trabajaron en Marvel!

-- Detalles de Estudiante
INSERT INTO soyucab.estudiante (email_estudiante, fecha_inicio_rol, email_dominio_estudiante, ci_estudiante, semestre, carrera_programa, facultad, promedio) VALUES
('zendaya@gmail.com', '2023-09-15', 'zendaya@est.ucab.edu.ve', '20202020', 4, 'Comunicación Social', 'Humanidades y Educación', 19.50);

-- Relaciones de seguimiento (relacion)
INSERT INTO soyucab.relacion (usuario_origen, usuario_destino, fecha_solicitud, estado, seguimiento) VALUES
('zendaya@gmail.com', 'leo.dicaprio@gmail.com', NOW(), 'aceptada', TRUE),
('cillian.murphy@gmail.com', 'scarlett.j@gmail.com', NOW(), 'aceptada', TRUE);

-- Publicaciones (Usando timestamp(0) para evitar errores de precisión)
INSERT INTO soyucab.publicacion (email_publicador, fecha_publicacion, caption, tipo_contenido, configuracion_privacidad) VALUES
('leo.dicaprio@gmail.com', '2026-01-14 10:00:00', '¡Orgulloso de unirme a la UCAB como profesor invitado para hablar de sostenibilidad!', 'texto', 'publico'),
('zendaya@gmail.com', '2026-01-14 11:00:00', 'Estudiando para el parcial de Teoría de la Comunicación. ¡Deseenme suerte!', 'texto', 'publico');

-- Me gusta e Interacciones (Activará tus triggers trg_notificar_like)
INSERT INTO soyucab.me_gusta (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) VALUES
('zendaya@gmail.com', 'leo.dicaprio@gmail.com', '2026-01-14 10:00:00'),
('scarlett.j@gmail.com', 'leo.dicaprio@gmail.com', '2026-01-14 10:00:00');

-- Comentarios (Activará trg_notificar_comentario)
INSERT INTO soyucab.comentario (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido, fecha_creacion) VALUES
('cillian.murphy@gmail.com', 'leo.dicaprio@gmail.com', '2026-01-14 10:00:00', 'Excelente iniciativa, Leo.', '2026-01-14 10:05:00');

-- Grupos
INSERT INTO soyucab.grupo (nombre, descripcion, estado, categoria, email, privacidad) VALUES
('Actors Studio UCAB', 'Para los que sueñan con el Oscar.', 'activo', 'cultural', 'leo.dicaprio@gmail.com', 'publico');

-- Encuesta (Con la nueva tabla de texto que creaste)
INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_fin, estado_encuesta) VALUES
('Cine', 'admin.ucab@ucab.edu.ve', 'Película del Año', 'Vota por la favorita del campus', 'dependencia', '2026-02-01 00:00:00', 'publicada');

INSERT INTO soyucab.opcion_texto (tipo_encuesta, titulo_encuesta, numero_opcion, texto_opcion) VALUES
('Cine', 'Película del Año', 1, 'Oppenheimer'),
('Cine', 'Película del Año', 2, 'Barbie'),
('Cine', 'Película del Año', 3, 'Killers of the Flower Moon');

-- Voto (Probando la PK compuesta de 4 campos)
INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, completada) VALUES
('Cine', 'Película del Año', 1, 'zendaya@gmail.com', TRUE);

-- Configuración de Tutores en la tabla Persona
UPDATE soyucab.persona SET tutor = TRUE WHERE email_persona IN ('scarlett.j@gmail.com', 'leo.dicaprio@gmail.com');

-- Materias que dictan (Tutorías)
INSERT INTO soyucab.tutorias_materia (email_tutor, materia_nombre) VALUES
('scarlett.j@gmail.com', 'Actuación Cinematográfica'),
('scarlett.j@gmail.com', 'Producción de Blockbusters'),
('leo.dicaprio@gmail.com', 'Sostenibilidad y Medio Ambiente');

-- Relación de tutoría con estudiantes (Zendaya)
INSERT INTO soyucab.tutorias_estudiante (email_tutor, email_estudiante) VALUES
('scarlett.j@gmail.com', 'zendaya@gmail.com');

-- Actualizar promedio de Zendaya (cumpliendo el CHECK de la BD)
UPDATE soyucab.estudiante 
SET promedio = 19.85 
WHERE email_estudiante = 'zendaya@gmail.com';

