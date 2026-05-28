# ALOEC - Panel Administrativo Web (Next.js + Vercel)

Este es el panel de administración para gestionar la aplicación **ALOEC** (Dieta de Jugos Verdes). Está desarrollado con **Next.js** y optimizado para desplegarse fácilmente en **Vercel**.

## 🛠️ Tecnologías
- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript
- **Estilo**: CSS Vanilla (Diseño limpio, saludable, minimalista con CTAs verdes)
- **Base de datos / Autenticación**: Firebase SDK (Firestore, Auth, Storage)
- **Internacionalización**: `next-intl` (Soporte para Español e Inglés)

## 📁 Estructura del Proyecto Recomendada
- `/src/app/`: Rutas, layouts y componentes de servidor (Next.js App Router).
- `/src/components/`: Componentes React globales (botones, tarjetas ligeras, inputs).
- `/src/lib/`: Configuración y controladores de Firebase (Client y Admin SDK).
- `/messages/`: Archivos JSON de traducciones para internacionalización (`es.json`, `en.json`).
- `/public/`: Logotipos, fuentes y assets estáticos.

## 🚀 Inicio Rápido

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno en un archivo `.env.local` en la raíz de esta carpeta:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   FIREBASE_CLIENT_EMAIL=tu_service_account_email
   FIREBASE_PRIVATE_KEY=tu_service_account_private_key
   ```

3. Correr el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

## ☁️ Despliegue en Vercel
1. Conecta este repositorio en Vercel.
2. Agrega las variables de entorno listadas arriba en la configuración de Vercel.
3. El comando de build por defecto (`npm run build`) se ejecutará automáticamente al hacer push a la rama principal.
