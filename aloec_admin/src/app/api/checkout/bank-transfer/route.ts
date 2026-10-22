import { NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase/admin';
import { verifyCheckoutToken } from '../../../../lib/checkout/token';

export async function POST(request: Request) {
  try {
    const { orderId, token, receiptUrl, receiptReference, payerIdNumber } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Falta el identificador de orden (orderId).' },
        { status: 400 }
      );
    }

    if (token) {
      const session = verifyCheckoutToken(token);
      if (!session) {
        return NextResponse.json(
          { error: 'El token de checkout expiró o es inválido.' },
          { status: 401 }
        );
      }
    }

    const db = getAdminDb();
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { error: 'La orden especificada no existe.' },
        { status: 404 }
      );
    }

    const now = new Date();
    await orderRef.update({
      paymentMethod: 'bank_transfer',
      status: 'pending',
      receiptUrl: receiptUrl || '',
      receiptReference: receiptReference ? String(receiptReference).trim() : '',
      payerIdNumber: payerIdNumber ? String(payerIdNumber).trim() : '',
      country: 'EC',
      receiptUploadedAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Comprobante registrado con éxito. Pendiente de revisión.',
      orderId,
    });
  } catch (err: any) {
    console.error('API checkout/bank-transfer error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error al procesar el comprobante bancario.' },
      { status: 500 }
    );
  }
}
