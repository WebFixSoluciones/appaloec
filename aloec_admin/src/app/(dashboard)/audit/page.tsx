'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { ShieldAlert, Calendar, User, Database, Eye, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  targetCollection: string;
  targetId: string;
  details: {
    previousValues?: any;
    newValues?: any;
    description?: string;
  };
  timestamp?: any;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  async function loadLogs() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'audit_logs'));
      const list: AuditLog[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          adminId: data.adminId || 'N/A',
          adminEmail: data.adminEmail || 'sistema@aloec.com',
          action: data.action || 'UPDATE',
          targetCollection: data.targetCollection || 'Desconocido',
          targetId: data.targetId || 'N/A',
          details: data.details || {},
          timestamp: data.timestamp
        });
      });

      // Sort logs by timestamp descending
      list.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setLogs(list);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      toast.error('Error al cargar la bitácora de auditoría');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const formatDate = (timestamp?: any) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: 'CREATE' | 'UPDATE' | 'DELETE') => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 uppercase border border-green-200">
            CREAR
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 uppercase border border-red-200">
            ELIMINAR
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 uppercase border border-blue-200">
            MODIFICAR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Bitácora de Auditoría (Trazabilidad)</h1>
          <p className="text-sm text-ink-500 mt-1">Inspecciona todas las acciones de creación, modificación y eliminación ejecutadas por los administradores.</p>
        </div>
        <button
          onClick={loadLogs}
          className="px-4 py-2 border border-ink-300 hover:bg-ink-50 text-ink-700 font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <ShieldAlert className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin registros de auditoría</p>
          <p className="text-sm">Las acciones del administrador se registrarán aquí en tiempo real para trazabilidad.</p>
        </div>
      ) : (
        <div className="bg-white border border-ink-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-bold text-ink-700 uppercase">
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Administrador</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Colección</th>
                <th className="px-6 py-4">ID Documento</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm text-ink-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-ink-500 font-bold flex items-center gap-1.5 mt-1.5">
                    <Calendar size={12} className="text-ink-400" />
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold flex items-center gap-1 text-xs">
                      <User size={12} className="text-[#008000]" />
                      {log.adminEmail}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-ink-700 font-bold">
                    {log.targetCollection}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-ink-500">
                    {log.targetId.slice(0, 12)}...
                  </td>
                  <td className="px-6 py-4 text-xs text-ink-600 truncate max-w-[200px]" title={log.details?.description}>
                    {log.details?.description || 'Sin descripción'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedLog(log); setIsDetailOpen(true); }}
                      className="px-2 py-1 text-xs border border-ink-300 text-ink-700 font-bold hover:bg-ink-50 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={12} />
                      Inspeccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Detail Modal (Dropbox Flat JSON Diff Layout) */}
      {isDetailOpen && selectedLog && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-ink-900">Detalles de Operación</h3>
                <p className="text-xs text-ink-500 mt-1">Inspección de datos del documento `{selectedLog.targetId}` en la colección `{selectedLog.targetCollection}`</p>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-ink-400 hover:text-ink-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-ink-50 border border-ink-200 p-3 text-xs space-y-1">
                <span className="font-bold block text-ink-700">Resumen:</span>
                <div><span className="font-bold text-ink-500">Administrador:</span> {selectedLog.adminEmail} ({selectedLog.adminId})</div>
                <div><span className="font-bold text-ink-500">Acción:</span> {selectedLog.action}</div>
                <div><span className="font-bold text-ink-500">Descripción:</span> {selectedLog.details?.description || 'N/A'}</div>
                <div><span className="font-bold text-ink-500">Fecha y Hora:</span> {formatDate(selectedLog.timestamp)}</div>
              </div>

              {/* JSON Diff Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-ink-700 uppercase block mb-1.5">Valores Anteriores (Pre-Edit)</span>
                  <div className="bg-ink-900 text-ink-100 p-3 rounded font-mono text-xs overflow-x-auto h-64 border border-ink-800">
                    {selectedLog.details?.previousValues ? (
                      <pre>{JSON.stringify(selectedLog.details.previousValues, null, 2)}</pre>
                    ) : (
                      <span className="text-ink-500 italic">No hay valores previos (Acción Crear)</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-ink-700 uppercase block mb-1.5">Valores Nuevos (Post-Edit)</span>
                  <div className="bg-ink-900 text-ink-100 p-3 rounded font-mono text-xs overflow-x-auto h-64 border border-ink-800">
                    {selectedLog.details?.newValues ? (
                      <pre>{JSON.stringify(selectedLog.details.newValues, null, 2)}</pre>
                    ) : (
                      <span className="text-ink-500 italic">No hay valores nuevos (Acción Eliminar)</span>
                    )}
                  </div>
                </div>
              </div>
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
