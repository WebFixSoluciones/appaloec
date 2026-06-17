'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (pathname !== '/login') {
          router.push('/login');
        } else {
          setLoading(false);
        }
        return;
      }

      // Check for admin role in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.role === 'admin') {
          if (pathname === '/login') {
            router.push('/');
          } else {
            setLoading(false);
          }
        } else {
          // Not an admin
          auth.signOut();
          if (pathname !== '/login') {
            router.push('/login?error=unauthorized');
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        auth.signOut();
        router.push('/login?error=error');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return <>{children}</>;
}
