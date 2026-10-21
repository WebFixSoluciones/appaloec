import { NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { processOrderReferralCommission } from '../../../../../lib/referral/commissions';

export async function POST() {
  try {
    const db = getAdminDb();

    // Buscar todas las órdenes pagadas
    const ordersSnap = await db
      .collection('orders')
      .where('status', '==', 'paid')
      .get();

    let processedCount = 0;
    let createdCommissions = 0;
    const results = [];

    for (const orderDoc of ordersSnap.docs) {
      processedCount++;
      const res = await processOrderReferralCommission(orderDoc.id);
      if (res.success && res.commissionId) {
        createdCommissions++;
      }
      results.push({ orderId: orderDoc.id, ...res });
    }

    // Reconciliar y asegurar consistencia de balances para todos los afiliados
    const allCommsSnap = await db.collection('commissions').get();
    const affiliateTotals = new Map<string, { pending: number; approved: number; paid: number; rejected: number }>();

    for (const cDoc of allCommsSnap.docs) {
      const c = cDoc.data();
      const refUid = c.referrerUid;
      if (!refUid) continue;
      const amt = Number(c.amountUSD) || 0;
      if (!affiliateTotals.has(refUid)) {
        affiliateTotals.set(refUid, { pending: 0, approved: 0, paid: 0, rejected: 0 });
      }
      const entry = affiliateTotals.get(refUid)!;
      if (c.status === 'pending') entry.pending += amt;
      else if (c.status === 'approved') entry.approved += amt;
      else if (c.status === 'paid') entry.paid += amt;
      else if (c.status === 'rejected') entry.rejected += amt;
    }

    // Restar retiros completados de lo aprobado
    const payoutsSnap = await db.collection('payouts').where('status', '==', 'completed').get();
    const paidByUid = new Map<string, number>();
    for (const pDoc of payoutsSnap.docs) {
      const p = pDoc.data();
      if (!p.uid) continue;
      const amt = Number(p.amountUSD) || 0;
      paidByUid.set(p.uid, (paidByUid.get(p.uid) || 0) + amt);
    }

    // Actualizar usuarios con balance
    for (const [uid, totals] of Array.from(affiliateTotals.entries())) {
      const actualPaid = (paidByUid.get(uid) || 0) + totals.paid;
      const actualApproved = Math.max(0, totals.approved - (paidByUid.get(uid) || 0));

      await db.collection('users').doc(uid).set({
        affiliateBalance: {
          pendingUSD: Math.round(totals.pending * 100) / 100,
          approvedUSD: Math.round(actualApproved * 100) / 100,
          paidUSD: Math.round(actualPaid * 100) / 100,
          rejectedUSD: Math.round(totals.rejected * 100) / 100,
        }
      }, { merge: true });
    }

    return NextResponse.json({
      success: true,
      totalOrdersChecked: processedCount,
      commissionsCreated: createdCommissions,
      details: results,
    });
  } catch (error: any) {
    console.error('[sync-pending] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
