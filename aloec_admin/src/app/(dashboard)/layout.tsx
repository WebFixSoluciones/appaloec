'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase/config';
import { signOut } from 'firebase/auth';
import AuthGuard from '../../components/AuthGuard';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Play,
  Droplet, 
  Image as ImageIcon,
  CreditCard,
  Receipt,
  ShieldAlert,
  Settings,
  Globe,
  Database,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Gift
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Programa de Referidos', href: '/referral', icon: Gift },
    { name: 'Recetas y Jugos', href: '/content/juices', icon: Droplet },
    { name: 'Cursos', href: '/content/courses', icon: Video },
    { name: 'Lecciones', href: '/content/lessons', icon: Play },
    { name: 'Protocolos IMC', href: '/content/protocols', icon: ClipboardList },
    { name: 'Membresías', href: '/memberships', icon: CreditCard },
    { name: 'Pasarelas de Pago', href: '/gateways', icon: ShieldAlert },
    { name: 'Pagos y Facturas', href: '/billing', icon: Receipt },
    { name: 'Banners Marketing', href: '/marketing/banners', icon: ImageIcon },
    { name: 'Auditoría (Logs)', href: '/audit', icon: ShieldAlert },
    { name: 'Ajustes del Sistema', href: '/settings', icon: Settings },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* Header Superior Estilo Dropbox */}
        <header className="h-16 bg-white border-b border-ink-200 flex justify-between items-center px-6 sticky top-0 z-40 select-none">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-ink-600 hover:text-ink-900 md:hidden mr-2">
              <Menu size={24} />
            </button>
            <img src="/logo.png" alt="ALOEC Logo" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline-block font-bold text-ink-900 text-lg">| Panel Administrativo</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-50 border border-ink-200 text-ink-700 text-xs font-bold rounded-full">
              <Database size={14} className={db ? "text-[#008000]" : "text-red-500"} />
              {db ? "Firebase Sincronizado" : "Sin conexión"}
            </div>
            <a href="https://aloec.com" target="_blank" rel="noopener noreferrer" className="text-ink-500 hover:text-ink-900 transition-colors" title="Ir al sitio web">
              <Globe size={22} />
            </a>
          </div>
        </header>

        {/* Cuerpo del Layout */}
        <div className="flex-1 flex relative">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-ink-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-[calc(100vh-4rem)] flex flex-col justify-between`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="flex justify-between items-center md:hidden mb-4">
                <span className="font-bold text-ink-900">Menú</span>
                <button onClick={() => setSidebarOpen(false)} className="text-ink-500 hover:text-ink-900">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 ${
                        isActive 
                          ? 'bg-ink-50 text-[#008000] font-bold' 
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 font-medium'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#008000]' : 'text-ink-500'} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-ink-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-ink-600 hover:bg-ink-50 hover:text-red-600 font-medium transition-colors text-sm"
              >
                <LogOut size={18} className="text-ink-500 group-hover:text-red-600" />
                Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
            <div className="flex-1 overflow-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
            
            {/* Footer desarrollado por Web Fix */}
            <footer className="w-full py-4 border-t border-ink-200 text-center text-sm text-ink-500 bg-white">
              Desarrollado por <a href="https://webfixsoluciones.net" target="_blank" rel="noopener noreferrer" className="text-[#008000] hover:underline font-bold">Web Fix</a>
            </footer>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
