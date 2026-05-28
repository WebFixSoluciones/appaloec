---
name: android-adaptive
description: Garantiza la adaptabilidad del cliente móvil en dispositivos Android, tabletas, diferentes relaciones de aspecto, orientaciones de pantalla y apego a las directrices de Material Design 3.
---

# Habilidad: Adaptabilidad Android (android-adaptive)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Optimizar la experiencia visual de la app móvil en dispositivos de pantalla grande (tabletas, Chromebooks, dispositivos plegables).
- Solucionar problemas de desbordamiento de pantalla (`overflow`) o diseño rígido en pantallas Android pequeñas o con muescas (notches).
- Controlar la orientación de la pantalla (bloqueo en vertical para ciertas vistas, o soporte horizontal para reproducción de videocursos).
- Implementar estructuras de grilla dinámica y layouts adaptativos (`LayoutBuilder`, `OrientationBuilder`).
- Garantizar que la app siga los lineamientos y patrones de Material Design 3 en el ecosistema Android.

## 💡 Qué Problema Resuelve
Evita que la aplicación se visualice desproporcionada en tabletas (por ejemplo, botones gigantescos o textos estirados), previene caídas por desbordamiento de pixeles en pantallas pequeñas y asegura que los videocursos puedan verse cómodamente a pantalla completa en modo horizontal.

## 🛠️ Qué Decisiones Puede Tomar
- Decidir cuándo cambiar el diseño de una sola columna a un diseño de doble columna (master-detail) al detectar pantallas de ancho >= 600dp (tabletas).
- Implementar menús laterales de navegación (`NavigationRail` o `NavigationDrawer`) en pantallas grandes en lugar de la barra de navegación inferior (`NavigationBar`).
- Habilitar el cambio automático de orientación a modo horizontal únicamente en la pantalla de reproducción de videocursos promocionales.
- Utilizar grillas responsivas (`SliverGrid` con número de columnas variable) para mostrar el catálogo de jugos verdes.

## 📂 Qué Archivos Puede Tocará
- Estructura de vistas adaptables: dentro de `aloec_mobile/lib/src/features/[feature]/presentation/widgets/`
- Configuración de manifiesto de Android (orientaciones, tamaños): `aloec_mobile/android/app/src/main/AndroidManifest.xml`
- Temas y personalización adaptativa: `aloec_mobile/lib/src/theme/app_theme.dart`

## 📦 Qué Entregables Debe Producir
- Widget de diseño adaptable (`AdaptiveLayoutBuilder`) que exponga breakpoints consistentes.
- Vista de catálogo de jugos verdes adaptable a grilla de 1, 2 o 3 columnas según el ancho del dispositivo.
- Contenedor de reproducción de video responsivo que detecte orientación horizontal y entre en modo de pantalla completa nativo en Android.

## 🚫 Qué NO Debe Hacer
- **No** debe forzar el modo vertical en toda la aplicación si esto impide que los videocursos se consuman en pantalla completa en modo horizontal.
- **No** debe usar valores de tamaño fijos en pixeles (`width: 400`, `height: 800`) para componentes principales de pantalla.
- **No** debe ignorar la zona segura del dispositivo (`SafeArea`), provocando que elementos clave se oculten bajo la cámara o botones del sistema.

## ✅ Checklist de Calidad
- [ ] ¿La interfaz pasa los test visuales en tabletas (ancho de pantalla >= 600dp) sin estiramientos exagerados?
- [ ] ¿Se utiliza `SafeArea` en todas las pantallas principales para respetar muescas y barras de navegación del sistema?
- [ ] ¿El reproductor de videocursos cambia a pantalla completa y bloquea la orientación horizontal de forma automática al activarse?
- [ ] ¿Los textos y botones de las tarjetas ligeras de IMC se ajustan sin cortarse en pantallas con resolución baja (ej: pantallas de 4 pulgadas)?
- [ ] ¿Se utiliza una grilla adaptable para las recetas de jugos en lugar de una lista vertical infinita en pantallas anchas?
