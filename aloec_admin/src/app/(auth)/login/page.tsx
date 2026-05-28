import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">ALOEC Admin</h1>
          <p className="text-slate-500">Acceso exclusivo para administradores</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input type="email" required className="w-full p-3 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input type="password" required className="w-full p-3 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-colors">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
