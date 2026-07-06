'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../../lib/firebase/config';
import { logAdminAction } from '../../../../lib/firebase/audit';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  UploadCloud, 
  Link2, 
  Calendar,
  ExternalLink,
  MousePointerClick
} from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  startDate?: string;
  endDate?: string;
  clicksCount: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form/Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [position, setPosition] = useState('inicio');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBanners() {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'marketing_banners'));
        const list: Banner[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || 'Banner sin título',
            imageUrl: data.imageUrl || '',
            targetUrl: data.targetUrl || '',
            position: data.position || 'inicio',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            clicksCount: Number(data.clicksCount) || 0,
            isActive: data.isActive !== false
          });
        });
        setBanners(list);
      } catch (err) {
        console.error('Error loading banners:', err);
        toast.error('Error al cargar banners publicitarios');
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
    setTargetUrl('');
    setPosition('inicio');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingId(b.id);
    setTitle(b.title);
    setImageUrl(b.imageUrl);
    setTargetUrl(b.targetUrl);
    setPosition(b.position);
    setStartDate(b.startDate || '');
    setEndDate(b.endDate || '');
    setIsActive(b.isActive);
    setUploadFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

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
    if (!uploadFile) {
      toast.error('Selecciona un archivo de imagen primero');
      return;
    }

    setUploading(true);
    const safeName = uploadFile.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\s+/g, '_');
    const fileRef = ref(storage, `marketing_banners/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(fileRef, uploadFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error('Upload failed:', error);
        const msg = error.code === 'storage/unauthorized'
          ? 'Permiso denegado. Verifica las reglas de Storage (firebase deploy --only storage).'
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      const missing: string[] = [];
      if (!title.trim()) missing.push('Titulo');
      if (!imageUrl.trim()) missing.push('Imagen');
      toast.error(`Falta: ${missing.join(' y ')}. Completa los campos obligatorios.`);
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando configuración de banner...');

    try {
      const id = editingId || `banner_${Date.now()}`;
      const bannerRef = doc(db, 'marketing_banners', id);

      const bannerData = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        targetUrl: targetUrl.trim(),
        position,
        startDate,
        endDate,
        isActive,
        clicksCount: editingId ? banners.find(b => b.id === editingId)?.clicksCount || 0 : 0,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(bannerRef, bannerData);
        
        // Log Audit
        const prev = banners.find(b => b.id === editingId);
        await logAdminAction('UPDATE', 'marketing_banners', id, {
          description: `Actualizó banner: ${title}`,
          previousValues: prev,
          newValues: bannerData
        });

        setBanners(banners.map(b => b.id === editingId ? { ...b, ...bannerData } : b));
        toast.success('Banner actualizado correctamente', { id: toastId });
      } else {
        const fullData = {
          ...bannerData,
          createdAt: new Date()
        };
        await setDoc(bannerRef, fullData);

        // Log Audit
        await logAdminAction('CREATE', 'marketing_banners', id, {
          description: `Creó banner: ${title}`,
          newValues: fullData
        });

        setBanners([...banners, { id, ...fullData }]);
        toast.success('Banner guardado correctamente', { id: toastId });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving banner:', err);
      toast.error('Error al guardar banner: ' + err.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este banner permanentemente?')) {
      return;
    }

    const toastId = toast.loading('Eliminando banner...');
    try {
      const bannerRef = doc(db, 'marketing_banners', id);
      await deleteDoc(bannerRef);

      // Log Audit
      const prev = banners.find(b => b.id === id);
      await logAdminAction('DELETE', 'marketing_banners', id, {
        description: `Eliminó banner: ${prev?.title}`,
        previousValues: prev
      });

      setBanners(banners.filter(b => b.id !== id));
      toast.success('Banner eliminado correctamente', { id: toastId });
    } catch (err: any) {
      console.error('Error deleting banner:', err);
      toast.error('Error al eliminar banner: ' + err.message, { id: toastId });
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const newStatus = !banner.isActive;
    try {
      const bannerRef = doc(db, 'marketing_banners', banner.id);
      await updateDoc(bannerRef, { isActive: newStatus });
      setBanners(banners.map(b => b.id === banner.id ? { ...b, isActive: newStatus } : b));
      toast.success(newStatus ? 'Banner activado' : 'Banner desactivado');
    } catch (err) {
      console.error('Error toggling banner status:', err);
      toast.error('Error al actualizar estado del banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Banners Promocionales y de Marketing</h1>
          <p className="text-sm text-ink-500 mt-1">Administra la publicidad, campañas informativas y banners rotativos en la app móvil.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-2 select-none"
        >
          <Plus size={18} />
          Subir Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <ImageIcon className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">Sin banners publicitarios</p>
          <p className="text-sm mb-4">Añade imágenes para promocionar cursos premium, planes o anuncios de salud en la App.</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Añadir Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div 
              key={b.id} 
              className={`border border-ink-200 bg-white flex flex-col justify-between hover:border-[#008000] transition-all overflow-hidden ${
                b.isActive ? '' : 'opacity-60'
              }`}
            >
              {/* Image banner preview */}
              <div className="relative aspect-video bg-ink-100 border-b border-ink-200">
                <img 
                  src={b.imageUrl} 
                  alt={b.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
                  }}
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase bg-ink-900 text-white border border-white">
                  Posición: {b.position}
                </span>
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase border cursor-pointer ${
                    b.isActive ? 'bg-[#008000] text-white border-[#008000]' : 'bg-red-600 text-white border-red-600'
                  }`}
                >
                  {b.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Banner Info */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-ink-900 text-base">{b.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-ink-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Link2 size={14} className="text-ink-400 shrink-0" />
                      <span className="truncate" title={b.targetUrl}>{b.targetUrl || 'Sin enlace'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <MousePointerClick size={14} className="text-ink-400 shrink-0" />
                      <span>{b.clicksCount} clicks</span>
                    </div>
                  </div>

                  {(b.startDate || b.endDate) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-500 mt-2 font-bold uppercase bg-ink-50 p-2 border border-ink-200">
                      <Calendar size={12} className="text-[#008000]" />
                      <span>Vigencia: {b.startDate || 'Siempre'} al {b.endDate || 'Siempre'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-ink-100 pt-4 mt-4">
                  {b.targetUrl && (
                    <a
                      href={b.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 border border-ink-300 text-ink-600 hover:text-ink-900 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <ExternalLink size={12} />
                      Probar
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(b)}
                    className="px-2.5 py-1.5 border border-ink-300 text-ink-700 hover:text-[#008000] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
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

      {/* CRUD Modal (Dropbox Theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {editingId ? 'Editar Banner Publicitario' : 'Subir Nuevo Banner'}
            </h3>
            <p className="text-xs text-ink-500 mb-6">Configura la imagen y comportamiento del banner en la aplicación.</p>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Título de la Campaña / Banner</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900"
                  placeholder="ej. Promoción Reto Salud Jugos Verdes"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Upload image console */}
              <div className="border border-ink-200 p-4 bg-ink-50 space-y-3">
                <span className="text-xs font-bold text-ink-700 uppercase block">Imagen del Banner</span>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="bannerImageFile"
                    disabled={uploading || saving}
                  />
                  <label
                    htmlFor="bannerImageFile"
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

                <div className="relative">
                  <span className="block text-[10px] font-bold text-ink-500 uppercase mb-1">O escribe/pega un enlace externo:</span>
                  <input
                    type="url"
                    className="w-full p-2 bg-white border border-ink-300 outline-none focus:border-ink-900 text-xs font-mono text-ink-900"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={uploading || saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Acción / Enlace Destino</label>
                  <input
                    type="text"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-900 font-mono"
                    placeholder="ej. /content/courses/detox"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Posición en la App</label>
                  <select
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={saving}
                  >
                    <option value="inicio">Pantalla Inicio (Top)</option>
                    <option value="recetas">Sección Recetas (Medio)</option>
                    <option value="cursos">Sección Cursos (Medio)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Fecha Inicio (Vigencia)</label>
                  <input
                    type="date"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Fecha Fin (Expiración)</label>
                  <input
                    type="date"
                    className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm text-ink-700"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerActive"
                  className="rounded border-ink-300 text-[#008000] focus:ring-[#008000] h-4 w-4"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="bannerActive" className="text-sm font-bold text-ink-700 select-none">
                  El banner está activo e impreso en la app
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
                  disabled={saving || uploading}
                >
                  {saving ? 'Guardando...' : 'Guardar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
