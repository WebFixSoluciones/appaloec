# Contexto Compartido: Modelo de Datos y Reglas de Negocio ALOEC

Este documento define el modelo de datos unificado y las reglas de negocio globales para el sistema **ALOEC**. Sirve como punto de referencia común para el backend (Firebase), el cliente móvil (Flutter) y el panel de administración (Next.js).

---

## 🌐 Convenciones de Internacionalización (i18n)

Para mantener la consistencia bilingüe (Español/Inglés) en los datos almacenados en Firestore, se adopta la convención de almacenar cadenas de texto traducibles como objetos estructurados:

```typescript
interface MultilangText {
  es: string; // Contenido en Español
  en: string; // Contenido en Inglés
}
```

---

## 🗄️ Esquemas de Base de Datos (Colecciones Firestore)

### 1. Colección: `users`
Almacena el perfil principal del usuario, preferencias y rol dentro del sistema.

* **ID del Documento**: `uid` (proveído por Firebase Auth).
* **Campos**:
  ```typescript
  interface UserDocument {
    uid: string;
    email: string;
    displayName: string;
    photoUrl?: string;
    role: 'user' | 'admin';
    preferredLanguage: 'es' | 'en';
    createdAt: timestamp;
    lastLoginAt: timestamp;
    deviceToken?: string; // Token de FCM para notificaciones push
  }
  ```

### 2. Colección: `imc_records`
Subcolección o colección principal (con referencia a `user_uid`) que registra el historial de mediciones de Índice de Masa Corporal.

* **ID del Documento**: Autogenerado por Firestore.
* **Campos**:
  ```typescript
  interface ImcRecordDocument {
    id: string;
    userUid: string;
    weightKg: number;
    heightCm: number;
    imcValue: number; // Fórmula: weightKg / (heightCm / 100)^2
    category: 'underweight' | 'normal' | 'overweight' | 'obese'; // Calculado
    registeredAt: timestamp;
  }
  ```

### 3. Colección: `juices`
Catálogo de recetas de jugos verdes y sus características saludables.

* **ID del Documento**: Autogenerado por Firestore.
* **Campos**:
  ```typescript
  interface JuiceDocument {
    id: string;
    name: MultilangText;
    description: MultilangText;
    ingredients: {
      ingredientId: string;
      name: MultilangText;
      amount: string; // Ej: "200g", "1 unidad"
    }[];
    preparationSteps: MultilangText[]; // Lista ordenada de pasos
    benefits: MultilangText[]; // Lista de beneficios claves
    prepTimeMinutes: number;
    imageUrl: string; // Referencia a Firebase Storage
    caloriesEstimate: number;
    active: boolean;
    createdAt: timestamp;
  }
  ```

### 4. Colección: `diet_plans`
Planes estructurados basados en jugos verdes para control de peso o desintoxicación.

* **ID del Documento**: Autogenerado por Firestore.
* **Campos**:
  ```typescript
  interface DietPlanDocument {
    id: string;
    title: MultilangText;
    description: MultilangText;
    durationDays: number;
    difficulty: 'easy' | 'medium' | 'hard';
    coverImageUrl: string;
    dailySchedule: {
      dayNumber: number; // Ej: 1, 2, 3...
      juices: {
        juiceId: string; // Referencia a la colección `juices`
        targetTime: string; // Hora sugerida en formato "HH:MM" (ej: "08:00")
        type: 'breakfast_substitute' | 'snack' | 'lunch_complement' | 'dinner_substitute';
      }[];
    }[];
    active: boolean;
    createdAt: timestamp;
  }
  ```

### 5. Colección: `user_schedules`
Planes de dieta activos asignados a los usuarios finales y su progreso.

* **ID del Documento**: Autogenerado por Firestore o uno por usuario activo.
* **Campos**:
  ```typescript
  interface UserScheduleDocument {
    id: string;
    userUid: string;
    planId: string; // Referencia a `diet_plans`
    startDate: timestamp;
    endDate: timestamp;
    completedDays: number[]; // Lista de días completados (ej: [1, 2])
    notificationsEnabled: boolean;
    reminderSettings: {
      time: string; // "HH:MM"
      label: 'breakfast' | 'snack' | 'dinner';
    }[];
    active: boolean;
  }
  ```

### 6. Colección: `videocourses`
Videocursos educativos y promocionales sobre jugos verdes, nutrición y estilo de vida saludable.

* **ID del Documento**: Autogenerado por Firestore.
* **Campos**:
  ```typescript
  interface VideocourseDocument {
    id: string;
    title: MultilangText;
    description: MultilangText;
    videoUrl: string; // URL pública o referencia a Firebase Storage / Cloudflare Stream
    coverImageUrl: string;
    durationSeconds: number;
    sequenceOrder: number; // Orden de reproducción en la lista
    isPremium: boolean; // Si requiere suscripción o pago
    active: boolean;
    viewsCount: number;
    createdAt: timestamp;
  }
  ```

---

## 📈 Reglas de Cálculo de Negocio (IMC)

El cálculo del IMC sigue la escala estándar de la Organización Mundial de la Salud (OMS):

| Rango de IMC | Categoría (Código) | Categoría (ES) | Categoría (EN) |
|---|---|---|---|
| < 18.5 | `underweight` | Bajo Peso | Underweight |
| 18.5 - 24.9 | `normal` | Normal | Normal Weight |
| 25.0 - 29.9 | `overweight` | Sobrepeso | Overweight |
| >= 30.0 | `obese` | Obesidad | Obese |
