---
name: qa-release
description: Controla la estrategia de testing, optimización de rendimiento, aseguramiento de la calidad visual/funcional y el flujo de publicación y distribución de las apps móviles y web.
---

# Habilidad: Control de Calidad y Publicación (qa-release)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Configurar, escribir o ejecutar pruebas automatizadas (pruebas unitarias, de integración o E2E) en Flutter o Next.js.
- Optimizar el tamaño de las compilaciones (builds) y el rendimiento en ejecución (evitar jank de UI, optimizar renderizados de listas).
- Preparar los paquetes de publicación para tiendas móviles (`.aab` para Android, `.ipa` para iOS).
- Ejecutar el checklist de prerrequisitos de publicación de la Google Play Store o Apple App Store.
- Validar la consistencia visual y de internacionalización en múltiples dispositivos antes del lanzamiento.

## 💡 Qué Problema Resuelve
Evita el lanzamiento de versiones de la app con bugs críticos, tamaños de descarga excesivos que ahuyenten al usuario, bloqueos por configuraciones incorrectas en las tiendas móviles, y fallos de rendimiento que afecten negativamente las métricas en Firebase Crashlytics.

## 🛠️ Qué Decisiones Puede Tomar
- Definir el umbral mínimo de cobertura de pruebas unitarias (se sugiere 70% para lógica de negocio en la capa Domain/Data).
- Decidir qué flujos críticos del usuario deben probarse mediante pruebas de integración (ej: registro de usuario, cálculo de IMC, inicio de un plan de jugos).
- Determinar si una compilación cumple con los estándares mínimos para subirse a canales de prueba abiertos/cerrados (TestFlight / Google Play Console Internal Sharing).
- Habilitar e interpretar los perfiles de rendimiento de Flutter (DevTools Performance/CPU Profiler).

## 📂 Qué Archivos Puede Tocará
- Configuración de pruebas: `aloec_mobile/test/` y `aloec_admin/__tests__/`
- Configuración de build de Android: `aloec_mobile/android/app/build.gradle` y `aloec_mobile/android/key.properties`
- Configuración de build de iOS: `aloec_mobile/ios/Runner.xcodeproj/project.pbxproj`
- Archivo de metadata de publicación: `aloec_mobile/pubspec.yaml` (versión de la app: `version: 1.0.0+1`)

## 📦 Qué Entregables Debe Producir
- Suite de pruebas unitarias para el validador de cálculos de IMC y mapeadores de idioma.
- Archivo de configuración para firma de aplicaciones en Android (`key.properties` y Keystore).
- Checklists de QA firmados listos para validar cada nueva versión ("Release Candidate").

## 🚫 Qué NO Debe Hacer
- **No** debe publicar builds de producción firmados con llaves de desarrollo (debug keys).
- **No** debe ignorar los warnings persistentes del compilador de Flutter o TypeScript durante el proceso de build.
- **No** debe subir la app a producción si hay reportes pendientes de errores fatales no solucionados en Firebase Crashlytics.
- **No** debe omitir la optimización y minificación de código (`flutter build appbundle --release`).

## ✅ Checklist de Calidad
- [ ] ¿Pasan todas las pruebas unitarias y de integración del proyecto móvil (`flutter test`) y panel web?
- [ ] ¿El paquete de Android se compila en formato App Bundle (`.aab`) para optimizar el tamaño de descarga del usuario?
- [ ] ¿Se han actualizado de forma consistente las versiones del código en `pubspec.yaml` (ej: pasar de `1.0.0+1` a `1.0.1+2`)?
- [ ] ¿Se verificó que los videocursos no generen fugas de memoria (`memory leaks`) al reproducirse repetidamente en dispositivos reales?
- [ ] ¿Están cargados todos los recursos de traducción (español e inglés) para la metadata de las tiendas (descripciones, capturas, títulos)?
