# Especificación de Diseño: Landing Page de ALOEC

Este documento detalla el diseño y especificaciones técnicas para la Landing Page de promoción de la aplicación **ALOEC**, diseñada para integrarse como un elemento autocontenido en WordPress usando Elementor.

---

## 📌 Resumen del Proyecto

* **Objetivo:** Crear una página de aterrizaje (Landing Page) moderna, rápida y visualmente atractiva para promocionar la aplicación móvil ALOEC, destacar sus beneficios clave (planes de dietas de jugos verdes, recetas bilingües, videocursos, seguimiento de IMC) e incentivar la descarga en dispositivos móviles (App Store y Google Play).
* **Entorno de Integración:** Elementor (WordPress) mediante un widget de código HTML (Opción A).
* **Formato:** Archivo único de HTML con CSS integrado en la etiqueta `<style>` y JS interactivo básico dentro de `<script>`.
* **Idioma:** Español.
* **Estilo Visual:** Premium & Saludable. Fondo suave con degradados orgánicos, tarjetas de cristal esmerilado (glassmorphism), tipografía premium moderna (Outfit e Inter) y botones de llamada a la acción (CTA) en verde vibrante.

---

## 🎨 Guía de Estilos Visuales (Design Tokens)

### Paleta de Colores
* **Fondo Principal:** Blanco y gris ultra-claro con degradados verdes pastel (`#FFFFFF` a `#F0FDF4`).
* **Verde Esmeralda (Principal/CTA):** `#10B981` (Brillante y saludable) y `#059669` (Hover/Enfoque).
* **Verde Bosque (Texto Destacado/Títulos):** `#064E3B` (Contraste premium oscuro).
* **Gris Texto:** `#374151` (Cuerpo de texto, alta legibilidad).
* **Efecto Cristal (Glassmorphism):** Fondo blanco semitransparente (`rgba(255, 255, 255, 0.7)`) con desenfoque de fondo (`backdrop-filter: blur(12px)`) y borde sutil (`rgba(255, 255, 255, 0.4)`).

### Tipografía
* Se utilizarán fuentes de Google Fonts importadas dinámicamente:
  * **Outfit:** Para títulos principales (`h1`, `h2`, `h3`), proporcionando un aspecto moderno, limpio y redondeado.
  * **Inter:** Para texto de lectura y descripciones, ofreciendo excelente legibilidad y consistencia.

### Micro-Animaciones
* **Mockup Flotante:** Movimiento vertical suave continuo mediante fotogramas clave (`keyframes`) CSS para simular flotación 3D del teléfono.
* **Botones de Descarga:** Efecto de escala (`transform: scale(1.05)`) y brillo progresivo al pasar el cursor (hover).
* **Tarjetas de Beneficio:** Elevación sutil en 3D (`translateY(-5px)`) y aumento de sombra al pasar el cursor.

---

## 🧱 Estructura de Secciones

### 1. Cabecera (Navbar)
* **Logotipo:** Icono de hoja estilizada + texto "ALOEC" en verde esmeralda.
* **Navegación:** Enlaces simples (`Beneficios`, `Características`, `Descargar`).
* **CTA de Cabecera:** Botón redondo "Descargar App" que realiza un scroll suave hacia la sección final de descarga.

### 2. Sección Principal (Hero)
* **Texto (Columna Izquierda):**
  * Etiqueta de bienvenida: "🌱 Tu camino hacia el bienestar".
  * H1: *"Tu bienestar comienza con un sorbo de salud"*.
  * Párrafo descriptivo del ecosistema ALOEC.
  * Botones de descarga de la App Store y Google Play Store con logos oficiales en formato SVG para garantizar alta resolución sin ralentizar la carga.
* **Visual (Columna Derecha):**
  * Render estilizado del mockup del teléfono móvil con la pantalla de ALOEC activa (mostrando la receta del jugo de Aloe Vera y Pepino).
  * Círculos radiales verdes y translúcidos en el fondo para dar profundidad 3D.

### 3. Beneficios Clave (Grid)
Presentado en una cuadrícula responsiva (4 tarjetas de cristal esmerilado):
* **Tarjeta 1: Planes de Dieta:** Duración, objetivos de desintoxicación y pérdida de peso.
* **Tarjeta 2: Recetas Inteligentes:** Ingredientes exactos, instrucciones detalladas paso a paso y conteo calórico.
* **Tarjeta 3: Videocursos:** Lecciones educativas grabadas para aprender de nutrición en cualquier momento.
* **Tarjeta 4: Seguimiento del Progreso:** Control de peso, cálculo de IMC y recordatorios diarios mediante notificaciones.

### 4. Capturas de la App (Galería)
* Una muestra de capturas de pantalla de la aplicación real (Onboarding, Catálogo de Jugos, Plan de Dieta y Videocursos) dispuestas en un deslizador/carrusel horizontal puro (CSS + mínimo JS) para que los usuarios vean la calidad visual de la app.

### 5. Sección de Cierre (CTA de Descarga)
* Contenedor con degradado de color verde oscuro a verde brillante.
* Título persuasivo: *¿Listo para transformar tu salud?*
* Subtítulo con elementos de prueba social (Calificación 4.8★, +10k Descargas).
* Botones oficiales de descarga de tamaño destacado.

---

## 🛠️ Especificaciones Técnicas de Integración en Elementor

* **Código Autocontenido:** Todo el CSS está dentro de la etiqueta `<style>` y no utiliza frameworks externos como Tailwind para evitar colisiones de clases en WordPress.
* **Fuentes y Recursos Externos:** Los iconos del sistema se implementarán mediante SVG en línea (inline SVGs) para evitar peticiones HTTP innecesarias a servidores de fuentes externas (como FontAwesome) que ralentizan la velocidad de la página. Las imágenes del mockup de la app se generarán de forma óptima.
* **Responsividad:** Consultas de medios (`@media`) CSS integradas para visualización perfecta en teléfonos móviles, tabletas y computadoras de escritorio.

---

## 🧪 Plan de Verificación y Pruebas

### Pruebas de Renderizado Visual
1. Comprobación del aspecto visual en Safari, Chrome, Edge y Firefox.
2. Comprobación de adaptabilidad móvil (responsive viewports desde 320px hasta 1920px de ancho).
3. Verificación de efectos hover y micro-animaciones (flotación y escala).

### Pruebas de Integración y Rendimiento
1. Validación del archivo HTML final con validador W3C.
2. Prueba de carga y simulación de incrustado en contenedor de Elementor para asegurar que no hay fugas de estilos globales.
