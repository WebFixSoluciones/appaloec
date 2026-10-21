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
  ShieldAlert,
  Building2,
  ExternalLink,
  ZoomIn,
  CheckCircle2,
  XCircle,
  FileText
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
  receiptUrl?: string;
  receiptReference?: string;
  country?: string;
  rejectionReason?: string;
  approvedAt?: any;
  metadata?: any;
  createdAt?: any;
  updatedAt?: any;
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
  
  // Receipt Image Preview Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  // Rejection Dialog State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Comprobante ilegible o incompleto');
  const [customRejectReason, setCustomRejectReason] = useState('');

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
            receiptUrl: data.receiptUrl || data.voucherUrl || '',
            receiptReference: data.receiptReference || data.receiptReferenceNumber || data.referenceNumber || '',
            country: data.country || 'EC',
            rejectionReason: data.rejectionReason || '',
            approvedAt: data.approvedAt,
            metadata: data.metadata || null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
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

  const handleApproveTransfer = async (order: Order) => {
    setUpdatingStatus(true);
    const toastId = toast.loading('Aprobando pago y activando membresía Premium...');

    try {
      // 1. Update Order
      const orderRef = doc(db, 'orders', order.id);
      const now = new Date();
      await updateDoc(orderRef, {
        status: 'paid',
        approvedAt: now,
        updatedAt: now
      });

      // 2. Fetch membership to determine duration
      let durationDays = 30;
      if (order.membershipId) {
        try {
          const mDoc = await doc(db, 'memberships', order.membershipId);
          const snap = await getDocs(collection(db, 'memberships'));
          snap.forEach((d) => {
            if (d.id === order.membershipId) {
              durationDays = Number(d.data().durationDays) || 30;
            }
          });
        } catch (_) {}
      }

      // 3. Update User to Premium
      if (order.userId) {
        try {
          const userRef = doc(db, 'users', order.userId);
          const premiumUntil = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
          await updateDoc(userRef, {
            isPremium: true,
            membershipId: order.membershipId,
            membershipName: order.membershipName,
            premiumSince: now,
            premiumUntil: premiumUntil,
            updatedAt: now
          });
        } catch (uErr) {
          console.warn('Could not update user document directly:', uErr);
        }
      }

      // 4. Audit Log
      await logAdminAction('UPDATE', 'orders', order.id, {
        description: `Aprobó transferencia bancaria (#${order.invoiceNumber}) por $${order.amount.toFixed(2)} y activó suscripción de ${order.userEmail}`,
        previousValues: { status: order.status },
        newValues: { status: 'paid', approvedAt: now }
      });

      // 4.5. Procesar comisión de afiliados / referidos si aplica
      try {
        const refRes = await fetch('/api/admin/referral/process-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });
        const refData = await refRes.json();
        if (refData.success && refData.commissionId) {
          console.log(`[Billing] Comisión de referidos generada automáticamente: $${refData.amountUSD}`);
        }
      } catch (refErr) {
        console.warn('Error al procesar comisión de referidos tras aprobación:', refErr);
      }

      // 5. Update local state
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'paid', approvedAt: now } : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: 'paid', approvedAt: now });
      }

      toast.success('¡Transferencia aprobada! La membresía Premium ya está activa.', { id: toastId });
    } catch (err: any) {
      console.error('Error approving transfer:', err);
      toast.error('Error al aprobar: ' + err.message, { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRejectTransfer = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    const finalReason = rejectReason === 'Otro' ? customRejectReason.trim() : rejectReason;
    const toastId = toast.loading('Rechazando pago...');

    try {
      const orderRef = doc(db, 'orders', selectedOrder.id);
      const now = new Date();
      await updateDoc(orderRef, {
        status: 'failed',
        rejectionReason: finalReason || 'Comprobante no válido',
        updatedAt: now
      });

      // Audit Log
      await logAdminAction('UPDATE', 'orders', selectedOrder.id, {
        description: `Rechazó comprobante de pago (#${selectedOrder.invoiceNumber}): ${finalReason}`,
        previousValues: { status: selectedOrder.status },
        newValues: { status: 'failed', rejectionReason: finalReason }
      });

      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'failed', rejectionReason: finalReason } : o));
      setSelectedOrder({ ...selectedOrder, status: 'failed', rejectionReason: finalReason });

      toast.warning('Pago marcado como rechazado', { id: toastId });
      setIsRejectDialogOpen(false);
    } catch (err: any) {
      console.error('Error rejecting order:', err);
      toast.error('Error al rechazar: ' + err.message, { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'paid' | 'pending' | 'failed') => {
    if (!selectedOrder) return;
    if (newStatus === 'paid') {
      await handleApproveTransfer(selectedOrder);
      return;
    }
    if (newStatus === 'failed') {
      setIsRejectDialogOpen(true);
      return;
    }

    setUpdatingStatus(true);
    const toastId = toast.loading('Actualizando estado del pago...');

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });

      await logAdminAction('UPDATE', 'orders', orderId, {
        description: `Modificación manual de estado de factura a: ${newStatus}`,
        previousValues: { status: selectedOrder.status },
        newValues: { status: newStatus }
      });

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

  const pendingTransfersCount = orders.filter(
    (o) => o.paymentMethod === 'bank_transfer' && o.status === 'pending'
  ).length;

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch = o.userEmail.toLowerCase().includes(term) || o.invoiceNumber?.toLowerCase().includes(term) || (o.receiptReference && o.receiptReference.toLowerCase().includes(term));
    
    if (statusFilter === 'pending_transfers') {
      return matchesSearch && o.paymentMethod === 'bank_transfer' && o.status === 'pending';
    }
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp?: any) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
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
          <p className="text-sm text-ink-500 mt-1">Valida transferencias bancarias, monitorea ingresos y administra estados de cobro.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
              placeholder="Buscar email, factura o ref..."
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
              <option value="pending_transfers">Transferencias Pendientes ({pendingTransfersCount})</option>
              <option value="paid">Pagados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'}`}
        >
          Todos ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending_transfers')}
          className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1.5 ${statusFilter === 'pending_transfers' ? 'bg-[#008000] text-white' : 'bg-white border border-ink-200 text-[#008000] hover:bg-[#008000]/10'}`}
        >
          <Building2 size={13} />
          Transferencias Pendientes
          {pendingTransfersCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
              {pendingTransfersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === 'paid' ? 'bg-[#008000] text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'}`}
        >
          Pagados ({orders.filter(o => o.status === 'paid').length})
        </button>
        <button
          onClick={() => setStatusFilter('failed')}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'}`}
        >
          Rechazados ({orders.filter(o => o.status === 'failed').length})
        </button>
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
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm text-ink-900">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-ink-700">
                    {order.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium block">{order.userEmail}</span>
                    {order.receiptReference && (
                      <span className="text-[10px] text-ink-400 font-mono">Ref: {order.receiptReference}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#008000]">
                    {order.membershipName}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-ink-900">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {order.paymentMethod === 'bank_transfer' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <Building2 size={12} /> Transferencia
                        {order.receiptUrl && (
                          <button
                            onClick={() => setPreviewReceiptUrl(order.receiptUrl!)}
                            className="ml-1 text-blue-900 hover:text-black"
                            title="Ver comprobante"
                          >
                            <FileText size={12} />
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-ink-700">
                        {order.paymentMethod || 'PayPhone'}
                      </span>
                    )}
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
                      className={`px-3 py-1 text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                        order.paymentMethod === 'bank_transfer' && order.status === 'pending'
                          ? 'bg-[#008000] hover:bg-[#006400] text-white'
                          : 'border border-ink-300 text-ink-700 hover:bg-ink-50'
                      }`}
                    >
                      <Eye size={12} />
                      {order.paymentMethod === 'bank_transfer' && order.status === 'pending' ? 'Revisar' : 'Ver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Details Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative my-8 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-ink-900">
                  {selectedOrder.paymentMethod === 'bank_transfer' ? 'Validación de Transferencia Bancaria' : 'Comprobante de Pago'}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">Factura #{selectedOrder.invoiceNumber}</p>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-ink-400 hover:text-ink-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bank Transfer Receipt Highlight Card */}
            {selectedOrder.paymentMethod === 'bank_transfer' && (
              <div className="bg-blue-50/70 border border-blue-200 p-4 mb-4 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-blue-900 uppercase flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-700" /> Comprobante Adjunto
                  </span>
                  {selectedOrder.receiptReference && (
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 border border-blue-200 text-blue-800">
                      Ref: {selectedOrder.receiptReference}
                    </span>
                  )}
                </div>

                {selectedOrder.receiptUrl ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setPreviewReceiptUrl(selectedOrder.receiptUrl!)}
                      className="relative border border-blue-200 bg-white rounded overflow-hidden cursor-pointer group max-h-48 flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={selectedOrder.receiptUrl} 
                        alt="Comprobante Bancario" 
                        className="object-contain max-h-48 w-full group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                        <ZoomIn size={16} /> Ver a tamaño completo
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewReceiptUrl(selectedOrder.receiptUrl!)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Abrir imagen en pantalla completa
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-blue-800 italic">
                    El usuario notificó la compra pero no adjuntó archivo directo en la app (posiblemente enviado por WhatsApp).
                  </p>
                )}

                {selectedOrder.rejectionReason && (
                  <div className="mt-3 bg-red-100 border border-red-200 p-2 text-xs text-red-800">
                    <span className="font-bold block">Motivo de Rechazo:</span>
                    {selectedOrder.rejectionReason}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 border-y border-ink-100 py-4 mb-4 text-sm text-ink-900">
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium text-xs">Cliente:</span>
                <span className="font-bold text-xs">{selectedOrder.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium text-xs">Plan Adquirido:</span>
                <span className="font-bold text-[#008000] text-xs">{selectedOrder.membershipName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium text-xs">Monto a Cobrar:</span>
                <span className="font-extrabold text-base text-ink-900">${selectedOrder.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium text-xs">Método de Pago:</span>
                <span className="font-medium text-xs">{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.transactionId && selectedOrder.transactionId !== 'N/A' && (
                <div className="flex justify-between">
                  <span className="text-ink-500 font-medium text-xs">ID Pasarela:</span>
                  <span className="font-mono text-xs bg-ink-50 px-2 py-0.5 border border-ink-200">{selectedOrder.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-500 font-medium text-xs">Fecha y Hora:</span>
                <span className="text-xs">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-500 font-medium text-xs">Estado de Transacción:</span>
                <span>{getStatusBadge(selectedOrder.status)}</span>
              </div>
            </div>

            {/* Action Buttons for Bank Transfer / Manual Resolution */}
            <div className="bg-ink-50 border border-ink-200 p-4 mb-4">
              <span className="text-xs font-bold text-ink-800 uppercase block mb-3 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-[#008000]" />
                {selectedOrder.paymentMethod === 'bank_transfer' ? 'Decisión del Administrador' : 'Ajuste Manual de Estado'}
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleApproveTransfer(selectedOrder)}
                  disabled={updatingStatus || selectedOrder.status === 'paid'}
                  className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Aprobar Pago y Activar Premium
                </button>
                <button
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={updatingStatus || selectedOrder.status === 'failed'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle size={14} />
                  Rechazar Comprobante
                </button>
              </div>
              <p className="text-[11px] text-ink-500 mt-2.5">
                Al aprobar, el usuario quedará marcado automáticamente como <strong className="text-ink-800 font-bold">Premium</strong> en Firestore con su vigencia correspondiente.
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

      {/* Reject Reason Dialog Modal */}
      {isRejectDialogOpen && selectedOrder && (
        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs flex justify-center items-center z-60 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-md p-6 relative shadow-2xl">
            <h3 className="text-base font-bold text-ink-900 mb-2 flex items-center gap-2">
              <XCircle className="text-red-600" size={18} />
              Rechazar Comprobante Bancario
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Selecciona el motivo por el cual no se puede validar este pago para la factura #{selectedOrder.invoiceNumber}:
            </p>

            <div className="space-y-3 mb-5 text-xs">
              {[
                'Comprobante ilegible o incompleto',
                'El monto transferido es menor al precio del plan',
                'No se visualiza el depósito en la cuenta receptora',
                'Comprobante duplicado o ya utilizado',
                'Otro'
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer text-ink-800 font-medium">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  {reason}
                </label>
              ))}

              {rejectReason === 'Otro' && (
                <textarea
                  rows={2}
                  className="w-full p-2 border border-ink-300 outline-none focus:border-red-600 text-xs text-ink-900 mt-2"
                  placeholder="Escribe el motivo del rechazo..."
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={updatingStatus}
                className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-xs hover:bg-ink-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectTransfer}
                disabled={updatingStatus}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-70 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-2 rounded shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-2 border-b border-ink-100">
              <span className="text-xs font-bold text-ink-800">Visualización de Comprobante</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewReceiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 bg-ink-100 hover:bg-ink-200 text-ink-800 text-xs font-bold rounded flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Abrir original
                </a>
                <button
                  onClick={() => setPreviewReceiptUrl(null)}
                  className="p-1 text-ink-500 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewReceiptUrl}
                alt="Comprobante en alta resolución"
                className="object-contain max-h-[75vh] max-w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
