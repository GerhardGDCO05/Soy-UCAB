
-- Esto hará que buscar las publicaciones de cualquier usuario sea instantáneo
CREATE INDEX idx_publicacion_email ON soyucab.publicacion(email_publicador);

-- Esto hará que el ordenamiento por fecha en el Home sea súper rápido
CREATE INDEX idx_publicacion_fecha ON soyucab.publicacion(fecha_publicacion DESC);

ALTER TABLE soyucab.miembro 
ALTER COLUMN telefono TYPE VARCHAR(20);

ALTER TABLE soyucab.miembro 
ALTER COLUMN telefono TYPE VARCHAR(20) USING telefono::varchar;

-- 1. Arreglar la relación con la tabla me_gusta
ALTER TABLE soyucab.me_gusta 
DROP CONSTRAINT fk_publicacion_gustada;

ALTER TABLE soyucab.me_gusta 
ADD CONSTRAINT fk_publicacion_gustada 
FOREIGN KEY (email_publicador_publicacion, fecha_publicacion_publicacion) 
REFERENCES soyucab.publicacion(email_publicador, fecha_publicacion) 
ON UPDATE CASCADE ON DELETE CASCADE;

-- 2. Arreglar la relación con la tabla comentario
ALTER TABLE soyucab.comentario 
DROP CONSTRAINT fk_comentario_publicacion;

ALTER TABLE soyucab.comentario 
ADD CONSTRAINT fk_comentario_publicacion 
FOREIGN KEY (email_creador_publicacion, fecha_creacion_publicacion) 
REFERENCES soyucab.publicacion(email_publicador, fecha_publicacion) 
ON UPDATE CASCADE ON DELETE CASCADE;

-- 3. Ahora ya puedes ejecutar el cambio de precisión sin errores
UPDATE soyucab.publicacion 
SET fecha_publicacion = date_trunc('second', fecha_publicacion);

ALTER TABLE soyucab.publicacion 
ALTER COLUMN fecha_publicacion TYPE timestamp(0) WITHOUT TIME ZONE;

-- (Opcional) Hacer lo mismo con las columnas de los hijos por consistencia
ALTER TABLE soyucab.me_gusta 
ALTER COLUMN fecha_publicacion_publicacion TYPE timestamp(0) WITHOUT TIME ZONE;

ALTER TABLE soyucab.comentario 
ALTER COLUMN fecha_creacion_publicacion TYPE timestamp(0) WITHOUT TIME ZONE;


-- Forzamos a que todo lo que ya existe sea exacto al segundo
UPDATE soyucab.publicacion SET fecha_publicacion = date_trunc('second', fecha_publicacion);
UPDATE soyucab.comentario SET fecha_creacion_publicacion = date_trunc('second', fecha_creacion_publicacion);
UPDATE soyucab.me_gusta SET fecha_publicacion_publicacion = date_trunc('second', fecha_publicacion_publicacion);

UPDATE soyucab.publicacion 
SET fecha_publicacion = '2026-01-04 19:52:55' 
WHERE email_publicador = 'michael.scott@gmail.com';

-- Forzamos el redondeo al segundo en todas las tablas relacionadas
UPDATE soyucab.publicacion SET fecha_publicacion = date_trunc('second', fecha_publicacion);
UPDATE soyucab.me_gusta SET fecha_publicacion_publicacion = date_trunc('second', fecha_publicacion_publicacion);
UPDATE soyucab.comentario SET fecha_creacion_publicacion = date_trunc('second', fecha_creacion_publicacion);

-- Aseguramos que la columna no acepte más milisegundos en el futuro
ALTER TABLE soyucab.publicacion ALTER COLUMN fecha_publicacion TYPE timestamp(0);
ALTER TABLE soyucab.me_gusta ALTER COLUMN fecha_publicacion_publicacion TYPE timestamp(0);
ALTER TABLE soyucab.comentario ALTER COLUMN fecha_creacion_publicacion TYPE timestamp(0);


-- 1. Eliminar la llave foránea que estorba en la tabla de notificaciones
ALTER TABLE soyucab.envia_una 
DROP CONSTRAINT fk_envia_una_comentario;

-- 2. Ahora sí podemos borrar la llave primaria limitada del comentario
ALTER TABLE soyucab.comentario 
DROP CONSTRAINT comentario_pkey;

-- 3. Crear la nueva llave primaria que permite múltiples comentarios
-- Incluimos 'fecha_creacion' para que cada comentario sea único por su propia hora
ALTER TABLE soyucab.comentario 
ADD PRIMARY KEY (email_comentador, email_creador_publicacion, fecha_creacion_publicacion, fecha_creacion);

-- 4. Volver a conectar la tabla de notificaciones con la nueva estructura
-- Nota: La tabla envia_una ahora debe apuntar a la nueva PK de 4 campos
ALTER TABLE soyucab.envia_una 
ADD CONSTRAINT fk_envia_una_comentario 
FOREIGN KEY (email_creador_publicacion, email_comentador, fecha_creacion_publicacion, fecha_hora) 
REFERENCES soyucab.comentario(email_creador_publicacion, email_comentador, fecha_creacion_publicacion, fecha_creacion)
ON UPDATE CASCADE ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION soyucab.notificar_comentario()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo notificar si el que comenta NO es el mismo dueño del post
    IF NEW.email_comentador <> NEW.email_creador_publicacion THEN
        INSERT INTO soyucab.notificacion (
            email_destino, email_envia, titulo, contenido, tipo_notificacion, estado, prioridad
        ) VALUES (
            NEW.email_creador_publicacion, 
            NEW.email_comentador, 
            'Nuevo comentario', 
            'ha comentado en tu publicación: "' || LEFT(NEW.contenido, 20) || '..."',
            'publicacion', 
            'pendiente', 
            'media'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificar_comentario
AFTER INSERT ON soyucab.comentario
FOR EACH ROW EXECUTE FUNCTION soyucab.notificar_comentario();

CREATE OR REPLACE FUNCTION soyucab.notificar_like()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_miembro_gusta <> NEW.email_publicador_publicacion THEN
        INSERT INTO soyucab.notificacion (
            email_destino, email_envia, titulo, contenido, tipo_notificacion, estado, prioridad
        ) VALUES (
            NEW.email_publicador_publicacion, 
            NEW.email_miembro_gusta, 
            'Nuevo Like', 
            'le dio me gusta a tu publicación.',
            'publicacion', 
            'pendiente', 
            'baja'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificar_like
AFTER INSERT ON soyucab.me_gusta
FOR EACH ROW EXECUTE FUNCTION soyucab.notificar_like();