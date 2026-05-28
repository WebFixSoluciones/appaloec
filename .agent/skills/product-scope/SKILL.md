---
name: product-scope
description: Define el alcance del MVP del producto ALOEC, gestiona las prioridades de desarrollo, hoja de ruta (roadmap), características claves e introduce mecanismos de control de cambios.
---

# Habilidad: Alcance de Producto (product-scope)

## 🎯 Criterios de Activación
Esta habilidad debe activarse cuando el flujo de trabajo requiera:
- Definir o refactorizar los requerimientos del producto ALOEC.
- Priorizar funcionalidades para sprint planning o lanzamientos del MVP.
- Decidir qué características entran en la primera versión pública y cuáles se posponen.
- Validar que los desarrollos técnicos coincidan con los objetivos comerciales (dieta de jugos verdes, cálculo de IMC, videocursos promocionales).
- Controlar modificaciones que expandan el alcance del producto de manera descontrolada ("scope creep").

## 💡 Qué Problema Resuelve
Evita el retraso constante del lanzamiento por intentar construir demasiadas funciones a la vez, mantiene al equipo enfocado en el valor principal (la dieta de jugos verdes y el control de salud con IMC) y garantiza que los recursos técnicos se inviertan en las tareas prioritarias del negocio.

## 🛠️ Qué Decisiones Puede Tomar
- Clasificar requerimientos utilizando la metodología MoSCoW (Must have, Should have, Could have, Won't have).
- Definir las métricas de éxito del MVP (ej: número de cálculos de IMC exitosos, retención en los planes de jugos).
- Decidir posponer integraciones secundarias (ej: pasarelas de pago avanzadas o redes sociales complejas) para fases posteriores al MVP.
- Estandarizar el flujo de registro mínimo para garantizar una fricción de usuario baja.

## 📂 Qué Archivos Puede Tocará
- Documentos de planeación de producto: `E:\CLOUD WEBFIX\WEBFIX\SISTEMAS\appaloec/README.md`
- Archivo de contexto global de datos: `E:\CLOUD WEBFIX\WEBFIX\SISTEMAS\appaloec/shared-context.md`
- Historias de usuario, checklists de tareas o tableros Kanban definidos en el workspace.

## 📦 Qué Entregables Debe Producir
- Mapa de ruta (Roadmap) ordenado para la fase MVP, fase de crecimiento y fase de monetización.
- Lista detallada de Historias de Usuario para el cálculo de IMC y horarios de jugos.
- Matriz de control de cambios técnicos para documentar variaciones sobre el plan inicial.

## 🚫 Qué NO Debe Hacer
- **No** debe añadir características complejas y no esenciales en medio de una fase de compilación del MVP (ej: no añadir foros de usuarios o chats en tiempo real sin aprobación previa).
- **No** debe cambiar reglas del modelo de datos de `shared-context.md` sin validar los impactos en el cliente móvil y web.
- **No** debe ignorar los feedbacks del usuario que indiquen que el flujo bilingüe o visual es confuso.

## ✅ Checklist de Calidad
- [ ] ¿Están todas las características del desarrollo de la iteración actual alineadas estrictamente con las metas del MVP?
- [ ] ¿El flujo del usuario para calcular el IMC e iniciar un plan de jugos requiere menos de 5 interacciones/pantallas?
- [ ] ¿Se ha documentado detalladamente el impacto de cada nuevo requerimiento en las base de datos (Firestore) y modelos de Flutter?
- [ ] ¿El roadmap de producto contempla la estrategia de i18n desde la fase de planeación básica?
- [ ] ¿Se cuenta con una lista clara de "Criterios de Aceptación" para dar por terminada cada funcionalidad?
---
## 🗺️ Roadmap de Producto ALOEC (MVP)

1. **Calculadora de IMC y Registro**: El usuario ingresa peso/altura y obtiene su diagnóstico visual.
2. **Catálogo de Jugos Verdes**: Recetas estructuradas con ingredientes y beneficios.
3. **Planes y Horarios**: Configuración de recordatorios (notificaciones) para tomar los jugos.
4. **Videocursos Promocionales**: Reproductor integrado para contenido educativo introductorio.
5. **Panel Administrativo**: CRUD de contenidos (recetas, planes y enlaces a videos).
