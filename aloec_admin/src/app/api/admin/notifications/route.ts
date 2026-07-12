import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase/admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const doc = await db.collection('admin_settings').doc('notifications').get();
    return NextResponse.json(doc.data() || { adminEmail: '' });
  } catch {
    return NextResponse.json({ adminEmail: '' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getAdminDb();
    await db.collection('admin_settings').doc('notifications').set({
      adminEmail: body.adminEmail || '',
      updatedAt: new Date(),
    }, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
