'use client';

import React, { useEffect, useState } from 'react';
import {
  X, User, Mail, Phone, Calendar, CreditCard, Building,
  DollarSign, Copy, Check, ExternalLink, AlertCircle,
  Clock, ShieldCheck, ArrowUpRight, MessageCircle, RefreshCw, Send,
  Coins, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateDetailModalProps {
  uid: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent: () => void;
}

export default function AffiliateDetailModal({
  uid,
  isOpen,
  onClose,
  onRefreshParent,
}: AffiliateDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'referred' | 'commissions' | 'payouts'>('methods');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Formulario de pago directo
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethodLabel, setPayoutMethodLabel] = useState('');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [releasingPending, setReleasingPending] = useState(false);

  useEffect(() => {
    if (isOpen && uid) {
      loadDetail();
    } else {
      setData(null);
      setShowPayoutForm(false);
    }
  }, [isOpen, uid]);

  async function loadDetail() {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/referral/affiliate-detail?uid=${uid}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al obtener datos del afiliado');
      setData(json);

      const appr = Number(json.user?.affiliateBalance?.approvedUSD) || 0;
      const pend = Number(json.user?.affiliateBalance?.pendingUSD) || 0;
      const initialPay = appr > 0 ? appr : pend;
      setPayoutAmount(initialPay);

      // Preseleccionar método
      if (json.payoutMethods && json.payoutMethods.length > 0) {
        const first = json.payoutMethods[0];
        const details = first.details || {};
        if (first.type === 'binance' || details.payId) {
          setPayoutMethodLabel(`Binance Pay (Pay ID: ${details.payId || first.label || ''})`);
        } else if (first.type === 'paypal' || details.paypalEmail || details.email) {
          setPayoutMethodLabel(`PayPal (${details.paypalEmail || details.email || first.label})`);
        } else {
          setPayoutMethodLabel(first.label || `${details.bank || details.bankName || 'Banco Ecuador'}`);
        }
      } else {
        setPayoutMethodLabel('Transferencia Bancaria');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copiado');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  // Liberar comisiones pendientes con 1 clic
  async function handleReleasePending() {
    if (!uid) return;
    setReleasingPending(true);
    const toastId = toast.loading('Liberando comisiones pendientes...');
    try {
      const res = await fetch('/api/admin/referral/release-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al liberar comisiones');

      toast.success(`¡$${Number(json.releasedUSD || 0).toFixed(2)} liberados a Disponible!`, { id: toastId });
      await loadDetail();
      onRefreshParent();
    } catch (err: any) {
      toast.error(err.message || 'Error al liberar comisiones', { id: toastId });
    } finally {
      setReleasingPending(false);
    }
  }

  // Registrar pago directo
  async function handleDirectPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;

    if (payoutAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    const available = (Number(data?.user?.affiliateBalance?.approvedUSD) || 0) +
                      (Number(data?.user?.affiliateBalance?.pendingUSD) || 0);

    if (payoutAmount > available + 0.01) {
      toast.error(`El monto no puede superar el saldo total de $${available.toFixed(2)}`);
      return;
    }

    setSubmittingPayout(true);
    const toastId = toast.loading('Registrando pago a afiliado...');

    try {
      const res = await fetch('/api/admin/referral/direct-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          amountUSD: payoutAmount,
          methodSnapshot: {
            label: payoutMethodLabel || 'Pago de Afiliado',
            type: payoutMethodLabel.toLowerCase().includes('binance') ? 'binance' : 'direct',
          },
          transactionReference: payoutReference.trim(),
          notes: payoutNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al procesar pago');

      toast.success(`Pago de $${payoutAmount.toFixed(2)} registrado exitosamente`, { id: toastId });
      setShowPayoutForm(false);
      setPayoutReference('');
      setPayoutNotes('');
      await loadDetail();
      onRefreshParent();
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar pago', { id: toastId });
    } finally {
      setSubmittingPayout(false);
    }
  }

  if (!isOpen) return null;

  const user = data?.user;
  const methods = data?.payoutMethods || [];
  const referred = data?.referredUsers || [];
  const comms = data?.commissions || [];
  const payouts = data?.payouts || [];

  const pendingUSD = Number(user?.affiliateBalance?.pendingUSD) || 0;
  const approvedUSD = Number(user?.affiliateBalance?.approvedUSD) || 0;
  const paidUSD = Number(user?.affiliateBalance?.paidUSD) || 0;
  const totalEarned = pendingUSD + approvedUSD;

  const refLink = user?.referralCode
    ? `https://app.alimentacionorganicaec.net/?ref=${user.referralCode}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Flat Minimalist */}
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-sm flex items-center justify-center">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AF'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {loading ? 'Cargando afiliado...' : user?.displayName || 'Sin nombre'}
                </h3>
                {user?.isPremium && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {user?.email || 'Sin correo'}
                {user?.phone && ` • ${user.phone}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="animate-spin mx-auto text-emerald-700" size={24} />
              <p className="text-xs">Cargando datos del afiliado...</p>
            </div>
          ) : !user ? (
            <div className="py-12 text-center text-slate-500">
              <p className="font-bold text-sm">No se encontró el afiliado.</p>
            </div>
          ) : (
            <>
              {/* Balances - Flat Clean Surfaces (No Borders) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-amber-50">
                  <span className="text-[11px] font-semibold text-amber-800">Saldo Pendiente</span>
                  <p className="text-xl font-bold text-amber-950 mt-0.5">
                    ${pendingUSD.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-amber-700">Por compras recientes</span>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50">
                  <span className="text-[11px] font-semibold text-emerald-800">Disponible para Pago</span>
                  <p className="text-xl font-bold text-emerald-950 mt-0.5">
                    ${approvedUSD.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-emerald-700">Listo para liquidar</span>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-50">
                  <span className="text-[11px] font-semibold text-blue-800">Total Pagado</span>
                  <p className="text-xl font-bold text-blue-950 mt-0.5">
                    ${paidUSD.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-blue-700">Histórico transferido</span>
                </div>
              </div>

              {/* Botón de acción rápida si tiene saldo pendiente */}
              {pendingUSD > 0 && approvedUSD === 0 && (
                <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <AlertCircle size={16} className="text-amber-700 shrink-0" />
                    <span>
                      Tiene <strong>${pendingUSD.toFixed(2)}</strong> pendiente. ¿Deseas liberarlo para pagarle ahora?
                    </span>
                  </div>
                  <button
                    onClick={handleReleasePending}
                    disabled={releasingPending}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    {releasingPending ? 'Liberando...' : 'Aprobar Saldo'}
                  </button>
                </div>
              )}

              {/* Código de Afiliado - Flat Minimal */}
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Código de referido:</span>
                  <span className="font-mono font-bold text-slate-900 ml-2">{user.referralCode || '-'}</span>
                </div>
                {refLink && (
                  <button
                    onClick={() => handleCopy(refLink, 'link')}
                    className="px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-100 font-semibold rounded text-xs transition-colors"
                  >
                    {copiedKey === 'link' ? 'Copiado' : 'Copiar enlace'}
                  </button>
                )}
              </div>

              {/* Barra de Pago Directo - Flat Minimal */}
              <div className="p-4 bg-emerald-800 rounded-lg text-white flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Pagar Comisiones</p>
                  <p className="text-xs text-emerald-100">
                    Saldo total para liquidar:{' '}
                    <strong>${totalEarned.toFixed(2)} USD</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoutForm(!showPayoutForm)}
                  disabled={totalEarned <= 0}
                  className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPayoutForm ? 'Cerrar Formulario' : totalEarned > 0 ? 'Registrar Pago' : 'Sin saldo'}
                </button>
              </div>

              {/* Formulario de Pago Plano */}
              {showPayoutForm && (
                <form
                  onSubmit={handleDirectPayout}
                  className="p-4 bg-slate-50 rounded-lg space-y-3 text-xs"
                >
                  <p className="font-bold text-slate-900 text-sm">
                    Registrar Pago al Afiliado
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Monto a pagar (USD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={totalEarned}
                        required
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white rounded font-mono font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Cuenta o Método Destino *</label>
                      <input
                        type="text"
                        required
                        value={payoutMethodLabel}
                        onChange={(e) => setPayoutMethodLabel(e.target.value)}
                        placeholder="Ej. Binance Pay ID 11931006"
                        className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nº Comprobante / ID Transacción *</label>
                      <input
                        type="text"
                        required
                        value={payoutReference}
                        onChange={(e) => setPayoutReference(e.target.value)}
                        placeholder="Ej. ID de orden Binance Pay / Nº de transferencia"
                        className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Notas (opcional)</label>
                      <input
                        type="text"
                        value={payoutNotes}
                        onChange={(e) => setPayoutNotes(e.target.value)}
                        placeholder="Observación interna"
                        className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPayoutForm(false)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPayout}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded transition-colors disabled:opacity-50"
                    >
                      {submittingPayout ? 'Guardando...' : 'Confirmar y Guardar Pago'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabs de Detalle */}
              <div className="flex gap-4 border-b border-slate-100 text-xs font-bold pt-1">
                <button
                  onClick={() => setActiveTab('methods')}
                  className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'methods'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Métodos de Pago ({methods.length})
                </button>
                <button
                  onClick={() => setActiveTab('referred')}
                  className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'referred'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Referidos ({referred.length})
                </button>
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'commissions'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Comisiones ({comms.length})
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`pb-2 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'payouts'
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Historial de Pagos ({payouts.length})
                </button>
              </div>

              {/* CONTENIDO TAB 1: MÉTODOS DE PAGO */}
              {activeTab === 'methods' && (
                <div className="space-y-3">
                  {methods.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                      El afiliado aún no ha configurado sus métodos de cobro en la app móvil.
                    </div>
                  ) : (
                    methods.map((m: any, idx: number) => {
                      const details = m.details || {};
                      const isBinance = m.type === 'binance' || details.payId;
                      const isBank = m.type === 'bank_ec' || m.type === 'bank' || details.bank || details.bankName;
                      const isPaypal = m.type === 'paypal' || details.paypalEmail || details.email;

                      return (
                        <div
                          key={m.id || idx}
                          className="p-4 bg-slate-50 rounded-lg space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                              {isBinance
                                ? 'Cuenta Binance Pay'
                                : isBank
                                ? 'Transferencia Bancaria Ecuador'
                                : 'PayPal'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {m.label || ''}
                            </span>
                          </div>

                          {/* CASO BINANCE */}
                          {isBinance && (
                            <div className="p-3 bg-white rounded space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-[11px]">Binance Pay ID:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-800 text-sm">
                                    {details.payId || '-'}
                                  </span>
                                  {details.payId && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(details.payId, `binance_${idx}`)}
                                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] flex items-center gap-1"
                                      title="Copiar Pay ID"
                                    >
                                      {copiedKey === `binance_${idx}` ? <Check size={11} className="text-emerald-700" /> : <Copy size={11} />}
                                      {copiedKey === `binance_${idx}` ? 'Copiado' : 'Copiar'}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {m.label && (
                                <div className="flex items-center justify-between text-slate-600">
                                  <span>Nombre / Alias:</span>
                                  <span className="font-semibold text-slate-800">{m.label}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* CASO BANCO ECUADOR */}
                          {isBank && (
                            <div className="p-3 bg-white rounded space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Banco:</span>
                                <span className="font-bold text-slate-800">{details.bank || details.bankName || 'No especificado'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Tipo de Cuenta:</span>
                                <span className="font-bold text-slate-800">{details.accountType || 'Ahorros'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500">Número de Cuenta:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">{details.accountNumber || '-'}</span>
                                  {details.accountNumber && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(details.accountNumber, `acc_${idx}`)}
                                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                                    >
                                      {copiedKey === `acc_${idx}` ? 'Copiado' : 'Copiar'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Titular:</span>
                                <span className="font-bold text-slate-800">{details.holderName || user.displayName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500">Cédula / RUC:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">{details.idNumber || '-'}</span>
                                  {details.idNumber && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(details.idNumber, `id_${idx}`)}
                                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                                    >
                                      {copiedKey === `id_${idx}` ? 'Copiado' : 'Copiar'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CASO PAYPAL */}
                          {isPaypal && (
                            <div className="p-3 bg-white rounded flex justify-between items-center">
                              <span className="text-slate-500">Correo PayPal:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">
                                  {details.paypalEmail || details.email || user.email}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(details.paypalEmail || details.email || user.email, `pp_${idx}`)}
                                  className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                                >
                                  {copiedKey === `pp_${idx}` ? 'Copiado' : 'Copiar'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* CONTENIDO TAB 2: USUARIOS REFERIDOS */}
              {activeTab === 'referred' && (
                <div className="space-y-2 text-xs">
                  {referred.length === 0 ? (
                    <p className="text-center py-6 text-slate-400">Sin referidos registrados.</p>
                  ) : (
                    referred.map((r: any) => (
                      <div key={r.uid} className="p-3 bg-slate-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{r.displayName}</p>
                          <p className="text-slate-400 text-[11px]">{r.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.isPremium ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {r.isPremium ? 'Premium (Compró)' : 'Registrado'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* CONTENIDO TAB 3: COMISIONES */}
              {activeTab === 'commissions' && (
                <div className="space-y-2 text-xs">
                  {comms.length === 0 ? (
                    <p className="text-center py-6 text-slate-400">Sin comisiones registradas.</p>
                  ) : (
                    comms.map((c: any) => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900">
                            ${Number(c.amountUSD || 0).toFixed(2)} USD
                            <span className="text-slate-400 font-normal ml-2">
                              • {c.triggerType === 'first_purchase' ? '1ra Compra' : c.triggerType}
                            </span>
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Comprador: {c.referredName || c.referredEmail}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900'
                            : c.status === 'paid'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* CONTENIDO TAB 4: HISTORIAL DE PAGOS */}
              {activeTab === 'payouts' && (
                <div className="space-y-2 text-xs">
                  {payouts.length === 0 ? (
                    <p className="text-center py-6 text-slate-400">Sin pagos registrados previamente.</p>
                  ) : (
                    payouts.map((p: any) => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-900">${Number(p.amountUSD || 0).toFixed(2)} USD</p>
                          <p className="text-slate-500 text-[11px]">
                            {p.methodSnapshot?.label || 'Transferencia'}
                            {p.transactionReference && ` • Ref: ${p.transactionReference}`}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                          {p.status || 'Completado'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 text-xs rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
