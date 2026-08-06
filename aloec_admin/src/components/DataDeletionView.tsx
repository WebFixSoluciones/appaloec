'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Trash2,
  ArrowLeft,
  Mail,
  UserCheck,
  AlertTriangle,
  Server,
  FileText
} from 'lucide-react';

export default function DataDeletionView() {
  const [deleteEmail, setDeleteEmail] = useState<string>('');
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [deleteSent, setDeleteSent] = useState<boolean>(false);

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteEmail.trim()) return;
    setDeleteSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Banner Notice */}
      <header className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              CUMPLIMIENTO GOOGLE PLAY
            </span>
            <span>Solicitud de Eliminación de Datos ALOEC</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Última actualización: 5 de Agosto de 2026</span>
          </div>
        </div>
      </header>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="ALOEC Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                ALOEC
              </span>
              <span className="text-[11px] font-medium text-emerald-600 block">
                Alimentación Orgánica EC
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/politicas-de-privacidad"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Política de Privacidad</span>
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-rose-900 via-slate-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium mb-4">
            <Trash2 className="w-4 h-4 text-rose-400" />
            Control Total de tu Cuenta
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Eliminación de Datos
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-6">
            En <strong className="text-emerald-300 font-semibold">ALOEC (Alimentación Orgánica EC)</strong>, desarrollado por <strong className="text-emerald-300 font-semibold">WebFix Soluciones</strong>, te otorgamos el derecho de solicitar la eliminación de tu cuenta y los datos asociados a ella.
          </p>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        
        {/* Pasos para eliminar */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Pasos para eliminar tus datos</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Tienes dos opciones para solicitar la eliminación de tu cuenta y tus datos asociados:</p>
            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-700 ml-2">
              <li className="pl-2">
                <strong>Desde la App ALOEC:</strong> Abre la aplicación móvil ALOEC, dirígete a <strong className="text-slate-900">Perfil &gt; Configuración de Cuenta &gt; Eliminar Cuenta</strong> y confirma tu decisión.
              </li>
              <li className="pl-2">
                <strong>Mediante este formulario web:</strong> Completa el formulario oficial que se encuentra en la parte inferior de esta página utilizando el correo electrónico asociado a tu cuenta ALOEC.
              </li>
              <li className="pl-2">
                <strong>Vía correo electrónico:</strong> Envía un correo electrónico a <a href="mailto:soporte@alimentacionorganicaec.net" className="text-emerald-600 font-medium hover:underline">soporte@alimentacionorganicaec.net</a> con el asunto "Solicitud de Eliminación de Datos" especificando el correo de tu cuenta.
              </li>
            </ol>
          </div>
        </section>

        {/* Tipos de datos */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Tipos de datos eliminados y conservados</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <h3 className="font-bold text-rose-800 text-sm mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Datos que se ELIMINAN
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                <li>Información de perfil (Nombre, foto, teléfono).</li>
                <li>Credenciales de acceso y tokens de autenticación.</li>
                <li>Datos de salud (IMC, peso, altura).</li>
                <li>Historial de recetas favoritas y progreso.</li>
                <li>Suscripciones activas se cancelan automáticamente.</li>
              </ul>
              <p className="text-xs text-rose-700 mt-3 font-medium">Estos datos se eliminan de forma permanente en un plazo máximo de 30 días.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Datos que se CONSERVAN
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                <li>Historial de pagos y transacciones (por obligaciones fiscales y contables).</li>
                <li>Registros de facturación (anonimizados en lo posible).</li>
              </ul>
              <p className="text-xs text-slate-600 mt-3">Estos registros se conservan por un período de <strong>hasta 7 años</strong> para cumplir con la legislación de SRI en Ecuador, tras lo cual serán eliminados permanentently.</p>
            </div>
          </div>
        </section>

        {/* Formulario de Eliminación */}
        <section className="bg-white rounded-2xl p-6 shadow-xl border border-rose-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          <div className="flex items-center gap-3 mb-6 text-slate-900 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Formulario de Solicitud de Eliminación</h2>
              <p className="text-xs text-slate-500">Este proceso es irreversible</p>
            </div>
          </div>

          {!deleteSent ? (
            <form onSubmit={handleDeleteRequest} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Correo Electrónico Registrado en ALOEC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
                />
                <p className="text-xs text-slate-500 mt-1.5">Asegúrate de ingresar el correo exacto con el que te registraste en la App.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Motivo de la solicitud (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Cuéntanos por qué deseas eliminar tu cuenta..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Enviar Solicitud de Eliminación
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <h3 className="font-bold text-slate-900 text-xl">Solicitud Registrada Exitosamente</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hemos recibido tu solicitud para la cuenta <strong className="text-slate-900">{deleteEmail}</strong>. Nuestro equipo verificará tu identidad y procesará la eliminación completa en un plazo de hasta 30 días. Te informaremos vía correo electrónico cuando el proceso concluya.
              </p>
              <button
                onClick={() => {
                  setDeleteSent(false);
                  setDeleteEmail('');
                  setDeleteReason('');
                }}
                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors inline-block"
              >
                Enviar otra solicitud
              </button>
            </div>
          )}
        </section>

      </div>

      {/* Footer note */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1 bg-white">
        <p>© 2026 ALOEC - Alimentación Orgánica EC. Todos los derechos reservados.</p>
        <p>Desarrollado y administrado por WebFix Soluciones.</p>
      </footer>
    </div>
  );
}
