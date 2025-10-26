import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ImagePreview({ 
  open, 
  onClose, 
  image, 
  images = [], 
  currentIndex = 0,
  onNavigate 
}) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Reset zoom e posição quando mudar de imagem
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [image])

  useEffect(() => {
    // Atalhos de teclado
    const handleKeyDown = (e) => {
      if (!open) return
      
      switch(e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (currentIndex > 0 && onNavigate) {
            onNavigate(currentIndex - 1)
          }
          break
        case 'ArrowRight':
          if (currentIndex < images.length - 1 && onNavigate) {
            onNavigate(currentIndex + 1)
          }
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          setZoom(1)
          setPosition({ x: 0, y: 0 })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex, images.length])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    if (!image) return
    
    try {
      const url = image.file_url.startsWith('http') 
        ? image.file_url 
        : `${API_URL}${image.file_url}`
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = image.original_name || 'image.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
    }
  }

  if (!image) return null

  const imageUrl = image.file_url?.startsWith('http') 
    ? image.file_url 
    : `${API_URL}${image.file_url}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-full h-screen' : 'max-w-7xl'} p-0 bg-black/95 border-none`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Barra de ferramentas superior */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium truncate max-w-md">
              {image.original_name}
            </h3>
            {images.length > 1 && (
              <span className="text-white/60 text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            
            <span className="text-white text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/10"
            >
              <Download className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Área da imagem */}
        <div 
          className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt={image.original_name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        </div>

        {/* Navegação entre imagens */}
        {images.length > 1 && onNavigate && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(currentIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}
            
            {currentIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(currentIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 w-12 h-12"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </>
        )}

        {/* Informações da imagem (rodapé) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <div className="flex items-center space-x-4">
              {image.file_size && (
                <span>{(image.file_size / 1024 / 1024).toFixed(2)} MB</span>
              )}
              {image.mime_type && (
                <span>{image.mime_type}</span>
              )}
            </div>
            
            {image.created_at && (
              <span>
                {new Date(image.created_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {/* Dica de navegação */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs text-center">
          Use ← → para navegar • +/- para zoom • ESC para fechar
        </div>
      </DialogContent>
    </Dialog>
  )
}

