import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase/admin';
import { getPayphoneConfig, getPaymentStatus } from '../../../../lib/payphone/client';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      clientTransactionId?: string;
      id?: number;
      statusCode?: number;
    };

    const clientTransactionId = body.clientTransactionId;
    const paymentId = body.id;

    if (!clientTransactionId || !paymentId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar estado real con Payphone (no confiar ciegamente en el body del webhook)
    const config = await getPayphoneConfig();
    const status = await getPaymentStatus(paymentId, config);

    const db = getAdminDb();

    const ordersSnap = await db
      .collection('orders')
      .where('clientTransactionId', '==', clientTransactionId)
      .limit(1)
      .get();

    if (ordersSnap.empty) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const orderDoc = ordersSnap.docs[0];
    const orderData = orderDoc.data();

    if (status.statusCode === 3) {
      const batch = db.batch();

      batch.update(orderDoc.ref, {
        status: 'paid',
        transactionId: String(paymentId),
        updatedAt: FieldValue.serverTimestamp(),
      });

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
