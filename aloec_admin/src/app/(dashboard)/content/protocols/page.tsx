'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Link,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MealItem {
  time: string;
  label: string;
  icon: string;
  items: string[];
}

interface Protocol {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bmiMin: number | null;
  bmiMax: number | null;
  linkedCourseTag: string;
  importantNotes: string[];
  schedule: MealItem[];
  isPremium: boolean;
  updatedAt?: any;
}

// ─── Default Schedules ────────────────────────────────────────────────────────
const defaultSchedules: Record<string, MealItem[]> = {
  underweight: [
    { time: '07:00 AM', label: 'Desayuno', icon: '🌿', items: ['Jugo verde: manzana, pepino, espinacas', 'Avena con plátano y miel', '1 cápsula Vitamina B12'] },
    { time: '10:30 AM', label: 'Media Mañana', icon: '🥝', items: ['Jugo zanahoria, naranja y remolacha', '1 puñado de nueces naturales'] },
    { time: '01:00 PM', label: 'Almuerzo', icon: '🥗', items: ['Ensalada aguacate con aceite de oliva', 'Arroz integral con vegetales al vapor'] },
    { time: '03:30 PM', label: 'Merienda', icon: '🍌', items: ['Batido de plátano y leche de almendras'] },
    { time: '06:00 PM', label: 'Cena', icon: '🍲', items: ['Crema de calabaza', 'Pan integral tostado'] },
  ],
  overweight: [
    { time: '08:00 AM', label: 'Desayuno', icon: '🥤', items: ['Ensalada de frutas', '1 cápsula hígado y pancreatina', 'Caminar 30 minutos'] },
    { time: '10:30 AM', label: 'Media Mañana', icon: '🌱', items: ['Jugo verde: pepino, apio, manzana, limón'] },
    { time: '01:00 PM', label: 'Almuerzo', icon: '🥗', items: ['Ensalada verde con aderezo de limón', 'Proteína magra (pollo o pescado)'] },
    { time: '03:00 PM', label: 'Media Tarde', icon: '🍎', items: ['Jugo de zanahoria, betabel y manzana'] },
    { time: '06:00 PM', label: 'Cena', icon: '🍵', items: ['Sopa de verduras sin harinas', 'Infusión de hinojo'] },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [bmiMin, setBmiMin] = useState<string>('');
  const [bmiMax, setBmiMax] = useState<string>('');
  const [linkedCourseTag, setLinkedCourseTag] = useState('terapia_gerson');
  const [isPremium, setIsPremium] = useState(true);
  const [importantNotes, setImportantNotes] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState<MealItem[]>([
    { time: '08:00 AM', label: 'Desayuno', icon: '🥤', items: [''] },
  ]);

  useEffect(() => {
    loadProtocols();
  }, []);

  async function loadProtocols() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'diet_protocols'));
      const list: Protocol[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          bmiMin: data.bmiMin ?? null,
          bmiMax: data.bmiMax ?? null,
          linkedCourseTag: data.linkedCourseTag || '',
          importantNotes: data.importantNotes || [],
          schedule: data.schedule || [],
          isPremium: data.isPremium !== false,
          updatedAt: data.updatedAt,
        });
      });
      // Sort by bmiMin
      list.sort((a, b) => (a.bmiMin ?? 0) - (b.bmiMin ?? 0));
      setProtocols(list);
    } catch (err) {
      console.error('Error loading protocols:', err);
      toast.error('Error al cargar los protocolos médicos');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setBmiMin('');
    setBmiMax('');
    setLinkedCourseTag('terapia_gerson');
    setIsPremium(true);
    setImportantNotes(['Consultar a su médico antes de iniciar.', '']);
    setSchedule(defaultSchedules.overweight.map(m => ({ ...m, items: [...m.items] })));
    setIsModalOpen(true);
  }

  function openEditModal(p: Protocol) {
    setEditingId(p.id);
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setDescription(p.description);
    setBmiMin(p.bmiMin !== null ? String(p.bmiMin) : '');
    setBmiMax(p.bmiMax !== null ? String(p.bmiMax) : '');
    setLinkedCourseTag(p.linkedCourseTag);
    setIsPremium(p.isPremium);
    setImportantNotes(p.importantNotes.length > 0 ? [...p.importantNotes] : ['']);
    setSchedule(p.schedule.length > 0
      ? p.schedule.map(m => ({ ...m, items: [...m.items] }))
      : [{ time: '08:00 AM', label: 'Desayuno', icon: '🥤', items: [''] }]
    );
    setIsModalOpen(true);
  }

  // ─── Schedule helpers ────────────────────────────────────────────────────────
  const addMeal = () =>
    setSchedule([...schedule, { time: '12:00 PM', label: 'Nueva Comida', icon: '🍽️', items: [''] }]);

  const removeMeal = (idx: number) =>
    setSchedule(schedule.filter((_, i) => i !== idx));

  const updateMeal = (idx: number, field: keyof MealItem, value: string) => {
    const updated = [...schedule];
    (updated[idx] as any)[field] = value;
    setSchedule(updated);
  };

  const addMealItem = (mealIdx: number) => {
    const updated = [...schedule];
    updated[mealIdx] = { ...updated[mealIdx], items: [...updated[mealIdx].items, ''] };
    setSchedule(updated);
  };

  const removeMealItem = (mealIdx: number, itemIdx: number) => {
    const updated = [...schedule];
    updated[mealIdx] = { ...updated[mealIdx], items: updated[mealIdx].items.filter((_, i) => i !== itemIdx) };
    setSchedule(updated);
  };

  const updateMealItem = (mealIdx: number, itemIdx: number, value: string) => {
    const updated = [...schedule];
    const items = [...updated[mealIdx].items];
    items[itemIdx] = value;
    updated[mealIdx] = { ...updated[mealIdx], items };
    setSchedule(updated);
  };

  // ─── Notes helpers ───────────────────────────────────────────────────────────
  const addNote = () => setImportantNotes([...importantNotes, '']);
  const removeNote = (idx: number) =>
    setImportantNotes(importantNotes.filter((_, i) => i !== idx));
  const updateNote = (idx: number, value: string) => {
    const updated = [...importantNotes];
    updated[idx] = value;
    setImportantNotes(updated);
  };

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El Título del protocolo es obligatorio');
      return;
    }
    setSaving(true);
    const toastId = toast.loading('Guardando protocolo médico...');

    try {
      const id = editingId || `protocol_${Date.now()}`;
      const docRef = doc(db, 'diet_protocols', id);

      const cleanSchedule = schedule.map((meal) => ({
        ...meal,
        items: meal.items.filter((item) => item.trim() !== ''),
      }));

      const protocolData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        bmiMin: bmiMin !== '' ? parseFloat(bmiMin) : null,
        bmiMax: bmiMax !== '' ? parseFloat(bmiMax) : null,
        linkedCourseTag: linkedCourseTag.trim(),
        isPremium,
        importantNotes: importantNotes.filter((n) => n.trim() !== ''),
        schedule: cleanSchedule,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(docRef, protocolData);
        await logAdminAction('UPDATE', 'diet_protocols', id, {
          description: `Actualizó protocolo médico: ${title}`,
          newValues: protocolData,
        });
        setProtocols(protocols.map((p) => (p.id === editingId ? { ...p, ...protocolData } : p)));
        toast.success('Protocolo actualizado correctamente', { id: toastId });
      } else {
        const fullData = { ...protocolData, createdAt: new Date() };
        await setDoc(docRef, fullData);
        await logAdminAction('CREATE', 'diet_protocols', id, {
          description: `Creó nuevo protocolo médico: ${title}`,
          newValues: fullData,
        });
        setProtocols([...protocols, { id, ...protocolData }]);
        toast.success('Protocolo creado correctamente', { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving protocol:', err);
      toast.error('Error al guardar: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este protocolo médico? Esta acción no se puede deshacer.')) return;
    const toastId = toast.loading('Eliminando protocolo...');
    try {
      await updateDoc(doc(db, 'diet_protocols', id), { deletedAt: new Date() });
      await logAdminAction('DELETE', 'diet_protocols', id, {
        description: `Eliminó protocolo médico: ${protocols.find(p => p.id === id)?.title}`,
      });
      setProtocols(protocols.filter((p) => p.id !== id));
      toast.success('Protocolo eliminado', { id: toastId });
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message, { id: toastId });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Protocolos Médicos ALOEC</h1>
          <p className="text-sm text-ink-500 mt-1">
            Gestiona los protocolos de dieta según IMC. Configura la agenda, notas y el curso de Terapia Gerson vinculado.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <Plus size={18} />
          Nuevo Protocolo
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Integración automática con la App Móvil:</strong> Cada protocolo guardado aquí
          se vincula automáticamente con la calculadora de IMC de la app. El campo{' '}
          <code className="bg-amber-100 px-1 font-mono text-xs">linkedCourseTag</code> conecta el
          protocolo con el videocurso correspondiente en la colección <code className="bg-amber-100 px-1 font-mono text-xs">courses</code>.
        </div>
      </div>

      {/* Protocol Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : protocols.length === 0 ? (
        <div className="border border-ink-200 p-16 text-center text-ink-500 bg-white">
          <ClipboardList className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-2">Sin protocolos configurados</p>
          <p className="text-sm mb-6">
            Los protocolos médicos se muestran en la app móvil cuando el usuario calcula su IMC.
            Crea el primero para comenzar.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors"
          >
            Crear Primer Protocolo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {protocols.map((p) => (
            <div key={p.id} className="border border-ink-200 bg-white overflow-hidden">
              {/* Protocol Header Row */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#008000]/10 border border-[#008000]/20 flex items-center justify-center shrink-0">
                    <ClipboardList size={22} className="text-[#008000]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-ink-900 text-base">{p.title}</h3>
                      {p.isPremium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200">
                          ⭐ PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500">{p.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {(p.bmiMin !== null || p.bmiMax !== null) && (
                        <span className="text-xs font-mono text-ink-400">
                          IMC:{' '}
                          {p.bmiMin !== null ? p.bmiMin : '—'} →{' '}
                          {p.bmiMax !== null ? p.bmiMax : '∞'}
                        </span>
                      )}
                      {p.linkedCourseTag && (
                        <span className="flex items-center gap-1 text-xs text-[#008000] font-mono">
                          <Link size={11} />
                          {p.linkedCourseTag}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-ink-500">
                        <Clock size={11} />
                        {p.schedule.length} comidas/actividades
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    className="px-3 py-1.5 border border-ink-200 text-ink-600 hover:bg-ink-50 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expandedId === p.id ? 'Colapsar' : 'Ver Agenda'}
                  </button>
                </div>
              </div>

              {/* Expandable Schedule Preview */}
              {expandedId === p.id && (
                <div className="border-t border-ink-100 px-5 py-4 bg-ink-50 space-y-3">
                  <p className="text-xs font-bold text-ink-700 uppercase mb-3">Agenda del Día</p>
                  {p.schedule.map((meal, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-xs font-mono text-ink-500 shrink-0 w-20 pt-0.5">
                        {meal.time}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-ink-800">
                          {meal.icon} {meal.label}
                        </span>
                        <ul className="mt-1 space-y-0.5">
                          {meal.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-ink-600">
                              <CheckCircle2 size={11} className="text-[#008000] shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {p.importantNotes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-200">
                      <p className="text-xs font-bold text-ink-700 uppercase mb-2">Notas Importantes</p>
                      <ul className="space-y-1">
                        {p.importantNotes.map((note, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-ink-600">
                            <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal CRUD ───────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-ink-300 w-full max-w-3xl my-8 relative">
            <div className="p-6 border-b border-ink-200">
              <h3 className="text-lg font-bold text-ink-900">
                {editingId ? 'Editar Protocolo Médico' : 'Nuevo Protocolo Médico'}
              </h3>
              <p className="text-xs text-ink-500 mt-1">
                Los cambios se reflejarán automáticamente en la app móvil al guardar.
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                    Título del Protocolo *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm"
                    placeholder="ej. Protocolo para Pérdida de Peso"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm"
                    placeholder="ej. IMC 25 – 29.5 (Sobrepeso)"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                    Tag de Curso Vinculado
                  </label>
                  <input
                    type="text"
                    value={linkedCourseTag}
                    onChange={(e) => setLinkedCourseTag(e.target.value)}
                    className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm font-mono"
                    placeholder="ej. terapia_gerson"
                    disabled={saving}
                  />
                  <p className="text-[10px] text-ink-400 mt-1">
                    Debe coincidir con un tag en la colección <code>courses</code>.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm h-20 resize-none"
                  placeholder="Descripción del protocolo visible para el usuario..."
                  disabled={saving}
                />
              </div>

              {/* BMI Range */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">
                  Rango de IMC (para asignación automática)
                </span>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">IMC Mínimo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bmiMin}
                      onChange={(e) => setBmiMin(e.target.value)}
                      className="w-full p-2 border border-ink-300 outline-none focus:border-[#008000] text-sm"
                      placeholder="ej. 25.0"
                      disabled={saving}
                    />
                  </div>
                  <div className="text-center text-ink-400 font-bold">→</div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">IMC Máximo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bmiMax}
                      onChange={(e) => setBmiMax(e.target.value)}
                      className="w-full p-2 border border-ink-300 outline-none focus:border-[#008000] text-sm"
                      placeholder="ej. 29.9"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Premium toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="protocolPremium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-[#008000] focus:ring-[#008000]"
                  disabled={saving}
                />
                <label htmlFor="protocolPremium" className="text-sm font-bold text-ink-700 cursor-pointer">
                  ⭐ Requiere suscripción Premium
                </label>
              </div>

              {/* Schedule */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-ink-700 uppercase">
                    Agenda Diaria del Protocolo
                  </label>
                  <button
                    type="button"
                    onClick={addMeal}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Agregar Comida
                  </button>
                </div>
                <div className="space-y-4">
                  {schedule.map((meal, mealIdx) => (
                    <div key={mealIdx} className="border border-ink-200 bg-ink-50 p-4 space-y-3">
                      <div className="grid grid-cols-4 gap-2 items-center">
                        <input
                          type="text"
                          value={meal.icon}
                          onChange={(e) => updateMeal(mealIdx, 'icon', e.target.value)}
                          className="p-2 border border-ink-300 outline-none text-center text-lg bg-white"
                          placeholder="🥤"
                          disabled={saving}
                        />
                        <input
                          type="text"
                          value={meal.time}
                          onChange={(e) => updateMeal(mealIdx, 'time', e.target.value)}
                          className="p-2 border border-ink-300 outline-none text-xs font-mono bg-white"
                          placeholder="08:00 AM"
                          disabled={saving}
                        />
                        <input
                          type="text"
                          value={meal.label}
                          onChange={(e) => updateMeal(mealIdx, 'label', e.target.value)}
                          className="p-2 border border-ink-300 outline-none text-xs bg-white"
                          placeholder="Desayuno"
                          disabled={saving}
                        />
                        <button
                          type="button"
                          onClick={() => removeMeal(mealIdx)}
                          disabled={schedule.length <= 1 || saving}
                          className="flex items-center justify-center text-red-500 hover:text-red-700 disabled:opacity-30"
                        >
                          <MinusCircle size={18} />
                        </button>
                      </div>
                      {/* Meal items */}
                      <div className="space-y-2">
                        {meal.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateMealItem(mealIdx, itemIdx, e.target.value)}
                              className="flex-1 p-2 border border-ink-300 outline-none text-xs bg-white focus:border-[#008000]"
                              placeholder="ej. Jugo verde de espinaca y manzana"
                              disabled={saving}
                            />
                            <button
                              type="button"
                              onClick={() => removeMealItem(mealIdx, itemIdx)}
                              disabled={meal.items.length <= 1 || saving}
                              className="text-red-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <MinusCircle size={15} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addMealItem(mealIdx)}
                          className="text-xs text-[#008000] hover:underline flex items-center gap-1"
                        >
                          <PlusCircle size={12} /> Añadir ítem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-ink-700 uppercase">
                    Notas Importantes para el Usuario
                  </label>
                  <button
                    type="button"
                    onClick={addNote}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Añadir Nota
                  </button>
                </div>
                <div className="space-y-2">
                  {importantNotes.map((note, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => updateNote(idx, e.target.value)}
                        className="flex-1 p-2 border border-ink-300 outline-none text-xs focus:border-[#008000]"
                        placeholder="ej. Consultar a su médico antes de iniciar."
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => removeNote(idx)}
                        disabled={importantNotes.length <= 1 || saving}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <MinusCircle size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editingId ? 'Actualizar Protocolo' : 'Crear Protocolo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
