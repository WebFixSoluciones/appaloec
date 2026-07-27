'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import {
  collection, getDocs, doc, setDoc, updateDoc, query,
  where, orderBy, limit, Timestamp
} from 'firebase/firestore';
import {
  Gift, Settings, Users, Coins, CreditCard, TrendingUp,
  DollarSign, Check, X, Search, RefreshCw, ChevronDown,
  AlertCircle, ShieldCheck, Eye, FileText, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { key: 'config', label: 'Configuración', icon: Settings },
  { key: 'affiliates', label: 'Afiliados', icon: Users },
  { key: 'commissions', label: 'Comisiones', icon: Coins },
  { key: 'payouts', label: 'Pagos', icon: CreditCard },
] as const;

type TabKey = typeof TABS[number]['key'];

interface AffiliateItem {
  uid: string;
  email: string;
  displayName: string;
  referralCode: string;
  balance: { pendingUSD: number; approvedUSD: number; paidUSD: number };
  referredCount: number;
  createdAt: any;
}

interface CommissionItem {
  id: string;
  referrerUid: string;
  referrerName: string;
  referrerCode: string;
  referredUid: string;
  triggerType: string;
  amountUSD: number;
  status: string;
  createdAt: any;
  releasedAt: any;
}

interface PayoutItem {
  id: string;
  uid: string;
  userName: string;
  amountUSD: number;
  methodSnapshot: any;
  status: string;
  createdAt: any;
}

interface ConfigData {
  programEnabled: boolean;
  commissionRules: {
    registration: { type: string; value: number; enabled: boolean };
    firstPurchase: { type: string; value: number; enabled: boolean };
    purchase: { type: string; value: number; enabled: boolean };
  };
  holdPeriodDays: number;
  minPayoutUSD: number;
  maxPayoutUSD: number;
  cookieDurationDays: number;
  payoutMethods: { id: string; label: string; enabled: boolean }[];
  termsUrl: string;
}

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [loading, setLoading] = useState(true);

  // Config state
  const [config, setConfig] = useState<ConfigData>({
    programEnabled: true,
    commissionRules: {
      registration: { type: 'fixed', value: 2, enabled: true },
      firstPurchase: { type: 'fixed', value: 10, enabled: true },
      purchase: { type: 'percentage', value: 5, enabled: false },
    },
    holdPeriodDays: 7,
    minPayoutUSD: 25,
    maxPayoutUSD: 1000,
    cookieDurationDays: 30,
    payoutMethods: [
      { id: 'paypal', label: 'PayPal', enabled: true },
      { id: 'binance', label: 'Binance', enabled: true },
      { id: 'bank_ec', label: 'Transferencia Ecuador', enabled: true },
    ],
    termsUrl: '',
  });

  // Lists state
  const [affiliates, setAffiliates] = useState<AffiliateItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Dashboard KPIs
  const [kpi, setKpi] = useState({ totalAffiliates: 0, totalCommissions: 0, pendingUSD: 0, paidUSD: 0, approvedUSD: 0 });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { await Promise.all([loadConfig(), loadAffiliates(), loadCommissions(), loadPayouts()]); }
    catch (e: any) { toast.error('Error al cargar datos: ' + (e.message || '')); }
    finally { setLoading(false); }
  }

  async function loadConfig() {
    const d = await getDocs(collection(db, 'referral_config'));
    if (!d.empty) {
      const data = d.docs[0].data() as ConfigData;
      setConfig(prev => ({ ...prev, ...data }));
    }
  }

  async function loadAffiliates() {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const items: AffiliateItem[] = [];
      let totalPend = 0, totalAppr = 0, totalPaid = 0, totalComm = 0;
      snap.forEach(doc => {
        const d = doc.data();
        const ref = d.referral || {};
        const bal = d.affiliateBalance || {};
        if (ref.code && ref.code.length > 0) {
          items.push({
            uid: doc.id, email: d.email || '', displayName: d.displayName || '',
            referralCode: ref.code,
            balance: { pendingUSD: Number(bal.pendingUSD || 0), approvedUSD: Number(bal.approvedUSD || 0), paidUSD: Number(bal.paidUSD || 0) },
            referredCount: 0, createdAt: d.createdAt
          });
          totalPend += Number(bal.pendingUSD || 0);
          totalAppr += Number(bal.approvedUSD || 0);
          totalPaid += Number(bal.paidUSD || 0);
        }
      });

      for (const a of items) {
        try {
          const evSnap = await getDocs(query(collection(db, 'referral_events'),
            where('referrerUid', '==', a.uid), where('type', '==', 'registered')));
          a.referredCount = evSnap.size;
        } catch (_) {}
      }

      try {
        const commSnap = await getDocs(collection(db, 'commissions'));
        totalComm = commSnap.size;
      } catch (_) {}

      setAffiliates(items);
      setKpi({ totalAffiliates: items.length, totalCommissions: totalComm, pendingUSD: totalPend, approvedUSD: totalAppr, paidUSD: totalPaid });
    } catch (e: any) {
      console.error('loadAffiliates', e);
      toast.error('Error afiliados: ' + (e.message || ''));
    }
  }

  async function loadCommissions() {
    try {
      const snap = await getDocs(query(collection(db, 'commissions'), orderBy('createdAt', 'desc'), limit(200)));
      const items: CommissionItem[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        items.push({
          id: d.id, referrerUid: data.referrerUid || '', referrerName: '', referrerCode: data.referralCode || '',
          referredUid: data.referredUid || '', triggerType: data.triggerType || '', amountUSD: Number(data.amountUSD || 0),
          status: data.status || 'pending', createdAt: data.createdAt, releasedAt: data.releasedAt
        });
      }
      setCommissions(items);
    } catch (e: any) {
      console.error('loadCommissions', e);
      toast.error('Error comisiones: ' + (e.message || ''));
    }
  }

  async function loadPayouts() {
    try {
      const snap = await getDocs(query(collection(db, 'payouts'), orderBy('createdAt', 'desc'), limit(200)));
      const items: PayoutItem[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        items.push({
          id: d.id, uid: data.uid || '', userName: '', amountUSD: Number(data.amountUSD || 0),
          methodSnapshot: data.methodSnapshot || {}, status: data.status || 'pending', createdAt: data.createdAt
        });
      }
      setPayouts(items);
    } catch (e: any) {
      console.error('loadPayouts', e);
      toast.error('Error pagos: ' + (e.message || ''));
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      await setDoc(doc(db, 'referral_config', 'production'), { ...config, updatedAt: Timestamp.now(), updatedBy: 'admin' });
      await logAdminAction('UPDATE', 'referral_config', 'production', { description: 'Configuración de referidos actualizada' });
      toast.success('Configuración guardada');
    } catch (e: any) { toast.error('Error: ' + e.message); }
    finally { setSaving(false); }
  }

  async function updateCommissionStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        status,
        [`statusLog.${Date.now()}`]: { status, timestamp: Timestamp.now(), actorUid: 'admin' }
      });
      await logAdminAction('UPDATE', 'commissions', id, { description: `Comisión ${status}` });
      toast.success(`Comisión ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
      loadCommissions();
    } catch (e: any) { toast.error('Error: ' + e.message); }
  }

  async function updatePayoutStatus(id: string, status: string) {
    try {
      const ref = doc(db, 'payouts', id);
      if (status === 'completed') {
        await updateDoc(ref, { status, processedAt: Timestamp.now() });
      } else {
        await updateDoc(ref, { status });
      }
      await logAdminAction('UPDATE', 'payouts', id, { description: `Pago ${status}` });
      toast.success(`Pago ${status === 'completed' ? 'completado' : status === 'processing' ? 'en proceso' : 'rechazado'}`);
      loadPayouts();
    } catch (e: any) { toast.error('Error: ' + e.message); }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente', approved: 'Aprobado', paid: 'Pagado', rejected: 'Rechazado',
      processing: 'En proceso', completed: 'Completado'
    };
    return <span className={`text-xs font-bold px-2 py-1 ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{labels[status] || status}</span>;
  }

  function triggerLabel(t: string) {
    const m: Record<string, string> = { registration: 'Registro', first_purchase: '1ra Compra', purchase: 'Compra' };
    return m[t] || t;
  }

  const TabIcon = TABS.find(t => t.key === activeTab)?.icon || TrendingUp;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Programa de Referidos</h1>
          <p className="text-sm text-ink-500 mt-1">Gestión de afiliados, comisiones, pagos y configuración del programa.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="px-3 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50 flex items-center gap-1">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-200">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.key ? 'border-[#008000] text-[#008000]' : 'border-transparent text-ink-500 hover:text-ink-700'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : (
        <>
          {/* ============ DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[{ label: 'Afiliados', value: kpi.totalAffiliates, icon: Users },
                  { label: 'Comisiones', value: kpi.totalCommissions, icon: Coins },
                  { label: 'Pendiente USD', value: '$' + kpi.pendingUSD.toFixed(2), icon: AlertCircle, color: 'text-yellow-600' },
                  { label: 'Aprobado USD', value: '$' + kpi.approvedUSD.toFixed(2), icon: Check, color: 'text-green-600' },
                  { label: 'Pagado USD', value: '$' + kpi.paidUSD.toFixed(2), icon: DollarSign, color: 'text-blue-600' },
                ].map((item, i) => (
                  <div key={i} className="border border-ink-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-ink-500 text-xs font-bold uppercase mb-1">
                      <item.icon size={14} className={item.color || ''} /> {item.label}
                    </div>
                    <div className="text-xl font-bold text-ink-900">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="border border-ink-200 bg-white p-6 text-center text-ink-500">
                <Gift className="mx-auto mb-4 text-ink-300" size={48} />
                <p className="font-bold text-lg text-ink-700 mb-1">{config.programEnabled ? 'Programa activo' : 'Programa desactivado'}</p>
                <p className="text-sm">Selecciona una pestaña para gestionar configuración, afiliados, comisiones o pagos.</p>
              </div>
            </div>
          )}

          {/* ============ CONFIG ============ */}
          {activeTab === 'config' && (
            <div className="space-y-6 max-w-2xl">
              <div className="border border-ink-200 bg-white p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-ink-900">Programa habilitado</h3>
                    <p className="text-xs text-ink-500">Activa o desactiva el sistema de referidos</p>
                  </div>
                  <button onClick={() => setConfig({ ...config, programEnabled: !config.programEnabled })}
                    className="text-ink-700 hover:text-[#008000] transition-colors">
                    {config.programEnabled ? <ToggleRight size={32} className="text-[#008000]" /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <div className="border-t border-ink-100 pt-4">
                  <h4 className="font-bold text-ink-900 mb-3">Reglas de comisión</h4>
                  {(['registration', 'firstPurchase', 'purchase'] as const).map(rule => {
                    const r = config.commissionRules[rule];
                    const labels = { registration: 'Por registro', firstPurchase: 'Por primera compra', purchase: 'Por compra' };
                    return (
                      <div key={rule} className="flex items-center gap-4 mb-3 pb-3 border-b border-ink-50">
                        <div className="flex items-center gap-2 w-48">
                          <input type="checkbox" checked={r.enabled} onChange={e => {
                            const rules = { ...config.commissionRules };
                            rules[rule] = { ...r, enabled: e.target.checked };
                            setConfig({ ...config, commissionRules: rules });
                          }} className="w-4 h-4 accent-[#008000]" />
                          <span className="text-sm font-bold text-ink-700">{labels[rule]}</span>
                        </div>
                        <select value={r.type} onChange={e => {
                          const rules = { ...config.commissionRules };
                          rules[rule] = { ...r, type: e.target.value };
                          setConfig({ ...config, commissionRules: rules });
                        }} className="border border-ink-300 p-1.5 text-sm bg-white outline-none">
                          <option value="fixed">Monto fijo ($)</option>
                          <option value="percentage">Porcentaje (%)</option>
                        </select>
                        <input type="number" value={r.value} onChange={e => {
                          const rules = { ...config.commissionRules };
                          rules[rule] = { ...r, value: parseFloat(e.target.value) || 0 };
                          setConfig({ ...config, commissionRules: rules });
                        }} min="0" step="0.01" className="w-20 border border-ink-300 p-1.5 text-sm bg-white outline-none" />
                        <span className="text-xs text-ink-500">{r.type === 'fixed' ? 'USD' : '%'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-ink-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Días de retención</label>
                    <input type="number" value={config.holdPeriodDays} onChange={e => setConfig({ ...config, holdPeriodDays: parseInt(e.target.value) || 7 })}
                      className="w-full p-2.5 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Días de cookie</label>
                    <input type="number" value={config.cookieDurationDays} onChange={e => setConfig({ ...config, cookieDurationDays: parseInt(e.target.value) || 30 })}
                      className="w-full p-2.5 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Retiro mínimo ($)</label>
                    <input type="number" value={config.minPayoutUSD} onChange={e => setConfig({ ...config, minPayoutUSD: parseFloat(e.target.value) || 25 })}
                      className="w-full p-2.5 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Retiro máximo ($)</label>
                    <input type="number" value={config.maxPayoutUSD} onChange={e => setConfig({ ...config, maxPayoutUSD: parseFloat(e.target.value) || 1000 })}
                      className="w-full p-2.5 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm" />
                  </div>
                </div>

                <div className="border-t border-ink-100 pt-4">
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-3">Métodos de pago habilitados</label>
                  {config.payoutMethods.map((m, i) => (
                    <label key={m.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" checked={m.enabled} onChange={e => {
                        const methods = [...config.payoutMethods];
                        methods[i] = { ...m, enabled: e.target.checked };
                        setConfig({ ...config, payoutMethods: methods });
                      }} className="w-4 h-4 accent-[#008000]" />
                      <span className="text-sm text-ink-700">{m.label}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-ink-100 pt-4 flex justify-end">
                  <button onClick={saveConfig} disabled={saving}
                    className="px-6 py-2.5 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar configuración'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ AFFILIATES ============ */}
          {activeTab === 'affiliates' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input placeholder="Buscar afiliado..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm" />
                </div>
              </div>
              {affiliates.length === 0 ? (
                <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
                  <Users className="mx-auto mb-4 text-ink-300" size={48} />
                  <p className="font-bold text-lg text-ink-700 mb-1">Sin afiliados</p>
                  <p className="text-sm">Los usuarios verán su código de referido al entrar al programa.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-ink-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-ink-50 text-ink-700 text-xs uppercase">
                      <tr>
                        <th className="p-3 font-bold">Afiliado</th>
                        <th className="p-3 font-bold">Código</th>
                        <th className="p-3 font-bold">Pendiente</th>
                        <th className="p-3 font-bold">Aprobado</th>
                        <th className="p-3 font-bold">Pagado</th>
                        <th className="p-3 font-bold">Referidos</th>
                        <th className="p-3 font-bold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {affiliates.filter(a => !search || a.displayName.toLowerCase().includes(search.toLowerCase()) || a.referralCode.toLowerCase().includes(search.toLowerCase())).map(a => (
                        <tr key={a.uid} className="hover:bg-ink-50">
                          <td className="p-3"><span className="font-bold text-ink-900">{a.displayName}</span><br /><span className="text-xs text-ink-500">{a.email}</span></td>
                          <td className="p-3 font-mono text-xs font-bold text-[#008000]">{a.referralCode}</td>
                          <td className="p-3 text-yellow-600 font-bold">${a.balance.pendingUSD.toFixed(2)}</td>
                          <td className="p-3 text-green-600 font-bold">${a.balance.approvedUSD.toFixed(2)}</td>
                          <td className="p-3 text-blue-600 font-bold">${a.balance.paidUSD.toFixed(2)}</td>
                          <td className="p-3">{a.referredCount}</td>
                          <td className="p-3 text-xs text-ink-500">{a.createdAt?.toDate?.() ? new Date(a.createdAt.toDate()).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============ COMMISSIONS ============ */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="border border-ink-300 p-2 text-sm bg-white outline-none">
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="paid">Pagado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
              {commissions.length === 0 ? (
                <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
                  <Coins className="mx-auto mb-4 text-ink-300" size={48} />
                  <p className="font-bold text-lg text-ink-700 mb-1">Sin comisiones</p>
                  <p className="text-sm">Las comisiones se generarán cuando usuarios se registren o compren con un código de referido.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-ink-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-ink-50 text-ink-700 text-xs uppercase">
                      <tr>
                        <th className="p-3 font-bold">Referente</th>
                        <th className="p-3 font-bold">Código</th>
                        <th className="p-3 font-bold">Tipo</th>
                        <th className="p-3 font-bold">Monto</th>
                        <th className="p-3 font-bold">Estado</th>
                        <th className="p-3 font-bold">Fecha</th>
                        <th className="p-3 font-bold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {commissions.filter(c => !filterStatus || c.status === filterStatus).map(c => (
                        <tr key={c.id} className="hover:bg-ink-50">
                          <td className="p-3"><span className="font-bold text-ink-900">{c.referrerName || c.referrerUid.slice(0, 8)}</span></td>
                          <td className="p-3 font-mono text-xs font-bold text-[#008000]">{c.referrerCode}</td>
                          <td className="p-3 text-xs">{triggerLabel(c.triggerType)}</td>
                          <td className="p-3 font-bold">${c.amountUSD.toFixed(2)}</td>
                          <td className="p-3">{statusBadge(c.status)}</td>
                          <td className="p-3 text-xs text-ink-500">{c.createdAt?.toDate?.() ? new Date(c.createdAt.toDate()).toLocaleDateString() : '-'}</td>
                          <td className="p-3">
                            {c.status === 'pending' && (
                              <div className="flex gap-1">
                                <button onClick={() => updateCommissionStatus(c.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50" title="Aprobar"><Check size={16} /></button>
                                <button onClick={() => updateCommissionStatus(c.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50" title="Rechazar"><X size={16} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============ PAYOUTS ============ */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payouts.length === 0 ? (
                <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
                  <CreditCard className="mx-auto mb-4 text-ink-300" size={48} />
                  <p className="font-bold text-lg text-ink-700 mb-1">Sin solicitudes de pago</p>
                  <p className="text-sm">Los retiros aparecerán cuando los afiliados soliciten el cobro de sus comisiones.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-ink-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-ink-50 text-ink-700 text-xs uppercase">
                      <tr>
                        <th className="p-3 font-bold">Usuario</th>
                        <th className="p-3 font-bold">Monto</th>
                        <th className="p-3 font-bold">Método</th>
                        <th className="p-3 font-bold">Estado</th>
                        <th className="p-3 font-bold">Fecha</th>
                        <th className="p-3 font-bold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">
                      {payouts.map(p => (
                        <tr key={p.id} className="hover:bg-ink-50">
                          <td className="p-3"><span className="font-bold text-ink-900">{p.userName || p.uid.slice(0, 8)}</span></td>
                          <td className="p-3 font-bold">${p.amountUSD.toFixed(2)}</td>
                          <td className="p-3 text-xs">{p.methodSnapshot?.label || p.methodSnapshot?.type || '-'}</td>
                          <td className="p-3">{statusBadge(p.status)}</td>
                          <td className="p-3 text-xs text-ink-500">{p.createdAt?.toDate?.() ? new Date(p.createdAt.toDate()).toLocaleDateString() : '-'}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {p.status === 'pending' && (
                                <>
                                  <button onClick={() => updatePayoutStatus(p.id, 'processing')} className="p-1.5 text-blue-600 hover:bg-blue-50" title="Procesar">
                                    <Eye size={16} /></button>
                                  <button onClick={() => updatePayoutStatus(p.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50" title="Rechazar">
                                    <X size={16} /></button>
                                </>
                              )}
                              {p.status === 'processing' && (
                                <button onClick={() => updatePayoutStatus(p.id, 'completed')} className="p-1.5 text-green-600 hover:bg-green-50" title="Completar">
                                  <Check size={16} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
