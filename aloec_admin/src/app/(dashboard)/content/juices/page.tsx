'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Droplet, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Lock, 
  Unlock, 
  UploadCloud, 
  CheckCircle,
  Clock,
  Heart,
  Activity,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface NutritionalValues {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  nutritionalValues: NutritionalValues;
  prepTime: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  dietType: string;
  ingredients: string[];
  benefits: string[];
  isPremium: boolean;
  viewsCount: number;
  deletedAt?: any;
}

export default function JuicesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Nutrition object states
  const [calories, setCalories] = useState<number>(0);
  const [proteins, setProteins] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);

  const [prepTime, setPrepTime] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>('Fácil');
  const [dietType, setDietType] = useState('Detox');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [isPremium, setIsPremium] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'juices'));
        const list: Recipe[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.deletedAt) {
            list.push({
              id: docSnap.id,
              title: data.title || '',
              description: data.description || '',
              imageUrl: data.imageUrl || '',
              nutritionalValues: data.nutritionalValues || { calories: 0, proteins: 0, carbs: 0, fats: 0, fiber: 0 },
              prepTime: Number(data.prepTime) || 10,
              difficulty: data.difficulty || 'Fácil',
              dietType: data.dietType || 'Detox',
              ingredients: data.ingredients || [],
              benefits: data.benefits || [],
              isPremium: data.isPremium === true,
              viewsCount: Number(data.viewsCount) || 0
            });
          }
        });
        setRecipes(list);
      } catch (err) {
        console.error('Error loading recipes:', err);
        toast.error('Error al cargar catálogo de recetas');
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCalories(0);
    setProteins(0);
    setCarbs(0);
    setFats(0);
    setFiber(0);
    setPrepTime(10);
    setDifficulty('Fácil');
    setDietType('Detox');
    setIngredients(['1 manzana verde', '1 tallo de apio', 'Jugo de 1 limón']);
    setBenefits(['Excelente desintoxicante natural', 'Aporta energía limpia']);
    setIsPremium(false);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipe) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setImageUrl(r.imageUrl);
    setCalories(r.nutritionalValues.calories);
    setProteins(r.nutritionalValues.proteins);
    setCarbs(r.nutritionalValues.carbs);
    setFats(r.nutritionalValues.fats);
    setFiber(r.nutritionalValues.fiber);
    setPrepTime(r.prepTime);
    setDifficulty(r.difficulty);
    setDietType(r.dietType);
    setIngredients(r.ingredients.length > 0 ? [...r.ingredients] : ['']);
    setBenefits(r.benefits.length > 0 ? [...r.benefits] : ['']);
    setIsPremium(r.isPremium);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated.length > 0 ? updated : ['']);
  };
  const handleIngredientChange = (idx: number, val: string) => {
    const updated = [...ingredients];
    updated[idx] = val;
    setIngredients(updated);
  };

  const handleAddBenefit = () => setBenefits([...benefits, '']);
  const handleRemoveBenefit = (index: number) => {
    const updated = benefits.filter((_, i) => i !== index);
    setBenefits(updated.length > 0 ? updated : ['']);
  };
  const handleBenefitChange = (idx: number, val: string) => {
    const updated = [...benefits];
    updated[idx] = val;
    setBenefits(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadImage = () => {
    if (!uploadFile) {
      toast.error('Selecciona una imagen de receta');
      return;
    }
    setUploading(true);
    const fileRef = ref(storage, `recipes/${Date.now()}_${uploadFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error('Recipe image upload failed:', error);
        toast.error('Error al subir imagen a Storage');
        setUploading(false);
      }, 
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadUrl);
        toast.success('Imagen de receta subida con éxito');
        setUploading(false);
        setUploadFile(null);
        setUploadProgress(0);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error('Título e Imagen son obligatorios');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando receta...');

    try {
      const cleanIngredients = ingredients.map(i => i.trim()).filter(i => i !== '');
      const cleanBenefits = benefits.map(b => b.trim()).filter(b => b !== '');
      const id = editingId || `juice_${Date.now()}`;
      const docRef = doc(db, 'juices', id);

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        nutritionalValues: {
          calories: Number(calories),
          proteins: Number(proteins),
          carbs: Number(carbs),
          fats: Number(fats),
          fiber: Number(fiber)
        },
        prepTime: Number(prepTime),
        difficulty,
        dietType,
        ingredients: cleanIngredients,
        benefits: cleanBenefits,
        isPremium,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(docRef, recipeData);

        // Audit Log
        const prev = recipes.find(r => r.id === editingId);
        await logAdminAction('UPDATE', 'juices', id, {
          description: `Actualizó receta/jugo: ${title}`,
          previousValues: prev,
          newValues: recipeData
        });

        setRecipes(recipes.map(r => r.id === editingId ? { ...r, ...recipeData } : r));
        toast.success('Receta actualizada correctamente', { id: toastId });
      } else {
        const fullData = {
          ...recipeData,
          viewsCount: 0,
          createdAt: new Date()
        };
        await setDoc(docRef, fullData);

        // Audit Log
        await logAdminAction('CREATE', 'juices', id, {
          description: `Creó receta/jugo: ${title}`,
          newValues: fullData
        });

        setRecipes([...recipes, { id, ...fullData }]);
        toast.success('Receta agregada correctamente', { id: toastId });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      toast.error('Error al guardar receta: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta receta? (Se aplicará borrado lógico/soft delete)')) {
      return;
    }

    const toastId = toast.loading('Eliminando receta...');
    try {
      const docRef = doc(db, 'juices', id);
      const deletedAt = new Date();
      await updateDoc(docRef, { deletedAt });

      // Audit Log
      const prev = recipes.find(r => r.id === id);
      await logAdminAction('DELETE', 'juices', id, {
        description: `Eliminación lógica de receta: ${prev?.title}`,
        previousValues: prev,
        newValues: { deletedAt }
      });

      setRecipes(recipes.filter(r => r.id !== id));
      toast.success('Receta eliminada correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      toast.error('Error al eliminar receta: ' + err.message, { id: toastId });
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.dietType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Recetas y Jugos Verdes</h1>
          <p className="text-sm text-ink-500 mt-1">Ingresa recetas saludables detallando ingredientes, beneficios y tablas nutricionales.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <Plus size={18} />
          Nueva Receta
        </button>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={16} />
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
          placeholder="Buscar recetas o tipo de dieta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Droplet className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin recetas encontradas</p>
          <p className="text-sm">Agrega una nueva receta para expandir el catálogo saludable de la app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((r) => (
            <div key={r.id} className="border border-ink-200 bg-white flex flex-col justify-between hover:border-[#008000] transition-all overflow-hidden">
              <div className="relative aspect-video bg-ink-50 border-b border-ink-200">
                <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase bg-ink-900 text-white border border-white">
                  {r.dietType}
                </span>
                <span className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-ink-900 border border-ink-200 shadow-sm" title={r.isPremium ? 'Membresía Premium Requerida' : 'Acceso Libre'}>
                  {r.isPremium ? <Lock size={14} className="text-amber-600" /> : <Unlock size={14} className="text-[#008000]" />}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-ink-900 text-base mb-1">{r.title}</h3>
                  <p className="text-xs text-ink-500 line-clamp-2 mb-4">{r.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center bg-ink-50 p-2.5 border border-ink-200 mb-4">
                    <div>
                      <span className="block text-[10px] font-bold text-ink-500 uppercase">Calorías</span>
                      <span className="text-xs font-extrabold text-ink-800">{r.nutritionalValues.calories} kcal</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-ink-500 uppercase">Preparación</span>
                      <span className="text-xs font-extrabold text-ink-800 flex items-center justify-center gap-1">
                        <Clock size={11} /> {r.prepTime} min
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-ink-500 uppercase">Dificultad</span>
                      <span className="text-xs font-extrabold text-ink-800">{r.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 mt-auto">
                  <button
                    onClick={() => openEditModal(r)}
                    className="px-2.5 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal (Dropbox Layout) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Receta Saludable' : 'Crear Nueva Receta'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">Detalla la composición nutricional, los ingredientes y preparación de la receta.</p>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título de la Receta</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="ej. Súper Jugo Verde Energizante"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Categoría de Dieta</label>
                  <select
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value)}
                    disabled={saving}
                  >
                    <option value="Detox">Desintoxicante (Detox)</option>
                    <option value="Energía">Energizante</option>
                    <option value="Digestión">Digestión Saludable</option>
                    <option value="Inmunidad">Inmunológico Booster</option>
                    <option value="Relajación">Anti-estrés / Relax</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Descripción Corta / Beneficios Generales</label>
                <textarea
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900 h-20 resize-none"
                  placeholder="Detalla de qué trata la receta, beneficios primarios y recomendaciones de consumo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Upload image console */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Imagen de Presentación</span>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="recipeImageFile"
                    disabled={uploading || saving}
                  />
                  <label
                    htmlFor="recipeImageFile"
                    className="flex-1 p-2.5 bg-white border border-ink-300 outline-none cursor-pointer text-xs font-bold text-ink-700 hover:bg-ink-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UploadCloud size={16} />
                    {uploadFile ? uploadFile.name : 'Seleccionar Archivo Local'}
                  </label>
                  {uploadFile && (
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs transition-colors shrink-0"
                      disabled={uploading || saving}
                    >
                      {uploading ? `Subiendo ${uploadProgress}%` : 'Subir'}
                    </button>
                  )}
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-ink-500 uppercase mb-1">O escribe/pega un enlace de imagen externo:</span>
                  <input
                    type="url"
                    className="w-full p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs font-mono text-ink-900"
                    placeholder="https://ejemplo.com/jugo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={uploading || saving}
                  />
                </div>
              </div>

              {/* Advanced info: PrepTime, difficulty and lock toggler */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Tiempo Prep (mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="10"
                    required
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Dificultad</label>
                  <select
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    disabled={saving}
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Medio">Medio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Privacidad / Locker</label>
                  <div className="flex items-center gap-2 h-10 select-none">
                    <input
                      type="checkbox"
                      id="isPremiumRecipe"
                      className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      disabled={saving}
                    />
                    <label htmlFor="isPremiumRecipe" className="text-xs font-bold text-ink-700 flex items-center gap-1 cursor-pointer">
                      <Lock size={12} className="text-amber-600" /> Premium Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Nutritional Table */}
              <div className="border border-ink-200 p-4">
                <span className="text-xs font-bold text-ink-700 uppercase block mb-3 flex items-center gap-1">
                  <Activity size={14} className="text-[#008000]" /> Composición e Información Nutricional
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Calorías (kcal)</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Proteínas (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      value={proteins}
                      onChange={(e) => setProteins(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Carbohidratos (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Grasas (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      value={fats}
                      onChange={(e) => setFats(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Fibra (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      value={fiber}
                      onChange={(e) => setFiber(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic list for Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase">Ingredientes Requeridos</label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Añadir Ingrediente
                  </button>
                </div>
                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                        placeholder="ej. 2 rodajas gruesas de piña"
                        value={ing}
                        onChange={(e) => handleIngredientChange(idx, e.target.value)}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic list for Benefits */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase">Beneficios Específicos para la Salud</label>
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Añadir Beneficio
                  </button>
                </div>
                <div className="space-y-2">
                  {benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                        placeholder="ej. Disminuye la retención de líquidos corporales"
                        value={ben}
                        onChange={(e) => handleBenefitChange(idx, e.target.value)}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(idx)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <MinusCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>
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
                  disabled={saving || uploading}
                >
                  {saving ? 'Guardando...' : 'Guardar Receta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
