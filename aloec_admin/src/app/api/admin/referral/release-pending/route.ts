import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'Falta uid de afiliado' }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const pendingCommsSnap = await db
      .collection('commissions')
      .where('referrerUid', '==', uid)
      .where('status', '==', 'pending')
      .get();

    if (pendingCommsSnap.empty) {
      return NextResponse.json({ success: true, message: 'No hay comisiones pendientes', releasedUSD: 0 });
    }

    const batch = db.batch();
    let totalReleased = 0;

    for (const cDoc of pendingCommsSnap.docs) {
      const amt = Number(cDoc.data().amountUSD) || 0;
      totalReleased += amt;
      batch.update(cDoc.ref, {
        status: 'approved',
        releasedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const curBal = userSnap.data()?.affiliateBalance || { pendingUSD: 0, approvedUSD: 0, paidUSD: 0, rejectedUSD: 0 };
    const curPending = Number(curBal.pendingUSD) || 0;
    const curApproved = Number(curBal.approvedUSD) || 0;

    const newPending = Math.max(0, Math.round((curPending - totalReleased) * 100) / 100);
    const newApproved = Math.round((curApproved + totalReleased) * 100) / 100;

    batch.set(
      userRef,
      {
        affiliateBalance: {
          pendingUSD: newPending,
          approvedUSD: newApproved,
          paidUSD: Number(curBal.paidUSD) || 0,
          rejectedUSD: Number(curBal.rejectedUSD) || 0,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // Auditoría
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      action: 'UPDATE',
      collection: 'commissions',
      targetId: uid,
      details: {
        description: `Comisiones pendientes liberadas ($${totalReleased.toFixed(2)}) para usuario ${uid}`,
        totalReleased,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      releasedUSD: totalReleased,
      newPending,
      newApproved,
    });
  } catch (error: any) {
    console.error('[release-pending route] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
