'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase/config';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { 
  Users, 
  Crown, 
  DollarSign, 
  Droplet, 
  Video, 
  ArrowRight,
  TrendingUp,
  Clock,
  Image as ImageIcon,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  activePremium: number;
  totalRevenue: number;
  totalRecipes: number;
  totalCourses: number;
}

interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  authProvider: string;
  createdAt?: any;
}

interface RecentOrder {
  id: string;
  userEmail: string;
  amount: number;
  status: string;
  createdAt: any;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activePremium: 0,
    totalRevenue: 0,
    totalRecipes: 0,
    totalCourses: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs.map(doc => doc.data() as RecentUser);
        const totalUsers = usersSnap.size;
        const activePremium = usersList.filter((u: any) => u.membershipId && u.membershipId !== 'free').length;

        // 2. Fetch Orders / Revenue
        const ordersSnap = await getDocs(collection(db, 'orders'));
        let totalRevenue = 0;
        const ordersList: RecentOrder[] = [];
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'paid' || data.status === 'completed') {
            totalRevenue += Number(data.amount) || 0;
          }
          ordersList.push({
            id: doc.id,
            userEmail: data.userEmail || 'usuario@aloec.com',
            amount: Number(data.amount) || 0,
            status: data.status || 'paid',
            createdAt: data.createdAt
          });
        });

        // 3. Fetch Juices (recipes)
        const juicesSnap = await getDocs(collection(db, 'juices'));
        const totalRecipes = juicesSnap.size;

        // 4. Fetch Courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const totalCourses = coursesSnap.size;

        setStats({
          totalUsers,
          activePremium,
          totalRevenue,
          totalRecipes,
          totalCourses
        });

        // Get recent users (first 5)
        const sortedUsers = [...usersList]
          .filter(u => u.displayName || u.email)
          .slice(0, 5);
        setRecentUsers(sortedUsers);

        // Get recent orders (first 5)
        const sortedOrders = [...ordersList]
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          })
          .slice(0, 5);
        setRecentOrders(sortedOrders);

      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-ink-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-ink-100 rounded-lg border border-ink-200"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-ink-100 rounded-lg border border-ink-200"></div>
          <div className="h-64 bg-ink-100 rounded-lg border border-ink-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Resumen General</h1>
          <p className="text-sm text-ink-500 mt-1">Monitorea el rendimiento del ecosistema ALOEC en tiempo real.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#008000] bg-[#008000]/10 px-3 py-1.5 rounded-full">
          <TrendingUp size={14} />
          <span>Datos Actualizados</span>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-ink-200 p-6 flex flex-col justify-between hover:border-[#008000] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-ink-50 text-ink-700">
              <Users size={22} />
            </div>
            <Link href="/users" className="text-ink-400 group-hover:text-[#008000] transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div>
            <h3 className="text-ink-500 font-bold text-xs uppercase tracking-wider mb-1">Usuarios</h3>
            <p className="text-3xl font-extrabold text-ink-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white border border-ink-200 p-6 flex flex-col justify-between hover:border-[#008000] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-ink-50 text-[#008000]">
              <Crown size={22} />
            </div>
            <Link href="/memberships" className="text-ink-400 group-hover:text-[#008000] transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div>
            <h3 className="text-ink-500 font-bold text-xs uppercase tracking-wider mb-1">Premium Activos</h3>
            <p className="text-3xl font-extrabold text-[#008000]">{stats.activePremium}</p>
          </div>
        </div>

        <div className="bg-white border border-ink-200 p-6 flex flex-col justify-between hover:border-[#008000] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-ink-50 text-ink-700">
              <DollarSign size={22} />
            </div>
            <Link href="/billing" className="text-ink-400 group-hover:text-[#008000] transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div>
            <h3 className="text-ink-500 font-bold text-xs uppercase tracking-wider mb-1">Ingresos Totales</h3>
            <p className="text-3xl font-extrabold text-ink-900">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-ink-200 p-6 flex flex-col justify-between hover:border-[#008000] transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-ink-50 text-ink-700">
              <Droplet size={22} />
            </div>
            <Link href="/content/juices" className="text-ink-400 group-hover:text-[#008000] transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>
          <div>
            <h3 className="text-ink-500 font-bold text-xs uppercase tracking-wider mb-1">Recetas / Jugos</h3>
            <p className="text-3xl font-extrabold text-ink-900">{stats.totalRecipes}</p>
          </div>
        </div>
      </div>

      {/* Grid de Contenido y Datos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usuarios Registrados Recientes */}
        <div className="border border-ink-200 p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-ink-900">Nuevos Usuarios</h2>
              <Link href="/users" className="text-xs font-bold text-[#008000] hover:underline">
                Ver todos
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-400">No hay usuarios registrados.</div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user, idx) => (
                  <div key={user.uid || idx} className="flex justify-between items-center pb-3 border-b border-ink-100 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-ink-900">{user.displayName || 'Usuario ALOEC'}</h4>
                      <p className="text-xs text-ink-500">{user.email}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-ink-50 text-ink-600 border border-ink-200">
                      {user.authProvider || 'Email'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Facturación y Pedidos Recientes */}
        <div className="border border-ink-200 p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-ink-900">Últimos Pagos</h2>
              <Link href="/billing" className="text-xs font-bold text-[#008000] hover:underline">
                Ver facturación
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-400">No hay pagos registrados.</div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, idx) => (
                  <div key={order.id || idx} className="flex justify-between items-center pb-3 border-b border-ink-100 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-bold text-ink-900">{order.userEmail}</h4>
                      <p className="text-[10px] text-ink-500 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        ID: {order.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-ink-900">${order.amount.toFixed(2)}</span>
                      <span className="block text-[10px] font-bold text-[#008000] uppercase mt-0.5">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="border border-ink-200 p-6 bg-white">
        <h2 className="text-base font-bold text-ink-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/content/juices" className="p-4 border border-ink-200 hover:border-[#008000] text-center transition-colors">
            <Droplet className="mx-auto text-ink-600 mb-2" size={24} />
            <span className="text-xs font-bold text-ink-900 block">Nueva Receta</span>
          </Link>
          <Link href="/content/courses" className="p-4 border border-ink-200 hover:border-[#008000] text-center transition-colors">
            <Video className="mx-auto text-ink-600 mb-2" size={24} />
            <span className="text-xs font-bold text-ink-900 block">Nuevo Curso</span>
          </Link>
          <Link href="/marketing/banners" className="p-4 border border-ink-200 hover:border-[#008000] text-center transition-colors">
            <ImageIcon className="mx-auto text-ink-600 mb-2" size={24} />
            <span className="text-xs font-bold text-ink-900 block">Subir Banner</span>
          </Link>
          <Link href="/settings" className="p-4 border border-ink-200 hover:border-[#008000] text-center transition-colors">
            <Settings className="mx-auto text-ink-600 mb-2" size={24} />
            <span className="text-xs font-bold text-ink-900 block">Ajustes App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
