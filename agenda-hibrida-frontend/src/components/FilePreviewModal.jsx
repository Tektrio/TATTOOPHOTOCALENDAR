import { useState, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '../utils/syncHelpers';

/**
 * Modal de preview de arquivos
 * Suporta visualização de imagens e PDFs
 */
export default function FilePreviewModal({ file, files = [], onClose, onDownload }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    return files.findIndex(f => f.id === file?.id) || 0;
  });

  if (!file) return null;

  const currentFile = files[currentIndex] || file;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Adicionar event listener para atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrevious, hasNext, onClose]);

  const isImage = () => {
    const ext = currentFile.file_type?.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext);
  };

  const isPDF = () => {
    return currentFile.file_type?.toLowerCase() === '.pdf';
  };

  const getPreviewUrl = () => {
    // Para demonstração, retornamos um placeholder
    // Em produção, isso deveria retornar a URL real do arquivo
    if (isImage()) {
      return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23334155" width="400" height="400"/><text x="50%" y="50%" font-size="20" fill="%23fff" text-anchor="middle" dy=".3em">Preview: ${currentFile.file_name}</text></svg>`;
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[90vh] bg-gray-900 rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{currentFile.file_name}</h3>
            <p className="text-sm text-gray-400">
              {formatFileSize(currentFile.file_size)} • {currentFile.file_type}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(currentFile)}
                className="text-white hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
          {isImage() ? (
            <img
              src={getPreviewUrl()}
              alt={currentFile.file_name}
              className="max-w-full max-h-full object-contain rounded"
            />
          ) : isPDF() ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">📄</div>
              <p className="text-white text-lg">{currentFile.file_name}</p>
              <p className="text-gray-400">Preview de PDF não disponível no momento</p>
              {onDownload && (
                <Button
                  variant="default"
                  onClick={() => onDownload(currentFile)}
                  className="mt-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">📄</div>
              <p className="text-white text-lg">{currentFile.file_name}</p>
              <p className="text-gray-400">Preview não disponível para este tipo de arquivo</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {files.length > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <span className="text-sm text-gray-400">
              {currentIndex + 1} de {files.length}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!hasNext}
              className="text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

