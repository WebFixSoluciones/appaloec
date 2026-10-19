'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Smartphone, 
  Download, 
  Play, 
  ArrowRight, 
  AlertTriangle,
  RefreshCw,
  Lock,
  ChevronRight,
  X,
  BookOpen,
  Sparkles,
  Globe
} from 'lucide-react';

// Google Play Official Store Button Component
function GooglePlayButton() {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-950 hover:bg-black text-white rounded-xl border-2 border-emerald-500/60 hover:border-emerald-400 shadow-md hover:shadow-emerald-500/25 transition-all duration-200 group transform hover:-translate-y-0.5"
    >
      <svg className="w-7 h-7 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 512 512" aria-hidden="true">
        <path fill="#410593" d="M325.8 244.6L79.7 490.7c-7.9-5-12.7-13.7-12.7-23.7V45c0-10 4.8-18.7 12.7-23.7l246.1 223.3z"/>
        <path fill="#00E676" d="M386.4 300.2l-60.6-55.6 60.6-55.6 68.3 38.9c19.5 11.1 19.5 29.2 0 40.3l-68.3 32z"/>
        <path fill="#FF3D00" d="M79.7 21.3L325.8 244.6l60.6-55.6-267.8-152.6c-12-6.8-26.3-5-38.9 4.9z"/>
        <path fill="#FFC107" d="M79.7 490.7l246.1-223.3 60.6 55.6-267.8 152.6c-12 6.8-26.3 5-38.9-4.9z"/>
      </svg>
      <div className="text-left leading-none">
        <div className="flex items-center gap-1.5">
          <span className="block text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">DISPONIBLE EN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <span className="block text-base font-extrabold tracking-tight text-white mt-0.5">Google Play</span>
      </div>
    </a>
  );
}

// Android APK Download Button Component
function AndroidAPKButton() {
  return (
    <a
      href="/appaloecv16.apk"
      download="appaloecv16.apk"
      className="inline-flex items-center gap-3 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border border-emerald-500/50 shadow-md hover:shadow-lg transition-all duration-200 group"
    >
      <Download className="w-6 h-6 text-emerald-100 transition-transform group-hover:translate-y-0.5 shrink-0" />
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-200">DESCARGA DIRECTA</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">Android APK</span>
      </div>
    </a>
  );
}

// Apple App Store Badge Component
function AppStoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer text-left"
    >
      <svg className="w-7 h-7 fill-current shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 384 512">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
      </svg>
      <div className="text-left leading-none">
        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">PRÓXIMAMENTE EN</span>
        <span className="block text-base font-bold tracking-tight text-white mt-0.5">App Store</span>
      </div>
    </button>
  );
}

function ResultContent() {
  const params = useSearchParams();
  const status = params.get('status');
  const [showAppStoreModal, setShowAppStoreModal] = useState<boolean>(false);

  if (status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-10 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200/90 text-center space-y-6">
            
            {/* Success icon & badge */}
            <div className="space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> ¡Membresía Activada!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ¡Bienvenido a ALOEC!
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Tu pago ha sido procesado exitosamente por PayPhone. Tu cuenta ya cuenta con acceso completo e ilimitado.
              </p>
            </div>

            {/* Included Benefits Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-left space-y-2.5">
              <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                Beneficios Desbloqueados en tu Cuenta:
              </p>
              <ul className="text-xs text-emerald-900 space-y-2">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Libro Oficial "Ama Lo Que Comes"</strong> disponible en formato digital.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>9 Protocolos Médicos</strong> adaptados a tu diagnóstico de IMC.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Catálogo HD de +50 Recetas</strong> de jugoterapia y batidos curativos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Acceso Multiplataforma</strong> en App Android, App iOS y Plataforma Web.</span>
                </li>
              </ul>
            </div>

            {/* Primary Action: Direct Web App Access */}
            <div className="space-y-3 pt-1">
              <a
                href="https://app.alimentacionorganicaec.com"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>Ingresar a la Plataforma Web Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-slate-500">
                Inicia sesión con tu correo registrado y tu contraseña para comenzar de inmediato.
              </p>
            </div>

            {/* Mobile App Downloads */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>O descarga la App en tu smartphone:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <GooglePlayButton />
                <AppStoreButton onClick={() => setShowAppStoreModal(true)} />
              </div>
            </div>

            {/* Order note & support */}
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>Te hemos enviado la confirmación de compra a tu correo electrónico.</p>
              <p>
                ¿Dudas o soporte? Escríbenos a{' '}
                <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-600 font-bold hover:underline">
                  soporte@alimentacionorganicaec.net
                </a>
              </p>
            </div>

          </div>

          {/* Legal Footer Links */}
          <div className="mt-8 text-center text-xs text-slate-500 space-x-3">
            <Link href="/terminos-y-condiciones" className="hover:text-emerald-700 transition-colors">
              Términos y Condiciones
            </Link>
            <span>·</span>
            <Link href="/politicas-de-privacidad" className="hover:text-emerald-700 transition-colors">
              Políticas de Privacidad
            </Link>
            <span>·</span>
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Inicio
            </Link>
          </div>
        </div>

        {/* ── App Store Coming Soon Modal ────────────────────────────────────── */}
        {showAppStoreModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowAppStoreModal(false)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative space-y-5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowAppStoreModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-slate-900/20">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 384 512">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 66.2 32.1 114.7c20.1 30.1 44.1 63.8 75.9 62.6 30.5-1.2 42.6-19.4 79.4-19.4 36.5 0 47.6 19.4 79.4 18.2 32.4-1.2 53.6-30.8 73.1-60.6 15.6-23.7 22.1-47.2 22.5-48.4-1.2-.6-43.7-17-43.7-61.9zM258.6 92.4c15.3-18.6 25.8-44.4 23-70.4-22.3 1-49.1 14.9-64.8 33.3-13.8 16.1-26 42.4-22.7 67.5 24.8 1.9 50-13 64.5-30.4z"/>
                </svg>
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider">
                  Próximamente
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  ¡Muy pronto en App Store!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Estamos finalizando el proceso de revisión con Apple. Muy pronto podrás descargar la aplicación oficial de <strong>ALOEC</strong> directamente en tu iPhone o iPad.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-1">
                <p className="text-xs font-bold text-emerald-900">
                  ¿Tienes un dispositivo Android o deseas usar la versión Web?
                </p>
                <p className="text-xs text-emerald-700">
                  Ya puedes instalar ALOEC desde <strong>Google Play Store</strong> o ingresar a la plataforma web directamente.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href="https://play.google.com/store/apps/details?id=net.alimentacionorganica.aloec&hl=es_419"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
                >
                  Ver en Google Play Store →
                </a>
                <button
                  type="button"
                  onClick={() => setShowAppStoreModal(false)}
                  className="w-full px-5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Entendido, cerrar
                </button>
              </div>
            </div>
          </div>
        )}
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
          <div className="bg-white py-10 px-6 sm:px-8 shadow-xl rounded-3xl border border-red-100 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-red-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Transacción No Completada</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                La pasarela de pago PayPhone no pudo procesar el cobro. Esto suele ocurrir por fondos insuficientes, límites en compras online o bloqueo temporal de tu banco emisor.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">Sugerencias para resolverlo:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Verifica que tu tarjeta tenga habilitadas compras online internacionales.</li>
                <li>Intenta nuevamente con otra tarjeta de crédito o débito.</li>
                <li>Comunícate con tu banco para autorizar la transacción de PayPhone.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/#precios"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar Compra de Membresía</span>
              </a>

              <a
                href="/"
                className="inline-block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Volver al Inicio
              </a>
            </div>

            <p className="text-xs text-slate-400">
              ¿Persiste el inconveniente? Contáctanos a{' '}
              <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-600 font-bold hover:underline">
                soporte@alimentacionorganicaec.net
              </a>
            </p>
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
          <div className="bg-white py-10 px-6 sm:px-8 shadow-xl rounded-3xl border border-amber-100 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-amber-50">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Verificando tu Pago</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                PayPhone está confirmando los fondos con tu entidad bancaria. Esta validación suele tardar entre 1 y 3 minutos.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
              <p className="font-bold">No te preocupes:</p>
              <p>Tu cuenta se activará automáticamente apenas recibamos la confirmación del banco y te enviaremos un correo de bienvenida.</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar Estado</span>
              </button>

              <a
                href="/"
                className="inline-block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Volver al Inicio
              </a>
            </div>
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
        <div className="bg-white py-10 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-red-50">
            <X className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">Estado de Transacción No Válido</h1>
            <p className="text-sm text-slate-600">No pudimos identificar el estado de tu pago o el enlace ha caducado.</p>
          </div>
          <div className="space-y-3 pt-2">
            <a
              href="/#precios"
              className="inline-block w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              Ver Planes Disponibles
            </a>
            <a
              href="/"
              className="inline-block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
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
