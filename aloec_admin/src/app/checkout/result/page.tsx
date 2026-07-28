'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  CheckCircle2, 
  Smartphone, 
  Download, 
  Play, 
  ArrowRight, 
  AlertTriangle,
  RefreshCw,
  Lock,
  ChevronRight
} from 'lucide-react';

// Google Play Badge Component
function GooglePlayButton({ href = "#" }: { href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <svg className="w-7 h-7 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 512 512">
        <path fill="#410593" d="M325.8 244.6L79.7 490.7c-7.9-5-12.7-13.7-12.7-23.7V45c0-10 4.8-18.7 12.7-23.7l246.1 223.3z"/>
        <path fill="#00E676" d="M386.4 300.2l-60.6-55.6 60.6-55.6 68.3 38.9c19.5 11.1 19.5 29.2 0 40.3l-68.3 32z"/>
        <path fill="#FF3D00" d="M79.7 21.3L325.8 244.6l60.6-55.6-267.8-152.6c-12-6.8-26.3-5-38.9 4.9z"/>
        <path fill="#FFC107" d="M79.7 490.7l246.1-223.3 60.6 55.6-267.8 152.6c-12 6.8-26.3 5-38.9-4.9z"/>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">DISPONIBLE EN</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">Google Play</span>
      </div>
    </a>
  );
}

// Apple App Store Badge Component
function AppStoreButton({ href = "#" }: { href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <svg className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 384 512">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">CONSIGUELO EN EL</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">App Store</span>
      </div>
    </a>
  );
}

function ResultContent() {
  const params = useSearchParams();
  const status = params.get('status');

  if (status === 'paid') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-10 px-8 shadow-xl rounded-3xl border border-slate-200 text-center space-y-6">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">¡Pago Confirmado con Éxito!</h1>
              <p className="text-sm text-slate-600">
                Tu membresía y acceso al libro digital se han activado inmediatamente.
              </p>
            </div>

            {/* Steps to start */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">¿Cómo empezar a usar ALOEC?</h3>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Descarga la aplicación en tu smartphone</p>
                  <p className="text-xs text-slate-500">Utiliza los botones de descarga de abajo.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Inicia sesión con tus credenciales</p>
                  <p className="text-xs text-slate-500">
                    Abre la aplicación e introduce el correo y la contraseña que creaste durante el registro.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">¡Comienza tu transformación!</p>
                  <p className="text-xs text-slate-500">
                    Accede a tu plan de IMC, los 9 protocolos y el recetario de jugoterapia de inmediato.
                  </p>
                </div>
              </div>
            </div>

            {/* Store Download Badges */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Descargar la App:</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <GooglePlayButton href="#download" />
                <AppStoreButton href="#download" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                ¿Prefieres usar la versión web? Visita <strong className="text-emerald-600 underline">app.alimentacionorganicaec.com</strong>.
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-red-100 text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Pago Rechazado</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              No pudimos procesar la transacción. Vuelve a intentarlo ingresando un método de pago alternativo.
            </p>
            <a
              href="/"
              className="inline-block w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              Reintentar Compra
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-yellow-100 text-center space-y-5">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Pago en Proceso</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tu pago está en proceso de verificación por la pasarela de pagos. Te notificaremos por correo electrónico una vez confirmado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 text-center space-y-5">
          <div className="text-red-500 text-5xl">✕</div>
          <h1 className="text-lg font-bold text-slate-900">Error de Pago</h1>
          <p className="text-sm text-slate-600">Ocurrió un error inesperado al verificar tu transacción.</p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
        Cargando estado...
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
