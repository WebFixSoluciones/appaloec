'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResultContent() {
  const params = useSearchParams();
  const status = params.get('status');

  if (status === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">¡Pago Confirmado!</h1>
          <p className="text-sm text-gray-600">Tu membresía ha sido activada. Vuelve a la app para continuar.</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
          <p className="text-sm text-gray-600">No se pudo procesar el pago. Cierra esta ventana y vuelve a intentarlo desde la app.</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pago en proceso</h1>
          <p className="text-sm text-gray-600">Tu pago está siendo procesado. Vuelve a la app en unos minutos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-sm">
        <div className="text-red-500 text-6xl mb-4">✕</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Error de pago</h1>
        <p className="text-sm text-gray-600">Ocurrió un error inesperado. Cierra esta ventana y vuelve a la app.</p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
