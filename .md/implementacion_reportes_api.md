# Plan: Implementación de Endpoints de Reportes

## Resumen

Implementar 2 nuevos endpoints de reportes en la API Express backend:
1. **Resumen de Gestión de Eventos** - `GET /api/reports/gestion-eventos`
2. **Mejores Promedios por Facultad** - `GET /api/reports/top-promedios-facultad`

**Nota**: El tercer reporte (Semáforo de Pago) se omite porque no existe estructura de BD para pagos.

---

## Archivos a Modificar

### 1. `/Backend-SoyUcab/src/controllers/reportController.js`
Agregar 2 nuevos métodos al objeto `reportController` (después de `getTopUsers`, línea 154):
- `getGestionEventos()` - ~25 líneas
- `getTopPromediosFacultad()` - ~60 líneas

### 2. `/Backend-SoyUcab/src/routes/reportRoutes.js`
Agregar 2 nuevas rutas (después de línea 21):
- `router.get('/gestion-eventos', reportController.getGestionEventos);`
- `router.get('/top-promedios-facultad', reportController.getTopPromediosFacultad);`

---

## Reporte 1: Resumen de Gestión de Eventos

### Endpoint
`GET /api/reports/gestion-eventos`

### Estrategia
Utilizar la función PostgreSQL existente `soyucab.resumen_gestion_eventos()` que ya implementa la lógica necesaria.

### Query Parameters (opcionales)
- `limit` - Número máximo de eventos a retornar (sin límite por defecto)

### Implementación del Método

```javascript
async getGestionEventos(req, res) {
  try {
    const { limit } = req.query;

    // Llamar a la función PostgreSQL existente
    const result = await db.query('SELECT * FROM soyucab.resumen_gestion_eventos()');

    // Aplicar límite si se proporciona
    let data = result.rows;
    if (limit) {
      data = data.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error obteniendo reporte de gestión de eventos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reporte de gestión de eventos'
    });
  }
}
```

### Formato de Respuesta

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "fecha_evento": "2024-03-10",
      "titulo_evento": "Conferencia de Derecho",
      "total_asistentes_confirmados": 15,
      "gasto_asociado": 50.00
    },
    {
      "fecha_evento": "2024-02-15",
      "titulo_evento": "Taller de Programación",
      "total_asistentes_confirmados": 8,
      "gasto_asociado": null
    }
  ]
}
```

### Notas Técnicas
- La función DB ya filtra participantes con `estado_participacion = 'confirmado'`
- El campo `gasto_asociado` es el `costo_inscripcion` del evento (puede ser NULL)
- Los eventos se ordenan por `fecha_hora_inicio DESC` (más recientes primero)
- Sin autenticación requerida (consistente con otros reportes)

---

## Reporte 2: Mejores Promedios por Facultad

### Endpoint
`GET /api/reports/top-promedios-facultad`

### Estrategia
Query SQL con window function `ROW_NUMBER()` para rankear estudiantes dentro de cada facultad, respetando privacidad de perfil.

### Query Parameters (opcionales)
- `limit` - Número máximo de estudiantes POR FACULTAD (default: 10)
- `facultad` - Filtrar por facultad específica
- `minPromedio` - Promedio mínimo a incluir (default: 0)

### Decisiones de Diseño
- **Privacidad**: Solo mostrar estudiantes con `privacidad_perfil = 'publico'` (no existe campo específico de visibilidad para promedio)
- **Límite**: Aplicado POR FACULTAD, no global (top N de cada facultad)
- **Agrupación**: Resultados agrupados por facultad con lista de estudiantes

### Implementación del Método

```javascript
async getTopPromediosFacultad(req, res) {
  try {
    const { limit = 10, minPromedio = 0, facultad } = req.query;

    let queryText = `
      WITH ranked_estudiantes AS (
        SELECT
          e.facultad,
          p.nombres || ' ' || p.apellidos AS nombre_estudiante,
          e.promedio,
          e.carrera_programa,
          e.semestre,
          ROW_NUMBER() OVER (
            PARTITION BY e.facultad
            ORDER BY e.promedio DESC
          ) as ranking
        FROM soyucab.estudiante e
        JOIN soyucab.persona p
          ON e.email_estudiante = p.email_persona
        JOIN soyucab.miembro m
          ON e.email_estudiante = m.email
        WHERE e.promedio IS NOT NULL
          AND m.privacidad_perfil = 'publico'
          AND e.promedio >= $1
    `;

    const params = [parseFloat(minPromedio)];

    // Filtro opcional por facultad específica
    if (facultad) {
      params.push(facultad);
      queryText += ` AND e.facultad = $${params.length}`;
    }

    queryText += `
      )
      SELECT
        facultad,
        nombre_estudiante,
        promedio,
        carrera_programa,
        semestre,
        ranking
      FROM ranked_estudiantes
      WHERE ranking <= $${params.length + 1}
      ORDER BY facultad ASC, ranking ASC
    `;

    params.push(parseInt(limit));

    const result = await db.query(queryText, params);

    // Agrupar resultados por facultad
    const groupedData = {};
    result.rows.forEach(row => {
      const fac = row.facultad;
      if (!groupedData[fac]) {
        groupedData[fac] = {
          facultad: fac,
          estudiantes: [],
          promedio_maximo: 0,
          total_estudiantes: 0
        };
      }

      const promedio = parseFloat(row.promedio);
      groupedData[fac].estudiantes.push({
        nombre: row.nombre_estudiante,
        promedio: promedio,
        carrera: row.carrera_programa,
        semestre: row.semestre,
        ranking: row.ranking
      });

      groupedData[fac].promedio_maximo = Math.max(
        groupedData[fac].promedio_maximo,
        promedio
      );
      groupedData[fac].total_estudiantes++;
    });

    const data = Object.values(groupedData);

    res.json({
      success: true,
      count: data.length,
      total_estudiantes: result.rows.length,
      data: data
    });
  } catch (error) {
    console.error('Error obteniendo top promedios por facultad:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reporte de promedios por facultad'
    });
  }
}
```

### Formato de Respuesta

```json
{
  "success": true,
  "count": 3,
  "total_estudiantes": 25,
  "data": [
    {
      "facultad": "Derecho",
      "estudiantes": [
        {
          "nombre": "Pedro López",
          "promedio": 19.20,
          "carrera": "Derecho",
          "semestre": 10,
          "ranking": 1
        },
        {
          "nombre": "Ana Martínez",
          "promedio": 18.90,
          "carrera": "Derecho",
          "semestre": 8,
          "ranking": 2
        }
      ],
      "promedio_maximo": 19.20,
      "total_estudiantes": 2
    },
    {
      "facultad": "Ingeniería",
      "estudiantes": [
        {
          "nombre": "Juan Pérez",
          "promedio": 18.50,
          "carrera": "Ingeniería Informática",
          "semestre": 8,
          "ranking": 1
        }
      ],
      "promedio_maximo": 18.50,
      "total_estudiantes": 1
    }
  ]
}
```

### Notas Técnicas
- Usa `ROW_NUMBER() OVER (PARTITION BY e.facultad ORDER BY e.promedio DESC)` para rankear dentro de cada facultad
- Filtra solo estudiantes con `privacidad_perfil = 'publico'`
- Si un estudiante tiene promedio NULL, se excluye automáticamente
- El promedio está en escala 0-20 (sistema venezolano)
- Resultados agrupados por facultad en JavaScript para mejor consumo por frontend

---

## Cambios en reportRoutes.js

Agregar estas líneas después de la línea 21 (después de `router.get('/top-users', ...)`):

```javascript
// GET /api/reports/gestion-eventos
router.get('/gestion-eventos', reportController.getGestionEventos);

// GET /api/reports/top-promedios-facultad
router.get('/top-promedios-facultad', reportController.getTopPromediosFacultad);
```

---

## Verificación y Testing

### 1. Verificación de DB (SQL directo)
```sql
-- Verificar función existente
SELECT * FROM soyucab.resumen_gestion_eventos();

-- Verificar datos de estudiantes
SELECT DISTINCT facultad FROM soyucab.estudiante ORDER BY facultad;

-- Verificar privacidad
SELECT
  m.privacidad_perfil,
  COUNT(*) as total
FROM soyucab.miembro m
JOIN soyucab.estudiante e ON m.email = e.email_estudiante
GROUP BY m.privacidad_perfil;

-- Test query de Report 2
WITH ranked_estudiantes AS (
  SELECT
    e.facultad,
    p.nombres || ' ' || p.apellidos AS nombre,
    e.promedio,
    ROW_NUMBER() OVER (PARTITION BY e.facultad ORDER BY e.promedio DESC) as ranking
  FROM soyucab.estudiante e
  JOIN soyucab.persona p ON e.email_estudiante = p.email_persona
  JOIN soyucab.miembro m ON e.email_estudiante = m.email
  WHERE e.promedio IS NOT NULL
    AND m.privacidad_perfil = 'publico'
)
SELECT * FROM ranked_estudiantes WHERE ranking <= 5;
```

### 2. Testing de Endpoints (API)

**Report 1: Gestión de Eventos**
```bash
# Test básico
curl http://localhost:3000/api/reports/gestion-eventos

# Test con límite
curl http://localhost:3000/api/reports/gestion-eventos?limit=5

# Verificar campos esperados en respuesta
# - success: true
# - count: número
# - data: array con fecha_evento, titulo_evento, total_asistentes_confirmados, gasto_asociado
```

**Report 2: Top Promedios por Facultad**
```bash
# Test básico (top 10 por facultad)
curl http://localhost:3000/api/reports/top-promedios-facultad

# Test con límite personalizado
curl http://localhost:3000/api/reports/top-promedios-facultad?limit=5

# Test filtrado por facultad
curl http://localhost:3000/api/reports/top-promedios-facultad?facultad=Ingeniería

# Test con promedio mínimo
curl http://localhost:3000/api/reports/top-promedios-facultad?minPromedio=16

# Test combinado
curl "http://localhost:3000/api/reports/top-promedios-facultad?facultad=Derecho&limit=3&minPromedio=17"

# Verificar campos esperados en respuesta
# - success: true
# - count: número de facultades
# - total_estudiantes: total de estudiantes en todas las facultades
# - data: array de objetos con facultad, estudiantes[], promedio_maximo, total_estudiantes
```

### 3. Casos de Prueba Específicos

**Caso 1**: Evento sin participantes confirmados
- Resultado esperado: `total_asistentes_confirmados: 0`

**Caso 2**: Evento sin costo de inscripción
- Resultado esperado: `gasto_asociado: null`

**Caso 3**: Estudiante con perfil privado
- Resultado esperado: NO debe aparecer en el reporte de promedios

**Caso 4**: Facultad sin estudiantes públicos
- Resultado esperado: Esa facultad NO aparece en la respuesta

**Caso 5**: Límite mayor que estudiantes disponibles
- Resultado esperado: Devolver todos los disponibles (no error)

### 4. Validación de Integridad

Verificar que:
- ✓ Los endpoints retornan status 200 para requests válidos
- ✓ Los endpoints retornan status 500 para errores de BD
- ✓ El formato de respuesta es consistente: `{ success, count, data }`
- ✓ Los datos son ordenados correctamente (fecha DESC para eventos, promedio DESC para estudiantes)
- ✓ Los query parameters son procesados correctamente
- ✓ Los valores NULL se manejan apropiadamente
- ✓ La privacidad se respeta en Report 2

---

## Consideraciones Adicionales

### Performance
- Report 1: Muy rápido (función DB optimizada, ~50ms)
- Report 2: Moderado (window function, ~200ms con miles de estudiantes)
- Considerar índices si el volumen crece:
  ```sql
  CREATE INDEX idx_estudiante_facultad_promedio
    ON soyucab.estudiante(facultad, promedio DESC)
    WHERE promedio IS NOT NULL;

  CREATE INDEX idx_miembro_privacidad
    ON soyucab.miembro(privacidad_perfil);
  ```

### Seguridad
- Sin autenticación (consistente con otros reportes existentes)
- Queries parametrizadas previenen SQL injection
- Respeta configuración de privacidad de usuarios

### Escalabilidad
- Agregar paginación si el número de eventos/estudiantes crece significativamente
- Considerar caché para Report 2 (los promedios no cambian con frecuencia)

---

## Resumen de Cambios

| Archivo | Líneas a Agregar | Tipo de Cambio |
|---------|-----------------|----------------|
| `reportController.js` | ~85 líneas | 2 nuevos métodos |
| `reportRoutes.js` | 5 líneas | 2 nuevas rutas |
| **Total** | **~90 líneas** | **Código nuevo** |

**No se requieren cambios en la base de datos** - toda la estructura necesaria ya existe.
