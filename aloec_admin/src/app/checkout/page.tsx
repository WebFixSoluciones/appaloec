import { verifyCheckoutToken } from '../../lib/checkout/token';
import { getPayphoneConfig, createPaymentLink } from '../../lib/payphone/client';
import { getAdminDb } from '../../lib/firebase/admin';

interface CheckoutPageProps {
  searchParams: Promise<{ t?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const token = params.t;

  if (!token) {
    return <ErrorView message="Enlace de pago inválido." />;
  }

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

    if (!planSnap.exists) return <ErrorView message="Plan no encontrado." />;
    const plan = planSnap.data()!;
    planName = plan.name ?? '';
    amountCents = Math.round((plan.price ?? 0) * 100);
    if (userSnap.exists) userEmail = userSnap.data()!.email ?? userEmail;
  } catch (err) {
    console.error('[checkout] Firestore error:', err);
    return <ErrorView message="Error al cargar los datos del plan." />;
  }

  const clientTransactionId = `ALOEC-${userId.slice(0, 8)}-${Date.now()}`;
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
    console.error('[checkout] Order creation error:', err);
    return <ErrorView message="Error al crear la orden de pago." />;
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
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
        <div className="text-red-500 text-5xl mb-4">✕</div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Error de pago</h1>
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-xs text-gray-400 mt-4">Cierra esta ventana y vuelve a la app.</p>
      </div>
    </div>
  );
}
