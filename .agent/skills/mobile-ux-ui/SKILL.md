---
name: mobile-ux-ui
description: Traduce diseños de Figma a código Flutter. Implementa un sistema de diseño limpio, saludable y minimalista basado en tarjetas ligeras, tipografía premium y botones de llamada a la acción (CTAs) de color verde.
---

# Habilidad: Diseño de Interfaz Móvil (mobile-ux-ui)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Crear, diseñar o modificar vistas/pantallas de Flutter en `aloec_mobile`.
- Definir el tema visual global de la aplicación (`ThemeData`, colores, fuentes, espaciados).
- Implementar widgets interactivos para interactuar con datos (IMC, recetas, planes).
- Diseñar y estandarizar el comportamiento de tarjetas, listados y botones de llamada a la acción (CTAs).
- Configurar estados de UI como: pantalla de carga (`loading`), pantalla sin datos (`empty state`), y pantallas de error.

## 💡 Qué Problema Resuelve
Evita inconsistencias visuales en la app, interfaces saturadas que afecten la experiencia del usuario, falta de adaptación a diferentes resoluciones móviles, botones poco visibles y estados de error/carga descuidados que generen frustración en el usuario de dietas de jugos verdes.

## 🛠️ Qué Decisiones Puede Tomar
- Diseñar un sistema de colores basado en tonos "saludables" (verdes orgánicos, fondos blancos o grises muy claros y tipografía oscura nítida).
- Utilizar esquemas de "tarjetas ligeras" (tarjetas con bordes redondeados suaves, sombras sutiles y fondo blanco puro sobre fondo grisáceo).
- Establecer fuentes legibles y modernas como Inter, Roboto o Outfit desde Google Fonts.
- Definir el tamaño y grosor de los botones CTA verdes de alta conversión.
- Elegir micro-animaciones (ej: transiciones de carga suaves o transiciones de cálculo del IMC) para mejorar el engagement.

## 📂 Qué Archivos Puede Tocará
- Definición de estilos y colores: `aloec_mobile/lib/src/theme/` (ej: `app_theme.dart`, `app_colors.dart`)
- Widgets y componentes de diseño reutilizables: `aloec_mobile/lib/src/common_widgets/`
- Pantallas individuales (Presentation): dentro de `aloec_mobile/lib/src/features/[feature]/presentation/`
- Configuración de assets/iconos: `aloec_mobile/pubspec.yaml` y directorio `aloec_mobile/assets/`

## 📦 Qué Entregables Debe Producir
- Sistema de temas de Flutter (`AppTheme`) configurado con modo claro/oscuro (priorizando claro saludable).
- Tarjetas reutilizables para visualización de recetas de jugos verdes (`JuiceCard`) y planes de dieta (`PlanCard`).
- Botón verde de CTA reutilizable (`PrimaryGreenButton`).
- Flujo de interacción visual para la calculadora de IMC con feedback inmediato del rango de salud.

## 🚫 Qué NO Debe Hacer
- **No** debe usar colores saturados no saludables (rojos agresivos, azules eléctricos, morados oscuros) como acento principal. El acento principal debe ser verde orgánico/saludable.
- **No** debe crear layouts rígidos con tamaños fijos (ej: usar `MediaQuery` o `Sizer` para evitar desbordamientos de texto en pantallas pequeñas).
- **No** debe omitir los estados de carga o error en los formularios de IMC o visualización de recetas.
- **No** debe usar imágenes pesadas no optimizadas como assets locales.

## ✅ Checklist de Calidad
- [ ] ¿Los botones de acción clave (CTAs) usan el color verde saludable especificado y tienen suficiente contraste?
- [ ] ¿Las tarjetas del panel de control tienen sombras sutiles (soft-shadows) y un aspecto ligero y minimalista?
- [ ] ¿Se ajusta la interfaz correctamente al cambiar el tamaño de fuente en los ajustes de accesibilidad del teléfono?
- [ ] ¿Las pantallas de recetas y planes manejan de forma fluida el scroll y las transiciones?
- [ ] ¿Se utiliza un cargador visual (Shimmer o CircularProgressIndicator verde) durante la carga de videocursos?
