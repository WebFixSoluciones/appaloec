import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { commissionId, status } = await req.json();

    if (!commissionId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const db = getAdminDb();
    const commRef = db.collection('commissions').doc(commissionId);
    const commSnap = await commRef.get();

    if (!commSnap.exists) {
      return NextResponse.json({ error: 'Comisión no encontrada' }, { status: 404 });
    }

    const commData = commSnap.data()!;
    const prevStatus = commData.status || 'pending';
    const amountUSD = Number(commData.amountUSD) || 0;
    const referrerUid = commData.referrerUid;

    if (prevStatus === status) {
      return NextResponse.json({ success: true, message: 'El estado ya es el mismo' });
    }

    const batch = db.batch();

    // Actualizar documento de comisión
    const updatePayload: any = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
      [`statusLog.${Date.now()}`]: {
        status,
        timestamp: new Date(),
        actorUid: 'admin',
      },
    };

    if (status === 'approved') {
      updatePayload.releasedAt = FieldValue.serverTimestamp();
    }

    batch.update(commRef, updatePayload);

    // Ajustar balances del afiliado
    if (referrerUid && amountUSD > 0) {
      const userRef = db.collection('users').doc(referrerUid);
      const balanceUpdates: any = {
        'affiliateBalance.updatedAt': FieldValue.serverTimestamp(),
      };

      if (prevStatus === 'pending' && status === 'approved') {
        balanceUpdates['affiliateBalance.pendingUSD'] = FieldValue.increment(-amountUSD);
        balanceUpdates['affiliateBalance.approvedUSD'] = FieldValue.increment(amountUSD);
      } else if (prevStatus === 'pending' && status === 'rejected') {
        balanceUpdates['affiliateBalance.pendingUSD'] = FieldValue.increment(-amountUSD);
        balanceUpdates['affiliateBalance.rejectedUSD'] = FieldValue.increment(amountUSD);
      } else if (prevStatus === 'approved' && status === 'rejected') {
        balanceUpdates['affiliateBalance.approvedUSD'] = FieldValue.increment(-amountUSD);
        balanceUpdates['affiliateBalance.rejectedUSD'] = FieldValue.increment(amountUSD);
      }

      batch.set(userRef, balanceUpdates, { merge: true });
    }

    // Registrar en auditoría
    const auditRef = db.collection('audit_logs').doc();
    batch.set(auditRef, {
      action: 'UPDATE',
      collection: 'commissions',
      targetId: commissionId,
      details: {
        description: `Comisión ${commissionId} cambiada de ${prevStatus} a ${status}`,
        amountUSD,
        referrerUid,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[commission-status] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
