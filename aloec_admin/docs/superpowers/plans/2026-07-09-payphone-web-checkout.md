# Payphone Web Checkout (Opción A+C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el pago nativo en la app Flutter por una página de checkout en Next.js (Vercel) que procesa el pago de Payphone server-side y notifica a la app via Firestore.

**Architecture:** La app Flutter abre un WebView apuntando a `/checkout?planId=X&userId=Y&token=Z` en el admin de Vercel. Next.js crea el link de pago en Payphone server-side (sin exponer el token), carga el WebView de Payphone, y un webhook `/api/payphone/webhook` recibe la confirmación y actualiza Firestore. La app Flutter escucha cambios en Firestore y activa la membresía automáticamente.

**Tech Stack:** Next.js 14 (App Router), Firebase Admin SDK, Firestore, Flutter WebView, Payphone API REST.

## Global Constraints

- Next.js versión `^14.1.0` — no usar features de Next.js 15
- Firebase Admin SDK `^12.0.0` — ya instalado en el proyecto
- No agregar dependencias nuevas al admin — usar solo las ya presentes en package.json
- El token de Payphone NUNCA debe exponerse al cliente (browser/app) — solo en Server Actions o Route Handlers
- La URL del checkout debe incluir un `token` JWT simple (userId + planId firmado) para prevenir manipulación
- Tailwind CSS para estilos — no CSS-in-JS
- Ambiente del checkout (sandbox/production) se lee de Firestore `gateways/payphone.environment`
- El webhook de Payphone recibe POST en `/api/payphone/webhook`
- La app Flutter usa el WebView ya implementado en `checkout_screen.dart`

---

## Mapa de archivos

### Archivos nuevos en `aloec_admin`

| Archivo | Responsabilidad |
|---------|----------------|
| `src/lib/firebase/admin.ts` | Inicializar Firebase Admin SDK (server-side) |
| `src/lib/payphone/client.ts` | Llamadas HTTP a la API de Payphone (server-side únicamente) |
| `src/lib/checkout/token.ts` | Crear y verificar tokens de sesión de checkout (HMAC) |
| `src/app/checkout/page.tsx` | Página pública de checkout — lee plan de Firestore, crea link Payphone, muestra WebView |
| `src/app/checkout/loading.tsx` | Skeleton de loading para la página checkout |
| `src/app/api/payphone/webhook/route.ts` | Webhook POST — recibe confirmación de Payphone, actualiza Firestore |

### Archivos modificados en `aloec_admin`

| Archivo | Cambio |
|---------|--------|
| `src/app/(dashboard)/gateways/page.tsx` | Agregar campo "URL del Checkout" que muestra la URL base a copiar |
| `.env.local` (nuevo) | `CHECKOUT_SECRET` para firmar tokens de sesión |

### Archivos modificados en `aloec_mobile`

| Archivo | Cambio |
|---------|--------|
| `lib/features/subscriptions/presentation/screens/checkout_screen.dart` | Reemplazar toda la lógica Payphone por apertura de WebView a la URL de Vercel + listener Firestore |
| `lib/features/subscriptions/data/payphone_service.dart` | Eliminar (ya no se usa desde la app) |

---

## Task 1: Firebase Admin SDK — inicialización server-side

**Files:**
- Create: `src/lib/firebase/admin.ts`
- Create: `.env.local`

**Interfaces:**
- Produces: `adminDb: FirebaseFirestore.Firestore` — instancia singleton de Firestore Admin

- [ ] **Step 1: Crear `.env.local` con las variables necesarias**

```bash
# /e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin/.env.local
FIREBASE_PROJECT_ID=app-aloec
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CHECKOUT_SECRET=aloec_checkout_secret_2026
```

> **IMPORTANTE:** `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY` se obtienen de Firebase Console → Project Settings → Service Accounts → Generate new private key. Descargar el JSON y copiar los valores.

- [ ] **Step 2: Crear `src/lib/firebase/admin.ts`**

```typescript
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let adminDb: Firestore;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}
```

- [ ] **Step 3: Verificar que Next.js lee las variables de entorno**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin"
node -e "require('dotenv').config({path:'.env.local'}); console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID)"
```

Salida esperada: `PROJECT_ID: app-aloec`

- [ ] **Step 4: Commit**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin"
git add src/lib/firebase/admin.ts
# NO hacer git add .env.local — está en .gitignore
git commit -m "feat: add Firebase Admin SDK initialization for server-side"
```

---

## Task 2: Token de sesión de checkout (HMAC)

**Files:**
- Create: `src/lib/checkout/token.ts`

**Interfaces:**
- Produces:
  - `createCheckoutToken(userId: string, planId: string): string` — genera token firmado
  - `verifyCheckoutToken(token: string): { userId: string; planId: string } | null` — verifica y decodifica

- [ ] **Step 1: Crear `src/lib/checkout/token.ts`**

```typescript
import { createHmac } from 'crypto';

const SECRET = process.env.CHECKOUT_SECRET ?? 'dev_secret';

export function createCheckoutToken(userId: string, planId: string): string {
  const payload = `${userId}:${planId}:${Date.now()}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  const raw = `${payload}:${sig}`;
  return Buffer.from(raw).toString('base64url');
}

export function verifyCheckoutToken(token: string): { userId: string; planId: string } | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 4) return null;
    const [userId, planId, ts, sig] = parts;
    // Expirar tokens después de 30 minutos
    if (Date.now() - parseInt(ts) > 30 * 60 * 1000) return null;
    const payload = `${userId}:${planId}:${ts}`;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    if (sig !== expected) return null;
    return { userId, planId };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verificar manualmente la función en Node**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin"
node -e "
const { createHmac } = require('crypto');
const SECRET = 'aloec_checkout_secret_2026';
const userId = 'user123';
const planId = 'plan456';
const payload = userId + ':' + planId + ':' + Date.now();
const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
const token = Buffer.from(payload + ':' + sig).toString('base64url');
console.log('Token generado OK:', token.length > 10);
"
```

Salida esperada: `Token generado OK: true`

- [ ] **Step 3: Commit**

```bash
git add src/lib/checkout/token.ts
git commit -m "feat: add HMAC checkout session token utility"
```

---

## Task 3: Cliente Payphone server-side

**Files:**
- Create: `src/lib/payphone/client.ts`

**Interfaces:**
- Consumes: `getAdminDb()` de `src/lib/firebase/admin.ts`
- Produces:
  - `getPayphoneConfig(): Promise<PayphoneConfig>` — lee config de Firestore server-side
  - `createPaymentLink(params: CreateLinkParams): Promise<{ paymentId: number; payUrl: string }>` — llama `POST /Pay`
  - `getPaymentStatus(paymentId: number, config: PayphoneConfig): Promise<PayphoneStatus>` — llama `GET /Pay/{id}`

```typescript
// Tipos exportados:
interface PayphoneConfig {
  token: string;
  storeId: string;
  isSandbox: boolean;
}

interface CreateLinkParams {
  amountCents: number;
  clientTransactionId: string;
  email: string;
  reference: string;
  phoneNumber?: string;
  config: PayphoneConfig;
}

interface PayphoneStatus {
  statusCode: number; // 1=pending, 2=canceled, 3=approved
  transactionStatus: string;
  authorizationCode?: string;
  clientTransactionId?: string;
}
```

- [ ] **Step 1: Crear `src/lib/payphone/client.ts`**

```typescript
import { getAdminDb } from '../firebase/admin';

export interface PayphoneConfig {
  token: string;
  storeId: string;
  isSandbox: boolean;
}

export interface CreateLinkParams {
  amountCents: number;
  clientTransactionId: string;
  email: string;
  reference: string;
  phoneNumber?: string;
  config: PayphoneConfig;
}

export interface PayphoneStatus {
  statusCode: number;
  transactionStatus: string;
  authorizationCode?: string;
  clientTransactionId?: string;
}

export async function getPayphoneConfig(): Promise<PayphoneConfig> {
  const db = getAdminDb();
  const snap = await db.collection('gateways').doc('payphone').get();
  if (!snap.exists) throw new Error('Payphone no configurado');
  const data = snap.data()!;
  if (!data.isActive) throw new Error('Payphone no está activo');
  return {
    token: data.secretKey,
    storeId: data.publicKey,
    isSandbox: data.environment === 'sandbox',
  };
}

function baseUrl(isSandbox: boolean): string {
  return isSandbox
    ? 'https://sandbox-api.payphonetodoesposible.com/api'
    : 'https://api.payphonetodoesposible.com/api';
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function createPaymentLink(params: CreateLinkParams): Promise<{ paymentId: number; payUrl: string }> {
  const { config, amountCents, clientTransactionId, email, reference, phoneNumber } = params;
  const storeId = parseInt(config.storeId) || config.storeId;

  const body: Record<string, unknown> = {
    amount: amountCents,
    amountWithoutTax: amountCents,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    clientTransactionId,
    reference,
    storeId,
    currency: 'USD',
    email: email || 'cliente@aloec.com',
  };
  if (phoneNumber) body.phoneNumber = phoneNumber.replace(/\D/g, '');

  const res = await fetch(`${baseUrl(config.isSandbox)}/Pay`, {
    method: 'POST',
    headers: headers(config.token),
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Payphone HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  let decoded: unknown;
  try { decoded = JSON.parse(text); } catch { throw new Error('Respuesta inválida de Payphone'); }

  const map = decoded as Record<string, unknown>;
  const rawId = map['paymentId'] ?? map['id'] ?? map['transactionId'];
  const paymentId = typeof rawId === 'number' ? rawId
    : typeof rawId === 'string' ? parseInt(rawId) : 0;
  const payUrl = (map['payWithPayPhone'] ?? map['payUrl'] ?? map['url'] ?? map['paymentUrl']) as string | undefined;

  if (!payUrl) throw new Error('Payphone no devolvió URL de pago');
  return { paymentId, payUrl };
}

export async function getPaymentStatus(paymentId: number, config: PayphoneConfig): Promise<PayphoneStatus> {
  const res = await fetch(`${baseUrl(config.isSandbox)}/Pay/${paymentId}`, {
    headers: headers(config.token),
  });
  if (!res.ok) throw new Error(`Payphone status HTTP ${res.status}`);
  return res.json() as Promise<PayphoneStatus>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/payphone/client.ts
git commit -m "feat: add server-side Payphone API client"
```

---

## Task 4: Webhook de confirmación de pago

**Files:**
- Create: `src/app/api/payphone/webhook/route.ts`

**Interfaces:**
- Consumes: `getAdminDb()`, `getPayphoneConfig()`, `getPaymentStatus()`
- Webhook recibe POST de Payphone con body: `{ clientTransactionId: string, id: number, statusCode: number }`
- Actualiza Firestore: `orders/{orderId}.status`, `users/{userId}.isPremium`

- [ ] **Step 1: Crear `src/app/api/payphone/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase/admin';
import { getPayphoneConfig, getPaymentStatus } from '../../../../lib/payphone/client';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      clientTransactionId?: string;
      id?: number;
      statusCode?: number;
    };

    const clientTransactionId = body.clientTransactionId;
    const paymentId = body.id;

    if (!clientTransactionId || !paymentId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar estado real con Payphone (no confiar en el body del webhook)
    const config = await getPayphoneConfig();
    const status = await getPaymentStatus(paymentId, config);

    const db = getAdminDb();

    // Buscar la orden por clientTransactionId
    const ordersSnap = await db.collection('orders')
      .where('clientTransactionId', '==', clientTransactionId)
      .limit(1)
      .get();

    if (ordersSnap.empty) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const orderDoc = ordersSnap.docs[0];
    const orderData = orderDoc.data();

    if (status.statusCode === 3) {
      // Pago aprobado
      const batch = db.batch();

      // Actualizar orden
      batch.update(orderDoc.ref, {
        status: 'paid',
        transactionId: String(paymentId),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Activar membresía del usuario
      const userRef = db.collection('users').doc(orderData.userId);
      batch.update(userRef, {
        isPremium: true,
        membershipId: orderData.membershipId,
        membershipUpdatedAt: FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return NextResponse.json({ ok: true, status: 'paid' });
    }

    if (status.statusCode === 2) {
      // Cancelado
      await orderDoc.ref.update({
        status: 'failed',
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, status: 'failed' });
    }

    return NextResponse.json({ ok: true, status: 'pending' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    console.error('[webhook]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/payphone/webhook/route.ts
git commit -m "feat: add Payphone webhook endpoint for payment confirmation"
```

---

## Task 5: Página de checkout pública

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/app/checkout/loading.tsx`

**Interfaces:**
- Consumes: `verifyCheckoutToken()`, `getPayphoneConfig()`, `createPaymentLink()`, `getAdminDb()`
- URL de entrada: `/checkout?t=<token>` donde token contiene `userId:planId`
- Si el pago es exitoso, Payphone redirige a `/checkout/success?id=<paymentId>`
- La página es pública (no requiere auth del admin)

- [ ] **Step 1: Crear `src/app/checkout/loading.tsx`**

```typescript
export default function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008000] mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Preparando tu pago...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crear `src/app/checkout/page.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { verifyCheckoutToken } from '../../lib/checkout/token';
import { getPayphoneConfig, createPaymentLink } from '../../lib/payphone/client';
import { getAdminDb } from '../../lib/firebase/admin';

interface CheckoutPageProps {
  searchParams: { t?: string };
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const token = searchParams.t;
  if (!token) {
    return <ErrorView message="Enlace de pago inválido." />;
  }

  const session = verifyCheckoutToken(token);
  if (!session) {
    return <ErrorView message="El enlace expiró o es inválido. Vuelve a la app y reintenta." />;
  }

  const { userId, planId } = session;

  // Leer datos del plan desde Firestore
  let planName = '';
  let amountCents = 0;
  let userEmail = 'cliente@aloec.com';

  try {
    const db = getAdminDb();
    const [planSnap, userSnap] = await Promise.all([
      db.collection('memberships').doc(planId).get(),
      db.collection('users').doc(userId).get(),
    ]);

    if (!planSnap.exists) return <ErrorView message="Plan no encontrado." />;
    const plan = planSnap.data()!;
    planName = plan.name ?? '';
    amountCents = Math.round((plan.price ?? 0) * 100);
    if (userSnap.exists) userEmail = userSnap.data()!.email ?? userEmail;
  } catch (err) {
    console.error('[checkout] Firestore error:', err);
    return <ErrorView message="Error al cargar los datos del plan." />;
  }

  // Crear orden pendiente en Firestore
  const clientTransactionId = `ALOEC-${userId.slice(0, 8)}-${Date.now()}`;
  const orderId = `order_${Date.now()}`;

  try {
    const db = getAdminDb();
    await db.collection('orders').doc(orderId).set({
      userId,
      userEmail,
      membershipId: planId,
      membershipName: planName,
      amount: amountCents / 100,
      status: 'pending',
      paymentMethod: 'PayPhone',
      transactionId: '',
      clientTransactionId,
      invoiceNumber: `ALOEC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error('[checkout] Order creation error:', err);
    return <ErrorView message="Error al crear la orden de pago." />;
  }

  // Crear link de pago en Payphone (server-side)
  let payUrl = '';
  try {
    const config = await getPayphoneConfig();
    const result = await createPaymentLink({
      amountCents,
      clientTransactionId,
      email: userEmail,
      reference: `Suscripcion ${planName} - ALOEC`,
      config,
    });
    payUrl = result.payUrl;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[checkout] Payphone error:', msg);
    return <ErrorView message={`Error al conectar con Payphone: ${msg}`} />;
  }

  // Redirigir directamente al iframe de Payphone
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 bg-[#008000]/10 flex items-center justify-center font-bold text-[#008000] text-xs">
          PP
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Pago seguro — ALOEC</p>
          <p className="text-xs text-gray-500">{planName} · ${(amountCents / 100).toFixed(2)}</p>
        </div>
      </div>
      <iframe
        src={payUrl}
        className="flex-1 w-full border-0"
        style={{ minHeight: 'calc(100vh - 56px)' }}
        allow="payment"
        title="Pasarela de pago Payphone"
      />
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-sm">
        <div className="text-red-500 text-4xl mb-4">✕</div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Error de pago</h1>
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-xs text-gray-400 mt-4">Cierra esta ventana y vuelve a la app.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/checkout/
git commit -m "feat: add public checkout page with server-side Payphone link creation"
```

---

## Task 6: Modificar Flutter — reemplazar lógica Payphone por WebView + listener Firestore

**Files:**
- Modify: `aloec_mobile/lib/features/subscriptions/presentation/screens/checkout_screen.dart`
- Modify: `aloec_mobile/lib/features/subscriptions/data/gateway_repository.dart`

**Interfaces:**
- Consumes: URL base del checkout de Vercel desde Firestore `gateways/payphone.checkoutUrl`
- El token de sesión lo genera la app con formato base64url: `userId:planId:timestamp:hmac`
- La app escucha `users/{userId}.isPremium` en Firestore para detectar pago exitoso

> **NOTA:** El HMAC en la app Flutter usa el mismo `CHECKOUT_SECRET` que Next.js. Este secreto debe almacenarse en Firestore en `gateways/payphone.checkoutSecret` para que la app lo lea. Nunca hardcodearlo en el APK.

- [ ] **Step 1: Agregar `checkoutUrl` y `checkoutSecret` al `GatewayConfig` en Flutter**

Modificar `aloec_mobile/lib/features/subscriptions/data/gateway_repository.dart`:

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class GatewayConfig {
  final String token;
  final String storeId;
  final bool isActive;
  final String environment;
  final String checkoutUrl;     // URL base de Vercel, ej: https://aloec-admin.vercel.app
  final String checkoutSecret;  // Secreto HMAC compartido

  GatewayConfig({
    required this.token,
    required this.storeId,
    required this.isActive,
    required this.environment,
    required this.checkoutUrl,
    required this.checkoutSecret,
  });

  factory GatewayConfig.fromFirestore(Map<String, dynamic> data) {
    return GatewayConfig(
      token: data['secretKey'] ?? '',
      storeId: data['publicKey'] ?? '',
      isActive: data['isActive'] ?? false,
      environment: data['environment'] ?? 'sandbox',
      checkoutUrl: data['checkoutUrl'] ?? '',
      checkoutSecret: data['checkoutSecret'] ?? '',
    );
  }
}

class GatewayRepository {
  final FirebaseFirestore _firestore;

  GatewayRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<GatewayConfig?> getPayphoneConfig() async {
    final doc = await _firestore.collection('gateways').doc('payphone').get();
    if (!doc.exists) return null;
    final config = GatewayConfig.fromFirestore(doc.data()!);
    if (!config.isActive) return null;
    return config;
  }
}
```

- [ ] **Step 2: Reemplazar `checkout_screen.dart` completo**

```dart
import 'dart:async';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/gateway_repository.dart';
import '../../data/memberships_repository.dart';

class CheckoutScreen extends StatefulWidget {
  final MembershipEntity? membership;
  const CheckoutScreen({super.key, this.membership});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _gatewayRepo = GatewayRepository();

  bool _loading = true;
  String? _error;
  String? _checkoutUrl;
  late final WebViewController _webViewController;
  StreamSubscription<DocumentSnapshot>? _userListener;

  @override
  void initState() {
    super.initState();
    _initializeCheckout();
  }

  @override
  void dispose() {
    _userListener?.cancel();
    super.dispose();
  }

  String _buildToken(String userId, String planId, String secret) {
    final ts = DateTime.now().millisecondsSinceEpoch.toString();
    final payload = '$userId:$planId:$ts';
    final sig = Hmac(sha256, utf8.encode(secret))
        .convert(utf8.encode(payload))
        .toString();
    final raw = '$payload:$sig';
    return base64Url.encode(utf8.encode(raw)).replaceAll('=', '');
  }

  Future<void> _initializeCheckout() async {
    final membership = widget.membership;
    if (membership == null) {
      setState(() { _error = 'No se ha seleccionado ninguna membresía'; _loading = false; });
      return;
    }

    final config = await _gatewayRepo.getPayphoneConfig();
    if (config == null || config.checkoutUrl.isEmpty) {
      setState(() { _error = 'Pasarela de pago no configurada. Contacta al administrador.'; _loading = false; });
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() { _error = 'Debes iniciar sesión para continuar'; _loading = false; });
      return;
    }

    final token = _buildToken(user.uid, membership.id, config.checkoutSecret);
    final url = '${config.checkoutUrl}/checkout?t=$token';

    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) => debugPrint('[checkout] navigating: $url'),
        onWebResourceError: (e) => debugPrint('[checkout] web error: ${e.description}'),
        onNavigationRequest: (req) => NavigationDecision.navigate,
      ))
      ..loadRequest(Uri.parse(url));

    // Escuchar isPremium en Firestore — se activa cuando el webhook lo confirma
    _userListener = FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots()
        .listen((snap) {
      if (!mounted) return;
      final data = snap.data();
      if (data != null && data['isPremium'] == true) {
        _userListener?.cancel();
        _showSuccessDialog();
      }
    });

    setState(() { _checkoutUrl = url; _loading = false; });
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_outline_rounded, color: AppColors.primaryGreen, size: 64),
            const SizedBox(height: 16),
            const Text('¡Pago Confirmado!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              'Tu membresía ${widget.membership?.name ?? "Premium"} ha sido activada.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () { Navigator.of(context).pop(); context.go('/home'); },
            child: const Text('Ir al inicio',
                style: TextStyle(color: AppColors.primaryGreen, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final price = widget.membership?.price ?? 0;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('Pagar \$${price.toStringAsFixed(2)}',
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircularProgressIndicator(color: AppColors.primaryGreen),
          SizedBox(height: 20),
          Text('Preparando pasarela de pagos...', style: TextStyle(color: Colors.grey, fontSize: 14)),
        ],
      ));
    }
    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Center(child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 56),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 15, color: Colors.black87)),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              onPressed: () { setState(() { _loading = true; _error = null; }); _initializeCheckout(); },
              child: const Text('Reintentar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        )),
      );
    }
    if (_checkoutUrl != null) return WebViewWidget(controller: _webViewController);
    return const Center(child: Text('Preparando pasarela...'));
  }
}
```

- [ ] **Step 3: Agregar dependencia `crypto` al pubspec.yaml**

```yaml
# En pubspec.yaml, bajo dependencies:
  crypto: ^3.0.3
```

Ejecutar:
```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
flutter pub get
```

- [ ] **Step 4: Commit**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
git add lib/features/subscriptions/presentation/screens/checkout_screen.dart
git add lib/features/subscriptions/data/gateway_repository.dart
git add pubspec.yaml pubspec.lock
git commit -m "feat: replace native Payphone SDK with Vercel web checkout + Firestore listener"
```

---

## Task 7: Actualizar panel admin — mostrar URL del checkout + campos nuevos

**Files:**
- Modify: `aloec_admin/src/app/(dashboard)/gateways/page.tsx`

**Interfaces:**
- Agrega campos en el formulario de Payphone: `checkoutUrl` y `checkoutSecret`
- Los guarda en Firestore `gateways/payphone` junto a los campos existentes

- [ ] **Step 1: Modificar `gateways/page.tsx` — agregar estado y campos**

Agregar después de `const [payphoneEnv, setPayphoneEnv]`:
```typescript
const [payphoneCheckoutUrl, setPayphoneCheckoutUrl] = useState('');
const [payphoneCheckoutSecret, setPayphoneCheckoutSecret] = useState('');
```

En el bloque de lectura de Firestore (dentro de `loadConfigs`), agregar:
```typescript
setPayphoneCheckoutUrl(d.checkoutUrl || '');
setPayphoneCheckoutSecret(d.checkoutSecret || '');
```

En el objeto `ppData` dentro de `handleSavePayphone`, agregar:
```typescript
checkoutUrl: payphoneCheckoutUrl.trim(),
checkoutSecret: payphoneCheckoutSecret.trim(),
```

En el JSX del formulario de Payphone, agregar antes del botón de guardar:
```tsx
<div>
  <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
    <Globe size={12} /> URL del Checkout (Vercel)
  </label>
  <input
    type="text"
    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
    placeholder="https://tu-admin.vercel.app"
    value={payphoneCheckoutUrl}
    onChange={(e) => setPayphoneCheckoutUrl(e.target.value)}
    disabled={saving}
  />
  <p className="text-xs text-ink-400 mt-1">URL base donde está desplegado el admin en Vercel</p>
</div>

<div>
  <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
    <Key size={12} /> Secreto del Checkout
  </label>
  <input
    type="password"
    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
    placeholder="aloec_checkout_secret_2026"
    value={payphoneCheckoutSecret}
    onChange={(e) => setPayphoneCheckoutSecret(e.target.value)}
    disabled={saving}
  />
  <p className="text-xs text-ink-400 mt-1">Debe coincidir exactamente con CHECKOUT_SECRET en Vercel</p>
</div>
```

- [ ] **Step 2: Commit**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin"
git add src/app/(dashboard)/gateways/page.tsx
git commit -m "feat: add checkoutUrl and checkoutSecret fields to gateways admin panel"
```

---

## Task 8: Deploy a Vercel y configurar variables de entorno

**Files:** (configuración externa, no código)

- [ ] **Step 1: Subir cambios del admin a GitHub**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_admin"
git push origin main
```

- [ ] **Step 2: Configurar variables de entorno en Vercel**

En el dashboard de Vercel → proyecto del admin → Settings → Environment Variables, agregar:

| Variable | Valor |
|----------|-------|
| `FIREBASE_PROJECT_ID` | `app-aloec` |
| `FIREBASE_CLIENT_EMAIL` | (del JSON de service account) |
| `FIREBASE_PRIVATE_KEY` | (del JSON de service account, con `\n` literales) |
| `CHECKOUT_SECRET` | `aloec_checkout_secret_2026` |

- [ ] **Step 3: En el panel admin web (ya deployado), ir a Pasarelas de Pago y completar:**

- **URL del Checkout:** `https://[tu-proyecto].vercel.app`
- **Secreto del Checkout:** `aloec_checkout_secret_2026`
- Guardar

- [ ] **Step 4: En Payphone, configurar la URL de retorno/webhook:**

En el dashboard de Payphone → configuración de la tienda:
- **URL de confirmación (webhook):** `https://[tu-proyecto].vercel.app/api/payphone/webhook`

- [ ] **Step 5: Build y deploy del APK con los cambios de Flutter**

```bash
cd "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/aloec_mobile"
flutter build apk --release
cp build/app/outputs/flutter-apk/app-release.apk \
   "/e/CLOUD WEBFIX/WEBFIX/SISTEMAS/appaloec/appaloecv12.apk"
```

---

## Flujo final de pago

```
App Flutter
  │
  └─→ Lee checkoutUrl + checkoutSecret de Firestore (gateways/payphone)
      │
      └─→ Genera token HMAC: base64url(userId:planId:timestamp:sig)
          │
          └─→ Abre WebView → https://vercel.app/checkout?t=<token>
              │
              └─→ Next.js (server): verifica token, lee plan de Firestore
                  │
                  ├─→ Crea orden 'pending' en Firestore
                  │
                  └─→ Llama Payphone API (server-side, token secreto)
                      │
                      └─→ Renderiza iframe de Payphone al usuario
                          │
                          └─→ Usuario paga en el iframe de Payphone
                              │
                              └─→ Payphone llama webhook POST /api/payphone/webhook
                                  │
                                  └─→ Next.js verifica status con Payphone
                                      │
                                      ├─→ Actualiza orden → 'paid' en Firestore
                                      └─→ Actualiza users/{userId}.isPremium = true
                                                      │
                                          App Flutter detecta cambio Firestore
                                                      │
                                          Muestra diálogo ¡Pago Confirmado!
```
