import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../lib/firebase/admin';
import { createCheckoutToken } from '../../../../lib/checkout/token';

export async function POST(request: Request) {
  try {
    const { name, email, password, planId, referralCode } = await request.json();

    if (!name || !email || !password || !planId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    // Check if membership plan exists
    const planSnap = await db.collection('memberships').doc(planId).get();
    if (!planSnap.exists) {
      return NextResponse.json(
        { error: 'El plan de suscripción seleccionado no es válido.' },
        { status: 400 }
      );
    }

    let userRecord;
    try {
      // Try to create the user
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (err: any) {
      console.error('Error creating user in Firebase Auth:', err);
      if (err.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado. Por favor, inicia sesión.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: err.message || 'Error al registrar el usuario.' },
        { status: 500 }
      );
    }

    // Resolve referral code if provided
    let referredByUid = null;
    if (referralCode) {
      try {
        const refDoc = await db
          .collection('referral_codes')
          .doc(referralCode.toUpperCase())
          .get();
        if (refDoc.exists) {
          referredByUid = refDoc.data()?.uid || null;

          // Write referral event
          await db.collection('referral_events').add({
            type: 'registered',
            referrerUid: referredByUid,
            referredUid: userRecord.uid,
            referralCode: referralCode,
            metadata: {},
            ipAddress: null,
            userAgent: null,
            createdAt: new Date(),
          });
        }
      } catch (refErr) {
        console.error('Error resolving referral code:', refErr);
      }
    }

    // Save user profile in Firestore
    const userPayload: any = {
      uid: userRecord.uid,
      email,
      displayName: name,
      role: 'user',
      membershipId: 'free',
      authProvider: 'Email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (referralCode) {
      userPayload.referredByCode = referralCode;
      userPayload.referredByUid = referredByUid;
      userPayload.referral = {
        referredByCode: referralCode,
        referredByUid: referredByUid,
        status: 'referred',
        registeredAt: new Date(),
      };
    }

    await db.collection('users').doc(userRecord.uid).set(userPayload, { merge: true });

    // Generate checkout token
    const token = createCheckoutToken(userRecord.uid, planId);

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('API checkout/register error:', err);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar el registro.' },
      { status: 500 }
    );
  }
}
