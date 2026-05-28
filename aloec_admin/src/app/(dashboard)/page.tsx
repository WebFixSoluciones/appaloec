import React from 'react';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Resumen General</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Usuarios Totales</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">1,245</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Suscripciones Activas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">342</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-medium">Ingresos (Mes)</h3>
          <p className="text-3xl font-bold text-slate-800 mt-2">$3,420</p>
        </div>
      </div>
    </div>
  );
}
