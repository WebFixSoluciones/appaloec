---
name: flutter-architecture
description: Controla la arquitectura general, estructura de directorios, Clean Architecture, inyección de dependencias, gestión de estados y enrutamiento del cliente móvil Flutter para ALOEC.
---

# Habilidad: Arquitectura Flutter (flutter-architecture)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el usuario o el flujo de trabajo requiera:
- Inicializar o modificar la estructura de directorios del proyecto móvil `aloec_mobile`.
- Definir la arquitectura de capas (Clean Architecture) para nuevas características.
- Implementar o refactorizar la inyección de dependencias o el gestor de estados (Riverpod).
- Configurar o modificar las rutas y navegación de la app (GoRouter).
- Crear componentes base altamente reutilizables.

## 💡 Qué Problema Resuelve
Evita el acoplamiento excesivo de código ("código espagueti"), la desorganización de carpetas, problemas de mantenibilidad y escalabilidad, fallas en la sincronización de estados y dependencias difíciles de testear a medida que la app de dietas crece.

## 🛠️ Qué Decisiones Puede Tomar
- Estructurar el proyecto siguiendo **Clean Architecture** (Capas: `Data`, `Domain`, `Presentation`).
- Utilizar **Riverpod** como la solución única de gestión de estados e inyección de dependencias.
- Utilizar **GoRouter** para manejar la navegación declarativa y deep linking.
- Establecer la estructura de carpetas por características (feature-first approach) para modularidad.
- Definir la estrategia de manejo de errores globales en el hilo UI.

## 📂 Qué Archivos Puede Tocará
- Archivos de configuración de dependencias: `aloec_mobile/pubspec.yaml`
- Archivo de entrada de la aplicación: `aloec_mobile/lib/main.dart`
- Directorios y archivos de Clean Architecture dentro de `aloec_mobile/lib/src/features/`
- Configuración de rutas de navegación: `aloec_mobile/lib/src/routing/`
- Inicialización de providers globales: `aloec_mobile/lib/src/providers/`

## 📦 Qué Entregables Debe Producir
- Estructura limpia de carpetas de Flutter lista para el desarrollo.
- Archivo de rutas (`app_router.dart`) configurado con navegación segura.
- Clases base de estados (`AsyncValue` o estados personalizados de Riverpod).
- Módulos de Clean Architecture listos para interactuar con los repositorios de Firebase.

## 🚫 Qué NO Debe Hacer
- **No** debe mezclar lógica de negocio directamente en los widgets de la interfaz de usuario (Presentation).
- **No** debe utilizar múltiples gestores de estado diferentes en el mismo proyecto (ej: no mezclar BLoC y Riverpod).
- **No** debe hardcodear credenciales o llaves de API dentro del código fuente de Flutter.
- **No** debe omitir la modularización por capas al crear nuevas funcionalidades.

## ✅ Checklist de Calidad
- [ ] ¿El código del widget hereda de `ConsumerWidget` o `ConsumerStatefulWidget` cuando requiere interactuar con el estado?
- [ ] ¿Las capas de dominio (`Domain`) son independientes de librerías externas y de Flutter (Dart puro)?
- [ ] ¿Toda nueva ruta de pantalla está registrada en la configuración de `GoRouter`?
- [ ] ¿Se manejan de forma correcta y visual los estados de carga (`loading`) y error en la capa de presentación?
- [ ] ¿El analizador estático de Flutter (`flutter analyze`) pasa sin warnings ni errores?
