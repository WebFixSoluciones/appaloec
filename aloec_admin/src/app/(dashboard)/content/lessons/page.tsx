'use client';

import React, { useState } from 'react';

export default function VideoUploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoSource, setVideoSource] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Simular integración con Firestore y guardado de URL
    setTimeout(() => {
      alert('Video guardado correctamente en la base de datos (Vimeo/CDN)');
      setIsUploading(false);
      setTitle('');
      setDescription('');
      setVideoUrl('');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Cargar Nueva Lección / Video</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Título de la Lección</label>
          <input 
            type="text" 
            required
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Ej: Introducción a los Jugos Verdes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
          <textarea 
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Resumen del contenido de este video..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-4">Fuente del Video</label>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="source" 
                checked={videoSource === 'url'} 
                onChange={() => setVideoSource('url')}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-slate-700">URL Externa (Vimeo / Bunny Stream)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="source" 
                checked={videoSource === 'upload'} 
                onChange={() => setVideoSource('upload')}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-slate-700">Subida Directa (No recomendado para streaming masivo)</span>
            </label>
          </div>

          {videoSource === 'url' ? (
            <input 
              type="url" 
              required
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="text-slate-500 mb-2">Haz clic o arrastra un archivo de video aquí (MP4, MOV)</div>
              <div className="text-xs text-slate-400">Tamaño máximo recomendado: 500MB</div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isUploading}
            className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
              isUploading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isUploading ? 'Guardando...' : 'Guardar Lección'}
          </button>
        </div>
      </form>
    </div>
  );
}
