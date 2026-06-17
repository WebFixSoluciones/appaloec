'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ChevronRight,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Membership {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt?: any;
}

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadMemberships() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'memberships'));
        const list: Membership[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          // Filter out soft deleted items
          if (!data.deletedAt) {
            list.push({
              id: docSnap.id,
              name: data.name || '',
              price: Number(data.price) || 0,
              durationDays: Number(data.durationDays) || 30,
              features: data.features || [],
              isActive: data.isActive !== false,
            });
          }
        });
        setMemberships(list);
      } catch (err) {
        console.error('Error loading memberships:', err);
        toast.error('Error al cargar planes de membresía');
      } finally {
        setLoading(false);
      }
    }
    loadMemberships();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice(0);
    setDurationDays(30);
    setFeatures(['Acceso ilimitado a jugos y recetas']);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Membership) => {
    setEditingId(m.id);
    setName(m.name);
    setPrice(m.price);
    setDurationDays(m.durationDays);
    setFeatures(m.features.length > 0 ? [...m.features] : ['']);
    setIsActive(m.isActive);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, idx) => idx !== index);
    setFeatures(updated.length > 0 ? updated : ['']);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre de la membresía es requerido');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando plan de membresía...');

    try {
      const cleanFeatures = features.map(f => f.trim()).filter(f => f !== '');
      const id = editingId || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const memRef = doc(db, 'memberships', id);

      const memData = {
        name,
        price: Number(price),
        durationDays: Number(durationDays),
        features: cleanFeatures,
        isActive,
        updatedAt: new Date()
      };

      if (editingId) {
        // Edit existing
        await updateDoc(memRef, memData);
        
        // Log Audit
        const prev = memberships.find(m => m.id === editingId);
        await logAdminAction('UPDATE', 'memberships', id, {
          description: `Actualizó membresía: ${name}`,
          previousValues: prev,
          newValues: memData
        });

        setMemberships(memberships.map(m => m.id === editingId ? { ...m, ...memData } : m));
        toast.success('Membresía actualizada con éxito', { id: toastId });
      } else {
        // Create new
        const fullData = {
          ...memData,
          createdAt: new Date()
        };
        await setDoc(memRef, fullData);

        // Log Audit
        await logAdminAction('CREATE', 'memberships', id, {
          description: `Creó nueva membresía: ${name}`,
          newValues: fullData
        });

        setMemberships([...memberships, { id, ...fullData }]);
        toast.success('Membresía creada con éxito', { id: toastId });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving membership:', err);
      toast.error('Error al guardar membresía: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan de membresía? (Se aplicará borrado lógico/soft delete)')) {
      return;
    }

    const toastId = toast.loading('Eliminando plan de membresía...');
    try {
      const memRef = doc(db, 'memberships', id);
      const deletedAt = new Date();
      
      // Soft delete: update document with deletedAt field
      await updateDoc(memRef, { deletedAt });

      // Log Audit
      const prev = memberships.find(m => m.id === id);
      await logAdminAction('DELETE', 'memberships', id, {
        description: `Eliminación lógica de membresía: ${prev?.name}`,
        previousValues: prev,
        newValues: { deletedAt }
      });

      setMemberships(memberships.filter(m => m.id !== id));
      toast.success('Membresía eliminada correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error deleting membership:', err);
      toast.error('Error al eliminar membresía: ' + err.message, { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Membresías y Suscripciones</h1>
          <p className="text-sm text-ink-500 mt-1">Configura los planes de cobro para los usuarios premium.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <Plus size={18} />
          Nuevo Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : memberships.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <CreditCard className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin planes de membresía activos</p>
          <p className="text-sm mb-4">Comienza creando tu primer plan premium para cobrar a los usuarios.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Crear Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memberships.map((m) => (
            <div 
              key={m.id} 
              className={`border p-6 bg-white flex flex-col justify-between transition-all ${
                m.isActive ? 'border-ink-200 hover:border-[#008000]' : 'border-ink-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-extrabold text-ink-900">{m.name}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                    m.isActive ? 'border-[#008000] text-[#008000] bg-[#008000]/5' : 'border-ink-300 text-ink-500 bg-ink-50'
                  }`}>
                    {m.isActive ? 'Activo' : 'Pausado'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-ink-900">${m.price}</span>
                  <span className="text-xs text-ink-500 font-bold ml-1.5">/ {m.durationDays} Días</span>
                </div>

                <div className="border-t border-ink-100 pt-4 mb-6">
                  <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider mb-3">Beneficios Incluidos:</h4>
                  <ul className="space-y-2">
                    {m.features.map((f, i) => (
                      <li key={i} className="text-xs text-ink-600 flex items-start gap-2">
                        <ChevronRight size={14} className="text-[#008000] mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 mt-auto">
                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-1.5 border border-ink-300 text-ink-700 font-bold text-xs hover:bg-ink-50 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 size={12} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-3 py-1.5 border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal (Dropbox Flat Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Plan de Membresía' : 'Crear Nuevo Plan de Membresía'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">Configura el cobro y accesos para este plan.</p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Nombre del Plan</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                  placeholder="ej. Plan Anual ALOEC Premium"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Precio (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="29.99"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Duración (Días)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="30"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase">Características / Beneficios</label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} />
                    Añadir
                  </button>
                </div>
                <div className="space-y-2">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                        placeholder="ej. Acceso a videocursos de nutrición"
                        value={feature}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="isActive" className="text-sm font-bold text-ink-700 select-none">
                  El plan está activo para la compra
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 border-t border-ink-200 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
