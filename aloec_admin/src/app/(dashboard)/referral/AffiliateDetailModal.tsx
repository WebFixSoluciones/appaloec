'use client';

import React, { useEffect, useState } from 'react';
import {
  X, User, Mail, Phone, Calendar, CreditCard, Building,
  DollarSign, Copy, Check, ExternalLink, AlertCircle,
  Clock, ShieldCheck, ArrowUpRight, MessageCircle, RefreshCw, Send
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
      setPayoutAmount(appr);

      // Preseleccionar método por defecto si existe
      if (json.payoutMethods && json.payoutMethods.length > 0) {
        const first = json.payoutMethods[0];
        setPayoutMethodLabel(first.label || `${first.type} - ${first.details?.bankName || ''}`);
      } else {
        setPayoutMethodLabel('Transferencia Bancaria Ecuador');
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
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleDirectPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;

    if (payoutAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    const available = Number(data?.user?.affiliateBalance?.approvedUSD) || 0;
    if (payoutAmount > available) {
      toast.error(`El monto no puede superar el disponible de $${available.toFixed(2)}`);
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
            label: payoutMethodLabel || 'Transferencia Bancaria',
            type: 'bank_transfer',
          },
          transactionReference: payoutReference.trim(),
          notes: payoutNotes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al procesar pago');

      toast.success(`¡Pago de $${payoutAmount.toFixed(2)} registrado exitosamente!`, { id: toastId });
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

  const refLink = user?.referralCode
    ? `https://app.alimentacionorganicaec.net/?ref=${user.referralCode}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center shadow-xs border border-emerald-200">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'AF'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {loading ? 'Cargando afiliado...' : user?.displayName || 'Sin nombre registrado'}
                </h3>
                {user?.isPremium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{user?.email || 'Sin email'}</span>
                {user?.phone && (
                  <>
                    <span>•</span>
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
                    >
                      <MessageCircle size={12} /> {user.phone}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="animate-spin text-emerald-600" size={32} />
              <p className="text-sm font-medium">Consultando perfil y datos bancarios...</p>
            </div>
          ) : !user ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="mx-auto mb-2 text-rose-500" size={36} />
              <p className="font-bold">No se pudo encontrar la información del usuario.</p>
            </div>
          ) : (
            <>
              {/* Balances Hero Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Saldo Pendiente
                  </span>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    ${pendingUSD.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">En periodo de garantía</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Disponible para Pago
                  </span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">
                    ${approvedUSD.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Listo para transferir</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    Total Pagado
                  </span>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    ${paidUSD.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-blue-700 mt-0.5">Transferido históricamente</p>
                </div>
              </div>

              {/* Referral Code & Link Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                    Código de Afiliado
                  </span>
                  <p className="font-mono font-black text-base text-emerald-800">
                    {user.referralCode || 'Sin código asignado'}
                  </p>
                  {refLink && (
                    <p className="text-slate-500 text-[11px] truncate max-w-sm font-mono mt-0.5">
                      {refLink}
                    </p>
                  )}
                </div>
                {refLink && (
                  <button
                    onClick={() => handleCopy(refLink, 'link')}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 font-bold text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copiedKey === 'link' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copiedKey === 'link' ? '¡Copiado!' : 'Copiar Link'}
                  </button>
                )}
              </div>

              {/* Botón Destacado: Registrar Pago Directo */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-base flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-300" />
                    Pagar Comisiones al Afiliado
                  </h4>
                  <p className="text-xs text-emerald-100/90 mt-1 max-w-md">
                    Transfiere el dinero a su cuenta bancaria o PayPal y registra el comprobante aquí para liquidar su saldo disponible.
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoutForm(!showPayoutForm)}
                  disabled={approvedUSD <= 0}
                  className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {showPayoutForm ? 'Ocultar Formulario' : approvedUSD > 0 ? 'Registrar Pago Realizado' : 'Sin Saldo Disponible'}
                </button>
              </div>

              {/* Formulario Desplegable de Pago Directo */}
              {showPayoutForm && (
                <form
                  onSubmit={handleDirectPayout}
                  className="bg-emerald-50/50 border-2 border-emerald-500/30 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Send size={15} className="text-emerald-700" />
                      Registrar Transferencia / Pago Realizado
                    </h5>
                    <span className="text-xs text-slate-500">
                      Disponible: <strong className="text-emerald-800 font-mono">${approvedUSD.toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Monto a Liquidar (USD) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={approvedUSD}
                        required
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Método / Banco Usado *</label>
                      <input
                        type="text"
                        required
                        value={payoutMethodLabel}
                        onChange={(e) => setPayoutMethodLabel(e.target.value)}
                        placeholder="Ej. Transferencia Banco Pichincha, PayPal, etc."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nº Comprobante / Referencia Bancaria</label>
                      <input
                        type="text"
                        value={payoutReference}
                        onChange={(e) => setPayoutReference(e.target.value)}
                        placeholder="Ej. TRF-1928402 / Recibo 5482"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Notas u Observaciones (opcional)</label>
                      <input
                        type="text"
                        value={payoutNotes}
                        onChange={(e) => setPayoutNotes(e.target.value)}
                        placeholder="Ej. Transferido desde cuenta corporativa"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPayoutForm(false)}
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPayout}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                    >
                      {submittingPayout ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Guardando...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Confirmar y Descontar Saldo
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Sub-tabs */}
              <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('methods')}
                  className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'methods'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Datos Bancarios ({methods.length})
                </button>
                <button
                  onClick={() => setActiveTab('referred')}
                  className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'referred'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Usuarios Referidos ({referred.length})
                </button>
                <button
                  onClick={() => setActiveTab('commissions')}
                  className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'commissions'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Comisiones ({comms.length})
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
                    activeTab === 'payouts'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Historial de Pagos ({payouts.length})
                </button>
              </div>

              {/* TAB 1: DATOS BANCARIOS */}
              {activeTab === 'methods' && (
                <div className="space-y-3">
                  {methods.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center">
                      <AlertCircle className="mx-auto mb-2 text-amber-600" size={28} />
                      <p className="font-bold text-sm text-amber-900">
                        Sin datos bancarios registrados aún
                      </p>
                      <p className="text-xs text-amber-700 max-w-md mx-auto mt-1">
                        El afiliado todavía no ha guardado su cuenta bancaria desde la App Móvil en{' '}
                        <em>Gestión de Afiliado → Métodos de Pago / Cobro</em>.
                      </p>
                      {user.phone && (
                        <div className="mt-3">
                          <a
                            href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${user.displayName || ''}, te saluda ALOEC. Tienes comisiones disponibles para cobro. Por favor ingresa a la app móvil y registra tu cuenta bancaria para transferirte tus fondos.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-2xs"
                          >
                            <MessageCircle size={14} /> Solicitar Datos por WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    methods.map((m: any, idx: number) => {
                      const details = m.details || {};
                      const isBank = m.type === 'bank_ec' || m.type === 'bank' || details.bankName;
                      const isPaypal = m.type === 'paypal' || details.paypalEmail;

                      return (
                        <div
                          key={m.id || idx}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                                {isBank ? <Building size={16} /> : <CreditCard size={16} />}
                              </div>
                              <div>
                                <h5 className="font-black text-slate-900 text-xs">
                                  {m.label || (isBank ? 'Transferencia Bancaria Ecuador' : 'PayPal')}
                                </h5>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                                  {m.type} {m.isDefault && '• Predeterminado'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Grid con detalles bancarios */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                            {isBank && (
                              <>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Banco:</span>
                                  <p className="font-bold text-slate-800">{details.bankName || 'No especificado'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Tipo de Cuenta:</span>
                                  <p className="font-bold text-slate-800">{details.accountType || 'Ahorros'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Número de Cuenta:</span>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono font-bold text-slate-900">{details.accountNumber || '-'}</p>
                                    {details.accountNumber && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(details.accountNumber, `acc_${idx}`)}
                                        className="text-slate-400 hover:text-slate-700"
                                        title="Copiar número"
                                      >
                                        {copiedKey === `acc_${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Titular:</span>
                                  <p className="font-bold text-slate-800">{details.holderName || user.displayName}</p>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Cédula / RUC:</span>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono font-bold text-slate-900">{details.idNumber || '-'}</p>
                                    {details.idNumber && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(details.idNumber, `id_${idx}`)}
                                        className="text-slate-400 hover:text-slate-700"
                                        title="Copiar cédula"
                                      >
                                        {copiedKey === `id_${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold">Email Notificación:</span>
                                  <p className="text-slate-700 truncate">{details.email || user.email}</p>
                                </div>
                              </>
                            )}

                            {isPaypal && (
                              <div className="sm:col-span-2">
                                <span className="text-slate-400 text-[10px] uppercase font-bold">Correo de PayPal:</span>
                                <div className="flex items-center gap-2">
                                  <p className="font-mono font-bold text-slate-900">{details.paypalEmail || details.email || user.email}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(details.paypalEmail || details.email || user.email, `pp_${idx}`)}
                                    className="text-slate-400 hover:text-slate-700"
                                  >
                                    {copiedKey === `pp_${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: USUARIOS REFERIDOS */}
              {activeTab === 'referred' && (
                <div className="space-y-2">
                  {referred.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">
                      Este afiliado aún no tiene usuarios registrados con su enlace.
                    </p>
                  ) : (
                    referred.map((r: any) => (
                      <div
                        key={r.uid}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{r.displayName}</p>
                          <p className="text-slate-500 text-[11px]">{r.email}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.isPremium ? 'Comprador (Premium)' : 'Registrado'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: COMISIONES */}
              {activeTab === 'commissions' && (
                <div className="space-y-2">
                  {comms.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">
                      Sin comisiones registradas para este afiliado.
                    </p>
                  ) : (
                    comms.map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            ${Number(c.amountUSD || 0).toFixed(2)} USD
                            <span className="text-slate-500 font-normal ml-2">
                              • {c.triggerType === 'first_purchase' ? '1ra Compra' : c.triggerType || 'Compra'}
                            </span>
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            Comprador: {c.referredName || c.referredEmail || 'Usuario'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'paid'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: HISTORIAL DE PAGOS */}
              {activeTab === 'payouts' && (
                <div className="space-y-2">
                  {payouts.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">
                      No se han liquidado pagos anteriormente a este afiliado.
                    </p>
                  ) : (
                    payouts.map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-black text-slate-900">
                            ${Number(p.amountUSD || 0).toFixed(2)} USD
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            {p.methodSnapshot?.label || p.methodSnapshot?.type || 'Transferencia'}
                            {p.transactionReference ? ` • Ref: ${p.transactionReference}` : ''}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
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

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 text-xs rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
