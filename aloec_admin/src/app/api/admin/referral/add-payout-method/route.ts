import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { uid, type, label, details } = await req.json();

    if (!uid || !type) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (uid, type)' }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuario afiliado no encontrado' }, { status: 404 });
    }

    const methodsCol = userRef.collection('payout_methods');
    const newDocRef = methodsCol.doc();

    const payload = {
      type: type || 'bank_ec',
      label: label || (type === 'bank_ec' ? 'Transferencia Bancaria' : type === 'binance' ? 'Binance Pay' : 'PayPal'),
      details: details || {},
      isDefault: true,
      isVerified: true,
      addedBy: 'admin',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await newDocRef.set(payload);

    return NextResponse.json({
      success: true,
      methodId: newDocRef.id,
      method: payload,
    });
  } catch (error: any) {
    console.error('[add-payout-method route] Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
