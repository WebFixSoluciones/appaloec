import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase/admin';
import { getPayphoneConfig, confirmPayment } from '../../../../lib/payphone/client';
import { notifyAdmin } from '../../../../lib/notify/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const clientTransactionId = searchParams.get('clientTransactionId');

  if (!id || !clientTransactionId) {
    return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=error');
  }

  const paymentId = parseInt(id);

  try {
    const config = await getPayphoneConfig();
    const status = await confirmPayment(paymentId, clientTransactionId, config);
    const db = getAdminDb();

    const ordersSnap = await db
      .collection('orders')
      .where('clientTransactionId', '==', clientTransactionId)
      .limit(1)
      .get();

    if (ordersSnap.empty) {
      return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=error');
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
      batch.set(userRef, {
        email: orderData.userEmail || '',
        displayName: orderData.userEmail?.split('@')[0] || 'Usuario',
        isPremium: true,
        role: 'user',
        status: 'active',
        membershipId: orderData.membershipId,
        membershipUpdatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      // Asignar protocolo según último IMC registrado
      try {
        const bmiSnap = await db
          .collection('users')
          .doc(orderData.userId)
          .collection('bmi_records')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!bmiSnap.empty) {
          const latestBmi = bmiSnap.docs[0].data();
          const bmiValue = latestBmi.bmiValue as number | undefined;
          let categoryKey: string | null = null;
          if (bmiValue != null) {
            if (bmiValue < 18.5) categoryKey = 'underweight';
            else if (bmiValue < 25) categoryKey = 'normal';
            else if (bmiValue < 30) categoryKey = 'overweight';
            else if (bmiValue < 35) categoryKey = 'obesity1';
            else if (bmiValue < 40) categoryKey = 'obesity2';
            else categoryKey = 'obesity3';
          }
          if (categoryKey) {
            const protocolSnap = await db
              .collection('diet_protocols')
              .where('bmiCategory', '==', categoryKey)
              .where('isActive', '==', true)
              .limit(1)
              .get();
            if (!protocolSnap.empty) {
              batch.update(userRef, {
                activeProtocolId: protocolSnap.docs[0].id,
              });
            }
          }
        }
      } catch (e) {
        console.error('[confirm] Error al asignar protocolo:', e);
      }

      await batch.commit();

      notifyAdmin(
        'Nuevo pago confirmado - ALOEC',
        `Usuario: ${orderData.userEmail}\nPlan: ${orderData.membershipName}\nMonto: $${orderData.amount}\nID Pago: ${paymentId}`
      ).catch(() => {});

      return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=paid');
    }

    if (status.statusCode === 2) {
      await orderDoc.ref.update({
        status: 'failed',
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=failed');
    }

    return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=pending');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    console.error('[confirm]', msg);
    return NextResponse.redirect('https://app.alimentacionorganicaec.net/checkout/result?status=error');
  }
}
