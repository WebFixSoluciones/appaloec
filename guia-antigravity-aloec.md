# Guía de ejecución para ALOEC con Antigravity CLI 2.0 + Flutter + Firebase

## Objetivo

Este documento define el proceso recomendado para construir **ALOEC** usando Antigravity CLI 2.0, Antigravity IDE 2.0, Flutter y Firebase, con una estrategia por fases y prompts preparados para ejecutarse en modo `/goal`.

## Stack decidido

- Frontend móvil: Flutter
- IDE asistido: Antigravity IDE 2.0
- Orquestación con IA: Antigravity CLI 2.0
- Backend: Firebase
- Base de datos principal: Cloud Firestore
- Autenticación: Firebase Authentication
- Archivos: Firebase Storage
- Notificaciones: Firebase Cloud Messaging
- Analytics: Firebase Analytics
- Crash reporting: Firebase Crashlytics
- Hosting web administrativo o landing: Vercel

## Arquitectura recomendada

### App móvil

La app móvil debe construirse en Flutter con arquitectura por módulos:

- `auth`
- `profile`
- `bmi`
- `plans`
- `juices`
- `courses`
- `subscriptions`
- `notifications`
- `settings`

### Backend Firebase

Usar Firebase como BaaS para acelerar el MVP:

- **Auth** para registro/login con email, Google y Apple
- **Firestore** para usuarios, perfiles, planes, jugos, cursos, progreso y suscripciones
- **Storage** para imágenes, miniaturas, PDFs y assets
- **Cloud Functions** para lógica sensible, webhooks y automatizaciones
- **FCM** para recordatorios de dieta, jugos y cursos

### Panel administrativo

No construir el admin en Flutter móvil. La recomendación es:

- Admin web en Next.js
- Despliegue en Vercel
- Firebase Admin SDK para operaciones seguras del lado servidor
- Roles: `super_admin`, `admin`, `editor_content`, `support`

## Fases del proyecto

### Fase 0: Preparación

1. Crear repositorio GitHub.
2. Crear proyecto Flutter.
3. Crear proyecto Firebase.
4. Conectar Android e iOS a Firebase.
5. Configurar flavors o entornos: `dev`, `staging`, `prod`.
6. Definir estructura de carpetas.
7. Configurar CI básico.

### Fase 1: Base técnica

1. Configurar navegación con `go_router`.
2. Configurar estado con Riverpod o Bloc.
3. Crear design system en Flutter a partir de Figma.
4. Implementar tema claro/oscuro si aplica.
5. Implementar internacionalización ES/EN.
6. Configurar capa core: errores, logger, constantes, environment.

### Fase 2: Autenticación y perfil

1. Splash.
2. Onboarding.
3. Login.
4. Registro.
5. Recuperación de contraseña.
6. Perfil editable.
7. Persistencia de sesión.

### Fase 3: Núcleo ALOEC

1. Calculadora de IMC.
2. Resultado y recomendación.
3. Acceso a programa de dieta.
4. Listado de jugos.
5. Detalle de jugos.
6. Horarios de jugos.

### Fase 4: Videocursos

1. Catálogo de cursos.
2. Detalle del curso.
3. Lecciones.
4. Reproductor.
5. Progreso.
6. Estado gratis/premium.
7. Recomendaciones relacionadas con dieta y jugos.

### Fase 5: Monetización

1. Pantallas premium.
2. Checkout.
3. Suscripción o pago único.
4. Validación de acceso a contenido.
5. Historial de compra.

### Fase 6: Calidad y publicación

1. Tests.
2. QA manual.
3. Firebase Analytics.
4. Crashlytics.
5. Build Android.
6. Build iOS.
7. Publicación en stores.

## Estructura de Firestore sugerida

### Colecciones

- `users`
- `profiles`
- `bmi_records`
- `diet_plans`
- `juices`
- `juice_schedules`
- `courses`
- `course_lessons`
- `course_progress`
- `subscriptions`
- `payments`
- `banners`
- `notifications`

### Ejemplo de documentos

#### `users/{uid}`

- `email`
- `displayName`
- `photoUrl`
- `role`
- `language`
- `createdAt`
- `isPremium`

#### `courses/{courseId}`

- `title`
- `slug`
- `description`
- `thumbnailUrl`
- `isPremium`
- `isPublished`
- `durationMinutes`
- `level`
- `tags`
- `createdAt`

#### `course_lessons/{lessonId}`

- `courseId`
- `title`
- `videoUrl`
- `orderIndex`
- `durationSeconds`
- `isPreview`

## Estructura Flutter sugerida

```text
lib/
  core/
    config/
    constants/
    errors/
    router/
    services/
    theme/
    utils/
    widgets/
  features/
    auth/
      data/
      domain/
      presentation/
    profile/
      data/
      domain/
      presentation/
    bmi/
      data/
      domain/
      presentation/
    plans/
      data/
      domain/
      presentation/
    juices/
      data/
      domain/
      presentation/
    courses/
      data/
      domain/
      presentation/
    subscriptions/
      data/
      domain/
      presentation/
    notifications/
      data/
      domain/
      presentation/
main.dart
```

## Dependencias sugeridas

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  firebase_core: ^latest
  firebase_auth: ^latest
  cloud_firestore: ^latest
  firebase_storage: ^latest
  firebase_messaging: ^latest
  firebase_analytics: ^latest
  firebase_crashlytics: ^latest
  google_sign_in: ^latest
  sign_in_with_apple: ^latest
  flutter_riverpod: ^latest
  go_router: ^latest
  freezed_annotation: ^latest
  json_annotation: ^latest
  intl: ^latest
  video_player: ^latest
  chewie: ^latest
  cached_network_image: ^latest
  flutter_dotenv: ^latest
```

## Proceso de trabajo con Antigravity en modo `/goal`

### Regla principal

No pedir a la IA que genere toda la app de una sola vez. El flujo correcto es:

1. Definir objetivo.
2. Limitar alcance.
3. Dar contexto técnico.
4. Pedir entregables concretos.
5. Revisar resultado.
6. Ejecutar siguiente goal.

### Prompt maestro inicial

```text
/goal
Quiero construir una app móvil llamada ALOEC con Flutter y Firebase.

Contexto funcional:
- La app actual incluye onboarding, login, registro, recuperación de contraseña, perfil, calculadora de IMC, acceso premium, pago, horario de jugos, listado de jugos y detalle de jugos.
- Además necesito un módulo de videocursos promocionales y educativos sobre dieta con jugos verdes.
- La app debe soportar español e inglés.
- El diseño visual debe respetar el Figma existente: estilo limpio, saludable, minimalista, con CTAs verdes y tarjetas ligeras.

Stack obligatorio:
- Flutter
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Messaging
- Firebase Analytics
- Firebase Crashlytics
- Arquitectura limpia por features
- Riverpod
- go_router

Objetivo de esta fase:
Quiero que definas la arquitectura base del proyecto y no escribas toda la app todavía.

Entrégame en este orden:
1. Arquitectura funcional de la app
2. Mapa de pantallas
3. Estructura de carpetas Flutter
4. Modelo de datos de Firebase
5. Lista de dependencias
6. Roadmap por fases
7. Riesgos técnicos

Reglas:
- No inventes features que no fueron definidas
- No generes código todavía si antes no defines la estructura
- Mantén enfoque production-ready
- Piensa como arquitecto senior de app móvil
```

## Secuencia exacta de goals

### Goal 1: Arquitectura

```text
/goal
Define la arquitectura completa de ALOEC con Flutter + Firebase.
Incluye:
- módulos
- flujos
- navegación
- modelo de datos
- estrategia de escalabilidad
No generes aún pantallas completas.
```

### Goal 2: Setup del proyecto

```text
/goal
Genera el setup inicial del proyecto Flutter para ALOEC.
Incluye:
- pubspec.yaml
- estructura de carpetas
- main.dart
- configuración base de router
- configuración base de Firebase
- providers globales
- tema base
No implementes todavía lógica de negocio completa.
```

### Goal 3: Auth

```text
/goal
Implementa el módulo auth de ALOEC con Flutter y Firebase.
Pantallas:
- splash
- onboarding
- login
- registro
- recuperar contraseña
Requisitos:
- Riverpod
- go_router
- Firebase Auth
- manejo de loading/error/success
- soporte ES/EN
- código limpio por capas
```

### Goal 4: Perfil

```text
/goal
Implementa el módulo profile de ALOEC.
Incluye:
- lectura de datos del usuario desde Firestore
- edición de perfil
- actualización de foto
- idioma
- estado premium
- validaciones
- repositorio y datasource desacoplados
```

### Goal 5: IMC

```text
/goal
Implementa el módulo BMI de ALOEC.
Incluye:
- formulario
- cálculo de IMC
- almacenamiento en Firestore
- pantalla de resultado
- recomendación básica de plan
- diseño consistente con la app
```

### Goal 6: Jugos y planes

```text
/goal
Implementa los módulos de jugos y planes de dieta para ALOEC.
Incluye:
- listado de jugos
- detalle de jugo
- horario de jugos
- vista premium para programa de dieta
- datos mock primero y luego adaptables a Firestore
```

### Goal 7: Videocursos

```text
/goal
Implementa el módulo de videocursos para ALOEC.
Pantallas:
- catálogo de cursos
- detalle de curso
- lista de lecciones
- reproductor de video
- progreso del usuario
- acceso gratis vs premium
Incluye modelo de datos Firebase y validación de acceso.
```

### Goal 8: Monetización

```text
/goal
Implementa el flujo premium de ALOEC.
Incluye:
- pantalla de upsell
- checkout UI
- control de acceso a contenido premium
- historial básico de suscripción
- arquitectura preparada para integrar pagos reales después
```

### Goal 9: Calidad

```text
/goal
Audita el proyecto ALOEC y propón mejoras de producción.
Revisa:
- arquitectura
- duplicación de código
- rendimiento
- errores comunes Flutter
- seguridad Firebase
- analytics
- crashlytics
- publicación Android e iOS
```

## Prompt para crear el panel administrativo

```text
/goal
Quiero crear el panel administrativo web de ALOEC.

Stack:
- Next.js
- TypeScript
- Tailwind
- Firebase Auth
- Firestore
- Firebase Storage
- Vercel

Objetivo:
Crear un admin web separado de la app móvil para gestionar usuarios, planes, jugos, cursos, lecciones, banners y suscripciones.

Entrégame:
1. arquitectura del panel
2. sitemap del admin
3. roles y permisos
4. estructura de carpetas
5. modelo de datos conectado a Firebase
6. roadmap por fases
No generes todo el código de golpe.
```

## Cómo probar en la nube

### Desarrollo

- Código fuente en GitHub.
- Rama `develop` para integración.
- Rama `main` para producción.
- Entorno Firebase `dev` separado de `prod`.

### App móvil

Para móvil, las pruebas reales deben hacerse en:

- Android Emulator
- iOS Simulator
- dispositivo físico Android
- iPhone físico

### Distribución de pruebas

- Android: Internal Testing en Google Play Console
- iPhone: TestFlight

### Admin web

- Despliegue preview en Vercel por rama
- Producción en Vercel al merge con `main`

## Checklist antes de ejecutar los prompts

- Tener Figma definido.
- Tener flujo MVP cerrado.
- Tener nombre del proyecto y package identifiers.
- Tener proyecto Firebase creado.
- Tener repositorio Git.
- Tener prioridades por fase.
- Tener claro qué será gratis y qué será premium.
- Tener estrategia para videos: Vimeo, YouTube privado o Firebase Storage con cuidado.

## Recomendación importante sobre videos

Para videocursos, la recomendación práctica es:

- Guardar metadata en Firestore.
- Guardar miniaturas en Firebase Storage.
- Evitar usar Firebase Storage como solución ingenua de streaming escalable si los videos serán pesados y de uso intensivo.
- Considerar Vimeo o Bunny Stream para servir video, y usar Firebase para permisos, progreso y catálogo.

## Orden recomendado de ejecución real

1. Goal arquitectura.
2. Goal setup base.
3. Goal auth.
4. Goal profile.
5. Goal IMC.
6. Goal jugos/planes.
7. Goal videocursos.
8. Goal premium.
9. Goal admin web.
10. Goal auditoría final.

## Resultado esperado

Al finalizar este proceso, ALOEC debe quedar dividido en:

- app Flutter para usuario final
- backend Firebase
- panel admin web en Vercel
- flujo premium
- módulo de videocursos
- soporte ES/EN
- arquitectura mantenible y lista para iteración
