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
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

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
    const toastId = toast.loading('Creando tu cuenta y preparando la descarga...');

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

      toast.success('¡Registro exitoso! Iniciando descarga de APK v16...', { id: toastId });
      setIsSuccess(true);

      // Trigger APK download automatically
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
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/">
          <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        </Link>
        
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Regístrate para Descargar ALOEC
            </h2>
            <p className="text-sm text-slate-600">
              Crea tu cuenta gratuita para acceder a la aplicación móvil y sus contenidos.
            </p>
          </>
        ) : (
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ¡Descarga en Proceso!
          </h2>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Referral Badge Header if code present */}
        {refCode && !isSuccess && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold shadow-xs">
            <Gift className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-amber-950 font-black">Invitación por Referido Identificada</p>
              <p className="text-[11px] text-amber-700 font-medium">Código: <span className="font-mono font-bold bg-amber-200/60 px-1.5 py-0.5 rounded">{refCode}</span></p>
            </div>
          </div>
        )}

        {!isSuccess ? (
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-95 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Registro...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Registrarme y Descargar App (v16)</span>
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
          /* Success Screen with direct download trigger */
          <div className="bg-white py-10 px-8 shadow-xl rounded-3xl border border-slate-200 text-center space-y-6">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">¡Tu Cuenta fue Creada con Éxito!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                La descarga del APK oficial (versión 16) ha comenzado automáticamente en tu navegador.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Instrucciones para instalar:</span>
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Abre el archivo <strong className="font-mono">appaloecv16.apk</strong> descargado.</li>
                <li>Si tu celular te solicita permisos para instalar aplicaciones externas, presiona <strong>Permitir</strong>.</li>
                <li>Abre la aplicación ALOEC e inicia sesión con el correo <strong className="text-slate-800">{email}</strong> y la contraseña registrada.</li>
              </ol>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/appaloecv16.apk"
                download="appaloecv16.apk"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Reintentar Descarga Directa
              </a>

              <Link
                href="/checkout?plan=plan-nico"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-300" /> Adquirir Libro + Plan Premium →
              </Link>
            </div>

          </div>
        )}

      </div>
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
