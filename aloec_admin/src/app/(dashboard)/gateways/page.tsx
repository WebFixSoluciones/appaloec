'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  ShieldAlert, 
  Key, 
  Globe, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle, 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Copy,
  CreditCard 
} from 'lucide-react';
import { toast } from 'sonner';

interface GatewayConfig {
  providerName: string;
  publicKey: string;
  secretKey: string;
  isActive: boolean;
  environment: 'sandbox' | 'production';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'Ahorros' | 'Corriente';
  accountNumber: string;
  holderName: string;
  idNumber: string;
  email: string;
  isActive: boolean;
}

export interface BankTransferConfig {
  providerName: string;
  isActive: boolean;
  whatsappNumber: string;
  supportEmail: string;
  instructions: string;
  accounts: BankAccount[];
}

export default function GatewaysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab State ('cards' | 'transfers')
  const [activeTab, setActiveTab] = useState<'cards' | 'transfers'>('cards');

  // PayPhone Config State
  const [payphonePublic, setPayphonePublic] = useState('');
  const [payphoneSecret, setPayphoneSecret] = useState('');
  const [payphoneActive, setPayphoneActive] = useState(false);
  const [payphoneEnv, setPayphoneEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [payphoneCheckoutUrl, setPayphoneCheckoutUrl] = useState('');
  const [payphoneCheckoutSecret, setPayphoneCheckoutSecret] = useState('');

  // Stripe Config State (Bonus Gateway for advanced completeness)
  const [stripePublic, setStripePublic] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [stripeActive, setStripeActive] = useState(false);
  const [stripeEnv, setStripeEnv] = useState<'sandbox' | 'production'>('sandbox');

  // Show/Hide Secrets
  const [showPayphoneSecret, setShowPayphoneSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);

  // Bank Transfer (Ecuador) Config State
  const [bankActive, setBankActive] = useState(true);
  const [bankWhatsapp, setBankWhatsapp] = useState('593999504321');
  const [bankSupportEmail, setBankSupportEmail] = useState('pagos@aloec.com');
  const [bankInstructions, setBankInstructions] = useState('Por favor realiza la transferencia bancaria por el valor exacto de la membresía y adjunta tu comprobante.');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Bank Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [modalBankName, setModalBankName] = useState('Banco Pichincha');
  const [modalAccountType, setModalAccountType] = useState<'Ahorros' | 'Corriente'>('Ahorros');
  const [modalAccountNumber, setModalAccountNumber] = useState('');
  const [modalHolderName, setModalHolderName] = useState('ALOEC S.A.S.');
  const [modalIdNumber, setModalIdNumber] = useState('1790000000001');
  const [modalEmail, setModalEmail] = useState('pagos@aloec.com');
  const [modalIsActive, setModalIsActive] = useState(true);

  useEffect(() => {
    async function loadConfigs() {
      try {
        setLoading(true);
        // Load PayPhone
        const ppDoc = await getDoc(doc(db, 'gateways', 'payphone'));
        if (ppDoc.exists()) {
          const d = ppDoc.data() as GatewayConfig;
          setPayphonePublic(d.publicKey || '');
          setPayphoneSecret(d.secretKey || '');
          setPayphoneActive(d.isActive || false);
          setPayphoneEnv(d.environment || 'sandbox');
          setPayphoneCheckoutUrl((d as any).checkoutUrl || '');
          setPayphoneCheckoutSecret((d as any).checkoutSecret || '');
        }

        // Load Stripe
        const stripeDoc = await getDoc(doc(db, 'gateways', 'stripe'));
        if (stripeDoc.exists()) {
          const d = stripeDoc.data() as GatewayConfig;
          setStripePublic(d.publicKey || '');
          setStripeSecret(d.secretKey || '');
          setStripeActive(d.isActive || false);
          setStripeEnv(d.environment || 'sandbox');
        }

        // Load Bank Transfer (Ecuador)
        const bankDoc = await getDoc(doc(db, 'gateways', 'bank_transfer'));
        if (bankDoc.exists()) {
          const d = bankDoc.data() as BankTransferConfig;
          setBankActive(d.isActive ?? true);
          setBankWhatsapp(d.whatsappNumber || '593999504321');
          setBankSupportEmail(d.supportEmail || 'pagos@aloec.com');
          setBankInstructions(d.instructions || 'Por favor realiza la transferencia bancaria por el valor exacto de la membresía y adjunta tu comprobante.');
          setBankAccounts(d.accounts || []);
        } else {
          // Initialize default Ecuadorian official account if empty
          setBankAccounts([
            {
              id: 'acc_pichincha_1',
              bankName: 'Banco Pichincha',
              accountType: 'Ahorros',
              accountNumber: '2200123456',
              holderName: 'ALOEC S.A.S.',
              idNumber: '1790000000001',
              email: 'pagos@aloec.com',
              isActive: true
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading gateways:', err);
        toast.error('Error al cargar la configuración de pasarelas');
      } finally {
        setLoading(false);
      }
    }
    loadConfigs();
  }, []);

  const handleSavePayphone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payphonePublic.trim() || !payphoneSecret.trim()) {
      toast.error('Store ID y Token de Autorizacion son obligatorios');
      return;
    }
    setSaving(true);
    const toastId = toast.loading('Guardando configuración de PayPhone...');

    try {
      const ppRef = doc(db, 'gateways', 'payphone');
      const prevDoc = await getDoc(ppRef);
      const prevData = prevDoc.exists() ? prevDoc.data() : null;

      const ppData = {
        providerName: 'PayPhone',
        publicKey: payphonePublic.trim(),
        secretKey: payphoneSecret.trim(),
        isActive: payphoneActive,
        environment: payphoneEnv,
        checkoutUrl: payphoneCheckoutUrl.trim(),
        checkoutSecret: payphoneCheckoutSecret.trim(),
        updatedAt: new Date()
      };

      await setDoc(ppRef, ppData);

      // Log Audit
      await logAdminAction('UPDATE', 'gateways', 'payphone', {
        description: 'Actualizó claves de pasarela PayPhone',
        previousValues: prevData ? { ...prevData, secretKey: '***' } : null,
        newValues: { ...ppData, secretKey: '***' }
      });

      toast.success('Configuración de PayPhone guardada con éxito', { id: toastId });
    } catch (err: any) {
      console.error('Error saving Payphone:', err);
      toast.error('Error al guardar PayPhone: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripePublic.trim() || !stripeSecret.trim()) {
      toast.error('Publishable Key y Secret Key son obligatorios');
      return;
    }
    setSaving(true);
    const toastId = toast.loading('Guardando configuración de Stripe...');

    try {
      const stripeRef = doc(db, 'gateways', 'stripe');
      const prevDoc = await getDoc(stripeRef);
      const prevData = prevDoc.exists() ? prevDoc.data() : null;

      const stripeData = {
        providerName: 'Stripe',
        publicKey: stripePublic.trim(),
        secretKey: stripeSecret.trim(),
        isActive: stripeActive,
        environment: stripeEnv,
        updatedAt: new Date()
      };

      await setDoc(stripeRef, stripeData);

      // Log Audit
      await logAdminAction('UPDATE', 'gateways', 'stripe', {
        description: 'Actualizó claves de pasarela Stripe',
        previousValues: prevData ? { ...prevData, secretKey: '***' } : null,
        newValues: { ...stripeData, secretKey: '***' }
      });

      toast.success('Configuración de Stripe guardada con éxito', { id: toastId });
    } catch (err: any) {
      console.error('Error saving Stripe:', err);
      toast.error('Error al guardar Stripe: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Guardando configuración de transferencias...');

    try {
      const btRef = doc(db, 'gateways', 'bank_transfer');
      const prevDoc = await getDoc(btRef);
      const prevData = prevDoc.exists() ? prevDoc.data() : null;

      const btData = {
        providerName: 'Transferencia Bancaria',
        isActive: bankActive,
        whatsappNumber: bankWhatsapp.trim(),
        supportEmail: bankSupportEmail.trim(),
        instructions: bankInstructions.trim(),
        accounts: bankAccounts,
        updatedAt: new Date()
      };

      await setDoc(btRef, btData);

      // Log Audit
      await logAdminAction('UPDATE', 'gateways', 'bank_transfer', {
        description: 'Actualizó configuración de cuentas bancarias (Ecuador)',
        previousValues: prevData,
        newValues: {
          isActive: bankActive,
          accountsCount: bankAccounts.length,
          whatsappNumber: bankWhatsapp.trim()
        }
      });

      toast.success('Configuración de transferencias guardada con éxito', { id: toastId });
    } catch (err: any) {
      console.error('Error saving bank transfer:', err);
      toast.error('Error al guardar: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const openCreateAccountModal = () => {
    setEditingAccountId(null);
    setModalBankName('Banco Pichincha');
    setModalAccountType('Ahorros');
    setModalAccountNumber('');
    setModalHolderName('ALOEC S.A.S.');
    setModalIdNumber('1790000000001');
    setModalEmail('pagos@aloec.com');
    setModalIsActive(true);
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (acc: BankAccount) => {
    setEditingAccountId(acc.id);
    setModalBankName(acc.bankName);
    setModalAccountType(acc.accountType);
    setModalAccountNumber(acc.accountNumber);
    setModalHolderName(acc.holderName);
    setModalIdNumber(acc.idNumber);
    setModalEmail(acc.email);
    setModalIsActive(acc.isActive);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccountModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBankName.trim() || !modalAccountNumber.trim() || !modalHolderName.trim()) {
      toast.error('Banco, número de cuenta y titular son obligatorios');
      return;
    }

    if (editingAccountId) {
      // Edit
      setBankAccounts(bankAccounts.map(a => a.id === editingAccountId ? {
        id: editingAccountId,
        bankName: modalBankName.trim(),
        accountType: modalAccountType,
        accountNumber: modalAccountNumber.trim(),
        holderName: modalHolderName.trim(),
        idNumber: modalIdNumber.trim(),
        email: modalEmail.trim(),
        isActive: modalIsActive
      } : a));
      toast.success('Cuenta bancaria actualizada');
    } else {
      // Create
      const newAcc: BankAccount = {
        id: `acc_${Date.now()}`,
        bankName: modalBankName.trim(),
        accountType: modalAccountType,
        accountNumber: modalAccountNumber.trim(),
        holderName: modalHolderName.trim(),
        idNumber: modalIdNumber.trim(),
        email: modalEmail.trim(),
        isActive: modalIsActive
      };
      setBankAccounts([...bankAccounts, newAcc]);
      toast.success('Cuenta bancaria agregada');
    }

    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter(a => a.id !== id));
    toast.info('Cuenta eliminada de la lista (recuerda presionar Guardar)');
  };

  const handleToggleAccountActive = (id: string) => {
    setBankAccounts(bankAccounts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Pasarelas de Pago</h1>
        <p className="text-sm text-ink-500 mt-1">Configura las credenciales seguras para procesar cobros de membresías.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-ink-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'cards'
              ? 'border-[#008000] text-[#008000] bg-white'
              : 'border-transparent text-ink-500 hover:text-ink-900 hover:border-ink-300'
          }`}
        >
          <CreditCard size={17} />
          Tarjetas de crédito
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'transfers'
              ? 'border-[#008000] text-[#008000] bg-white'
              : 'border-transparent text-ink-500 hover:text-ink-900 hover:border-ink-300'
          }`}
        >
          <Building2 size={17} />
          Transferencias bancarias
          {bankAccounts.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-[#008000]/10 text-[#008000]">
              {bankAccounts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Tarjetas de crédito */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PayPhone Card */}
        <div className="border border-ink-200 bg-white p-6 flex flex-col justify-between">
          <form onSubmit={handleSavePayphone} className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-[#008000]/10 flex items-center justify-center text-[#008000] font-extrabold text-sm">
                  PP
                </div>
                <h3 className="font-extrabold text-ink-900">PayPhone (Ecuador)</h3>
              </div>
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4 mr-2"
                  checked={payphoneActive}
                  onChange={(e) => setPayphoneActive(e.target.checked)}
                />
                <span className="text-xs font-bold text-ink-700">Activo</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Entorno (Environment)</label>
              <div className="flex gap-4">
                <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                  <input
                    type="radio"
                    name="payphoneEnv"
                    value="sandbox"
                    className="text-[#008000] focus:ring-[#008000] mr-2"
                    checked={payphoneEnv === 'sandbox'}
                    onChange={() => setPayphoneEnv('sandbox')}
                  />
                  Pruebas (Sandbox)
                </label>
                <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                  <input
                    type="radio"
                    name="payphoneEnv"
                    value="production"
                    className="text-[#008000] focus:ring-[#008000] mr-2"
                    checked={payphoneEnv === 'production'}
                    onChange={() => setPayphoneEnv('production')}
                  />
                  Producción
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
                <Key size={12} /> Store ID
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="Introduzca el Store ID de PayPhone..."
                value={payphonePublic}
                onChange={(e) => setPayphonePublic(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex justify-between items-center">
                <span className="flex items-center gap-1"><Key size={12} /> Token de Autorización</span>
                <button
                  type="button"
                  onClick={() => setShowPayphoneSecret(!showPayphoneSecret)}
                  className="text-ink-500 hover:text-ink-900 text-xs flex items-center gap-1 font-bold"
                >
                  {showPayphoneSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPayphoneSecret ? 'Ocultar' : 'Mostrar'}
                </button>
              </label>
              <input
                type={showPayphoneSecret ? 'text' : 'password'}
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="••••••••••••••••••••••••"
                value={payphoneSecret}
                onChange={(e) => setPayphoneSecret(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
                <Globe size={12} /> URL del Checkout (Vercel)
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="https://app.alimentacionorganicaec.net"
                value={payphoneCheckoutUrl}
                onChange={(e) => setPayphoneCheckoutUrl(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-ink-400 mt-1">URL base donde está desplegado el admin en Vercel (sin slash final)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
                <Key size={12} /> Secreto del Checkout
              </label>
              <input
                type="password"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="aloec_checkout_secret_2026"
                value={payphoneCheckoutSecret}
                onChange={(e) => setPayphoneCheckoutSecret(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-ink-400 mt-1">Debe coincidir exactamente con CHECKOUT_SECRET en Vercel</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex justify-center items-center gap-2"
                disabled={saving}
              >
                <Save size={16} />
                Guardar Configuración PayPhone
              </button>
            </div>
          </form>
        </div>

        {/* Stripe Card */}
        <div className="border border-ink-200 bg-white p-6 flex flex-col justify-between">
          <form onSubmit={handleSaveStripe} className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-[#008000]/10 flex items-center justify-center text-[#008000] font-extrabold text-sm">
                  ST
                </div>
                <h3 className="font-extrabold text-ink-900">Stripe (Global)</h3>
              </div>
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4 mr-2"
                  checked={stripeActive}
                  onChange={(e) => setStripeActive(e.target.checked)}
                />
                <span className="text-xs font-bold text-ink-700">Activo</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Entorno (Environment)</label>
              <div className="flex gap-4">
                <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stripeEnv"
                    value="sandbox"
                    className="text-[#008000] focus:ring-[#008000] mr-2"
                    checked={stripeEnv === 'sandbox'}
                    onChange={() => setStripeEnv('sandbox')}
                  />
                  Pruebas (Test Mode)
                </label>
                <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                  <input
                    type="radio"
                    name="stripeEnv"
                    value="production"
                    className="text-[#008000] focus:ring-[#008000] mr-2"
                    checked={stripeEnv === 'production'}
                    onChange={() => setStripeEnv('production')}
                  />
                  Producción (Live Mode)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1">
                <Key size={12} /> Publishable Key
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="pk_test_..."
                value={stripePublic}
                onChange={(e) => setStripePublic(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex justify-between items-center">
                <span className="flex items-center gap-1"><Key size={12} /> Secret Key</span>
                <button
                  type="button"
                  onClick={() => setShowStripeSecret(!showStripeSecret)}
                  className="text-ink-500 hover:text-ink-900 text-xs flex items-center gap-1 font-bold"
                >
                  {showStripeSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showStripeSecret ? 'Ocultar' : 'Mostrar'}
                </button>
              </label>
              <input
                type={showStripeSecret ? 'text' : 'password'}
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                placeholder="sk_test_..."
                value={stripeSecret}
                onChange={(e) => setStripeSecret(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex justify-center items-center gap-2"
                disabled={saving}
              >
                <Save size={16} />
                Guardar Configuración Stripe
              </button>
            </div>
          </form>
        </div>

      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-start gap-3">
        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-bold block mb-1">Nota de Seguridad de Firebase:</span>
          Las claves secretas guardadas aquí se almacenan de manera encriptada en tránsito hacia Firestore. 
          Asegúrate de restringir las reglas de seguridad en Firebase Firestore para la colección <code className="font-mono bg-amber-100 px-1 py-0.5 font-bold">gateways</code> para que solo los administradores puedan leer y escribir estas credenciales.
        </div>
      </div>
    </div>
  )}

  {/* Tab 2: Transferencias bancarias */}
  {activeTab === 'transfers' && (
      <div className="border border-ink-200 bg-white p-6 shadow-xs">
        <form onSubmit={handleSaveBankTransfer} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ink-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#008000]/10 flex items-center justify-center text-[#008000] rounded">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-ink-900">Transferencias Bancarias (Solo Ecuador)</h3>
                <p className="text-xs text-ink-500">Configura las cuentas oficiales para depósitos o transferencias locales y canales de validación.</p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer select-none self-start sm:self-auto bg-ink-50 px-3 py-1.5 border border-ink-200 rounded">
              <input
                type="checkbox"
                className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4 mr-2"
                checked={bankActive}
                onChange={(e) => setBankActive(e.target.checked)}
              />
              <span className="text-xs font-bold text-ink-800">Método Activo en Checkout</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-[#008000]" /> WhatsApp para Notificación de Comprobantes
              </label>
              <input
                type="text"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                placeholder="593999504321"
                value={bankWhatsapp}
                onChange={(e) => setBankWhatsapp(e.target.value)}
                disabled={saving}
              />
              <p className="text-[11px] text-ink-400 mt-1">Número internacional sin el signo + (ej. 593999504321). Se usa para el botón "Notificar por WhatsApp".</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-[#008000]" /> Correo Oficial para Avisos Bancarios
              </label>
              <input
                type="email"
                className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                placeholder="pagos@aloec.com"
                value={bankSupportEmail}
                onChange={(e) => setBankSupportEmail(e.target.value)}
                disabled={saving}
              />
              <p className="text-[11px] text-ink-400 mt-1">Correo al que los usuarios pueden remitir su comprobante desde su banca en línea.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5">Instrucciones para el Usuario</label>
            <textarea
              rows={2}
              className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
              placeholder="Por favor realiza la transferencia bancaria por el valor exacto y adjunta tu comprobante..."
              value={bankInstructions}
              onChange={(e) => setBankInstructions(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Accounts Sub-section */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-ink-800 uppercase tracking-wide">Cuentas Bancarias Registradas ({bankAccounts.length})</h4>
              <button
                type="button"
                onClick={openCreateAccountModal}
                className="px-3 py-1.5 bg-ink-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} />
                Agregar Cuenta Bancaria
              </button>
            </div>

            {bankAccounts.length === 0 ? (
              <div className="border border-dashed border-ink-300 p-6 text-center text-ink-500 bg-ink-50 text-xs">
                No tienes cuentas bancarias configuradas. Haz clic en "Agregar Cuenta Bancaria" para que los usuarios puedan transferir.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="border border-ink-200 bg-ink-50/50 p-4 relative group hover:border-[#008000] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-extrabold text-sm text-ink-900 block">{acc.bankName}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white border border-ink-200 text-ink-600 inline-block mt-1">
                          Cuenta {acc.accountType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleAccountActive(acc.id)}
                          className={`text-xs font-bold px-2 py-0.5 rounded ${acc.isActive ? 'bg-[#008000]/10 text-[#008000]' : 'bg-red-100 text-red-700'}`}
                          title="Alternar estado activo/inactivo"
                        >
                          {acc.isActive ? 'Activa' : 'Inactiva'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditAccountModal(acc)}
                          className="p-1 text-ink-500 hover:text-ink-900 transition-colors"
                          title="Editar cuenta"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar cuenta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-ink-700 font-mono mt-3 border-t border-ink-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-ink-400 font-sans text-[11px]">Número:</span>
                        <span className="font-bold text-ink-900">{acc.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400 font-sans text-[11px]">Titular:</span>
                        <span className="font-medium text-ink-900">{acc.holderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400 font-sans text-[11px]">RUC / Cédula:</span>
                        <span className="font-medium text-ink-900">{acc.idNumber}</span>
                      </div>
                      {acc.email && (
                        <div className="flex justify-between">
                          <span className="text-ink-400 font-sans text-[11px]">Correo:</span>
                          <span className="font-medium text-ink-900 truncate max-w-[180px]">{acc.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex justify-center items-center gap-2"
              disabled={saving}
            >
              <Save size={16} />
              Guardar Configuración de Transferencias Bancarias
            </button>
          </div>
        </form>
      </div>
    )}

      {/* Account Modal (Create / Edit) */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-md p-6 relative shadow-xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-ink-100">
              <h3 className="text-base font-bold text-ink-900">
                {editingAccountId ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="text-ink-400 hover:text-ink-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccountModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink-700 uppercase mb-1">Banco o Entidad Financiera</label>
                <input
                  type="text"
                  required
                  list="common-banks"
                  className="w-full p-2 border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                  placeholder="Ej. Banco Pichincha, Banco Guayaquil..."
                  value={modalBankName}
                  onChange={(e) => setModalBankName(e.target.value)}
                />
                <datalist id="common-banks">
                  <option value="Banco Pichincha" />
                  <option value="Banco Guayaquil" />
                  <option value="Banco del Pacífico" />
                  <option value="Produbanco" />
                  <option value="Banco Bolivariano" />
                  <option value="Banco Internacional" />
                  <option value="Cooperativa JEP" />
                  <option value="Cooperativa Policía Nacional" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-700 uppercase mb-1">Tipo de Cuenta</label>
                  <select
                    className="w-full p-2 border border-ink-300 bg-white outline-none focus:border-ink-900 text-sm text-ink-900"
                    value={modalAccountType}
                    onChange={(e) => setModalAccountType(e.target.value as 'Ahorros' | 'Corriente')}
                  >
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-ink-700 uppercase mb-1">Número de Cuenta</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                    placeholder="2200XXXXXX"
                    value={modalAccountNumber}
                    onChange={(e) => setModalAccountNumber(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink-700 uppercase mb-1">Nombre del Titular</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                  placeholder="ALOEC S.A.S. o Nombre Completo"
                  value={modalHolderName}
                  onChange={(e) => setModalHolderName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink-700 uppercase mb-1">Cédula o RUC</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                    placeholder="179XXXXXXXX001"
                    value={modalIdNumber}
                    onChange={(e) => setModalIdNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink-700 uppercase mb-1">Correo de Notificación</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="pagos@aloec.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                  />
                  <span className="font-bold text-ink-800">Cuenta activa para recibir pagos en Checkout</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border border-ink-300 text-ink-700 font-bold hover:bg-ink-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold transition-colors"
                >
                  {editingAccountId ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
