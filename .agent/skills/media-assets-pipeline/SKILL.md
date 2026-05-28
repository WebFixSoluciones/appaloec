---
name: media-assets-pipeline
description: Administra la subida, compresión, optimización y distribución eficiente de videocursos promocionales, assets visuales e imágenes de recetas de jugos verdes en móvil y web.
---

# Habilidad: Optimización y Entrega de Contenidos Multimedia (media-assets-pipeline)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Configurar el almacenamiento de videos en Firebase Storage o servicios externos (ej: Cloudflare Stream, Vimeo, YouTube).
- Implementar la reproducción de videocursos en la app móvil (Flutter) o en la web (Next.js).
- Optimizar el rendimiento de la transmisión de video (evitar buffering largo y consumo alto de datos).
- Comprimir y optimizar imágenes de jugos verdes para asegurar una carga rápida.
- Diseñar la estructura de carpetas de almacenamiento (`Storage folders`) y las políticas de caché de recursos.

## 💡 Qué Problema Resuelve
Previene el buffering lento de videos en la aplicación móvil que daña la experiencia, evita altos costos de facturación por transferencia de datos en Firebase Storage, y reduce el tiempo de carga visual inicial tanto de la web como del catálogo de jugos de la app móvil.

## 🛠️ Qué Decisiones Puede Tomar
- Definir el códec de video estándar (se recomienda H.264/AAC en contenedor MP4) y resoluciones estándar (720p / 1080p optimizado para móviles).
- Elegir e implementar reproductores de video adaptativos con soporte de caché local en Flutter (ej: `cached_video_player` o `video_player` con wrapper).
- Configurar políticas de caché HTTP (`Cache-Control`) para recursos multimedia públicos en Firebase Storage.
- Determinar cuándo usar streaming de tasa de bits adaptativa (HLS) en lugar de descarga directa de archivos MP4.
- Definir la compresión de imágenes al formato WebP para reducir el tamaño de recetas y planes.

## 📂 Qué Archivos Puede Tocará
- Configuración de reglas de Firebase Storage: `aloec_backend/storage.rules`
- Integración de dependencias de video: `aloec_mobile/pubspec.yaml`
- Widgets de reproducción en móvil: dentro de `aloec_mobile/lib/src/features/video_courses/presentation/`
- Componentes de video e imágenes en Next.js: dentro de `aloec_admin/src/components/`

## 📦 Qué Entregables Debe Producir
- Guía de especificaciones de codificación para videocursos (bitrate, formato, resolución).
- Widget de Flutter `CachedVideoPlayerView` listo para reproducción de videos promocionales offline/online.
- Componente de Next.js optimizado para reproducir videos adaptables.
- Script o manual para compresión de imágenes WebP antes de subirlas al panel administrativo.

## 🚫 Qué NO Debe Hacer
- **No** debe permitir la subida de videos en formato bruto sin comprimir (ej: archivos `.mov` de 500MB+ grabados directamente de cámara).
- **No** debe descargar el video completo antes de iniciar la reproducción; debe utilizar streaming progresivo o almacenamiento en caché adaptativo.
- **No** debe usar imágenes PNG o JPEG pesadas como fondos de pantalla o imágenes de portada de recetas.

## ✅ Checklist de Calidad
- [ ] ¿Los videos están optimizados a un bitrate menor a 1500 kbps y resolución máxima de 720p para visualización en dispositivos móviles?
- [ ] ¿El reproductor móvil de Flutter almacena en caché local los videos de corta duración para evitar descargas duplicadas?
- [ ] ¿Las imágenes del catálogo de recetas y planes están en formato `.webp` y pesan menos de 150 KB cada una?
- [ ] ¿Las reglas de Firebase Storage restringen la subida de archivos de video pesados únicamente a usuarios con rol de administrador?
- [ ] ¿El componente de video en Next.js incluye atributos para deshabilitar descargas y soporta reproducción responsiva?
