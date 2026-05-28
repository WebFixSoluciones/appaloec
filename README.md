# ALOEC - Sistema Integrado de Dieta de Jugos Verdes

¡Bienvenido al espacio de trabajo de **ALOEC**! Este es un sistema multiplataforma diseñado para ayudar a los usuarios a mejorar su salud y bienestar a través de planes de alimentación estructurados basados en jugos verdes, cálculo y seguimiento del Índice de Masa Corporal (IMC), horarios de consumo personalizados y acceso a videocursos promocionales y educativos.

El ecosistema de desarrollo está estructurado como un monorepo multicarpetas que incluye una aplicación móvil nativa (Android/iOS), un backend en la nube (Firebase) y un panel administrativo web de gestión (Next.js/Vercel).

---

## 📂 Estructura del Workspace

El espacio de trabajo se organiza de la siguiente manera:

* **[.agent/skills/](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills)**: Carpeta que contiene las definiciones de habilidades de Antigravity que guían la toma de decisiones, estándares de calidad y límites del desarrollo.
* **[aloec_mobile/](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile)**: Código fuente de la aplicación móvil desarrollada con **Flutter**.
* **[aloec_admin/](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin)**: Código fuente del panel administrativo web desarrollado con **Next.js** y optimizado para **Vercel**.
* **[aloec_backend/](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_backend)**: Reglas de base de datos, funciones en la nube (Cloud Functions) y archivos de configuración del backend de **Firebase**.
* **[shared-context.md](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/shared-context.md)**: El modelo de datos unificado y reglas de negocio del sistema que comparten el backend, la web y la aplicación móvil.

---

## 🛠️ Stack Tecnológico Integrado

* **Frontend Móvil**: Flutter (Dart) con soporte responsivo y adaptativo.
* **Backend y Base de Datos**: Firebase (Auth, Firestore, Cloud Storage, Cloud Messaging, Crashlytics, Analytics).
* **Frontend Web Admin**: Next.js (TypeScript, React) desplegado en Vercel.
* **Lógica i18n**: Soporte nativo y consistente para Español e Inglés.
* **Estilo Visual**: Limpio, saludable, minimalista, tarjetas ligeras y CTAs verdes (salud/bienestar).

---

## 🧠 Habilidades del Agente (.agent/skills)

Este workspace está gobernado por habilidades de desarrollo especializadas para asegurar la coherencia del software. Puedes consultar las guías de cada rol en sus respectivos archivos:

1. 📱 [Flutter Architecture](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/flutter-architecture/SKILL.md) — Estructura de carpetas, Clean Architecture, gestión de estados y navegación.
2. 🔥 [Firebase Backend](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/firebase-backend/SKILL.md) — Base de datos NoSQL, autenticación, almacenamiento, mensajería y Crashlytics.
3. 🎨 [Mobile UX/UI](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/mobile-ux-ui/SKILL.md) — Estilos visuales (limpio, saludable, CTAs verdes) y traducción de Figma a código Flutter.
4. 🤖 [Android Adaptive](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/android-adaptive/SKILL.md) — Adaptabilidad a múltiples tamaños de pantalla y tabletas en Android.
5. 🖥️ [App Admin Web](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/app-admin-web/SKILL.md) — Dashboard administrativo web construido con Next.js y Vercel.
6. 🧪 [QA & Release](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/qa-release/SKILL.md) — Pruebas unitarias, análisis de rendimiento y publicación en las tiendas.
7. 📋 [Product Scope](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/product-scope/SKILL.md) — Definición de prioridades, roadmap del MVP de jugos verdes y control de cambios.
8. 📹 [Media Assets Pipeline](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/media-assets-pipeline/SKILL.md) — Gestión, optimización y distribución fluida de videocursos promocionales.
9. 🌐 [Localization & i18n](file:///E:/CLOUD%20WEBFIX/WEBFIX/SISTEMAS/appaloec/.agent/skills/localization-i18n/SKILL.md) — Centralización y sincronización de recursos bilingües.
