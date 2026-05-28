---
name: localization-i18n
description: Centraliza y gestiona la internacionalización (i18n) y localización en español e inglés. Garantiza que la app móvil, el panel web y la base de datos Firestore presenten contenidos traducidos uniformemente.
---

# Habilidad: Internacionalización y Localización (localization-i18n)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Configurar el soporte de idiomas (localización) en el proyecto móvil `aloec_mobile` o web `aloec_admin`.
- Traducir textos de la interfaz de usuario (mensajes, títulos de botones, alertas, menús).
- Diseñar la estructura de colecciones de Firestore para almacenar datos bilingües de recetas de jugos y planes.
- Cambiar dinámicamente el idioma de la aplicación basándose en la configuración del dispositivo o en la preferencia del perfil de usuario.
- Formatear monedas, fechas y unidades de medida (sistema métrico vs. imperial) de acuerdo al idioma del usuario.

## 💡 Qué Problema Resuelve
Evita la mezcla aleatoria de idiomas en la pantalla (código "spanglish"), previene inconsistencias donde el catálogo de recetas de jugos se muestra en español pero los botones de acción en inglés, y elimina la necesidad de duplicar registros de base de datos para dar soporte a cada idioma.

## 🛠️ Qué Decisiones Puede Tomar
- Utilizar archivos de recursos de traducción Dart estandarizados (archivos `.arb` con generador automático de código de Flutter) para la app móvil.
- Implementar **`next-intl`** o middleware de Next.js para administrar rutas internacionales en el panel web administrativo (ej: `/es` y `/en`).
- Adoptar la estructura bilingüe `{ es: 'Texto en Español', en: 'Text in English' }` para campos dinámicos de jugos verdes, planes y videocursos en Firestore.
- Detectar automáticamente el idioma del sistema operativo al abrir la app por primera vez.

## 📂 Qué Archivos Puede Tocará
- Archivos de traducción en Flutter: `aloec_mobile/lib/l10n/app_es.arb` y `aloec_mobile/lib/l10n/app_en.arb`
- Configuración de generación de código l10n: `aloec_mobile/l10n.yaml`
- Archivo de traducción en Next.js: dentro de `aloec_admin/messages/es.json` y `aloec_admin/messages/en.json`
- Configuración del enrutamiento de idiomas: `aloec_admin/src/middleware.ts` y `aloec_admin/src/i18n.ts`
- Modelos de datos en el cliente/servidor: `shared-context.md` y clases de parseo de modelos.

## 📦 Qué Entregables Debe Producir
- Archivos base `.arb` de Flutter cargados con los textos comunes del cálculo de IMC y recetas.
- Configuración de `next-intl` lista en Next.js con archivos JSON de traducción para inglés y español.
- Clases mapeadoras (mappers/adapters) en Dart y TypeScript que simplifiquen la lectura del campo `{ es, en }` de Firestore basándose en el idioma activo del usuario.

## 🚫 Qué NO Debe Hacer
- **No** debe hardcodear textos visibles del usuario directamente en el código fuente de los widgets o páginas (`Text('Calcular IMC')`). Todos los textos deben llamar a la instancia de traducción (`context.l10n.calcularImc` o `t('calcularImc')`).
- **No** debe duplicar las colecciones de la base de datos (ej: no crear una colección `juices_es` y otra `juices_en`). La traducción de datos dinámicos debe estructurarse dentro del mismo documento.
- **No** debe omitir la traducción de textos de validación de formularios ni mensajes de error.

## ✅ Checklist de Calidad
- [ ] ¿Están todos los textos de la interfaz de usuario extraídos a archivos de traducción (`.arb` y JSON) sin texto en plano en los componentes?
- [ ] ¿La base de datos Firestore y las clases del cliente respetan el esquema bilingüe definido en `shared-context.md`?
- [ ] ¿Se adapta la interfaz sin romper el diseño (sin desbordamientos de texto) cuando se cambia de español a inglés (dado que el inglés suele ocupar menos espacio que el español)?
- [ ] ¿Los formatos de números (ej: separadores de miles y decimales) e IMC cambian de acuerdo a la configuración regional?
- [ ] ¿El idioma por defecto coincide con la preferencia detectada del navegador o sistema operativo del usuario?
