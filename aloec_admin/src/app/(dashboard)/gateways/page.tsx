'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, Key, Globe, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GatewayConfig {
  providerName: string;
  publicKey: string;
  secretKey: string;
  isActive: boolean;
  environment: 'sandbox' | 'production';
}

export default function GatewaysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  );
}
