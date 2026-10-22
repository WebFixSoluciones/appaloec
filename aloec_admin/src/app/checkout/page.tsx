import { verifyCheckoutToken } from '../../lib/checkout/token';
import { getAdminDb } from '../../lib/firebase/admin';
import { getPayphoneConfig } from '../../lib/payphone/client';
import CheckoutView from './CheckoutView';
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

    let userCountry = 'EC';
    let bankConfig: any = null;

    try {
      const db = getAdminDb();
      const [planSnap, userSnap, bankSnap] = await Promise.all([
        db.collection('memberships').doc(planId).get(),
        db.collection('users').doc(userId).get(),
        db.collection('gateways').doc('bank_transfer').get(),
      ]);
      if (!planSnap.exists) return <ErrorView message="Plan de suscripción no encontrado." />;
      const plan = planSnap.data()!;
      planName = plan.name ?? '';
      amountCents = Math.round((plan.price ?? 0) * 100);
      if (userSnap.exists) {
        const uData = userSnap.data()!;
        userEmail = uData.email ?? userEmail;
        userCountry = uData.country || (uData.phone?.startsWith('+593') || uData.phone?.startsWith('09') ? 'EC' : 'EC');
      }

      if (bankSnap.exists) {
        const bData = bankSnap.data()!;
        bankConfig = {
          isActive: bData.isActive !== false,
          whatsappNumber: bData.whatsappNumber || '0967791142',
          supportEmail: bData.supportEmail || 'sasaloec@gmail.com',
          instructions: bData.instructions || '',
          accounts: (bData.accounts || []).map((acc: any) => ({
            id: acc.id || 'acc_1',
            bankName: acc.bankName || 'Banco Pichincha',
            accountType: acc.accountType || 'Ahorros',
            accountNumber: acc.accountNumber || '',
            holderName: acc.holderName || '',
            idNumber: acc.idNumber || '',
            email: acc.email || '',
            isActive: acc.isActive !== false,
          })),
        };
      } else {
        // Fallback para asegurar que Transferencia Bancaria siempre esté activa
        bankConfig = {
          isActive: true,
          whatsappNumber: '0967791142',
          supportEmail: 'sasaloec@gmail.com',
          instructions: 'Por favor realiza la transferencia bancaria por el valor exacto de la membresía y adjunta tu comprobante.',
          accounts: [
            {
              id: 'acc_pichincha_1',
              bankName: 'Banco Pichincha',
              accountType: 'Ahorros',
              accountNumber: '2200910810',
              holderName: 'Jose Rengifo',
              idNumber: '1717340846',
              email: 'sasaloec@gmail.com',
              isActive: true,
            }
          ],
        };
      }
    } catch (err) {
      console.error('Error fetching plan/user details:', err);
      return <ErrorView message="Error al cargar los datos del plan." />;
    }

    const clientTransactionId = `AL${userId.slice(0, 5)}${Date.now().toString().slice(-8)}`;
    const orderId = `order_${Date.now()}`;
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Date.now().toString().slice(-4);
    const invoiceNumber = `ALOEC-${datePart}-${randPart}`;

    try {
      const db = getAdminDb();
      await db.collection('orders').doc(orderId).set({
        userId,
        userEmail,
        membershipId: planId,
        membershipName: planName,
        amount: amountCents / 100,
        status: 'pending',
        paymentMethod: userCountry === 'EC' ? 'bank_transfer' : 'PayPhone',
        transactionId: '',
        clientTransactionId,
        invoiceNumber,
        country: userCountry,
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
      <CheckoutView
        orderId={orderId}
        invoiceNumber={invoiceNumber}
        clientTransactionId={clientTransactionId}
        token={token}
        userId={userId}
        planName={planName}
        amountCents={amountCents}
        email={userEmail}
        initialCountry={userCountry}
        ppToken={ppToken}
        ppStoreId={ppStoreId}
        bankConfig={bankConfig}
      />
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
