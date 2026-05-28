import React from 'react';

export default function UsersPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Añadir Usuario</button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        Tabla de usuarios (TBD - Conectar con Firebase Auth/Firestore)
      </div>
    </div>
  );
}
