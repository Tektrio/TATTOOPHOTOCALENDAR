import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  Folder, 
  File, 
  FolderPlus,
  Upload,
  Cloud,
  AlertCircle,
  ChevronRight,
  Home,
  FolderOpen,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Video,
  HardDrive,
  X,
  UploadCloud,
  MoreVertical,
  Download,
  Edit2,
  Trash2,
  Grid3x3,
  List,
  Search,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function GoogleDriveExplorerSimples() {
  // Estados básicos
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Meu Drive' }])
  const [storageInfo, setStorageInfo] = useState(null)
  
  // Drag and Drop
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [uploadProgress, setUploadProgress] = useState({})
  
  // Criar pasta
  const [createFolderDialog, setCreateFolderDialog] = useState({ open: false, name: '' })
  
  // 🆕 NOVAS FUNCIONALIDADES TIPO GOOGLE DRIVE
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [renameDialog, setRenameDialog] = useState({ open: false, item: null, newName: '' })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
  const [detailsDialog, setDetailsDialog] = useState({ open: false, item: null })

  // ===== CARREGAR DADOS =====
  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected) {
      loadFiles(currentFolder)
      loadStorageInfo()
    }
  }, [isConnected, currentFolder])

  // ===== PROTEÇÃO: LIMPAR ESTADO DE DRAG AUTOMATICAMENTE =====
  useEffect(() => {
    if (draggedItem) {
      // Timeout de segurança: limpa o estado após 5 segundos
      const timeout = setTimeout(() => {
        console.log('⚠️ Timeout: limpando estado de drag preso')
        setDraggedItem(null)
        setDropTarget(null)
        setJustDropped(false)
      }, 5000)

      // Listener global para escape key - permite cancelar o drag
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          console.log('⎋ Escape: cancelando drag')
          setDraggedItem(null)
          setDropTarget(null)
          setJustDropped(false)
        }
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [draggedItem])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/status`)
      const data = await response.json()
      setIsConnected(data.authenticated)
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
      setIsConnected(false)
    }
  }

  const loadFiles = async (folderId) => {
    setLoading(true)
    try {
      const folderParam = folderId ? folderId.replace('gdrive_', '') : 'root'
      const response = await fetch(`${API_URL}/api/drive/files?folderId=${folderParam}`)
      const data = await response.json()
      
      // O endpoint retorna um array direto, não um objeto {success, files}
      if (Array.isArray(data)) {
        setFiles(data)
      } else {
        toast.error('Erro ao carregar arquivos')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao conectar com servidor')
    } finally {
      setLoading(false)
    }
  }

  const loadStorageInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/about`)
      const data = await response.json()
      // O endpoint retorna os dados direto, não em {success, storageInfo}
      if (data && data.limit) {
        setStorageInfo(data)
      }
    } catch (error) {
      console.error('Erro ao carregar storage:', error)
    }
  }

  // ===== NAVEGAÇÃO =====
  const navigateToFolder = (folder) => {
    setCurrentFolder(folder.id)
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.original_name }])
  }

  const navigateToBreadcrumb = (index) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1)
    setBreadcrumbs(newBreadcrumbs)
    setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id)
  }

  // ===== CRIAR PASTA =====
  const handleCreateFolder = async () => {
    if (!createFolderDialog.name.trim()) {
      toast.error('Digite um nome para a pasta')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createFolderDialog.name,
          parentId: currentFolder?.replace('gdrive_', '') || 'root'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`✅ Pasta "${createFolderDialog.name}" criada!`)
        setCreateFolderDialog({ open: false, name: '' })
        loadFiles(currentFolder)
      } else {
        toast.error(data.error || 'Erro ao criar pasta')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar pasta')
    }
  }

  // ===== UPLOAD =====
  const uploadFiles = async (filesToUpload) => {
    const formData = new FormData()
    
    Array.from(filesToUpload).forEach(file => {
      formData.append('files', file)
    })

    const folderId = currentFolder?.replace('gdrive_', '') || 'root'
    formData.append('folderId', folderId)

    try {
      const response = await fetch(`${API_URL}/api/drive/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`✅ ${filesToUpload.length} arquivo(s) enviado(s)!`)
        loadFiles(currentFolder)
        loadStorageInfo()
      } else {
        toast.error(data.error || 'Erro no upload')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao enviar arquivos')
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFiles(files)
    }
  }

  // ===== DRAG AND DROP ENTRE PASTAS =====
  const [justDropped, setJustDropped] = useState(false)

  const handleItemDragStart = (e, item) => {
    e.stopPropagation()
    setDraggedItem(item)
    setJustDropped(false)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    console.log('🎯 Iniciando drag:', item.original_name)
  }

  const handleItemDragEnd = (e) => {
    e.stopPropagation()
    console.log('🏁 Finalizando drag')
    // Aguarda um pouco antes de limpar draggedItem para prevenir click
    setTimeout(() => {
      setDraggedItem(null)
      setDropTarget(null)
    }, 100)
  }

  const handleFolderDragOver = (e, folder) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Log removido para melhorar performance (era chamado dezenas de vezes por segundo)
    
    if (draggedItem && draggedItem.id !== folder.id) {
      e.dataTransfer.dropEffect = 'move'
      // Só atualizar dropTarget se mudou (reduz re-renders)
      if (dropTarget !== folder.id) {
        setDropTarget(folder.id)
      }
    }
  }

  const handleFolderDragLeave = (e, folder) => {
    e.preventDefault()
    e.stopPropagation()
    // Só limpa o dropTarget se estamos realmente saindo da pasta
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      if (dropTarget === folder.id) {
        setDropTarget(null)
      }
    }
  }

  const handleFolderDrop = async (e, targetFolder) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('📦 Drop na pasta:', targetFolder.original_name, 'draggedItem:', draggedItem?.original_name)
    setDropTarget(null)
    setJustDropped(true)

    // 🎯 UPLOAD DE ARQUIVOS DO PC
    if (!draggedItem) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        console.log('📤 Upload de', droppedFiles.length, 'arquivos do PC')
        toast.info(`📤 Enviando ${droppedFiles.length} arquivo(s) para "${targetFolder.original_name}"...`)
        
        const formData = new FormData()
        droppedFiles.forEach(file => formData.append('files', file))
        formData.append('folderId', targetFolder.id.replace('gdrive_', ''))

        try {
          const response = await fetch(`${API_URL}/api/drive/upload`, {
            method: 'POST',
            body: formData
          })

          const data = await response.json()
          
          if (data.success) {
            toast.success(`✅ ${droppedFiles.length} arquivo(s) enviado(s) para "${targetFolder.original_name}"!`)
            loadFiles(currentFolder)
            loadStorageInfo()
          } else {
            toast.error(data.error || 'Erro no upload')
          }
        } catch (error) {
          console.error('Erro:', error)
          toast.error('Erro ao enviar arquivos')
        }
        setTimeout(() => setJustDropped(false), 500)
        return
      }
      setTimeout(() => setJustDropped(false), 500)
      return
    }

    // 🎯 MOVER ARQUIVO/PASTA
    console.log('🔄 Movendo item do Drive:', draggedItem.original_name, '→', targetFolder.original_name)
    
    if (draggedItem.id === targetFolder.id) {
      toast.error('❌ Não é possível mover para a mesma pasta')
      setDraggedItem(null)
      setTimeout(() => setJustDropped(false), 500)
      return
    }

    try {
      toast.info(`📦 Movendo "${draggedItem.original_name}" para "${targetFolder.original_name}"...`)
      
      const response = await fetch(`${API_URL}/api/drive/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: draggedItem.id.replace('gdrive_', ''),
          targetFolderId: targetFolder.id.replace('gdrive_', '')
        })
      })

      const data = await response.json()
      console.log('Resposta do servidor:', data)
      
      if (data.success) {
        toast.success(`✅ "${draggedItem.original_name}" movido para "${targetFolder.original_name}"!`)
        // Aguarda um pouco para garantir que o Google Drive processou
        setTimeout(() => {
          loadFiles(currentFolder)
          setJustDropped(false)
        }, 500)
      } else {
        toast.error(data.error || 'Erro ao mover')
        setTimeout(() => setJustDropped(false), 500)
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao mover arquivo')
      setTimeout(() => setJustDropped(false), 500)
    } finally {
      // Limpa o item arrastado após um pequeno delay
      setTimeout(() => setDraggedItem(null), 100)
    }
  }

  // ===== DRAG AND DROP ÁREA GERAL =====
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Só ativa a área de drop se NÃO estiver arrastando um item interno
    if (!draggedItem) {
      // Verifica se há arquivos sendo arrastados (do computador)
      const hasFiles = e.dataTransfer.types && e.dataTransfer.types.includes('Files')
      if (hasFiles) {
        setIsDragging(true)
      }
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Só permite drop se não estiver arrastando item interno
    if (!draggedItem) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // Só faz upload se não estiver arrastando item interno
    if (!draggedItem) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        uploadFiles(droppedFiles)
      }
    }
  }

  // ===== 🆕 NOVAS FUNCIONALIDADES DO GOOGLE DRIVE =====
  
  // RENOMEAR
  const handleRename = async () => {
    if (!renameDialog.newName.trim()) {
      toast.error('Digite um novo nome')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: renameDialog.item.id.replace('gdrive_', ''),
          newName: renameDialog.newName
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`✅ Renomeado para "${renameDialog.newName}"`)
        setRenameDialog({ open: false, item: null, newName: '' })
        loadFiles(currentFolder)
      } else {
        toast.error(data.error || 'Erro ao renomear')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao renomear')
    }
  }

  // DELETAR
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: deleteDialog.item.id.replace('gdrive_', '')
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`✅ "${deleteDialog.item.original_name}" deletado`)
        setDeleteDialog({ open: false, item: null })
        loadFiles(currentFolder)
        loadStorageInfo()
      } else {
        toast.error(data.error || 'Erro ao deletar')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao deletar')
    }
  }

  // DOWNLOAD
  const handleDownload = async (item) => {
    if (item.is_folder) {
      toast.error('Não é possível baixar pastas diretamente')
      return
    }

    try {
      toast.info('📥 Iniciando download...')
      const fileId = item.id.replace('gdrive_', '')
      window.open(`${API_URL}/api/drive/download/${fileId}`, '_blank')
      toast.success('✅ Download iniciado!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao fazer download')
    }
  }

  // SELEÇÃO MÚLTIPLA
  const toggleSelection = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
    setSelectionMode(true)
  }

  const clearSelection = () => {
    setSelectedItems([])
    setSelectionMode(false)
  }

  const deleteSelected = async () => {
    if (selectedItems.length === 0) return

    const confirmed = window.confirm(`Deletar ${selectedItems.length} item(ns)?`)
    if (!confirmed) return

    try {
      for (const item of selectedItems) {
        await fetch(`${API_URL}/api/drive/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: item.id.replace('gdrive_', '') })
        })
      }
      
      toast.success(`✅ ${selectedItems.length} item(ns) deletado(s)`)
      clearSelection()
      loadFiles(currentFolder)
      loadStorageInfo()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao deletar itens')
    }
  }

  // ===== UTILITÁRIOS =====
  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) return 'Desconhecido'
    if (bytes === 0) return '0 Bytes'
    const kb = bytes / 1024
    const mb = kb / 1024
    const gb = mb / 1024
    
    if (gb >= 1) return `${gb.toFixed(2)} GB`
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  const getFileIcon = (file) => {
    if (file.is_folder) return <FolderOpen className="w-6 h-6 text-blue-400" />
    
    // Detectar arquivos PSD
    const isPsd = file.original_name?.toLowerCase().endsWith('.psd') || 
                  file.mime_type?.includes('photoshop') ||
                  file.mimeType?.includes('photoshop');
    
    if (isPsd) return <ImageIcon className="w-6 h-6 text-purple-500" /> // Ícone roxo para PSD
    if (file.mimeType?.includes('image') || file.mime_type?.includes('image')) return <ImageIcon className="w-6 h-6 text-green-400" />
    if (file.mimeType?.includes('video') || file.mime_type?.includes('video')) return <Video className="w-6 h-6 text-purple-400" />
    if (file.mimeType?.includes('pdf') || file.mime_type?.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />
    return <File className="w-6 h-6 text-gray-400" />
  }

  // ===== FILTRAR ARQUIVOS =====
  const filteredFiles = files.filter(file =>
    file.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const folders = filteredFiles.filter(f => f.is_folder)
  const regularFiles = filteredFiles.filter(f => !f.is_folder)

  // ===== RENDER: NÃO CONECTADO =====
  if (!isConnected) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="inline-block p-4 bg-yellow-500/20 rounded-full mb-4">
              <AlertCircle className="w-16 h-16 text-yellow-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">
              Google Drive não conectado
            </h3>
            <p className="text-purple-200 mb-6">
              Conecte-se ao Google Drive para começar
            </p>
            <Button 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => window.location.reload()}
            >
              <Cloud className="w-4 h-4 mr-2" />
              Conectar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ===== RENDER: CONECTADO =====
  return (
    <div className="space-y-6 relative">
      {/* Indicador de arrasto ativo */}
      {draggedItem && (
        <div className="fixed top-24 right-8 z-50 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-purple-400 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              {draggedItem.is_folder ? (
                <Folder className="w-6 h-6" />
              ) : (
                <File className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm">Arrastando...</p>
              <p className="text-xs opacity-90 max-w-[200px] truncate">{draggedItem.original_name}</p>
              <p className="text-xs opacity-75 mt-1">↓ Solte em uma pasta para mover</p>
            </div>
          </div>
        </div>
      )}
      {/* ===== HEADER: Storage Info ===== */}
      {storageInfo && (
        <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border-white/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {formatFileSize(storageInfo.usage)} de {formatFileSize(storageInfo.limit)}
                  </h3>
                  <p className="text-purple-200 text-sm">
                    {((storageInfo.usage / storageInfo.limit) * 100).toFixed(1)}% usado
                  </p>
                </div>
              </div>
              {storageInfo.user && (
                <div className="flex items-center space-x-3">
                  {storageInfo.user.photoLink && (
                    <img 
                      src={storageInfo.user.photoLink} 
                      alt={storageInfo.user.displayName}
                      className="w-12 h-12 rounded-full border-2 border-white/30"
                    />
                  )}
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{storageInfo.user.displayName}</p>
                    <p className="text-purple-300 text-xs">{storageInfo.user.emailAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== MAIN: Explorador ===== */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          {/* ===== BREADCRUMBS ===== */}
          <div className="flex items-center space-x-2 mb-6">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-purple-300 mx-1" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    index === breadcrumbs.length - 1
                      ? 'bg-purple-500/30 text-white font-semibold'
                      : 'text-purple-200 hover:bg-white/10'
                  }`}
                >
                  {index === 0 ? <Home className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                  <span>{crumb.name}</span>
                </button>
              </div>
            ))}
          </div>

          {/* ===== 🆕 TOOLBAR SUPERIOR: Busca & Views ===== */}
          <div className="flex items-center justify-between mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
              <Input
                type="text"
                placeholder="Buscar arquivos e pastas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Modes & Selection */}
            <div className="flex items-center space-x-3 ml-4">
              {/* Seleção Múltipla */}
              {selectionMode && (
                <div className="flex items-center space-x-2 bg-purple-500/20 px-3 py-2 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    {selectedItems.length} selecionado(s)
                  </span>
                  {selectedItems.length > 0 && (
                    <Button
                      onClick={deleteSelected}
                      size="sm"
                      variant="destructive"
                      className="h-7"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Deletar
                    </Button>
                  )}
                  <Button
                    onClick={clearSelection}
                    size="sm"
                    variant="outline"
                    className="h-7 border-white/20 text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {/* View Toggle */}
              <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-300 hover:bg-white/10'
                  }`}
                  title="Visualização em Grade"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'text-purple-300 hover:bg-white/10'
                  }`}
                  title="Visualização em Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ===== TOOLBAR: Ações ===== */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Arquivos
              </Button>
              <Button
                onClick={() => setCreateFolderDialog({ open: true, name: '' })}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Pasta
              </Button>
              <Button
                onClick={() => {
                  setSelectionMode(!selectionMode)
                  if (selectionMode) {
                    setSelectedItems([])
                  }
                }}
                variant="outline"
                className={`border-white/20 hover:bg-white/10 transition-all ${
                  selectionMode 
                    ? 'bg-purple-500/30 border-purple-500 text-white' 
                    : 'text-white'
                }`}
              >
                {selectionMode ? (
                  <><CheckSquare className="w-4 h-4 mr-2" /> Selecionando</>
                ) : (
                  <><Square className="w-4 h-4 mr-2" /> Selecionar</>
                )}
              </Button>
            </div>
            <Button
              onClick={() => loadFiles(currentFolder)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* ===== ÁREA DE DROP ===== */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`min-h-[400px] rounded-lg border-2 border-dashed transition-all ${
              isDragging && !draggedItem
                ? 'border-purple-400 bg-purple-500/20'
                : 'border-white/20 bg-white/5'
            }`}
          >
            {isDragging && !draggedItem ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <UploadCloud className="w-20 h-20 text-purple-400 mb-4 animate-bounce" />
                <p className="text-white text-xl font-semibold">Solte os arquivos aqui</p>
                <p className="text-purple-200 text-sm mt-2">Upload para: {breadcrumbs[breadcrumbs.length - 1].name}</p>
              </div>
            ) : (
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="text-white ml-3">Carregando...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-20">
                    <FolderOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                    <p className="text-white text-lg font-semibold">Pasta vazia</p>
                    <p className="text-purple-200 text-sm mt-2">
                      Arraste arquivos aqui ou clique em "Upload Arquivos"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ===== PASTAS ===== */}
                    {folders.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                          <Folder className="w-5 h-5 mr-2 text-blue-400" />
                          Pastas ({folders.length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {folders.map(folder => (
                            <div
                              key={folder.id}
                              draggable="true"
                              onDragStart={(e) => handleItemDragStart(e, folder)}
                              onDragEnd={handleItemDragEnd}
                              onDragOver={(e) => handleFolderDragOver(e, folder)}
                              onDragLeave={(e) => handleFolderDragLeave(e, folder)}
                              onDrop={(e) => handleFolderDrop(e, folder)}
                              className={`group relative transition-all duration-200 ease-in-out ${
                                draggedItem && draggedItem.id === folder.id
                                  ? 'opacity-50 cursor-move scale-95'
                                  : dropTarget === folder.id
                                  ? 'ring-4 ring-purple-500 ring-opacity-50 bg-purple-500/30 scale-105 cursor-copy animate-pulse'
                                  : 'cursor-pointer hover:bg-white/10 hover:scale-105 hover:shadow-lg'
                              }`}
                            >
                              {/* Checkbox para seleção - só aparece no modo seleção */}
                              {selectionMode && (
                                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleSelection(folder)
                                    }}
                                    className="p-1 bg-white/10 backdrop-blur-sm rounded hover:bg-white/20 transition-all pointer-events-auto"
                                  >
                                    {selectedItems.find(i => i.id === folder.id) ? (
                                      <CheckSquare className="w-5 h-5 text-purple-400" />
                                    ) : (
                                      <Square className="w-5 h-5 text-white/70" />
                                    )}
                                  </button>
                                </div>
                              )}

                              {/* Menu de ações */}
                              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setRenameDialog({ open: true, item: folder, newName: folder.original_name })
                                    }}
                                    className="p-1.5 bg-blue-500/80 backdrop-blur-sm rounded hover:bg-blue-600 transition-all pointer-events-auto"
                                    title="Renomear"
                                  >
                                    <Edit2 className="w-4 h-4 text-white" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDeleteDialog({ open: true, item: folder })
                                    }}
                                    className="p-1.5 bg-red-500/80 backdrop-blur-sm rounded hover:bg-red-600 transition-all pointer-events-auto"
                                    title="Deletar"
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              </div>

                              <div
                                onMouseDown={(e) => {
                                  // Prevenir click se há drag ativo ou acabamos de fazer drop
                                  if (draggedItem || justDropped) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('⚠️ MouseDown bloqueado - drag ativo:', !!draggedItem, 'just dropped:', justDropped)
                                  }
                                }}
                                onClick={(e) => {
                                  // Prevenir navegação se estamos fazendo drag and drop ou acabamos de fazer drop
                                  if (draggedItem || justDropped) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('⚠️ Click bloqueado - drag ativo:', !!draggedItem, 'just dropped:', justDropped)
                                    return
                                  }
                                  navigateToFolder(folder)
                                }}
                                className="flex flex-col items-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-400/50 transition-all"
                              >
                                <FolderOpen className="w-16 h-16 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-white text-sm font-medium text-center line-clamp-2 w-full">
                                  {folder.original_name}
                                </p>
                                {dropTarget === folder.id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 rounded-xl">
                                    <div className="text-center">
                                      <UploadCloud className="w-12 h-12 text-white mx-auto mb-2" />
                                      <p className="text-white font-semibold text-sm">Solte aqui!</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ===== ARQUIVOS ===== */}
                    {regularFiles.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                          <File className="w-5 h-5 mr-2 text-green-400" />
                          Arquivos ({regularFiles.length})
                        </h3>
                        <div className="space-y-2">
                          {regularFiles.map(file => (
                            <div
                              key={file.id}
                              draggable="true"
                              onDragStart={(e) => handleItemDragStart(e, file)}
                              onDragEnd={handleItemDragEnd}
                              className={`group flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 transition-all duration-200 ease-in-out ${
                                draggedItem && draggedItem.id === file.id
                                  ? 'opacity-50 cursor-move scale-95'
                                  : 'hover:bg-white/10 hover:border-green-400/50 hover:shadow-md hover:scale-[1.02] cursor-move'
                              }`}
                            >
                              {/* Checkbox para seleção - só aparece no modo seleção */}
                              {selectionMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSelection(file)
                                  }}
                                  className="p-1 mr-2"
                                >
                                  {selectedItems.find(i => i.id === file.id) ? (
                                    <CheckSquare className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-white/30 group-hover:text-white/70" />
                                  )}
                                </button>
                              )}

                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {/* Thumbnail ou Ícone */}
                                {file.thumbnail_url ? (
                                  <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg overflow-hidden">
                                    <img
                                      src={file.thumbnail_url}
                                      alt={file.original_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.log('⚠️ [THUMBNAIL] Falha ao carregar, usando ícone:', file.original_name);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling?.classList.remove('hidden');
                                      }}
                                    />
                                    <div className="hidden">
                                      <div className="w-full h-full flex items-center justify-center">
                                        {getFileIcon(file)}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/5 rounded-lg">
                                    {getFileIcon(file)}
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium truncate">{file.original_name}</p>
                                  <p className="text-purple-300 text-xs">{formatFileSize(file.size)}</p>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(file)
                                  }}
                                  className="p-2 bg-green-500/80 backdrop-blur-sm rounded hover:bg-green-600 transition-all"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setRenameDialog({ open: true, item: file, newName: file.original_name })
                                  }}
                                  className="p-2 bg-blue-500/80 backdrop-blur-sm rounded hover:bg-blue-600 transition-all"
                                  title="Renomear"
                                >
                                  <Edit2 className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDetailsDialog({ open: true, item: file })
                                  }}
                                  className="p-2 bg-purple-500/80 backdrop-blur-sm rounded hover:bg-purple-600 transition-all"
                                  title="Detalhes"
                                >
                                  <Eye className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteDialog({ open: true, item: file })
                                  }}
                                  className="p-2 bg-red-500/80 backdrop-blur-sm rounded hover:bg-red-600 transition-all"
                                  title="Deletar"
                                >
                                  <Trash2 className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== INFO: Dica de Uso ===== */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Cloud className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">💡 Dica: Drag and Drop</p>
                <p className="text-purple-200 text-sm">
                  • Arraste arquivos do seu PC <strong>para cima das PASTAS</strong> para enviar<br/>
                  • Arraste arquivos/pastas <strong>para cima de outras PASTAS</strong> para mover<br/>
                  • Veja a pasta ficar <strong className="text-purple-400">ROXA BRILHANTE</strong> = pronto para soltar!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== INPUT FILE (HIDDEN) ===== */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ===== DIALOG: CRIAR PASTA ===== */}
      <Dialog open={createFolderDialog.open} onOpenChange={(open) => setCreateFolderDialog({ ...createFolderDialog, open })}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="folder-name" className="text-white">Nome da pasta</Label>
              <Input
                id="folder-name"
                value={createFolderDialog.name}
                onChange={(e) => setCreateFolderDialog({ ...createFolderDialog, name: e.target.value })}
                placeholder="Ex: Minhas Fotos"
                className="bg-white/10 border-white/20 text-white mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateFolderDialog({ open: false, name: '' })}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFolder}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Criar Pasta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 🆕 MODAL: RENOMEAR ===== */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Renomear</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-name" className="text-white">Novo nome</Label>
              <Input
                id="new-name"
                value={renameDialog.newName}
                onChange={(e) => setRenameDialog({ ...renameDialog, newName: e.target.value })}
                placeholder="Digite o novo nome"
                className="bg-white/10 border-white/20 text-white mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, item: null, newName: '' })}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRename}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Renomear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 🆕 MODAL: DELETAR ===== */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">
              Tem certeza que deseja deletar <span className="font-bold text-red-400">"{deleteDialog.item?.original_name}"</span>?
            </p>
            <p className="text-purple-300 text-sm mt-2">
              {deleteDialog.item?.is_folder 
                ? '⚠️ Todos os arquivos dentro desta pasta serão deletados!'
                : 'Esta ação não pode ser desfeita.'
              }
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, item: null })}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== 🆕 MODAL: DETALHES ===== */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}>
        <DialogContent className="bg-gray-900 border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Detalhes do Arquivo</DialogTitle>
          </DialogHeader>
          {detailsDialog.item && (
            <div className="space-y-4 py-4">
              {/* Preview se for imagem */}
              {detailsDialog.item.thumbnail_url && (
                <div className="flex justify-center bg-white/5 rounded-lg p-4">
                  <img 
                    src={detailsDialog.item.thumbnail_url} 
                    alt={detailsDialog.item.original_name}
                    className="max-h-48 rounded"
                    onError={(e) => {
                      console.error('❌ [FRONTEND] Erro ao carregar thumbnail:', detailsDialog.item.thumbnail_url);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ [FRONTEND] Thumbnail carregada:', detailsDialog.item.original_name);
                    }}
                  />
                </div>
              )}

              {/* Informações */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-300 text-xs">Nome</Label>
                  <p className="text-white font-medium mt-1">{detailsDialog.item.original_name}</p>
                </div>
                <div>
                  <Label className="text-purple-300 text-xs">Tamanho</Label>
                  <p className="text-white font-medium mt-1">{formatFileSize(detailsDialog.item.file_size)}</p>
                </div>
                <div>
                  <Label className="text-purple-300 text-xs">Tipo</Label>
                  <p className="text-white font-medium mt-1">{detailsDialog.item.mime_type || 'Pasta'}</p>
                </div>
                <div>
                  <Label className="text-purple-300 text-xs">Criado em</Label>
                  <p className="text-white font-medium mt-1">
                    {new Date(detailsDialog.item.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Link do arquivo */}
              {detailsDialog.item.file_url && (
                <div className="mt-4">
                  <Button
                    onClick={() => window.open(detailsDialog.item.file_url, '_blank')}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Abrir no Google Drive
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialog({ open: false, item: null })}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

