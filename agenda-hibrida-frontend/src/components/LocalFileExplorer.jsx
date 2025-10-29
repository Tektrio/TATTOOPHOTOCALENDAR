import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  Image as ImageIcon,
  FileText,
  Home,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  PieChart,
  Filter,
  X,
  Check,
  Copy,
  Move,
  Clock,
  Layers,
  TrendingUp,
  HardDrive
} from 'lucide-react';
import SyncStatusIndicator from './SyncStatusIndicator';
import FilePreviewModal from './FilePreviewModal';
import { formatFileSize, formatTimestamp } from '../utils/syncHelpers';

/**
 * Processa arquivos e cria estrutura de pastas hierárquica
 */
const buildFolderTree = (files, basePath) => {
  const tree = {
    name: 'root',
    path: '',
    type: 'folder',
    children: [],
    files: [],
    totalSize: 0,
    fileCount: 0
  };

  files.forEach(file => {
    if (!file.file_path) return;
    
    // Remove base path e divide em partes
    const relativePath = file.file_path.replace(basePath, '').replace(/^\//, '');
    const parts = relativePath.split('/');
    const fileName = parts.pop();
    
    let currentNode = tree;
    
    // Navega/cria estrutura de pastas
    parts.forEach(folderName => {
      if (!folderName) return;
      
      let folder = currentNode.children.find(c => c.name === folderName && c.type === 'folder');
      
      if (!folder) {
        folder = {
          name: folderName,
          path: currentNode.path ? `${currentNode.path}/${folderName}` : folderName,
          type: 'folder',
          children: [],
          files: [],
          totalSize: 0,
          fileCount: 0
        };
        currentNode.children.push(folder);
      }
      
      currentNode = folder;
    });
    
    // Adiciona arquivo à pasta atual
    currentNode.files.push(file);
    
    // Atualiza estatísticas
    let node = currentNode;
    while (node) {
      node.fileCount++;
      node.totalSize += file.file_size || 0;
      
      // Sobe na árvore
      const parentPath = node.path.split('/').slice(0, -1).join('/');
      node = parentPath ? findNodeByPath(tree, parentPath) : (node === currentNode ? tree : null);
      
      if (node === currentNode) break;
    }
  });
  
  // Ordena pastas antes de arquivos
  const sortNode = (node) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.files.sort((a, b) => (a.file_name || '').localeCompare(b.file_name || ''));
    node.children.forEach(sortNode);
  };
  
  sortNode(tree);
  return tree;
};

/**
 * Encontra nó por caminho
 */
const findNodeByPath = (tree, path) => {
  if (!path) return tree;
  
  const parts = path.split('/');
  let node = tree;
  
  for (const part of parts) {
    node = node.children.find(c => c.name === part);
    if (!node) return null;
  }
  
  return node;
};

/**
 * Explorador de arquivos estilo Google Drive
 */
export default function LocalFileExplorer({
  files = [],
  basePath = '',
  onSync,
  onRefresh,
  loading = false
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [expandedFolders, setExpandedFolders] = useState(new Set([''])); // root expandida
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'size', 'date', 'type'
  const [sortOrder, setSortOrder] = useState('asc');
  const [showStorageStats, setShowStorageStats] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // 'all', 'images', 'documents', 'other'
  const [contextMenu, setContextMenu] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Funções auxiliares (devem estar antes dos useMemos que as utilizam)
  const getFileIcon = (file) => {
    const ext = file.file_type?.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (['.pdf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      return <div className="w-5 h-5 text-purple-500">🎥</div>;
    }
    if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
      return <div className="w-5 h-5 text-green-500">🎵</div>;
    }
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) {
      return <div className="w-5 h-5 text-yellow-500">📦</div>;
    }
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const getFileCategory = (file) => {
    const ext = file.file_type?.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) return 'images';
    if (['.pdf', '.doc', '.docx', '.txt', '.rtf'].includes(ext)) return 'documents';
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) return 'videos';
    if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
    return 'other';
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-400" />
      : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  // Constrói árvore de pastas
  const folderTree = useMemo(() => {
    return buildFolderTree(files, basePath);
  }, [files, basePath]);

  // Obtém nó atual baseado no caminho
  const currentNode = useMemo(() => {
    return findNodeByPath(folderTree, currentPath) || folderTree;
  }, [folderTree, currentPath]);

  // Filtra e ordena arquivos
  const filteredAndSortedItems = useMemo(() => {
    let filtered = { ...currentNode };
    
    // Filtro por busca
    if (search) {
      filtered = {
        ...filtered,
        children: filtered.children.filter(c => 
          c.name.toLowerCase().includes(search.toLowerCase())
        ),
        files: filtered.files.filter(f => 
          f.file_name.toLowerCase().includes(search.toLowerCase())
        )
      };
    }
    
    // Filtro por tipo de arquivo
    if (fileTypeFilter !== 'all') {
      filtered = {
        ...filtered,
        files: filtered.files.filter(f => getFileCategory(f) === fileTypeFilter)
      };
    }
    
    // Ordenação de arquivos
    const sortedFiles = [...filtered.files].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.file_name || '').localeCompare(b.file_name || '');
          break;
        case 'size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
        case 'date':
          comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0);
          break;
        case 'type':
          comparison = (a.file_type || '').localeCompare(b.file_type || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Ordenação de pastas
    const sortedFolders = [...filtered.children].sort((a, b) => {
      if (sortBy === 'size') {
        return sortOrder === 'asc' 
          ? a.totalSize - b.totalSize
          : b.totalSize - a.totalSize;
      }
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
    
    return {
      ...filtered,
      children: sortedFolders,
      files: sortedFiles
    };
  }, [currentNode, search, fileTypeFilter, sortBy, sortOrder]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [{ name: 'Início', path: '' }];
    
    const parts = currentPath.split('/');
    const crumbs = [{ name: 'Início', path: '' }];
    
    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      crumbs.push({ name: part, path });
    });
    
    return crumbs;
  }, [currentPath]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+A ou Cmd+A - Selecionar tudo
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        const allFileIds = filteredAndSortedItems?.files.map(f => f.id) || [];
        setSelectedFiles(allFileIds);
      }
      
      // Escape - Limpar seleção ou fechar modais
      if (e.key === 'Escape') {
        if (selectedFiles.length > 0) {
          setSelectedFiles([]);
        }
        if (previewFile) {
          setPreviewFile(null);
        }
        if (contextMenu) {
          setContextMenu(null);
        }
      }
      
      // Delete - Deletar arquivos selecionados (placeholder)
      if (e.key === 'Delete' && selectedFiles.length > 0) {
        e.preventDefault();
        console.log('Delete shortcut - arquivos:', selectedFiles);
        // Implementar lógica de deleção
      }
      
      // Ctrl+F ou Cmd+F - Focar na busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Buscar"]')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFiles, previewFile, contextMenu, filteredAndSortedItems]);

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const navigateToFolder = (path) => {
    setCurrentPath(path);
    setExpandedFolders(new Set([path]));
  };

  const handleSelectFile = (fileId, checked) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    }
  };

  // Renderiza pasta em modo árvore
  const renderTreeFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const percentOfTotal = folderTree.totalSize > 0 
      ? (folder.totalSize / folderTree.totalSize * 100) 
      : 0;
    
    return (
      <div key={folder.path}>
        <div
          className={`group relative flex items-center gap-2 px-3 py-2.5 mx-2 my-0.5 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-all border ${
            currentPath === folder.path ? 'bg-blue-600/20 border-blue-500/50' : 'border-transparent'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => toggleFolder(folder.path)}
          onDoubleClick={() => navigateToFolder(folder.path)}
        >
          {/* Barra de progresso visual do tamanho (TreeSize style) */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 transition-all pointer-events-none"
            style={{ width: `${Math.max(percentOfTotal, 2)}%` }}
          />
          
          <div className="relative flex items-center gap-2 flex-1 min-w-0">
            <button
              className="p-0 hover:bg-gray-600 rounded flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.path);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {isExpanded ? (
              <FolderOpen className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            ) : (
              <Folder className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            )}
            
            <span className="flex-1 text-white font-medium truncate">{folder.name}</span>
            
            <div className="flex flex-col items-end gap-0.5 text-xs flex-shrink-0">
              <span className="text-gray-300 font-semibold">{formatFileSize(folder.totalSize)}</span>
              <span className="text-gray-500">{folder.fileCount} {folder.fileCount === 1 ? 'item' : 'itens'}</span>
              {percentOfTotal > 0.1 && (
                <span className="text-blue-400 text-[10px] font-medium">{percentOfTotal.toFixed(1)}%</span>
              )}
            </div>
          </div>
        </div>
        
        {isExpanded && folder.children.map(child => renderTreeFolder(child, depth + 1))}
      </div>
    );
  };

  // Renderiza item em modo lista
  const renderListItem = (item) => {
    if (item.type === 'folder') {
      const percentOfTotal = currentNode.totalSize > 0 
        ? (item.totalSize / currentNode.totalSize * 100) 
        : 0;
      
      return (
        <div
          key={item.path}
          className="group relative flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 cursor-pointer rounded transition-all"
          onDoubleClick={() => navigateToFolder(item.path)}
        >
          {/* Barra de progresso visual do tamanho (TreeSize style) */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 transition-all pointer-events-none"
            style={{ width: `${Math.max(percentOfTotal, 1)}%` }}
          />
          
          <div className="relative flex items-center gap-3 flex-1 min-w-0">
            <Folder className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{item.name}</div>
              <div className="text-xs text-gray-400">
                {item.fileCount} {item.fileCount === 1 ? 'item' : 'itens'} 
                {percentOfTotal > 0.1 && (
                  <span className="ml-2 text-blue-400 font-medium">• {percentOfTotal.toFixed(1)}%</span>
                )}
              </div>
            </div>
            
            <div className="text-sm font-semibold text-gray-300">{formatFileSize(item.totalSize)}</div>
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }
    
    // Arquivo
    const percentOfTotal = currentNode.totalSize > 0 
      ? (item.file_size / currentNode.totalSize * 100) 
      : 0;
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(item.file_type?.toLowerCase());
    
    return (
      <div
        key={item.id}
        className="group relative flex items-center gap-3 px-4 py-3 hover:bg-gray-700/50 rounded transition-all"
      >
        {/* Barra de progresso visual do tamanho */}
        {percentOfTotal > 0.05 && (
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500/10 to-blue-500/5 transition-all pointer-events-none"
            style={{ width: `${Math.max(percentOfTotal, 0.5)}%` }}
          />
        )}
        
        <div className="relative flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            checked={selectedFiles.includes(item.id)}
            onCheckedChange={(checked) => handleSelectFile(item.id, checked)}
          />
          
          {/* Thumbnail para imagens */}
          {isImage ? (
            <div className="w-10 h-10 rounded border border-gray-600 overflow-hidden bg-gray-800 flex-shrink-0">
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/${item.id}/thumbnail`}
                alt={item.file_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg></div>';
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              {getFileIcon(item)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate" title={item.file_name}>
              {item.file_name}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>{formatTimestamp(item.created_at)}</span>
              {percentOfTotal > 0.1 && (
                <span className="text-blue-400 font-medium">• {percentOfTotal.toFixed(1)}%</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <SyncStatusIndicator fileId={item.id} compact />
            <span className="text-sm font-semibold text-gray-300 w-20 text-right">{formatFileSize(item.file_size)}</span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewFile(item)}
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSync && onSync([item.id])}
              title="Sincronizar"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Renderiza item em modo grade
  const renderGridItem = (item) => {
    if (item.type === 'folder') {
      const percentOfTotal = currentNode.totalSize > 0 
        ? (item.totalSize / currentNode.totalSize * 100) 
        : 0;
      
      return (
        <div
          key={item.path}
          className="relative flex flex-col items-center p-4 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-all hover:scale-105 border border-transparent hover:border-yellow-500/30"
          onDoubleClick={() => navigateToFolder(item.path)}
        >
          {/* Indicador de tamanho no fundo */}
          {percentOfTotal > 1 && (
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none"
              style={{ height: `${Math.min(percentOfTotal * 2, 100)}%` }}
            />
          )}
          
          <Folder className="w-16 h-16 text-yellow-400 mb-3 z-10 relative" />
          <div className="text-center w-full z-10 relative">
            <div className="font-medium text-white truncate mb-1" title={item.name}>
              {item.name}
            </div>
            <div className="text-xs text-gray-400">
              {item.fileCount} {item.fileCount === 1 ? 'item' : 'itens'}
            </div>
            <div className="text-xs font-semibold text-gray-300">{formatFileSize(item.totalSize)}</div>
            {percentOfTotal > 0.5 && (
              <div className="text-[10px] text-blue-400 font-medium mt-1">{percentOfTotal.toFixed(1)}%</div>
            )}
          </div>
        </div>
      );
    }
    
    // Arquivo
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(item.file_type?.toLowerCase());
    const percentOfTotal = currentNode.totalSize > 0 
      ? (item.file_size / currentNode.totalSize * 100) 
      : 0;
    
    return (
      <div
        key={item.id}
        className="relative flex flex-col items-center p-4 hover:bg-gray-700/50 rounded-lg transition-all group border border-transparent hover:border-blue-500/30"
      >
        <Checkbox
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          checked={selectedFiles.includes(item.id)}
          onCheckedChange={(checked) => handleSelectFile(item.id, checked)}
        />
        
        {/* Indicador de tamanho no fundo para arquivos grandes */}
        {percentOfTotal > 0.5 && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"
            style={{ height: `${Math.min(percentOfTotal * 3, 100)}%` }}
          />
        )}
        
        {/* Thumbnail para imagens ou ícone */}
        {isImage ? (
          <div className="w-24 h-24 rounded-lg border border-gray-600 overflow-hidden bg-gray-800 mb-3 z-10 relative shadow-lg">
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/files/${item.id}/thumbnail`}
              alt={item.file_name}
              className="w-full h-full object-cover hover:scale-110 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg></div>';
              }}
            />
          </div>
        ) : (
          <div className="mb-3 z-10 relative transform scale-150">
            {getFileIcon(item)}
          </div>
        )}
        
        <div className="text-center w-full z-10 relative">
          <div className="font-medium text-white truncate text-sm mb-1 px-1" title={item.file_name}>
            {item.file_name}
          </div>
          <div className="text-xs font-semibold text-gray-300">{formatFileSize(item.file_size)}</div>
          {percentOfTotal > 0.5 && (
            <div className="text-[10px] text-blue-400 font-medium mt-1">{percentOfTotal.toFixed(1)}%</div>
          )}
        </div>
        
        <SyncStatusIndicator fileId={item.id} compact className="mt-2 z-10 relative" />
        
        {/* Botões de ação visíveis ao hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPreviewFile(item)}
            title="Visualizar"
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex h-auto min-h-[700px] max-h-[calc(100vh-120px)]">
      {/* Sidebar - Árvore de navegação */}
      <div className="w-64 border-r border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold text-base">Estrutura de Pastas</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-blue-400" />
              <span className="text-sm text-gray-300">{folderTree.fileCount} arquivos</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3 text-green-400" />
              <span className="text-sm text-gray-300">{formatFileSize(folderTree.totalSize)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div
            className={`flex items-center gap-2 px-3 py-3 mx-2 my-1 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors border ${
              currentPath === '' ? 'bg-blue-600/20 border-blue-500/50' : 'border-transparent'
            }`}
            onClick={() => navigateToFolder('')}
          >
            <Home className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Início</span>
          </div>
          
          {folderTree.children.map(folder => renderTreeFolder(folder, 0))}
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b border-gray-700">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <button
                  onClick={() => navigateToFolder(crumb.path)}
                  className={`hover:text-white transition-colors ${
                    index === breadcrumbs.length - 1 ? 'text-white font-semibold' : 'text-gray-400'
                  }`}
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </div>
            ))}
          </div>

          {/* Filtros rápidos por tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={fileTypeFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFileTypeFilter('all')}
              className="h-8"
            >
              Todos
            </Button>
            <Button
              variant={fileTypeFilter === 'images' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFileTypeFilter('images')}
              className="h-8"
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Imagens
            </Button>
            <Button
              variant={fileTypeFilter === 'documents' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFileTypeFilter('documents')}
              className="h-8"
            >
              <FileText className="w-3 h-3 mr-1" />
              Documentos
            </Button>
            <Button
              variant={fileTypeFilter === 'videos' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFileTypeFilter('videos')}
              className="h-8"
            >
              🎥 Vídeos
            </Button>
            <Button
              variant={fileTypeFilter === 'audio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFileTypeFilter('audio')}
              className="h-8"
            >
              🎵 Áudio
            </Button>
            
            {showStorageStats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStorageStats(false)}
                className="h-8 ml-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            {!showStorageStats && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStorageStats(true)}
                className="h-8 ml-auto"
              >
                <PieChart className="w-4 h-4 mr-1" />
                Estatísticas
              </Button>
            )}
          </div>

          {/* Barra de ferramentas */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos e pastas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
            
            {selectedFiles.length > 0 && (
              <Button
                size="sm"
                onClick={() => onSync && onSync(selectedFiles)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar ({selectedFiles.length})
              </Button>
            )}
            
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Painel de Estatísticas - FORA do CardHeader */}
        {showStorageStats && (
          <div className="mx-4 my-3 bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-gray-800/30 rounded-lg p-4 border border-gray-700 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Estatísticas de Armazenamento</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStorageStats(false)}
                className="h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card Total - Compacto */}
              <div className="lg:col-span-3 bg-gradient-to-br from-blue-600/20 to-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <div className="text-xs font-medium text-blue-400">Total Usado</div>
                </div>
                <div className="text-2xl font-bold text-white">{formatFileSize(currentNode.totalSize)}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-300">
                  <span><FileText className="w-3 h-3 inline mr-1" />{currentNode.fileCount} arquivo{currentNode.fileCount !== 1 ? 's' : ''}</span>
                  {currentNode.children.length > 0 && (
                    <span><Folder className="w-3 h-3 inline mr-1" />{currentNode.children.length} pasta{currentNode.children.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              {/* Distribuição - Compacta */}
              <div className="lg:col-span-9">
                <div className="text-xs font-medium text-gray-300 mb-2">Distribuição por Tipo</div>
                <div className="space-y-2">
                  {(() => {
                    const stats = {
                      images: { size: 0, count: 0, color: 'bg-blue-500', icon: '🖼️', label: 'Imagens', ringColor: 'ring-blue-500' },
                      documents: { size: 0, count: 0, color: 'bg-red-500', icon: '📄', label: 'Documentos', ringColor: 'ring-red-500' },
                      videos: { size: 0, count: 0, color: 'bg-purple-500', icon: '🎥', label: 'Vídeos', ringColor: 'ring-purple-500' },
                      audio: { size: 0, count: 0, color: 'bg-green-500', icon: '🎵', label: 'Áudio', ringColor: 'ring-green-500' },
                      other: { size: 0, count: 0, color: 'bg-gray-500', icon: '📦', label: 'Outros', ringColor: 'ring-gray-500' }
                    };
                    
                    const countAllFiles = (node) => {
                      node.files.forEach(file => {
                        const category = getFileCategory(file);
                        stats[category].size += file.file_size || 0;
                        stats[category].count++;
                      });
                      node.children.forEach(countAllFiles);
                    };
                    
                    countAllFiles(currentNode);
                    
                    return Object.entries(stats)
                      .filter(([, data]) => data.count > 0)
                      .sort(([, a], [, b]) => b.size - a.size)
                      .map(([category, data]) => {
                        const percentage = currentNode.totalSize > 0 
                          ? (data.size / currentNode.totalSize * 100)
                          : 0;
                        
                        return (
                          <div key={category} className="group">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                                <span className="text-base">{data.icon}</span>
                                <span className="text-xs font-medium text-gray-200">{data.label}</span>
                              </div>
                              <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden border border-gray-600/50">
                                <div 
                                  className={`h-full ${data.color} transition-all duration-500 ease-out`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-white w-12 text-right">{percentage.toFixed(1)}%</span>
                                <span className="font-semibold text-gray-300 w-16 text-right">{formatFileSize(data.size)}</span>
                                <span className="text-gray-500 w-8 text-right">({data.count})</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </div>
            
            {/* Informações úteis adicionais */}
            <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Maior arquivo</div>
                  <div className="text-gray-300 font-medium truncate">
                    {(() => {
                      const allFiles = [];
                      const collectFiles = (node) => {
                        allFiles.push(...node.files);
                        node.children.forEach(collectFiles);
                      };
                      collectFiles(currentNode);
                      const largestFile = allFiles.reduce((max, file) => 
                        file.file_size > (max?.file_size || 0) ? file : max, null);
                      return largestFile ? formatFileSize(largestFile.file_size) : '-';
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Média por arquivo</div>
                  <div className="text-gray-300 font-medium">
                    {formatFileSize(currentNode.fileCount > 0 ? currentNode.totalSize / currentNode.fileCount : 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-gray-500 text-[10px]">Tipos diferentes</div>
                  <div className="text-gray-300 font-medium">
                    {(() => {
                      const types = new Set();
                      const collectTypes = (node) => {
                        node.files.forEach(file => {
                          if (file.file_type) types.add(file.file_type.toLowerCase());
                        });
                        node.children.forEach(collectTypes);
                      };
                      collectTypes(currentNode);
                      return types.size;
                    })()} formato{(() => {
                      const types = new Set();
                      const collectTypes = (node) => {
                        node.files.forEach(file => {
                          if (file.file_type) types.add(file.file_type.toLowerCase());
                        });
                        node.children.forEach(collectTypes);
                      };
                      collectTypes(currentNode);
                      return types.size !== 1 ? 's' : '';
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <RefreshCw className="w-16 h-16 mb-4 animate-spin opacity-50" />
              <p className="text-lg">Carregando arquivos...</p>
            </div>
          ) : filteredAndSortedItems.children.length === 0 && filteredAndSortedItems.files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Folder className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">
                {search || fileTypeFilter !== 'all' ? 'Nenhum resultado encontrado' : 'Esta pasta está vazia'}
              </p>
              {(search || fileTypeFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFileTypeFilter('all');
                  }}
                  className="mt-4"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="p-2 pb-40">
                  {/* Cabeçalho com ordenação */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/80 rounded-t border-b border-gray-700 mb-2">
                    <div className="w-8"></div>
                    <div className="w-8"></div>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex-1 flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Nome {getSortIcon('name')}
                    </button>
                    <button
                      onClick={() => handleSort('date')}
                      className="w-32 flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Data {getSortIcon('date')}
                    </button>
                    <button
                      onClick={() => handleSort('size')}
                      className="w-24 flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Tamanho {getSortIcon('size')}
                    </button>
                    <div className="w-10"></div>
                  </div>
                  
                  {/* Pastas primeiro */}
                  {filteredAndSortedItems.children.map(renderListItem)}
                  
                  {/* Depois arquivos */}
                  {filteredAndSortedItems.files.map(renderListItem)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-4 pb-40">
                  {/* Pastas primeiro */}
                  {filteredAndSortedItems.children.map(renderGridItem)}
                  
                  {/* Depois arquivos */}
                  {filteredAndSortedItems.files.map(renderGridItem)}
                </div>
              )}
            </>
          )}
        </CardContent>
      </div>

      {/* Modal de Preview */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          files={filteredAndSortedItems.files}
          onClose={() => setPreviewFile(null)}
          onDownload={(file) => {
            console.log('Download file:', file);
            // Implementar lógica de download
          }}
        />
      )}
    </Card>
  );
}

