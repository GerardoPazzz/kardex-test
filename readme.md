# Sistema de Kardex Académico

Backend construido con **SAP CAP (Cloud Application Programming)** que gestiona el control de calificaciones académicas de una universidad.

## Modelo de Datos

### Entidades

| Entidad | Descripción | Llave |
|---------|-------------|-------|
| `Alumnos` | Registro de estudiantes universitarios | `ID` (String 20) |
| `Cursos` | Catálogo de cursos disponibles | `ID` (String 10) |
| `Calificaciones` | Notas de alumnos en cursos específicos | `ID` (UUID) |

### Campo `actividad` (Soft Delete)

Las entidades `Alumnos` y `Cursos` incluyen un campo `actividad` que permite inactivar registros sin eliminarlos:

- `Activo` - Registro vigente, visible en listados
- `Inactivo` - Registro inactivo (soft delete), no puede recibir nuevas calificaciones

Las calificaciones permanecen asociadas aunque el alumno o curso sea inactivado.

## Servicio OData

**Endpoint:** `/odata/v4/kardex`

### Operaciones por Entidad

| Entidad | CREATE | READ | UPDATE | DELETE |
|---------|--------|------|--------|--------|
| Alumnos | Validado | ✅ | Validado | Soft delete → `Inactivo` |
| Cursos | Validado | ✅ | Validado | Soft delete → `Inactivo` |
| Calificaciones | Validado | ✅ | Validado | Físico |

## Validaciones Implementadas

### Alumnos
- `nombre`, `apellido`, `carrera`: No vacíos
- `email`: Formato válido (opcional)
- `actividad`: Solo "Activo" o "Inactivo"

### Cursos
- `nombre`: No vacío
- `creditos`: Entero positivo
- `descripcion`: Máximo 500 caracteres
- `actividad`: Solo "Activo" o "Inactivo"

### Calificaciones
- `nota`: Entre 0 y 20 (auto-calcula `estado`: Aprobado/Desaprobado)
- `alumno_ID`: El alumno debe existir y estar activo
- `curso_ID`: El curso debe existir y estar activo
- `semestre`: Formato `YYYY-T` (ej: 2026-I)

## Archivos del Proyecto

```
kardex-test/
├── db/
│   ├── schema.cds          # Modelo de dominio
│   └── data/               # Datos iniciales (CSV)
│       ├── sap.ui.kardex.Alumnos.csv
│       ├── sap.ui.kardex.Cursos.csv
│       └── sap.ui.kardex.Calificaciones.csv
├── srv/
│   ├── kardex-service.cds  # Definición del servicio OData
│   └── kardex-service.js   # Lógica de negocio y validaciones
├── test.http               # Requests HTTP para pruebas
└── readme.md
```

## Ejecución

```bash
npm start
# o
cds watch
```

El servidor se inicia en `http://localhost:4004`

## Pruebas

El archivo `test.http` contiene requests HTTP para probar todas las operaciones CRUD de cada entidad.

## Notas Técnicas

- **Namespace:** `sap.ui.kardex`
- **Separador en CSV:** Punto (`.`) - `sap.ui.kardex.Alumnos.csv`
- **Calificaciones:** La eliminación es física, no soft delete
- **Estado de aprobación:** Se calcula automáticamente según la nota (≥10.5 = Aprobado)
