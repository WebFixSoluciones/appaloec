'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  Receipt, 
  Search, 
  Filter, 
  Check, 
  AlertCircle, 
  Clock, 
  Eye, 
  X, 
  ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  membershipId: string;
  membershipName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  invoiceNumber?: string;
  metadata?: any;
  createdAt?: any;
}

export default function BillingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal for detail view / editing status
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'orders'));
        const list: Order[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId || '',
            userEmail: data.userEmail || 'usuario@aloec.com',
            membershipId: data.membershipId || 'free',
            membershipName: data.membershipName || 'Membresía Desconocida',
            amount: Number(data.amount) || 0,
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || 'PayPhone',
            transactionId: data.transactionId || 'N/A',
            invoiceNumber: data.invoiceNumber || docSnap.id.slice(0, 8).toUpperCase(),
            metadata: data.metadata || null,
            createdAt: data.createdAt
          });
        });
        
        // Sort orders by date (newest first)
        list.sort((a, b) => {
          const secondsA = a.createdAt?.seconds || 0;
          const secondsB = b.createdAt?.seconds || 0;
          return secondsB - secondsA;
        });

        setOrders(list);
      } catch (err) {
        console.error('Error loading orders:', err);
        toast.error('Error al cargar historial de facturas y cobros');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'paid' | 'pending' | 'failed') => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const toastId = toast.loading('Actualizando estado del pago...');

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });

      // Log Audit for traceability
      await logAdminAction('UPDATE', 'orders', orderId, {
        description: `Modificación manual de estado de factura a: ${newStatus}`,
        previousValues: { status: selectedOrder.status },
        newValues: { status: newStatus }
      });

      // Update state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      toast.success('Pago actualizado correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error updating order:', err);
      toast.error('Error al actualizar: ' + err.message, { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: 'paid' | 'pending' | 'failed') => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#008000]/10 text-[#008000]">
            <Check size={12} /> Pagado
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <X size={12} /> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock size={12} /> Pendiente
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch = o.userEmail.toLowerCase().includes(term) || o.invoiceNumber?.toLowerCase().includes(term);
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp?: any) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Historial de Pagos y Facturación</h1>
          <p className="text-sm text-ink-500 mt-1">Monitorea los ingresos generados y el estado de las transacciones de los usuarios.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
              placeholder="Buscar email o factura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <select
              className="w-full pl-3 pr-8 py-2 border border-ink-200 bg-white outline-none focus:border-[#008000] text-sm text-ink-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="paid">Pagados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Receipt className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin cobros registrados</p>
          <p className="text-sm">No se encontraron cobros para los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="bg-white border border-ink-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-bold text-ink-700 uppercase">
                <th className="px-6 py-4">Factura #</th>
                <th className="px-6 py-4">Usuario (Email)</th>
                <th className="px-6 py-4">Membresía</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Ver Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm text-ink-900">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-ink-700">
                    {order.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{order.userEmail}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#008000]">
                    {order.membershipName}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-ink-900">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs text-ink-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                      className="px-2.5 py-1 text-xs border border-ink-300 text-ink-700 font-bold hover:bg-ink-50 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Details Modal (Dropbox Flat Layout) */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Comprobante de Pago</h3>
                <p className="text-xs text-ink-500 mt-1">Factura #{selectedOrder.invoiceNumber}</p>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-ink-400 hover:text-ink-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 border-y border-ink-100 py-4 mb-6 text-sm text-ink-900">
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">Cliente:</span>
                <span className="font-bold">{selectedOrder.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">Plan Adquirido:</span>
                <span className="font-bold text-[#008000]">{selectedOrder.membershipName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">Monto Pagado:</span>
                <span className="font-extrabold text-lg">${selectedOrder.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">Método de Pago:</span>
                <span className="font-medium">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">ID Transacción Pasarela:</span>
                <span className="font-mono text-xs bg-ink-50 px-2 py-0.5 border border-ink-200">{selectedOrder.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium">Fecha y Hora:</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-500 font-medium">Estado Transacción:</span>
                <span>{getStatusBadge(selectedOrder.status)}</span>
              </div>
            </div>

            {/* Manual Status Adjustment Console */}
            <div className="bg-ink-50 border border-ink-200 p-4 mb-6">
              <span className="text-xs font-bold text-ink-700 uppercase block mb-3 flex items-center gap-1">
                <ShieldAlert size={14} className="text-purple-600" />
                Acciones de Emergencia Administrativa
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}
                  disabled={updatingStatus || selectedOrder.status === 'paid'}
                  className="px-3 py-1.5 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs transition-colors disabled:opacity-50"
                >
                  Marcar como Pagado
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'failed')}
                  disabled={updatingStatus || selectedOrder.status === 'failed'}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
                >
                  Marcar como Rechazado
                </button>
              </div>
              <p className="text-[10px] text-ink-500 mt-2">
                * Nota: Modificar el estado de forma manual actualizará los privilegios de la membresía del usuario y registrará una alerta en la bitácora de auditoría.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-ink-100">
              <button
                type="button"
                className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50 transition-colors"
                onClick={() => setIsDetailOpen(false)}
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
