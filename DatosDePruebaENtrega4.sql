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


SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'soyucab'
  AND table_name = 'comentario'
ORDER BY ordinal_position;


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


--NUEVOOOOOOOOOO



-- ============================================================================
-- INSERTS ADICIONALES CORREGIDOS PARA LA BD SOYUCAB
-- Las organizaciones y dependencias PRIMERO se crean como miembros
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZACIÓN ASOCIADA
-- ============================================================================

-- 1.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('contacto@fundacionpolar.org', '02129512111', 'Fundación sin fines de lucro dedicada a la educación y cultura en Venezuela.', 'activa', 'publico', 'fund_polar', 'polar2026'),
('eventos@empresaspolar.com', '02129512222', 'Principal patrocinador de eventos deportivos y culturales UCAB.', 'activa', 'publico', 'empresas_polar', 'polar123');

-- 1.2 Crear en tabla organizacion_asociada
INSERT INTO soyucab.organizacion_asociada (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion) VALUES
('J-30123456-7', 'contacto@fundacionpolar.org', 'Fundación Polar', 
'https://fundacionpolar.org/logo.png', 
'https://www.fundacionpolar.org', 
'Organización sin fines de lucro dedicada a la educación, cultura y desarrollo social en Venezuela.',
'{"patrocinio": true, "investigacion": true, "eventos_culturales": true}'::json),

('J-40567890-1', 'eventos@empresaspolar.com', 'Empresas Polar',
'https://empresaspolar.com/logo.png',
'https://www.empresaspolar.com',
'Principal grupo empresarial venezolano, patrocinador de eventos deportivos y culturales en la UCAB.',
'{"patrocinio": true, "eventos_deportivos": true, "becas": false}'::json);

-- ============================================================================
-- 2. DEPENDENCIA UCAB
-- ============================================================================

-- 2.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('cultura@ucab.edu.ve', '02124074211', 'Dirección de Cultura UCAB - Organizamos eventos culturales y artísticos.', 'activa', 'publico', 'cultura_ucab', 'cultura2026'),
('cefaces@est.ucab.edu.ve', '02124074333', 'Centro de Estudiantes FACES - Representamos a los estudiantes de Económicas y Sociales.', 'activa', 'publico', 'ce_faces', 'faces2026'),
('investigacion@ucab.edu.ve', '02124074444', 'Decanato de Investigación UCAB - Promovemos la investigación académica.', 'activa', 'publico', 'invest_ucab', 'invest2026');

-- 2.2 Crear en tabla dependencia_ucab
INSERT INTO soyucab.dependencia_ucab (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, ubicacion_fisica) VALUES
('Dirección de Cultura', 'cultura@ucab.edu.ve', 
'Organiza y coordina eventos culturales, exposiciones artísticas y actividades de formación cultural para toda la comunidad universitaria UCAB.',
'https://ucab.edu.ve/cultura/logo.png',
'https://www.ucab.edu.ve/cultura',
'1990-01-15',
'activa',
'Edificio Cincuentenario, Piso 2'),

('Centro de Estudiantes FACES', 'cefaces@est.ucab.edu.ve',
'Representa los intereses de los estudiantes de la Facultad de Ciencias Económicas y Sociales, organiza eventos académicos, deportivos y sociales.',
'https://ucab.edu.ve/cefaces/logo.png',
'https://www.ucab.edu.ve/cefaces',
'2000-09-01',
'activa',
'Edificio FACES, Planta Baja'),

('Decanato de Investigación', 'investigacion@ucab.edu.ve',
'Promueve y coordina proyectos de investigación académica, publicaciones científicas y desarrollo de conocimiento en todas las facultades UCAB.',
'https://ucab.edu.ve/investigacion/logo.png',
'https://www.ucab.edu.ve/investigacion',
'1985-03-20',
'activa',
'Edificio San Agustín, Piso 3');

-- ============================================================================
-- 3. ANUNCIO (De la Dirección de Cultura)
-- ============================================================================
INSERT INTO soyucab.anuncio (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'Inscripciones Abiertas: Talleres de Verano 2026', 
'La Dirección de Cultura anuncia la apertura de inscripciones para los Talleres de Verano 2026. Ofrecemos: Teatro, Fotografía, Música y Danza. Cupos limitados. Inscripciones hasta el 31 de enero.', 
'academico', 'alta', '2026-01-13 08:00:00', '2026-01-31 23:59:59', 'dependencia');

-- Registro de vistas del anuncio
INSERT INTO soyucab.anuncio_vistas (fecha_creacion, creador_email, viewer_email, fecha_vista) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'zendaya@gmail.com', '2026-01-13 09:30:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'cillian.murphy@gmail.com', '2026-01-13 10:15:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'leo.dicaprio@gmail.com', '2026-01-13 11:00:00');

-- ============================================================================
-- 4. ENCUESTA MEJORADA (Sobre Satisfacción del Campus)
-- ============================================================================
INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_fin, estado_encuesta) VALUES
('Campus', 'admin.ucab@ucab.edu.ve', 'Satisfacción con Servicios UCAB', 
'Queremos conocer tu opinión sobre los servicios del campus. Tu feedback es importante.', 
'dependencia', '2026-02-15 23:59:59', 'publicada');

-- Texto de las opciones
INSERT INTO soyucab.opcion_texto (tipo_encuesta, titulo_encuesta, numero_opcion, texto_opcion) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 1, 'Muy satisfecho - Todo funciona excelente'),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'Satisfecho - Buen servicio en general'),
('Campus', 'Satisfacción con Servicios UCAB', 3, 'Neutral - Ni bueno ni malo'),
('Campus', 'Satisfacción con Servicios UCAB', 4, 'Insatisfecho - Necesita mejoras'),
('Campus', 'Satisfacción con Servicios UCAB', 5, 'Muy insatisfecho - Requiere cambios urgentes');

-- Votos de ejemplo
INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, completada) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 2, 'zendaya@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'cillian.murphy@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 1, 'scarlett.j@gmail.com', TRUE);

-- ============================================================================
-- 5. CORRECCIÓN DE PROMEDIOS (Cumpliendo CHECK >= 0 AND <= 20)
-- ============================================================================
UPDATE soyucab.estudiante 
SET promedio = 18.75 
WHERE email_estudiante = 'zendaya@gmail.com';

-- ============================================================================
-- ============================================================================
-- INSERTS ADICIONALES CORREGIDOS PARA LA BD SOYUCAB
-- Las organizaciones y dependencias PRIMERO se crean como miembros
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZACIÓN ASOCIADA
-- ============================================================================

-- 1.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('contacto@fundacionpolar.org', '02129512111', 'Fundación sin fines de lucro dedicada a la educación y cultura en Venezuela.', 'activa', 'publico', 'fund_polar', 'polar2026'),
('eventos@empresaspolar.com', '02129512222', 'Principal patrocinador de eventos deportivos y culturales UCAB.', 'activa', 'publico', 'empresas_polar', 'polar123');

-- 1.2 Crear en tabla organizacion_asociada
INSERT INTO soyucab.organizacion_asociada (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion) VALUES
('J-30123456-7', 'contacto@fundacionpolar.org', 'Fundación Polar', 
'https://fundacionpolar.org/logo.png', 
'https://www.fundacionpolar.org', 
'Organización sin fines de lucro dedicada a la educación, cultura y desarrollo social en Venezuela.',
'{"patrocinio": true, "investigacion": true, "eventos_culturales": true}'::json),

('J-40567890-1', 'eventos@empresaspolar.com', 'Empresas Polar',
'https://empresaspolar.com/logo.png',
'https://www.empresaspolar.com',
'Principal grupo empresarial venezolano, patrocinador de eventos deportivos y culturales en la UCAB.',
'{"patrocinio": true, "eventos_deportivos": true, "becas": false}'::json);

-- ============================================================================
-- 2. DEPENDENCIA UCAB
-- ============================================================================

-- 2.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('cultura@ucab.edu.ve', '02124074211', 'Dirección de Cultura UCAB - Organizamos eventos culturales y artísticos.', 'activa', 'publico', 'cultura_ucab', 'cultura2026'),
('cefaces@est.ucab.edu.ve', '02124074333', 'Centro de Estudiantes FACES - Representamos a los estudiantes de Económicas y Sociales.', 'activa', 'publico', 'ce_faces', 'faces2026'),
('investigacion@ucab.edu.ve', '02124074444', 'Decanato de Investigación UCAB - Promovemos la investigación académica.', 'activa', 'publico', 'invest_ucab', 'invest2026');

-- 2.2 Crear en tabla dependencia_ucab
INSERT INTO soyucab.dependencia_ucab (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, ubicacion_fisica) VALUES
('Dirección de Cultura', 'cultura@ucab.edu.ve', 
'Organiza y coordina eventos culturales, exposiciones artísticas y actividades de formación cultural para toda la comunidad universitaria UCAB.',
'https://ucab.edu.ve/cultura/logo.png',
'https://www.ucab.edu.ve/cultura',
'1990-01-15',
'activa',
'Edificio Cincuentenario, Piso 2'),

('Centro de Estudiantes FACES', 'cefaces@est.ucab.edu.ve',
'Representa los intereses de los estudiantes de la Facultad de Ciencias Económicas y Sociales, organiza eventos académicos, deportivos y sociales.',
'https://ucab.edu.ve/cefaces/logo.png',
'https://www.ucab.edu.ve/cefaces',
'2000-09-01',
'activa',
'Edificio FACES, Planta Baja'),

('Decanato de Investigación', 'investigacion@ucab.edu.ve',
'Promueve y coordina proyectos de investigación académica, publicaciones científicas y desarrollo de conocimiento en todas las facultades UCAB.',
'https://ucab.edu.ve/investigacion/logo.png',
'https://www.ucab.edu.ve/investigacion',
'1985-03-20',
'activa',
'Edificio San Agustín, Piso 3');

-- ============================================================================
-- 3. ANUNCIO (De la Dirección de Cultura)
-- ============================================================================
INSERT INTO soyucab.anuncio (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'Inscripciones Abiertas: Talleres de Verano 2026', 
'La Dirección de Cultura anuncia la apertura de inscripciones para los Talleres de Verano 2026. Ofrecemos: Teatro, Fotografía, Música y Danza. Cupos limitados. Inscripciones hasta el 31 de enero.', 
'academico', 'alta', '2026-01-13 08:00:00', '2026-01-31 23:59:59', 'dependencia');

-- Registro de vistas del anuncio
INSERT INTO soyucab.anuncio_vistas (fecha_creacion, creador_email, viewer_email, fecha_vista) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'zendaya@gmail.com', '2026-01-13 09:30:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'cillian.murphy@gmail.com', '2026-01-13 10:15:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'leo.dicaprio@gmail.com', '2026-01-13 11:00:00');

-- ============================================================================
-- 4. ENCUESTA MEJORADA (Sobre Satisfacción del Campus)
-- ============================================================================
INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_fin, estado_encuesta) VALUES
('Campus', 'admin.ucab@ucab.edu.ve', 'Satisfacción con Servicios UCAB', 
'Queremos conocer tu opinión sobre los servicios del campus. Tu feedback es importante.', 
'dependencia', '2026-02-15 23:59:59', 'publicada');

-- Texto de las opciones
INSERT INTO soyucab.opcion_texto (tipo_encuesta, titulo_encuesta, numero_opcion, texto_opcion) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 1, 'Muy satisfecho - Todo funciona excelente'),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'Satisfecho - Buen servicio en general'),
('Campus', 'Satisfacción con Servicios UCAB', 3, 'Neutral - Ni bueno ni malo'),
('Campus', 'Satisfacción con Servicios UCAB', 4, 'Insatisfecho - Necesita mejoras'),
('Campus', 'Satisfacción con Servicios UCAB', 5, 'Muy insatisfecho - Requiere cambios urgentes');

-- Votos de ejemplo
INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, completada) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 2, 'zendaya@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'cillian.murphy@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 1, 'scarlett.j@gmail.com', TRUE);

-- ============================================================================
-- 5. CORRECCIÓN DE PROMEDIOS (Cumpliendo CHECK >= 0 AND <= 20)
-- ============================================================================
UPDATE soyucab.estudiante 
SET promedio = 18.75 
WHERE email_estudiante = 'zendaya@gmail.com';

-- ============================================================================
-- ============================================================================
-- INSERTS ADICIONALES CORREGIDOS PARA LA BD SOYUCAB
-- Las organizaciones y dependencias PRIMERO se crean como miembros
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZACIÓN ASOCIADA
-- ============================================================================

-- 1.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('contacto@fundacionpolar.org', '02129512111', 'Fundación sin fines de lucro dedicada a la educación y cultura en Venezuela.', 'activa', 'publico', 'fund_polar', 'polar2026'),
('eventos@empresaspolar.com', '02129512222', 'Principal patrocinador de eventos deportivos y culturales UCAB.', 'activa', 'publico', 'empresas_polar', 'polar123');

-- 1.2 Crear en tabla organizacion_asociada
INSERT INTO soyucab.organizacion_asociada (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion) VALUES
('J-30123456-7', 'contacto@fundacionpolar.org', 'Fundación Polar', 
'https://fundacionpolar.org/logo.png', 
'https://www.fundacionpolar.org', 
'Organización sin fines de lucro dedicada a la educación, cultura y desarrollo social en Venezuela.',
'{"patrocinio": true, "investigacion": true, "eventos_culturales": true}'::json),

('J-40567890-1', 'eventos@empresaspolar.com', 'Empresas Polar',
'https://empresaspolar.com/logo.png',
'https://www.empresaspolar.com',
'Principal grupo empresarial venezolano, patrocinador de eventos deportivos y culturales en la UCAB.',
'{"patrocinio": true, "eventos_deportivos": true, "becas": false}'::json);

-- ============================================================================
-- 2. DEPENDENCIA UCAB
-- ============================================================================

-- 2.1 Crear como MIEMBRO primero
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
('cultura@ucab.edu.ve', '02124074211', 'Dirección de Cultura UCAB - Organizamos eventos culturales y artísticos.', 'activa', 'publico', 'cultura_ucab', 'cultura2026'),
('cefaces@est.ucab.edu.ve', '02124074333', 'Centro de Estudiantes FACES - Representamos a los estudiantes de Económicas y Sociales.', 'activa', 'publico', 'ce_faces', 'faces2026'),
('investigacion@ucab.edu.ve', '02124074444', 'Decanato de Investigación UCAB - Promovemos la investigación académica.', 'activa', 'publico', 'invest_ucab', 'invest2026');

-- 2.2 Crear en tabla dependencia_ucab
INSERT INTO soyucab.dependencia_ucab (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, ubicacion_fisica) VALUES
('Dirección de Cultura', 'cultura@ucab.edu.ve', 
'Organiza y coordina eventos culturales, exposiciones artísticas y actividades de formación cultural para toda la comunidad universitaria UCAB.',
'https://ucab.edu.ve/cultura/logo.png',
'https://www.ucab.edu.ve/cultura',
'1990-01-15',
'activa',
'Edificio Cincuentenario, Piso 2'),

('Centro de Estudiantes FACES', 'cefaces@est.ucab.edu.ve',
'Representa los intereses de los estudiantes de la Facultad de Ciencias Económicas y Sociales, organiza eventos académicos, deportivos y sociales.',
'https://ucab.edu.ve/cefaces/logo.png',
'https://www.ucab.edu.ve/cefaces',
'2000-09-01',
'activa',
'Edificio FACES, Planta Baja'),

('Decanato de Investigación', 'investigacion@ucab.edu.ve',
'Promueve y coordina proyectos de investigación académica, publicaciones científicas y desarrollo de conocimiento en todas las facultades UCAB.',
'https://ucab.edu.ve/investigacion/logo.png',
'https://www.ucab.edu.ve/investigacion',
'1985-03-20',
'activa',
'Edificio San Agustín, Piso 3');

-- ============================================================================
-- 3. ANUNCIO (De la Dirección de Cultura)
-- ============================================================================
INSERT INTO soyucab.anuncio (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'Inscripciones Abiertas: Talleres de Verano 2026', 
'La Dirección de Cultura anuncia la apertura de inscripciones para los Talleres de Verano 2026. Ofrecemos: Teatro, Fotografía, Música y Danza. Cupos limitados. Inscripciones hasta el 31 de enero.', 
'academico', 'alta', '2026-01-13 08:00:00', '2026-01-31 23:59:59', 'dependencia');

-- Registro de vistas del anuncio
INSERT INTO soyucab.anuncio_vistas (fecha_creacion, creador_email, viewer_email, fecha_vista) VALUES
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'zendaya@gmail.com', '2026-01-13 09:30:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'cillian.murphy@gmail.com', '2026-01-13 10:15:00'),
('2026-01-13 08:00:00', 'cultura@ucab.edu.ve', 'leo.dicaprio@gmail.com', '2026-01-13 11:00:00');

-- ============================================================================
-- 4. ENCUESTA MEJORADA (Sobre Satisfacción del Campus)
-- ============================================================================
INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_fin, estado_encuesta) VALUES
('Campus', 'admin.ucab@ucab.edu.ve', 'Satisfacción con Servicios UCAB', 
'Queremos conocer tu opinión sobre los servicios del campus. Tu feedback es importante.', 
'dependencia', '2026-02-15 23:59:59', 'publicada');

-- Texto de las opciones
INSERT INTO soyucab.opcion_texto (tipo_encuesta, titulo_encuesta, numero_opcion, texto_opcion) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 1, 'Muy satisfecho - Todo funciona excelente'),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'Satisfecho - Buen servicio en general'),
('Campus', 'Satisfacción con Servicios UCAB', 3, 'Neutral - Ni bueno ni malo'),
('Campus', 'Satisfacción con Servicios UCAB', 4, 'Insatisfecho - Necesita mejoras'),
('Campus', 'Satisfacción con Servicios UCAB', 5, 'Muy insatisfecho - Requiere cambios urgentes');

-- Votos de ejemplo
INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, completada) VALUES
('Campus', 'Satisfacción con Servicios UCAB', 2, 'zendaya@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 2, 'cillian.murphy@gmail.com', TRUE),
('Campus', 'Satisfacción con Servicios UCAB', 1, 'scarlett.j@gmail.com', TRUE);

-- ============================================================================
-- 5. CORRECCIÓN DE PROMEDIOS (Cumpliendo CHECK >= 0 AND <= 20)
-- ============================================================================
UPDATE soyucab.estudiante 
SET promedio = 18.75 
WHERE email_estudiante = 'zendaya@gmail.com';

-- ============================================================================
-- 6. EVENTO (Charla de Sostenibilidad con Leo DiCaprio)
-- ============================================================================

-- Primero crear la ubicación del evento
INSERT INTO soyucab.evento_ubicacion (id_ubicacion, nombre_lugar, direccion, capacidad_maxima, descripcion) VALUES
(gen_random_uuid(), 'Auditorio San Agustín', 'Edificio San Agustín, UCAB Montalbán', 300, 'Principal auditorio de la universidad para eventos académicos');

-- Obtener el UUID generado para usarlo en el evento
DO $$
DECLARE
    v_ubicacion_id UUID;
    v_evento_id UUID;
BEGIN
    -- Obtener el UUID de la ubicación recién creada
    SELECT id_ubicacion INTO v_ubicacion_id
    FROM soyucab.evento_ubicacion
    WHERE nombre_lugar = 'Auditorio San Agustín'
    LIMIT 1;

    -- Generar UUID para el evento
    v_evento_id := gen_random_uuid();

    -- Insertar el evento (solo columnas NOT NULL obligatorias)
    INSERT INTO soyucab.evento (
        ubicacion, 
        email_creador_evento, 
        fecha_hora_inicio, 
        tipo_evento,
        fecha_hora_fin,
        titulo, 
        descripcion, 
        categoria, 
        modalidad
    ) VALUES (
        v_evento_id,
        'cultura@ucab.edu.ve',
        '2026-02-10 15:00:00',
        'conferencia',
        '2026-02-10 17:00:00',
        'Sostenibilidad y Cine: Una Conversación con Leonardo DiCaprio',
        'Charla magistral sobre la importancia del activismo ambiental en la industria del entretenimiento. Incluye sesión de preguntas y respuestas.',
        'conferencia',
        'presencial'
    );

    -- Relacionar el evento con la Dependencia UCAB
    INSERT INTO soyucab.evento_dependencia (ubicacion, fecha_hora_inicio, nombre_institucional, rol_dependencia)
    VALUES (v_evento_id, '2026-02-10 15:00:00', 'Dirección de Cultura', 'organizador');

    -- Relacionar el evento con Organización Asociada
    INSERT INTO soyucab.evento_organizacion (ubicacion, fecha_hora_inicio, rif, rol_organizacion)
    VALUES (v_evento_id, '2026-02-10 15:00:00', 'J-30123456-7', 'patrocinador');

    -- Participantes del evento
    INSERT INTO soyucab.miembro_participa_evento (email_miembro, ubicacion, fecha_hora_inicio, estado_participacion, tipo_participacion, fecha_inscripcion, fecha_confirmacion)
    VALUES 
    ('zendaya@gmail.com', v_evento_id, '2026-02-10 15:00:00', 'confirmado', 'confirmado', '2026-01-14 12:00:00', '2026-01-14 13:00:00'),
    ('cillian.murphy@gmail.com', v_evento_id, '2026-02-10 15:00:00', 'inscrito', 'inscrito', '2026-01-14 14:30:00', NULL),
    ('scarlett.j@gmail.com', v_evento_id, '2026-02-10 15:00:00', 'inscrito', 'inscrito', '2026-01-14 15:00:00', NULL);
END $$;

-- ============================================================================
-- 7. RECONOCIMIENTOS A PROFESORES
-- ============================================================================
INSERT INTO soyucab.reconocimiento (tipo_reconocimiento, nombre_reconocimiento) VALUES
('premio', 'Premio Ambiental UCAB 2025'),
('mencion_honorifica', 'Docente Honorífico del Año');

-- 7.2 Asignar reconocimientos a Leo (profesor)
INSERT INTO soyucab.profesor_recibe_reconocimiento (
    email_profesor, 
    tipo_reconocimiento, 
    nombre_reconocimiento, 
    anio_reconocimiento
) VALUES
('leo.dicaprio@gmail.com', 'premio', 'Premio Ambiental UCAB 2025', 2025),
('leo.dicaprio@gmail.com', 'mencion_honorifica', 'Docente Honorífico del Año', 2025);

UPDATE soyucab.estudiante 
SET promedio = 18.75 
WHERE email_estudiante = 'zendaya@gmail.com'
  AND tipo_rol = 'Estudiante'
  AND fecha_inicio_rol = '2023-09-15';

UPDATE soyucab.miembro 
SET privacidad_perfil = 'publico'
WHERE email = 'zendaya@gmail.com';


INSERT INTO soyucab.profesor (email_persona, tipo_rol, fecha_inicio, fecha_ingreso, categoria, dedicacion)
VALUES ('leo.dicaprio@gmail.com', 'Profesor', '2024-01-10', '2024-01-10', 'Invitado', 'Medio Tiempo')
ON CONFLICT (email_persona, tipo_rol, fecha_inicio) DO NOTHING;

-- 7.1 Primero crear el catálogo de reconocimientos
INSERT INTO soyucab.reconocimiento (tipo_reconocimiento, nombre_reconocimiento) VALUES
('premio', 'Premio Ambiental UCAB 2025'),
('mencion_honorifica', 'Docente Honorífico del Año'),
('Mención', 'Mejor Profesor del Año - Humanidades')
ON CONFLICT (tipo_reconocimiento, nombre_reconocimiento) DO NOTHING;

-- 7.2 Asignar facultad a Leo (necesario para el reporte de menciones)
INSERT INTO soyucab.facultad (email_persona, tipo_rol, fecha_inicio, facultad_nombre)
VALUES ('leo.dicaprio@gmail.com', 'Profesor', '2024-01-10', 'Humanidades y Educación')
ON CONFLICT (email_persona, tipo_rol, fecha_inicio, facultad_nombre) DO NOTHING;

-- 7.3 Asignar reconocimientos a Leo (profesor)
INSERT INTO soyucab.profesor_recibe_reconocimiento (
    email_profesor, 
    tipo_reconocimiento, 
    nombre_reconocimiento, 
    anio_reconocimiento
) VALUES
('leo.dicaprio@gmail.com', 'premio', 'Premio Ambiental UCAB 2025', 2025),
('leo.dicaprio@gmail.com', 'mencion_honorifica', 'Docente Honorífico del Año', 2025),
('leo.dicaprio@gmail.com', 'Mención', 'Mejor Profesor del Año - Humanidades', 2025)
ON CONFLICT (email_profesor, tipo_reconocimiento, nombre_reconocimiento) DO NOTHING;
