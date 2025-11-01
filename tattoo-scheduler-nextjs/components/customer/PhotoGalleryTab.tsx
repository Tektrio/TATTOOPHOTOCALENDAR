'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Plus, Upload } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  title?: string;
  uploaded_at: string;
}

interface PhotoGalleryTabProps {
  customerId: number;
}

export default function PhotoGalleryTab({ customerId }: PhotoGalleryTabProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, [customerId]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${customerId}/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-white py-8">Carregando galeria...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Galeria de Fotos</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Fotos
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="text-center py-12">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white">Nenhuma foto cadastrada</p>
            <p className="text-gray-400 text-sm mt-2">Faça upload das fotos das tatuagens do cliente</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="bg-gray-800/50 border-gray-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Foto'} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm">{photo.title || 'Ver foto'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

