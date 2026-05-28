import React from 'react';
import Link from 'next/link';

export default function CoursesPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Videocursos</h1>
        <div className="space-x-4">
          <Link href="/content/lessons" className="bg-slate-200 text-slate-800 px-4 py-2 rounded shadow hover:bg-slate-300">Cargar Lección</Link>
          <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Nuevo Curso</button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        Lista de Cursos (TBD - Conectar con Firestore)
      </div>
    </div>
  );
}
