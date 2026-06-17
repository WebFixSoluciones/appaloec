// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSBkVK3-0t6kEN8IBE2saW2AuTQPzhGz4",
  authDomain: "app-aloec.firebaseapp.com",
  projectId: "app-aloec",
  storageBucket: "app-aloec.firebasestorage.app",
  messagingSenderId: "75165578833",
  appId: "1:75165578833:web:db63c434d7c68e848e6a70",
  measurementId: "G-7DW1EXHVQM"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics solo es soportado en cliente (navegador), no en el servidor de Next.js
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
