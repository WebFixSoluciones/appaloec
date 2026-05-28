---
name: firebase-backend
description: Gestiona la integración con los servicios de Firebase, configuraciones locales, reglas de seguridad de Firestore y Storage, Cloud Functions, notificaciones push (FCM) y analíticas de ALOEC.
---

# Habilidad: Integración Firebase (firebase-backend)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Configurar o inicializar los servicios de Firebase en `aloec_backend`.
- Modificar reglas de seguridad de Firestore (`firestore.rules`) o Storage (`storage.rules`).
- Crear, actualizar o desplegar Cloud Functions para lógica de negocio del servidor.
- Configurar Firebase Authentication (métodos de inicio de sesión: email/password, social).
- Configurar Cloud Messaging (FCM) para el envío de alertas de horarios de alimentación.
- Integrar o revisar reportes de Firebase Crashlytics o métricas en Firebase Analytics.

## 💡 Qué Problema Resuelve
Asegura que los datos del usuario estén protegidos con reglas de seguridad estrictas, previene la fuga de información sensible, gestiona de forma óptima los flujos en segundo plano (notificaciones y scripts del lado del servidor) y provee diagnósticos confiables de errores de la app.

## 🛠️ Qué Decisiones Puede Tomar
- Estructurar el esquema de colecciones y subcolecciones de Firestore siguiendo buenas prácticas NoSQL (desnormalización versus subcolecciones).
- Definir políticas de lectura/escritura basadas en el rol y autenticación del usuario.
- Determinar cuándo una operación debe realizarse localmente en el cliente o mediante una Cloud Function (ej: cálculos pesados, integraciones de pago).
- Estructurar el formato y payload de las notificaciones push enviadas mediante FCM.
- Configurar filtros de exclusión e informes personalizados de error en Crashlytics.

## 📂 Qué Archivos Puede Tocará
- Configuración de Firebase: `aloec_backend/firebase.json` y `aloec_backend/.firebaserc`
- Reglas de base de datos: `aloec_backend/firestore.rules` y `aloec_backend/firestore.indexes.json`
- Reglas de archivos: `aloec_backend/storage.rules`
- Código de Cloud Functions: `aloec_backend/functions/` (archivos TypeScript/JavaScript)
- Archivos de configuración de apps móviles: `aloec_mobile/android/app/google-services.json` y `aloec_mobile/ios/Runner/GoogleService-Info.plist`

## 📦 Qué Entregables Debe Producir
- Archivos `firestore.rules` y `storage.rules` listos para producción con protección a nivel de usuario (`request.auth.uid`).
- Cloud Functions configuradas para procesar notificaciones de horarios u optimizaciones de IMC.
- Índices compuestos optimizados en `firestore.indexes.json` para búsquedas en planes y jugos.

## 🚫 Qué NO Debe Hacer
- **No** debe dejar las reglas de Firestore o Storage con permisos de lectura/escritura abiertos a todo el público (`allow read, write: if true;`).
- **No** debe almacenar contraseñas, API keys de terceros o información extremadamente sensible en texto plano en la base de datos sin encriptar o proteger.
- **No** debe disparar Cloud Functions infinitas (bucles de escritura/lectura recursivos).
- **No** debe usar nombres de colecciones inconsistentes con `shared-context.md`.

## ✅ Checklist de Calidad
- [ ] ¿Están todas las reglas de Firestore validadas para requerir autenticación (`request.auth != null`) excepto en catálogos públicos?
- [ ] ¿El envío de tokens de FCM está encriptado o viaja a través de HTTPS seguro?
- [ ] ¿Se han configurado índices compuestos para todas las consultas que involucren filtros complejos en Firestore?
- [ ] ¿Las funciones de Firebase manejan bloques `try-catch` y registran los errores correctamente en Firebase Crashlytics?
- [ ] ¿Se configuró la inicialización bilingüe de plantillas de correo en Firebase Auth?
