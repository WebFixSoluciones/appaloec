import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { name, email, password, referralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Por favor ingresa todos los campos requeridos.' },
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

    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (err: any) {
      console.error('Error creating user for download:', err);
      if (err.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Este correo ya está registrado. Puedes iniciar sesión directamente en la App.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: err.message || 'Error al registrar la cuenta.' },
        { status: 500 }
      );
    }

    // Resolve referral code if present
    let referredByUid = null;
    if (referralCode) {
      try {
        const refDoc = await db
          .collection('referral_codes')
          .doc(referralCode.toUpperCase())
          .get();
        if (refDoc.exists) {
          referredByUid = refDoc.data()?.uid || null;

          // Add event to referral_events
          await db.collection('referral_events').add({
            type: 'download_registered',
            referrerUid: referredByUid,
            referredUid: userRecord.uid,
            referralCode: referralCode,
            metadata: { source: 'web_download_gate' },
            createdAt: new Date(),
          });
        }
      } catch (refErr) {
        console.error('Error resolving referral code for download:', refErr);
      }
    }

    // Save user profile in Firestore
    const userPayload: any = {
      uid: userRecord.uid,
      email,
      displayName: name,
      role: 'user',
      membershipId: 'free',
      isPremium: false,
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

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid,
      downloadUrl: '/appaloecv16.apk'
    });
  } catch (err: any) {
    console.error('API download/register error:', err);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el registro para la descarga.' },
      { status: 500 }
    );
  }
}
