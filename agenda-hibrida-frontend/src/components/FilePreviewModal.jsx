import React, { useState, useEffect, useCallback } from 'react';
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
  const [pdfLoadError, setPdfLoadError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Reset zoom quando mudar de arquivo
  useEffect(() => {
    setZoom(100);
    setError(null);
    setPdfLoadError(false);
  }, [file?.id]);

  // Handlers com useCallback ANTES do early return
  const handlePrevious = useCallback(() => {
    if (!onNavigate || !file) return;
    
    const previewable = allFiles.filter(f => 
      f.mime_type?.startsWith('image/') || f.mime_type === 'application/pdf'
    );
    const idx = previewable.findIndex(f => f.id === file.id);
    
    if (idx > 0) {
      onNavigate(previewable[idx - 1]);
    }
  }, [onNavigate, allFiles, file]);

  const handleNext = useCallback(() => {
    if (!onNavigate || !file) return;
    
    const previewable = allFiles.filter(f => 
      f.mime_type?.startsWith('image/') || f.mime_type === 'application/pdf'
    );
    const idx = previewable.findIndex(f => f.id === file.id);
    
    if (idx >= 0 && idx < previewable.length - 1) {
      onNavigate(previewable[idx + 1]);
    }
  }, [onNavigate, allFiles, file]);

  // Listener de teclado para atalhos
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  // Early return DEPOIS de todos os hooks
  if (!file) return null;

  const isImage = file.mime_type?.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';
  const canPreview = isImage || isPDF;

  // URL do preview
  const previewUrl = `${API_URL}/api/files/${file.id}/preview`;
  const downloadUrl = `${API_URL}/api/files/${file.id}/download`;

  // Encontrar índice atual e arquivos do mesmo tipo
  const previewableFiles = allFiles.filter(f => 
    f.mime_type?.startsWith('image/') || f.mime_type === 'application/pdf'
  );
  const currentIndex = previewableFiles.findIndex(f => f.id === file.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < previewableFiles.length - 1;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{file.original_name || file.filename}</DialogTitle>
          <DialogDescription>
            {file.mime_type} • {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
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
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
                <img
                  src={previewUrl}
                  alt={file.original_name || file.filename}
                  style={{ 
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                  onError={handleImageError}
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {!error && isPDF && (
            <>
              {pdfLoadError ? (
                <div className="text-center">
                  <p className="text-red-600 mb-4">Erro ao carregar PDF. Tente fazer o download do arquivo.</p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  title={file.original_name || file.filename}
                  className="w-full h-full border-0 rounded"
                  onLoad={(e) => {
                    // Tentar detectar erro de carregamento
                    try {
                      const iframeDoc = e.target.contentDocument || e.target.contentWindow?.document;
                      if (!iframeDoc || iframeDoc.body?.textContent?.includes('error')) {
                        setPdfLoadError(true);
                      }
                    } catch (err) {
                      // Erro de CORS esperado, PDF provavelmente carregou corretamente
                      console.debug('CORS esperado ao verificar iframe', err);
                    }
                  }}
                />
              )}
            </>
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
