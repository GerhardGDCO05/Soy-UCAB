-- ============================================
-- 1. MIEMBROS Y PERSONAS (20 usuarios)
-- ============================================

-- Insertar 20 miembros
INSERT INTO soyucab.miembro (email, telefono, biografia, estado_cuenta, privacidad_perfil, nombre_usuario, contraseña) VALUES
-- Estudiantes (1-8)
('juan.perez@gmail.com', 4121234567, 'Estudiante de Ingeniería Informática', 'activa', 'publico', 'juanp', 'pass123'),
('maria.gonzalez@gmail.com', 4149876543, 'Estudiante de Derecho', 'activa', 'publico', 'mariag', 'pass123'),
('carlos.lopez@gmail.com', 4165551234, 'Estudiante de Comunicación Social', 'activa', 'publico', 'carlosl', 'pass123'),
('ana.martinez@gmail.com', 4248889999, 'Estudiante de Administración', 'activa', 'solo conexiones', 'anam', 'pass123'),
('pedro.rodriguez@gmail.com', 4124445555, 'Estudiante de Psicología', 'activa', 'privado', 'pedror', 'pass123'),
('laura.garcia@gmail.com', 4146667777, 'Estudiante de Economía', 'activa', 'publico', 'laurag', 'pass123'),
('david.sanchez@gmail.com', 4161112222, 'Estudiante de Arquitectura', 'activa', 'solo conexiones', 'davids', 'pass123'),
('sofia.hernandez@gmail.com', 4243334444, 'Estudiante de Medicina', 'activa', 'publico', 'sofiah', 'pass123'),

-- Profesores (9-12)
('profesor.ramirez@ucab.edu.ve', 4127778888, 'Profesor de Matemáticas', 'activa', 'publico', 'profram', 'pass123'),
('profesora.lopez@ucab.edu.ve', 4142223333, 'Profesora de Derecho', 'activa', 'solo conexiones', 'proflop', 'pass123'),
('profesor.gomez@ucab.edu.ve', 4168889999, 'Profesor de Informática', 'activa', 'publico', 'profgom', 'pass123'),
('profesora.mendoza@ucab.edu.ve', 4245556666, 'Profesora de Comunicación', 'activa', 'publico', 'profmen', 'pass123'),

-- Egresados (13-15)
('egresado.torres@gmail.com', 4129990000, 'Ingeniero graduado 2020', 'activa', 'publico', 'egrtor', 'pass123'),
('egresada.castro@gmail.com', 4140001111, 'Abogada graduada 2019', 'activa', 'solo conexiones', 'egrcas', 'pass123'),
('egresado.rivera@gmail.com', 4161110000, 'Economista graduado 2021', 'activa', 'publico', 'egrriv', 'pass123'),

-- Personal Administrativo (16-17)
('admin.perez@ucab.edu.ve', 4123332222, 'Personal Administrativo', 'activa', 'publico', 'adminp', 'pass123'),
('admin.gonzalez@ucab.edu.ve', 4144443333, 'Coordinador Académico', 'activa', 'solo conexiones', 'adming', 'pass123'),

-- Personal Obrero (18-19)
('obrero.martinez@ucab.edu.ve', 4165554444, 'Personal de Mantenimiento', 'activa', 'publico', 'obremar', 'pass123'),
('obrero.rodriguez@ucab.edu.ve', 4246665555, 'Personal de Limpieza', 'activa', 'publico', 'obrero', 'pass123'),

-- Dependencia (20)
('dependencia.dac@ucab.edu.ve', 2125556666, 'Dirección de Asuntos Comunitarios', 'activa', 'publico', 'dacucab', 'pass123'),

-- Organización (21 - adicional)
('techcorp@empresa.com', 2127778888, 'Empresa de tecnología asociada a UCAB', 'activa', 'publico', 'techcorp', 'pass123');

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

-- Dependencia
('dependencia.dac@ucab.edu.ve', 'J12345678', 'Dirección', 'Asuntos Comunitarios', 'M', '2000-01-01', 'Dependencia UCAB', 'UCAB', false, false),

-- Organización
('techcorp@empresa.com', 'J87654321', 'TechCorp', 'Solutions', 'M', '2005-01-01', 'Empresa Tecnológica', 'TechCorp', false, false);

-- ============================================
-- 2. ROLES INSTITUCIONALES
-- ============================================

INSERT INTO soyucab.rolInstitucional (email_persona, tipo_rol, fecha_inicio, estatus) VALUES
-- Estudiantes
('juan.perez@gmail.com', 'Estudiante', '2020-09-01', 'Activo'),
('maria.gonzalez@gmail.com', 'Estudiante', '2020-09-01', 'Activo'),
('carlos.lopez@gmail.com', 'Estudiante', '2019-09-01', 'Activo'),
('ana.martinez@gmail.com', 'Estudiante', '2021-09-01', 'Activo'),
('pedro.rodriguez@gmail.com', 'Estudiante', '2020-09-01', 'Activo'),
('laura.garcia@gmail.com', 'Estudiante', '2021-09-01', 'Activo'),
('david.sanchez@gmail.com', 'Estudiante', '2019-09-01', 'Activo'),
('sofia.hernandez@gmail.com', 'Estudiante', '2020-09-01', 'Activo'),

-- Profesores
('profesor.ramirez@ucab.edu.ve', 'Profesor', '2010-01-15', 'Activo'),
('profesora.lopez@ucab.edu.ve', 'Profesor', '2015-03-01', 'Activo'),
('profesor.gomez@ucab.edu.ve', 'Profesor', '2008-08-20', 'Activo'),
('profesora.mendoza@ucab.edu.ve', 'Profesor', '2012-09-10', 'Activo'),

-- Egresados (primero como estudiantes, luego como egresados)
('egresado.torres@gmail.com', 'Estudiante', '2016-09-01', 'Graduado'),
('egresado.torres@gmail.com', 'Egresado', '2020-07-15', 'Graduado'),
('egresada.castro@gmail.com', 'Estudiante', '2015-09-01', 'Graduado'),
('egresada.castro@gmail.com', 'Egresado', '2019-07-15', 'Graduado'),
('egresado.rivera@gmail.com', 'Estudiante', '2017-09-01', 'Graduado'),
('egresado.rivera@gmail.com', 'Egresado', '2021-07-15', 'Graduado'),

-- Personal Administrativo
('admin.perez@ucab.edu.ve', 'Personal Administrativo', '2018-05-01', 'Activo'),
('admin.gonzalez@ucab.edu.ve', 'Personal Administrativo', '2014-02-15', 'Activo'),

-- Personal Obrero
('obrero.martinez@ucab.edu.ve', 'Personal Obrero', '2010-06-01', 'Activo'),
('obrero.rodriguez@ucab.edu.ve', 'Personal Obrero', '2005-03-10', 'Activo');

-- ============================================
-- 3. ESTUDIANTES (detalles)
-- ============================================

INSERT INTO soyucab.estudiante (email_estudiante, email_dominio_estudiante, ci_estudiante, semestre, carrera_programa, facultad, promedio) VALUES
('juan.perez@gmail.com', 'jperez@est.ucab.edu.ve', 'V12345678', 8, 'Ingeniería Informática', 'Ingeniería', 16.50),
('maria.gonzalez@gmail.com', 'mgonzalez@est.ucab.edu.ve', 'V23456789', 7, 'Derecho', 'Ciencias Jurídicas', 17.20),
('carlos.lopez@gmail.com', 'clopez@est.ucab.edu.ve', 'V34567890', 9, 'Comunicación Social', 'Humanidades', 15.80),
('ana.martinez@gmail.com', 'amartinez@est.ucab.edu.ve', 'V45678901', 4, 'Administración', 'Ciencias Económicas', 18.00),
('pedro.rodriguez@gmail.com', 'prodriguez@est.ucab.edu.ve', 'V56789012', 6, 'Psicología', 'Humanidades', 16.90),
('laura.garcia@gmail.com', 'lgarcia@est.ucab.edu.ve', 'V67890123', 5, 'Economía', 'Ciencias Económicas', 17.50),
('david.sanchez@gmail.com', 'dsanchez@est.ucab.edu.ve', 'V78901234', 10, 'Arquitectura', 'Arquitectura', 16.20),
('sofia.hernandez@gmail.com', 'shernandez@est.ucab.edu.ve', 'V89012345', 8, 'Medicina', 'Ciencias Salud', 18.50);

-- ============================================
-- 4. EGRESADOS (detalles - CON ESTADOS CORREGIDOS)
-- ============================================

-- Egresados (con estados que caben en VARCHAR(15))
INSERT INTO soyucab.egresado (facultad, fecha_acto_grado, pais, estado, email_egresado, ci_egresado) VALUES
('Ingeniería', '2020-07-15', 'VE', 'Capital', 'egresado.torres@gmail.com', 'V33445566'),
('Ciencias Jurídicas', '2019-07-15', 'VE', 'Miranda', 'egresada.castro@gmail.com', 'V44556677'),
('Ciencias Económicas', '2021-07-15', 'VE', 'Carabobo', 'egresado.rivera@gmail.com', 'V55667788');

-- Títulos obtenidos
INSERT INTO soyucab.titulo_obtenido (email_egresado, ci_egresado, nombre_titulo) VALUES
('egresado.torres@gmail.com', 'V33445566', 'Ingeniero Informática'),
('egresada.castro@gmail.com', 'V44556677', 'Abogado'),
('egresado.rivera@gmail.com', 'V55667788', 'Lic. Economía');

-- Empresas (AHORA SÍ funcionará porque los egresados existen)
INSERT INTO soyucab.empresa (email_egresado, ci_egresado, nombre_empresa) VALUES
('egresado.torres@gmail.com', 'V33445566', 'TechCorp'),
('egresada.castro@gmail.com', 'V44556677', 'Bufete Legal'),
('egresado.rivera@gmail.com', 'V55667788', 'Banco Nacional'),
('egresado.torres@gmail.com', 'V33445566', 'Google'),
('egresado.torres@gmail.com', 'V33445566', 'Microsoft');

-- ============================================
-- 5. PROFESORES (detalles)
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
-- 6. PERSONAL ADMINISTRATIVO Y OBRERO
-- ============================================

INSERT INTO soyucab.personal_administrativo (email_persona, tipo_rol, fecha_inicio, cargo, ubicacion_de_trabajo, dedicacion) VALUES
('admin.perez@ucab.edu.ve', 'Personal Administrativo', '2018-05-01', 'Administrador Sistemas', 'Edificio Rectoría', 'Tiempo Completo'),
('admin.gonzalez@ucab.edu.ve', 'Personal Administrativo', '2014-02-15', 'Coordinadora Académica', 'Facultad Ingeniería', 'Tiempo Completo');

INSERT INTO soyucab.personal_obrero (email_persona, tipo_rol, fecha_inicio, cargo, dedicacion, empresa_a_la_que_pertenece) VALUES
('obrero.martinez@ucab.edu.ve', 'Personal Obrero', '2010-06-01', 'Técnico Mantenimiento', 'Tiempo Completo', 'UCAB'),
('obrero.rodriguez@ucab.edu.ve', 'Personal Obrero', '2005-03-10', 'Auxiliar Limpieza', 'Tiempo Completo', 'UCAB');

-- ============================================
-- 7. GRUPOS
-- ============================================

INSERT INTO soyucab.grupo (nombre, descripcion, fecha_creacion, cantidad_miembros, requisitos_ingreso, estado, categoria, email) VALUES
('Programadores UCAB', 'Grupo para estudiantes de programación', '2023-01-15', 15, 'Ser estudiante UCAB', 'activo', 'academico', 'juan.perez@gmail.com'),
('Club de Debate', 'Grupo de debate estudiantil', '2022-09-10', 25, 'Interés en debate', 'activo', 'cultural', 'maria.gonzalez@gmail.com'),
('Fútbol Universitario', 'Equipo de fútbol UCAB', '2023-03-01', 30, 'Asistir entrenamientos', 'activo', 'deportivo', 'carlos.lopez@gmail.com'),
('Investigación Científica', 'Grupo de investigación', '2022-11-20', 12, 'Tener proyectos investigación', 'activo', 'profesional', 'profesor.gomez@ucab.edu.ve'),
('Egresados UCAB 2020', 'Grupo de egresados', '2020-08-01', 50, 'Ser egresado UCAB 2020', 'activo', 'social', 'egresado.torres@gmail.com');

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
('pedro.rodriguez@gmail.com', 'Fútbol Universitario', 'moderador', 'activo'),

-- Investigación Científica
('profesor.gomez@ucab.edu.ve', 'Investigación Científica', 'administrador', 'activo'),
('profesor.ramirez@ucab.edu.ve', 'Investigación Científica', 'moderador', 'activo'),

-- Egresados UCAB 2020
('egresado.torres@gmail.com', 'Egresados UCAB 2020', 'administrador', 'activo'),
('egresada.castro@gmail.com', 'Egresados UCAB 2020', 'moderador', 'activo');

-- ============================================
-- 8. PUBLICACIONES Y ME GUSTA
-- ============================================

INSERT INTO soyucab.publicacion (fecha_publicacion, caption, tipo_contenido, descripcion_publicacion, configuracion_privacidad, imagen, email_publicador, nombre_grupo_publicado) VALUES
('2024-01-15 10:30:00', 'Mi primer proyecto en Python!', 'texto', 'Comparto mi primer proyecto usando Django', 'publico', 'proyecto_python.jpg', 'juan.perez@gmail.com', 'Programadores UCAB'),
('2024-01-16 14:20:00', 'Ganamos el debate regional!', 'imagen', 'Foto del equipo después de ganar', 'publico', 'debate_ganador.jpg', 'maria.gonzalez@gmail.com', 'Club de Debate'),
('2024-01-17 16:45:00', 'Nuevas técnicas de investigación', 'texto', 'Comparto métodos para investigación científica', 'publico', NULL, 'profesor.gomez@ucab.edu.ve', 'Investigación Científica'),
('2024-01-18 09:15:00', 'Golazo en el último partido!', 'video', 'Video del gol de la victoria', 'publico', NULL, 'carlos.lopez@gmail.com', 'Fútbol Universitario');

INSERT INTO soyucab.me_gusta (email_miembro_gusta, email_publicador_publicacion, fecha_publicacion_publicacion) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('carlos.lopez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:30:00'),
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00'),
('ana.martinez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00');

-- ============================================
-- 9. COMENTARIOS
-- ============================================

INSERT INTO soyucab.comentario (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, contenido, estado_comentario) VALUES
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com', '2024-01-15 10:30:00', 'Excelente proyecto Juan! Muy bien estructurado.', 'visible'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:30:00', 'Buen uso de patrones MVC. Continúa así.', 'visible'),
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:20:00', 'Felicidades equipo! Gran trabajo.', 'visible');

-- ============================================
-- 10. RELACIONES Y SEGUIMIENTOS
-- ============================================

INSERT INTO soyucab.seguimiento (email_seguidor, email_seguido) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com'),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve'),
('maria.gonzalez@gmail.com', 'juan.perez@gmail.com'),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve');

INSERT INTO soyucab.relacion (usuario_origen, usuario_destino, fecha_solicitud, fecha_establecimiento, seguimiento, estado, es_simetrica, permite_mensajeria) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00', '2023-09-01 10:05:00', true, 'aceptada', true, true),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00', '2023-10-15 14:35:00', true, 'aceptada', false, true),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve', '2023-11-20 09:15:00', '2023-11-20 09:20:00', true, 'aceptada', false, true);

INSERT INTO soyucab.tipo_de_relacion (usuario_origen, usuario_destino, fecha_solicitud, tipo) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2023-09-01 10:00:00', 'compañeros'),
('juan.perez@gmail.com', 'profesor.gomez@ucab.edu.ve', '2023-10-15 14:30:00', 'estudiante-profesor'),
('maria.gonzalez@gmail.com', 'profesora.lopez@ucab.edu.ve', '2023-11-20 09:15:00', 'estudiante-profesor');

-- ============================================
-- 11. EVENTOS
-- ============================================

INSERT INTO soyucab.evento (ubicacion, email_creador_evento, fecha_hora_inicio, tipo_evento, fecha_hora_fin, titulo, descripcion, categoria, modalidad, enlace_virtual, aforo_maximo, costo_inscripcion, instrucciones, estado_evento, visibilidad) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'profesor.gomez@ucab.edu.ve', '2024-02-15 09:00:00', 'Taller de Programación', '2024-02-15 13:00:00', 'Taller de Python Avanzado', 'Taller práctico de Python para estudiantes avanzados', 'taller', 'presencial', NULL, 30, 0.00, 'Traer laptop con Python instalado', 'publicado', true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'profesora.lopez@ucab.edu.ve', '2024-03-10 14:00:00', 'Conferencia de Derecho', '2024-03-10 18:00:00', 'Actualización Legal 2024', 'Conferencia sobre nuevas leyes y reformas', 'conferencia', 'hibrido', 'https://meet.ucab.edu.ve/derecho2024', 100, 50.00, 'Registro previo obligatorio', 'publicado', true);

INSERT INTO soyucab.miembro_participa_evento (ubicacion, fecha_hora_inicio, email_miembro, estado_participacion) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-02-15 09:00:00', 'juan.perez@gmail.com', 'confirmado'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-02-15 09:00:00', 'maria.gonzalez@gmail.com', 'confirmado'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2024-03-10 14:00:00', 'maria.gonzalez@gmail.com', 'confirmado'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2024-03-10 14:00:00', 'egresada.castro@gmail.com', 'confirmado');

-- ============================================
-- 12. CONVERSACIONES Y MENSAJES
-- ============================================

INSERT INTO soyucab.conversacion (ci_iniciador, fecha_inicio, titulo, tipo_conversacion, ultimo_mensaje, fecha_ultimo_mensaje, estado_conversacion) VALUES
('V12345678', '2024-01-10 08:30:00', 'Consulta sobre proyecto', 'individual', 'Gracias por la ayuda!', '2024-01-10 09:15:00', 'activa');

INSERT INTO soyucab.participante_conversacion (ci_iniciador, fecha_inicio, ci_participante) VALUES
('V12345678', '2024-01-10 08:30:00', 'V12345678'),
('V12345678', '2024-01-10 08:30:00', 'V11223344');

INSERT INTO soyucab.mensaje (ci_creador_conversacion, fecha_creacion_conversacion, ci_remitente, fecha_envio, contenido, tipo_mensaje, estado_mensaje) VALUES
('V12345678', '2024-01-10 08:30:00', 'V12345678', '2024-01-10 08:30:00', 'Hola profesor, tengo una duda sobre el proyecto', 'texto', 'leido'),
('V12345678', '2024-01-10 08:30:00', 'V11223344', '2024-01-10 08:45:00', 'Claro Juan, ¿en qué puedo ayudarte?', 'texto', 'leido');

-- ============================================
-- 13. DEPENDENCIAS (CORREGIDO)
-- ============================================

INSERT INTO soyucab.dependencia_ucab (nombre_institucional, email, descripcion, logo, pagina_web, fecha_creacion, estado, responsable, ubicacion_fisica, edificio) VALUES
('Dirección Asuntos Comunitarios', 'dependencia.dac@ucab.edu.ve', 'La DAC promueve responsabilidad social y voluntariado en la UCAB.', 'dac_logo.png', 'https://www.ucab.edu.ve/dac', '2010-05-20', 'activa', 'Dr. Carlos Mendoza', 'Campus Montalbán', 'Edificio Rectoría');

INSERT INTO soyucab.tipo_dependencia (nombre_tipo, descripcion) VALUES
('Académica', 'Dependencias actividades académicas'),
('Administrativa', 'Dependencias gestión administrativa'),
('Estudiantil', 'Dependencias atención estudiantes');

INSERT INTO soyucab.es_tipo (codigo_institucional, nombre_tipo) VALUES
('Dirección Asuntos Comunitarios', 'Estudiantil'),
('Dirección Asuntos Comunitarios', 'Administrativa');

-- ============================================
-- 14. ORGANIZACIONES (CORREGIDO - CI de 10 chars)
-- ============================================

INSERT INTO soyucab.organizacion_asociada (rif, email, nombre, logo, pagina_web, descripcion, tipos_colaboracion) VALUES
('J87654321', 'techcorp@empresa.com', 'TechCorp Solutions', 'techcorp_logo.png', 'https://www.techcorp.com', 'Empresa de tecnología desarrollo software', '["pasantías", "contratación"]');

INSERT INTO soyucab.tipo_organizacion (nombre_tipo, descripcion) VALUES
('Tecnológica', 'Empresas sector tecnológico'),
('Consultoría', 'Empresas consultoría servicios');

INSERT INTO soyucab.es_tipo_organizacion (rif, nombre_tipo) VALUES
('J87654321', 'Tecnológica'),
('J87654321', 'Consultoría');

-- ============================================
-- 15. ANUNCIOS (CORREGIDOS)
-- ============================================

INSERT INTO soyucab.anuncio (fecha_creacion, creador_email, titulo, contenido, tipo_anuncio, prioridad, fecha_publicacion, fecha_expiracion, creador_tipo) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Voluntariado Comunitario', 'Se buscan voluntarios programa alfabetización', 'informativo', 'alta', '2024-01-20 09:00:00', '2024-02-20 23:59:59', 'dependencia'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Oportunidades Pasantía', 'TechCorp ofrece pasantías desarrollo software', 'laboral', 'media', '2024-01-21 10:30:00', '2024-03-21 23:59:59', 'organizacion');

INSERT INTO soyucab.destinatarios (fecha_creacion, creador_email, valor) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Estudiantes'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'Profesores'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Estudiantes Ingeniería'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'Egresados');

INSERT INTO soyucab.etiquetas (fecha_creacion, creador_email, valor) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'voluntariado'),
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'comunidad'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'empleo'),
('2024-01-21 10:30:00', 'techcorp@empresa.com', 'tecnología');

-- ============================================
-- 16. NOTIFICACIONES
-- ============================================

INSERT INTO soyucab.notificacion (email_destino, email_envia, fecha_hora, titulo, contenido, tipo_notificacion, estado, prioridad) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:25:00', 'Nuevo comentario', 'María comentó tu publicación', 'publicacion', 'leida', 'media'),
('profesor.gomez@ucab.edu.ve', 'juan.perez@gmail.com', '2024-01-15 10:35:00', 'Nuevo comentario', 'Juan comentó tu publicación', 'publicacion', 'leida', 'media');

INSERT INTO soyucab.notif_generada_por_publicacion (email_destino_notif, email_envia_notif, fecha_hora_notif, email_publicador_pub, fecha_publicacion_pub) VALUES
('juan.perez@gmail.com', 'maria.gonzalez@gmail.com', '2024-01-16 14:25:00', 'juan.perez@gmail.com', '2024-01-15 10:30:00');

-- Provoca (primero asegurar la notificación existe)
INSERT INTO soyucab.notificacion (email_destino, email_envia, fecha_hora, titulo, contenido, tipo_notificacion, estado, prioridad) VALUES
('egresado.torres@gmail.com', 'dependencia.dac@ucab.edu.ve', '2024-01-20 09:05:00', 'Nuevo anuncio', 'Nuevo anuncio voluntariado', 'anuncio', 'leida', 'media');

INSERT INTO soyucab.provoca (fecha_creacion, creador_email, email_destino, fecha_hora) VALUES
('2024-01-20 09:00:00', 'dependencia.dac@ucab.edu.ve', 'egresado.torres@gmail.com', '2024-01-20 09:05:00');

-- ============================================
-- 17. ENCUESTAS (CORREGIDAS)
-- ============================================

INSERT INTO soyucab.encuesta (tipo_encuesta, email_encuestador, titulo, descripcion, tipo_encuestador, fecha_creacion, fecha_fin, estado_encuesta, instrucciones, anonimato) VALUES
('Satisfacción estudiantil', 'dependencia.dac@ucab.edu.ve', 'Evaluación servicios', 'Encuesta evaluar servicios estudiantiles UCAB', 'dependencia', '2024-01-15 08:00:00', '2024-02-15 23:59:59', 'en_curso', 'Responda honestidad', true),
('Preferencias laborales', 'techcorp@empresa.com', 'Intereses profesionales', 'Encuesta conocer intereses profesionales egresados', 'organizacion', '2024-01-18 10:00:00', '2024-02-18 23:59:59', 'publicada', 'Seleccione opciones aplicables', true);

INSERT INTO soyucab.audiencia (tipo_encuesta, titulo, valor) VALUES
('Satisfacción estudiantil', 'Evaluación servicios', 'Estudiantes'),
('Satisfacción estudiantil', 'Evaluación servicios', 'Profesores'),
('Preferencias laborales', 'Intereses profesionales', 'Egresados'),
('Preferencias laborales', 'Intereses profesionales', 'Estudiantes últimos semestres');

INSERT INTO soyucab.requisitos_participacion (tipo_encuesta, titulo, valor) VALUES
('Satisfacción estudiantil', 'Evaluación servicios', 'Ser miembro activo UCAB'),
('Preferencias laborales', 'Intereses profesionales', 'Tener experiencia laboral');

INSERT INTO soyucab.opcion (tipo_encuesta, titulo_encuesta, numero_opcion, email_encuestado, completada) VALUES
('Satisfacción estudiantil', 'Evaluación servicios', 1, 'juan.perez@gmail.com', true),
('Satisfacción estudiantil', 'Evaluación servicios', 2, 'maria.gonzalez@gmail.com', true),
('Preferencias laborales', 'Intereses profesionales', 1, 'egresado.torres@gmail.com', false),
('Preferencias laborales', 'Intereses profesionales', 2, 'egresada.castro@gmail.com', true);

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
('Mención', 'Excelencia Investigación'),
('Premio', 'Innovación Educativa'),
('Distinción', 'Trayectoria Académica');

INSERT INTO soyucab.profesor_recibe_reconocimiento (email_profesor, tipo_reconocimiento, nombre_reconocimiento, anio_reconocimiento) VALUES
('profesor.gomez@ucab.edu.ve', 'Mención', 'Profesor del Año', 2022),
('profesor.gomez@ucab.edu.ve', 'Mención', 'Excelencia Investigación', 2023),
('profesora.lopez@ucab.edu.ve', 'Mención', 'Profesor del Año', 2021),
('profesor.ramirez@ucab.edu.ve', 'Distinción', 'Trayectoria Académica', 2020);

-- ============================================
-- 20. VERIFICACIÓN DE DATOS
-- ============================================

-- Probar funciones (AHORA SÍ deberían funcionar)
SELECT '=== TOP EMPRESAS FUNCIÓN ===' as prueba;
SELECT * FROM soyucab.obtener_top_empresas_contratantes_extendido(5);

SELECT '=== UBICACIÓN EGRESADOS FUNCIÓN ===' as prueba;
SELECT * FROM soyucab.obtener_ubicacion_egresados();

SELECT '=== ANÁLISIS INFLUENCIA FUNCIÓN ===' as prueba;
SELECT * FROM soyucab.Analisis_Influencia_Segmentacion_Seguidores('juan.perez@gmail.com');

SELECT '=== TUTORES VERIFICACIÓN ===' as prueba;
SELECT * FROM soyucab.verificar_Datos_Tutores();

SELECT '=== MENCIONES PROFESORES ===' as prueba;
SELECT * FROM soyucab.obtener_menciones();

SELECT '=== RESUMEN EVENTOS ===' as prueba;
SELECT * FROM soyucab.resumen_gestion_eventos();