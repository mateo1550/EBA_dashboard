# SOP: Agregar Métricas de Consultas y Derivaciones al Dashboard

## 1. Objetivo
Agregar una nueva sección o vista al EBA Analytics Dashboard para visualizar las métricas de consultas y conversaciones gestionadas por el asistente virtual Mateo y el equipo humano, utilizando la tabla `public.data_dashboard` en Supabase.

## 2. Métricas Requeridas
*   **Intención vs. Pago Efectivo**: N° y % de personas que consultaron info relacionada a pagar una deuda/cuota (`pay_consult = true`) frente a la cantidad de pagos que efectivamente ocurrieron (`pay_consult = true` AND `payment_status = 'success'`).
*   **Consultas Totales (Leads vs. Clientes)**: N° y % de consultas totales recibidas, comparando % entre leads (`is_client = false`) y clientes (`is_client = true`).
*   **Resolución de Conversaciones (Mateo vs. Humano)**: N° y % de conversaciones resueltas por la automatización (`resolved_by = 'ai'`) versus derivadas al equipo humano (`resolved_by = 'human'`).
*   **Ranking de Motivos de Derivación**: 
    *   Clasificación general por categoría de transferencia (`transfer_category`): alcance (`scope`), error (`error`), protocolar (`protocol`).
    *   Ranking detallado de los motivos específicos (`transfer_reason` y `topic`).
*   **Ranking de Temas Consultados**: Ranking de temas (`topic`) predominantes por los que consultan a Mateo con cantidad exacta.
*   **Tiempo de Respuesta y Volumen por Departamento**:
    *   Cantidad de personas recibidas por departamento (basado en la tabla `seguimiento_tiempos_respuesta`).
    *   Tiempo promedio de primera respuesta por departamento (en minutos, promediando `tiempo_respuesta_minutos`).
    *   Departamentos oficiales: 'Dirección', 'Secretaría', 'Administración', 'Preceptoría', 'Reclamos y Quejas', 'Ventas'.

## 3. Arquitectura de Implementación
1.  **Capa de Datos (`src/hooks/useChatMetrics.ts`)**:
    *   Expandir el hook para consultar en paralelo la tabla `seguimiento_tiempos_respuesta`.
    *   Filtrar los registros por la columna `derivado_en` dentro del mes seleccionado.
    *   Agrupar por `departamento` y calcular:
        *   Total de derivaciones por departamento.
        *   Tiempo promedio de respuesta (excluyendo registros con `tiempo_respuesta_minutos` nulo y limitando valores negativos a 0).
2.  **Interfaz de Usuario (`src/App.tsx` y Componentes)**:
    *   Reestructurar la disposición principal para usar un diseño de aplicación web con un panel lateral izquierdo (sidebar) y un área de contenido principal a la derecha.
    *   **Panel Lateral Izquierdo (Sidebar)**:
        *   Ancho fijo (ej. 260px a 280px), de altura completa (`min-h-screen`), fondo blanco (`bg-card`), borde divisorio tenue a la derecha.
        *   Logotipo y título en la cabecera: "Educacional Buenos Aires" y logo escolar.
        *   Categorías de navegación en mayúsculas pequeñas y tenues.
        *   **Secciones Desbloqueadas** (navegación activa):
            *   'Métricas de pagos' (Activa/Seleccionable, icono Lucide `Wallet` o `DollarSign`).
            *   'Atención al cliente' (Activa/Seleccionable, icono Lucide `MessageSquare` o `Bot`).
        *   **Secciones de Expansión/Futuras** (bloqueadas, opacidad reducida, cursor no-allowed, icono de candado `Lock` a la derecha):
            *   'Gestión interna' (icono Lucide `Users` o `Settings`).
            *   'Marketing y ads' (icono Lucide `Megaphone` o `TrendingUp`).
            *   'Cobranza' (icono Lucide `Receipt` o `CreditCard`).
    *   **Área de Contenido (Derecha)**:
        *   Fondo general de la aplicación (`bg-background`).
        *   Cabecera de sección: Título principal (ej. "Métricas de Pagos"), descripción secundaria y el selector de periodo/mes posicionado arriba a la derecha.
        *   Contenido dinámico basado en la sección seleccionada en el sidebar.
    *   Seguir la guía de estilo de `dashboard_blueprint.md` (tipografías Space Grotesk/Manrope, colores coordinados, bordes redondeados `rounded-2xl`, sombras sutiles y transiciones hover).
    *   Implementar estados de carga con `<Skeleton />` idénticos a los contenedores finales.

## 4. Restricciones y Casos Borde
*   **Campos Nullables**: Ciertas columnas como `is_client`, `payment_status` o `transfer_category` pueden contener `null`. El código debe tolerar y agrupar adecuadamente los valores nulos (ej. clasificar en la UI como "No definido" o "Sin clasificar").
*   **Tiempos de Respuesta Inválidos**: Si `tiempo_respuesta_minutos` es negativo debido a desfases horarios, se debe normalizar a 0 en el cálculo del promedio. Si es `null` (caso de chats no respondidos aún), se debe ignorar en el cálculo del promedio.
*   **Casteo de Fechas**: Comparar `started_at` y `derivado_en` correctamente convirtiendo los objetos de fecha de JS o formateando el rango en el string ISO que acepta PostgreSQL.
*   **Base de Datos Self-Hosted**: No intentar modificar el schema de la BD desde el código.
