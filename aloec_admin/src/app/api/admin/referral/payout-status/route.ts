import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { payoutId, status } = await req.json();

    if (!payoutId || !status || !['processing', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const db = getAdminDb();
    const payoutRef = db.collection('payouts').doc(payoutId);
    const payoutSnap = await payoutRef.get();

    if (!payoutSnap.exists) {
      return NextResponse.json({ error: 'Solicitud de pago no encontrada' }, { status: 404 });
    }

    const payoutData = payoutSnap.data()!;
    const prevStatus = payoutData.status || 'pending';
    const amountUSD = Number(payoutData.amountUSD) || 0;
    const uid = payoutData.uid;

    if (prevStatus === status) {
      return NextResponse.json({ success: true, message: 'El estado ya es el mismo' });
    }

    const batch = db.batch();

    const updatePayload: any = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === 'completed') {
      updatePayload.processedAt = FieldValue.serverTimestamp();
    }

    batch.update(payoutRef, updatePayload);

    // Si pasa a completado: restar de approvedUSD y sumar a paidUSD
    if (uid && amountUSD > 0 && status === 'completed' && prevStatus !== 'completed') {
      const userRef = db.collection('users').doc(uid);
      batch.set(
        userRef,
        {
          affiliateBalance: {
            approvedUSD: FieldValue.increment(-amountUSD),
            paidUSD: FieldValue.increment(amountUSD),
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    }

    // Registrar en auditoría
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      action: 'UPDATE',
      collection: 'payouts',
      targetId: payoutId,
      details: {
        description: `Pago ${payoutId} cambiado de ${prevStatus} a ${status}`,
        amountUSD,
        uid,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[payout-status] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
