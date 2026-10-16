import { getAdminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface CommissionResult {
  success: boolean;
  commissionId?: string;
  amountUSD?: number;
  reason?: string;
}

/**
 * Procesa la comisión de referidos tras una orden pagada (PayPhone u otro método).
 * Es totalmente idempotente: si la comisión ya fue calculada para esa orden, no se duplica.
 */
export async function processOrderReferralCommission(orderId: string): Promise<CommissionResult> {
  try {
    const db = getAdminDb();

    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return { success: false, reason: 'Orden no encontrada' };
    }

    const orderData = orderDoc.data()!;
    if (orderData.status !== 'paid') {
      return { success: false, reason: 'La orden no está en estado pagado' };
    }

    // Idempotencia: Verificar si ya se procesó comisión para esta orden
    const existingCommSnap = await db
      .collection('commissions')
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    if (!existingCommSnap.empty) {
      const existingDoc = existingCommSnap.docs[0];
      return {
        success: true,
        commissionId: existingDoc.id,
        amountUSD: existingDoc.data().amountUSD,
        reason: 'Comisión ya procesada previamente para esta orden',
      };
    }

    const userId = orderData.userId;
    if (!userId) {
      return { success: false, reason: 'Orden sin userId' };
    }

    // Obtener datos del usuario comprador
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return { success: false, reason: 'Usuario comprador no encontrado' };
    }

    const userData = userDoc.data()!;
    const referrerUid = userData.referral?.referredByUid || userData.referredByUid;
    const referralCode = userData.referral?.referredByCode || userData.referredByCode;

    if (!referrerUid) {
      return { success: false, reason: 'El usuario no fue referido por nadie' };
    }

    // No auto-comisiones
    if (referrerUid === userId) {
      return { success: false, reason: 'El usuario no puede referirse a sí mismo' };
    }

    // Obtener datos del usuario referente (quien compartió el link)
    const referrerDoc = await db.collection('users').doc(referrerUid).get();
    if (!referrerDoc.exists) {
      return { success: false, reason: 'Usuario referente no encontrado' };
    }
    const referrerData = referrerDoc.data()!;

    // Obtener configuración del programa de referidos
    let config = {
      programEnabled: true,
      commissionRules: {
        registration: { type: 'percentage', value: 30, enabled: false },
        firstPurchase: { type: 'percentage', value: 30, enabled: true },
        purchase: { type: 'percentage', value: 5, enabled: false },
      },
      holdPeriodDays: 7,
    };

    try {
      const configDoc = await db.collection('referral_config').doc('production').get();
      if (configDoc.exists) {
        config = { ...config, ...(configDoc.data() as any) };
      }
    } catch (err) {
      console.warn('[commissions] Error al leer referral_config, usando default:', err);
    }

    if (!config.programEnabled) {
      return { success: false, reason: 'Programa de referidos deshabilitado en configuración' };
    }

    // Determinar si es primera compra o compra recurrente
    const userOrdersSnap = await db
      .collection('orders')
      .where('userId', '==', userId)
      .where('status', '==', 'paid')
      .get();

    // Si solo hay 1 orden pagada (o ninguna anterior), es primera compra
    const isFirstPurchase = userOrdersSnap.size <= 1;
    const triggerType = isFirstPurchase ? 'first_purchase' : 'purchase';
    const ruleKey = isFirstPurchase ? 'firstPurchase' : 'purchase';
    const rule = config.commissionRules[ruleKey as keyof typeof config.commissionRules];

    if (!rule || !rule.enabled || Number(rule.value) <= 0) {
      return { success: false, reason: `Regla de comisión ${ruleKey} no está habilitada o valor <= 0` };
    }

    const orderAmount = Number(orderData.amount) || 0;
    let commissionAmount = 0;

    if (rule.type === 'percentage') {
      commissionAmount = Math.round(((orderAmount * Number(rule.value)) / 100) * 100) / 100;
    } else {
      commissionAmount = Math.round(Number(rule.value) * 100) / 100;
    }

    if (commissionAmount <= 0) {
      return { success: false, reason: 'El monto de comisión calculado es 0' };
    }

    const holdDays = Number(config.holdPeriodDays) || 7;
    const holdUntil = new Date(Date.now() + holdDays * 24 * 60 * 60 * 1000);

    const batch = db.batch();

    // 1. Crear documento en 'commissions'
    const commRef = db.collection('commissions').doc();
    batch.set(commRef, {
      orderId,
      referrerUid,
      referrerName: referrerData.displayName || referrerData.email || 'Afiliado',
      referrerCode: referralCode || referrerData.referral?.code || '',
      referredUid: userId,
      referredName: userData.displayName || userData.email || '',
      referredEmail: userData.email || orderData.userEmail || '',
      triggerType,
      orderAmountUSD: orderAmount,
      amountUSD: commissionAmount,
      status: 'pending',
      holdUntil,
      createdAt: FieldValue.serverTimestamp(),
      releasedAt: null,
    });

    // 2. Incrementar balance del referente (pendingUSD)
    const referrerRef = db.collection('users').doc(referrerUid);
    batch.set(
      referrerRef,
      {
        affiliateBalance: {
          pendingUSD: FieldValue.increment(commissionAmount),
          approvedUSD: FieldValue.increment(0),
          paidUSD: FieldValue.increment(0),
          rejectedUSD: FieldValue.increment(0),
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // 3. Registrar evento en 'referral_events'
    const eventRef = db.collection('referral_events').doc();
    batch.set(eventRef, {
      type: triggerType,
      referrerUid,
      referredUid: userId,
      referralCode: referralCode || referrerData.referral?.code || '',
      metadata: {
        orderId,
        orderAmount,
        commissionAmount,
        ruleType: rule.type,
        ruleValue: rule.value,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Actualizar usuario comprador a convertido
    batch.update(userDoc.ref, {
      'referral.convertedAt': FieldValue.serverTimestamp(),
      'referral.status': 'converted',
    });

    // 5. Marcar orden con datos de comisión
    batch.update(orderDoc.ref, {
      referralProcessed: true,
      referralCommissionId: commRef.id,
      referralCommissionAmount: commissionAmount,
    });

    await batch.commit();

    return {
      success: true,
      commissionId: commRef.id,
      amountUSD: commissionAmount,
    };
  } catch (error: any) {
    console.error('[processOrderReferralCommission] Error:', error);
    return { success: false, reason: error.message || 'Error interno procesando comisión' };
  }
}

/**
 * Procesa la comisión por registro (si está habilitada en las reglas).
 */
export async function processRegistrationReferralCommission(
  userId: string,
  referrerUid: string,
  referralCode: string
): Promise<CommissionResult> {
  try {
    const db = getAdminDb();

    // Idempotencia: Verificar si ya se procesó comisión de registro para este usuario
    const existingCommSnap = await db
      .collection('commissions')
      .where('referredUid', '==', userId)
      .where('triggerType', '==', 'registration')
      .limit(1)
      .get();

    if (!existingCommSnap.empty) {
      return { success: true, reason: 'Comisión de registro ya otorgada' };
    }

    // Leer config
    let config = {
      programEnabled: true,
      commissionRules: {
        registration: { type: 'percentage', value: 30, enabled: false },
        firstPurchase: { type: 'percentage', value: 30, enabled: true },
        purchase: { type: 'percentage', value: 5, enabled: false },
      },
      holdPeriodDays: 7,
    };

    try {
      const configDoc = await db.collection('referral_config').doc('production').get();
      if (configDoc.exists) {
        config = { ...config, ...(configDoc.data() as any) };
      }
    } catch (err) {
      console.warn('[commissions] Error al leer referral_config:', err);
    }

    if (!config.programEnabled) return { success: false, reason: 'Programa deshabilitado' };

    const rule = config.commissionRules?.registration;
    if (!rule || !rule.enabled || Number(rule.value) <= 0) {
      return { success: false, reason: 'Regla de registro no habilitada' };
    }

    const referrerDoc = await db.collection('users').doc(referrerUid).get();
    if (!referrerDoc.exists) return { success: false, reason: 'Referente no encontrado' };
    const referrerData = referrerDoc.data()!;

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data()! : {};

    const commissionAmount = Number(rule.value) || 0;
    if (commissionAmount <= 0) return { success: false, reason: 'Monto de comisión 0' };

    const batch = db.batch();
    const commRef = db.collection('commissions').doc();
    batch.set(commRef, {
      referrerUid,
      referrerName: referrerData.displayName || referrerData.email || 'Afiliado',
      referrerCode: referralCode || referrerData.referral?.code || '',
      referredUid: userId,
      referredName: userData.displayName || userData.email || '',
      referredEmail: userData.email || '',
      triggerType: 'registration',
      orderAmountUSD: 0,
      amountUSD: commissionAmount,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      releasedAt: null,
    });

    const referrerRef = db.collection('users').doc(referrerUid);
    batch.set(
      referrerRef,
      {
        affiliateBalance: {
          pendingUSD: FieldValue.increment(commissionAmount),
          approvedUSD: FieldValue.increment(0),
          paidUSD: FieldValue.increment(0),
          rejectedUSD: FieldValue.increment(0),
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    await batch.commit();
    return { success: true, commissionId: commRef.id, amountUSD: commissionAmount };
  } catch (error: any) {
    console.error('[processRegistrationReferralCommission] Error:', error);
    return { success: false, reason: error.message };
  }
}
