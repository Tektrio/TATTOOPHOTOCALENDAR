import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx'
import { 
  Folder, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  FolderPlus,
  Upload,
  Grid,
  List,
  Cloud,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  MoreVertical,
  Edit2,
  Move,
  Trash2,
  Copy,
  Share2,
  FolderOpen,
  Video,
  Music,
  FileSpreadsheet,
  Presentation,
  Archive,
  Code,
  Calendar,
  User,
  HardDrive,
  TrendingUp,
  Clock,
  Eye,
  X,
  Check,
  Link2,
  MessageSquare,
  History,
  CheckSquare,
  Square,
  UploadCloud
} from 'lucide-react'
import { toast } from 'sonner'
import ImagePreview from './ImagePreview.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function GoogleDriveExplorer() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const [isConnected, setIsConnected] = useState(false)
  
  // Preview de imagens
  const [imagePreview, setImagePreview] = useState({ open: false, image: null, index: 0 })
  const [currentFolder, setCurrentFolder] = useState(null) // null = root
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Meu Drive' }])
  
  // Novas funcionalidades
  const [storageInfo, setStorageInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [recentFiles, setRecentFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [showFileDetails, setShowFileDetails] = useState(false)
  
  // Estados para modals
  const [renameDialog, setRenameDialog] = useState({ open: false, file: null, newName: '' })
  const [moveDialog, setMoveDialog] = useState({ open: false, file: null, targetFolder: null })
  const [createFolderDialog, setCreateFolderDialog] = useState({ open: false, name: '' })
  const [availableFolders, setAvailableFolders] = useState([])
  
  // 🚀 NOVOS ESTADOS PARA NAVEGAÇÃO HIERÁRQUICA NO MOVE DIALOG
  const [moveDialogBreadcrumbs, setMoveDialogBreadcrumbs] = useState([{ id: null, name: 'Meu Drive' }])
  const [moveDialogCurrentFolder, setMoveDialogCurrentFolder] = useState(null)
  const [moveDialogFolders, setMoveDialogFolders] = useState([])
  const [moveDialogLoading, setMoveDialogLoading] = useState(false)
  
  // 🚀 NOVAS FUNCIONALIDADES AVANÇADAS
  // Upload
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadQueue, setUploadQueue] = useState([])
  
  // Seleção múltipla
  const [selectedItems, setSelectedItems] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)
  
  // Compartilhamento
  const [shareDialog, setShareDialog] = useState({ 
    open: false, 
    file: null, 
    email: '', 
    permission: 'reader' 
  })
  
  // Comentários
  const [commentsDialog, setCommentsDialog] = useState({ 
    open: false, 
    file: null, 
    comments: [], 
    newComment: '' 
  })
  
  // Histórico de versões
  const [versionsDialog, setVersionsDialog] = useState({ 
    open: false, 
    file: null, 
    versions: [] 
  })

  useEffect(() => {
    checkConnection()
    loadFiles(currentFolder)
    loadStorageInfo()
    loadStats()
    loadRecentFiles()
  }, [currentFolder])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/status`)
      const data = await response.json()
      setIsConnected(data.authenticated)
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
    }
  }

  const loadStorageInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/about`)
      const data = await response.json()
      if (!data.error) {
        setStorageInfo(data)
      }
    } catch (error) {
      console.error('Erro ao carregar informações de storage:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/stats`)
      const data = await response.json()
      if (!data.error) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const loadRecentFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/recent?limit=5`)
      const data = await response.json()
      if (!data.error) {
        setRecentFiles(data)
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos recentes:', error)
    }
  }

  const loadFiles = async (folderId = null) => {
    setLoading(true)
    try {
      const url = folderId 
        ? `${API_URL}/api/drive/files?folderId=${folderId}`
        : `${API_URL}/api/drive/files`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
        setFiles([])
      } else {
        setFiles(data)
        
        if (data.length === 0 && isConnected) {
          toast.info('📁 Pasta vazia')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error)
      toast.error('❌ Erro ao carregar arquivos do Google Drive')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllFolders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/folders`)
      const data = await response.json()
      setAvailableFolders(data)
    } catch (error) {
      console.error('Erro ao carregar pastas:', error)
    }
  }

  // 🚀 NOVA FUNCIONALIDADE: Carregar todas as pastas do Drive (incluindo subpastas)
  const loadAllFoldersRecursive = async () => {
    try {
      const response = await fetch(`${API_URL}/api/drive/all-folders`)
      const data = await response.json()
      if (data.success) {
        setAvailableFolders(data.folders)
      } else {
        console.error('Erro ao carregar todas as pastas:', data.error)
        // Fallback para o método antigo
        loadAllFolders()
      }
    } catch (error) {
      console.error('Erro ao carregar todas as pastas:', error)
      // Fallback para o método antigo
      loadAllFolders()
    }
  }

  const loadFileDetails = async (fileId) => {
    try {
      const response = await fetch(`${API_URL}/api/drive/file/${fileId}`)
      const data = await response.json()
      if (!data.error) {
        setSelectedFile(data)
        setShowFileDetails(true)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do arquivo:', error)
    }
  }

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder.id)
    const newBreadcrumbs = [...breadcrumbs, { id: folder.id, name: folder.original_name }]
    setBreadcrumbs(newBreadcrumbs)
    setSearchTerm('') // Limpar pesquisa ao navegar
    setSelectedItems([]) // Limpar seleção ao navegar
    setSelectionMode(false) // Desativar modo de seleção
    // Forçar reload dos arquivos
    loadFiles(folder.id)
  }

  const navigateToBreadcrumb = (index) => {
    const targetBreadcrumb = breadcrumbs[index]
    setCurrentFolder(targetBreadcrumb.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
    setSearchTerm('')
    // Forçar reload dos arquivos mesmo se estiver na mesma pasta
    loadFiles(targetBreadcrumb.id)
    setSelectedItems([]) // Limpar seleção ao navegar
    setSelectionMode(false) // Desativar modo de seleção
  }

  const handleRename = async () => {
    if (!renameDialog.newName.trim()) {
      toast.error('Por favor, insira um nome')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: renameDialog.file.id.replace('gdrive_', ''),
          newName: renameDialog.newName
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Arquivo renomeado com sucesso!')
        setRenameDialog({ open: false, file: null, newName: '' })
        loadFiles(currentFolder)
        loadStats() // Atualizar estatísticas
      } else {
        toast.error(`❌ ${data.error || 'Erro ao renomear'}`)
      }
    } catch (error) {
      console.error('Erro ao renomear:', error)
      toast.error('❌ Erro ao renomear arquivo')
    }
  }

  const handleMove = async () => {
    // Verificar se uma pasta foi selecionada
    // undefined = nada selecionado (erro)
    // null = raiz selecionada (válido)
    // string = pasta específica selecionada (válido)
    if (moveDialog.targetFolder === undefined) {
      toast.error('Selecione uma pasta de destino')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: moveDialog.file.id.replace('gdrive_', ''),
          targetFolderId: moveDialog.targetFolder
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Arquivo movido com sucesso!')
        setMoveDialog({ open: false, file: null, targetFolder: null })
        loadFiles(currentFolder)
      } else {
        toast.error(`❌ ${data.error || 'Erro ao mover'}`)
      }
    } catch (error) {
      console.error('Erro ao mover:', error)
      toast.error('❌ Erro ao mover arquivo')
    }
  }

  const handleDelete = async (file) => {
    if (!confirm(`Tem certeza que deseja excluir "${file.original_name}"?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: file.id.replace('gdrive_', '')
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Arquivo excluído com sucesso!')
        loadFiles(currentFolder)
        loadStats() // Atualizar estatísticas
        loadStorageInfo() // Atualizar storage
      } else {
        toast.error(`❌ ${data.error || 'Erro ao excluir'}`)
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('❌ Erro ao excluir arquivo')
    }
  }

  const handleCreateFolder = async () => {
    if (!createFolderDialog.name.trim()) {
      toast.error('Por favor, insira um nome para a pasta')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/create-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createFolderDialog.name,
          parentId: currentFolder
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Pasta criada com sucesso!')
        setCreateFolderDialog({ open: false, name: '' })
        loadFiles(currentFolder)
        loadStats() // Atualizar estatísticas
      } else {
        toast.error(`❌ ${data.error || 'Erro ao criar pasta'}`)
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      toast.error('❌ Erro ao criar pasta')
    }
  }

  const openRenameDialog = (file) => {
    setRenameDialog({ open: true, file, newName: file.original_name })
  }

  // 🚀 FUNÇÕES PARA NAVEGAÇÃO HIERÁRQUICA NO MOVE DIALOG
  const loadMoveDialogFolders = async (folderId = null) => {
    setMoveDialogLoading(true)
    try {
      const url = folderId 
        ? `${API_URL}/api/drive/files?folderId=${folderId}`
        : `${API_URL}/api/drive/files`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.error) {
        console.error('Erro ao carregar pastas:', data.error)
        setMoveDialogFolders([])
      } else {
        // Filtrar apenas pastas
        const folders = data.filter(item => item.mimeType === 'application/vnd.google-apps.folder')
        setMoveDialogFolders(folders)
      }
    } catch (error) {
      console.error('Erro ao carregar pastas:', error)
      setMoveDialogFolders([])
    } finally {
      setMoveDialogLoading(false)
    }
  }

  const navigateMoveDialogToFolder = (folder) => {
    setMoveDialogCurrentFolder(folder.id)
    const newBreadcrumbs = [...moveDialogBreadcrumbs, { id: folder.id, name: folder.original_name }]
    setMoveDialogBreadcrumbs(newBreadcrumbs)
    loadMoveDialogFolders(folder.id)
  }

  const navigateMoveDialogToBreadcrumb = (index) => {
    const targetBreadcrumb = moveDialogBreadcrumbs[index]
    setMoveDialogCurrentFolder(targetBreadcrumb.id)
    setMoveDialogBreadcrumbs(moveDialogBreadcrumbs.slice(0, index + 1))
    loadMoveDialogFolders(targetBreadcrumb.id)
  }

  const openMoveDialog = (file) => {
    setMoveDialog({ open: true, file, targetFolder: null })
    // Resetar navegação do dialog
    setMoveDialogBreadcrumbs([{ id: null, name: 'Meu Drive' }])
    setMoveDialogCurrentFolder(null)
    loadMoveDialogFolders(null) // Carregar pasta raiz
  }

  // 🚀 FUNÇÕES DE UPLOAD (Drag & Drop)
  const [draggedItem, setDraggedItem] = useState(null) // Item sendo arrastado
  const [dropTarget, setDropTarget] = useState(null) // Pasta alvo

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    await uploadFiles(droppedFiles)
  }

  // 🚀 DRAG AND DROP ENTRE PASTAS
  const handleItemDragStart = (e, item) => {
    e.stopPropagation()
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    
    // Adicionar efeito visual
    if (e.target.classList) {
      e.target.classList.add('opacity-50')
    }
  }

  const handleItemDragEnd = (e) => {
    e.stopPropagation()
    setDraggedItem(null)
    setDropTarget(null)
    
    // Remover efeito visual
    if (e.target.classList) {
      e.target.classList.remove('opacity-50')
    }
  }

  const handleFolderDragOver = (e, folder) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Não permitir arrastar pasta para ela mesma
    if (draggedItem && draggedItem.id !== folder.id) {
      e.dataTransfer.dropEffect = 'move'
      // Só atualizar dropTarget se mudou (reduz re-renders)
      if (dropTarget !== folder.id) {
        setDropTarget(folder.id)
      }
    }
  }

  const handleFolderDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)
  }

  const handleFolderDrop = async (e, targetFolder) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)

    if (!draggedItem) {
      // Se não há item arrastado, é um upload de arquivo do computador
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        // Temporariamente mudar para a pasta alvo para fazer upload
        const originalFolder = currentFolder
        setCurrentFolder(targetFolder.id)
        await uploadFiles(droppedFiles)
        setCurrentFolder(originalFolder)
        toast.success(`📤 ${droppedFiles.length} arquivo(s) enviado(s) para ${targetFolder.original_name}`)
        loadFiles(currentFolder)
        return
      }
      return
    }

    // Não permitir mover pasta para ela mesma
    if (draggedItem.id === targetFolder.id) {
      toast.error('❌ Não é possível mover uma pasta para ela mesma')
      setDraggedItem(null)
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
      
      if (data.success) {
        toast.success(`✅ "${draggedItem.original_name}" movido para "${targetFolder.original_name}"!`)
        loadFiles(currentFolder)
        loadStats()
      } else {
        toast.error(`❌ ${data.error || 'Erro ao mover'}`)
      }
    } catch (error) {
      console.error('Erro ao mover:', error)
      toast.error('❌ Erro ao mover arquivo')
    } finally {
      setDraggedItem(null)
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    uploadFiles(selectedFiles)
  }

  const uploadFiles = async (filesToUpload) => {
    if (filesToUpload.length === 0) return

    toast.info(`📤 Iniciando upload de ${filesToUpload.length} arquivo(s)...`)
    
    for (const file of filesToUpload) {
      const fileId = `upload_${Date.now()}_${Math.random()}`
      
      setUploadQueue(prev => [...prev, { id: fileId, name: file.name, status: 'uploading' }])
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      const formData = new FormData()
      formData.append('file', file)
      if (currentFolder) {
        formData.append('folderId', currentFolder)
      }

      try {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            setUploadProgress(prev => ({ ...prev, [fileId]: percentComplete }))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setUploadQueue(prev => prev.map(item => 
              item.id === fileId ? { ...item, status: 'complete' } : item
            ))
            toast.success(`✅ ${file.name} enviado com sucesso!`)
            loadFiles(currentFolder)
            loadStats()
            loadStorageInfo()
            
            // Remover da fila após 3 segundos
            setTimeout(() => {
              setUploadQueue(prev => prev.filter(item => item.id !== fileId))
              setUploadProgress(prev => {
                const newProgress = { ...prev }
                delete newProgress[fileId]
                return newProgress
              })
            }, 3000)
          } else {
            throw new Error('Erro no upload')
          }
        })

        xhr.addEventListener('error', () => {
          setUploadQueue(prev => prev.map(item => 
            item.id === fileId ? { ...item, status: 'error' } : item
          ))
          toast.error(`❌ Erro ao enviar ${file.name}`)
        })

        xhr.open('POST', `${API_URL}/api/drive/upload`)
        xhr.send(formData)
      } catch (error) {
        console.error('Erro no upload:', error)
        setUploadQueue(prev => prev.map(item => 
          item.id === fileId ? { ...item, status: 'error' } : item
        ))
        toast.error(`❌ Erro ao enviar ${file.name}`)
      }
    }
  }

  // 🚀 FUNÇÃO DE DOWNLOAD
  const handleDownload = async (file) => {
    try {
      toast.info(`⏳ Preparando download de ${file.original_name}...`)
      
      const fileId = file.id.replace('gdrive_', '')
      const response = await fetch(`${API_URL}/api/drive/download/${fileId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.original_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`✅ ${file.original_name} baixado com sucesso!`)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      toast.error('❌ Erro ao baixar arquivo')
    }
  }

  // 🚀 SELEÇÃO MÚLTIPLA
  const toggleSelection = (file) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.id === file.id)
      if (isSelected) {
        return prev.filter(item => item.id !== file.id)
      } else {
        return [...prev, file]
      }
    })
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === files.length) {
      setSelectedItems([])
    } else {
      setSelectedItems([...files])
    }
  }

  const clearSelection = () => {
    setSelectedItems([])
    setSelectionMode(false)
  }

  // 🚀 OPERAÇÕES EM LOTE
  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) return
    
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} item(ns) selecionado(s)?`)) {
      return
    }

    toast.info(`🗑️ Excluindo ${selectedItems.length} item(ns)...`)
    
    let successCount = 0
    let errorCount = 0

    for (const item of selectedItems) {
      try {
        const response = await fetch(`${API_URL}/api/drive/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: item.id.replace('gdrive_', '') })
        })

        const data = await response.json()
        if (data.success) {
          successCount++
        } else {
          errorCount++
        }
      // eslint-disable-next-line no-unused-vars
      } catch (_error) {
        errorCount++
      }
    }

    clearSelection()
    loadFiles(currentFolder)
    loadStats()
    loadStorageInfo()

    if (successCount > 0) {
      toast.success(`✅ ${successCount} item(ns) excluído(s) com sucesso!`)
    }
    if (errorCount > 0) {
      toast.error(`❌ Erro ao excluir ${errorCount} item(ns)`)
    }
  }

  const handleBatchDownload = async () => {
    if (selectedItems.length === 0) return
    
    toast.info(`📥 Baixando ${selectedItems.length} arquivo(s)...`)
    
    for (const item of selectedItems.filter(f => !f.is_folder)) {
      await handleDownload(item)
    }
  }

  const handleBatchMove = () => {
    if (selectedItems.length === 0) return
    
    // Usar o primeiro item como referência
    setMoveDialog({ open: true, file: selectedItems[0], targetFolder: null, batch: true })
    loadAllFolders()
  }

  // 🚀 COMPARTILHAMENTO
  const openShareDialog = async (file) => {
    setShareDialog({ open: true, file, email: '', permission: 'reader' })
  }

  const handleShare = async () => {
    if (!shareDialog.email.trim()) {
      toast.error('Por favor, insira um email')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: shareDialog.file.id.replace('gdrive_', ''),
          email: shareDialog.email,
          role: shareDialog.permission
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Arquivo compartilhado com sucesso!')
        setShareDialog({ open: false, file: null, email: '', permission: 'reader' })
      } else {
        toast.error(`❌ ${data.error || 'Erro ao compartilhar'}`)
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
      toast.error('❌ Erro ao compartilhar arquivo')
    }
  }

  const handleCopyLink = async (file) => {
    try {
      const fileId = file.id.replace('gdrive_', '')
      const response = await fetch(`${API_URL}/api/drive/create-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      })

      const data = await response.json()
      
      if (data.success && data.link) {
        await navigator.clipboard.writeText(data.link)
        toast.success('🔗 Link copiado para a área de transferência!')
      } else {
        toast.error('❌ Erro ao gerar link')
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error)
      toast.error('❌ Erro ao copiar link')
    }
  }

  // 🚀 COMENTÁRIOS
  const openCommentsDialog = async (file) => {
    try {
      const fileId = file.id.replace('gdrive_', '')
      const response = await fetch(`${API_URL}/api/drive/comments/${fileId}`)
      const data = await response.json()
      
      setCommentsDialog({ 
        open: true, 
        file, 
        comments: data.comments || [], 
        newComment: '' 
      })
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
      setCommentsDialog({ open: true, file, comments: [], newComment: '' })
    }
  }

  const handleAddComment = async () => {
    if (!commentsDialog.newComment.trim()) {
      toast.error('Digite um comentário')
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/drive/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: commentsDialog.file.id.replace('gdrive_', ''),
          content: commentsDialog.newComment
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('✅ Comentário adicionado!')
        // Recarregar comentários
        openCommentsDialog(commentsDialog.file)
      } else {
        toast.error(`❌ ${data.error || 'Erro ao adicionar comentário'}`)
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('❌ Erro ao adicionar comentário')
    }
  }

  // 🚀 HISTÓRICO DE VERSÕES
  const openVersionsDialog = async (file) => {
    try {
      const fileId = file.id.replace('gdrive_', '')
      const response = await fetch(`${API_URL}/api/drive/versions/${fileId}`)
      const data = await response.json()
      
      setVersionsDialog({ 
        open: true, 
        file, 
        versions: data.versions || [] 
      })
    } catch (error) {
      console.error('Erro ao carregar versões:', error)
      setVersionsDialog({ open: true, file, versions: [] })
      toast.error('❌ Erro ao carregar histórico de versões')
    }
  }

  const getFileIcon = (mimeType, isFolder) => {
    if (isFolder) {
      return <FolderOpen className="w-12 h-12 text-blue-400" />
    }
    
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="w-12 h-12 text-green-400" />
    }
    
    if (mimeType?.startsWith('video/')) {
      return <Video className="w-12 h-12 text-purple-400" />
    }
    
    if (mimeType?.startsWith('audio/')) {
      return <Music className="w-12 h-12 text-pink-400" />
    }
    
    if (mimeType?.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-12 h-12 text-emerald-400" />
    }
    
    if (mimeType?.includes('presentation')) {
      return <Presentation className="w-12 h-12 text-orange-400" />
    }
    
    if (mimeType?.includes('document') || mimeType?.includes('pdf')) {
      return <FileText className="w-12 h-12 text-blue-400" />
    }
    
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) {
      return <Archive className="w-12 h-12 text-yellow-400" />
    }
    
    if (mimeType?.includes('javascript') || mimeType?.includes('python') || mimeType?.includes('code')) {
      return <Code className="w-12 h-12 text-cyan-400" />
    }
    
    return <File className="w-12 h-12 text-gray-400" />
  }

  const getSmallFileIcon = (mimeType, isFolder) => {
    const iconClass = "w-5 h-5"
    
    if (isFolder) return <Folder className={`${iconClass} text-blue-400`} />
    if (mimeType?.startsWith('image/')) return <ImageIcon className={`${iconClass} text-green-400`} />
    if (mimeType?.startsWith('video/')) return <Video className={`${iconClass} text-purple-400`} />
    if (mimeType?.startsWith('audio/')) return <Music className={`${iconClass} text-pink-400`} />
    if (mimeType?.includes('spreadsheet')) return <FileSpreadsheet className={`${iconClass} text-emerald-400`} />
    if (mimeType?.includes('presentation')) return <Presentation className={`${iconClass} text-orange-400`} />
    if (mimeType?.includes('document') || mimeType?.includes('pdf')) return <FileText className={`${iconClass} text-blue-400`} />
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <Archive className={`${iconClass} text-yellow-400`} />
    if (mimeType?.includes('code')) return <Code className={`${iconClass} text-cyan-400`} />
    
    return <File className={`${iconClass} text-gray-400`} />
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStoragePercentage = () => {
    if (!storageInfo || !storageInfo.limit) return 0
    return ((storageInfo.usage / storageInfo.limit) * 100).toFixed(1)
  }

  const getStorageColor = () => {
    const percentage = getStoragePercentage()
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Helper para construir URL de thumbnail corretamente
  const getThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return null
    // Se já é URL completa (http/https), usar diretamente
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl
    // Caso contrário, concatenar com API_URL (para arquivos locais)
    return `${API_URL}${thumbnailUrl}`
  }

  const filteredFiles = files.filter(file =>
    file.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const folders = filteredFiles.filter(f => f.is_folder)
  const regularFiles = filteredFiles.filter(f => !f.is_folder)

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
              Conecte-se ao Google Drive para visualizar e gerenciar seus arquivos
            </p>
            <Button 
              className="bg-purple-500 hover:bg-purple-600"
              onClick={() => window.location.reload()}
            >
              <Cloud className="w-4 h-4 mr-2" />
              Conectar ao Google Drive
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Storage Information Card */}
      {storageInfo && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <HardDrive className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Armazenamento do Google Drive</h3>
                  <p className="text-purple-200 text-sm">
                    {formatFileSize(storageInfo.usage)} de {formatFileSize(storageInfo.limit)} usado ({getStoragePercentage()}%)
                  </p>
                </div>
              </div>
              {storageInfo.user && (
                <div className="flex items-center space-x-2">
                  {storageInfo.user.photoLink && (
                    <img 
                      src={storageInfo.user.photoLink} 
                      alt={storageInfo.user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                  )}
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{storageInfo.user.displayName}</p>
                    <p className="text-purple-300 text-xs">{storageInfo.user.emailAddress}</p>
                  </div>
                </div>
              )}
            </div>
            
            <Progress value={parseFloat(getStoragePercentage())} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">No Drive</span>
                </div>
                <p className="text-xl font-bold text-white">{formatFileSize(storageInfo.usageInDrive)}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm font-medium">Na Lixeira</span>
                </div>
                <p className="text-xl font-bold text-white">{formatFileSize(storageInfo.usageInDriveTrash)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center">
                <Cloud className="w-8 h-8 mr-3 text-blue-400" />
                Google Drive Explorer
              </CardTitle>
              <CardDescription className="text-purple-200 mt-2">
                Navegue e gerencie seus arquivos na nuvem
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-400 font-semibold px-3 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Conectado
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 mb-4 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'bg-purple-500/30 text-white font-semibold'
                      : 'bg-white/5 text-purple-200 hover:bg-white/10'
                  }`}
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-purple-300 mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barra de pesquisa */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Pesquisar arquivos e pastas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-500 hover:bg-green-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              
              <Button
                onClick={() => setCreateFolderDialog({ open: true, name: '' })}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Pasta
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSelectionMode(!selectionMode)
                  if (selectionMode) clearSelection()
                }}
                className={`bg-white/5 border-white/20 hover:bg-white/10 ${selectionMode ? 'bg-purple-500/20 border-purple-500' : ''}`}
              >
                {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                Selecionar
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-white/5 border-white/20 hover:bg-white/10"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true)
                  try {
                    await Promise.all([
                      loadFiles(currentFolder),
                      loadStorageInfo(),
                      loadStats(),
                      loadRecentFiles()
                    ])
                    toast.success('✅ Dados atualizados!')
                  } catch (error) {
                    console.error('Erro ao atualizar:', error)
                    toast.error('❌ Erro ao atualizar dados')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="bg-white/5 border-white/20 hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Estatísticas Avançadas */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <Folder className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">Pastas</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalFolders || folders.length}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <File className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-medium">Arquivos</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalFiles || regularFiles.length}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm font-medium">Imagens</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalImages || 0}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span className="text-white text-sm font-medium">Vídeos</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalVideos || 0}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="text-white text-sm font-medium">Documentos</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalDocuments || 0}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-white text-sm font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalItems || files.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🚀 BARRA DE FERRAMENTAS DE SELEÇÃO MÚLTIPLA */}
      {selectedItems.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border-purple-500/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className="bg-purple-500 text-white text-lg px-4 py-2">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {selectedItems.length} item(ns) selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-white hover:bg-white/10"
                >
                  {selectedItems.length === files.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleBatchDownload}
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={selectedItems.filter(f => !f.is_folder).length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                
                <Button
                  onClick={handleBatchMove}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  <Move className="w-4 h-4 mr-2" />
                  Mover
                </Button>
                
                <Button
                  onClick={handleBatchDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSelection}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🚀 ZONA DE DRAG & DROP */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all ${isDragging ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-purple-900/80 backdrop-blur-sm rounded-lg border-4 border-dashed border-purple-400">
            <div className="text-center">
              <UploadCloud className="w-24 h-24 text-purple-300 mx-auto mb-4 animate-bounce" />
              <h3 className="text-white text-2xl font-bold mb-2">Solte os arquivos aqui!</h3>
              <p className="text-purple-200 text-lg">
                Os arquivos serão enviados para {breadcrumbs[breadcrumbs.length - 1].name}
              </p>
            </div>
          </div>
        )}

        {/* 🚀 PROGRESSO DE UPLOAD */}
        {uploadQueue.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-6 h-6 mr-2 text-green-400" />
                Upload em progresso ({uploadQueue.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadQueue.map((item) => (
                  <div key={item.id} className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <File className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-white text-sm truncate">{item.name}</span>
                      </div>
                      
                      {item.status === 'uploading' && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Enviando...
                        </Badge>
                      )}
                      
                      {item.status === 'complete' && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                      
                      {item.status === 'error' && (
                        <Badge className="bg-red-500/20 text-red-400">
                          <X className="w-3 h-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                    </div>
                    
                    {item.status === 'uploading' && uploadProgress[item.id] !== undefined && (
                      <div>
                        <Progress value={uploadProgress[item.id]} className="h-2" />
                        <p className="text-purple-200 text-xs mt-1 text-right">
                          {uploadProgress[item.id].toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Carregando arquivos...</p>
        </div>
      )}

      {/* Pastas */}
      {!loading && folders.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Folder className="w-6 h-6 mr-2 text-blue-400" />
              Pastas ({folders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
              : 'space-y-2'
            }>
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  draggable={!selectionMode ? "true" : "false"}
                  onDragStart={(e) => !selectionMode && handleItemDragStart(e, folder)}
                  onDragEnd={handleItemDragEnd}
                  onDragOver={(e) => handleFolderDragOver(e, folder)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, folder)}
                  className={viewMode === 'grid'
                    ? `group relative ${dropTarget === folder.id ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-500/20' : ''}`
                    : `flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-blue-400/50 group ${dropTarget === folder.id ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-500/20' : ''}`
                  }
                >
                  {/* Checkbox de seleção */}
                  {selectionMode && (
                    <div 
                      className={viewMode === 'grid' ? 'absolute top-2 left-2 z-10' : 'mr-3'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedItems.some(item => item.id === folder.id)}
                        onCheckedChange={() => toggleSelection(folder)}
                        className="bg-white/20 border-white/40"
                      />
                    </div>
                  )}
                  
                  <div
                    onClick={() => !selectionMode && navigateToFolder(folder)}
                    className={viewMode === 'grid'
                      ? 'flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-blue-400/50 cursor-pointer'
                      : 'flex items-center space-x-3 flex-1 min-w-0 cursor-pointer'
                    }
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <FolderOpen className="w-16 h-16 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white text-sm font-medium text-center line-clamp-2 w-full">
                          {folder.original_name}
                        </p>
                        <p className="text-purple-200 text-xs mt-1">
                          {formatDate(folder.created_at)}
                        </p>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-8 h-8 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{folder.original_name}</p>
                          <p className="text-purple-200 text-sm">{formatDate(folder.created_at)}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Menu de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={viewMode === 'grid' 
                          ? 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20'
                          : 'bg-white/10 hover:bg-white/20'
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700">
                      <DropdownMenuItem 
                        onClick={() => window.open(folder.file_url, '_blank')}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir no Drive
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openShareDialog(folder)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCopyLink(folder)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Copiar Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => openRenameDialog(folder)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openMoveDialog(folder)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Move className="w-4 h-4 mr-2" />
                        Mover
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(folder)}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arquivos */}
      {!loading && regularFiles.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <File className="w-6 h-6 mr-2 text-green-400" />
              Arquivos ({regularFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
              : 'space-y-2'
            }>
              {regularFiles.map((file) => (
                <div
                  key={file.id}
                  draggable={!selectionMode ? "true" : "false"}
                  onDragStart={(e) => !selectionMode && handleItemDragStart(e, file)}
                  onDragEnd={handleItemDragEnd}
                  className={viewMode === 'grid'
                    ? 'group relative'
                    : 'flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-green-400/50 group'
                  }
                >
                  {/* Checkbox de seleção */}
                  {selectionMode && (
                    <div 
                      className={viewMode === 'grid' ? 'absolute top-2 left-2 z-10' : 'mr-3'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedItems.some(item => item.id === file.id)}
                        onCheckedChange={() => toggleSelection(file)}
                        className="bg-white/20 border-white/40"
                      />
                    </div>
                  )}
                  
                  <div className={viewMode === 'grid'
                    ? 'flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-green-400/50'
                    : 'flex items-center space-x-3 flex-1 min-w-0'
                  }>
                    {viewMode === 'grid' ? (
                      <>
                        {file.thumbnail_url ? (
                          <div 
                            className="w-full h-32 mb-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                            onClick={() => {
                              const imageFiles = regularFiles.filter(f => f.is_image || f.mime_type?.startsWith('image/'));
                              const index = imageFiles.findIndex(f => f.id === file.id);
                              setImagePreview({ open: true, image: file, images: imageFiles, index });
                            }}
                          >
                            <img 
                              src={getThumbnailUrl(file.thumbnail_url)}
                              alt={file.original_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center">
                              {getFileIcon(file.mime_type, false)}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 w-full h-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.mime_type, false)}
                          </div>
                        )}
                        <p className="text-white text-sm font-medium text-center line-clamp-2 w-full">
                          {file.original_name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <p className="text-purple-200 text-xs">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {file.thumbnail_url ? (
                          <div 
                            className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                            onClick={() => {
                              const imageFiles = regularFiles.filter(f => f.is_image || f.mime_type?.startsWith('image/'));
                              const index = imageFiles.findIndex(f => f.id === file.id);
                              setImagePreview({ open: true, image: file, images: imageFiles, index });
                            }}
                          >
                            <img 
                              src={getThumbnailUrl(file.thumbnail_url)}
                              alt={file.original_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center">
                              {getFileIcon(file.mime_type, false)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded flex items-center justify-center">
                            {getFileIcon(file.mime_type, false)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.original_name}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            {getSmallFileIcon(file.mime_type, false)}
                            <p className="text-purple-200 text-sm">{formatFileSize(file.file_size)}</p>
                            <p className="text-purple-300 text-xs">{formatDate(file.created_at)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Menu de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={viewMode === 'grid' 
                          ? 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20'
                          : 'bg-white/10 hover:bg-white/20'
                        }
                      >
                        <MoreVertical className="w-4 h-4 text-white" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700">
                      <DropdownMenuItem 
                        onClick={() => window.open(file.file_url, '_blank')}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDownload(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => loadFileDetails(file.id)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => openShareDialog(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCopyLink(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Copiar Link
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openCommentsDialog(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comentários
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openVersionsDialog(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Histórico de Versões
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => openRenameDialog(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openMoveDialog(file)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Move className="w-4 h-4 mr-2" />
                        Mover
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(file)}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arquivos Recentes */}
      {recentFiles && recentFiles.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-6 h-6 mr-2 text-yellow-400" />
              Recentemente Visualizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/10 group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {file.thumbnail_url ? (
                      <img 
                        src={getThumbnailUrl(file.thumbnail_url)} 
                        alt={file.original_name}
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      getSmallFileIcon(file.mime_type, false)
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{file.original_name}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <p className="text-purple-200 text-sm">{formatFileSize(file.file_size)}</p>
                        <p className="text-purple-300 text-xs">{formatDate(file.viewed_at || file.modified_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadFileDetails(file.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && !searchTerm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                <Cloud className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Pasta vazia
              </h3>
              <p className="text-purple-200 mb-6">
                Esta pasta não contém arquivos ou subpastas
              </p>
              <Button 
                onClick={() => setCreateFolderDialog({ open: true, name: '' })}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Criar primeira pasta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results for search */}
      {!loading && searchTerm && filteredFiles.length === 0 && files.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-purple-200">
                Tente pesquisar com outros termos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Detalhes do Arquivo */}
      {selectedFile && (
        <Dialog open={showFileDetails} onOpenChange={setShowFileDetails}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                {getSmallFileIcon(selectedFile.mimeType, false)}
                <span className="ml-2">{selectedFile.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedFile.thumbnailLink && (
                <img 
                  src={selectedFile.thumbnailLink} 
                  alt={selectedFile.name}
                  className="w-full rounded-lg"
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Tipo</Label>
                  <p className="text-white">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Tamanho</Label>
                  <p className="text-white">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Criado em</Label>
                  <p className="text-white">{formatDate(selectedFile.createdTime)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Modificado em</Label>
                  <p className="text-white">{formatDate(selectedFile.modifiedTime)}</p>
                </div>
                {selectedFile.viewedByMeTime && (
                  <div className="col-span-2">
                    <Label className="text-gray-400">Último acesso</Label>
                    <p className="text-white">{formatDate(selectedFile.viewedByMeTime)}</p>
                  </div>
                )}
                {selectedFile.description && (
                  <div className="col-span-2">
                    <Label className="text-gray-400">Descrição</Label>
                    <p className="text-white">{selectedFile.description}</p>
                  </div>
                )}
                {selectedFile.owners && selectedFile.owners.length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-gray-400">Proprietário</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedFile.owners[0].photoLink && (
                        <img 
                          src={selectedFile.owners[0].photoLink} 
                          alt={selectedFile.owners[0].displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-white">{selectedFile.owners[0].displayName}</p>
                        <p className="text-gray-400 text-sm">{selectedFile.owners[0].emailAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-gray-400">Compartilhado</Label>
                  <p className="text-white">{selectedFile.shared ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowFileDetails(false)}
                className="bg-gray-800 border-gray-600 text-white"
              >
                Fechar
              </Button>
              <Button 
                onClick={() => window.open(selectedFile.webViewLink, '_blank')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no Drive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog: Renomear */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Renomear</DialogTitle>
            <DialogDescription className="text-gray-400">
              Digite o novo nome para "{renameDialog.file?.original_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newName" className="text-white">Novo nome</Label>
              <Input
                id="newName"
                value={renameDialog.newName}
                onChange={(e) => setRenameDialog({ ...renameDialog, newName: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRenameDialog({ open: false, file: null, newName: '' })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleRename} className="bg-purple-500 hover:bg-purple-600">
              Renomear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Mover */}
      <Dialog open={moveDialog.open} onOpenChange={(open) => setMoveDialog({ ...moveDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Mover para...</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione a pasta de destino para "{moveDialog.file?.original_name}"
            </DialogDescription>
          </DialogHeader>
          
          {/* 🚀 NAVEGAÇÃO HIERÁRQUICA */}
          <div className="space-y-4 py-4">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-sm">
              {moveDialogBreadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.id} className="flex items-center">
                  {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                  <button
                    onClick={() => navigateMoveDialogToBreadcrumb(index)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {breadcrumb.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Opção de mover para raiz */}
            <button
              onClick={() => setMoveDialog({ ...moveDialog, targetFolder: null })}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                moveDialog.targetFolder === null
                  ? 'bg-purple-500/30 border-2 border-purple-500'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-white font-medium">🏠 Meu Drive (Raiz)</span>
                <span className="ml-auto text-xs text-gray-400">Mover para a raiz</span>
              </div>
            </button>

            {/* Lista de pastas com navegação */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {moveDialogLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-400">Carregando pastas...</span>
                </div>
              ) : (
                moveDialogFolders.map((folder) => (
                  <div key={folder.id} className="flex items-center space-x-2">
                    <button
                      onClick={() => setMoveDialog({ ...moveDialog, targetFolder: folder.id.replace('gdrive_', '') })}
                      className={`flex-1 text-left p-3 rounded-lg transition-colors ${
                        moveDialog.targetFolder === folder.id.replace('gdrive_', '')
                          ? 'bg-purple-500/30 border-2 border-purple-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center">
                        <Folder className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-white">{folder.original_name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateMoveDialogToFolder(folder)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Entrar na pasta"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setMoveDialog({ open: false, file: null, targetFolder: null })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleMove} 
              className="bg-purple-500 hover:bg-purple-600"
              disabled={moveDialog.targetFolder === undefined}
            >
              {moveDialog.targetFolder === null ? 'Mover para Raiz' : 'Mover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar Pasta */}
      <Dialog open={createFolderDialog.open} onOpenChange={(open) => setCreateFolderDialog({ ...createFolderDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Nova Pasta</DialogTitle>
            <DialogDescription className="text-gray-400">
              Criar uma nova pasta em {breadcrumbs[breadcrumbs.length - 1].name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="folderName" className="text-white">Nome da pasta</Label>
              <Input
                id="folderName"
                value={createFolderDialog.name}
                onChange={(e) => setCreateFolderDialog({ ...createFolderDialog, name: e.target.value })}
                placeholder="Ex: Meus Documentos"
                className="bg-gray-800 border-gray-600 text-white mt-2"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateFolderDialog({ open: false, name: '' })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateFolder} className="bg-purple-500 hover:bg-purple-600">
              <FolderPlus className="w-4 h-4 mr-2" />
              Criar Pasta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🚀 Dialog: Compartilhamento */}
      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Share2 className="w-5 h-5 mr-2 text-blue-400" />
              Compartilhar arquivo
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Compartilhe "{shareDialog.file?.original_name}" com outras pessoas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="shareEmail" className="text-white">Email do destinatário</Label>
              <Input
                id="shareEmail"
                type="email"
                value={shareDialog.email}
                onChange={(e) => setShareDialog({ ...shareDialog, email: e.target.value })}
                placeholder="exemplo@email.com"
                className="bg-gray-800 border-gray-600 text-white mt-2"
              />
            </div>
            <div>
              <Label htmlFor="sharePermission" className="text-white">Permissão</Label>
              <select
                id="sharePermission"
                value={shareDialog.permission}
                onChange={(e) => setShareDialog({ ...shareDialog, permission: e.target.value })}
                className="w-full mt-2 p-2 bg-gray-800 border border-gray-600 text-white rounded-md"
              >
                <option value="reader">👁️ Visualizador (apenas leitura)</option>
                <option value="commenter">💬 Comentarista (pode comentar)</option>
                <option value="writer">✏️ Editor (pode editar)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShareDialog({ open: false, file: null, email: '', permission: 'reader' })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleShare} className="bg-blue-500 hover:bg-blue-600">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🚀 Dialog: Comentários */}
      <Dialog open={commentsDialog.open} onOpenChange={(open) => setCommentsDialog({ ...commentsDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
              Comentários
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Comentários em "{commentsDialog.file?.original_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Lista de comentários */}
            <div className="max-h-96 overflow-y-auto space-y-3">
              {commentsDialog.comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum comentário ainda</p>
                  <p className="text-gray-500 text-sm">Seja o primeiro a comentar!</p>
                </div>
              ) : (
                commentsDialog.comments.map((comment, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-start space-x-3">
                      {comment.author?.photoLink && (
                        <img 
                          src={comment.author.photoLink} 
                          alt={comment.author.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium text-sm">
                            {comment.author?.displayName || 'Usuário'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {comment.createdTime ? formatDate(comment.createdTime) : ''}
                          </p>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Novo comentário */}
            <div className="space-y-2 border-t border-gray-700 pt-4">
              <Label htmlFor="newComment" className="text-white">Adicionar comentário</Label>
              <Textarea
                id="newComment"
                value={commentsDialog.newComment}
                onChange={(e) => setCommentsDialog({ ...commentsDialog, newComment: e.target.value })}
                placeholder="Digite seu comentário..."
                className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCommentsDialog({ open: false, file: null, comments: [], newComment: '' })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Fechar
            </Button>
            <Button 
              onClick={handleAddComment} 
              className="bg-green-500 hover:bg-green-600"
              disabled={!commentsDialog.newComment.trim()}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comentar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🚀 Dialog: Histórico de Versões */}
      <Dialog open={versionsDialog.open} onOpenChange={(open) => setVersionsDialog({ ...versionsDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <History className="w-5 h-5 mr-2 text-yellow-400" />
              Histórico de Versões
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Versões anteriores de "{versionsDialog.file?.original_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {versionsDialog.versions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhuma versão anterior encontrada</p>
                  <p className="text-gray-500 text-sm">Este arquivo não possui histórico de versões</p>
                </div>
              ) : (
                versionsDialog.versions.map((version, index) => (
                  <div key={version.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex flex-col items-center">
                          <Badge className={index === 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {index === 0 ? 'Atual' : `v${versionsDialog.versions.length - index}`}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <p className="text-white font-medium">
                              {formatDate(version.modifiedTime)}
                            </p>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {formatFileSize(version.size)}
                            </Badge>
                          </div>
                          
                          {version.lastModifyingUser && (
                            <div className="flex items-center space-x-2">
                              {version.lastModifyingUser.photoLink && (
                                <img 
                                  src={version.lastModifyingUser.photoLink} 
                                  alt={version.lastModifyingUser.displayName}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <p className="text-gray-400 text-sm">
                                Modificado por {version.lastModifyingUser.displayName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {version.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(version.downloadUrl, '_blank')}
                            className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>
                        )}
                        
                        {index !== 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
                          >
                            <History className="w-4 h-4 mr-1" />
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setVersionsDialog({ open: false, file: null, versions: [] })}
              className="bg-gray-800 border-gray-600 text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <ImagePreview 
        open={imagePreview.open}
        onClose={() => setImagePreview({ open: false, image: null, images: [], index: 0 })}
        image={imagePreview.image}
        images={imagePreview.images || []}
        currentIndex={imagePreview.index || 0}
        onNavigate={(newIndex) => {
          if (imagePreview.images && imagePreview.images[newIndex]) {
            setImagePreview(prev => ({ 
              ...prev, 
              image: prev.images[newIndex], 
              index: newIndex 
            }));
          }
        }}
      />
    </div>
  )
}
