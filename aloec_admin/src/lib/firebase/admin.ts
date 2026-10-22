import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminApp: App | null = null;
let adminDb: Firestore;
let adminAuth: Auth;
let adminStorage: Storage;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'app-aloec.firebasestorage.app',
  });
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    getAdminApp();
    adminDb = getFirestore();
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    getAdminApp();
    adminAuth = getAuth();
  }
  return adminAuth;
}

export function getAdminStorage(): Storage {
  if (!adminStorage) {
    getAdminApp();
    adminStorage = getStorage();
  }
  return adminStorage;
}
