import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { uid, amountUSD, methodSnapshot, transactionReference, notes } = await req.json();

    if (!uid || !amountUSD || Number(amountUSD) <= 0) {
      return NextResponse.json({ error: 'Monto y usuario requeridos' }, { status: 400 });
    }

    const payAmount = Number(amountUSD);
    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userSnap.data()!;
    const curBal = userData.affiliateBalance || { approvedUSD: 0, paidUSD: 0, pendingUSD: 0, rejectedUSD: 0 };
    const curApproved = Number(curBal.approvedUSD) || 0;
    const curPaid = Number(curBal.paidUSD) || 0;
    const curPending = Number(curBal.pendingUSD) || 0;
    const curRejected = Number(curBal.rejectedUSD) || 0;

    if (payAmount > curApproved + 0.01) {
      return NextResponse.json(
        { error: `El monto a pagar ($${payAmount.toFixed(2)}) supera el saldo disponible ($${curApproved.toFixed(2)})` },
        { status: 400 }
      );
    }

    const batch = db.batch();

    // 1. Crear documento en 'payouts' como completado
    const payoutRef = db.collection('payouts').doc();
    batch.set(payoutRef, {
      uid,
      userName: userData.displayName || 'Afiliado',
      userEmail: userData.email || '',
      amountUSD: payAmount,
      status: 'completed',
      methodSnapshot: methodSnapshot || { type: 'manual_transfer', label: 'Transferencia Directa' },
      transactionReference: transactionReference ? String(transactionReference).trim() : '',
      notes: notes ? String(notes).trim() : '',
      processedBy: 'admin',
      processedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 2. Actualizar balances del afiliado
    const newApproved = Math.max(0, Math.round((curApproved - payAmount) * 100) / 100);
    const newPaid = Math.round((curPaid + payAmount) * 100) / 100;

    batch.set(
      userRef,
      {
        affiliateBalance: {
          pendingUSD: curPending,
          approvedUSD: newApproved,
          paidUSD: newPaid,
          rejectedUSD: curRejected,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // 3. Auditoría
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      action: 'CREATE',
      collection: 'payouts',
      targetId: payoutRef.id,
      details: {
        description: `Pago directo registrado para ${userData.email || userData.displayName} por $${payAmount.toFixed(2)}`,
        amountUSD: payAmount,
        uid,
        transactionReference,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      payoutId: payoutRef.id,
      amountUSD: payAmount,
      newApproved,
      newPaid,
    });
  } catch (error: any) {
    console.error('[direct-payout route] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
