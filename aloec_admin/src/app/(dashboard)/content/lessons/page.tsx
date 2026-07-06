'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { 
  Play, 
  Plus, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  Video, 
  Clock, 
  Filter,
  Info,
  ExternalLink,
  CheckCircle2,
  FolderOpen,
  AlertTriangle,
  X,
  Film,
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  videoSource: 'youtube' | 'vimeo' | 'upload' | 'onedrive';
  duration: number;
  order: number;
  createdAt?: any;
}

// ─── Helper: convert OneDrive share URL to embed URL ────────────────────────
function convertOnedriveToEmbed(url: string): string {
  const trimmed = url.trim();
  // Already an embed URL — return as is
  if (trimmed.includes('embed')) return trimmed;
  // Short share links: https://1drv.ms/v/s!...
  // Convert to embed via Microsoft's iframe endpoint
  try {
    const encoded = btoa(trimmed).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `https://onedrive.live.com/embed?resid=${encoded}&authkey=&em=2`;
  } catch {
    return trimmed;
  }
}

// ─── Source badge colors ─────────────────────────────────────────────────────
const sourceBadge: Record<string, { label: string; color: string }> = {
  youtube:  { label: 'YouTube',  color: 'bg-red-50 text-red-700 border-red-200' },
  vimeo:    { label: 'Vimeo',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  upload:   { label: 'Storage',  color: 'bg-purple-50 text-purple-700 border-purple-200' },
  onedrive: { label: 'OneDrive', color: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoSource, setVideoSource] = useState<'youtube' | 'vimeo' | 'upload' | 'onedrive'>('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState<number>(300);
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  // OneDrive helper
  const [showOnedriveGuide, setShowOnedriveGuide] = useState(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ─── Storage Video Library ───────────────────────────────────────────────
  interface StoredVideo {
    name: string;        // filename only
    fullPath: string;    // Storage path
    downloadUrl: string; // Public URL
    usedBy: string[];    // Lesson titles using this video
  }
  const [storedVideos, setStoredVideos] = useState<StoredVideo[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<StoredVideo | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList: Course[] = [];
        coursesSnap.forEach((d) => {
          if (!d.data().deletedAt) {
            coursesList.push({ id: d.id, title: d.data().title || 'Curso sin título' });
          }
        });
        setCourses(coursesList);
        if (coursesList.length > 0) setCourseId(coursesList[0].id);

        const lessonsSnap = await getDocs(collection(db, 'lessons'));
        const lessonsList: Lesson[] = [];
        lessonsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          lessonsList.push({
            id: docSnap.id,
            courseId: data.courseId || '',
            title: data.title || '',
            description: data.description || '',
            videoUrl: data.videoUrl || '',
            videoSource: data.videoSource || 'youtube',
            duration: Number(data.duration) || 0,
            order: Number(data.order) || 1,
          });
        });
        lessonsList.sort((a, b) => a.order - b.order);
        setLessons(lessonsList);
      } catch (err) {
        console.error('Error loading lessons:', err);
        toast.error('Error al cargar lecciones del curso');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const syncCourseLessonsCount = async (cId: string) => {
    try {
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      let count = 0;
      lessonsSnap.forEach((docSnap) => {
        if (docSnap.data().courseId === cId) count++;
      });
      await updateDoc(doc(db, 'courses', cId), { lessonsCount: count });
    } catch (error) {
      console.error('Failed to sync course lessons count:', error);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setVideoSource('youtube');
    setVideoUrl('');
    setDuration(300);
    const courseLessons = lessons.filter((l) => l.courseId === courseId);
    const nextOrder =
      courseLessons.length > 0 ? Math.max(...courseLessons.map((l) => l.order)) + 1 : 1;
    setOrder(nextOrder);
    setUploadFile(null);
    setUploadProgress(0);
    setShowOnedriveGuide(false);
    setIsModalOpen(true);
  };

  const openEditModal = (l: Lesson) => {
    setEditingId(l.id);
    setCourseId(l.courseId);
    setTitle(l.title);
    setDescription(l.description);
    setVideoSource(l.videoSource);
    setVideoUrl(l.videoUrl);
    setDuration(l.duration);
    setOrder(l.order);
    setUploadFile(null);
    setUploadProgress(0);
    setShowOnedriveGuide(false);
    setIsModalOpen(true);
  };

  // ─── Load Storage video library ─────────────────────────────────────────
  const loadStorageLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const folderRef = ref(storage, 'lessons_videos');
      const result = await listAll(folderRef);

      // Get all upload-type lessons to map URLs → lesson titles
      const urlToLessons: Record<string, string[]> = {};
      lessons
        .filter((l) => l.videoSource === 'upload')
        .forEach((l) => {
          if (!urlToLessons[l.videoUrl]) urlToLessons[l.videoUrl] = [];
          urlToLessons[l.videoUrl].push(l.title);
        });

      const videos: StoredVideo[] = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadUrl: url,
            usedBy: urlToLessons[url] ?? [],
          };
        })
      );

      // Sort: most recently uploaded first (timestamp prefix in name)
      videos.sort((a, b) => b.name.localeCompare(a.name));
      setStoredVideos(videos);
      setShowLibrary(true);
    } catch (err) {
      console.error('Error loading storage library:', err);
      toast.error('No se pudo cargar la biblioteca de videos');
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 200 * 1024 * 1024) {
        toast.error('El video es demasiado grande. Máximo 200 MB permitido.');
        return;
      }
      // ── Check for duplicate filename in stored videos ──
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
      const match = storedVideos.find((v) => v.name.includes(safeName));
      if (match) {
        setDuplicateWarning(match);
      } else {
        setDuplicateWarning(null);
      }
      setUploadFile(file);
    }
  };

  const handleUploadVideo = () => {
    if (!uploadFile) {
      toast.error('Selecciona un archivo de video primero');
      return;
    }
    setUploading(true);
    const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\s+/g, '_');
    const fileRef = ref(storage, `lessons_videos/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        const msg =
          error.code === 'storage/unauthorized'
            ? 'Permiso denegado. Verifica las reglas de Storage.'
            : `Error: ${error.message || 'desconocido'}`;
        toast.error(`Error al subir video: ${msg}`);
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setVideoUrl(downloadUrl);
        toast.success('Video cargado en Storage con éxito');
        setUploading(false);
        setUploadFile(null);
        setUploadProgress(0);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      toast.error('Debes seleccionar un curso de destino');
      return;
    }
    if (!title.trim() || !videoUrl.trim()) {
      const missing: string[] = [];
      if (!title.trim()) missing.push('Título');
      if (!videoUrl.trim())
        missing.push(
          videoSource === 'upload' ? 'Archivo de video (no se ha subido)' : 'Enlace de video'
        );
      toast.error(`Falta: ${missing.join(' y ')}. Completa los campos obligatorios.`);
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando lección...');

    try {
      const id = editingId || `lesson_${Date.now()}`;
      const docRef = doc(db, 'lessons', id);

      // For OneDrive, store both the original URL and the embed URL
      const finalVideoUrl =
        videoSource === 'onedrive' ? convertOnedriveToEmbed(videoUrl) : videoUrl.trim();

      const lessonData = {
        courseId,
        title: title.trim(),
        description: description.trim(),
        videoUrl: finalVideoUrl,
        ...(videoSource === 'onedrive' ? { videoSourceRaw: videoUrl.trim() } : {}),
        videoSource,
        duration: Number(duration),
        order: Number(order),
        updatedAt: new Date(),
      };

      if (editingId) {
        const prev = lessons.find((l) => l.id === editingId);
        await updateDoc(docRef, lessonData);
        await logAdminAction('UPDATE', 'lessons', id, {
          description: `Actualizó lección: ${title}`,
          previousValues: prev,
          newValues: lessonData,
        });
        if (prev && prev.courseId !== courseId) {
          await syncCourseLessonsCount(prev.courseId);
        }
        await syncCourseLessonsCount(courseId);
        setLessons(
          lessons
            .map((l) => (l.id === editingId ? { ...l, ...lessonData } : l))
            .sort((a, b) => a.order - b.order)
        );
        toast.success('Lección modificada con éxito', { id: toastId });
      } else {
        const fullData = { ...lessonData, createdAt: new Date() };
        await setDoc(docRef, fullData);
        await logAdminAction('CREATE', 'lessons', id, {
          description: `Creó lección: ${title}`,
          newValues: fullData,
        });
        await syncCourseLessonsCount(courseId);
        setLessons(
          [...lessons, { id, ...fullData }].sort((a, b) => a.order - b.order)
        );
        toast.success('Lección agregada correctamente', { id: toastId });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving lesson:', err);
      toast.error('Error al guardar lección: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!window.confirm(`¿Estás seguro de eliminar la lección: "${lesson.title}"?`)) return;

    const toastId = toast.loading('Eliminando lección...');
    try {
      await deleteDoc(doc(db, 'lessons', lesson.id));
      await logAdminAction('DELETE', 'lessons', lesson.id, {
        description: `Eliminó lección: ${lesson.title}`,
        previousValues: lesson,
      });
      await syncCourseLessonsCount(lesson.courseId);
      setLessons(lessons.filter((l) => l.id !== lesson.id));
      toast.success('Lección eliminada correctamente', { id: toastId });
    } catch (err: any) {
      toast.error('Error al eliminar lección: ' + err.message, { id: toastId });
    }
  };

  const filteredLessons = lessons.filter(
    (l) => selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter
  );

  const getCourseTitle = (cId: string) =>
    courses.find((c) => c.id === cId)?.title || 'Curso sin nombre';

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}m ${remaining}s`;
  };

  const placeholderBySource = {
    youtube: 'https://youtube.com/watch?v=...',
    vimeo: 'https://vimeo.com/123456789',
    onedrive: 'https://1drv.ms/v/s!... (link de OneDrive)',
    upload: '',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Gestión de Lecciones y Videos</h1>
          <p className="text-sm text-ink-500 mt-1">
            Carga videos desde YouTube, Vimeo, OneDrive o Firebase Storage y asígnalos a tus cursos.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={courses.length === 0}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Nueva Lección
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-400" />
          <select
            className="p-2 border border-ink-200 bg-white outline-none focus:border-[#008000] text-sm text-ink-700 font-bold"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            <option value="all">Ver Lecciones de Todos los Cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lesson List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Video className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Primero crea un curso</p>
          <p className="text-sm">Necesitas crear al menos un videocurso en la pestaña &quot;Cursos&quot; para poder asociarle lecciones.</p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Play className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin lecciones añadidas</p>
          <p className="text-sm">Comienza subiendo tu primera lección en video para este curso.</p>
        </div>
      ) : (
        <div className="bg-white border border-ink-200">
          <div className="p-4 bg-ink-50 border-b border-ink-200">
            <span className="text-xs font-bold text-ink-700 uppercase">
              Lista de Videos en Reproducción
            </span>
          </div>
          <div className="divide-y divide-ink-100 text-sm text-ink-900">
            {filteredLessons.map((lesson) => {
              const badge = sourceBadge[lesson.videoSource] ?? sourceBadge.youtube;
              return (
                <div
                  key={lesson.id}
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-ink-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-[#008000]/10 flex items-center justify-center text-[#008000] font-bold text-xs border border-[#008000]/20 shrink-0">
                      #{lesson.order}
                    </div>
                    <div>
                      <h4 className="font-bold text-ink-900">{lesson.title}</h4>
                      <p className="text-xs text-ink-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span>Curso: {getCourseTitle(lesson.courseId)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} /> {formatDuration(lesson.duration)}
                        </span>
                        <span>•</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => openEditModal(lesson)}
                      className="p-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] hover:bg-ink-50 transition-colors font-bold text-xs flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(lesson)}
                      className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-bold text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CRUD Modal ──────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Lección' : 'Cargar Nueva Lección'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">
              Asigna la lección a un curso y coloca las credenciales del video.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Course selector */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                  Curso Destino
                </label>
                <select
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700 font-bold"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={saving}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                  Título de la Lección
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                  placeholder="ej. Introducción a la Fibra Soluble"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                  Descripción de la Lección
                </label>
                <textarea
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900 h-20 resize-none"
                  placeholder="Detalla lo que cubre este clip o video específico..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* ─── Video Source Selector ─────────────────────────────────── */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                  Fuente del Video
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(
                    [
                      { value: 'youtube',  label: '▶ YouTube',   color: 'border-red-300 bg-red-50 text-red-700' },
                      { value: 'vimeo',    label: '◈ Vimeo',     color: 'border-blue-300 bg-blue-50 text-blue-700' },
                      { value: 'onedrive', label: '☁ OneDrive',  color: 'border-sky-300 bg-sky-50 text-sky-700' },
                      { value: 'upload',   label: '⬆ Firebase Storage', color: 'border-purple-300 bg-purple-50 text-purple-700' },
                    ] as const
                  ).map((src) => (
                    <label
                      key={src.value}
                      className={`flex items-center gap-2 p-2.5 border rounded-sm cursor-pointer transition-all text-xs font-bold select-none ${
                        videoSource === src.value
                          ? src.color + ' border-2'
                          : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="videoSource"
                        value={src.value}
                        className="sr-only"
                        checked={videoSource === src.value}
                        onChange={() => {
                          setVideoSource(src.value);
                          setVideoUrl('');
                          setShowOnedriveGuide(false);
                        }}
                      />
                      {src.label}
                    </label>
                  ))}
                </div>

                {/* ─── OneDrive guide banner ──────────────────────────────── */}
                {videoSource === 'onedrive' && (
                  <div className="mb-3 border border-sky-200 bg-sky-50 rounded-sm p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                        <Info size={13} /> Cómo obtener el link de OneDrive
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowOnedriveGuide(!showOnedriveGuide)}
                        className="text-xs text-sky-600 hover:underline font-bold"
                      >
                        {showOnedriveGuide ? 'Ocultar' : 'Ver pasos'}
                      </button>
                    </div>
                    {showOnedriveGuide && (
                      <ol className="text-xs text-sky-800 space-y-1.5 list-decimal list-inside">
                        <li>
                          Ve a{' '}
                          <a
                            href="https://onedrive.live.com"
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-bold inline-flex items-center gap-0.5"
                          >
                            onedrive.live.com <ExternalLink size={10} />
                          </a>{' '}
                          y ubica tu video.
                        </li>
                        <li>
                          Haz clic en los <strong>tres puntos (···)</strong> del archivo → Selecciona{' '}
                          <strong>&ldquo;Compartir&rdquo;</strong>.
                        </li>
                        <li>
                          Asegúrate que esté en <strong>&ldquo;Cualquier persona con el vínculo puede ver&rdquo;</strong>.
                        </li>
                        <li>
                          Copia el link que empieza con <code className="bg-sky-100 px-1 rounded">https://1drv.ms/v/...</code>
                        </li>
                        <li>
                          Pega el link aquí abajo — el sistema lo convertirá automáticamente en un link de incrustación.
                        </li>
                      </ol>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-sky-600">
                      <CheckCircle2 size={11} />
                      El sistema convierte el link de OneDrive automáticamente al guardar.
                    </div>
                  </div>
                )}

                {/* ─── Upload Panel ───────────────────────────────────────── */}
                {videoSource === 'upload' ? (
                  <div className="border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                    {/* Header with library button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-700 uppercase">
                        Firebase Storage
                      </span>
                      <button
                        type="button"
                        onClick={loadStorageLibrary}
                        disabled={loadingLibrary || uploading || saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs font-bold hover:bg-purple-50 transition-colors rounded-sm disabled:opacity-50"
                      >
                        <FolderOpen size={13} />
                        {loadingLibrary ? 'Cargando...' : 'Usar video existente'}
                      </button>
                    </div>

                    {/* ── Library picker ── */}
                    {showLibrary && storedVideos.length > 0 && (
                      <div className="border border-purple-200 bg-white rounded-sm overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border-b border-purple-200">
                          <span className="text-[10px] font-bold text-purple-700 uppercase">
                            {storedVideos.length} video{storedVideos.length !== 1 ? 's' : ''} en Storage
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowLibrary(false)}
                            className="text-purple-400 hover:text-purple-700"
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-purple-50">
                          {storedVideos.map((v) => {
                            const isSelected = videoUrl === v.downloadUrl;
                            const isInUse = v.usedBy.length > 0;
                            // Strip the timestamp prefix for display
                            const displayName = v.name.replace(/^\d+_/, '');
                            return (
                              <button
                                key={v.fullPath}
                                type="button"
                                onClick={() => {
                                  setVideoUrl(v.downloadUrl);
                                  setShowLibrary(false);
                                  setUploadFile(null);
                                  setDuplicateWarning(null);
                                  toast.success(`Video seleccionado: ${displayName}`);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? 'bg-purple-100 border-l-2 border-purple-500'
                                    : 'hover:bg-purple-50/60'
                                }`}
                              >
                                <Film size={16} className="text-purple-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-ink-800 truncate">
                                    {displayName}
                                  </p>
                                  {isInUse ? (
                                    <p className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                                      <CheckCircle2 size={9} />
                                      Usado en: {v.usedBy.join(', ')}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] text-ink-400 mt-0.5">Sin asignar</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 size={14} className="text-purple-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {showLibrary && storedVideos.length === 0 && !loadingLibrary && (
                      <p className="text-xs text-ink-400 text-center py-2">
                        No hay videos subidos en Storage todavía.
                      </p>
                    )}

                    {/* ── Divider ── */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-purple-200" />
                      <span className="text-[10px] text-purple-400 font-bold">O SUBIR NUEVO</span>
                      <div className="flex-1 h-px bg-purple-200" />
                    </div>

                    {/* ── File picker + upload button ── */}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="lessonVideoFile"
                        disabled={uploading || saving}
                      />
                      <label
                        htmlFor="lessonVideoFile"
                        className="flex-1 p-2.5 bg-white border border-ink-300 outline-none cursor-pointer text-xs font-bold text-ink-700 hover:bg-ink-50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UploadCloud size={16} />
                        {uploadFile ? uploadFile.name : 'Seleccionar Video (.mp4/.mov)'}
                      </label>
                      {uploadFile && (
                        <button
                          type="button"
                          onClick={handleUploadVideo}
                          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-xs transition-colors shrink-0"
                          disabled={uploading || saving}
                        >
                          {uploading ? `Subiendo ${uploadProgress}%` : 'Subir'}
                        </button>
                      )}
                    </div>

                    {/* ── Duplicate warning ── */}
                    {duplicateWarning && (
                      <div className="border border-amber-300 bg-amber-50 rounded-sm p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-amber-800">
                              ¡Este video ya existe en Storage!
                            </p>
                            <p className="text-[10px] text-amber-700 mt-0.5 truncate">
                              {duplicateWarning.name.replace(/^\d+_/, '')}
                            </p>
                            {duplicateWarning.usedBy.length > 0 && (
                              <p className="text-[10px] text-amber-600 mt-0.5">
                                Ya usado en: <strong>{duplicateWarning.usedBy.join(', ')}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl(duplicateWarning.downloadUrl);
                              setUploadFile(null);
                              setDuplicateWarning(null);
                              toast.success('Usando el video existente de Storage');
                            }}
                            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-sm transition-colors"
                          >
                            Usar el existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setDuplicateWarning(null)}
                            className="flex-1 py-1.5 border border-amber-300 text-amber-700 text-xs font-bold rounded-sm hover:bg-amber-50 transition-colors"
                          >
                            Subir de todas formas
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Success indicator ── */}
                    {videoUrl && !duplicateWarning && (
                      <p className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Video listo en Firebase Storage
                      </p>
                    )}

                  </div>
                ) : (
                  /* URL input for YouTube, Vimeo and OneDrive */

                  <div>
                    <input
                      type="url"
                      required
                      className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                      placeholder={placeholderBySource[videoSource]}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={saving}
                    />
                    {videoSource === 'onedrive' && videoUrl && (
                      <p className="text-[10px] text-sky-600 mt-1 font-mono truncate">
                        Embed: {convertOnedriveToEmbed(videoUrl)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Order & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                    Orden de Reproducción
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="1"
                    required
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">
                    Duración (Segundos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                    placeholder="300"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 border-t border-[#f3f4f6] pt-4">
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
                  {saving ? 'Guardando...' : 'Guardar Lección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
