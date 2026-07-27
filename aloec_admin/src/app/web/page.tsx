'use client';

import React, { useEffect } from 'react';

export default function WebLandingPage() {
  useEffect(() => {
    // Redirect cleanly to the static landing page hosted at /web/index.html
    window.location.replace('/web/index.html');
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: 'sans-serif',
      color: '#064E3B'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Cargando ALOEC...</h2>
        <p style={{ color: '#64748B' }}>Redirigiendo a la landing page pública.</p>
      </div>
    </div>
  );
}
