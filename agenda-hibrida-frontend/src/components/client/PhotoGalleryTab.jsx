import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const photoTypes = {
  reference: { label: 'Referência', icon: '🖼️', color: 'bg-purple-100 text-purple-800' },
  sketch: { label: 'Sketch', icon: '✏️', color: 'bg-blue-100 text-blue-800' },
  before: { label: 'Antes', icon: '📸', color: 'bg-gray-100 text-gray-800' },
  during: { label: 'Durante', icon: '🎨', color: 'bg-yellow-100 text-yellow-800' },
  after: { label: 'Depois', icon: '✨', color: 'bg-green-100 text-green-800' },
  healing: { label: 'Cicatrização', icon: '💊', color: 'bg-pink-100 text-pink-800' }
};

function PhotoGalleryTab({ clientId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
    loadStats();
  }, [clientId, filter]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('photo_type', filter);
      
      const response = await axios.get(
        `${API_BASE}/api/clients/${clientId}/photos?${params.toString()}`
      );
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/clients/${clientId}/photos/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleUpload = async (e, photoType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('photo_type', photoType);
        formData.append('taken_date', new Date().toISOString());

        await axios.post(
          `${API_BASE}/api/clients/${clientId}/photos`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
      }

      loadPhotos();
      loadStats();
      alert(`${files.length} foto(s) enviada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das fotos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const togglePortfolio = async (photoId, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/photos/${photoId}/portfolio`,
        { isPortfolio: !currentStatus }
      );
      loadPhotos();
      loadStats();
    } catch (error) {
      console.error('Erro ao atualizar portfólio:', error);
    }
  };

  const toggleVisibility = async (photoId, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/photos/${photoId}/visibility`,
        { showToClient: !currentStatus }
      );
      loadPhotos();
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
    }
  };

  const approvePhoto = async (photoId, approved) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/photos/${photoId}/approve`,
        { approved }
      );
      loadPhotos();
      loadStats();
    } catch (error) {
      console.error('Erro ao aprovar foto:', error);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('Deseja deletar esta foto? Esta ação não pode ser desfeita.')) return;

    try {
      await axios.delete(`${API_BASE}/api/clients/${clientId}/photos/${photoId}`);
      loadPhotos();
      loadStats();
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
    }
  };

  const updateMetadata = async (photoId, caption, tags) => {
    try {
      await axios.put(
        `${API_BASE}/api/clients/${clientId}/photos/${photoId}/metadata`,
        { caption, tags }
      );
      loadPhotos();
    } catch (error) {
      console.error('Erro ao atualizar metadata:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fotos & Galeria</h2>
          <p className="text-sm text-gray-600 mt-1">Gerenciamento completo de fotos de tatuagens</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e, 'after')}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? '📤 Enviando...' : '📷 Upload Fotos'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg shadow border border-gray-200">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-xl font-bold text-gray-900">{stats.total_photos || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg shadow border border-gray-200">
            <div className="text-xs text-gray-600">Antes</div>
            <div className="text-xl font-bold text-gray-900">{stats.before_photos || 0}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg shadow border border-green-200">
            <div className="text-xs text-green-700">Depois</div>
            <div className="text-xl font-bold text-green-900">{stats.after_photos || 0}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg shadow border border-yellow-200">
            <div className="text-xs text-yellow-700">Durante</div>
            <div className="text-xl font-bold text-yellow-900">{stats.during_photos || 0}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg shadow border border-purple-200">
            <div className="text-xs text-purple-700">Portfólio</div>
            <div className="text-xl font-bold text-purple-900">{stats.portfolio_photos || 0}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg shadow border border-blue-200">
            <div className="text-xs text-blue-700">Aprovadas</div>
            <div className="text-xl font-bold text-blue-900">{stats.approved_photos || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🌟 Todas
        </button>
        {Object.entries(photoTypes).map(([type, data]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {data.icon} {data.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.length === 0 ? (
          <div className="col-span-4 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-3">Nenhuma foto encontrada</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800"
            >
              Fazer primeiro upload
            </button>
          </div>
        ) : (
          photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-xl transition"
            >
              <img
                src={`${API_BASE}${photo.photo_url}`}
                alt={photo.caption || 'Foto'}
                className="w-full h-48 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition text-white text-center">
                  <div className="text-sm font-medium">Clique para detalhes</div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  photoTypes[photo.photo_type]?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {photoTypes[photo.photo_type]?.icon} {photoTypes[photo.photo_type]?.label}
                </span>
                {photo.is_portfolio && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-purple-600 text-white">
                    ⭐ Portfolio
                  </span>
                )}
                {photo.client_approved && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-600 text-white">
                    ✅ Aprovada
                  </span>
                )}
                {!photo.show_to_client && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white">
                    👁️ Oculta
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={`${API_BASE}${selectedPhoto.photo_url}`}
                alt={selectedPhoto.caption || 'Foto'}
                className="w-full max-h-96 object-contain bg-gray-900"
              />
              
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 shadow-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                    photoTypes[selectedPhoto.photo_type]?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {photoTypes[selectedPhoto.photo_type]?.icon} {photoTypes[selectedPhoto.photo_type]?.label}
                  </span>
                  {selectedPhoto.project_name && (
                    <p className="text-sm text-gray-600 mt-2">
                      Projeto: <span className="font-medium">{selectedPhoto.project_name}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => togglePortfolio(selectedPhoto.id, selectedPhoto.is_portfolio)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      selectedPhoto.is_portfolio
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ⭐ Portfolio
                  </button>
                  <button
                    onClick={() => approvePhoto(selectedPhoto.id, !selectedPhoto.client_approved)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      selectedPhoto.client_approved
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ✅ Aprovada
                  </button>
                  <button
                    onClick={() => toggleVisibility(selectedPhoto.id, selectedPhoto.show_to_client)}
                    className={`px-3 py-1 text-sm rounded transition ${
                      selectedPhoto.show_to_client
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    👁️ {selectedPhoto.show_to_client ? 'Visível' : 'Oculta'}
                  </button>
                </div>
              </div>

              {selectedPhoto.caption && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legenda</label>
                  <p className="text-gray-800">{selectedPhoto.caption}</p>
                </div>
              )}

              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPhoto.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                <div>
                  <span className="font-medium">Upload:</span>{' '}
                  {new Date(selectedPhoto.upload_date).toLocaleDateString()}
                </div>
                {selectedPhoto.taken_date && (
                  <div>
                    <span className="font-medium">Tirada:</span>{' '}
                    {new Date(selectedPhoto.taken_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const newCaption = prompt('Nova legenda:', selectedPhoto.caption || '');
                    if (newCaption !== null) {
                      updateMetadata(selectedPhoto.id, newCaption, selectedPhoto.tags || []);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  ✏️ Editar Legenda
                </button>
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGalleryTab;

