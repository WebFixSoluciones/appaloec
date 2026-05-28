import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-green-400">ALOEC</h2>
          <p className="text-slate-400 text-xs">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/" className="block p-3 rounded hover:bg-slate-800 transition-colors">Dashboard</Link>
          <Link href="/users" className="block p-3 rounded hover:bg-slate-800 transition-colors">Usuarios</Link>
          <Link href="/content/juices" className="block p-3 rounded hover:bg-slate-800 transition-colors">Catálogo de Jugos</Link>
          <Link href="/content/courses" className="block p-3 rounded hover:bg-slate-800 transition-colors">Videocursos</Link>
          <Link href="/marketing/banners" className="block p-3 rounded hover:bg-slate-800 transition-colors">Banners</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="w-full text-left p-3 rounded hover:bg-slate-800 text-slate-300">Cerrar sesión</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">Panel de Control</h1>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
