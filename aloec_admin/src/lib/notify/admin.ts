import { getAdminDb } from '../firebase/admin';

export async function notifyAdmin(subject: string, body: string) {
  try {
    const db = getAdminDb();
    const settingsSnap = await db.collection('admin_settings').doc('notifications').get();
    const adminEmail = settingsSnap.data()?.adminEmail;
    if (!adminEmail) return;

    await db.collection('mail_queue').add({
      to: adminEmail,
      subject,
      body,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
    });
  } catch (err) {
    console.error('[notifyAdmin]', err);
  }
}
