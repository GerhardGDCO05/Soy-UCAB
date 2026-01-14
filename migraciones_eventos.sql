-- ============================================================================
-- MIGRACIONES PARA GESTIÓN COMPLETA DE EVENTOS
-- Requisitos: Detalles completos, logística, gestión de participantes
-- Encargado: Andrea De Lima
-- ============================================================================

-- 1. Crear tabla evento_ubicacion para detalles de ubicaciones físicas
CREATE TABLE IF NOT EXISTS soyucab.evento_ubicacion (
    id_ubicacion UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    nombre_lugar VARCHAR(200) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    descripcion TEXT,
    capacidad_maxima INTEGER CHECK (capacidad_maxima > 0),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Crear ENUM para tipos de participación (requisito: inscritos, confirmados, lista de espera)
DO $$ BEGIN
    CREATE TYPE soyucab.tipo_participacion_evento AS ENUM (
        'inscrito',
        'confirmado',
        'en_lista_espera',
        'rechazado',
        'cancelado'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Actualizar tabla miembro_participa_evento con gestión de participantes mejorada
-- Si la tabla ya existe con estructura simple, la reemplazamos
DROP TABLE IF EXISTS soyucab.miembro_participa_evento CASCADE;

CREATE TABLE soyucab.miembro_participa_evento (
    ubicacion UUID,
    fecha_hora_inicio TIMESTAMP WITHOUT TIME ZONE,
    email_miembro VARCHAR(50),
    tipo_participacion soyucab.tipo_participacion_evento NOT NULL DEFAULT 'inscrito',
    fecha_inscripcion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    fecha_confirmacion TIMESTAMP WITHOUT TIME ZONE,
    posicion_lista_espera INTEGER,
    PRIMARY KEY (
        ubicacion,
        fecha_hora_inicio,
        email_miembro
    ),
    CONSTRAINT fk_participa_evento FOREIGN KEY (ubicacion, fecha_hora_inicio) REFERENCES soyucab.evento (ubicacion, fecha_hora_inicio) ON DELETE CASCADE,
    CONSTRAINT fk_participa_miembro FOREIGN KEY (email_miembro) REFERENCES soyucab.miembro (email) ON DELETE CASCADE,
    CONSTRAINT ck_confirmacion CHECK (
        fecha_confirmacion IS NULL
        OR fecha_confirmacion >= fecha_inscripcion
    )
);

-- 4. Crear tabla evento_dependencia para relacionar eventos con Dependencia UCAB
CREATE TABLE IF NOT EXISTS soyucab.evento_dependencia (
    ubicacion UUID,
    fecha_hora_inicio TIMESTAMP WITHOUT TIME ZONE,
    nombre_institucional VARCHAR(100),
    rol_dependencia VARCHAR(100) DEFAULT 'organizador',
    fecha_asociacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (
        ubicacion,
        fecha_hora_inicio,
        nombre_institucional
    ),
    CONSTRAINT fk_evento_dep FOREIGN KEY (ubicacion, fecha_hora_inicio) REFERENCES soyucab.evento (ubicacion, fecha_hora_inicio) ON DELETE CASCADE,
    CONSTRAINT fk_dependencia_ucab FOREIGN KEY (nombre_institucional) REFERENCES soyucab.dependencia_ucab (nombre_institucional) ON DELETE CASCADE
);

-- 5. Crear tabla evento_organizacion para relacionar eventos con Organizaciones Asociadas
CREATE TABLE IF NOT EXISTS soyucab.evento_organizacion (
    ubicacion UUID,
    fecha_hora_inicio TIMESTAMP WITHOUT TIME ZONE,
    rif VARCHAR(50),
    rol_organizacion VARCHAR(100) DEFAULT 'colaborador',
    fecha_asociacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (
        ubicacion,
        fecha_hora_inicio,
        rif
    ),
    CONSTRAINT fk_evento_org FOREIGN KEY (ubicacion, fecha_hora_inicio) REFERENCES soyucab.evento (ubicacion, fecha_hora_inicio) ON DELETE CASCADE,
    CONSTRAINT fk_organizacion_asociada FOREIGN KEY (rif) REFERENCES soyucab.organizacion_asociada (rif) ON DELETE CASCADE
);

-- 6. Agregar columna id_ubicacion_referencia a tabla evento si no existe
ALTER TABLE soyucab.evento
ADD COLUMN IF NOT EXISTS id_ubicacion_referencia UUID,
ADD COLUMN IF NOT EXISTS lugar_fisico VARCHAR(200),
ADD CONSTRAINT fk_evento_ubicacion_ref FOREIGN KEY (id_ubicacion_referencia) REFERENCES soyucab.evento_ubicacion (id_ubicacion) ON DELETE SET NULL;

-- ============================================================================
-- FUNCIÓN MEJORADA: Obtener detalles completos de eventos
-- Retorna: detalles completos, logística, participantes, relaciones
-- ============================================================================
CREATE OR REPLACE FUNCTION soyucab.obtener_detalles_eventos()
RETURNS TABLE (
    id_evento UUID,
    fecha_hora_inicio TIMESTAMP,
    titulo VARCHAR,
    descripcion TEXT,
    categoria VARCHAR,
    modalidad VARCHAR,
    lugar_fisico VARCHAR,
    ubicacion_referencia VARCHAR,
    capacidad_maxima INTEGER,
    enlace_virtual VARCHAR,
    total_inscritos INTEGER,
    total_confirmados INTEGER,
    total_lista_espera INTEGER,
    dependencias_organizadoras TEXT,
    organizaciones_asociadas TEXT,
    estado_evento VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    WITH eventos_base AS (
        SELECT
            e.ubicacion,
            e.fecha_hora_inicio,
            e.titulo,
            e.descripcion,
            e.categoria::VARCHAR AS categoria,
            e.modalidad::VARCHAR AS modalidad,
            COALESCE(e.lugar_fisico, eu.nombre_lugar) AS lugar_fisico,
            eu.nombre_lugar AS ubicacion_referencia,
            COALESCE(e.aforo_maximo, eu.capacidad_maxima) AS capacidad_maxima,
            e.enlace_virtual,
            e.estado_evento::VARCHAR AS estado_evento
        FROM soyucab.evento e
        LEFT JOIN soyucab.evento_ubicacion eu ON e.id_ubicacion_referencia = eu.id_ubicacion
    )
    SELECT
        eb.ubicacion,
        eb.fecha_hora_inicio,
        eb.titulo,
        eb.descripcion,
        eb.categoria,
        eb.modalidad,
        eb.lugar_fisico,
        eb.ubicacion_referencia,
        eb.capacidad_maxima,
        eb.enlace_virtual,
        COALESCE(
            (SELECT COUNT(*)::INTEGER FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = eb.ubicacion
             AND mpe.fecha_hora_inicio = eb.fecha_hora_inicio
             AND mpe.tipo_participacion IN ('inscrito', 'confirmado')),
            0
        ) AS total_inscritos,
        COALESCE(
            (SELECT COUNT(*)::INTEGER FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = eb.ubicacion
             AND mpe.fecha_hora_inicio = eb.fecha_hora_inicio
             AND mpe.tipo_participacion = 'confirmado'),
            0
        ) AS total_confirmados,
        COALESCE(
            (SELECT COUNT(*)::INTEGER FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = eb.ubicacion
             AND mpe.fecha_hora_inicio = eb.fecha_hora_inicio
             AND mpe.tipo_participacion = 'en_lista_espera'),
            0
        ) AS total_lista_espera,
        STRING_AGG(DISTINCT ed.nombre_institucional, ', ') AS dependencias_organizadoras,
        STRING_AGG(DISTINCT eo.rif, ', ') AS organizaciones_asociadas,
        eb.estado_evento
    FROM eventos_base eb
    LEFT JOIN soyucab.evento_dependencia ed ON eb.ubicacion = ed.ubicacion
        AND eb.fecha_hora_inicio = ed.fecha_hora_inicio
    LEFT JOIN soyucab.evento_organizacion eo ON eb.ubicacion = eo.ubicacion
        AND eb.fecha_hora_inicio = eo.fecha_hora_inicio
    GROUP BY
        eb.ubicacion, eb.fecha_hora_inicio, eb.titulo, eb.descripcion,
        eb.categoria, eb.modalidad, eb.lugar_fisico, eb.capacidad_maxima,
        eb.enlace_virtual, eb.estado_evento, eb.ubicacion_referencia;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN MEJORADA: Resumen de gestión de eventos (reemplaza la antigua)
-- ============================================================================
CREATE OR REPLACE FUNCTION soyucab.resumen_gestion_eventos()
RETURNS TABLE (
    fecha_evento DATE,
    titulo_evento VARCHAR,
    total_asistentes_confirmados BIGINT,
    gasto_asociado NUMERIC,
    lugar VARCHAR,
    modalidad VARCHAR,
    total_inscritos INTEGER,
    lista_espera INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CAST(e.fecha_hora_inicio AS DATE),
        e.titulo,
        COALESCE(
            (SELECT COUNT(*) FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = e.ubicacion
             AND mpe.fecha_hora_inicio = e.fecha_hora_inicio
             AND mpe.tipo_participacion = 'confirmado'),
            0
        ),
        e.costo_inscripcion,
        COALESCE(e.lugar_fisico, 'Virtual'),
        e.modalidad::TEXT,
        COALESCE(
            (SELECT COUNT(*) FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = e.ubicacion
             AND mpe.fecha_hora_inicio = e.fecha_hora_inicio
             AND mpe.tipo_participacion IN ('inscrito', 'confirmado')),
            0
        ),
        COALESCE(
            (SELECT COUNT(*) FROM soyucab.miembro_participa_evento mpe
             WHERE mpe.ubicacion = e.ubicacion
             AND mpe.fecha_hora_inicio = e.fecha_hora_inicio
             AND mpe.tipo_participacion = 'en_lista_espera'),
            0
        )
    FROM soyucab.evento e
    WHERE e.estado_evento != 'cancelado'
    ORDER BY e.fecha_hora_inicio DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Obtener detalles de participantes de un evento específico
-- ============================================================================
CREATE OR REPLACE FUNCTION soyucab.obtener_participantes_evento(
    p_ubicacion UUID,
    p_fecha_inicio TIMESTAMP WITHOUT TIME ZONE
)
RETURNS TABLE (
    email_participante VARCHAR,
    nombre VARCHAR,
    apellido VARCHAR,
    tipo_participacion VARCHAR,
    fecha_inscripcion TIMESTAMP,
    fecha_confirmacion TIMESTAMP,
    posicion_lista_espera INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mpe.email_miembro,
        p.nombres,
        p.apellidos,
        mpe.tipo_participacion::TEXT,
        mpe.fecha_inscripcion,
        mpe.fecha_confirmacion,
        mpe.posicion_lista_espera
    FROM soyucab.miembro_participa_evento mpe
    JOIN soyucab.miembro m ON mpe.email_miembro = m.email
    JOIN soyucab.persona p ON m.email = p.email_persona
    WHERE mpe.ubicacion = p_ubicacion
    AND mpe.fecha_hora_inicio = p_fecha_inicio
    ORDER BY
        CASE
            WHEN mpe.tipo_participacion = 'confirmado' THEN 1
            WHEN mpe.tipo_participacion = 'inscrito' THEN 2
            WHEN mpe.tipo_participacion = 'en_lista_espera' THEN 3
            ELSE 4
        END,
        mpe.fecha_inscripcion ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_evento_ubicacion_ref ON soyucab.evento (id_ubicacion_referencia);

CREATE INDEX IF NOT EXISTS idx_participa_tipo ON soyucab.miembro_participa_evento (tipo_participacion);

CREATE INDEX IF NOT EXISTS idx_participa_fecha ON soyucab.miembro_participa_evento (fecha_inscripcion);

CREATE INDEX IF NOT EXISTS idx_evento_dependencia_fk ON soyucab.evento_dependencia (nombre_institucional);

CREATE INDEX IF NOT EXISTS idx_evento_organizacion_fk ON soyucab.evento_organizacion (rif);