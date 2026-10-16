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
