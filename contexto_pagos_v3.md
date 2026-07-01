# CONTEXTO DEL PROYECTO: SISTEMA AUTOMATIZADO DE CONCILIACIÓN DE PAGOS ESCOLARES
> Versión 3.0 — Incluye visión general del ecosistema, integración entre automatizaciones y flujo completo end-to-end.

---

## 0. VISIÓN GENERAL DEL ECOSISTEMA

El sistema está compuesto por **dos automatizaciones independientes pero integradas** que trabajan en conjunto para gestionar y confirmar los pagos de los tutores de la escuela.

---

### Automatización 1 — Atención al Cliente por WhatsApp (ya existente)

**Propósito:** Es el canal de comunicación directa con los tutores. Gestiona la recepción de comprobantes de pago enviados voluntariamente por WhatsApp y los registra en la base de datos.

**Flujo:**
1. El tutor realiza un pago (transferencia bancaria o MercadoPago) y envía el comprobante por WhatsApp.
2. Chatwoot recibe el mensaje a través de la API Oficial de WhatsApp Business.
3. La automatización en n8n detecta el comprobante, extrae los datos del pago mediante un agente LLM (usando el prompt `promt_pagos`).
4. Le pregunta al tutor a qué alumno corresponde el pago.
5. El tutor responde y la automatización registra el pago completo en la tabla `pagos` con `estado_conciliacion = 'pendiente'`.

**Dato clave que produce:** Un registro en la tabla `pagos` con `comprobante_numerico`, `monto`, `fecha`, `hora` e `imagen_url`. Este registro es consumido por la Automatización 2.

---

### Automatización 2 — Conciliación de Pagos (la que se está construyendo)

**Propósito:** Toma el reporte diario automático de MercadoPago y lo concilia contra la base de datos para determinar a qué tutor y alumno corresponde cada pago. Opera en cascada: si una fase no resuelve el pago, lo pasa a la siguiente.

**Integración con la Automatización 1:** La tabla `pagos` (poblada por la Automatización 1 con los comprobantes de WhatsApp) es usada en la Fase 2 como fuente de verdad para cruzar datos y confirmar pagos del reporte de MP.

**Salida final:** Envía un email a administración con un archivo Excel/XLS que contiene todos los pagos confirmados del período, para que el equipo proceda a la facturación.

---

### Diagrama de integración

```
[Tutor] ──WhatsApp──▶ [Automatización 1: Atención al Cliente]
                                    │
                                    ▼
                            [tabla: pagos]
                          (estado: pendiente)
                                    │
                                    ▼
[MercadoPago] ──reporte diario──▶ [Automatización 2: Conciliación]
                                    │
                          ┌─────────┴──────────┐
                          ▼                    ▼
                    Fase 1: payer_id     Fase 2: cruce con
                    en historial BD      tabla pagos (WA)
                          │                    │
                          └─────────┬──────────┘
                                    ▼
                              Fase 3: metadatos
                              (monto+fecha+hora)
                                    │
                                    ▼
                         Fase 4: reporte semanal MP
                         (nombre completo del pagador)
                                    │
                                    ▼
                      [Email a administración con Excel]
                       (pagos confirmados → facturación)
```

---

## 1. ARQUITECTURA Y STACK TECNOLÓGICO

El ecosistema completo está desplegado sobre una infraestructura contenerizada y autohospedada:

- **Infraestructura & OS:** VPS en Contabo — Ubuntu 24.04 LTS / 8 cores / 24GB RAM / 400GB SSD
- **Orquestación:** Docker Swarm administrado mediante Portainer
- **Core de Automatización:** n8n (Self-Hosted)
- **Base de Datos:** Supabase / PostgreSQL (Self-Hosted)
- **Canal de Comunicación:** Chatwoot integrado con la API Oficial de WhatsApp Business

---

## 2. MODELO DE DATOS — SCHEMA REAL VERIFICADO EN POSTGRESQL

> ⚠️ Este schema fue verificado directamente contra la BD con `information_schema.columns`.
> NO usar el schema anterior — tenía errores.

### Tabla: `alumnos`
| Columna | Tipo | Nullable |
|---|---|---|
| `id` | integer | NO (PK) |
| `numero` | smallint | YES |
| `nombre` | character varying | NO |
| `dni` | character varying | NO |
| `activo` | boolean | YES |
| `curso` | character varying | YES |
| `beca` | numeric | YES |
| `c_bancaria` | character varying | YES |
| `cuota` | integer | YES |
| `deuda` | integer | YES |
| `matricula` | integer | YES |
| `created_at` | timestamp | YES |

### Tabla: `tutores`
| Columna | Tipo | Nullable |
|---|---|---|
| `id` | integer | NO (PK) |
| `telefono` | character varying | YES ← fue alterado a nullable |
| `nombre` | character varying | YES |
| `dni` | character varying | YES |
| `payer_id` | character varying | YES |
| `created_at` | timestamp | YES |

> ⚠️ El campo `chatwoot_id` que figura en el contexto anterior **NO EXISTE** en la BD real.
> El campo `payer_id` es el ID de pagador de MercadoPago, clave para la Fase 1. No figuraba en el contexto anterior.
> `telefono` fue modificado a nullable para permitir creación de tutores sin teléfono (conciliación manual).

### Tabla: `relacion_tutor_alumno`
| Columna | Tipo | Nullable |
|---|---|---|
| `id` | integer | NO (PK) |
| `tutor_id` | integer | NO (FK → tutores.id) |
| `alumno_id` | integer | NO (FK → alumnos.id) |
| `ultimo_pago` | timestamp | YES |

### Tabla: `pagos`
| Columna | Tipo | Nullable |
|---|---|---|
| `id` | integer | NO (PK) |
| `tutor_id` | integer | YES (FK → tutores.id) |
| `alumno_id` | integer | YES (FK → alumnos.id) |
| `monto` | numeric | — |
| `metodo` | character varying | — |
| `fecha` | date | — |
| `hora` | time | — |
| `comprobante_numerico` | character varying | — |
| `comprobante_alfanumerico` | character varying | — |
| `imagen_url` | character varying | — |
| `estado_conciliacion` | character varying | — ('confirmado' / 'pendiente' / 'error_monto') |
| `hora_registro` | timestamp | — |

### Extensiones PostgreSQL instaladas
```sql
-- Ambas instaladas y activas en la instancia de Supabase
CREATE EXTENSION unaccent;   -- elimina tildes para comparación
CREATE EXTENSION pg_trgm;    -- habilita similarity() para fuzzy matching
```

---

## 3. LÓGICA DE CONCILIACIÓN EN CASCADA (Automatización 2)

El flujo principal se ejecuta diariamente con cuatro fases sucesivas. Si una fase confirma el pago, el ciclo termina para ese pago. Si no, pasa a la siguiente fase.

---

### Fase 1 — Validación por `payer_id` (Reporte Diario de MercadoPago)

**Origen del dato:** Reporte automático diario que envía MercadoPago. No incluye el nombre del pagador.

**Lógica:**
- Se extrae el `payer_id` de cada transacción del reporte.
- Se busca ese `payer_id` en la tabla `tutores`.
- Si existe → el tutor ya es conocido → se busca su alumno en `relacion_tutor_alumno` → `estado_conciliacion = 'confirmado'`.
- Si no existe → el pagador es desconocido → pasa a Fase 2.

---

### Fase 2 — Cruce con Tabla de Comprobantes de WhatsApp

**Origen del dato:** La tabla `pagos` poblada por la **Automatización 1**. Los tutores enviaron su comprobante por WhatsApp y la otra automatización ya lo registró con sus metadatos.

**Lógica — dos reglas de coincidencia:**

**Regla A — Coincidencia exacta:**
- Se compara `comprobante_numerico` del reporte MP contra `comprobante_numerico` de la tabla `pagos`.
- Si coinciden número de comprobante Y monto → `'confirmado'`.

**Regla B — Caso hermanos:**
- Si el número de comprobante coincide pero el monto del reporte MP es **mayor** al registrado en WhatsApp → puede ser un pago múltiple (ej. un tutor pagó la cuota de dos hermanos en una sola transferencia).
- El sistema divide el monto total y verifica si coincide con la suma de las cuotas de los alumnos asociados a ese tutor.
- Si cuadra → `'confirmado'` para ambos alumnos.

- Sin ninguna coincidencia → pasa a Fase 3.

---

### Fase 3 — Conciliación por Metadatos Temporales

**Lógica:**
- Se intenta un cruce usando tres variables simultáneas: `monto exacto` + `fecha` + `hora y minuto exacto`.
- Si hay match perfecto en esa ventana de tiempo → `'confirmado'`.
- Sin match → el pago queda sin conciliar y pasa a Fase 4.

---

### Fase 4 — Reporte Semanal de MercadoPago (por nombre del pagador)

**Origen del dato:** Reporte semanal completo que descarga la escuela desde MercadoPago. A diferencia del reporte diario, **este sí incluye el nombre completo del pagador**.

**Lógica:**
- La escuela sube el reporte a Google Drive.
- n8n lo procesa, extrae el nombre del pagador de cada transacción no conciliada.
- Busca ese nombre en la tabla `tutores` usando fuzzy matching (`similarity()` + `unaccent()`).
- Umbral de confianza: score `>= 0.7` → match válido.
- Si encuentra al tutor → resuelve el alumno via `relacion_tutor_alumno` → `'confirmado'`.
- Si no encuentra → queda registrado como excepción para revisión manual.

> Este es el workflow que se está implementando actualmente (ver Sección 5).

---

### Salida final del ciclo completo

Una vez procesadas las cuatro fases, la automatización genera:

1. **Email a administración** con un archivo **Excel/XLS adjunto** que contiene todos los pagos con `estado_conciliacion = 'confirmado'` del período. Este archivo es la base para que el equipo de administración proceda a la **facturación**.
2. **Informe de Excepciones** con los pagos que no pudieron ser conciliados en ninguna fase, para revisión manual.

---

## 4. WORKFLOW: CONCILIACIÓN MANUAL DESDE EXCEL (Fase 4 — IMPLEMENTADO)

### Origen y propósito
Administración revisa el Excel de excepciones, identifica manualmente qué tutor pagó y a qué alumno corresponde. El workflow lee ese Excel, lo procesa y entrena la BD creando relaciones nuevas para que en el futuro la Fase 1 los reconozca automáticamente.

### Formato del Excel de entrada
Las columnas pueden variar entre reportes pero el contenido siempre sigue el mismo orden:

| Versión A | Versión B | Contenido |
|---|---|---|
| `ID` | `REFERENCE_ID` | ID de transacción MP |
| `FECHA` | `RELEASE_DATE` | Fecha del pago |
| `OPERACIÓN` | `TRANSACTION_TYPE` | "Transferencia recibida [Nombre Tutor]" |
| `MONTO` | `MONTO` | Monto total transferido |
| `ALUMNO` | `ALUMNO` | Nombre del alumno |
| `DNI` | `DNI` | DNI del alumno |
| `__EMPTY` | `__EMPTY` | Nombre 2do alumno (solo caso hermanos) |
| `__EMPTY_1` | `__EMPTY_1` | DNI 2do alumno (solo caso hermanos) |

> **Caso hermanos:** Cuando un tutor paga por dos alumnos en una sola transferencia, el segundo alumno aparece en columnas sin header (`__EMPTY`, `__EMPTY_1`). Se detecta verificando `typeof __EMPTY === 'string'`.

### Estructura del Workflow en n8n

```
[Trigger: archivo llega a Google Drive]
         ↓
[Spreadsheet File: convierte filas a JSON]
         ↓
[Code: Normalizar y detectar hermanos]     ← emite 1 ítem por alumno
         ↓
[Loop Over Items]
         ↓
[Supabase SQL: buscar alumno por DNI]
         ↓
    ¿Encontró?
    Sí ──────────────────────────────────────────────────────┐
    No → [Supabase SQL: INSERT alumno nuevo]                 │
              ↓                                              │
              └──────────────────────────────────────────────┤
                                                             ↓
                              [Supabase SQL: buscar tutores relacionados al alumno]
                                           ↓
                              ¿Nombre del Excel coincide?
                              Sí → tutor_id encontrado ✅
                              No ──────────────────────────────────────────────┐
                                                                               ↓
                                           [Supabase SQL: búsqueda global fuzzy por nombre]
                                                           ↓
                                                    ¿Score >= 0.7?
                                                    Sí → usar tutor_id existente ✅
                                                    No → [Supabase SQL: INSERT tutor nuevo]
                                                              ↓
                                                    └─────────────────────────────────────┤
                                                                                          ↓
                                                             [Supabase SQL: INSERT relacion_tutor_alumno]
                                                                          ↓
                                                             [Supabase SQL: UPDATE pagos → confirmado]
```

### Escenarios contemplados
| Alumno | Tutor | Acción |
|---|---|---|
| ✅ Existe | ✅ Ya relacionado | Solo actualizar `pagos` |
| ✅ Existe | ✅ Existe pero no relacionado | Crear relación |
| ✅ Existe | ❌ No existe | Crear tutor + crear relación |
| ❌ No existe | ❌ No existe | Crear alumno + crear tutor + crear relación |

### Code Node — Normalizador de filas

```javascript
const items = $input.all();
const output = [];

// ── Mapa de nombres de columna alternativos ───────────────────────────
const CAMPO = {
  id:        (j) => j["ID"]         ?? j["REFERENCE_ID"],
  fecha:     (j) => j["FECHA"]      ?? j["RELEASE_DATE"],
  operacion: (j) => j["OPERACIÓN"]  ?? j["TRANSACTION_TYPE"],
  monto:     (j) => j["MONTO"],
  alumno:    (j) => j["ALUMNO"],
  dni:       (j) => j["DNI"],
};

for (const item of items) {
  const data = item.json;

  // Extraer y normalizar nombre del tutor
  let tutorNombre = CAMPO.operacion(data) || "";
  tutorNombre = tutorNombre.replace(/^Transferencia recibida\s*/i, "").trim();
  tutorNombre = tutorNombre.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  // Detectar caso hermanos (__EMPTY string = segundo alumno)
  const esHermanos = typeof data["__EMPTY"] === "string";

  // Armar lista de alumnos
  const alumnos = [
    {
      alumno_nombre: (CAMPO.alumno(data) || "").trim(),
      dni_alumno:    String(CAMPO.dni(data)),
    },
  ];

  if (esHermanos) {
    alumnos.push({
      alumno_nombre: String(data["__EMPTY"]).trim(),
      dni_alumno:    String(data["__EMPTY_1"]),
    });
  }

  // Calcular monto por alumno (división entera)
  const montoIndividual = Math.round(CAMPO.monto(data) / alumnos.length);

  // Emitir un ítem por alumno
  for (const alumno of alumnos) {
    output.push({
      json: {
        tutor_nombre:     tutorNombre,
        id_transaccion:   String(CAMPO.id(data)),
        fecha:            CAMPO.fecha(data),
        monto_total:      CAMPO.monto(data),
        monto_individual: montoIndividual,
        es_hermanos:      esHermanos,
        cantidad_alumnos: alumnos.length,
        alumno_nombre:    alumno.alumno_nombre,
        dni_alumno:       alumno.dni_alumno,
      },
    });
  }
}

return output;
```

### SQL — Buscar tutores relacionados al alumno
```sql
SELECT 
  t.id        AS tutor_id,
  t.nombre    AS tutor_nombre,
  t.telefono,
  t.dni       AS tutor_dni,
  t.payer_id
FROM relacion_tutor_alumno rta
JOIN tutores t ON t.id = rta.tutor_id
WHERE rta.alumno_id = {{ $json.id }}
```

### SQL — Búsqueda global fuzzy de tutor
```sql
SELECT 
  id          AS tutor_id,
  nombre      AS tutor_nombre,
  telefono,
  dni         AS tutor_dni,
  payer_id,
  similarity(
    unaccent(upper(nombre)), 
    unaccent(upper('{{ $json.tutor_nombre }}'))
  ) AS score
FROM tutores
WHERE similarity(
    unaccent(upper(nombre)), 
    unaccent(upper('{{ $json.tutor_nombre }}'))
  ) > 0.3
ORDER BY score DESC
LIMIT 1
```

> **Umbral de decisión:** Score `>= 0.7` → match confiable → usar tutor existente. Score `< 0.7` → crear tutor nuevo.

### SQL — INSERT tutor nuevo
```sql
INSERT INTO tutores (nombre, telefono, dni, payer_id)
VALUES (
  '{{ $json.tutor_nombre }}',
  NULL,
  NULL,
  NULL
)
RETURNING id AS tutor_id, nombre AS tutor_nombre
```

### SQL — INSERT relación tutor-alumno
```sql
INSERT INTO relacion_tutor_alumno (tutor_id, alumno_id)
VALUES (
  {{ $json.tutor_id }},
  {{ $('Nombre del nodo busqueda alumno').item.json.id }}
)
ON CONFLICT DO NOTHING
RETURNING id
```

> `ON CONFLICT DO NOTHING` evita duplicados si el workflow se ejecuta dos veces con el mismo Excel.

---

## 5. WORKFLOW: CONCILIACIÓN POR REPORTE MP EN CRUDO (IMPLEMENTADO)

### Propósito
Procesa el reporte de MercadoPago en formato crudo (sin procesar manualmente). El nombre del tutor ya viene extraído en el campo `CREDITS` y se busca directamente en la BD con fuzzy matching.

### SQL — Búsqueda fuzzy de tutor + sus alumnos
```sql
WITH mejor_tutor AS (
  SELECT 
    id,
    nombre,
    telefono,
    dni,
    payer_id,
    similarity(
      unaccent(upper(nombre)),
      unaccent(upper('{{ $('Loop Over Items').item.json.CREDITS }}'))
    ) AS score
  FROM tutores
  WHERE similarity(
      unaccent(upper(nombre)),
      unaccent(upper('{{ $('Loop Over Items').item.json.CREDITS }}'))
    ) > 0.7
  ORDER BY score DESC
  LIMIT 1
)
SELECT
  t.id          AS tutor_id,
  t.nombre      AS nombre_tutor,
  t.telefono,
  t.dni         AS dni_tutor,
  t.payer_id,
  t.score,
  a.id          AS alumno_id,
  a.nombre      AS nombre_alumno,
  a.dni         AS dni_alumno,
  a.curso,
  a.cuota,
  a.deuda,
  a.matricula,
  a.activo,
  r.ultimo_pago
FROM mejor_tutor t
JOIN relacion_tutor_alumno r ON r.tutor_id = t.id
JOIN alumnos a ON a.id = r.alumno_id
ORDER BY r.ultimo_pago DESC
```

### Code Node — Clasificador de resultados
```javascript
const items = $input.all();

// Caso vacío: sin items, item vacío, o respuesta "success: true" de Supabase
const esVacio = 
  items.length === 0 ||
  (items.length === 1 && Object.keys(items[0].json).length === 0) ||
  (items.length === 1 && items[0].json.success === true && Object.keys(items[0].json).length === 1);

if (esVacio) {
  return [{ json: { resultado: "vacio", accion: null, cantidad: 0, data: {} } }];
}

// Agrupar por alumno_id para identificar alumnos únicos del tutor
const alumnosMap = {};
for (const item of items) {
  const alumnoId = item.json.alumno_id;
  if (alumnoId && !alumnosMap[alumnoId]) {
    alumnosMap[alumnoId] = item.json;
  }
}

const alumnosUnicos = Object.values(alumnosMap);
const cantidad = alumnosUnicos.length;

// Datos del tutor (iguales en todas las filas, tomar la primera)
const datosTutor = {
  tutor_id:     items[0].json.tutor_id,
  nombre_tutor: items[0].json.nombre_tutor,
  telefono:     items[0].json.telefono,
  dni_tutor:    items[0].json.dni_tutor,
  payer_id:     items[0].json.payer_id,
  score:        items[0].json.score,
};

// Un solo alumno
if (cantidad === 1) {
  return [{
    json: {
      resultado: "individual",
      accion:    "update",
      cantidad:  1,
      tutor:     datosTutor,
      data:      alumnosUnicos[0],
    }
  }];
}

// Múltiples alumnos → un ítem por alumno
return alumnosUnicos.map((alumno, index) => ({
  json: {
    resultado: "multiple",
    accion:    index === 0 ? "update" : "create",
    cantidad:  cantidad,
    tutor:     datosTutor,
    data:      alumno,
  }
}));
```

### Respuestas posibles del clasificador
| `resultado` | `accion` | Significado |
|---|---|---|
| `"individual"` | `"update"` | Tutor encontrado, un solo alumno |
| `"multiple"` | `"update"` / `"create"` | Tutor encontrado, varios alumnos |
| `"vacio"` | `null` | Tutor no encontrado (score < 0.7 o sin resultado) |

> ⚠️ Supabase devuelve `{ "success": true }` cuando un Execute Query no encuentra filas. El clasificador contempla este caso explícitamente.

---

# TABLA: pagos (PostgreSQL / Supabase Self-Hosted)

## Descripción
Tabla transaccional principal del sistema de conciliación de pagos escolares. Almacena tanto los pagos conciliados automáticamente (Fase 1-3 del workflow) como los registros que provienen del proceso de retroalimentación manual (planilla de excepciones). Es la fuente de datos principal para el dashboard.

## Estructura de columnas

| Columna | Tipo | Nullable | Default | Descripción |
|---|---|---|---|---|
| `id` | integer | NO | `nextval('pagos_id_seq')` | PK autoincremental |
| `tutor_id` | integer | YES | — | FK → `tutores.id` |
| `alumno_id` | integer | YES | — | FK → `alumnos.id` |
| `monto` | numeric | NO | — | Monto reportado por MercadoPago (`monto_mp`) |
| `metodo` | varchar | YES | — | Plataforma de pago (MercadoPago, WhatsApp, etc.) |
| `fecha` | date | YES | — | Fecha de la transacción |
| `hora` | time | YES | — | Hora de la transacción |
| `comprobante_numerico` | varchar | YES | — | Código de comprobante MercadoPago (`codigo_comprobante_mp`) |
| `comprobante_alfanumerico` | varchar | YES | — | Código de comprobante de otros métodos (`codigo_comprovantes_otros`) |
| `imagen_url` | varchar | YES | — | URL del comprobante guardado |
| `estado_conciliacion` | varchar | YES | `'pendiente'` | Estado del proceso de conciliación (ver constraint abajo) |
| `hora_registro` | timestamp | YES | `now()` | Timestamp de inserción del registro |
| `dni_alumno` | text | YES | — | DNI del alumno (columna agregada) |
| `nombre_alumno` | text | YES | — | Nombre completo del alumno (columna agregada) |
| `nombre_pagador` | text | YES | — | Nombre de quien realizó el pago (columna agregada) |
| `monto_cuota` | numeric(12,2) | YES | — | Monto de la cuota esperada, para comparar contra `monto` (columna agregada) |
| `payer_id` | text | YES | — | ID de pagador de MercadoPago, usado en Fase 1 de conciliación automática (columna agregada) |
| `lote_fecha` | date | YES | — | Fecha del lote/reporte de procesamiento (distinta de `fecha`, que es la fecha de la transacción) (columna agregada) |

## Constraint de estado

La columna `estado_conciliacion` está limitada por un `CHECK` constraint (`pagos_estado_conciliacion_check`) a los siguientes valores:

- `pendiente`
- `verificado`
- `no_verificado`
- `verificado_con_advertencia`
- `confirmado`
- `error_monto`
- `sin_conciliar`

> Cualquier inserción con un valor fuera de esta lista será rechazada por PostgreSQL con un error de constraint violation.

## Índices

- `idx_pagos_lote_fecha` → `lote_fecha DESC`
- `idx_pagos_dni_alumno` → `dni_alumno`
- `idx_pagos_payer_id` → `payer_id` (parcial, solo `WHERE payer_id IS NOT NULL`)
- `idx_pagos_estado` → `estado_conciliacion`

## Notas operativas para n8n / PostgREST

- La instancia es **self-hosted** (Docker Swarm vía Portainer), por lo que PostgREST **no recarga el schema automáticamente** al hacer `ALTER TABLE` o `CREATE TABLE`.
- Después de cualquier cambio de schema (nueva columna, nuevo constraint, etc.), es necesario:
  1. Ejecutar `NOTIFY pgrst, 'reload schema';` — esto en la práctica no siempre ha sido suficiente.
  2. Si la columna sigue sin aparecer en el nodo de Supabase en n8n, **reiniciar el servicio de PostgREST** desde Portainer o vía:
     ```bash
     docker service update --force <nombre_servicio_rest>
     ```
- El nodo de n8n (`inserta_registro`, tipo `n8n-nodes-base.supabase`) mapea los campos usando `fieldsUi.fieldValues` con expresiones `{{ $json.campo }}`, traduciendo nombres del JSON de origen a los nombres reales de columna cuando difieren (ej: `monto_mp` → `monto`, `codigo_comprobante_mp` → `comprobante_numerico`).

## Mapeo JSON de origen → columna `pagos`

| Campo en JSON de origen | Columna en `pagos` |
|---|---|
| `dni_alumno` | `dni_alumno` |
| `nombre_alumno` | `nombre_alumno` |
| `nombre_pagador` | `nombre_pagador` |
| `monto_mp` | `monto` |
| `monto_cuota` | `monto_cuota` |
| `codigo_comprobante_mp` | `comprobante_numerico` |
| `codigo_comprovantes_otros` | `comprobante_alfanumerico` |
| `payer_id` | `payer_id` |
| `estado` | `estado_conciliacion` |
| `fecha` | `fecha` |
| `hora` | `hora` |
| `date` / `lote_fecha` | `lote_fecha` |

## Campos descartados del JSON de origen (sin columna correspondiente)

- `id` (es el ID del nodo previo, no de la tabla `pagos`)
- `order`
- `factura`
- `multiple`
- `monto_comprobado`

> Si en el futuro se necesita persistir alguno de estos, requiere un `ALTER TABLE pagos ADD COLUMN ...` adicional.

## 6. REGLAS DE NEGOCIO Y DECISIONES TÉCNICAS

### Fuzzy Matching de nombres
- Se usa `similarity()` de `pg_trgm` combinado con `unaccent()`.
- **Umbral:** `>= 0.7` para considerar match confiable. `< 0.7` → tratar como persona distinta.
- El umbral `0.3` se usa solo como filtro previo en búsquedas donde después se toma el mejor resultado.

### Caso hermanos
- Un tutor paga por dos alumnos en una sola transferencia.
- En el Excel aparecen en la misma fila, el segundo alumno en columnas `__EMPTY` (nombre) y `__EMPTY_1` (DNI).
- Detección: `typeof data["__EMPTY"] === "string"`.
- El monto se divide en partes iguales entre los alumnos. Si los alumnos tienen cuotas distintas (beca), el ajuste se hace consultando `alumnos.cuota`.

### DNI como campo varchar
- `alumnos.dni` es `character varying`, no numérico.
- Al buscar por DNI siempre usar comillas o castear: `WHERE dni = '{{ $json.dni_alumno }}'`.

### Creación de tutores sin teléfono
- Tutores creados por conciliación manual no tienen teléfono disponible.
- Se insertan con `telefono = NULL`.
- El campo fue alterado a nullable: `ALTER TABLE tutores ALTER COLUMN telefono DROP NOT NULL`.

### IDs de transacción en notación científica
- El Excel puede exportar IDs largos en notación científica (ej. `1.62259133961E11`).
- El nodo Spreadsheet File de n8n los resuelve correctamente como enteros al convertir a JSON.
- Siempre castear a String antes de guardar: `String(CAMPO.id(data))`.

---

## 7. QUERY DE DIAGNÓSTICO — SCHEMA REAL

Para verificar el schema real de cualquier tabla en cualquier momento:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('alumnos', 'tutores', 'relacion_tutor_alumno', 'pagos')
ORDER BY table_name, ordinal_position;
```
