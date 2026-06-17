---
name: app-admin-web
description: Controla la creación, estructura de archivos y desarrollo del panel administrativo web construido en Next.js y desplegado en Vercel. Gestiona dashboards, CRUDs de recetas, planes, videos, seguridad y roles.
---

# Habilidad: Panel Administrativo Web (app-admin-web)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Configurar o inicializar el proyecto web `aloec_admin` (Next.js con App Router y TypeScript).
- Desarrollar las interfaces de control de datos (Dashboards de uso, gestión de usuarios).
- Implementar los CRUDs de recetas de jugos verdes, planes de dieta, horarios por defecto y videocursos promocionales.
- Integrar Firebase Admin SDK o Firebase Client Web SDK en Next.js para interactuar con Firestore.
- Configurar roles y permisos (ej: verificar que el usuario autenticado sea `'admin'` en Firestore).
- Preparar la aplicación para el despliegue en Vercel (configuraciones, variables de entorno).
- Implementar internacionalización (i18n) para que el administrador web esté en inglés y español.

## 💡 Qué Problema Resuelve
Facilita la administración centralizada de la aplicación móvil (subida de nuevos videocursos, adición de nuevas recetas de jugos, edición de planes de dietas) sin necesidad de hacer despliegues de la app en las tiendas, garantizando seguridad estricta para evitar accesos no autorizados al backend.

## 🛠️ Qué Decisiones Puede Tomar
- Utilizar **Next.js App Router** con componentes React de servidor (Server Components) por defecto para mayor rendimiento y SEO.
- Usar **TypeScript** para garantizar seguridad de tipos alineada con los esquemas de `shared-context.md`.
- Implementar el diseño visual bilingüe usando middleware de localización como `next-intl` o enrutamiento dinámico `/es/admin` / `/en/admin`.
- **UI/UX Premium:** Priorizar **Tailwind CSS v3** con un estilo **Flat Modern Design** inspirado en páginas como Envato, Dropbox y Stripe.
- **Estética:** Uso homogéneo de colores, diseño compacto minimalista, tipografías de alto contraste, "liquid effects", contenedores y sidebar de primera calidad, e iconos especializados premium (ej. Lucide). El administrador operará en **solo modo light** (no aplicar modo oscuro).
- Configurar variables de entorno estrictas (`.env.local` / Vercel Environment Variables) para llaves públicas/privadas de Firebase.

## 📂 Qué Archivos Puede Tocará
- Configuración del proyecto Next.js: `aloec_admin/package.json`, `aloec_admin/next.config.js` y `aloec_admin/tsconfig.json`
- Estructura de páginas y rutas: dentro de `aloec_admin/src/app/`
- Middleware de control de sesión y traducción: `aloec_admin/src/middleware.ts`
- Inicialización y configuración de Firebase en el cliente/servidor: `aloec_admin/src/lib/firebase/`
- Configuración de Tailwind y hojas de estilos: `aloec_admin/tailwind.config.ts`, `aloec_admin/postcss.config.js` y `aloec_admin/src/app/globals.css`.

## 📦 Qué Entregables Debe Producir
- Boilerplate de Next.js configurado con TypeScript y Tailwind CSS v3.
- Dashboard principal con métricas de usuarios registrados, promedio de IMC calculado y conteo de recetas activas. Diseño premium impecable.
- Formularios CRUD bilingües con validación de datos para la creación de Recetas (Jugos) e inclusión de videos promocionales.
- Configuración lista para despliegue automático en Vercel (`vercel.json` o settings de CI/CD).

## 🚫 Qué NO Debe Hacer
- **No** debe exponer credenciales privadas de Firebase (especialmente la llave privada del Service Account) en el código del lado del cliente.
- **No** debe permitir que usuarios con rol `'user'` ingresen a las rutas de administración (debe redirigir al login o a una página de acceso no autorizado).
- **No** debe utilizar componentes de cliente (`"use client"`) de forma masiva si las vistas pueden renderizarse eficientemente en el servidor.
- **No** debe usar placeholders genéricos. Si se requiere mockear interfaces gráficas de cursos o jugos, usar datos de prueba coherentes.

## ✅ Checklist de Calidad
- [ ] ¿Están todas las rutas de `/admin` protegidas por un middleware que verifique la sesión de Firebase y el rol de `'admin'`?
- [ ] ¿El diseño visual sigue el estilo saludable (tarjetas ligeras, fondos claros, botones y acentos de color verde orgánico)?
- [ ] ¿El formulario de creación de jugos verdes valida campos obligatorios en español e inglés antes de enviar a Firestore?
- [ ] ¿La subida de archivos (videos o imágenes de jugos) se realiza a través de Firebase Storage en la carpeta correspondiente con barra de progreso?
- [ ] ¿El proyecto compila sin errores de TypeScript (`npm run build`) para garantizar un despliegue exitoso en Vercel?
