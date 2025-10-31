import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const FilePreviewModal = ({ 
  file, 
  isOpen, 
  onClose, 
  allFiles = [], 
  onNavigate 
}) => {
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Reset zoom quando mudar de arquivo
  useEffect(() => {
    setZoom(100);
    setError(null);
  }, [file?.id]);

  if (!file) return null;

  const isImage = file.mime_type?.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';
  const canPreview = isImage || isPDF;

  // URL do preview
  const previewUrl = `${API_URL}/api/files/${file.id}/preview`;
  const downloadUrl = `${API_URL}/api/customers/${file.client_id}/files/${file.id}`;

  // Encontrar índice atual e arquivos do mesmo tipo
  const previewableFiles = allFiles.filter(f => 
    f.mime_type?.startsWith('image/') || f.mime_type === 'application/pdf'
  );
  const currentIndex = previewableFiles.findIndex(f => f.id === file.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < previewableFiles.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      onNavigate(previewableFiles[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(previewableFiles[currentIndex + 1]);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleImageError = () => {
    setError('Erro ao carregar imagem. Arquivo pode estar corrompido ou inacessível.');
  };

  const handlePDFError = () => {
    setError('Erro ao carregar PDF. Tente fazer o download do arquivo.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{file.original_name || file.filename}</DialogTitle>
          <DialogDescription>
            {file.mime_type} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            {/* Navegação */}
            {previewableFiles.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} / {previewableFiles.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-2" />
              </>
            )}

            {/* Zoom (apenas para imagens) */}
            {isImage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 rounded-lg flex items-center justify-center p-4">
          {!canPreview && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Preview não disponível para este tipo de arquivo
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          )}

          {!error && isImage && (
            <div className="overflow-auto w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt={file.original_name || file.filename}
                style={{ 
                  width: `${zoom}%`,
                  height: 'auto',
                  maxWidth: 'none'
                }}
                onError={handleImageError}
                className="object-contain"
              />
            </div>
          )}

          {!error && isPDF && (
            <iframe
              src={previewUrl}
              title={file.original_name || file.filename}
              className="w-full h-full border-0 rounded"
              onError={handlePDFError}
            />
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Atalhos: ← Anterior | → Próximo | ESC Fechar
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
