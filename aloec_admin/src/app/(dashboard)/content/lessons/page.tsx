'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  Play, 
  Plus, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  Link as LinkIcon, 
  Video, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  ChevronRight
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
  videoSource: 'youtube' | 'vimeo' | 'upload';
  duration: number; // in seconds
  order: number;
  createdAt?: any;
}

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
  const [videoSource, setVideoSource] = useState<'youtube' | 'vimeo' | 'upload'>('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState<number>(300); // 5 mins
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList: Course[] = [];
        coursesSnap.forEach((d) => {
          if (!d.data().deletedAt) {
            coursesList.push({ id: d.id, title: d.data().title || 'Curso sin título' });
          }
        });
        setCourses(coursesList);
        if (coursesList.length > 0) setCourseId(coursesList[0].id);

        // Load lessons
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
            order: Number(data.order) || 1
          });
        });
        
        // Sort by order ascending
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
    // Find next order number
    const courseLessons = lessons.filter(l => l.courseId === courseId);
    const nextOrder = courseLessons.length > 0 ? Math.max(...courseLessons.map(l => l.order)) + 1 : 1;
    setOrder(nextOrder);
    setUploadFile(null);
    setUploadProgress(0);
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
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadVideo = () => {
    if (!uploadFile) {
      toast.error('Selecciona un archivo de video primero');
      return;
    }
    setUploading(true);
    const fileRef = ref(storage, `lessons_videos/${Date.now()}_${uploadFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error('Video upload failed:', error);
        toast.error('Error al subir video a Storage');
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
      toast.error('Título y Enlace de video son obligatorios');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando lección...');

    try {
      const id = editingId || `lesson_${Date.now()}`;
      const docRef = doc(db, 'lessons', id);

      const lessonData = {
        courseId,
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        videoSource,
        duration: Number(duration),
        order: Number(order),
        updatedAt: new Date()
      };

      if (editingId) {
        const prev = lessons.find(l => l.id === editingId);
        await updateDoc(docRef, lessonData);

        // Audit Log
        await logAdminAction('UPDATE', 'lessons', id, {
          description: `Actualizó lección: ${title}`,
          previousValues: prev,
          newValues: lessonData
        });

        // Sync old and new course lessons count
        if (prev && prev.courseId !== courseId) {
          await syncCourseLessonsCount(prev.courseId);
        }
        await syncCourseLessonsCount(courseId);

        setLessons(lessons.map(l => l.id === editingId ? { ...l, ...lessonData } : l).sort((a, b) => a.order - b.order));
        toast.success('Lección modificada con éxito', { id: toastId });
      } else {
        const fullData = {
          ...lessonData,
          createdAt: new Date()
        };
        await setDoc(docRef, fullData);

        // Audit Log
        await logAdminAction('CREATE', 'lessons', id, {
          description: `Creó lección: ${title}`,
          newValues: fullData
        });

        await syncCourseLessonsCount(courseId);

        setLessons([...lessons, { id, ...fullData }].sort((a, b) => a.order - b.order));
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
    if (!window.confirm(`¿Estás seguro de eliminar la lección: "${lesson.title}"?`)) {
      return;
    }

    const toastId = toast.loading('Eliminando lección...');
    try {
      await deleteDoc(doc(db, 'lessons', lesson.id));

      // Audit Log
      await logAdminAction('DELETE', 'lessons', lesson.id, {
        description: `Eliminó lección del videocurso: ${lesson.title}`,
        previousValues: lesson
      });

      await syncCourseLessonsCount(lesson.courseId);

      setLessons(lessons.filter(l => l.id !== lesson.id));
      toast.success('Lección eliminada correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      toast.error('Error al eliminar lección: ' + err.message, { id: toastId });
    }
  };

  const filteredLessons = lessons.filter(l => 
    selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter
  );

  const getCourseTitle = (cId: string) => {
    return courses.find(c => c.id === cId)?.title || 'Curso sin nombre';
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}m ${remaining}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Gestión de Lecciones y Videos</h1>
          <p className="text-sm text-ink-500 mt-1">Carga videos (Vimeo/YouTube) y asígnalos en orden de reproducción a tus cursos.</p>
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

      <div className="flex gap-4 items-center">
        {/* Course Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-400" />
          <select
            className="p-2 border border-ink-200 bg-white outline-none focus:border-[#008000] text-sm text-ink-700 font-bold"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            <option value="all">Ver Lecciones de Todos los Cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Video className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Primero crea un curso</p>
          <p className="text-sm">Necesitas crear al menos un videocurso en la pestaña "Cursos" para poder asociarle lecciones.</p>
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
            <span className="text-xs font-bold text-ink-700 uppercase">Lista de Videos en Reproducción</span>
          </div>
          <div className="divide-y divide-ink-100 text-sm text-ink-900">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-ink-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 bg-[#008000]/10 flex items-center justify-center text-[#008000] font-bold text-xs border border-[#008000]/20 shrink-0">
                    #{lesson.order}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink-900">{lesson.title}</h4>
                    <p className="text-xs text-ink-500 flex items-center gap-1.5 mt-0.5">
                      <span>Curso: {getCourseTitle(lesson.courseId)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {formatDuration(lesson.duration)}</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] font-bold bg-ink-100 px-1 border border-ink-200 text-ink-600">{lesson.videoSource}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openEditModal(lesson)}
                    className="p-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] hover:bg-ink-50 transition-colors font-bold text-xs flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(lesson)}
                    className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal (Dropbox style) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Lección' : 'Cargar Nueva Lección'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">Asigna la lección a un curso y coloca las credenciales del video.</p>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Curso Destino</label>
                <select
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700 font-bold"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={saving}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título de la Lección</label>
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

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Descripción de la Lección</label>
                <textarea
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900 h-20 resize-none"
                  placeholder="Detalla lo que cubre este clip o video específico..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Video source selections */}
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Fuente del Video</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                    <input
                      type="radio"
                      name="videoSource"
                      value="youtube"
                      className="text-[#008000] focus:ring-[#008000] mr-2"
                      checked={videoSource === 'youtube'}
                      onChange={() => setVideoSource('youtube')}
                    />
                    YouTube
                  </label>
                  <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                    <input
                      type="radio"
                      name="videoSource"
                      value="vimeo"
                      className="text-[#008000] focus:ring-[#008000] mr-2"
                      checked={videoSource === 'vimeo'}
                      onChange={() => setVideoSource('vimeo')}
                    />
                    Vimeo
                  </label>
                  <label className="flex items-center text-sm text-ink-700 cursor-pointer">
                    <input
                      type="radio"
                      name="videoSource"
                      value="upload"
                      className="text-[#008000] focus:ring-[#008000] mr-2"
                      checked={videoSource === 'upload'}
                      onChange={() => setVideoSource('upload')}
                    />
                    Subida Local (Storage)
                  </label>
                </div>

                {videoSource === 'upload' ? (
                  <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                    <span className="text-xs font-bold text-ink-700 uppercase block">Carga de Archivo de Video</span>
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
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required
                      className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm font-mono text-ink-900"
                      placeholder={videoSource === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://vimeo.com/...'}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                )}
              </div>

              {/* Order & Duration params */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Orden de Reproducción</label>
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
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Duración (Segundos)</label>
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
