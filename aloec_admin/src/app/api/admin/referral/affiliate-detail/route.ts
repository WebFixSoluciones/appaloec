import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Falta uid del afiliado' }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = userSnap.data()!;

    // 1. Obtener métodos de cobro registrados en la subcolección
    const methodsSnap = await userRef.collection('payout_methods').get();
    const payoutMethods = methodsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // 2. Obtener usuarios referidos por este afiliado
    const [referredSnap1, referredSnap2] = await Promise.all([
      db.collection('users').where('referral.referredByUid', '==', uid).limit(50).get(),
      db.collection('users').where('referredByUid', '==', uid).limit(50).get(),
    ]);

    const referredMap = new Map<string, any>();
    referredSnap1.docs.forEach(d => {
      const u = d.data();
      referredMap.set(d.id, {
        uid: d.id,
        displayName: u.displayName || 'Sin nombre',
        email: u.email || '',
        createdAt: u.createdAt,
        isPremium: !!u.isPremium,
        status: u.status || 'active',
      });
    });
    referredSnap2.docs.forEach(d => {
      if (!referredMap.has(d.id)) {
        const u = d.data();
        referredMap.set(d.id, {
          uid: d.id,
          displayName: u.displayName || 'Sin nombre',
          email: u.email || '',
          createdAt: u.createdAt,
          isPremium: !!u.isPremium,
          status: u.status || 'active',
        });
      }
    });

    // 3. Obtener comisiones del afiliado
    const commsSnap = await db
      .collection('commissions')
      .where('referrerUid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const commissions = commsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // 4. Obtener retiros/pagos del afiliado
    const payoutsSnap = await db
      .collection('payouts')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const payouts = payoutsSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({
      success: true,
      user: {
        uid,
        displayName: userData.displayName || 'Sin nombre',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'user',
        isPremium: !!userData.isPremium,
        membershipName: userData.membershipName || (userData.isPremium ? 'Premium' : 'Gratis'),
        referralCode: userData.referral?.code || userData.referralCode || '',
        affiliateBalance: userData.affiliateBalance || {
          pendingUSD: 0,
          approvedUSD: 0,
          paidUSD: 0,
          rejectedUSD: 0,
        },
        createdAt: userData.createdAt,
      },
      payoutMethods,
      referredUsers: Array.from(referredMap.values()),
      commissions,
      payouts,
    });
  } catch (error: any) {
    console.error('[affiliate-detail route] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
