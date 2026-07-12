import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../../lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, role } = body as {
      email?: string;
      password?: string;
      displayName?: string;
      role?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contrasena requeridos' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: role || 'user' });

    const db = getAdminDb();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      isPremium: false,
      role: role || 'user',
      status: 'active',
      createdAt: new Date(),
      authProvider: 'password',
    });

    return NextResponse.json({ uid: userRecord.uid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    console.error('[create-user]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
