'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Grid3x3,
  List,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Photo {
  id: number;
  url: string;
  title?: string;
  client_name?: string;
  tattoo_type?: string;
  artist?: string;
  uploaded_at: string;
}

export default function GaleriaPage() {
  const { isDark } = useTheme();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [searchTerm, filterType, photos]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(photo =>
        photo.title?.toLowerCase().includes(term) ||
        photo.client_name?.toLowerCase().includes(term) ||
        photo.artist?.toLowerCase().includes(term)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(photo => photo.tattoo_type === filterType);
    }

    setFilteredPhotos(filtered);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setSelectedPhoto(filteredPhotos[index]);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
    setSelectedPhoto(null);
  };

  const nextPhoto = () => {
    const nextIndex = (lightboxIndex + 1) % filteredPhotos.length;
    setLightboxIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  const prevPhoto = () => {
    const prevIndex = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ImageIcon className="w-8 h-8 mr-3" />
            Galeria de Fotos
          </h2>
          <p className="text-gray-400 mt-1">{filteredPhotos.length} fotos</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload Fotos
        </Button>
      </div>

      {/* Filtros */}
      <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, cliente ou artista..."
                className="pl-10 bg-gray-900 text-white border-gray-600"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-600 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Grande">Grande</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Pequena">Pequena</SelectItem>
                <SelectItem value="Retoque">Retoque</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid/List de Fotos */}
      {loading ? (
        <div className="text-center text-white py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
          <p className="mt-4">Carregando galeria...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <Card className={`backdrop-blur-md ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'}`}>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">
              {searchTerm || filterType !== 'all' ? 'Nenhuma foto encontrada' : 'Nenhuma foto na galeria'}
            </h3>
            <p className="text-purple-200">
              {searchTerm || filterType !== 'all' ? 'Tente ajustar os filtros' : 'Faça upload das primeiras fotos'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, index) => (
            <Card 
              key={photo.id} 
              className={`backdrop-blur-md overflow-hidden group cursor-pointer transition-all hover:scale-105 ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'
              }`}
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Foto'} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3">
                    <ZoomIn className="w-8 h-8 text-white mb-2" />
                    {photo.title && <p className="text-white text-sm font-semibold text-center">{photo.title}</p>}
                    {photo.client_name && <p className="text-gray-300 text-xs text-center">{photo.client_name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map((photo, index) => (
            <Card 
              key={photo.id} 
              className={`backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/10 border-white/20'
              }`}
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={photo.title || 'Foto'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{photo.title || 'Sem título'}</h3>
                    {photo.client_name && <p className="text-gray-300 text-sm">{photo.client_name}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      {photo.tattoo_type && <span>Tipo: {photo.tattoo_type}</span>}
                      {photo.artist && <span>Artista: {photo.artist}</span>}
                      <span>{new Date(photo.uploaded_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <ZoomIn className="w-6 h-6 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxIndex >= 0} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-5xl bg-black/95 border-gray-800 p-0">
          {selectedPhoto && (
            <div className="relative">
              {/* Botão Fechar */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navegação */}
              {filteredPhotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}

              {/* Imagem */}
              <div className="flex items-center justify-center min-h-[60vh] max-h-[80vh]">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title || 'Foto'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Informações */}
              <div className="bg-black/80 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedPhoto.title || 'Sem título'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {selectedPhoto.client_name && (
                    <div>
                      <p className="text-gray-400">Cliente</p>
                      <p className="font-semibold">{selectedPhoto.client_name}</p>
                    </div>
                  )}
                  {selectedPhoto.tattoo_type && (
                    <div>
                      <p className="text-gray-400">Tipo</p>
                      <p className="font-semibold">{selectedPhoto.tattoo_type}</p>
                    </div>
                  )}
                  {selectedPhoto.artist && (
                    <div>
                      <p className="text-gray-400">Artista</p>
                      <p className="font-semibold">{selectedPhoto.artist}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Data</p>
                    <p className="font-semibold">{new Date(selectedPhoto.uploaded_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-4">
                  {lightboxIndex + 1} de {filteredPhotos.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

