# Bottom Navigation Redesign — Wellness Premium

---

## 1. Rationale: Por que Protocolo es el centro de la app

ALOEC no es una app de recetas, ni una calculadora de IMC, ni una plataforma de cursos. ALOEC es un **companero terapeutico diario**. El usuario abre la app para responder una sola pregunta: **"Que me toca ahora?"**

Todo lo demas orbita alrededor de esa pregunta:

```
                    ┌─────────────┐
           ┌───────│  PROTOCOLO  │───────┐
           │       │   (diario)  │       │
           │       └──────┬──────┘       │
           │              │              │
     ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼──────┐
     │  Recetas   │  │ Progreso  │  │  Perfil   │
     │ (como)     │  │ (cuanto)  │  │ (quien)   │
     └───────────┘  └───────────┘  └───────────┘
           │              │              │
     Detalle de      IMC (una vez)    Cursos
     ingredientes    Adherencia       Suscripcion
     Preparacion     Historial        Configuracion
```

**Protocolo** responde "que hacer". **Recetas** responde "como hacerlo". **Progreso** responde "como voy". **Perfil** es mantenimiento. Esta jerarquia refleja la frecuencia de uso real:

| Accion | Frecuencia | Ubicacion actual | Ubicacion nueva |
|--------|-----------|------------------|-----------------|
| Ver que toca ahora | 5-8 veces/dia | Horario (tab 1) | **Protocolo** (tab 1) |
| Consultar receta | 1-3 veces/dia | Jugos (tab 2) | **Recetas** (tab 2) |
| Ver avance semanal | 1-2 veces/semana | No existe | **Progreso** (tab 3) |
| Calcular IMC | 1 vez (al inicio) | IMC (tab 3) | Dentro de Progreso |
| Ver cursos | Ocasional | Cursos (tab 4) | Dentro de Perfil > Recursos |
| Gestionar cuenta | Rara vez | Perfil (tab 5) | **Perfil** (tab 4) |

El bottom nav actual trata un uso de 1 vez (IMC) igual que un uso de 8 veces diarias (protocolo). Eso es un error de arquitectura de informacion. Este rediseno lo corrige.

---

## 2. Arquitectura de informacion

### 2.1 Estructura de navegacion completa

```
Bottom Nav
├── Tab 1: PROTOCOLO ─── Pantalla principal
│   ├── Header: fecha + nombre del protocolo
│   ├── Barra de progreso diario
│   ├── Lista de bloques del dia
│   │   ├── Desayuno (08:00)
│   │   ├── Media manana (10:00)
│   │   ├── Almuerzo (13:00)
│   │   ├── Media tarde (15:00)
│   │   ├── Cena (18:00)
│   │   ├── Suplementos (B12, Selenio, Enzimas)
│   │   ├── Actividades (Caminata, Enema)
│   │   └── Notas importantes
│   └── FAB: "Completar" (solo visible aqui)
│
├── Tab 2: RECETAS
│   ├── Buscador
│   ├── Filtros: Jugos verdes | Comidas | Suplementos
│   └── Grid/lista de recetas con detalle
│
├── Tab 3: PROGRESO
│   ├── Resumen semanal de adherencia
│   ├── Grafico de completitud por dia
│   ├── Calculadora IMC (acceso secundario)
│   └── Historial de IMC
│
└── Tab 4: PERFIL
    ├── Datos personales
    ├── Suscripcion / Premium
    ├── Recursos educativos (Cursos Gerson)
    ├── Notificaciones
    ├── Ayuda
    └── Cerrar sesion
```

### 2.2 Que sale del bottom nav y por que

| Elemento | Antes | Despues | Motivo |
|----------|-------|---------|--------|
| **Horario** | Tab 1 independiente | Fusionado en Protocolo | El horario ES el protocolo. Eran dos nombres para lo mismo |
| **Jugos** | Tab 2 limitado | Renombrado a Recetas | "Jugos" excluia comidas y suplementos. "Recetas" es mas amplio |
| **IMC** | Tab 3 prominente | Dentro de Progreso | Herramienta de una sola vez. No necesita acceso primario |
| **Cursos** | Tab 4 prominente | Dentro de Perfil > Recursos | Contenido educativo complementario. Uso ocasional |
| **5 tabs** | Navegacion plana | 4 tabs jerarquizados | 5 tabs causan ruido visual. 4 es el sweet spot para mobile |

### 2.3 Principios de diseno aplicados

1. **Frecuencia determina prominencia** — lo que se usa 8 veces/dia va en tab 1; lo que se usa 1 vez va enterrado
2. **Una accion por pantalla** — Protocolo muestra la agenda, no intenta ser tambien calculadora o biblioteca
3. **Progressive disclosure** — IMC y Cursos siguen accesibles, pero a 1 tap de profundidad, no en la superficie
4. **Mobile thumb zone** — 4 tabs caben comodos en el thumb zone inferior; 5 los aprieta

---

## 3. Bottom Navigation Bar — Estructura y especificaciones

### 3.1 Anatomia del componente

```
╭───────────────────────────────────────────╮  ← borderRadius top 24px
│                                           │
│  ┌──────────┐                             │
│  │ ● Proto. │    ○         ○        ○     │  ← 80px alto
│  │  colo    │  Recetas  Progreso  Perfil  │
│  └──────────┘                             │  ← pill activa
│                                           │
╰───────────────────────────────────────────╯
     ▲ active        ▲ inactive tabs
     pill bg         icons: outlined 22px
     green 12%       labels: 11px grey
```

### 3.2 Especificaciones del contenedor

| Propiedad | Valor |
|-----------|-------|
| Widget | Custom `StatelessWidget` (no `NavigationBar` nativo) |
| Fondo | `#FFFFFF` solido |
| Esquinas superiores | `BorderRadius.vertical(top: Radius.circular(24))` |
| Sombra | `BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 20, offset: Offset(0, -4))` |
| Altura contenido | 80px |
| Padding inferior | `MediaQuery.of(context).padding.bottom` (safe area) |
| Padding horizontal | 8px |
| Layout interno | `Row` con 4 `Expanded` children |

### 3.3 Tab activo — Pill indicator

| Propiedad | Valor |
|-----------|-------|
| Contenedor | `AnimatedContainer`, 250ms, `Curves.easeInOut` |
| Fondo pill | `Color(0xFF2E7D32).withValues(alpha: 0.12)` |
| Border radius pill | 20px |
| Padding pill | horizontal 16px, vertical 8px |
| Icono | Variante **filled**, 24px, `Color(0xFF2E7D32)` |
| Label | 12px, `FontWeight.w700`, `Color(0xFF2E7D32)` |
| Transicion icono | `AnimatedCrossFade` outlined → filled, 250ms |

### 3.4 Tab inactivo

| Propiedad | Valor |
|-----------|-------|
| Icono | Variante **outlined**, 22px, `Color(0xFF9E9E9E)` |
| Label | 11px, `FontWeight.w500`, `Color(0xFF9E9E9E)` |
| Touch target | Minimo 48x48px |
| Padding vertical | 12px top, 8px bottom |
| Feedback | `InkWell` con splash `primaryGreen` al 8% |

### 3.5 Iconografia por tab

| Tab | Outlined (inactivo) | Filled (activo) |
|-----|---------------------|-----------------|
| Protocolo | `Icons.medical_services_outlined` | `Icons.medical_services` |
| Recetas | `Icons.restaurant_menu_outlined` | `Icons.restaurant_menu` |
| Progreso | `Icons.insights_outlined` | `Icons.insights` |
| Perfil | `Icons.person_outline` | `Icons.person` |

---

## 4. Comportamiento del FAB

### 4.1 Diseno visual

```
         ╭──────────────────────╮
         │  ✓  Completar        │  ← FAB pill
         ╰──────────────────────╯
              ↑ 12px gap
╭───────────────────────────────────╮
│  ● Proto.   ○ Rec.  ○ Prog  ○ P │  ← Bottom nav
╰───────────────────────────────────╯
```

| Propiedad | Valor |
|-----------|-------|
| Tipo | `FloatingActionButton.extended` |
| Forma | Pill — `borderRadius: 24` |
| Altura | 48px |
| Fondo | `Color(0xFF2E7D32)` solido |
| Icono | `Icons.check_circle_outline`, 20px, blanco |
| Texto | "Completar", 14px, `FontWeight.w700`, blanco |
| Sombra | `BoxShadow(color: Color(0xFF2E7D32).withValues(alpha: 0.35), blurRadius: 16, offset: Offset(0, 6))` |
| Posicion | `FloatingActionButtonLocation.centerFloat` |
| Margen inferior | 12px sobre el borde superior del bottom nav |

### 4.2 Comportamiento contextual

| Contexto | Comportamiento |
|----------|---------------|
| Tab Protocolo activo | FAB **visible** con animacion de entrada |
| Cualquier otro tab | FAB **oculto** con animacion de salida |
| Tap | Marca el proximo bloque pendiente como completado |
| Long press | Abre `ModalBottomSheet` con lista de todos los bloques para seleccion manual |
| Sin protocolo activo | FAB oculto, se muestra empty state |
| Todos los bloques completados | FAB cambia a icono `celebration` + texto "Completado" + color dorado |

### 4.3 Animaciones del FAB

| Animacion | Implementacion | Duracion |
|-----------|---------------|----------|
| Entrada (aparecer) | `SlideTransition` Y: 80→0 + `FadeTransition` 0→1 | 200ms ease |
| Salida (ocultar) | `SlideTransition` Y: 0→80 + `FadeTransition` 1→0 | 200ms ease |
| Tap feedback | `ScaleTransition` 1.0→0.95→1.0 + `HapticFeedback.mediumImpact` | 150ms |

---

## 5. Jerarquia visual de la pantalla principal (Protocolo del dia)

### 5.1 Layout completo

```
┌─────────────────────────────────────────┐
│  ◂                            ⚙        │  ← AppBar
│  Hoy, 20 junio                         │     titulo dinamico
│  Protocolo Peso Normal                  │     subtitulo gris
├─────────────────────────────────────────┤
│  ████████████░░░░░░░  3 de 8 completados│  ← Progress bar
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ✓  08:00                        │    │  ← Bloque COMPLETADO
│  │    Desayuno                     │    │     fondo verde 5%
│  │    1. Jugo verde                │    │     check verde
│  │    2. Pan integral              │    │     texto opacity 0.7
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ✓  10:00                        │    │  ← Bloque COMPLETADO
│  │    Media manana                 │    │
│  │    1. Jugo de zanahoria         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌═════════════════════════════════┐    │
│  ║ ◉  13:00                       ║    │  ← Bloque ACTUAL
│  ║    Almuerzo              ★     ║    │     borde verde 2px
│  ║    1. Ensalada Gerson          ║    │     elevacion 4px
│  ║    2. Sopa de verduras         ║    │     icono pulsante
│  ║    3. Jugo de remolacha        ║    │     auto-scroll aqui
│  ║                                ║    │
│  ║    [Ver receta completa →]     ║    │
│  ┗═════════════════════════════════┛    │
│                                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│  │ ○  15:00                        │    │  ← Bloque PENDIENTE
│     Media tarde                    │    │     borde gris
│  │ 1. Jugo de remolacha           │    │     circulo vacio
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│  │ ○  18:00                        │    │  ← Bloque PENDIENTE
│     Cena                           │    │
│  │ 1. Sopa de verduras            │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                         │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│  │ ○  Suplementos                  │    │  ← Bloque PENDIENTE
│     B12, Selenio, Enzimas          │    │     (sin hora fija)
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                         │
│  ┌─ ⚠ ────────────────────────────┐    │
│  │ ⏰ Notas importantes            │    │  ← Bloque ESPECIAL
│  │    - Enema de cafe a las 11:00  │    │     fondo ambar 5%
│  │    - Caminata 30 min           │    │     icono warning
│  └─────────────────────────────────┘    │
│                                         │
│           [  ✓ Completar  ]             │  ← FAB flotante
│                                         │
├─────────────────────────────────────────┤
│  ● Proto.   ○ Rec.  ○ Prog.  ○ Perfil  │  ← Bottom nav
└─────────────────────────────────────────┘
```

### 5.2 Jerarquia de pesos visuales

```
Peso 1 (maximo)  →  Bloque ACTUAL (borde, elevacion, glow)
Peso 2           →  FAB "Completar" (color solido, sombra)
Peso 3           →  Progress bar (color, posicion fija)
Peso 4           →  Bloques PENDIENTES (neutros, listos para accion)
Peso 5           →  Bloques COMPLETADOS (atenuados, tachados)
Peso 6 (minimo)  →  Bottom nav (sutil, no compite)
```

El diseno garantiza que **la mirada va al bloque actual primero**, luego al FAB, luego a la progress bar. El bottom nav queda visualmente subordinado.

### 5.3 Composicion del AppBar

| Elemento | Especificacion |
|----------|---------------|
| Titulo linea 1 | "Hoy, 20 junio" — 18px, `FontWeight.w700`, `textDark` |
| Titulo linea 2 | "Protocolo Peso Normal" — 13px, `FontWeight.w500`, `textLight` |
| Fecha | Dinamica con `intl` DateFormat: `"d 'de' MMMM"`, locale `es` |
| Accion trailing | `Icons.tune_outlined` 24px — abre filtro/config del protocolo |
| Fondo | `backgroundLight` (`#F9FBFA`), sin elevacion |

### 5.4 Composicion de la barra de progreso

| Elemento | Especificacion |
|----------|---------------|
| Tipo | `ClipRRect` + `AnimatedFractionallySizedBox` |
| Track (fondo) | `primaryGreen` al 12%, altura 6px, `borderRadius: 3` |
| Barra (progreso) | `primaryGreen` solido, misma altura |
| Texto derecho | "3 de 8 completados" — 12px, `textLight` |
| Animacion | `TweenAnimationBuilder<double>` fraction, 400ms, `Curves.easeOut` |
| Padding | horizontal 20px, vertical 12px |

---

## 6. Estados de bloques del protocolo

### 6.1 Tabla de estados completa

| Estado | Condicion | Borde | Fondo | Icono | Texto | Time badge | Acento izquierdo |
|--------|-----------|-------|-------|-------|-------|------------|------------------|
| **Completado** | Marcado por el usuario | `Color(0xFF388E3C)` al 30%, 1px | `Color(0xFF388E3C)` al 5% | `check_circle` 22px `#388E3C` | Normal, `opacity: 0.7` | Pill verde 10% | 3px `#388E3C` al 40% |
| **En progreso** (actual) | Bloque cuya hora ya paso pero no fue completado, o el proximo pendiente | `Color(0xFF2E7D32)` solido, 2px | `#FFFFFF`, elevation 4 | `radio_button_checked` 22px `#2E7D32`, pulsante | `FontWeight.w700` | Pill verde 15%, glow | 3px `#2E7D32` solido |
| **Pendiente** | Bloques futuros sin completar | `Color(0xFFE0E0E0)` 1px | `#FFFFFF` | `radio_button_unchecked` 22px `#BDBDBD` | Normal, `textDark` | Pill gris `#F5F5F5` | Ninguno |
| **Atrasado** | La hora del bloque ya paso y no fue completado (excepto el actual) | `Color(0xFFF57C00)` al 50%, 1.5px | `#FFF3E0` | `schedule` 22px `#F57C00` | Normal, `textDark` | Pill naranja `#FFF3E0` | 3px `#F57C00` al 60% |

### 6.2 Logica de asignacion de estado

```
para cada bloque en protocolo.schedule:
  si bloque.completado == true:
    estado = COMPLETADO
  si no:
    si bloque == proximoPendiente:
      estado = EN_PROGRESO  (actual)
    si no, si bloque.hora < horaActual:
      estado = ATRASADO
    si no:
      estado = PENDIENTE
```

El bloque "actual" (en progreso) es siempre **el primer bloque no completado**, independientemente de la hora. Si el usuario se atrasa en desayuno pero completa almuerzo, desayuno sigue como "actual".

### 6.3 Transiciones entre estados

| Transicion | Trigger | Animacion |
|------------|---------|-----------|
| Pendiente → En progreso | Hora del bloque llega, o bloque anterior se completa | Border crece 1px→2px (200ms), fondo se eleva (shadow fade-in 300ms) |
| En progreso → Completado | Usuario toca FAB o tap en el bloque | Check icon `ScaleTransition` 0→1 (300ms elasticOut), fondo fade a verde 5% (200ms), `HapticFeedback.mediumImpact` |
| Pendiente → Atrasado | Hora del bloque pasa sin completar | Border color tween gris→naranja (400ms), fondo tween blanco→ambar (400ms) |
| Atrasado → Completado | Usuario completa bloque atrasado | Misma animacion que En progreso → Completado |

### 6.4 Composicion visual del bloque (card)

```
┌─────────────────────────────────────────┐
│ ▎  ┌────────┐                           │
│ ▎  │ 08:00  │  Desayuno          ✓ / ○  │  ← time badge + titulo + icono estado
│ ▎  └────────┘                           │
│ ▎                                       │
│ ▎  1. Jugo verde de apio               │  ← items numerados
│ ▎  2. Pan integral con aguacate        │
│ ▎  3. Te de hierbas                    │
│ ▎                                       │
│ ▎  🥤 Ver receta →                     │  ← link a detalle (si tiene receta)
│ ▎                                       │
│ ▎  💊 Suplementos: Vitamina C          │  ← suplementos (si aplica)
└─────────────────────────────────────────┘
  ▲
  acento izquierdo (3px, color segun estado)
```

| Elemento | Especificacion |
|----------|---------------|
| Card container | `borderRadius: 16`, margin bottom 12px, padding 16px |
| Time badge | Pill `borderRadius: 10`, padding h:10 v:6, 11px bold |
| Titulo | 15px, `FontWeight.w700`, `textDark` |
| Items | 13px, `textMedium`, height 1.6, numerados |
| Link receta | 13px, `primaryGreen`, `FontWeight.w600`, con icono |
| Icono estado | 22px, alineado top-right del card |
| Acento izquierdo | `Container` 3px width, full height, `borderRadius` left |
| Tap action | Expande/colapsa detalle con `AnimatedCrossFade` |

---

## 7. Propuesta mobile-first en Material 3

### 7.1 Decisiones M3 adoptadas

| Aspecto | Decision | Motivo |
|---------|----------|--------|
| **NavigationBar** | Custom widget, NO el nativo M3 | Necesitamos pill indicator y border-radius que M3 nativo no soporta facilmente |
| **ColorScheme** | `fromSeed(seedColor: primaryGreen)` existente | Aprovechamos el tema M3 que ya esta configurado |
| **Elevation** | Usamos sombras difusas (no `elevation` de Material) | Sombras suaves se ven mas premium que las sombras duras de M3 |
| **Shape** | `borderRadius: 16-24` en todo | Coherente con M3 pero con radios mas generosos (wellness feel) |
| **Typography** | System font (no Google Fonts aun) | Rendimiento. Google Fonts se puede agregar despues |
| **Icons** | Material Symbols outlined/filled | Iconografia nativa M3, sin dependencias extra |
| **Surfaces** | Blanco puro para cards, `backgroundLight` para scaffold | Contraste limpio sin el surface tinting de M3 |
| **Touch feedback** | `InkWell` con splash verde al 8% | Feedback sutil, no intrusivo |

### 7.2 Tokens de diseno aplicados

```dart
// Spacing
const kNavBarHeight = 80.0;
const kNavBarRadius = 24.0;
const kCardRadius = 16.0;
const kPillRadius = 20.0;
const kBlockSpacing = 12.0;
const kScreenPadding = 20.0;

// Timing
const kTabAnimDuration = Duration(milliseconds: 250);
const kFabAnimDuration = Duration(milliseconds: 200);
const kCheckAnimDuration = Duration(milliseconds: 300);
const kProgressAnimDuration = Duration(milliseconds: 400);
const kGlowCycleDuration = Duration(seconds: 2);

// Opacities
const kActivePillOpacity = 0.12;
const kCompletedBgOpacity = 0.05;
const kCompletedBorderOpacity = 0.30;
const kCompletedTextOpacity = 0.70;
const kShadowOpacity = 0.08;
const kFabShadowOpacity = 0.35;
```

### 7.3 Responsive considerations

| Pantalla | Adaptacion |
|----------|-----------|
| < 360px width | Labels del nav se reducen a 10px. Pills se comprimen. |
| 360-414px (mayoria Android) | Diseno base. Todo cabe comodo. |
| > 414px (tablets, phablets) | Max-width 428px centrado. Padding lateral crece. |
| Landscape | Bottom nav se mantiene. Cards se distribuyen en 2 columnas (futuro). |

---

## 8. Estructura de archivos

```
lib/
├── core/
│   └── widgets/
│       ├── aloec_bottom_nav.dart          # NUEVO — bottom nav custom con pill
│       └── aloec_fab.dart                 # NUEVO — FAB contextual con animaciones
│
├── features/
│   ├── protocol/                          # NUEVO — pantalla principal
│   │   ├── domain/
│   │   │   └── protocol_block.dart        # Modelo de bloque + enum de estados
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── protocol_day_screen.dart  # Vista agenda del dia
│   │       └── widgets/
│   │           ├── protocol_block_card.dart   # Card individual con 4 estados
│   │           └── protocol_progress_bar.dart # Barra de progreso animada
│   │
│   ├── progress/                          # NUEVO — contenedor de Progreso
│   │   └── presentation/screens/
│   │       └── progress_screen.dart       # IMC embebido + stats adherencia
│   │
│   ├── home/
│   │   └── presentation/screens/
│   │       └── home_screen.dart           # MODIFICADO — 4 tabs, nuevo nav, FAB
│   │
│   ├── juices/                            # EXISTENTE — renombrado conceptualmente
│   │   └── (se mantiene, titulos de UI cambian a "Recetas")
│   │
│   ├── bmi/                               # EXISTENTE — accedido desde Progreso
│   │   └── (se mantiene intacto)
│   │
│   ├── courses/                           # EXISTENTE — accedido desde Perfil
│   │   └── (se mantiene intacto)
│   │
│   └── profile/                           # EXISTENTE — gana seccion Recursos
│       └── (se agrega enlace a Cursos/Recursos)
│
├── core/router/
│   └── app_router.dart                    # MODIFICADO — ajustar rutas
```

### Archivos nuevos (6)

| Archivo | Responsabilidad |
|---------|----------------|
| `aloec_bottom_nav.dart` | Widget custom: pill indicator, animaciones, 4 tabs |
| `aloec_fab.dart` | FAB extended con show/hide contextual |
| `protocol_block.dart` | `ProtocolBlock` model + `BlockState` enum |
| `protocol_day_screen.dart` | Pantalla principal: AppBar, progress, lista de bloques |
| `protocol_block_card.dart` | Card con 4 estados visuales y transiciones |
| `protocol_progress_bar.dart` | Barra lineal animada con contador |
| `progress_screen.dart` | Contenedor que embebe IMC + estadisticas |

### Archivos modificados (2)

| Archivo | Cambio |
|---------|--------|
| `home_screen.dart` | Reemplazar `NavigationBar` por `AloecBottomNav`, reducir a 4 tabs, integrar FAB |
| `app_router.dart` | Actualizar rutas: `/bmi-calculator` accedido desde Progreso, no como tab directo |

---

## 9. Microinteracciones

| Interaccion | Implementacion Flutter | Duracion | Curva |
|-------------|----------------------|----------|-------|
| Cambio de tab (pill) | `AnimatedContainer` width + color | 250ms | `easeInOut` |
| Cambio de tab (icono) | `AnimatedCrossFade` outlined↔filled | 250ms | `easeInOut` |
| FAB aparece | `SlideTransition` Y + `FadeTransition` | 200ms | `easeOut` |
| FAB desaparece | `SlideTransition` Y + `FadeTransition` | 200ms | `easeIn` |
| Completar bloque | `ScaleTransition` check icon + `HapticFeedback.mediumImpact` | 300ms | `elasticOut` |
| Progress bar avanza | `TweenAnimationBuilder<double>` | 400ms | `easeOut` |
| Glow bloque actual | `AnimationController.repeat(reverse: true)` border opacity | 2000ms | `easeInOut` |
| Auto-scroll al actual | `Scrollable.ensureVisible` | 500ms | `easeInOut` |
| Expand/collapse bloque | `AnimatedCrossFade` contenido | 300ms | `easeInOut` |

---

## 10. Accesibilidad

| Requisito | Implementacion |
|-----------|---------------|
| Touch targets | Minimo 48x48px en todos los elementos interactivos |
| Contraste | Texto `#212121` sobre blanco = 15.5:1 (supera WCAG AAA) |
| Estado activo | Comunicado via color + forma (pill) + icono (outlined→filled) |
| Screen reader | `Semantics` labels en cada tab: "Protocolo, seleccionado" |
| Haptic | `HapticFeedback.mediumImpact` al completar bloque |
| Estados de bloque | Color + icono + texto (nunca solo color) |

---

## 11. Verificacion

1. `flutter analyze` — cero errores
2. `flutter build apk --release` — build exitoso
3. Navegar las 4 tabs — pill se anima correctamente
4. FAB visible solo en Protocolo, oculto en las demas
5. 4 estados de bloque se renderizan con datos mock
6. Auto-scroll al bloque actual funciona
7. Pantalla 360px width — sin overflow en el nav
8. TalkBack anuncia correctamente todos los tabs y estados
9. Completar bloque produce haptic feedback + animacion
10. Progress bar se actualiza al completar
