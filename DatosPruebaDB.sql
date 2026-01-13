-- ============================================
-- 1. MIEMBROS Y PERSONAS (21 usuarios)
-- ============================================

-- Insertar 21 miembros (telefono como integer)
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
-- Estudiantes (1-8)
('juan.perez@gmail.com', '4121234567', 'Estudiante de Ingeniería Informática', 'activa', 'publico', 'juanp', 'pass123'),
('maria.gonzalez@gmail.com', '4149876543', 'Estudiante de Derecho', 'activa', 'publico', 'mariag', 'pass123'),
('carlos.lopez@gmail.com', '4165551234', 'Estudiante de Comunicación Social', 'activa', 'publico', 'carlosl', 'pass123'),
('ana.martinez@gmail.com', '4248889999', 'Estudiante de Administración', 'activa', 'solo conexiones', 'anam', 'pass123'),
('pedro.rodriguez@gmail.com', '4124445555', 'Estudiante de Psicología', 'activa', 'privado', 'pedror', 'pass123'),
('laura.garcia@gmail.com', '4146667777', 'Estudiante de Economía', 'activa', 'publico', 'laurag', 'pass123'),
('david.sanchez@gmail.com', '4161112222', 'Estudiante de Arquitectura', 'activa', 'solo conexiones', 'davids', 'pass123'),
('sofia.hernandez@gmail.com', '4243334444', 'Estudiante de Medicina', 'activa', 'publico', 'sofiah', 'pass123'),

-- Profesores (9-12)
('profesor.ramirez@ucab.edu.ve', '4127778888', 'Profesor de Matemáticas', 'activa', 'publico', 'profram', 'pass123'),
('profesora.lopez@ucab.edu.ve', '4142223333', 'Profesora de Derecho', 'activa', 'solo conexiones', 'proflop', 'pass123'),
('profesor.gomez@ucab.edu.ve', '4168889999', 'Profesor de Informática', 'activa', 'publico', 'profgom', 'pass123'),
('profesora.mendoza@ucab.edu.ve', '4245556666', 'Profesora de Comunicación', 'activa', 'publico', 'profmen', 'pass123'),

-- Egresados (13-15)
('egresado.torres@gmail.com', '4129990000', 'Ingeniero graduado 2020', 'activa', 'publico', 'egrtor', 'pass123'),
('egresada.castro@gmail.com', '4140001111', 'Abogada graduada 2019', 'activa', 'solo conexiones', 'egrcas', 'pass123'),
('egresado.rivera@gmail.com', '4161110000', 'Economista graduado 2021', 'activa', 'publico', 'egrriv', 'pass123'),

-- Personal Administrativo (16-17)
('admin.perez@ucab.edu.ve', '4123332222', 'Personal Administrativo', 'activa', 'publico', 'adminp', 'pass123'),
('admin.gonzalez@ucab.edu.ve', '4144443333', 'Coordinador Académico', 'activa', 'solo conexiones', 'adming', 'pass123'),

-- Personal Obrero (18-19)
('obrero.martinez@ucab.edu.ve', '4165554444', 'Personal de Mantenimiento', 'activa', 'publico', 'obremar', 'pass123'),
('obrero.rodriguez@ucab.edu.ve', '4246665555', 'Personal de Limpieza', 'activa', 'publico', 'obrero', 'pass123'),

-- Dependencia (20)
('dependencia.dac@ucab.edu.ve', '2125556666', 'Dirección de Asuntos Comunitarios', 'activa', 'publico', 'dacucab', 'pass123'),

-- Organización (21)
('techcorp@empresa.com', '2127778888', 'Empresa de tecnología asociada a UCAB', 'activa', 'publico', 'techcorp', 'pass123');

-- Insertar las personas correspondientes
INSERT INTO soyucab.persona (email_persona, ci, nombres, apellidos, sexo, fecha_nacimiento, ocupacion_actual, empresa_actual, influencer, tutor) VALUES
-- Estudiantes
('juan.perez@gmail.com', 'V12345678', 'Juan', 'Pérez', 'M', '2000-05-15', 'Estudiante', 'UCAB', false, false),
('maria.gonzalez@gmail.com', 'V23456789', 'María', 'González', 'F', '2001-03-22', 'Estudiante', 'UCAB', false, true),
('carlos.lopez@gmail.com', 'V34567890', 'Carlos', 'López', 'M', '1999-11-30', 'Estudiante', 'UCAB', false, false),
('ana.martinez@gmail.com', 'V45678901', 'Ana', 'Martínez', 'F', '2000-07-18', 'Estudiante', 'UCAB', false, false),
('pedro.rodriguez@gmail.com', 'V56789012', 'Pedro', 'Rodríguez', 'M', '2001-01-25', 'Estudiante', 'UCAB', false, false),
('laura.garcia@gmail.com', 'V67890123', 'Laura', 'García', 'F', '2000-09-12', 'Estudiante', 'UCAB', false, true),
('david.sanchez@gmail.com', 'V78901234', 'David', 'Sánchez', 'M', '1999-12-05', 'Estudiante', 'UCAB', false, false),
('sofia.hernandez@gmail.com', 'V89012345', 'Sofía', 'Hernández', 'F', '2000-08-20', 'Estudiante', 'UCAB', true, false),

-- Profesores
('profesor.ramirez@ucab.edu.ve', 'V90123456', 'Roberto', 'Ramírez', 'M', '1975-04-10', 'Profesor', 'UCAB', false, false),
('profesora.lopez@ucab.edu.ve', 'V01234567', 'Carmen', 'López', 'F', '1980-06-25', 'Profesora', 'UCAB', false, false),
('profesor.gomez@ucab.edu.ve', 'V11223344', 'Jorge', 'Gómez', 'M', '1972-09-15', 'Profesor', 'UCAB', true, false),
('profesora.mendoza@ucab.edu.ve', 'V22334455', 'Patricia', 'Mendoza', 'F', '1978-11-30', 'Profesora', 'UCAB', false, false),

-- Egresados
('egresado.torres@gmail.com', 'V33445566', 'Luis', 'Torres', 'M', '1996-02-14', 'Ingeniero de Software', 'TechCorp', false, false),
('egresada.castro@gmail.com', 'V44556677', 'Gabriela', 'Castro', 'F', '1995-08-08', 'Abogada', 'Bufete Legal', false, false),
('egresado.rivera@gmail.com', 'V55667788', 'Andrés', 'Rivera', 'M', '1997-05-20', 'Analista Financiero', 'Banco Nacional', false, false),

-- Personal Administrativo
('admin.perez@ucab.edu.ve', 'V66778899', 'Miguel', 'Pérez', 'M', '1985-03-15', 'Administrador', 'UCAB', false, false),
('admin.gonzalez@ucab.edu.ve', 'V77889900', 'Isabel', 'González', 'F', '1979-07-22', 'Coordinadora', 'UCAB', false, false),

-- Personal Obrero
('obrero.martinez@ucab.edu.ve', 'V88990011', 'José', 'Martínez', 'M', '1970-12-10', 'Mantenimiento', 'UCAB', false, false),
('obrero.rodriguez@ucab.edu.ve', 'V99001122', 'Ramón', 'Rodríguez', 'M', '1968-09-05', 'Limpieza', 'UCAB', false, false),

-- Dependencia (CI especial para jurídico)
('dependencia.dac@ucab.edu.ve', 'J12345678', 'Dirección', 'Asuntos Comunitarios', 'M', '2000-01-01', 'Dependencia UCAB', 'UCAB', false, false),

-- Organización (CI especial para jurídico)
('techcorp@empresa.com', 'J87654321', 'TechCorp', 'Solutions', 'M', '2005-01-01', 'Empresa Tecnológica', 'TechCorp', false, false);

-- ============================================
-- 2. ROLES INSTITUCIONALES (CORREGIDO - solo roles básicos)
-- ============================================

INSERT INTO soyucab.rolInstitucional (email_persona, tipo_rol, fecha_inicio, estatus, fecha_finalizacion) VALUES
-- Estudiantes (ACTIVOS)
('juan.perez@gmail.com', 'Estudiante', '2020-09-01', 'Activo', NULL),
('maria.gonzalez@gmail.com', 'Estudiante', '2020-09-01', 'Activo', NULL),
('carlos.lopez@gmail.com', 'Estudiante', '2019-09-01', 'Activo', NULL),
('ana.martinez@gmail.com', 'Estudiante', '2021-09-01', 'Activo', NULL),
('pedro.rodriguez@gmail.com', 'Estudiante', '2020-09-01', 'Activo', NULL),
('laura.garcia@gmail.com', 'Estudiante', '2021-09-01', 'Activo', NULL),
('david.sanchez@gmail.com', 'Estudiante', '2019-09-01', 'Activo', NULL),
('sofia.hernandez@gmail.com', 'Estudiante', '2020-09-01', 'Activo', NULL),

-- Profesores
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Activo', NULL),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', 'Activo', NULL),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', 'Activo', NULL),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', 'Activo', NULL),

-- Egresados (solo rol Egresado)
('egresado.torres@gmail.com', 'Egresado', '2020-07-15', 'Graduado', NULL),
('egresada.castro@gmail.com', 'Egresado', '2019-07-15', 'Graduado', NULL),
('egresado.rivera@gmail.com', 'Egresado', '2021-07-15', 'Graduado', NULL),

-- Personal Administrativo
('admin.perez@ucab.edu.ve', 'Personal Administrativo', '2018-05-01', 'Activo', NULL),
('admin.gonzalez@ucab.edu.ve', 'Personal Administrativo', '2014-02-15', 'Activo', NULL),

-- Personal Obrero
('obrero.martinez@ucab.edu.ve', 'Personal Obrero', '2010-06-01', 'Activo', NULL),
('obrero.rodriguez@ucab.edu.ve', 'Personal Obrero', '2005-03-10', 'Activo', NULL);

-- ============================================
-- 3. ESTUDIANTES (detalles - CON FECHA_INICIO_ROL)
-- ============================================

INSERT INTO soyucab.estudiante (email_estudiante, fecha_inicio_rol, tipo_rol, ci_estudiante, semestre, carrera_programa, facultad, promedio, email_dominio_estudiante) VALUES
('juan.perez@gmail.com', '2020-09-01', 'Estudiante', 'V12345678', 8, 'Ingeniería Informática', 'Ingeniería', 16.50, 'jperez@est.ucab.edu.ve'),
('maria.gonzalez@gmail.com', '2020-09-01', 'Estudiante', 'V23456789', 7, 'Derecho', 'Ciencias Jurídicas', 17.20, 'mgonzalez@est.ucab.edu.ve'),
('carlos.lopez@gmail.com', '2019-09-01', 'Estudiante', 'V34567890', 9, 'Comunicación Social', 'Humanidades', 15.80, 'clopez@est.ucab.edu.ve'),
('ana.martinez@gmail.com', '2021-09-01', 'Estudiante', 'V45678901', 4, 'Administración', 'Ciencias Económicas', 18.00, 'amartinez@est.ucab.edu.ve'),
('pedro.rodriguez@gmail.com', '2020-09-01', 'Estudiante', 'V56789012', 6, 'Psicología', 'Humanidades', 16.90, 'prodriguez@est.ucab.edu.ve'),
('laura.garcia@gmail.com', '2021-09-01', 'Estudiante', 'V67890123', 5, 'Economía', 'Ciencias Económicas', 17.50, 'lgarcia@est.ucab.edu.ve'),
('david.sanchez@gmail.com', '2019-09-01', 'Estudiante', 'V78901234', 10, 'Arquitectura', 'Arquitectura', 16.20, 'dsanchez@est.ucab.edu.ve'),
('sofia.hernandez@gmail.com', '2020-09-01', 'Estudiante', 'V89012345', 8, 'Medicina', 'Ciencias Salud', 18.50, 'shernandez@est.ucab.edu.ve');

-- ============================================
-- 4. EGRESADOS (detalles - CON FECHA_INICIO_ROL y tipo_rol)
-- ============================================

INSERT INTO soyucab.egresado (email_egresado, fecha_inicio_rol, tipo_rol, ci_egresado, facultad, fecha_acto_grado, pais, estado) VALUES
('egresado.torres@gmail.com', '2020-07-15', 'Egresado', 'V33445566', 'Ingeniería', '2020-07-15', 'VE', 'Capital'),
('egresada.castro@gmail.com', '2019-07-15', 'Egresado', 'V44556677', 'Ciencias Jurídicas', '2019-07-15', 'VE', 'Miranda'),
('egresado.rivera@gmail.com', '2021-07-15', 'Egresado', 'V55667788', 'Ciencias Económicas', '2021-07-15', 'VE', 'Carabobo');


-- Títulos obtenidos (CORREGIDO: tabla titulo_obtenido usa ci_persona)
INSERT INTO soyucab.titulo_obtenido (email_persona, ci_persona, nombre_titulo) VALUES
('egresado.torres@gmail.com', 'V33445566', 'Ingeniero Informática'),
('egresada.castro@gmail.com', 'V44556677', 'Abogado'),
('egresado.rivera@gmail.com', 'V55667788', 'Lic. Economía');



-- ============================================
-- 5. PROFESORES (detalles - CORREGIDO con tipo_rol)
-- ============================================

INSERT INTO soyucab.profesor (email_persona, tipo_rol, fecha_inicio, fecha_ingreso, categoria, dedicacion) VALUES
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', '2010-01-15', 'Asistente', 'Tiempo Completo'),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', '2015-03-01', 'Agregado', 'Medio Tiempo'),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', '2008-08-20', 'Asociado', 'Tiempo Completo'),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', '2012-09-10', 'Titular', 'Tiempo Completo');

-- Facultades
INSERT INTO soyucab.facultad (email_persona, tipo_rol, fecha_inicio, facultad_nombre) VALUES
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Ingeniería'),
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Ciencias Básicas'),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', 'Ciencias Jurídicas'),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', 'Ingeniería'),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', 'Humanidades');

-- Materias
INSERT INTO soyucab.materias_impartidas (email_persona, tipo_rol, fecha_inicio, materia_nombre) VALUES
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Cálculo I'),
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Álgebra Lineal'),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', 'Derecho Civil'),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', 'Derecho Penal'),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', 'Programación I'),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', 'Bases de Datos'),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', 'Comunicación Oral'),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', 'Periodismo Digital');

-- ============================================
-- 6. PERSONAL ADMINISTRATIVO Y OBRERO (CORREGIDO con tipo_rol)
-- ============================================

INSERT INTO soyucab.personal_administrativo (email_persona, tipo_rol, fecha_inicio, cargo, ubicacion_de_trabajo, dedicacion) VALUES
('admin.perez@ucab.edu.ve', 'Personal Administrativo', '2018-05-01', 'Administrador Sistemas', 'Edificio Rectoría', 'Tiempo Completo'),
('admin.gonzalez@ucab.edu.ve', 'Personal Administrativo', '2014-02-15', 'Coordinadora Académica', 'Facultad Ingeniería', 'Tiempo Completo');

INSERT INTO soyucab.personal_obrero (email_persona, tipo_rol, fecha_inicio, cargo, dedicacion, empresa_a_la_que_pertenece) VALUES
('obrero.martinez@ucab.edu.ve', 'Personal Obrero', '2010-06-01', 'Técnico Mantenimiento', 'Tiempo Completo', 'UCAB'),
('obrero.rodriguez@ucab.edu.ve', 'Personal Obrero', '2005-03-10', 'Auxiliar Limpieza', 'Tiempo Completo', 'UCAB');

-- ============================================
-- 7. GRUPOS (CON PRIVACIDAD)
-- ============================================

INSERT INTO soyucab.grupo (nombre, descripcion, fecha_creacion, cantidad_miembros, requisitos_ingreso, estado, categoria, email, privacidad) VALUES
('Programadores UCAB', 'Grupo para estudiantes de programación', '2023-01-15', 3, 'Ser estudiante UCAB', 'activo', 'academico', 'juan.perez@gmail.com', 'publico'),
('Club de Debate', 'Grupo de debate estudiantil', '2022-09-10', 2, 'Interés en debate', 'activo', 'cultural', 'maria.gonzalez@gmail.com', 'publico'),
('Fútbol Universitario', 'Equipo de fútbol UCAB', '2023-03-01', 2, 'Asistir entrenamientos', 'activo', 'deportivo', 'carlos.lopez@gmail.com', 'publico'),
('Investigación Científica', 'Grupo de investigación', '2022-11-20', 2, 'Tener proyectos investigación', 'activo', 'profesional', 'profesor.gomez@ucab.edu.ve', 'privado'),
('Egresados UCAB 2020', 'Grupo de egresados', '2020-08-01', 2, 'Ser egresado UCAB 2020', 'activo', 'social', 'egresado.torres@gmail.com', 'secreto');

INSERT INTO soyucab.pertenece_a_grupo (email_miembro, nombre_grupo, rol_grupo, estado_participante) VALUES
-- Programadores UCAB
('juan.perez@gmail.com', 'Programadores UCAB', 'administrador', 'activo'),
('profesor.gomez@ucab.edu.ve', 'Programadores UCAB', 'moderador', 'activo'),
('maria.gonzalez@gmail.com', 'Programadores UCAB', 'miembro', 'activo'),

-- Club de Debate
('maria.gonzalez@gmail.com', 'Club de Debate', 'administrador', 'activo'),
('profesora.lopez@ucab.edu.ve', 'Club de Debate', 'moderador', 'activo'),

-- Fútbol Universitario
('carlos.lopez@gmail.com', 'Fútbol Universitario', 'administrador', 'activo'),
('pedro.rodriguez@gmail.com', 'Fútbol Universitario', 'miembro', 'activo'),

-- Investigación Científica
('profesor.gomez@ucab.edu.ve', 'Investigación Científica', 'administrador', 'activo'),
('profesor.ramirez@ucab.edu.ve', 'Investigación Científica', 'moderador', 'activo'),

-- Egresados UCAB 2020
('egresado.torres@gmail.com', 'Egresados UCAB 2020', 'administrador', 'activo'),
('egresada.castro@gmail.com', 'Egresados UCAB 2020', 'moderador', 'activo');

-- ============================================
-- 8. PUBLICACIONES Y ME GUSTA (CORREGIDO)
-- ============================================

INSERT INTO soyucab.publicacion (fecha_publicacion, caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, imagen, video, email_publicador, nombre_grupo_publicado) VALUES
('2024-01-15 10:30:00', 'Mi primer proyecto en Python!', 'texto', 'Comparto mi primer proyecto usando Django', 'publico', 'proyecto_python.jpg', NULL, 'juan.perez@gmail.com', 'Programadores UCAB'),
('2024-01-16 14:20:00', 'Ganamos el debate regional!', 'imagen', 'Foto del equipo después de ganar', 'publico', 'debate_ganador.jpg', NULL, 'maria.gonzalez@gmail.com', 'Club de Debate'),
('2024-01-17 16:45:00', 'Nuevas técnicas de investigación', 'texto', 'Comparto métodos para investigación científica', 'publico', NULL, NULL, 'profesor.gomez@ucab.edu.ve', 'Investigación Científica'),
('2024-01-18 09:15:00', 'Golazo en el último partido!', 'video', 'Video del gol de la victoria', 'publico', NULL, 'gol_victoria.mp4', 'carlos.lopez@gmail.com', 'Fútbol Universitario'),
('2024-01-19 11:00:00', 'Reunión de egresados', 'texto', 'Invitación a reunión anual', 'solo_relaciones', NULL, NULL, 'egresado.torres@gmail.com', 'Egresados UCAB 2020');

INSERT INTO soyucab.me_gusta (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('carlos.lopez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00'),
('ana.martinez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00');

-- ============================================
-- 9. COMENTARIOS (CORREGIDO: fecha_creacion es PK, no fecha_creacion_publicacion)
-- ============================================

INSERT INTO soyucab.comentario (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, fecha_creacion, contenido, estado_comentario) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00', '2024-01-15 10:35:00', 'Excelente proyecto Juan! Muy bien estructurado.', 'visible'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:30:00', '2024-01-15 10:40:00', 'Buen uso de patrones MVC. Continúa así.', 'visible'),
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00', '2024-01-16 14:25:00', 'Felicidades equipo! Gran trabajo.', 'visible');
-- ============================================
-- 10. RELACIONES Y SEGUIMIENTOS (CORREGIDO)
-- ============================================

-- Seguimientos básicos
INSERT INTO soyucab.seguimiento (email_seguidor, email_seguido, fecha_inicio) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00'),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00'),
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2023-08-20 09:00:00'),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve', '2023-11-05 16:00:00');

-- Relaciones (para mensajería)
INSERT INTO soyucab.relacion (usuario_origen, usuario_destino, fecha_solicitud, fecha_establecimiento, seguimiento, estado, es_simetrica, permite_mensajeria) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00', '2023-09-01 10:05:00', true, 'aceptada', true, true),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00', '2023-10-15 14:35:00', true, 'aceptada', false, true),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve', '2023-11-20 09:15:00', '2023-11-20 09:20:00', true, 'aceptada', false, true),
-- Relaciones con dependencia/organización (solo seguimiento)
('juan.perez@gmail.com', 'dependencia.dac@ucab.edu.ve', '2024-01-01 08:00:00', '2024-01-01 08:00:00', true, 'aceptada', false, false),
('maria.gonzalez@gmail.com', 'techcorp@empresa.com', '2024-01-02 09:00:00', '2024-01-02 09:00:00', true, 'aceptada', false, false);

INSERT INTO soyucab.tipo_de_relacion (usuario_origen, usuario_destino, fecha_solicitud, tipo) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00', 'compañeros'),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00', 'estudiante-profesor'),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve', '2023-11-20 09:15:00', 'estudiante-profesor');
-- ============================================
-- 11. EVENTOS (CORREGIDO)
-- ============================================

INSERT INTO soyucab.evento (ubicacion, email_creador_evento, fecha_hora_inicio, tipo_evento, fecha_hora_fin, titulo, descripcion, categoria, modalidad, enlace_virtual, aforo_maximo, costo_inscripcion, instrucciones, estado_evento, visibilidad) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'profesor.gomez@ucab.edu.ve', '2024-02-15 09:00:00', 'Taller de Programación', '2024-02-15 13:00:00', 'Taller de Python Avanzado', 'Taller práctico de Python para estudiantes avanzados', 'taller', 'presencial', NULL, 30, 0.00, 'Traer laptop con Python instalado', 'publicado', true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'profesora.lopez@ucab.edu.ve', '2024-03-10 14:00:00', 'Conferencia de Derecho', '2024-03-10 18:00:00', 'Actualización Legal 2024', 'Conferencia sobre nuevas leyes y reformas', 'conferencia', 'hibrido', 'https://meet.ucab.edu.ve/derecho2024', 100, 50.00, 'Registro previo obligatorio', 'publicado', true),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'dependencia.dac@ucab.edu.ve', '2024-02-20 10:00:00', 'Voluntariado', '2024-02-20 16:00:00', 'Día de Servicio Comunitario', 'Actividad de voluntariado en comunidades locales', 'cultural', 'presencial', NULL, 50, 0.00, 'Ropa cómoda y botella de agua', 'publicado', true);

INSERT INTO soyucab.miembro_participa_evento (ubicacion, fecha_hora_inicio, email_miembro, estado_participacion) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-02-15 09:00:00', 'juan.perez@gmail.com', 'confirmado'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-02-15 09:00:00', 'maria.gonzalez@gmail.com', 'confirmado'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2024-03-10 14:00:00', 'maria.gonzalez@gmail.com', 'confirmado'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2024-03-10 14:00:00', 'egresada.castro@gmail.com', 'confirmado'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2024-02-20 10:00:00', 'juan.perez@gmail.com', 'confirmado'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2024-02-20 10:00:00', 'maria.gonzalez@gmail.com', 'pendiente');

-- ============================================
-- 12. CONVERSACIONES Y MENSAJES (CORREGIDO)
-- ============================================

INSERT INTO soyucab.conversacion (ci_iniciador, fecha_inicio, titulo, tipo_conversacion, ultimo_mensaje, fecha_ultimo_mensaje, estado_conversacion) VALUES
('V12345678', '2024-01-10 08:30:00', 'Consulta sobre proyecto', 'individual', 'Gracias por la ayuda!', '2024-01-10 09:15:00', 'activa'),
('V23456789', '2024-01-11 14:00:00', 'Grupo estudio Derecho', 'grupal', 'Nos vemos mañana', '2024-01-11 18:30:00', 'activa');

INSERT INTO soyucab.participante_conversacion (ci_iniciador, fecha_inicio, ci_participante) VALUES
-- Conversación individual
('V12345678', '2024-01-10 08:30:00', 'V12345678'), -- Juan
('V12345678', '2024-01-10 08:30:00', 'V11223344'), -- Profesor Gómez

-- Conversación grupal
('V23456789', '2024-01-11 14:00:00', 'V23456789'), -- María
('V23456789', '2024-01-11 14:00:00', 'V01234567'), -- Profesora López
('V23456789', '2024-01-11 14:00:00', 'V45678901'); -- Ana

INSERT INTO soyucab.mensaje (ci_creador_conversacion, fecha_creacion_conversacion, ci_remitente, fecha_envio, contenido, tipo_mensaje, estado_mensaje) VALUES
('V12345678', '2024-01-10 08:30:00', 'V12345678', '2024-01-10 08:30:00', 'Hola profesor, tengo una duda sobre el proyecto', 'texto', 'leido'),
('V12345678', '2024-01-10 08:30:00', 'V11223344', '2024-01-10 08:45:00', 'Claro Juan, ¿en qué puedo ayudarte?', 'texto', 'leido'),
('V12345678', '2024-01-10 08:30:00', 'V12345678', '2024-01-10 09:00:00', 'Sobre la estructura de la base de datos', 'texto', 'leido'),
('V12345678', '2024-01-10 08:30:00', 'V11223344', '2024-01-10 09:15:00', 'Te recomiendo revisar los patrones de diseño', 'texto', 'leido');

-- ============================================
-- 13. DEPENDENCIAS (CORREGIDO - email es FK a miembro)
-- ============================================

INSERT INTO soyucab.dependencia_ucab (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, responsable, ubicacion_fisica, edificio) VALUES
('Dirección de Asuntos Comunitarios', 'dependencia.dac@ucab.edu.ve', 'La DAC promueve responsabilidad social y voluntariado en la UCAB con programas de extensión comunitaria.', 'dac_logo.png', 'https://www.ucab.edu.ve/dac', '2010-05-20', 'activa', 'Dr. Carlos Mendoza', 'Campus Montalbán, Edificio de Postgrado', 'Edificio Rectoría');

INSERT INTO soyucab.tipo_dependencia (nombre_tipo, descripcion) VALUES
('Académica', 'Dependencias para actividades académicas y de investigación'),
('Administrativa', 'Dependencias para gestión administrativa universitaria'),
('Estudiantil', 'Dependencias para atención y servicios estudiantiles');

INSERT INTO soyucab.es_tipo (codigo_institucional, nombre_tipo) VALUES
('Dirección de Asuntos Comunitarios', 'Estudiantil'),
('Dirección de Asuntos Comunitarios', 'Administrativa');

-- ============================================
-- 14. ORGANIZACIONES (CORREGIDO - email es FK a miembro)
-- ============================================

INSERT INTO soyucab.organizacion_asociada (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion) VALUES
('J87654321', 'techcorp@empresa.com', 'TechCorp Solutions', 'techcorp_logo.png', 'https://www.techcorp.com', 'Empresa de tecnología especializada en desarrollo de software con más de 15 años de experiencia en el mercado.', '["pasantías", "contratación", "proyectos conjuntos", "capacitaciones"]');

INSERT INTO soyucab.tipo_organizacion (nombre_tipo, descripcion) VALUES
('Tecnológica', 'Empresas del sector tecnológico y de software'),
('Consultoría', 'Empresas de consultoría y servicios profesionales');

INSERT INTO soyucab.es_tipo_organizacion (rif, nombre_tipo) VALUES
('J87654321', 'Tecnológica'),
('J87654321', 'Consultoría');

-- ============================================
-- 15. ANUNCIOS (CORREGIDOS - creador_email es FK a miembro)
-- ============================================

INSERT INTO soyucab.anuncio (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Voluntariado Comunitario Febrero 2024', 'Se buscan voluntarios para el programa de alfabetización digital en comunidades aledañas. Requisitos: tener disponibilidad los sábados y manejo básico de computadoras.', 'informativo', 'alta', '2024-01-20 09:00:00', '2024-02-20 23:59:59', 'dependencia'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Oportunidades de Pasantía TechCorp 2024', 'TechCorp ofrece pasantías en desarrollo de software para estudiantes de últimos semestres. Excelente ambiente laboral y posibilidad de contratación.', 'laboral', 'media', '2024-01-21 10:30:00', '2024-03-21 23:59:59', 'organizacion');

INSERT INTO soyucab.destinatarios (fecha_creacion, creador_email, valor) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Estudiantes'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Profesores'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Egresados'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Estudiantes Ingeniería'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Egresados');

INSERT INTO soyucab.etiquetas (fecha_creacion, creador_email, valor) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'voluntariado'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'comunidad'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'servicio social'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'empleo'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'tecnología'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'pasantías');

-- ============================================
-- 16. NOTIFICACIONES
-- ============================================

INSERT INTO soyucab.notificacion (email_destino, email_envia, fecha_hora, titulo, contenido, tipo_notificacion, estado, prioridad) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2023-09-01 10:01:00', 'Solicitud de conexión', 'Juan Pérez te ha enviado una solicitud de conexión', 'relacion', 'leida', 'media'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2023-10-15 14:31:00', 'Solicitud de conexión', 'Juan Pérez te ha enviado una solicitud de conexión', 'relacion', 'leida', 'media');

INSERT INTO soyucab.notif_generada_por_publicacion (email_destino_notif, email_envia_notif, fecha_hora_notif, email_publicador_pub, fecha_publicacion_pub) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:25:00', 'juan.perez@gmail.com', '2024-01-15 10:30:00');

-- Provoca
INSERT INTO soyucab.provoca (fecha_creacion, creador_email, email_destino, fecha_hora) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-20 09:05:00'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'maria.gonzalez@gmail.com', '2024-01-21 10:35:00');

-- Relacion_envia
INSERT INTO soyucab.relacion_envia (usuario_origen, usuario_destino, fecha_solicitud, email_destino, fecha_hora) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00', 'maria.gonzalez@gmail.com', '2023-09-01 10:01:00'),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:31:00');
-- ============================================
-- 17. ENCUESTAS (CORREGIDAS)
-- ============================================

INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_creacion, fecha_fin, estado_encuesta, instrucciones, anonimato) VALUES
('Satisfacción estudiantil', 'dependencia.dac@ucab.edu.ve', 'Evaluación de Servicios Estudiantiles 2024', 'Encuesta para evaluar los servicios estudiantiles ofrecidos por la UCAB durante el año 2024.', 'dependencia', '2024-01-15 08:00:00', '2024-02-15 23:59:59', 'en_curso', 'Responda con honestidad todas las preguntas. Sus respuestas son anónimas.', true),
('Preferencias laborales', 'techcorp@empresa.com', 'Intereses Profesionales de Egresados UCAB', 'Encuesta para conocer los intereses profesionales y expectativas laborales de egresados UCAB.', 'organizacion', '2024-01-18 10:00:00', '2024-02-18 23:59:59', 'publicada', 'Seleccione las opciones que más se apliquen a su situación actual.', true);

INSERT INTO soyucab.audiencia (tipo_encuesta, titulo, valor) VALUES
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 'Estudiantes'),
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 'Profesores'),
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 'Personal Administrativo'),
('Preferencias laborales', 'Intereses Profesionales de Egresados UCAB', 'Egresados'),
('Preferencias laborales', 'Intereses Profesionales de Egresados UCAB', 'Estudiantes últimos semestres');

INSERT INTO soyucab.requisitos_participacion (tipo_encuesta, titulo, valor) VALUES
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 'Ser miembro activo de la UCAB'),
('Preferencias laborales', 'Intereses Profesionales de Egresados UCAB', 'Tener al menos 1 año de experiencia laboral');

INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, fecha_participacion, completada) VALUES
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 1, 'juan.perez@gmail.com', '2024-01-16 10:00:00', true),
('Satisfacción estudiantil', 'Evaluación de Servicios Estudiantiles 2024', 2, 'maria.gonzalez@gmail.com', '2024-01-16 11:30:00', true),
('Preferencias laborales', 'Intereses Profesionales de Egresados UCAB', 1, 'egresado.torres@gmail.com', NULL, false),
('Preferencias laborales', 'Intereses Profesionales de Egresados UCAB', 2, 'egresada.castro@gmail.com', '2024-01-19 09:00:00', true);

-- ============================================
-- 18. TUTORES (GERHARD)
-- ============================================

INSERT INTO soyucab.tutorias_materia (email_tutor, materia_nombre) VALUES
('maria.gonzalez@gmail.com', 'Derecho Civil I'),
('maria.gonzalez@gmail.com', 'Introducción al Derecho'),
('laura.garcia@gmail.com', 'Microeconomía'),
('laura.garcia@gmail.com', 'Estadística I');

INSERT INTO soyucab.tutorias_estudiante (email_tutor, email_estudiante) VALUES
('maria.gonzalez@gmail.com', 'ana.martinez@gmail.com'),
('maria.gonzalez@gmail.com', 'pedro.rodriguez@gmail.com'),
('laura.garcia@gmail.com', 'juan.perez@gmail.com');

-- ============================================
-- 19. RECONOCIMIENTOS (GERHARD)
-- ============================================

INSERT INTO soyucab.reconocimiento (tipo_reconocimiento, nombre_reconocimiento) VALUES
('Mención', 'Profesor del Año'),
('Mención', 'Excelencia en Investigación'),
('Premio', 'Innovación Educativa'),
('Distinción', 'Trayectoria Académica');

INSERT INTO soyucab.profesor_recibe_reconocimiento (email_profesor, tipo_reconocimiento, nombre_reconocimiento, anio_reconocimiento) VALUES
('profesor.gomez@ucab.edu.ve', 'Mención', 'Profesor del Año', 2022),
('profesor.gomez@ucab.edu.ve', 'Mención', 'Excelencia en Investigación', 2023),
('profesora.lopez@ucab.edu.ve', 'Mención', 'Profesor del Año', 2021),
('profesor.ramirez@ucab.edu.ve', 'Distinción', 'Trayectoria Académica', 2020);

-- ============================================
-- 20. PORTAFOLIOS
-- ============================================

-- Crear portafolio para Juan Pérez
DO $$
DECLARE
    mensaje VARCHAR(500);
BEGIN
    CALL soyucab.crear_portafolio_completo(
        mensaje,
        'V12345678',  -- CI de Juan
        'Portafolio Juan Pérez',
        'Publico',
        '[{"nombre": "Sistema de Gestión Académica", "descripcion": "Desarrollo full-stack con Django y React", "año": 2023}]',
        '[{"titulo": "Optimización de Algoritmos", "revista": "Revista de Informática", "año": 2022}]',
        '[{"nombre": "AWS Certified Developer", "institucion": "Amazon", "año": 2023}]',
        '[{"empresa": "TechCorp", "cargo": "Desarrollador Jr", "periodo": "2022-2023"}]',
        '[{"nombre": "Python", "nivel": "Avanzado"}, {"nombre": "JavaScript", "nivel": "Intermedio"}]',
        '[{"nombre": "Hackathon UCAB 2023", "descripcion": "Primer lugar en desarrollo de apps educativas"}]'
    );
    RAISE NOTICE '%', mensaje;
END $$;

-- ============================================
-- 21. SOLICITUDES UNIRSE A GRUPO
-- ============================================

INSERT INTO soyucab.solicitud_unirse_grupo (nombre_grupo, email_miembro, estado, fecha_solicitud) VALUES
('Programadores UCAB', 'ana.martinez@gmail.com', 'pendiente', '2024-01-25 10:00:00'),
('Club de Debate', 'juan.perez@gmail.com', 'pendiente', '2024-01-25 11:00:00'),
('Fútbol Universitario', 'maria.gonzalez@gmail.com', 'aceptada', '2024-01-24 09:00:00');

-- ============================================
-- 22. envia_una (CORREGIDO)
-- ============================================

INSERT INTO soyucab.envia_una (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, fecha_creacion_comentario, email_destino, fecha_envio) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00', '2024-01-15 10:35:00', 'juan.perez@gmail.com', '2024-01-15 10:36:00'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:30:00', '2024-01-15 10:40:00', 'juan.perez@gmail.com', '2024-01-15 10:41:00');
-- ============================================
-- 23. ROLES ACTIVOS (se llenará automáticamente con trigger)
-- ============================================
-- Los triggers actualizarán automáticamente esta tabla basándose en rolInstitucional

