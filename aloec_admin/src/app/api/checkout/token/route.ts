import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../lib/firebase/admin';
import { createCheckoutToken } from '../../../../lib/checkout/token';

export async function POST(request: Request) {
  try {
    const { idToken, planId } = await request.json();

    if (!idToken || !planId) {
      return NextResponse.json(
        { error: 'Parámetros insuficientes.' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
      console.error('Error verifying ID token:', err);
      return NextResponse.json(
        { error: 'Sesión inválida o expirada. Por favor inicia sesión de nuevo.' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // Check if membership plan exists
    const planSnap = await db.collection('memberships').doc(planId).get();
    if (!planSnap.exists) {
      return NextResponse.json(
        { error: 'El plan de suscripción seleccionado no es válido.' },
        { status: 400 }
      );
    }

    // Generate checkout token
    const token = createCheckoutToken(uid, planId);

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('API checkout/token error:', err);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar el pago.' },
      { status: 500 }
    );
  }
}
