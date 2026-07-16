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

---

## 👥 Sistema de Referidos

### Extensión en `/users/{uid}`:

```typescript
interface UserReferral {
  code: string;                    // "ALOE-JUAN" — código propio único para compartir
  codeCreatedAt: timestamp;
  referredByUid: string | null;    // UID del usuario que lo refirió
  referredByCode: string | null;   // Código usado al registrarse
  status: 'none' | 'invited' | 'registered' | 'converted';
  registeredAt: timestamp | null;
  convertedAt: timestamp | null;   // fecha de primera compra
}

interface AffiliateBalance {
  pendingUSD: number;              // comisiones en hold period
  approvedUSD: number;             // comisiones disponibles para retiro
  paidUSD: number;                 // total histórico pagado
  rejectedUSD: number;             // total rechazado
  updatedAt: timestamp;
}
```

### Colección: `referral_codes`
Mapeo rápido código → UID. Lectura pública para resolver referentes.

```typescript
interface ReferralCodeDocument {
  code: string;           // ID del documento = código
  uid: string;            // UID del dueño del código
  displayName: string;    // nombre del dueño
  createdAt: timestamp;
  active: boolean;
}
```

### Colección: `referral_config`
Configuración global del programa. Documento único: `/referral_config/production`

```typescript
interface ReferralConfigDocument {
  programEnabled: boolean;
  commissionRules: {
    registration:    { type: 'fixed' | 'percentage'; value: number; enabled: boolean };
    firstPurchase:   { type: 'fixed' | 'percentage'; value: number; enabled: boolean };
    purchase:        { type: 'fixed' | 'percentage'; value: number; enabled: boolean };
  };
  purchasePercentageBase: 'net' | 'gross';
  cookieDurationDays: number;      // default 30
  holdPeriodDays: number;          // default 7
  minPayoutUSD: number;            // default 25
  maxPayoutUSD: number;            // default 1000
  payoutMethods: {
    id: string;                    // 'paypal' | 'binance' | 'bank_ec'
    label: string;
    enabled: boolean;
    minAmount: number;
  }[];
  termsUrl: string;
  updatedAt: timestamp;
  updatedBy: string;
}
```

### Colección: `referral_events`
Bitácora inmutable de todos los eventos del sistema.

```typescript
type ReferralEventType =
  | 'invitation_sent' | 'link_clicked' | 'registered'
  | 'first_purchase' | 'commission_generated' | 'commission_approved'
  | 'commission_rejected' | 'commission_paid'
  | 'payout_requested' | 'payout_completed' | 'payout_rejected';

interface ReferralEventDocument {
  type: ReferralEventType;
  referrerUid: string | null;
  referredUid: string | null;
  referralCode: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: timestamp;
}
```

### Colección: `commissions`

```typescript
interface CommissionDocument {
  referrerUid: string;
  referredUid: string;
  referralCode: string;
  triggerType: 'registration' | 'first_purchase' | 'purchase';
  amountUSD: number;
  ruleSnapshot: { type: string; value: number; percentageBase?: string };
  orderId: string | null;
  orderAmount: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  statusLog: { status: string; timestamp: timestamp; actorUid: string; reason?: string }[];
  releasedAt: timestamp;           // holdPeriodDays after createdAt
  payoutBatchId: string | null;
  createdAt: timestamp;
}
```

### Subcolección: `/users/{uid}/payout_methods`

```typescript
interface PayoutMethodDocument {
  type: 'paypal' | 'binance' | 'bank_ec';
  label: string;                   // "Mi PayPal principal"
  isDefault: boolean;
  isVerified: boolean;
  details: Record<string, string>; // tipo-específico
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Colección: `payouts`

```typescript
interface PayoutDocument {
  uid: string;
  amountUSD: number;
  commissionIds: string[];
  methodSnapshot: { type: string; label: string; details: Record<string, string> };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  statusLog: { status: string; timestamp: timestamp; actorUid: string; notes?: string }[];
  adminNotes: string | null;
  processedAt: timestamp | null;
  createdAt: timestamp;
}
```

### Colección: `referral_audit`
Registro inmutable de cambios administrativos.

```typescript
interface ReferralAuditDocument {
  action: string;                  // 'config.updated' | 'commission.status_changed' | 'payout.approved' | etc.
  actorUid: string;
  actorEmail: string;
  targetUid: string | null;
  changes: { field: string; before: unknown; after: unknown };
  ipAddress: string | null;
  createdAt: timestamp;
}
```

### Reglas de Negocio del Sistema de Referidos

| Regla | Descripción |
|-------|-------------|
| Código único | Formato `ALOE-[A-Z0-9]{4,20}`, generado vía Cloud Function |
| Auto-referido | Bloqueado: `referredByUid !== newUid` |
| First-touch | Primer código usado gana la atribución; no se sobrescribe |
| Cookie duration | `cookieDurationDays` (default 30) desde `?ref=` hasta registro |
| Hold period | Comisiones `pending` por `holdPeriodDays` (default 7) antes de liberarse |
| Mínimo retiro | `approvedUSD >= minPayoutUSD` (default $25) |
| Máximo retiro | `amount <= maxPayoutUSD` (default $1000) |
| Círculo prohibido | Si A refirió a B, B no puede referir a A (validación 1 nivel) |
| Refund | Si el referido hace reembolso, la comisión se revierte: `approved → rejected` |
| Rate limit | Máximo 10 generaciones de código por IP/hora |

### Máquina de Estados

```
COMMISSION:  pending → approved → paid
                  ↓
               rejected

PAYOUT:  pending → processing → completed
              ↓
           rejected

REFERRAL: none → invited → registered → converted
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
