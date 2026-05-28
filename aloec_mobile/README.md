# ALOEC - Aplicación Móvil (Flutter)

Este es el cliente móvil multiplataforma (Android/iOS) para **ALOEC** (Dieta de Jugos Verdes). Está desarrollado con **Flutter** e integra servicios de **Firebase**.

## 🛠️ Stack Tecnológico
- **Lenguaje**: Dart
- **Gestión de Estados**: `flutter_riverpod` con generación de código.
- **Enrutamiento**: `go_router`.
- **Servicios Cloud**: Firebase (Auth, Firestore, Storage, Cloud Messaging, Analytics, Crashlytics).
- **Tipografías**: `google_fonts` (Inter / Roboto).
- **Estilo**: Estilo limpio, saludable, minimalista con tarjetas ligeras y CTAs verdes.

## 📂 Arquitectura (Clean Architecture + Feature-First)
El proyecto se organiza bajo carpetas por características dentro de `lib/src/features/`. Cada módulo cuenta con sus capas:

- **`/presentation/`**: Widgets, vistas y controladores de UI (Providers de Riverpod que manejan la UI).
- **`/domain/`**: Modelos de datos del dominio y lógica de negocio pura (independiente de Flutter y librerías externas).
- **`/data/`**: Repositorios, fuentes de datos (Data Sources) y llamadas de red o locales (ej. servicios de Firestore).

### Carpetas de Soporte Global
- **`/src/routing/`**: Rutas y lógica de navegación (`app_router.dart`).
- **`/src/theme/`**: Configuración visual y paleta de colores saludables (`app_theme.dart`).
- **`/src/localization/`**: Localización (i18n) e inicialización del soporte bilingüe.

## 🚀 Inicio Rápido

1. **Prerrequisito**: Configura Flutter en las variables de entorno de tu máquina.
2. Descarga de dependencias:
   ```bash
   flutter pub get
   ```
3. Generación de código automático (Riverpod, routing, etc.):
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```
4. Correr la app:
   ```bash
   flutter run
   ```

## 🌐 Soporte Bilingüe (i18n)
La aplicación genera automáticamente clases de traducción basadas en los archivos situados en `lib/l10n/app_es.arb` y `lib/l10n/app_en.arb`.

Para regenerar las traducciones de forma manual:
```bash
flutter gen-l10n
```
