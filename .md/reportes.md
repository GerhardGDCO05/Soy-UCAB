# Contexto del Sistema — Reportes como Endpoints de la API (Express)

Este documento describe los **reportes del sistema**, implementados como **endpoints GET en una API Express**.  
El objetivo es que un LLM comprenda **qué debe construir cada endpoint**, **qué información debe devolver** y **qué validaciones previas debe realizar sobre la base de datos**.

---

## Consideración Clave (Obligatoria)

Antes de implementar cualquier reporte, el sistema **debe verificar los esquemas actuales de la base de datos**, con el fin de:

- Confirmar qué **campos existen realmente**.
- Identificar las **relaciones disponibles** entre entidades.
- Determinar si ciertos datos son **opcionales o inexistentes** (por ejemplo, gastos de un evento).
- Ajustar el reporte a la estructura real de la BD y **no asumir campos que no estén modelados**.

Esta validación es especialmente importante para los reportes de gestión.

---

## Módulo: Reportes

Los reportes son **endpoints de solo lectura** que consultan la base de datos, aplican reglas de negocio y devuelven información agregada lista para ser consumida por el frontend.

---

## Endpoint: Resumen de Gestión de Eventos

**Encargado:** Andrea De Lima

### Función

- `obtener_resumen_gestion_eventos()`

### Propósito

Generar un **resumen de la gestión de eventos institucionales**, útil para reportes administrativos.

### Requisito previo (BD)

Antes de construir el reporte, el endpoint debe:

- Revisar el esquema de **Evento** y sus relaciones.
- Verificar cómo se modela:
  - La fecha del evento.
  - El nombre del evento.
  - Las confirmaciones de asistencia (RSVP).
  - El gasto asociado al evento (si el campo existe).

### Qué debe devolver

Para cada evento, **según lo permita el esquema actual de la BD**:

- Fecha del evento.
- Nombre del evento.
- Conteo total de miembros con asistencia confirmada (RSVP).
- Gasto asociado a la realización del evento (solo si existe en el modelo).

### Datos y relaciones a consultar

- Evento
- Relación Evento–Participante (para RSVP)
- Entidad financiera o campo de gasto (si existe)
- Dependencia UCAB
- Organización asociada

---

## Endpoint: Mejores Promedios por Facultad

**Encargado:** Andrea De Lima

### Función

- `obtener_top_promedios_por_facultad()`

### Propósito

Devolver un **ranking académico por facultad**.

### Requisito previo (BD)

- Verificar en el esquema:
  - Dónde se almacena el promedio académico.
  - Cómo se define la visibilidad del promedio.
  - La relación entre estudiante y facultad.

### Qué debe devolver

- Facultad.
- Lista de estudiantes ordenados por promedio.
- Promedio académico (solo si es visible).

---

## Endpoint: Semáforo de Pago

**Encargado:** Andrea De Lima

### Función

- `obtener_estado_pago_semaforo()`

### Propósito

Mostrar el **estado de los pagos universitarios** mediante un sistema de semáforo.

### Requisito previo (BD)

- Verificar cómo están modelados:
  - Los procesos de pago.
  - Las fechas límite.
  - El estado del pago.

### Qué debe devolver

- Procesos de pago asociados al usuario.
- Fecha límite.
- Estado calculado (verde, amarillo, rojo).

---

## Regla General para Todos los Reportes

- **Nunca asumir campos o relaciones.**
- Siempre validar contra los **esquemas reales de la base de datos**.
- Si un dato no existe (por ejemplo, gasto del evento), el reporte debe:
  - Omitir el campo, o
  - Devolverlo como `null`, según el diseño acordado.

---

## Objetivo del Documento

Asegurar que el LLM entienda que:

- Cada reporte es un **endpoint GET**.
- La implementación depende directamente de los **esquemas actuales de la BD**.
- Los campos y relaciones deben ser **verificados antes de incluirse en el reporte**.
