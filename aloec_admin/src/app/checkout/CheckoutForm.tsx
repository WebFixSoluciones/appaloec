'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFormProps {
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
}

export default function CheckoutForm({ planId, planName, price, durationDays }: CheckoutFormProps) {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        toast.error('Por favor ingresa tu nombre completo.');
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
    }

    setLoading(true);
    const toastId = toast.loading(isRegister ? 'Registrando cuenta...' : 'Iniciando sesión...');

    try {
      if (isRegister) {
        // 1. New User: Register on backend
        const res = await fetch('/api/checkout/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
            planId
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error en el registro.');
        }

        toast.success('Cuenta registrada. Redirigiendo al pago...', { id: toastId });
        // Redirect to same page with generated checkout token
        router.push(`/checkout?t=${data.token}`);
      } else {
        // 2. Existing User: Authenticate on client
        const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
        const idToken = await credential.user.getIdToken();

        // Get checkout token from backend
        const res = await fetch('/api/checkout/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            planId
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al procesar el pago.');
        }

        toast.success('Sesión validada. Redirigiendo al pago...', { id: toastId });
        router.push(`/checkout?t=${data.token}`);
      }
    } catch (err: any) {
      console.error('Checkout authentication error:', err);
      toast.error(err.message || 'Error al procesar la solicitud.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <img src="/logo.png" alt="ALOEC Logo" className="h-12 w-auto mx-auto object-contain" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Completa tu Compra
        </h2>
        <p className="text-sm text-slate-600">
          Estás adquiriendo el libro oficial e incluyendo acceso premium a la app ALOEC.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Plan Summary Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg mb-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              PLAN SELECCIONADO
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">{planName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Acceso premium durante {durationDays} días</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-emerald-400 font-mono">${price.toFixed(2)}</p>
            <span className="text-[10px] text-slate-500 font-bold uppercase">USD</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                isRegister 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                !isRegister 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isRegister && (
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
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>
            )}

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
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                />
              </div>
            </div>

            {isRegister && (
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:border-slate-900 focus:bg-white rounded-xl text-sm transition-all text-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 transform active:scale-95 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <span>Proceder al Pago</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 leading-snug max-w-xs mx-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Esta cuenta te servirá para ingresar a la App ALOEC una vez completado el pago.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
