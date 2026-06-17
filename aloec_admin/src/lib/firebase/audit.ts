import { db, auth } from './config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logAdminAction(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  targetCollection: string,
  targetId: string,
  details: {
    previousValues?: any;
    newValues?: any;
    description?: string;
  }
) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'audit_logs'), {
      adminId: user?.uid || 'system',
      adminEmail: user?.email || 'system',
      action,
      targetCollection,
      targetId,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
