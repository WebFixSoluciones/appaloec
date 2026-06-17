# Solución al Problema de Virtualización (Emulador Android)

Al intentar iniciar el emulador Android, se detectó el siguiente error:
`x86_64 emulation currently requires hardware acceleration!`
`VirtualizationFirmwareEnabled: False`

Esto significa que **la Virtualización de CPU está desactivada en la BIOS** de tu placa madre. Sin esto, ningún emulador Android puede ejecutarse de forma fluida y acelerada.

---

## 🛠️ Cómo Activar la Virtualización en tu Computadora (BIOS)

Para habilitarlo, sigue estos pasos:

1. **Reinicia tu computadora.**
2. En la pantalla de carga inicial (antes de que inicie Windows), presiona la tecla para entrar a la BIOS. Por lo general es:
   - **Del** (Supr) o **F2** (en la mayoría de placas como ASUS, Gigabyte, MSI, ASRock, etc.).
   - **F10** o **F12** (en computadoras HP o Lenovo).
3. Una vez dentro de la BIOS, busca la pestaña o sección llamada **Advanced** (Avanzado), **CPU Configuration** (Configuración del Procesador) o **Overclocking**.
4. Busca la opción de Virtualización según tu procesador:
   - **Si tienes Intel:** Busca **Intel Virtualization Technology**, **VT-x** o **Vanderpool Technology** y cámbialo a **Enabled** (Activado).
   - **Si tienes AMD:** Busca **SVM Mode** o **Secure Virtual Machine** y cámbialo a **Enabled** (Activado).
5. Guarda los cambios y sal (usualmente presionando **F10** y seleccionando *Save and Exit*).
6. La computadora se reiniciará en Windows y el emulador ya funcionará perfectamente.

---

## 🌐 Alternativas Inmediatas para Trabajar Ya mismo

Si no puedes reiniciar tu equipo en este momento, puedes usar estas dos alternativas integradas en VS Code:

### Alternativa 1: Ejecutar la Vista Móvil en Google Chrome (Recomendado)
Puedes visualizar la app en formato móvil usando Google Chrome:
1. Abre una terminal en VS Code.
2. Ejecuta:
   ```bash
   E:\flutter\bin\flutter.bat run -d chrome
   ```
3. Se abrirá Google Chrome con tu aplicación.
4. Presiona **F12** en el navegador para abrir las herramientas de desarrollador.
5. Haz clic en el icono de **Dispositivo Móvil** (arriba a la izquierda de la consola de desarrollador) para ver la interfaz exactamente con las dimensiones de un teléfono.

### Alternativa 2: Conectar un Celular Físico Android por USB
1. En tu teléfono móvil, ve a *Ajustes* > *Acerca del teléfono* y presiona 7 veces sobre *Número de compilación* para activar las **Opciones de Desarrollador**.
2. Ve a *Apciones de Desarrollador* y activa la **Depuración USB**.
3. Conecta el celular a tu computadora mediante un cable USB.
4. En VS Code, selecciona tu celular físico en la esquina inferior derecha y presiona **F5** (o ejecuta `E:\flutter\bin\flutter.bat run`) para ver la aplicación directamente en tu mano.
