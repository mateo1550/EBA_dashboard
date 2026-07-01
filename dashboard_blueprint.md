# Blueprint de Estilo y Arquitectura: Dashboard Analítico

Este documento define las bases estéticas, de componentes y arquitectónicas para replicar el Dashboard en cualquier otro proyecto (independientemente de la base de datos o empresa) manteniendo exactamente el mismo nivel visual, UX y presentación de información.

---

## 1. Stack Tecnológico Base
Para lograr la misma fidelidad visual y de desarrollo, el proyecto debe inicializarse con el siguiente ecosistema:

- **Framework:** React (Vite) + TypeScript.
- **Estilos:** Tailwind CSS.
- **Componentes Base:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI bajo el capó para accesibilidad y Tooltips, Dropdowns, etc.).
- **Gráficos:** Recharts.
- **Iconografía:** Lucide React.
- **Manejo de Estado/Fetching:** React Query (o SWR) encapsulado en Custom Hooks.

---

## 2. Tipografía (El Alma del Diseño)
El diseño respira modernidad gracias a la combinación de dos fuentes geométricas y limpias de Google Fonts. Deben importarse en el CSS principal:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
```

- **Fuente Display (Títulos, Valores KPI, Logos):** `Space Grotesk` (`font-display`). Da un aspecto técnico y moderno a los números grandes.
- **Fuente Body (Textos secundarios, labels, tooltips):** `Manrope` (`font-body`). Altamente legible en tamaños pequeños.

---

## 3. Paleta de Colores (Variables CSS)
El estilo utiliza un tema claro por defecto con un fondo ligeramente grisáceo para que las tarjetas blancas resalten mediante sombras sutiles.

**Definiciones clave en el `index.css` (formato HSL):**
- **Background General:** `hsl(210, 14%, 96%)` - Gris muy claro, evita la fatiga visual.
- **Tarjetas (Card):** `hsl(0, 0%, 100%)` - Blanco puro.
- **Foreground (Texto principal):** `hsl(220, 26%, 14%)` - Gris muy oscuro/pizarra (casi negro pero más suave).
- **Primary:** `hsl(214, 100%, 55%)` - Azul vibrante principal.
- **Muted (Texto secundario):** `hsl(215, 14%, 46%)`.
- **Acentos Específicos (Hardcoded en componentes):**
  - Naranja para métricas de pérdida: `#e67700`
  - Cian para métricas de Inteligencia Artificial: `#4DD0E1`
  - Azul suave para Humanos: `#64B5F6`

---

## 4. Construcción de Tarjetas (Cards)
El secreto de la estética limpia reside en cómo están estructuradas las tarjetas contenedoras.

**Clases base de Tailwind utilizadas en casi toda tarjeta:**
```html
<div className="bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col justify-between">
  <!-- Contenido -->
</div>
```

**Análisis de los estilos:**
- **Bordes muy redondeados:** `rounded-2xl` (1rem / 16px).
- **Sombras dinámicas:** `shadow-sm` por defecto que pasa a `shadow-md` al hacer hover, dándole vida y respuesta a la interfaz (`transition-shadow duration-300`).
- **Bordes tenues (Opcional en algunas tarjetas mayores):** `border border-border/50`.

### Elementos Internos de la Tarjeta (KPI Base)
1. **Header del KPI:** Un texto pequeño (`text-sm text-muted-foreground font-body`) acompañado de un icono de "Información" (Tooltip) arriba a la derecha.
2. **Valor Numérico:** Tamaño enorme y tipografía Display (`text-4xl font-display font-bold tracking-tight text-foreground mt-4`).
3. **Gráficos decorativos:** Se incluye un pequeño "Sparkline" (línea de gráfico SVG) semitransparente (`opacity-20`) anclado en la parte inferior derecha para dar sensación analítica, aunque sea puramente decorativo o con pocos datos.

### Tarjetas Complejas (Ej. Resumen de Derivaciones)
- **Efecto de Marca de Agua:** Utiliza iconos enormes de Lucide en posición absoluta, desbordando un poco la tarjeta y con opacidad casi invisible (`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity`).
- **Agrupación Visual:** Uso intensivo de fondos de contraste ligeros para métricas totales (`bg-secondary/50 px-4 py-2 rounded-xl`).

---

## 5. Disposición y Layout (Grid)
El Dashboard asume que es una sola pantalla ancha sin scroll excesivo en la medida de lo posible, estructurada con CSS Grid responsivo.

1. **Header Principal:**
   - Altura fija, borde inferior tenue (`border-b border-border/50`).
   - Muestra el Logo, el título y un selector de "Periodo/Fecha" (Dropdown nativo minimalista).
2. **Grid de Desktop (`xl:block`):**
   - **Fila 1 (KPIs pequeños):** Grid de 5 columnas (`grid-cols-5 gap-4`).
   - **Fila 2 (Gráficos grandes):** Grid de 4 columnas (`grid-cols-4 gap-4`).
3. **Grid de Móvil/Tablet (`xl:hidden`):**
   - Se colapsa a 1 o 2 columnas (`md:grid-cols-2`), apilando los gráficos primero o los KPIs en cascada.

---

## 6. Presentación de la Información (Gráficos)
- **Donut Charts (Recharts):** 
  - Extremadamente limpios, sin leyendas externas ruidosas.
  - La información más vital va en el **centro hueco** del Donut (Ej: Número total grande + label "recibidos").
- **Tablas de Datos:**
  - Se utiliza una barra de desplazamiento (Scrollbar) personalizada y delgada por CSS para no ensuciar el diseño (`.thin-scrollbar`).

---

## 7. Infraestructura y Patrón de Datos (Arquitectura)
Para replicarlo apuntando a otra base de datos (Postgres, Supabase, etc.), se debe seguir esta estructura limpia separando responsabilidades:

1. **La Capa de UI NO hace Fetching directo:**
   - La UI solo consume Custom Hooks.
2. **El Patrón del Hook:**
   - Debe envolver la petición real a la DB usando `@tanstack/react-query`.
   - Devuelve 3 cosas esenciales: `data`, `isLoading`, `error`.
   - **Loading States:** Mientras `isLoading` es true, la UI pinta esqueletos de carga (`<Skeleton className="h-32 w-full rounded-2xl" />`) manteniendo exactamente la forma y tamaño de la tarjeta final para evitar saltos bruscos en el DOM.
3. **La Capa de Base de Datos:**
   - No importa si el nuevo proyecto usa un cliente de Postgres nativo, Prisma o Supabase. La lógica de agregación (sumar leads, calcular promedios) debe suceder idealmente del lado de la base de datos (mediante Vistas SQL o RPCs) o en el Custom Hook de capa intermedia, **nunca ensuciando los componentes visuales**. 
   - El componente visual solo debe recibir un objeto plano y precalculado.

## Resumen de Ejecución para un Nuevo Proyecto
1. Instalar Vite + React + TS.
2. Añadir Tailwind y Shadcn UI.
3. Pegar las variables CSS y los imports de fuentes (`Space Grotesk` y `Manrope`).
4. Recrear el `<KPICard />` con `rounded-2xl shadow-sm hover:shadow-md`.
5. Construir un Custom Hook que apunte a la nueva base de datos y formatee los datos para la UI.
