import React from 'react';

export default function JuicesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Catálogo de Jugos</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Añadir Jugo</button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        Grid de Jugos (TBD - Conectar con Firestore)
      </div>
    </div>
  );
}
