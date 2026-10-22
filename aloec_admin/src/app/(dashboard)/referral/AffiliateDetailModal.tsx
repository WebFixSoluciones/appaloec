'use client';

import React, { useEffect, useState } from 'react';
import {
  X, User, Mail, Phone, Calendar, CreditCard, Building,
  DollarSign, Copy, Check, ExternalLink, AlertCircle,
  Clock, ShieldCheck, ArrowUpRight, MessageCircle, RefreshCw, Send,
  Coins, CheckCircle2, Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateDetailModalProps {
  uid: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent: () => void;
}

const ECUADOR_BANKS = [
  'Banco Pichincha',
  'Banco Guayaquil',
  'Banco del Pacífico',
  'Produbanco',
  'Banco Bolivariano',
  'Banco Internacional',
  'Banco de Machala',
  'Banco del Austro',
  'Cooperativa JEP',
  'Cooperativa Policía Nacional',
  'Cooperativa 29 de Octubre',
  'Mutualista Pichincha',
  'Otro Banco / Cooperativa'
];

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
  const [payoutType, setPayoutType] = useState<'bank_ec' | 'binance' | 'paypal'>('bank_ec');

  // Campos para Transferencia Bancaria
  const [bankName, setBankName] = useState('Banco Pichincha');
  const [accountType, setAccountType] = useState<'Ahorros' | 'Corriente'>('Ahorros');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Campos para Binance Pay
  const [binancePayId, setBinancePayId] = useState('');

  // Campos para PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  // Comprobante y notas
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [releasingPending, setReleasingPending] = useState(false);

  // Formulario para Registrar Nueva Cuenta Bancaria
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [newBankName, setNewBankName] = useState('Banco Pichincha');
  const [newAccountType, setNewAccountType] = useState<'Ahorros' | 'Corriente'>('Ahorros');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newIdNumber, setNewIdNumber] = useState('');
  const [savingNewBank, setSavingNewBank] = useState(false);

  useEffect(() => {
    if (isOpen && uid) {
      loadDetail();
    } else {
      setData(null);
      setShowPayoutForm(false);
      setShowAddBankForm(false);
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

      // Pre-cargar valores por defecto de los métodos del afiliado
      const methods = json.payoutMethods || [];
      const bankMethod = methods.find((m: any) => m.type === 'bank_ec' || m.type === 'bank' || m.details?.bankName || m.details?.bank);
      const binanceMethod = methods.find((m: any) => m.type === 'binance' || m.details?.payId);
      const paypalMethod = methods.find((m: any) => m.type === 'paypal' || m.details?.paypalEmail || m.details?.email);

      if (bankMethod) {
        const d = bankMethod.details || {};
        setBankName(d.bankName || d.bank || 'Banco Pichincha');
        setAccountType(d.accountType || 'Ahorros');
        setAccountNumber(d.accountNumber || '');
        setHolderName(d.holderName || json.user?.displayName || '');
        setIdNumber(d.idNumber || '');
        setPayoutType('bank_ec');
      } else if (binanceMethod) {
        const d = binanceMethod.details || {};
        setBinancePayId(d.payId || '');
        setPayoutType('binance');
      } else if (paypalMethod) {
        const d = paypalMethod.details || {};
        setPaypalEmail(d.paypalEmail || d.email || json.user?.email || '');
        setPayoutType('paypal');
      } else {
        setHolderName(json.user?.displayName || '');
        setPayoutType('bank_ec');
      }

      setNewHolderName(json.user?.displayName || '');
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

  // Registrar nueva cuenta bancaria desde el modal
  async function handleSaveNewBank(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;

    if (!newAccountNumber.trim()) {
      toast.error('El número de cuenta es obligatorio');
      return;
    }

    setSavingNewBank(true);
    const toastId = toast.loading('Guardando cuenta bancaria...');

    try {
      const res = await fetch('/api/admin/referral/add-payout-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          type: 'bank_ec',
          label: `${newBankName} - ${newAccountType}`,
          details: {
            bankName: newBankName,
            accountType: newAccountType,
            accountNumber: newAccountNumber.trim(),
            holderName: newHolderName.trim() || user?.displayName,
            idNumber: newIdNumber.trim(),
            email: user?.email || '',
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al guardar cuenta');

      toast.success('Cuenta bancaria agregada exitosamente', { id: toastId });
      setShowAddBankForm(false);
      setNewAccountNumber('');
      setNewIdNumber('');
      await loadDetail();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar cuenta', { id: toastId });
    } finally {
      setSavingNewBank(false);
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

    // Armar snapshot descriptivo del método usado
    let methodSnapshot: any = { type: payoutType };

    if (payoutType === 'bank_ec') {
      methodSnapshot = {
        type: 'bank_ec',
        label: `Transferencia Bancaria - ${bankName} (${accountType})`,
        bankName,
        accountType,
        accountNumber,
        holderName,
        idNumber,
      };
    } else if (payoutType === 'binance') {
      methodSnapshot = {
        type: 'binance',
        label: `Binance Pay (Pay ID: ${binancePayId})`,
        payId: binancePayId,
      };
    } else if (payoutType === 'paypal') {
      methodSnapshot = {
        type: 'paypal',
        label: `PayPal (${paypalEmail})`,
        paypalEmail,
      };
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
          methodSnapshot,
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
        className="bg-white w-full max-w-2xl max-h-[92vh] rounded-xl shadow-xl flex flex-col overflow-hidden"
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

              {/* Formulario de Pago Plano con Selector de Método */}
              {showPayoutForm && (
                <form
                  onSubmit={handleDirectPayout}
                  className="p-4 bg-slate-50 rounded-lg space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-sm">
                      Registrar Pago al Afiliado
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Saldo a liquidar: <strong>${totalEarned.toFixed(2)} USD</strong>
                    </span>
                  </div>

                  {/* Selector de Método: Transferencia Bancaria / Binance / PayPal */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1.5">
                      Selecciona la opción de pago:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutType('bank_ec')}
                        className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          payoutType === 'bank_ec'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Building size={14} />
                        <span>Transferencia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutType('binance')}
                        className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          payoutType === 'binance'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Coins size={14} />
                        <span>Binance Pay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutType('paypal')}
                        className={`p-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          payoutType === 'paypal'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <CreditCard size={14} />
                        <span>PayPal</span>
                      </button>
                    </div>
                  </div>

                  {/* Monto a pagar */}
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Monto a liquidar (USD) *</label>
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

                  {/* CAMPOS ESPECÍFICOS: TRANSFERENCIA BANCARIA */}
                  {payoutType === 'bank_ec' && (
                    <div className="space-y-3 p-3 bg-white rounded-lg">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Datos de la Transferencia Bancaria (Ecuador)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Banco de Destino *</label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded text-slate-900 font-medium outline-none"
                          >
                            {ECUADOR_BANKS.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Tipo de Cuenta *</label>
                          <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 rounded text-slate-900 font-medium outline-none"
                          >
                            <option value="Ahorros">Cuenta de Ahorros</option>
                            <option value="Corriente">Cuenta Corriente</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Número de Cuenta *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 2200910810"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Nombre del Titular *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. María José Macías"
                            value={holderName}
                            onChange={(e) => setHolderName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Cédula / RUC del Titular *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 1717340846"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Nº Comprobante / Referencia Transferencia *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. TRF-192840 / Nº Comprobante banco"
                            value={payoutReference}
                            onChange={(e) => setPayoutReference(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAMPOS ESPECÍFICOS: BINANCE PAY */}
                  {payoutType === 'binance' && (
                    <div className="space-y-3 p-3 bg-white rounded-lg">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Datos de Pago Binance Pay
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Binance Pay ID *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 11931006"
                            value={binancePayId}
                            onChange={(e) => setBinancePayId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">ID Transacción / Orden Binance *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 294819201 / ID de pago Binance"
                            value={payoutReference}
                            onChange={(e) => setPayoutReference(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAMPOS ESPECÍFICOS: PAYPAL */}
                  {payoutType === 'paypal' && (
                    <div className="space-y-3 p-3 bg-white rounded-lg">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Datos de Pago PayPal
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Correo de PayPal *</label>
                          <input
                            type="email"
                            required
                            placeholder="afiliado@correo.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">ID Transacción de PayPal *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 8XP928194"
                            value={payoutReference}
                            onChange={(e) => setPayoutReference(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Notas u Observaciones (opcional)</label>
                    <input
                      type="text"
                      value={payoutNotes}
                      onChange={(e) => setPayoutNotes(e.target.value)}
                      placeholder="Observación de la transferencia"
                      className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                    />
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
                  Cuentas y Métodos ({methods.length})
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
                  {/* Botón para que el admin agregue cuenta de transferencia al afiliado */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Cuentas registradas para cobros:</span>
                    <button
                      type="button"
                      onClick={() => setShowAddBankForm(!showAddBankForm)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} />
                      <span>{showAddBankForm ? 'Cerrar' : 'Registrar Cuenta de Transferencia'}</span>
                    </button>
                  </div>

                  {/* Formulario Inline para Registrar Cuenta de Banco */}
                  {showAddBankForm && (
                    <form
                      onSubmit={handleSaveNewBank}
                      className="p-4 bg-slate-50 rounded-lg space-y-3 text-xs"
                    >
                      <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Registrar Cuenta Bancaria para este Afiliado
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Banco *</label>
                          <select
                            value={newBankName}
                            onChange={(e) => setNewBankName(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                          >
                            {ECUADOR_BANKS.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Tipo de Cuenta *</label>
                          <select
                            value={newAccountType}
                            onChange={(e) => setNewAccountType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                          >
                            <option value="Ahorros">Cuenta de Ahorros</option>
                            <option value="Corriente">Cuenta Corriente</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Número de Cuenta *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 2200910810"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-1">Nombre del Titular *</label>
                          <input
                            type="text"
                            required
                            placeholder="Nombre del afiliado"
                            value={newHolderName}
                            onChange={(e) => setNewHolderName(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded text-slate-900 outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-500 text-[11px] mb-1">Cédula o RUC del Titular *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. 1717340846"
                            value={newIdNumber}
                            onChange={(e) => setNewIdNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-white rounded font-mono text-slate-900 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddBankForm(false)}
                          className="px-3 py-1.5 text-slate-600 font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={savingNewBank}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded transition-colors disabled:opacity-50"
                        >
                          {savingNewBank ? 'Guardando...' : 'Guardar Cuenta Bancaria'}
                        </button>
                      </div>
                    </form>
                  )}

                  {methods.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                      Sin métodos registrados. Puedes registrarle una cuenta bancaria con el botón de arriba.
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
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {m.label || ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isBank) {
                                    setPayoutType('bank_ec');
                                    setBankName(details.bankName || details.bank || 'Banco Pichincha');
                                    setAccountType(details.accountType || 'Ahorros');
                                    setAccountNumber(details.accountNumber || '');
                                    setHolderName(details.holderName || user.displayName || '');
                                    setIdNumber(details.idNumber || '');
                                  } else if (isBinance) {
                                    setPayoutType('binance');
                                    setBinancePayId(details.payId || '');
                                  } else if (isPaypal) {
                                    setPayoutType('paypal');
                                    setPaypalEmail(details.paypalEmail || details.email || '');
                                  }
                                  setShowPayoutForm(true);
                                }}
                                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded text-[10px]"
                              >
                                Usar para Pago
                              </button>
                            </div>
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
                                <span className="font-bold text-slate-800">{details.bankName || details.bank || 'No especificado'}</span>
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
