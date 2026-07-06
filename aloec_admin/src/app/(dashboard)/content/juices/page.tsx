'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  Unlock,
  UploadCloud,
  Clock,
  Activity,
  PlusCircle,
  MinusCircle,
  Tag,
  Eye,
  EyeOff,
  Film,
  FolderOpen,
  AlertTriangle,
  X,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface NutritionalValues {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  vitamins: string[];
  minerals: string[];
}

type RecipeCategory = 'green_juice' | 'salad' | 'breakfast' | 'snack' | 'main_dish' | 'smoothie' | 'other';

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  green_juice: 'Jugo Verde',
  salad: 'Ensalada',
  breakfast: 'Desayuno',
  snack: 'Snack / Merienda',
  main_dish: 'Plato Principal',
  smoothie: 'Batido / Smoothie',
  other: 'Otro',
};

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  videoSource?: 'youtube' | 'vimeo' | 'upload' | 'onedrive' | '';
  nutritionalValues: NutritionalValues;
  prepTime: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  category: RecipeCategory;
  tags: string[];
  ingredients: string[];
  preparation: string;
  benefits: string[];
  isPremium: boolean;
  isActive: boolean;
  order: number;
  viewsCount: number;
  deletedAt?: any;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preparation, setPreparation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [calories, setCalories] = useState<number>(0);
  const [proteins, setProteins] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  const [vitamins, setVitamins] = useState<string[]>(['']);
  const [minerals, setMinerals] = useState<string[]>(['']);

  const [prepTime, setPrepTime] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>('Fácil');
  const [category, setCategory] = useState<RecipeCategory>('green_juice');
  const [tags, setTags] = useState<string[]>(['']);
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [isPremium, setIsPremium] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Video fields
  const [videoUrl, setVideoUrl] = useState('');
  const [videoSource, setVideoSource] = useState<'youtube' | 'vimeo' | 'upload' | 'onedrive' | ''>('');
  const [videoUploadFile, setVideoUploadFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  // Library
  interface StoredVideo { name: string; fullPath: string; downloadUrl: string; }
  const [storedVideos, setStoredVideos] = useState<StoredVideo[]>([]);
  const [loadingVideoLibrary, setLoadingVideoLibrary] = useState(false);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'recipes'));
        const list: Recipe[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.deletedAt) {
            list.push({
              id: docSnap.id,
              title: data.title || '',
              description: data.description || '',
              imageUrl: data.imageUrl || '',
              nutritionalValues: {
                calories: data.nutritionalValues?.calories || 0,
                proteins: data.nutritionalValues?.proteins || 0,
                carbs: data.nutritionalValues?.carbs || 0,
                fats: data.nutritionalValues?.fats || 0,
                fiber: data.nutritionalValues?.fiber || 0,
                vitamins: data.nutritionalValues?.vitamins || [],
                minerals: data.nutritionalValues?.minerals || [],
              },
              prepTime: Number(data.prepTime) || 10,
              difficulty: data.difficulty || 'Fácil',
              category: data.category || 'green_juice',
              tags: data.tags || [],
              ingredients: data.ingredients || [],
              preparation: data.preparation || '',
              benefits: data.benefits || [],
              isPremium: data.isPremium === true,
              isActive: data.isActive !== false,
              order: Number(data.order) || 0,
              viewsCount: Number(data.viewsCount) || 0,
            });
          }
        });
        list.sort((a, b) => a.order - b.order);
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
    setPreparation('');
    setImageUrl('');
    setVideoUrl('');
    setVideoSource('');
    setVideoUploadFile(null);
    setVideoUploadProgress(0);
    setShowVideoLibrary(false);
    setCalories(0);
    setProteins(0);
    setCarbs(0);
    setFats(0);
    setFiber(0);
    setVitamins(['']);
    setMinerals(['']);
    setPrepTime(10);
    setDifficulty('Fácil');
    setCategory('green_juice');
    setTags(['']);
    setIngredients(['1 manzana verde', '1 tallo de apio', 'Jugo de 1 limón']);
    setBenefits(['Excelente desintoxicante natural']);
    setIsPremium(false);
    setIsActive(true);
    setOrder(recipes.length);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipe) => {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description);
    setPreparation(r.preparation || '');
    setImageUrl(r.imageUrl);
    setVideoUrl(r.videoUrl || '');
    setVideoSource(r.videoSource || '');
    setVideoUploadFile(null);
    setVideoUploadProgress(0);
    setShowVideoLibrary(false);
    setCalories(r.nutritionalValues.calories);
    setProteins(r.nutritionalValues.proteins);
    setCarbs(r.nutritionalValues.carbs);
    setFats(r.nutritionalValues.fats);
    setFiber(r.nutritionalValues.fiber);
    setVitamins(r.nutritionalValues.vitamins.length > 0 ? [...r.nutritionalValues.vitamins] : ['']);
    setMinerals(r.nutritionalValues.minerals.length > 0 ? [...r.nutritionalValues.minerals] : ['']);
    setPrepTime(r.prepTime);
    setDifficulty(r.difficulty);
    setCategory(r.category);
    setTags(r.tags.length > 0 ? [...r.tags] : ['']);
    setIngredients(r.ingredients.length > 0 ? [...r.ingredients] : ['']);
    setBenefits(r.benefits.length > 0 ? [...r.benefits] : ['']);
    setIsPremium(r.isPremium);
    setIsActive(r.isActive);
    setOrder(r.order);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  // Dynamic list helpers
  const listHelpers = (setter: React.Dispatch<React.SetStateAction<string[]>>) => ({
    add: () => setter(prev => [...prev, '']),
    remove: (idx: number) => setter(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.length > 0 ? updated : [''];
    }),
    update: (idx: number, val: string) => setter(prev => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    }),
  });

  const ingredientH = listHelpers(setIngredients);
  const benefitH = listHelpers(setBenefits);
  const tagH = listHelpers(setTags);
  const vitaminH = listHelpers(setVitamins);
  const mineralH = listHelpers(setMinerals);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`La imagen es demasiado grande. Maximo ${maxSizeMB}MB permitido.`);
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadImage = () => {
    if (!uploadFile) { toast.error('Selecciona una imagen'); return; }
    setUploading(true);
    const safeName = uploadFile.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\s+/g, '_');
    const fileRef = ref(storage, `recipes/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);
    uploadTask.on('state_changed',
      (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (error) => {
        console.error(error);
        const msg = error.code === 'storage/unauthorized'
          ? 'Permiso denegado. Verifica las reglas de Storage.'
          : `Error: ${error.message || 'desconocido'}`;
        toast.error(`Error al subir imagen: ${msg}`);
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setImageUrl(downloadUrl);
        toast.success('Imagen subida con exito');
        setUploading(false);
        setUploadFile(null);
        setUploadProgress(0);
      }
    );
  };

  // ─── Video upload for recipes ─────────────────────────────────────────────
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 200 * 1024 * 1024) {
        toast.error('El video es demasiado grande. Máximo 200 MB permitido.');
        return;
      }
      setVideoUploadFile(file);
    }
  };

  const handleUploadVideo = () => {
    if (!videoUploadFile) { toast.error('Selecciona un archivo de video'); return; }
    setVideoUploading(true);
    const safeName = videoUploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
    const fileRef = ref(storage, `lessons_videos/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, videoUploadFile);
    uploadTask.on('state_changed',
      (snapshot) => setVideoUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (error) => {
        toast.error(`Error al subir video: ${error.message}`);
        setVideoUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setVideoUrl(url);
        setVideoSource('upload');
        toast.success('Video subido correctamente a la biblioteca compartida');
        setVideoUploading(false);
        setVideoUploadFile(null);
        setVideoUploadProgress(0);
      }
    );
  };

  const loadVideoLibrary = async () => {
    setLoadingVideoLibrary(true);
    try {
      // 1. Extraer URLs únicas de videoSource === 'upload' de las recetas ya cargadas en memoria
      const seenUrls = new Set<string>();
      const fromRecipes: StoredVideo[] = recipes
        .filter((r) => r.videoSource === 'upload' && r.videoUrl)
        .reduce<StoredVideo[]>((acc, r) => {
          if (!seenUrls.has(r.videoUrl!)) {
            seenUrls.add(r.videoUrl!);
            const urlParts = decodeURIComponent(r.videoUrl!).split('/');
            const rawName = urlParts[urlParts.length - 1].split('?')[0];
            const displayName = rawName.replace(/^lessons_videos%2F\d+_/, '').replace(/^\d+_/, '');
            acc.push({
              name: displayName || rawName,
              fullPath: rawName,
              downloadUrl: r.videoUrl!,
            });
          }
          return acc;
        }, []);

      // 2. Intentar listar directamente de la carpeta compartida 'lessons_videos' en Firebase Storage
      let fromStorage: StoredVideo[] = [];
      try {
        const folderRef = ref(storage, 'lessons_videos');
        const result = await listAll(folderRef);
        fromStorage = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const displayName = itemRef.name.replace(/^\d+_/, '');
            return {
              name: displayName,
              fullPath: itemRef.fullPath,
              downloadUrl: url,
            };
          })
        );
        // Filtrar duplicados que ya vimos en fromRecipes
        fromStorage = fromStorage.filter((v) => !seenUrls.has(v.downloadUrl));
      } catch (err) {
        console.warn('Storage listAll fallback to Firestore-only:', err);
      }

      const allVideos = [...fromRecipes, ...fromStorage];
      // Ordenar alfabéticamente
      allVideos.sort((a, b) => a.name.localeCompare(b.name));
      setStoredVideos(allVideos);
      setShowVideoLibrary(true);

      if (allVideos.length === 0) {
        toast('No hay videos subidos aún en la biblioteca. Sube el primero desde este formulario.');
      }
    } catch (err) {
      console.error('Video library error:', err);
      toast.error('No se pudo cargar la biblioteca de videos');
    } finally {
      setLoadingVideoLibrary(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields: string[] = [];
    if (!title.trim()) missingFields.push('Titulo');

    if (missingFields.length > 0) {
      toast.error(`Falta: ${missingFields.join(' y ')}. Completa los campos obligatorios.`);
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando receta...');

    try {
      const clean = (arr: string[]) => arr.map(s => s.trim()).filter(s => s !== '');
      const id = editingId || `recipe_${Date.now()}`;
      const docRef = doc(db, 'recipes', id);

      const recipeData: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        preparation: preparation.trim(),
        imageUrl: imageUrl.trim(),
        ...(videoUrl.trim() ? { videoUrl: videoUrl.trim(), videoSource } : {}),
        nutritionalValues: {
          calories: Number(calories),
          proteins: Number(proteins),
          carbs: Number(carbs),
          fats: Number(fats),
          fiber: Number(fiber),
          vitamins: clean(vitamins),
          minerals: clean(minerals),
        },
        prepTime: Number(prepTime),
        difficulty,
        category,
        tags: clean(tags),
        ingredients: clean(ingredients),
        benefits: clean(benefits),
        isPremium,
        isActive,
        order: Number(order),
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(docRef, recipeData);
        const prev = recipes.find(r => r.id === editingId);
        await logAdminAction('UPDATE', 'recipes', id, {
          description: `Actualizó receta: ${title}`,
          previousValues: prev,
          newValues: recipeData,
        });
        setRecipes(recipes.map(r => r.id === editingId ? { ...r, ...recipeData } : r));
        toast.success('Receta actualizada', { id: toastId });
      } else {
        const fullData = { ...recipeData, viewsCount: 0, createdAt: new Date() };
        await setDoc(docRef, fullData);
        await logAdminAction('CREATE', 'recipes', id, {
          description: `Creó receta: ${title}`,
          newValues: fullData,
        });
        setRecipes([...recipes, { id, ...fullData } as unknown as Recipe]);

        toast.success('Receta creada', { id: toastId });
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
    if (!window.confirm('¿Eliminar esta receta? (borrado lógico)')) return;
    const toastId = toast.loading('Eliminando...');
    try {
      await updateDoc(doc(db, 'recipes', id), { deletedAt: new Date() });
      const prev = recipes.find(r => r.id === id);
      await logAdminAction('DELETE', 'recipes', id, {
        description: `Eliminó receta: ${prev?.title}`,
        previousValues: prev,
        newValues: { deletedAt: new Date() },
      });
      setRecipes(recipes.filter(r => r.id !== id));
      toast.success('Receta eliminada', { id: toastId });
    } catch (err: any) {
      toast.error('Error: ' + err.message, { id: toastId });
    }
  };

  const filteredRecipes = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORY_LABELS[r.category].toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const DynamicList = ({ label, items, helpers, placeholder }: {
    label: string;
    items: string[];
    helpers: { add: () => void; remove: (i: number) => void; update: (i: number, v: string) => void };
    placeholder: string;
  }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-bold text-ink-700 uppercase">{label}</label>
        <button type="button" onClick={helpers.add} className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1">
          <PlusCircle size={14} /> Añadir
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
              placeholder={placeholder}
              value={item}
              onChange={(e) => helpers.update(idx, e.target.value)}
              disabled={saving}
            />
            <button type="button" onClick={() => helpers.remove(idx)} className="text-red-500 hover:text-red-700 shrink-0">
              <MinusCircle size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Catálogo de Recetas</h1>
          <p className="text-sm text-ink-500 mt-1">Gestiona recetas saludables: jugos verdes, ensaladas, batidos, platos principales y más.</p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none">
          <Plus size={18} /> Nueva Receta
        </button>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={16} />
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
          placeholder="Buscar por nombre, categoría o tag..."
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
          <UtensilsCrossed className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin recetas encontradas</p>
          <p className="text-sm">Agrega una nueva receta para expandir el catálogo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((r) => (
            <div key={r.id} className={`border bg-white flex flex-col justify-between hover:border-[#008000] transition-all overflow-hidden ${r.isActive ? 'border-ink-200' : 'border-red-200 opacity-60'}`}>
              <div className="relative aspect-video bg-ink-50 border-b border-ink-200">
                {r.imageUrl && <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />}
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase bg-ink-900 text-white border border-white">
                  {CATEGORY_LABELS[r.category]}
                </span>
                <div className="absolute top-3 right-3 flex gap-1">
                  {!r.isActive && (
                    <span className="p-1.5 rounded-full bg-red-100 text-red-600 border border-red-200" title="Inactiva">
                      <EyeOff size={14} />
                    </span>
                  )}
                  <span className="p-1.5 rounded-full bg-white text-ink-900 border border-ink-200 shadow-sm" title={r.isPremium ? 'Premium' : 'Libre'}>
                    {r.isPremium ? <Lock size={14} className="text-amber-600" /> : <Unlock size={14} className="text-[#008000]" />}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-ink-900 text-base mb-1">{r.title}</h3>
                  <p className="text-xs text-ink-500 line-clamp-2 mb-3">{r.description}</p>

                  {r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {r.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-ink-100 text-ink-600 border border-ink-200">
                          <Tag size={9} /> {tag}
                        </span>
                      ))}
                      {r.tags.length > 4 && <span className="text-[10px] text-ink-400">+{r.tags.length - 4}</span>}
                    </div>
                  )}

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
                  <button onClick={() => openEditModal(r)} className="px-2.5 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs transition-colors flex items-center gap-1.5">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-ink-300 w-full max-w-3xl my-8 relative">
            <div className="p-6 border-b border-ink-200">
              <h3 className="text-lg font-bold text-ink-900">
                {editingId ? 'Editar Receta' : 'Crear Nueva Receta'}
              </h3>
              <p className="text-xs text-ink-500 mt-1">Detalla ingredientes, preparación, información nutricional y categorización.</p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Title + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título *</label>
                  <input type="text" required className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm" placeholder="ej. Jugo Verde Energizante" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Categoría *</label>
                  <select className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm" value={category} onChange={(e) => setCategory(e.target.value as RecipeCategory)} disabled={saving}>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Descripción Corta</label>
                <textarea className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm h-16 resize-none" placeholder="Beneficios generales y recomendaciones..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
              </div>

              {/* Image Upload */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase flex items-center gap-1">
                  Imagen de Presentacion
                </span>
                <div className="flex gap-2">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="recipeImageFile" disabled={uploading || saving} />
                  <label htmlFor="recipeImageFile" className="flex-1 p-2.5 bg-white border border-ink-300 cursor-pointer text-xs font-bold text-ink-700 hover:bg-ink-50 flex items-center justify-center gap-1.5 transition-colors">
                    <UploadCloud size={16} /> {uploadFile ? uploadFile.name : 'Seleccionar Archivo'}
                  </label>
                  {uploadFile && (
                    <button type="button" onClick={handleUploadImage} className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs shrink-0" disabled={uploading || saving}>
                      {uploading ? `${uploadProgress}%` : 'Subir'}
                    </button>
                  )}
                </div>
                {uploadFile && (
                  <p className="text-[10px] text-amber-700 font-bold">Haz clic en Subir para cargar la imagen antes de guardar.</p>
                )}
                <div>
                  <span className="block text-[10px] font-bold text-ink-500 uppercase mb-1">O pega una URL externa:</span>
                  <input type="url" className="w-full p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs font-mono" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={uploading || saving} />
                </div>
                {imageUrl.trim() && (
                  <div className="mt-2">
                    <span className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Vista previa:</span>
                    <img src={imageUrl.trim()} alt="Preview" className="w-full h-32 object-cover border border-ink-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>

              {/* ─── Video Section ─────────────────────────────────────── */}
              <div className="border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-700 uppercase flex items-center gap-1.5">
                    <Video size={14} className="text-emerald-600" /> Video de la Receta
                    <span className="text-[10px] font-normal text-ink-400 normal-case">(opcional)</span>
                  </span>
                  {videoUrl && (
                    <button type="button" onClick={() => { setVideoUrl(''); setVideoSource(''); }}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                      <X size={11} /> Quitar video
                    </button>
                  )}
                </div>

                {/* Source selector */}
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { value: 'youtube',  label: '▶ YouTube',   active: 'border-red-300 bg-red-50 text-red-700' },
                    { value: 'vimeo',    label: '◈ Vimeo',     active: 'border-blue-300 bg-blue-50 text-blue-700' },
                    { value: 'onedrive', label: '☁ OneDrive',  active: 'border-sky-300 bg-sky-50 text-sky-700' },
                    { value: 'upload',   label: '⬆ Storage',   active: 'border-purple-300 bg-purple-50 text-purple-700' },
                  ] as const).map((src) => (
                    <label key={src.value}
                      className={`flex items-center justify-center p-2 border rounded-sm cursor-pointer text-[10px] font-bold select-none transition-all ${
                        videoSource === src.value ? src.active + ' border-2' : 'border-ink-200 bg-white text-ink-500 hover:bg-ink-50'
                      }`}>
                      <input type="radio" name="videoSource" value={src.value} className="sr-only"
                        checked={videoSource === src.value}
                        onChange={() => { setVideoSource(src.value); setVideoUrl(''); }}
                      />
                      {src.label}
                    </label>
                  ))}
                </div>

                {/* URL input — YouTube / Vimeo / OneDrive */}
                {(videoSource === 'youtube' || videoSource === 'vimeo' || videoSource === 'onedrive') && (
                  <div>
                    <input type="url" className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs font-mono"
                      placeholder={
                        videoSource === 'youtube'  ? 'https://www.youtube.com/watch?v=...' :
                        videoSource === 'vimeo'    ? 'https://vimeo.com/...' :
                                                    'https://1drv.ms/v/... o embed de OneDrive'
                      }
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={saving}
                    />
                    {videoUrl && (
                      <p className="text-[10px] text-green-700 font-bold flex items-center gap-1 mt-1.5">
                        <CheckCircle2 size={11} /> URL guardada — el video se reproducirá dentro de la app
                      </p>
                    )}
                  </div>
                )}

                {/* Firebase Storage upload */}
                {videoSource === 'upload' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-700 font-bold">Firebase Storage</span>
                      <button type="button" onClick={loadVideoLibrary} disabled={loadingVideoLibrary || videoUploading}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-purple-300 text-purple-700 text-[10px] font-bold hover:bg-purple-50 rounded-sm disabled:opacity-50">
                        <FolderOpen size={11} />{loadingVideoLibrary ? 'Cargando...' : 'Usar existente'}
                      </button>
                    </div>

                    {/* Library picker */}
                    {showVideoLibrary && (
                      <div className="border border-purple-200 bg-white rounded-sm overflow-hidden">
                        <div className="flex items-center justify-between px-2 py-1.5 bg-purple-50 border-b border-purple-100">
                          <span className="text-[10px] font-bold text-purple-700">{storedVideos.length} videos en Storage</span>
                          <button type="button" onClick={() => setShowVideoLibrary(false)} className="text-purple-400 hover:text-purple-700"><X size={12} /></button>
                        </div>
                        <div className="max-h-36 overflow-y-auto divide-y divide-purple-50">
                          {storedVideos.length === 0 ? (
                            <p className="text-[10px] text-ink-400 p-2 text-center">No hay videos en Storage</p>
                          ) : storedVideos.map((v) => (
                            <button key={v.fullPath} type="button"
                              onClick={() => { setVideoUrl(v.downloadUrl); setShowVideoLibrary(false); toast.success('Video seleccionado'); }}
                              className={`w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-purple-50 ${videoUrl === v.downloadUrl ? 'bg-purple-100' : ''}`}>
                              <Film size={12} className="text-purple-400 shrink-0" />
                              <span className="text-[10px] text-ink-700 truncate">{v.name.replace(/^\d+_/, '')}</span>
                              {videoUrl === v.downloadUrl && <CheckCircle2 size={11} className="text-purple-600 ml-auto shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input type="file" accept="video/*" onChange={handleVideoFileChange} className="hidden" id="recipeVideoFile" disabled={videoUploading || saving} />
                      <label htmlFor="recipeVideoFile"
                        className="flex-1 p-2 bg-white border border-ink-300 cursor-pointer text-[10px] font-bold text-ink-700 hover:bg-ink-50 flex items-center justify-center gap-1 transition-colors">
                        <UploadCloud size={13} />{videoUploadFile ? videoUploadFile.name : 'Seleccionar video (.mp4/.mov)'}
                      </label>
                      {videoUploadFile && (
                        <button type="button" onClick={handleUploadVideo}
                          className="px-3 py-1.5 bg-[#008000] hover:bg-[#006400] text-white font-bold text-[10px] shrink-0" disabled={videoUploading || saving}>
                          {videoUploading ? `${videoUploadProgress}%` : 'Subir'}
                        </button>
                      )}
                    </div>
                    {videoUrl && !videoUploadFile && (
                      <p className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Video listo — se reproducirá dentro de la app
                      </p>
                    )}
                  </div>
                )}

                {!videoSource && (
                  <p className="text-[10px] text-ink-400 text-center py-1">
                    Selecciona la fuente del video para agregar uno a esta receta
                  </p>
                )}
              </div>

              {/* PrepTime, Difficulty, Order, Active, Premium */}

              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Tiempo (min)</label>
                  <input type="number" min="1" className="w-full p-2.5 border border-ink-300 outline-none focus:border-ink-900 text-sm" value={prepTime} onChange={(e) => setPrepTime(Number(e.target.value))} disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Dificultad</label>
                  <select className="w-full p-2.5 border border-ink-300 outline-none focus:border-ink-900 text-sm" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} disabled={saving}>
                    <option value="Fácil">Fácil</option>
                    <option value="Medio">Medio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Orden</label>
                  <input type="number" min="0" className="w-full p-2.5 border border-ink-300 outline-none focus:border-ink-900 text-sm" value={order} onChange={(e) => setOrder(Number(e.target.value))} disabled={saving} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Visible</label>
                  <div className="flex items-center gap-2 h-10">
                    <input type="checkbox" id="isActiveRecipe" className="h-4 w-4 rounded border-ink-300 text-[#008000]" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={saving} />
                    <label htmlFor="isActiveRecipe" className="text-xs font-bold text-ink-700 flex items-center gap-1 cursor-pointer">
                      {isActive ? <Eye size={12} /> : <EyeOff size={12} />} {isActive ? 'Activa' : 'Oculta'}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Premium</label>
                  <div className="flex items-center gap-2 h-10">
                    <input type="checkbox" id="isPremiumRecipe" className="h-4 w-4 rounded border-ink-300 text-[#008000]" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} disabled={saving} />
                    <label htmlFor="isPremiumRecipe" className="text-xs font-bold text-ink-700 flex items-center gap-1 cursor-pointer">
                      <Lock size={12} className="text-amber-600" /> Premium
                    </label>
                  </div>
                </div>
              </div>

              {/* Nutritional Info */}
              <div className="border border-ink-200 p-4 space-y-4">
                <span className="text-xs font-bold text-ink-700 uppercase flex items-center gap-1">
                  <Activity size={14} className="text-[#008000]" /> Información Nutricional
                </span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Calorías (kcal)</label>
                    <input type="number" className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Proteínas (g)</label>
                    <input type="number" step="0.1" className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900" value={proteins} onChange={(e) => setProteins(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Carbohidratos (g)</label>
                    <input type="number" step="0.1" className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Grasas (g)</label>
                    <input type="number" step="0.1" className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900" value={fats} onChange={(e) => setFats(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Fibra (g)</label>
                    <input type="number" step="0.1" className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900" value={fiber} onChange={(e) => setFiber(Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DynamicList label="Vitaminas" items={vitamins} helpers={vitaminH} placeholder="ej. Vitamina C" />
                  <DynamicList label="Minerales" items={minerals} helpers={mineralH} placeholder="ej. Hierro" />
                </div>
              </div>

              {/* Ingredients */}
              <DynamicList label="Ingredientes" items={ingredients} helpers={ingredientH} placeholder="ej. 2 rodajas de piña" />

              {/* Preparation */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Instrucciones de Preparación</label>
                <textarea className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm h-24 resize-none" placeholder="Paso 1: Lavar y pelar los ingredientes...&#10;Paso 2: Licuar a velocidad media...&#10;Paso 3: Servir frío..." value={preparation} onChange={(e) => setPreparation(e.target.value)} disabled={saving} />
              </div>

              {/* Benefits */}
              <DynamicList label="Beneficios para la Salud" items={benefits} helpers={benefitH} placeholder="ej. Mejora la digestión" />

              {/* Tags */}
              <DynamicList label="Tags de Búsqueda" items={tags} helpers={tagH} placeholder="ej. detox, proteína, bajo en calorías" />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
                <button type="button" className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm" disabled={saving || uploading}>
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
