'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  Search,
  UploadCloud,
  Eye,
  EyeOff,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────────
type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner';
type BmiCategoryKey = 'underweight' | 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  morning_snack: 'Media Mañana',
  lunch: 'Almuerzo',
  afternoon_snack: 'Media Tarde / Merienda',
  dinner: 'Cena',
};

const BMI_CATEGORIES: { key: BmiCategoryKey; label: string; min: number | null; max: number | null }[] = [
  { key: 'underweight', label: 'Bajo Peso (< 18.5)', min: null, max: 18.5 },
  { key: 'normal', label: 'Normal (18.5 – 24.9)', min: 18.5, max: 25 },
  { key: 'overweight', label: 'Sobrepeso (25 – 29.9)', min: 25, max: 30 },
  { key: 'obesity1', label: 'Obesidad I (30 – 34.9)', min: 30, max: 35 },
  { key: 'obesity2', label: 'Obesidad II (35 – 39.9)', min: 35, max: 40 },
  { key: 'obesity3', label: 'Obesidad III (≥ 40)', min: 40, max: null },
];

interface MealItem {
  mealType: MealType;
  time: string;
  label: string;
  icon: string;
  recipeId: string;
  recipeName: string;
  recipeImageUrl: string;
  notes: string;
  items: string[];
}

interface Protocol {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  bmiCategory: BmiCategoryKey;
  bmiMin: number | null;
  bmiMax: number | null;
  linkedCourseTag: string;
  linkedCourses: string[];
  importantNotes: string[];
  schedule: MealItem[];
  isPremium: boolean;
  isActive: boolean;
  order: number;
  updatedAt?: any;
}

interface RecipeOption {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Recipe catalog for selector
  const [allRecipes, setAllRecipes] = useState<RecipeOption[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bmiCategory, setBmiCategory] = useState<BmiCategoryKey>('overweight');
  const [bmiMin, setBmiMin] = useState<string>('');
  const [bmiMax, setBmiMax] = useState<string>('');
  const [linkedCourseTag, setLinkedCourseTag] = useState('terapia_gerson');
  const [isPremium, setIsPremium] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(0);
  const [importantNotes, setImportantNotes] = useState<string[]>(['']);
  const [schedule, setSchedule] = useState<MealItem[]>([
    { mealType: 'breakfast', time: '08:00 AM', label: 'Desayuno', icon: '🥤', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
  ]);

  // Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProtocols();
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      const snap = await getDocs(collection(db, 'recipes'));
      const list: RecipeOption[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.deletedAt && data.isActive !== false) {
          list.push({
            id: docSnap.id,
            title: data.title || '',
            imageUrl: data.imageUrl || '',
            category: data.category || '',
          });
        }
      });
      list.sort((a, b) => a.title.localeCompare(b.title));
      setAllRecipes(list);
    } catch (err) {
      console.error('Error loading recipes:', err);
    }
  }

  async function loadProtocols() {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'diet_protocols'));
      const list: Protocol[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.deletedAt) {
          list.push({
            id: docSnap.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            bmiCategory: data.bmiCategory || 'overweight',
            bmiMin: data.bmiMin ?? null,
            bmiMax: data.bmiMax ?? null,
            linkedCourseTag: data.linkedCourseTag || '',
            linkedCourses: data.linkedCourses || [],
            importantNotes: data.importantNotes || [],
            schedule: (data.schedule || []).map((m: any) => ({
              mealType: m.mealType || 'breakfast',
              time: m.time || '',
              label: m.label || '',
              icon: m.icon || '🍽️',
              recipeId: m.recipeId || '',
              recipeName: m.recipeName || '',
              recipeImageUrl: m.recipeImageUrl || '',
              notes: m.notes || '',
              items: m.items || [],
            })),
            isPremium: data.isPremium !== false,
            isActive: data.isActive !== false,
            order: Number(data.order) || 0,
            updatedAt: data.updatedAt,
          });
        }
      });
      list.sort((a, b) => a.order - b.order || (a.bmiMin ?? 0) - (b.bmiMin ?? 0));
      setProtocols(list);
    } catch (err) {
      console.error('Error loading protocols:', err);
      toast.error('Error al cargar los protocolos médicos');
    } finally {
      setLoading(false);
    }
  }

  function handleBmiCategoryChange(key: BmiCategoryKey) {
    setBmiCategory(key);
    const cat = BMI_CATEGORIES.find(c => c.key === key);
    if (cat) {
      setBmiMin(cat.min !== null ? String(cat.min) : '');
      setBmiMax(cat.max !== null ? String(cat.max) : '');
    }
  }

  function openAddModal() {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setImageUrl('');
    setBmiCategory('overweight');
    setBmiMin('25');
    setBmiMax('30');
    setLinkedCourseTag('terapia_gerson');
    setIsPremium(true);
    setIsActive(true);
    setOrder(protocols.length);
    setImportantNotes(['Consultar a su médico antes de iniciar.', '']);
    setSchedule([
      { mealType: 'breakfast', time: '08:00 AM', label: 'Desayuno', icon: '🥤', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
      { mealType: 'morning_snack', time: '10:30 AM', label: 'Media Mañana', icon: '🌱', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
      { mealType: 'lunch', time: '01:00 PM', label: 'Almuerzo', icon: '🥗', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
      { mealType: 'afternoon_snack', time: '03:00 PM', label: 'Media Tarde', icon: '🍎', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
      { mealType: 'dinner', time: '06:00 PM', label: 'Cena', icon: '🍵', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] },
    ]);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  }

  function openEditModal(p: Protocol) {
    setEditingId(p.id);
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setBmiCategory(p.bmiCategory);
    setBmiMin(p.bmiMin !== null ? String(p.bmiMin) : '');
    setBmiMax(p.bmiMax !== null ? String(p.bmiMax) : '');
    setLinkedCourseTag(p.linkedCourseTag);
    setIsPremium(p.isPremium);
    setIsActive(p.isActive);
    setOrder(p.order);
    setImportantNotes(p.importantNotes.length > 0 ? [...p.importantNotes] : ['']);
    setSchedule(p.schedule.length > 0
      ? p.schedule.map(m => ({ ...m, items: [...m.items] }))
      : [{ mealType: 'breakfast' as MealType, time: '08:00 AM', label: 'Desayuno', icon: '🥤', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] }]
    );
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  }

  // ─── Schedule helpers ────────────────────────────────────────────────────────
  const addMeal = () =>
    setSchedule([...schedule, { mealType: 'lunch', time: '12:00 PM', label: 'Nueva Comida', icon: '🍽️', recipeId: '', recipeName: '', recipeImageUrl: '', notes: '', items: [''] }]);

  const removeMeal = (idx: number) =>
    setSchedule(schedule.filter((_, i) => i !== idx));

  const updateMealField = (idx: number, field: keyof MealItem, value: string) => {
    const updated = [...schedule];
    (updated[idx] as any)[field] = value;
    setSchedule(updated);
  };

  const selectRecipeForMeal = (mealIdx: number, recipeId: string) => {
    const updated = [...schedule];
    if (!recipeId) {
      updated[mealIdx] = { ...updated[mealIdx], recipeId: '', recipeName: '', recipeImageUrl: '' };
    } else {
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (recipe) {
        updated[mealIdx] = {
          ...updated[mealIdx],
          recipeId: recipe.id,
          recipeName: recipe.title,
          recipeImageUrl: recipe.imageUrl,
        };
      }
    }
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
  const removeNote = (idx: number) => setImportantNotes(importantNotes.filter((_, i) => i !== idx));
  const updateNote = (idx: number, value: string) => {
    const updated = [...importantNotes];
    updated[idx] = value;
    setImportantNotes(updated);
  };

  // ─── Upload ──────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setUploadFile(e.target.files[0]);
  };

  const handleUploadImage = () => {
    if (!uploadFile) { toast.error('Selecciona una imagen primero'); return; }
    setUploading(true);
    const fileRef = ref(storage, `protocols/${Date.now()}_${uploadFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);
    uploadTask.on('state_changed',
      (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (error) => { console.error(error); toast.error('Error al subir imagen'); setUploading(false); },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadUrl);
        toast.success('Imagen subida');
        setUploading(false);
        setUploadFile(null);
        setUploadProgress(0);
      }
    );
  };

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('El Título es obligatorio'); return; }
    setSaving(true);
    const toastId = toast.loading('Guardando protocolo...');

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
        imageUrl: imageUrl.trim(),
        bmiCategory,
        bmiMin: bmiMin !== '' ? (parseFloat(bmiMin) || null) : null,
        bmiMax: bmiMax !== '' ? (parseFloat(bmiMax) || null) : null,
        linkedCourseTag: linkedCourseTag.trim(),
        linkedCourses: [] as string[],
        isPremium,
        isActive,
        order: Number(order),
        importantNotes: importantNotes.filter((n) => n.trim() !== ''),
        schedule: cleanSchedule,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(docRef, protocolData);
        await logAdminAction('UPDATE', 'diet_protocols', id, {
          description: `Actualizó protocolo: ${title}`,
          newValues: protocolData,
        });
        setProtocols(protocols.map((p) => (p.id === editingId ? { ...p, ...protocolData } : p)));
        toast.success('Protocolo actualizado', { id: toastId });
      } else {
        const fullData = { ...protocolData, createdAt: new Date() };
        await setDoc(docRef, fullData);
        await logAdminAction('CREATE', 'diet_protocols', id, {
          description: `Creó protocolo: ${title}`,
          newValues: fullData,
        });
        setProtocols([...protocols, { id, ...protocolData }]);
        toast.success('Protocolo creado', { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error('Error: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este protocolo?')) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await updateDoc(doc(db, 'diet_protocols', id), { deletedAt: new Date() });
      await logAdminAction('DELETE', 'diet_protocols', id, {
        description: `Eliminó protocolo: ${protocols.find(p => p.id === id)?.title}`,
      });
      setProtocols(protocols.filter((p) => p.id !== id));
      toast.success('Protocolo eliminado', { id: toastId });
    } catch (err: any) {
      toast.error('Error: ' + err.message, { id: toastId });
    }
  };

  const getBmiCategoryLabel = (key: string) => BMI_CATEGORIES.find(c => c.key === key)?.label || key;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Protocolos Médicos ALOEC</h1>
          <p className="text-sm text-ink-500 mt-1">
            Gestiona los protocolos de dieta según IMC. Asigna recetas del catálogo a cada comida del día.
          </p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none">
          <Plus size={18} /> Nuevo Protocolo
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-sm">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Integración con la App Móvil:</strong> Los protocolos se vinculan automáticamente con la calculadora de IMC.
          Para cada comida del día, selecciona una receta del catálogo — la app mostrará la receta completa al usuario.
          {allRecipes.length === 0 && (
            <span className="block mt-1 text-red-700 font-bold">
              ⚠️ No hay recetas en el catálogo. Crea recetas primero en "Catálogo de Recetas".
            </span>
          )}
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
          <p className="text-sm mb-6">Crea el primer protocolo médico para que aparezca en la app.</p>
          <button onClick={openAddModal} className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm">
            Crear Primer Protocolo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {protocols.map((p) => (
            <div key={p.id} className={`border bg-white overflow-hidden ${p.isActive ? 'border-ink-200' : 'border-red-200 opacity-60'}`}>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-12 h-12 object-cover border border-ink-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-[#008000]/10 border border-[#008000]/20 flex items-center justify-center shrink-0">
                      <ClipboardList size={22} className="text-[#008000]" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ink-900 text-base">{p.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                        {getBmiCategoryLabel(p.bmiCategory)}
                      </span>
                      {p.isPremium && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200">PREMIUM</span>
                      )}
                      {!p.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 border border-red-200">INACTIVO</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500">{p.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {(p.bmiMin !== null || p.bmiMax !== null) && (
                        <span className="text-xs font-mono text-ink-400">
                          IMC: {p.bmiMin ?? '—'} → {p.bmiMax ?? '∞'}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-ink-500">
                        <Clock size={11} /> {p.schedule.length} comidas
                      </span>
                      {p.schedule.some(m => m.recipeId) && (
                        <span className="flex items-center gap-1 text-xs text-[#008000]">
                          <UtensilsCrossed size={11} /> {p.schedule.filter(m => m.recipeId).length} recetas vinculadas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditModal(p)} className="px-3 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs flex items-center gap-1.5">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5">
                    <Trash2 size={12} /> Eliminar
                  </button>
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="px-3 py-1.5 border border-ink-200 text-ink-600 hover:bg-ink-50 text-xs font-bold flex items-center gap-1">
                    {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expandedId === p.id ? 'Colapsar' : 'Ver Agenda'}
                  </button>
                </div>
              </div>

              {expandedId === p.id && (
                <div className="border-t border-ink-100 px-5 py-4 bg-ink-50 space-y-3">
                  <p className="text-xs font-bold text-ink-700 uppercase mb-3">Agenda del Día</p>
                  {p.schedule.map((meal, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="text-xs font-mono text-ink-500 shrink-0 w-20 pt-0.5">{meal.time}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink-800">{meal.icon} {meal.label}</span>
                          {meal.recipeName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#008000]/10 text-[#008000] border border-[#008000]/20">
                              <UtensilsCrossed size={10} /> {meal.recipeName}
                            </span>
                          )}
                        </div>
                        {meal.notes && <p className="text-xs text-ink-500 italic mt-0.5">{meal.notes}</p>}
                        <ul className="mt-1 space-y-0.5">
                          {meal.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-ink-600">
                              <CheckCircle2 size={11} className="text-[#008000] shrink-0" /> {item}
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
                            <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" /> {note}
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
          <div className="bg-white border border-ink-300 w-full max-w-4xl my-8 relative">
            <div className="p-6 border-b border-ink-200 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-ink-900">
                  {editingId ? 'Editar Protocolo Médico' : 'Nuevo Protocolo Médico'}
                </h3>
                <p className="text-xs text-ink-500 mt-1">Los cambios se reflejan automáticamente en la app móvil.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-400 hover:text-ink-600"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Title + Subtitle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título del Protocolo *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm" placeholder="ej. Protocolo para Pérdida de Peso" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Subtítulo</label>
                  <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm" placeholder="ej. IMC 25 – 29.9 (Sobrepeso)" disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Tag de Curso Vinculado</label>
                  <input type="text" value={linkedCourseTag} onChange={(e) => setLinkedCourseTag(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm font-mono" placeholder="ej. terapia_gerson" disabled={saving} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm h-20 resize-none" placeholder="Descripción visible para el usuario..." disabled={saving} />
              </div>

              {/* Image Upload */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Imagen del Protocolo</span>
                <div className="flex gap-2">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="protocolImageFile" disabled={uploading || saving} />
                  <label htmlFor="protocolImageFile" className="flex-1 p-2.5 bg-white border border-ink-300 cursor-pointer text-xs font-bold text-ink-700 hover:bg-ink-50 flex items-center justify-center gap-1.5">
                    <UploadCloud size={16} /> {uploadFile ? uploadFile.name : 'Seleccionar Archivo'}
                  </label>
                  {uploadFile && (
                    <button type="button" onClick={handleUploadImage} className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs shrink-0" disabled={uploading || saving}>
                      {uploading ? `${uploadProgress}%` : 'Subir'}
                    </button>
                  )}
                </div>
                <input type="url" className="w-full p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs font-mono" placeholder="O URL externa: https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={uploading || saving} />
              </div>

              {/* BMI Category */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Categoría y Rango de IMC</span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Categoría IMC *</label>
                    <select className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm" value={bmiCategory} onChange={(e) => handleBmiCategoryChange(e.target.value as BmiCategoryKey)} disabled={saving}>
                      {BMI_CATEGORIES.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">IMC Mínimo</label>
                    <input type="number" step="0.1" value={bmiMin} onChange={(e) => setBmiMin(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm" placeholder="ej. 25.0" disabled={saving} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">IMC Máximo</label>
                    <input type="number" step="0.1" value={bmiMax} onChange={(e) => setBmiMax(e.target.value)} className="w-full p-2.5 border border-ink-300 outline-none focus:border-[#008000] text-sm" placeholder="ej. 29.9" disabled={saving} />
                  </div>
                </div>
              </div>

              {/* Toggles row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="protocolPremium" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-[#008000]" disabled={saving} />
                  <label htmlFor="protocolPremium" className="text-sm font-bold text-ink-700 cursor-pointer">Premium</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="protocolActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-[#008000]" disabled={saving} />
                  <label htmlFor="protocolActive" className="text-sm font-bold text-ink-700 cursor-pointer flex items-center gap-1">
                    {isActive ? <Eye size={14} /> : <EyeOff size={14} />} {isActive ? 'Activo' : 'Inactivo'}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-ink-700 uppercase">Orden:</label>
                  <input type="number" min="0" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-16 p-1.5 border border-ink-300 outline-none text-sm text-center" disabled={saving} />
                </div>
              </div>

              {/* Schedule — Meal Editor */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-ink-700 uppercase">Agenda Diaria — Comidas y Recetas</label>
                  <button type="button" onClick={addMeal} className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1">
                    <PlusCircle size={14} /> Agregar Comida
                  </button>
                </div>
                <div className="space-y-4">
                  {schedule.map((meal, mealIdx) => (
                    <div key={mealIdx} className="border border-ink-200 bg-ink-50 p-4 space-y-3">
                      {/* Meal header row */}
                      <div className="grid grid-cols-6 gap-2 items-center">
                        <input type="text" value={meal.icon} onChange={(e) => updateMealField(mealIdx, 'icon', e.target.value)} className="p-2 border border-ink-300 outline-none text-center text-lg bg-white" placeholder="🥤" disabled={saving} />
                        <select value={meal.mealType} onChange={(e) => {
                          updateMealField(mealIdx, 'mealType', e.target.value);
                          updateMealField(mealIdx, 'label', MEAL_TYPE_LABELS[e.target.value as MealType] || meal.label);
                        }} className="p-2 border border-ink-300 outline-none text-xs bg-white" disabled={saving}>
                          {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <input type="text" value={meal.time} onChange={(e) => updateMealField(mealIdx, 'time', e.target.value)} className="p-2 border border-ink-300 outline-none text-xs font-mono bg-white" placeholder="08:00 AM" disabled={saving} />
                        <input type="text" value={meal.label} onChange={(e) => updateMealField(mealIdx, 'label', e.target.value)} className="p-2 border border-ink-300 outline-none text-xs bg-white" placeholder="Etiqueta" disabled={saving} />
                        <input type="text" value={meal.notes} onChange={(e) => updateMealField(mealIdx, 'notes', e.target.value)} className="p-2 border border-ink-300 outline-none text-xs bg-white" placeholder="Notas (opcional)" disabled={saving} />
                        <button type="button" onClick={() => removeMeal(mealIdx)} disabled={schedule.length <= 1 || saving} className="flex items-center justify-center text-red-500 hover:text-red-700 disabled:opacity-30">
                          <MinusCircle size={18} />
                        </button>
                      </div>

                      {/* Recipe Selector */}
                      <div className="bg-white border border-ink-200 p-3">
                        <span className="text-[10px] font-bold text-ink-500 uppercase block mb-2">
                          <UtensilsCrossed size={10} className="inline mr-1" />
                          Receta Vinculada
                        </span>
                        <div className="flex gap-2 items-center">
                          <select
                            value={meal.recipeId}
                            onChange={(e) => selectRecipeForMeal(mealIdx, e.target.value)}
                            className="flex-1 p-2 border border-ink-300 outline-none text-xs bg-white focus:border-[#008000]"
                            disabled={saving}
                          >
                            <option value="">— Sin receta (manual) —</option>
                            {allRecipes.map(r => (
                              <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                          </select>
                          {meal.recipeId && meal.recipeImageUrl && (
                            <img src={meal.recipeImageUrl} alt="" className="w-10 h-10 object-cover border border-ink-200 shrink-0" />
                          )}
                          {meal.recipeId && (
                            <button type="button" onClick={() => selectRecipeForMeal(mealIdx, '')} className="text-red-400 hover:text-red-600 shrink-0" title="Quitar receta">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        {meal.recipeId && meal.recipeName && (
                          <p className="text-[10px] text-[#008000] font-bold mt-1">Vinculada: {meal.recipeName}</p>
                        )}
                      </div>

                      {/* Manual items */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-ink-500 uppercase">Ítems adicionales (opcional)</span>
                        {meal.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex gap-2 items-center">
                            <input type="text" value={item} onChange={(e) => updateMealItem(mealIdx, itemIdx, e.target.value)} className="flex-1 p-2 border border-ink-300 outline-none text-xs bg-white focus:border-[#008000]" placeholder="ej. 1 vaso de agua tibia con limón" disabled={saving} />
                            <button type="button" onClick={() => removeMealItem(mealIdx, itemIdx)} disabled={meal.items.length <= 1 || saving} className="text-red-400 hover:text-red-600 disabled:opacity-30">
                              <MinusCircle size={15} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addMealItem(mealIdx)} className="text-xs text-[#008000] hover:underline flex items-center gap-1">
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
                  <label className="block text-xs font-bold text-ink-700 uppercase">Notas Importantes</label>
                  <button type="button" onClick={addNote} className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1">
                    <PlusCircle size={14} /> Añadir Nota
                  </button>
                </div>
                <div className="space-y-2">
                  {importantNotes.map((note, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" value={note} onChange={(e) => updateNote(idx, e.target.value)} className="flex-1 p-2 border border-ink-300 outline-none text-xs focus:border-[#008000]" placeholder="ej. Consultar a su médico antes de iniciar." disabled={saving} />
                      <button type="button" onClick={() => removeNote(idx)} disabled={importantNotes.length <= 1 || saving} className="text-red-400 hover:text-red-600 disabled:opacity-30">
                        <MinusCircle size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50" disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm" disabled={saving}>
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
