# Sistema de Referidos de ALOEC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete referral and affiliate system for ALOEC, enabling users to refer friends, earn commissions, request payouts (PayPal, Binance, Bank Transfer EC), and allow admins to manage affiliates and approve payouts.

**Architecture:** Extended Firestore database schemas for tracking referrals, commissions, and payout requests; Cloud Functions for secure transaction processing and push notifications; Flutter mobile screens for referral dashboard and payout setup; Next.js Admin Panel CRUDs for commission configurations and payout verifications; Web-based registration attribution as the primary reliable link mechanism.

**Tech Stack:** Flutter (Dart), Next.js (TypeScript), Firebase (Firestore, Auth, Cloud Functions, Cloud Messaging), Node.js.

---

### Task 1: Web & App Store Referral Attribution (El flujo de detección)

**Files:**
- Create: `aloec_landing/register.html` (Opcional: registro web)
- Modify: `aloec_landing/index.html` (Detección del parámetro ?ref en URL)
- Modify: `aloec_mobile/lib/features/auth/presentation/register_screen.dart` (Detección en primer inicio)

- [ ] **Step 1: Implement landing page parameter saving**
Update `aloec_landing/index.html` script to catch `?ref=` parameter from URL and store it in `localStorage` or session cookie.
```javascript
// Capturar y almacenar código de referido
const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref');
if (refCode) {
    localStorage.setItem('aloec_ref_code', refCode);
}
```

- [ ] **Step 2: Add Web Registration or Clipboard copy on download click**
If the user clicks download buttons on the landing page, we auto-copy the referral code to their clipboard (with a visual popup: "¡Código de descuento copiado!") so that when they open the app, it can read the clipboard. Or redirect to a simple web registration page before downloading.
```javascript
function handleDownload(storeUrl) {
    const code = localStorage.getItem('aloec_ref_code');
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            alert('Código de descuento ' + code + ' copiado al portapapeles. ¡Pégalo al registrarte en la App!');
            window.location.href = storeUrl;
        });
    } else {
        window.location.href = storeUrl;
    }
}
```

- [ ] **Step 3: Implement Clipboard reader inside Flutter App on onboarding/register**
Add the `clipboard` read check on the registration form of the Flutter app to auto-fill the "Código de Referido/Correo de tu amigo".

---

### Task 2: Firestore Database Extentions

**Files:**
- Modify: `shared-context.md` (Update schema documentation)
- Create: `aloec_backend/firestore.rules` (Security rules for referrals/commissions)

- [ ] **Step 1: Document the new collections in shared-context.md**
Add schemas for `commissions`, `payout_requests`, and the new fields in `users`.

- [ ] **Step 2: Apply Security Rules for new collections**
Ensure users can only read their own commissions and payout requests, and write payout requests. Admins have full access.

---

### Task 3: Mobile App Features (Flutter)

**Files:**
- Create: `aloec_mobile/lib/features/referrals/presentation/referral_dashboard_screen.dart`
- Create: `aloec_mobile/lib/features/referrals/presentation/payout_settings_screen.dart`
- Modify: `aloec_mobile/lib/core/router/app_router.dart` (Add new routes)

- [ ] **Step 1: Create Referral Dashboard UI**
Build a dashboard showing:
- Unique referral link share button (invoking Flutter `share_plus` plugin).
- Earnings summary (pending and total withdrawn).
- List of referred friends.
- Earnings history list.
- Button to request payout.

- [ ] **Step 2: Create Payout Request & Settings Form**
Form to choose PayPal, Binance, or Ecuadorian Bank Transfer.
For Bank Transfer, require: Banco, Tipo de cuenta, Número de cuenta, Nombre del beneficiario, RUC/Cédula, Correo.

---

### Task 4: Admin Web Features (Next.js)

**Files:**
- Create: `aloec_admin/src/pages/admin/affiliates/index.tsx`
- Create: `aloec_admin/src/pages/admin/payouts/index.tsx`
- Modify: `aloec_admin/src/components/layout/Sidebar.tsx` (Add navigation links)

- [ ] **Step 1: Payout Requests Management Dashboard**
Admin table showing pending requests. Actions: "Aprobar Pago" (updates status, notifies user) or "Rechazar Pago" (requires entering a reason).

- [ ] **Step 2: Affiliates list and Global Configurations**
Table showing all users with their referral code, referred users, and balance. Settings panel to adjust the default commission percentage.

---

### Task 5: Cloud Functions & Notifications

**Files:**
- Create: `aloec_backend/functions/index.js` (Firebase Cloud Functions)

- [ ] **Step 1: Implement commission triggers**
On Firestore purchase write, check if `referredByUid` exists in the buyer's user profile. If yes, write a new document in `commissions` and increment the referrer's pending balance.

- [ ] **Step 2: Payout request notification**
On status change of `payout_requests` to approved or rejected, send a push notification to the user's device via FCM.
