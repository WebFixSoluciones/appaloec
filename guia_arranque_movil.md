# Guía de Arranque del Proyecto Móvil ALOEC

Esta guía te ayudará a compilar y visualizar la aplicación móvil en tu pantalla o emulador.

---

## 🚀 Estado Actual de la Configuración
- **Flutter SDK:** Instalado en `E:\flutter` (estable `3.44.0`).
- **Dependencias de Android SDK:** Se descargó `cmdline-tools` y se aceptaron todas las licencias de Android de forma automática.
- **Estructura del Proyecto:** Generamos las carpetas nativas (`android`, `ios`, `web`) y resolvimos el conflicto de dependencias.
- **Android Studio:** Ya se inició y abrió tu proyecto `aloec_mobile` de forma automática.

---

## 📱 Paso 1: Crear y Arrancar el Emulador Android

Como no tienes ningún dispositivo virtual (AVD) creado, debes crear uno desde Android Studio:

1. En **Android Studio** (con tu proyecto `aloec_mobile` abierto), dirígete al menú superior o al panel lateral derecho y haz clic en **Device Manager** (Administrador de Dispositivos).
2. Haz clic en **Create Device** (Crear Dispositivo).
3. Selecciona un modelo de teléfono (por ejemplo, **Pixel 7** o **Pixel 6**) y presiona **Next**.
4. En la pestaña **Recommended** (Recomendado), selecciona una imagen de sistema (se recomienda **API 34** o **API 33**). Si no está descargada, haz clic en la flecha de descarga al lado del nombre (esto tomará unos minutos) y luego presiona **Next**.
5. Ponle un nombre al emulador (ej. `aloec_emulator`) y haz clic en **Finish** (Finalizar).
6. Una vez creado, haz clic en el icono verde de **Play** al lado del dispositivo en el Device Manager para iniciar el emulador en tu pantalla.

---

## 🏃 Paso 2: Ejecutar tu Proyecto Móvil

Una vez que el emulador esté encendido en tu pantalla (o si conectas tu teléfono físico con depuración USB activada):

### Opción A: Desde Android Studio (Recomendado visualmente)
1. En la barra de herramientas superior, asegúrate de que el dispositivo seleccionado en la lista desplegable sea tu emulador recién iniciado (ej. `Android SDK built for x86` o similar).
2. Selecciona `main.dart` en la lista desplegable de configuración de ejecución.
3. Haz clic en el botón verde de **Run** (Play) o presiona `Shift + F10`.
4. La app se compilará y se instalará en el emulador.

### Opción B: Desde la Terminal (Rápido y eficiente)
Abre una terminal en la carpeta `aloec_mobile` y ejecuta:
```bash
E:\flutter\bin\flutter.bat run
```
Si el emulador está activo, Flutter lo detectará automáticamente y ejecutará la aplicación allí.

---

## 🌐 Alternativa: Ejecutar en el Navegador Web (Chrome)
Si no deseas esperar a que se descargue la imagen del emulador de Android (que suele pesar 1.4 GB), puedes ver una vista web de la aplicación inmediatamente ejecutando:

```bash
cd E:\CLOUD WEBFIX\WEBFIX\SISTEMAS\appaloec\aloec_mobile
E:\flutter\bin\flutter.bat run -d chrome
```
Esto abrirá una pestaña de Google Chrome con la app ejecutándose. Puedes pulsar `F12` en Chrome y seleccionar el icono de dispositivo móvil para ver la app en formato de pantalla de teléfono.
