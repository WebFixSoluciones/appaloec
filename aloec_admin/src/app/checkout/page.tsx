import { verifyCheckoutToken } from '../../lib/checkout/token';
import { getAdminDb } from '../../lib/firebase/admin';
import { getPayphoneConfig } from '../../lib/payphone/client';
import PayphoneBox from './PayphoneBox';
import CheckoutForm from './CheckoutForm';
import Link from 'next/link';

interface CheckoutPageProps {
  searchParams: Promise<{ t?: string; plan?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const token = params.t;
  const planQueryId = params.plan;

  // Flow A: If t (Token) is present, render the PayPhone Payment Screen (App/WebView Flow)
  if (token) {
    const session = verifyCheckoutToken(token);
    if (!session) {
      return <ErrorView message="El enlace expiró o es inválido. Vuelve a la app y reintenta." />;
    }

    const { userId, planId } = session;

    let planName = '';
    let amountCents = 0;
    let userEmail = 'cliente@aloec.com';

    try {
      const db = getAdminDb();
      const [planSnap, userSnap] = await Promise.all([
        db.collection('memberships').doc(planId).get(),
        db.collection('users').doc(userId).get(),
      ]);
      if (!planSnap.exists) return <ErrorView message="Plan de suscripción no encontrado." />;
      const plan = planSnap.data()!;
      planName = plan.name ?? '';
      amountCents = Math.round((plan.price ?? 0) * 100);
      if (userSnap.exists) userEmail = userSnap.data()!.email ?? userEmail;
    } catch (err) {
      console.error('Error fetching plan/user details:', err);
      return <ErrorView message="Error al cargar los datos del plan." />;
    }

    const clientTransactionId = `AL${userId.slice(0, 5)}${Date.now().toString().slice(-8)}`;
    const orderId = `order_${Date.now()}`;

    try {
      const db = getAdminDb();
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Date.now().toString().slice(-4);
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
        invoiceNumber: `ALOEC-${datePart}-${randPart}`,
        createdAt: now,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Error saving order document:', err);
      return <ErrorView message="Error al crear la orden de pago." />;
    }

    let ppToken = '';
    let ppStoreId = '';
    try {
      const config = await getPayphoneConfig();
      ppToken = config.token;
      ppStoreId = config.storeId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      return <ErrorView message={`Error al conectar con la pasarela PayPhone: ${msg}`} />;
    }

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-xs">
          <div className="h-8 w-8 bg-[#008000]/10 flex items-center justify-center font-bold text-[#008000] text-xs rounded">
            PP
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Pago seguro — ALOEC</p>
            <p className="text-xs text-gray-500">
              {planName} · ${(amountCents / 100).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex-1 w-full">
          <PayphoneBox
            token={ppToken}
            storeId={ppStoreId}
            amountCents={amountCents}
            clientTransactionId={clientTransactionId}
            planName={planName}
            email={userEmail}
          />
        </div>
      </div>
    );
  }

  // Flow B: If t is missing but plan ID is present, render the Checkout Registration Form (Web/Landing Flow)
  if (planQueryId) {
    let planName = '';
    let price = 0;
    let durationDays = 30;

    try {
      const db = getAdminDb();
      const planSnap = await db.collection('memberships').doc(planQueryId).get();
      if (!planSnap.exists) {
        return <ErrorView message="El plan de suscripción seleccionado no existe o no está disponible." />;
      }
      const plan = planSnap.data()!;
      planName = plan.name ?? 'Plan ALOEC';
      price = Number(plan.price) || 0;
      durationDays = Number(plan.durationDays) || 30;
    } catch (err) {
      console.error('Error fetching plan in direct checkout:', err);
      return <ErrorView message="Error al recuperar los datos del plan." />;
    }

    return (
      <CheckoutForm 
        planId={planQueryId}
        planName={planName}
        price={price}
        durationDays={durationDays}
      />
    );
  }

  // Fallback: Neither token nor plan specified
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="text-center max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-lg space-y-5">
        <div className="text-emerald-500 text-5xl">🌱</div>
        <h1 className="text-xl font-black text-slate-900">Checkout ALOEC</h1>
        <p className="text-sm text-slate-600">
          Por favor, selecciona un plan de suscripción desde nuestro sitio web para iniciar el proceso de compra.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md transform active:scale-95"
        >
          Ver Planes Disponibles
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="text-center max-w-sm bg-white border border-red-100 p-8 rounded-3xl shadow-lg space-y-4">
        <div className="text-red-500 text-5xl">✕</div>
        <h1 className="text-lg font-black text-slate-900">Error de Pago</h1>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
