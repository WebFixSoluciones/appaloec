'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Settings, Mail, ShieldAlert, Save, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  supportContactEmail: string;
  maintenanceMode: boolean;
  minAppVersionAndroid: string;
  minAppVersionIos: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [supportContactEmail, setSupportContactEmail] = useState('soporte@aloec.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minAppVersionAndroid, setMinAppVersionAndroid] = useState('1.0.0');
  const [minAppVersionIos, setMinAppVersionIos] = useState('1.0.0');

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const docRef = doc(db, 'system_settings', 'global');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as SystemSettings;
          setSupportContactEmail(data.supportContactEmail || 'soporte@aloec.com');
          setMaintenanceMode(data.maintenanceMode || false);
          setMinAppVersionAndroid(data.minAppVersionAndroid || '1.0.0');
          setMinAppVersionIos(data.minAppVersionIos || '1.0.0');
        } else {
          // If settings document doesn't exist, create it with default values
          const defaultData = {
            supportContactEmail: 'soporte@aloec.com',
            maintenanceMode: false,
            minAppVersionAndroid: '1.0.0',
            minAppVersionIos: '1.0.0',
            updatedAt: new Date()
          };
          await setDoc(docRef, defaultData);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        toast.error('Error al cargar ajustes del sistema');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supportContactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportContactEmail.trim())) {
      toast.error('Ingresa un correo de soporte valido');
      return;
    }
    if (!minAppVersionAndroid.trim()) {
      toast.error('La version minima de Android es obligatoria');
      return;
    }
    if (!minAppVersionIos.trim()) {
      toast.error('La version minima de iOS es obligatoria');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando ajustes del sistema...');

    try {
      const docRef = doc(db, 'system_settings', 'global');
      const prevSnap = await getDoc(docRef);
      const prevData = prevSnap.exists() ? prevSnap.data() : null;

      const updatedSettings = {
        supportContactEmail: supportContactEmail.trim(),
        maintenanceMode,
        minAppVersionAndroid: minAppVersionAndroid.trim(),
        minAppVersionIos: minAppVersionIos.trim(),
        updatedAt: new Date()
      };

      await setDoc(docRef, updatedSettings);

      // Log Audit for traceability
      await logAdminAction('UPDATE', 'system_settings', 'global', {
        description: 'Actualizó configuración global del sistema',
        previousValues: prevData,
        newValues: updatedSettings
      });

      toast.success('Ajustes globales guardados con éxito', { id: toastId });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.error('Error al guardar ajustes: ' + err.message, { id: toastId });
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Ajustes del Sistema</h1>
        <p className="text-sm text-ink-500 mt-1">Configura parámetros globales que afectan de forma directa a la aplicación móvil y web.</p>
      </div>

      <div className="border border-ink-200 bg-white p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Support Email */}
          <div>
            <label className="block text-xs font-bold text-ink-700 uppercase mb-2 flex items-center gap-1.5">
              <Mail size={14} className="text-[#008000]" /> Correo de Soporte Técnico
            </label>
            <input
              type="email"
              required
              className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
              placeholder="soporte@aloec.com"
              value={supportContactEmail}
              onChange={(e) => setSupportContactEmail(e.target.value)}
              disabled={saving}
            />
            <p className="text-[11px] text-ink-500 mt-1">Este correo se mostrará a los usuarios en las pantallas de ayuda y soporte en caso de problemas con cobros.</p>
          </div>

          {/* Maintenance Mode Toggler */}
          <div className="border-t border-ink-100 pt-5">
            <label className="block text-xs font-bold text-ink-700 uppercase mb-3 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-600" /> Modo Mantenimiento Global
            </label>
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4">
              <input
                type="checkbox"
                id="maintenanceMode"
                className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-5 w-5 shrink-0"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                disabled={saving}
              />
              <div>
                <label htmlFor="maintenanceMode" className="text-sm font-bold text-amber-900 block cursor-pointer select-none">
                  Activar Mantenimiento
                </label>
                <p className="text-xs text-amber-700 mt-0.5">
                  Si se activa, los clientes de las apps móviles recibirán un aviso bloqueante impidiendo el uso de la aplicación temporalmente.
                </p>
              </div>
            </div>
          </div>

          {/* Client app versions */}
          <div className="border-t border-ink-100 pt-5 space-y-4">
            <label className="block text-xs font-bold text-ink-700 uppercase flex items-center gap-1.5">
              <Smartphone size={14} className="text-[#008000]" /> Versión Mínima Requerida (Forzar Actualización)
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Android Client Version</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900 font-mono"
                  placeholder="1.0.0"
                  value={minAppVersionAndroid}
                  onChange={(e) => setMinAppVersionAndroid(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">iOS Client Version</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900 font-mono"
                  placeholder="1.0.0"
                  value={minAppVersionIos}
                  onChange={(e) => setMinAppVersionIos(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
            <p className="text-[11px] text-ink-500">
              * Nota: Si la app móvil del usuario tiene una versión menor a la indicada, se le obligará a redirigirse a Play Store / App Store para actualizar.
            </p>
          </div>

          {/* Submit button */}
          <div className="border-t border-ink-100 pt-5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Guardando Ajustes...' : 'Guardar Ajustes del Sistema'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
