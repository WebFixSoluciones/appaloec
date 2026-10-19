'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Lock, 
  Download, 
  CheckCircle2, 
  Gift, 
  RefreshCw, 
  ArrowRight, 
  BookOpen, 
  Smartphone,
  Globe,
  X,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

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

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAppStoreModal, setShowAppStoreModal] = useState<boolean>(false);

  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      setRefCode(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aloec_ref_code', code);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aloec_ref_code');
      if (stored) setRefCode(stored);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creando tu cuenta y preparando el acceso...');

    try {
      const res = await fetch('/api/download/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          referralCode: refCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el registro.');
      }

      toast.success('¡Registro exitoso! Ya puedes ingresar.', { id: toastId });
      setIsSuccess(true);

      // Trigger APK download automatically as fallback
      if (typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = '/appaloecv16.apk';
        link.download = 'appaloecv16.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Ocurrió un error inesperado.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </Link>
        
        {!isSuccess ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Regístrate en ALOEC
            </h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Crea tu cuenta gratuita para acceder a la aplicación móvil, diagnósticos y recetas saludables.
            </p>
          </>
        ) : (
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ¡Bienvenido a ALOEC!
          </h2>
        )}
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Referral Badge Header if code present */}
        {refCode && !isSuccess && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl mb-4 flex items-center gap-3 text-xs shadow-xs animate-in fade-in duration-200">
            <Gift className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-amber-950 font-black">Invitación Especial Identificada</p>
              <p className="text-[11px] text-amber-700">
                Código: <span className="font-mono font-bold bg-amber-200/70 px-1.5 py-0.5 rounded">{refCode}</span> · ¡Tu registro quedará vinculado!
              </p>
            </div>
          </div>
        )}

        {!isSuccess ? (
          <div className="bg-white py-7 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María López"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-emerald-600/25 transition-all flex justify-center items-center gap-2 transform active:scale-95 mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Registro...
                  </>
                ) : (
                  <>
                    <span>Registrarme y Acceder</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>

            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-500">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/checkout?plan=plan-nico" className="text-emerald-700 font-bold hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-3xl border border-slate-200 text-center space-y-6">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Registro Completado
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">¡Cuenta Creada Exitosamente!</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Tu usuario ha sido registrado con el correo <strong className="text-slate-900">{email}</strong>. Puedes ingresar a la app en móvil o en web.
              </p>
            </div>

            {/* Store Download Buttons */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Descarga la App en tu Dispositivo:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <GooglePlayButton />
                <AppStoreButton onClick={() => setShowAppStoreModal(true)} />
              </div>
            </div>

            {/* Direct Web and APK Options */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Otras alternativas de acceso:</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href="https://app.alimentacionorganicaec.com"
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" /> Versión Web
                </a>

                <a
                  href="/appaloecv16.apk"
                  download="appaloecv16.apk"
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> APK Directo (v16)
                </a>
              </div>
            </div>

            {/* Book & Plan Promotion */}
            <div className="border-t border-slate-100 pt-4">
              <Link
                href="/checkout?plan=plan-nico"
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Adquirir Libro &ldquo;Ama Lo Que Comes&rdquo; + Plan Premium →</span>
              </Link>
            </div>

          </div>
        )}

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
                ¿Deseas ingresar de inmediato?
              </p>
              <p className="text-xs text-emerald-700">
                Puedes instalar la App desde <strong>Google Play Store</strong> o acceder directamente a la plataforma web.
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">
        Cargando registro...
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
