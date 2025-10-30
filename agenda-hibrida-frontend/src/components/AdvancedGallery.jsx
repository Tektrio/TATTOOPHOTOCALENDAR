import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  FolderOpen,
  Image as ImageIcon,
  Video,
  FileText,
  Calendar,
  User,
  Tag,
  Star,
  Heart,
  ExternalLink,
  Copy,
  Move,
  Archive,
  RefreshCw,
  Settings,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react'

const API_URL = 'http://localhost:5000'

export default function AdvancedGallery() {
  const [files, setFiles] = useState([])
  const [clients, setClients] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Estados de visualização
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedFiles, setSelectedFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  
  // Estados do visualizador
  const [showViewer, setShowViewer] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  
  // Estados de upload
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  
  const [newFiles, setNewFiles] = useState({
    client_id: '',
    category: 'referencias',
    files: [],
    tags: '',
    notes: ''
  })

  // Carregar categorias dinâmicas do backend
  const { categories: dynamicCategories } = useCategories();
  const categoryOptions = dynamicCategories.length > 0 ? dynamicCategories : [
    { value: 'referencias', label: 'Referências', icon: '🎨', color: '#3B82F6' },
    { value: 'fotos_finais', label: 'Fotos Finais', icon: '📸', color: '#8B5CF6' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortFiles()
  }, [searchTerm, filterClient, filterCategory, sortBy])

  const loadData = async () => {
    try {
      setLoading(true)
      const [filesRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/api/files`),
        fetch(`${API_URL}/api/clients`)
      ])
      
      const filesData = await filesRes.json()
      const clientsData = await clientsRes.json()
      
      setFiles(filesData)
      setClients(clientsData)
      
      // Extrair categorias únicas dos arquivos
      const uniqueCategories = [...new Set(filesData.map(f => f.category))]
      setCategories(uniqueCategories)
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortFiles = () => {
    let filtered = [...files]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por cliente
    if (filterClient) {
      filtered = filtered.filter(file => file.client_id.toString() === filterClient)
    }

    // Filtrar por categoria
    if (filterCategory) {
      filtered = filtered.filter(file => file.category === filterCategory)
    }

    // Ordenar
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'name_asc':
        filtered.sort((a, b) => a.filename.localeCompare(b.filename))
        break
      case 'name_desc':
        filtered.sort((a, b) => b.filename.localeCompare(a.filename))
        break
      case 'size_desc':
        filtered.sort((a, b) => (b.file_size || 0) - (a.file_size || 0))
        break
    }

    return filtered
  }

  const handleFileUpload = async (uploadFiles) => {
    if (!newFiles.client_id || uploadFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('client_id', newFiles.client_id)
      formData.append('category', newFiles.category)
      formData.append('tags', newFiles.tags)
      formData.append('notes', newFiles.notes)

      uploadFiles.forEach((file, index) => {
        formData.append(`files`, file)
      })

      const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      if (response.ok) {
        setShowUploadModal(false)
        setNewFiles({ client_id: '', category: 'referencias', files: [], tags: '', notes: '' })
        loadData()
      }
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    
    if (imageFiles.length > 0) {
      setNewFiles(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }))
    }
  }

  const openViewer = (fileIndex) => {
    const filteredFiles = filterAndSortFiles()
    const imageFiles = filteredFiles.filter(file => 
      file.mime_type?.startsWith('image/') || file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    )
    
    const imageIndex = imageFiles.findIndex(img => img.id === filteredFiles[fileIndex].id)
    if (imageIndex !== -1) {
      setCurrentImageIndex(imageIndex)
      setShowViewer(true)
      setZoomLevel(1)
      setRotation(0)
    }
  }

  const navigateImage = (direction) => {
    const filteredFiles = filterAndSortFiles()
    const imageFiles = filteredFiles.filter(file => 
      file.mime_type?.startsWith('image/') || file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    )
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % imageFiles.length)
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length)
    }
    setZoomLevel(1)
    setRotation(0)
  }

  const getFileIcon = (file) => {
    if (file.mime_type?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    if (file.mime_type?.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCategoryInfo = (category) => {
    return categoryOptions.find(cat => cat.value === category) || 
           { label: category, icon: '📁', color: '#6B7280' }
  }

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const filteredFiles = filterAndSortFiles()
  const imageFiles = filteredFiles.filter(file => 
    file.mime_type?.startsWith('image/') || file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Galeria Visual</h2>
          <p className="text-purple-200">Organize e visualize todos os trabalhos dos seus clientes</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowUploadModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-white text-sm">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar arquivos..."
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white text-sm">Cliente</Label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm">Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm">Ordenar por</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Mais recentes</SelectItem>
                  <SelectItem value="date_asc">Mais antigos</SelectItem>
                  <SelectItem value="name_asc">Nome A-Z</SelectItem>
                  <SelectItem value="name_desc">Nome Z-A</SelectItem>
                  <SelectItem value="size_desc">Maior tamanho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('')
                  setFilterClient('')
                  setFilterCategory('')
                  setSortBy('date_desc')
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{filteredFiles.length}</div>
            <div className="text-sm text-purple-200">Arquivos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{imageFiles.length}</div>
            <div className="text-sm text-purple-200">Imagens</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{selectedFiles.length}</div>
            <div className="text-sm text-purple-200">Selecionados</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {getFileSize(filteredFiles.reduce((acc, file) => acc + (file.file_size || 0), 0))}
            </div>
            <div className="text-sm text-purple-200">Tamanho Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Galeria */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file, index) => {
            const categoryInfo = getCategoryInfo(file.category)
            const isSelected = selectedFiles.includes(file.id)
            
            return (
              <Card 
                key={file.id} 
                className={`bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all cursor-pointer group ${
                  isSelected ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square mb-2">
                    {file.mime_type?.startsWith('image/') ? (
                      <img
                        src={file.thumbnail_url || file.file_url || '/api/placeholder/150/150'}
                        alt={file.filename}
                        className="w-full h-full object-cover rounded-md"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          openViewer(index)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-md flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <Badge 
                        className="text-xs"
                        style={{ backgroundColor: categoryInfo.color }}
                      >
                        {categoryInfo.icon}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          openViewer(index)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-500/20 rounded-md flex items-center justify-center">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-white text-xs font-medium truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-purple-200 text-xs truncate">
                      {file.client_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 text-xs">
                        {getFileSize(file.file_size)}
                      </span>
                      <span className="text-purple-300 text-xs">
                        {new Date(file.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {filteredFiles.map((file, index) => {
                const categoryInfo = getCategoryInfo(file.category)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <div 
                    key={file.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-center space-x-4 ${
                      isSelected ? 'bg-purple-500/10' : ''
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <div className="flex-shrink-0">
                      {file.mime_type?.startsWith('image/') ? (
                        <img
                          src={file.thumbnail_url || file.file_url || '/api/placeholder/60/60'}
                          alt={file.filename}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-medium truncate">{file.filename}</p>
                        <Badge 
                          className="text-xs flex-shrink-0"
                          style={{ backgroundColor: categoryInfo.color }}
                        >
                          {categoryInfo.icon} {categoryInfo.label}
                        </Badge>
                      </div>
                      <p className="text-purple-200 text-sm">{file.client_name}</p>
                      <div className="flex items-center space-x-4 text-purple-300 text-xs mt-1">
                        <span>{getFileSize(file.file_size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString('pt-BR')}</span>
                        {file.tags && <span>🏷️ {file.tags}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          openViewer(index)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredFiles.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-purple-200 mb-6">
              {searchTerm || filterClient || filterCategory 
                ? 'Tente ajustar os filtros de busca'
                : 'Faça upload dos primeiros arquivos para começar'
              }
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Upload */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Upload de Arquivos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione imagens e documentos à galeria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Cliente</Label>
                <Select 
                  value={newFiles.client_id}
                  onValueChange={(value) => setNewFiles({...newFiles, client_id: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Categoria</Label>
                <Select 
                  value={newFiles.category}
                  onValueChange={(value) => setNewFiles({...newFiles, category: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Zona de drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-white mb-2">Arraste arquivos aqui ou clique para selecionar</p>
              <p className="text-gray-400 text-sm">Suporta imagens (JPG, PNG, GIF) e vídeos (MP4, MOV)</p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files)
                  setNewFiles(prev => ({ ...prev, files: [...prev.files, ...selectedFiles] }))
                }}
              />
            </div>

            {/* Lista de arquivos selecionados */}
            {newFiles.files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white">Arquivos Selecionados ({newFiles.files.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {newFiles.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span className="text-white text-sm truncate">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewFiles(prev => ({
                            ...prev,
                            files: prev.files.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-white">Tags (separadas por vírgula)</Label>
              <Input
                value={newFiles.tags}
                onChange={(e) => setNewFiles({...newFiles, tags: e.target.value})}
                placeholder="Ex: braço, colorida, dragão"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Enviando arquivos...</span>
                  <span className="text-white">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleFileUpload(newFiles.files)} 
                className="flex-1"
                disabled={!newFiles.client_id || newFiles.files.length === 0 || uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Enviando...' : `Enviar ${newFiles.files.length} arquivo(s)`}
              </Button>
              <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visualizador de Imagens */}
      {showViewer && imageFiles.length > 0 && (
        <Dialog open={showViewer} onOpenChange={setShowViewer}>
          <DialogContent className="bg-black/95 border-none max-w-full max-h-full w-screen h-screen p-0">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Controles superiores */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
                  <span className="text-white text-sm">
                    {currentImageIndex + 1} de {imageFiles.length}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {imageFiles[currentImageIndex]?.filename}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
                  <Button size="sm" variant="ghost" onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.2))}>
                    <ZoomOut className="w-4 h-4 text-white" />
                  </Button>
                  <span className="text-white text-sm min-w-12 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.2))}>
                    <ZoomIn className="w-4 h-4 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRotation(prev => prev + 90)}>
                    <RotateCw className="w-4 h-4 text-white" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowViewer(false)}>
                    <X className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>

              {/* Navegação */}
              {imageFiles.length > 1 && (
                <>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="ghost"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </Button>
                </>
              )}

              {/* Imagem */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={imageFiles[currentImageIndex]?.file_url || '/api/placeholder/800/600'}
                  alt={imageFiles[currentImageIndex]?.filename}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    cursor: zoomLevel > 1 ? 'grab' : 'default'
                  }}
                  draggable={false}
                />
              </div>

              {/* Informações da imagem */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm">
                  <div>
                    <span className="text-gray-300">Cliente:</span> {imageFiles[currentImageIndex]?.client_name}
                  </div>
                  <div>
                    <span className="text-gray-300">Categoria:</span> {getCategoryInfo(imageFiles[currentImageIndex]?.category).label}
                  </div>
                  <div>
                    <span className="text-gray-300">Data:</span> {new Date(imageFiles[currentImageIndex]?.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
