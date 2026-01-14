## 📌 Cambios Generales en el Proyecto

Este documento describe todos los cambios implementados en el módulo de reportes de SoyUCAB, incluyendo nuevas tablas de base de datos, funciones, endpoints API y componentes Vue.

---

## 🔧 1. PASOS INICIALES (IMPORTANTE)

Para aplicar todos estos cambios en tu entorno local, sigue estos pasos **en orden**:

### Paso 1: Eliminar la base de datos

```bash
# Conéctate a PostgreSQL y elimina la BD existente
psql -U postgres -c "DROP DATABASE IF EXISTS soyucab CASCADE;"
```

### Paso 2: Crear nueva BD desde el archivo base

```bash
# Ejecuta el archivo BDTodoUnido.sql
psql -U postgres -f BDTodoUnido.sql
```

### Paso 3: Aplicar las migraciones de eventos

```bash
# Ejecuta el archivo de migraciones
psql -h localhost -U postgres -d soyucab -f migraciones_eventos.sql
```

**✅ Listo!** Tu base de datos ahora tiene todas las tablas y funciones actualizadas.

---

## 📊 2. CAMBIOS EN BASE DE DATOS

### 2.1 Nuevas Tablas

#### **evento_ubicacion**

Almacena detalles completos de ubicaciones físicas para eventos.

```sql
Columnas principales:
- id_ubicacion (UUID) - Identificador único
- nombre_lugar (VARCHAR) - Nombre de la ubicación
- direccion (TEXT) - Dirección completa
- ciudad, pais (VARCHAR) - Ubicación geográfica
- capacidad_maxima (INTEGER) - Aforo máximo
```

**Uso:** Cuando un evento tiene una ubicación física específica.

---

#### **evento_dependencia**

Vincula eventos con dependencias de UCAB que los organizan.

```sql
Columnas principales:
- ubicacion (UUID) - Referencia al evento
- fecha_hora_inicio (TIMESTAMP) - Referencia al evento
- nombre_institucional (VARCHAR) - Nombre de la dependencia
- rol_dependencia (VARCHAR) - Ej: "organizador", "colaborador"
```

**Uso:** Registrar qué facultades, escuelas o departamentos organizan cada evento.

---

#### **evento_organizacion**

Vincula eventos con organizaciones externas asociadas.

```sql
Columnas principales:
- ubicacion (UUID) - Referencia al evento
- fecha_hora_inicio (TIMESTAMP) - Referencia al evento
- rif (VARCHAR) - RIF de la organización
- rol_organizacion (VARCHAR) - Ej: "colaborador", "patrocinador"
```

**Uso:** Registrar organizaciones externas que colaboran en eventos.

---

#### **miembro_participa_evento**

Mejor gestión de participantes y sus estados.

```sql
Columnas principales:
- ubicacion, fecha_hora_inicio, email_miembro - Clave primaria compuesta
- tipo_participacion - Enum: 'inscrito' | 'confirmado' | 'en_lista_espera' | 'rechazado' | 'cancelado'
- fecha_inscripcion (TIMESTAMP) - Cuándo se inscribió
- fecha_confirmacion (TIMESTAMP) - Cuándo confirmó asistencia
- posicion_lista_espera (INTEGER) - Posición en lista de espera
```

**Cambios:** Ahora permite rastrear el estado de cada participante de forma precisa.

---

### 2.2 Funciones PostgreSQL (Funciones SQL Mejoradas)

#### **obtener_detalles_eventos()**

Retorna **toda la información completa** de cada evento (como aparece en tu interfaz).

```sql
Campos que retorna:
- id_evento (ubicacion)
- fecha_hora_inicio
- titulo
- descripcion
- categoria
- modalidad
- lugar_fisico
- ubicacion_referencia
- capacidad_maxima
- enlace_virtual
- total_inscritos (COUNT)
- total_confirmados (COUNT)
- total_lista_espera (COUNT)
- dependencias_organizadoras (lista)
- organizaciones_asociadas (lista)
- estado_evento
```

**Uso en API:** `GET /api/reports/eventos-detalles`

---

#### **obtener_participantes_evento(p_ubicacion, p_fecha_inicio)**

Lista de participantes de un evento específico, filtrados por tipo de participación.

```sql
Parámetros:
- p_ubicacion: UUID del evento
- p_fecha_inicio: Fecha y hora del evento

Retorna:
- email_participante
- nombre, apellido
- tipo_participacion
- fechas de inscripción/confirmación
- posicion_lista_espera
```

---

#### **resumen_gestion_eventos()**

Resumen agregado de eventos (total asistentes, costos, etc.)

```sql
Retorna resumen por evento:
- fecha_evento
- titulo_evento
- total_asistentes_confirmados
- gasto_asociado
- lugar, modalidad
- total_inscritos, lista_espera
```

---

## 🔌 3. NUEVOS ENDPOINTS API (Backend)

### **GET /api/reports/eventos-detalles**

Obtiene detalles completos de **todos los eventos**.

```javascript
// Respuesta
{
  success: true,
  count: 5,
  data: [
    {
      id_evento: "uuid-1234",
      titulo: "Actualización Legal 2024",
      estado_evento: "publicado",
      descripcion: "Conferencia sobre nuevas leyes...",
      categoria: "conferencia",
      modalidad: "hibrido",
      fecha_hora_inicio: "2024-03-10T14:00:00",
      lugar_fisico: "Auditorio Principal",
      capacidad_maxima: 100,
      enlace_virtual: "https://zoom.us/...",
      total_inscritos: 45,
      total_confirmados: 30,
      total_lista_espera: 15,
      dependencias_organizadoras: "Escuela de Derecho, Rectorado",
      organizaciones_asociadas: "Colegio de Abogados, ONU",
      estado_evento: "publicado"
    }
  ]
}
```

---

### **GET /api/reports/eventos-participantes?ubicacion=UUID&fecha=TIMESTAMP**

Lista detallada de participantes de un evento específico.

```javascript
// Respuesta
{
  success: true,
  data: [
    {
      email_participante: "juan@ucab.edu.ve",
      nombre: "Juan",
      apellido: "Pérez",
      tipo_participacion: "confirmado",
      fecha_inscripcion: "2024-02-01T10:30:00",
      fecha_confirmacion: "2024-02-05T14:15:00",
      posicion_lista_espera: null
    }
  ]
}
```

---

### **GET /api/reports/eventos-resumen**

Resumen ejecutivo de eventos (métricas generales).

---

## 🎨 4. INTERFAZ - COMPONENTE Vue ACTUALIZADO

### **GestionEventos.vue**

Nueva interfaz completa para visualizar eventos con diseño moderno.

#### Secciones que muestra:

1. **Información Básica**

   - Título del evento
   - Estado (publicado, en curso, finalizado, borrador, cancelado)
   - Descripción

2. **Categoría y Modalidad**

   - Categoría: conferencia, taller, webinar, acto_de_grado, deportivo, cultural
   - Modalidad: presencial, virtual, híbrido

3. **Información Logística**

   - Fecha y hora de inicio
   - Ubicación física (o "Virtual")
   - Capacidad máxima
   - Enlace virtual (si aplica)

4. **Gestión de Participantes**

   - Total inscritos
   - Total confirmados
   - Total en lista de espera
   - Ocupación actual (Ej: 30/100)

5. **Relaciones Institucionales**
   - Dependencias UCAB organizadoras
   - Organizaciones externas asociadas

#### Características técnicas:

- ✅ Búsqueda y filtros
- ✅ Paginación (mostrar últimos N eventos)
- ✅ Responsive (funciona en móvil)
- ✅ Estados de carga y error
- ✅ Animaciones suaves

---

## 🎨 5. DISEÑO CSS ACTUALIZADO

### Cambios visuales:

#### Antes:

- Fondo con gradiente púrpura (`#667eea` → `#764ba2`)
- Headers coloridos con gradientes
- Badges de estado con múltiples colores

#### Ahora:

- Fondo gris claro y minimalista (`aliceblue`)
- Headers neutros (`#ecf0f1`)
- Todas las tarjetas con bordes azules a la izquierda
- Colores de acentos consistentes (`#3498db` - azul)
- Diseño similar a "Top Promedios Facultad"

#### Beneficios:

- Interfaz más profesional
- Mejor legibilidad
- Consistencia visual con otros reportes
- Menos saturación visual

---

## 📈 6. REPORTE: TOP PROMEDIOS FACULTAD

### Cambios importantes:

#### Filtro de privacidad de perfil

**⚠️ IMPORTANTE:** Solo muestra estudiantes con perfil PÚBLICO.

```sql
Regla:
- Si hay 8 estudiantes en BD
- Pero solo 5 tienen privacidad_perfil = 'publico'
- Entonces aparecerán SOLO esos 5
```

#### Columna de privacidad en tabla estudiante:

```sql
Nombre: privacidad_perfil
Valores: 'publico' | 'privado'
Default: 'privado'
```

#### Queryactual en backend:

```sql
SELECT ...
WHERE p.privacidad_perfil = 'publico'  -- ← Solo públicos
AND e.promedio >= minPromedio
ORDER BY e.promedio DESC
```

### Funcionalidades del reporte:

1. Filtro por facultad
2. Cantidad de estudiantes a mostrar
3. Promedio mínimo configurable
4. Muestra ranking (1º, 2º, 3º...)
5. Código de colores por desempeño

---

## 📝 7. ESTRUCTURA DE DIRECTORIOS

```
Backend-SoyUcab/
├── src/
│   ├── config/
│   │   └── database.js (sin cambios)
│   ├── controllers/
│   │   └── reportController.js (endpoints nuevos)
│   └── routes/
│       └── reportRoutes.js (rutas nuevas)

SoyUcab-Project/
├── src/
│   ├── components/
│   │   └── reportesVue/
│   │       ├── GestionEventos.vue (NEW)
│   │       ├── TopPromediosFacultad.vue
│   │       └── ... otros reportes
│   └── assets/
│       └── reportes/
│           ├── gestionEventos.css (NEW)
│           └── topPromediosFacultad.css

.md/
└── manual_cambios.md (este archivo)
```

---

## ✅ CHECKLIST DE APLICACIÓN

Antes de usar los nuevos reportes, asegúrate de:

- [ ] Haber ejecutado `DROP DATABASE soyucab`
- [ ] Haber ejecutado `BDTodoUnido.sql`
- [ ] Haber ejecutado `migraciones_eventos.sql`
- [ ] Haber reiniciado el servidor backend (`npm run dev`)
- [ ] Haber actualizado el navegador (Ctrl+F5)
- [ ] Ver en consola: "✅ Todas las rutas de reportes registradas"

---

## 🐛 TROUBLESHOOTING

### Error: "structure of query does not match function result type"

**Solución:** Las funciones necesitan casts correctos. Ejecuta nuevamente:

```bash
psql -h localhost -U postgres -d soyucab -f migraciones_eventos.sql
```

### Los eventos no aparecen en la interfaz

**Verificar:**

```sql
SELECT COUNT(*) FROM soyucab.evento;
SELECT * FROM soyucab.obtener_detalles_eventos() LIMIT 1;
```

### Top Promedios muestra 0 estudiantes

**Verificar que existan estudiantes públicos (privacidad_perfil = 'publico'):**

```sql
SELECT COUNT(*) FROM soyucab.estudiante e
JOIN soyucab.persona p ON e.email = p.email_persona
WHERE p.privacidad_perfil = 'publico';
```
