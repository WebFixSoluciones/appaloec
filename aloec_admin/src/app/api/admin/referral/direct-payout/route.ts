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

    const totalEarned = curApproved + curPending;
    if (payAmount > totalEarned + 0.01) {
      return NextResponse.json(
        { error: `El monto a pagar ($${payAmount.toFixed(2)}) supera el saldo total del afiliado ($${totalEarned.toFixed(2)})` },
        { status: 400 }
      );
    }

    const batch = db.batch();

    // Si el monto a pagar excede lo aprobado, liberar automáticamente de lo pendiente
    let newPending = curPending;
    let newApproved = curApproved;
    const neededFromPending = Math.max(0, Math.round((payAmount - curApproved) * 100) / 100);

    if (neededFromPending > 0) {
      newPending = Math.max(0, Math.round((curPending - neededFromPending) * 100) / 100);
      newApproved = 0;

      // Actualizar las comisiones pendientes a aprobadas
      const pendingCommsSnap = await db
        .collection('commissions')
        .where('referrerUid', '==', uid)
        .where('status', '==', 'pending')
        .get();

      let remainingToRelease = neededFromPending;
      for (const cDoc of pendingCommsSnap.docs) {
        if (remainingToRelease <= 0) break;
        const cAmt = Number(cDoc.data().amountUSD) || 0;
        batch.update(cDoc.ref, {
          status: 'approved',
          releasedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        remainingToRelease -= cAmt;
      }
    } else {
      newApproved = Math.max(0, Math.round((curApproved - payAmount) * 100) / 100);
    }

    const newPaid = Math.round((curPaid + payAmount) * 100) / 100;

    // 1. Crear documento en 'payouts' como completado
    const payoutRef = db.collection('payouts').doc();
    batch.set(payoutRef, {
      uid,
      userName: userData.displayName || 'Afiliado',
      userEmail: userData.email || '',
      amountUSD: payAmount,
      status: 'completed',
      methodSnapshot: methodSnapshot || { type: 'binance', label: 'Binance Pay' },
      transactionReference: transactionReference ? String(transactionReference).trim() : '',
      notes: notes ? String(notes).trim() : '',
      processedBy: 'admin',
      processedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 2. Actualizar balances del afiliado
    batch.set(
      userRef,
      {
        affiliateBalance: {
          pendingUSD: newPending,
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
