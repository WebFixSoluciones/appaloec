'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Film, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Lock, 
  Unlock, 
  UploadCloud, 
  BookOpen, 
  FileText,
  User,
  PlusCircle,
  MinusCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  name: string;
  url: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  featuredImageUrl: string;
  totalHours: number;
  difficulty: string;
  category: string;
  instructor: {
    name: string;
    avatarUrl?: string;
  };
  resources: Resource[];
  lessonsCount: number;
  isPremium: boolean;
  deletedAt?: any;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // CRUD Form/Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [totalHours, setTotalHours] = useState<number>(5);
  const [difficulty, setDifficulty] = useState('Básico');
  const [category, setCategory] = useState('Nutrición');
  
  // Instructor nested fields
  const [instructorName, setInstructorName] = useState('');
  const [instructorAvatar, setInstructorAvatar] = useState('');

  // Resources attachment arrays
  const [resources, setResources] = useState<Resource[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'courses'));
        const list: Course[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.deletedAt) {
            list.push({
              id: docSnap.id,
              title: data.title || '',
              description: data.description || '',
              featuredImageUrl: data.featuredImageUrl || '',
              totalHours: Number(data.totalHours) || 0,
              difficulty: data.difficulty || 'Básico',
              category: data.category || 'Nutrición',
              instructor: data.instructor || { name: 'Especialista ALOEC' },
              resources: data.resources || [],
              lessonsCount: Number(data.lessonsCount) || 0,
              isPremium: data.isPremium === true
            });
          }
        });
        setCourses(list);
      } catch (err) {
        console.error('Error loading courses:', err);
        toast.error('Error al cargar catálogo de cursos');
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFeaturedImageUrl('');
    setTotalHours(5);
    setDifficulty('Básico');
    setCategory('Nutrición');
    setInstructorName('Dra. María Paz');
    setInstructorAvatar('https://placehold.co/150?text=MP');
    setResources([{ name: 'Guía práctica en PDF', url: '' }]);
    setIsPremium(false);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingId(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setFeaturedImageUrl(c.featuredImageUrl);
    setTotalHours(c.totalHours);
    setDifficulty(c.difficulty);
    setCategory(c.category);
    setInstructorName(c.instructor.name);
    setInstructorAvatar(c.instructor.avatarUrl || '');
    setResources(c.resources.length > 0 ? [...c.resources] : [{ name: '', url: '' }]);
    setIsPremium(c.isPremium);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleAddResource = () => setResources([...resources, { name: '', url: '' }]);
  const handleRemoveResource = (index: number) => {
    const updated = resources.filter((_, i) => i !== index);
    setResources(updated.length > 0 ? updated : [{ name: '', url: '' }]);
  };
  const handleResourceChange = (idx: number, field: 'name' | 'url', val: string) => {
    const updated = [...resources];
    updated[idx] = { ...updated[idx], [field]: val };
    setResources(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`La imagen es demasiado grande. Máximo ${maxSizeMB}MB permitido.`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen (JPG, PNG, WEBP).');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadImage = () => {
    if (!uploadFile) {
      toast.error('Selecciona una imagen de miniatura primero');
      return;
    }
    setUploading(true);
    const safeName = uploadFile.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\s+/g, '_');
    const fileRef = ref(storage, `courses/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error('Course cover upload failed:', error);
        const msg = error.code === 'storage/unauthorized'
          ? 'Permiso denegado. Verifica las reglas de Storage (firebase deploy --only storage).'
          : error.code === 'storage/canceled'
          ? 'Subida cancelada.'
          : error.code === 'storage/retry-limit-exceeded'
          ? 'Tiempo de espera agotado. Revisa tu conexion o el tamano del archivo.'
          : error.code === 'storage/quota-exceeded'
          ? 'Cuota de almacenamiento excedida en Firebase.'
          : error.message || 'Error desconocido al subir a Storage';
        toast.error(`Error al subir imagen: ${msg}`);
        setUploading(false);
      }, 
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setFeaturedImageUrl(downloadUrl);
        toast.success('Imagen de portada subida con exito');
        setUploading(false);
        setUploadFile(null);
        setUploadProgress(0);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !featuredImageUrl.trim()) {
      const missing: string[] = [];
      if (!title.trim()) missing.push('Titulo');
      if (!featuredImageUrl.trim()) missing.push('Imagen de portada');
      toast.error(`Falta: ${missing.join(' y ')}. Completa los campos obligatorios.`);
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando curso en el catálogo...');

    try {
      const cleanResources = resources.filter(r => r.name.trim() !== '' && r.url.trim() !== '');
      const id = editingId || `course_${Date.now()}`;
      const docRef = doc(db, 'courses', id);

      const courseData = {
        title: title.trim(),
        description: description.trim(),
        featuredImageUrl: featuredImageUrl.trim(),
        totalHours: Number(totalHours),
        difficulty,
        category,
        instructor: {
          name: instructorName.trim(),
          avatarUrl: instructorAvatar.trim()
        },
        resources: cleanResources,
        isPremium,
        lessonsCount: editingId ? courses.find(c => c.id === editingId)?.lessonsCount || 0 : 0,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(docRef, courseData);

        // Audit Log
        const prev = courses.find(c => c.id === editingId);
        await logAdminAction('UPDATE', 'courses', id, {
          description: `Actualizó curso de videoclases: ${title}`,
          previousValues: prev,
          newValues: courseData
        });

        setCourses(courses.map(c => c.id === editingId ? { ...c, ...courseData } : c));
        toast.success('Curso actualizado correctamente', { id: toastId });
      } else {
        const fullData = {
          ...courseData,
          createdAt: new Date()
        };
        await setDoc(docRef, fullData);

        // Audit Log
        await logAdminAction('CREATE', 'courses', id, {
          description: `Creó nuevo curso: ${title}`,
          newValues: fullData
        });

        setCourses([...courses, { id, ...fullData }]);
        toast.success('Curso creado correctamente', { id: toastId });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving course:', err);
      toast.error('Error al guardar curso: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso? (Se aplicará borrado lógico/soft delete)')) {
      return;
    }

    const toastId = toast.loading('Eliminando curso...');
    try {
      const docRef = doc(db, 'courses', id);
      const deletedAt = new Date();
      await updateDoc(docRef, { deletedAt });

      // Audit Log
      const prev = courses.find(c => c.id === id);
      await logAdminAction('DELETE', 'courses', id, {
        description: `Eliminó curso de salud (borrado lógico): ${prev?.title}`,
        previousValues: prev,
        newValues: { deletedAt }
      });

      setCourses(courses.filter(c => c.id !== id));
      toast.success('Curso eliminado correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error deleting course:', err);
      toast.error('Error al eliminar curso: ' + err.message, { id: toastId });
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Catálogo de Videocursos de Salud</h1>
          <p className="text-sm text-ink-500 mt-1">Crea y administra videocursos sobre nutrición, fitness mental y jugoterapia.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <Plus size={18} />
          Nuevo Curso
        </button>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={16} />
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
          placeholder="Buscar curso o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Film className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin cursos creados</p>
          <p className="text-sm">Publica tu primer curso e inserta lecciones para enriquecer la experiencia premium.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div key={c.id} className="border border-ink-200 bg-white flex flex-col justify-between hover:border-[#008000] transition-all overflow-hidden">
              
              <div className="relative aspect-video bg-ink-50 border-b border-ink-200">
                <img src={c.featuredImageUrl} alt={c.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase bg-ink-900 text-white border border-white">
                  {c.category}
                </span>
                <span className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-ink-900 border border-ink-200 shadow-sm" title={c.isPremium ? 'Membresía Premium Requerida' : 'Acceso Libre'}>
                  {c.isPremium ? <Lock size={14} className="text-amber-600" /> : <Unlock size={14} className="text-[#008000]" />}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-ink-900 text-base mb-1">{c.title}</h3>
                  <p className="text-xs text-ink-500 line-clamp-2 mb-4">{c.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-center bg-ink-50 p-2 border border-ink-200 mb-4 text-xs font-bold text-ink-800">
                    <div>
                      <span className="block text-[9px] font-bold text-ink-500 uppercase">Lecciones</span>
                      <span>{c.lessonsCount} clips</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-ink-500 uppercase">Duración</span>
                      <span className="flex items-center justify-center gap-0.5"><Clock size={11} /> {c.totalHours}h</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-ink-500 uppercase">Nivel</span>
                      <span>{c.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 border-t border-ink-100 pt-3">
                    {c.instructor.avatarUrl ? (
                      <img src={c.instructor.avatarUrl} alt={c.instructor.name} className="h-6 w-6 rounded-full object-cover border border-ink-200" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-ink-100 flex items-center justify-center text-ink-600">
                        <User size={12} />
                      </div>
                    )}
                    <span className="text-xs text-ink-700 font-bold">{c.instructor.name}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 mt-auto">
                  <button
                    onClick={() => openEditModal(c)}
                    className="px-2.5 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Curso' : 'Agregar Nuevo Curso'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">Detalla la estructura del videocurso y los recursos descargables adjuntos.</p>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título del Curso</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="ej. Fundamentos de Jugoterapia Orgánica"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Categoría del Curso</label>
                  <select
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={saving}
                  >
                    <option value="Nutrición">Nutrición & Alimentación</option>
                    <option value="Jugoterapia">Jugoterapia & Detox</option>
                    <option value="Mentalidad">Salud Mental & Hábitos</option>
                    <option value="Ejercicio">Entrenamiento Físico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Descripción Completa del Curso</label>
                <textarea
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900 h-20 resize-none"
                  placeholder="Explica qué aprenderán los usuarios en este curso, temario o estructura..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Cover cover upload console */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Imagen de Portada (Miniatura)</span>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="courseCoverFile"
                    disabled={uploading || saving}
                  />
                  <label
                    htmlFor="courseCoverFile"
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
                    placeholder="https://ejemplo.com/portada.jpg"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    disabled={uploading || saving}
                  />
                </div>
              </div>

              {/* Course params: Hours, Difficulty, Premium */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Horas Totales del Curso</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="5"
                    required
                    value={totalHours}
                    onChange={(e) => setTotalHours(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Nivel de Dificultad</label>
                  <select
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={saving}
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Privacidad / Locker</label>
                  <div className="flex items-center gap-2 h-10 select-none">
                    <input
                      type="checkbox"
                      id="isPremiumCourse"
                      className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      disabled={saving}
                    />
                    <label htmlFor="isPremiumCourse" className="text-xs font-bold text-ink-700 flex items-center gap-1 cursor-pointer">
                      <Lock size={12} className="text-amber-600" /> Premium Only
                    </label>
                  </div>
                </div>
              </div>

              {/* Instructor console */}
              <div className="border border-ink-200 p-4 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Perfil del Instructor</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900"
                      placeholder="ej. Dra. María Paz"
                      required
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase mb-1">URL Avatar (Opcional)</label>
                    <input
                      type="url"
                      className="w-full p-2 border border-ink-300 text-xs outline-none focus:border-ink-900 text-ink-900 font-mono"
                      placeholder="https://ejemplo.com/avatar.jpg"
                      value={instructorAvatar}
                      onChange={(e) => setInstructorAvatar(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Resources Attachments */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase">Recursos Descargables / Attachments</label>
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="text-xs font-bold text-[#008000] hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Añadir Recurso
                  </button>
                </div>
                <div className="space-y-2">
                  {resources.map((res, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-ink-50 p-2 border border-ink-200">
                      <input
                        type="text"
                        className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs text-ink-900"
                        placeholder="Nombre: ej. Guía Completa de Nutrición PDF"
                        value={res.name}
                        onChange={(e) => handleResourceChange(idx, 'name', e.target.value)}
                        disabled={saving}
                      />
                      <input
                        type="url"
                        className="flex-1 p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs text-ink-900 font-mono"
                        placeholder="URL de Descarga..."
                        value={res.url}
                        onChange={(e) => handleResourceChange(idx, 'url', e.target.value)}
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(idx)}
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
                  {saving ? 'Guardando...' : 'Guardar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
