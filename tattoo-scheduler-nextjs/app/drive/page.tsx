'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Upload,
  Download,
  Trash2,
  Search,
  RefreshCw,
  Home,
  ChevronRight,
  Grid,
  List,
  Eye,
  Share2,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  size?: number;
  modifiedTime: Date;
  thumbnailUrl?: string;
  webViewLink?: string;
}

export default function GoogleDriveExplorerPage() {
  const [currentPath, setCurrentPath] = useState<string[]>(['Root']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const mockItems: DriveItem[] = [
    {
      id: '1',
      name: 'Fotos Clientes',
      type: 'folder',
      modifiedTime: new Date('2025-11-01')
    },
    {
      id: '2',
      name: 'Contratos',
      type: 'folder',
      modifiedTime: new Date('2025-10-28')
    },
    {
      id: '3',
      name: 'tatuagem_costas_joao.jpg',
      type: 'file',
      mimeType: 'image/jpeg',
      size: 2048000,
      modifiedTime: new Date('2025-11-01T15:30:00'),
      thumbnailUrl: '/placeholder-tattoo.jpg'
    },
    {
      id: '4',
      name: 'contrato_maria.pdf',
      type: 'file',
      mimeType: 'application/pdf',
      size: 524288,
      modifiedTime: new Date('2025-10-30T10:00:00')
    },
    {
      id: '5',
      name: 'video_processo.mp4',
      type: 'file',
      mimeType: 'video/mp4',
      size: 10485760,
      modifiedTime: new Date('2025-10-29T14:20:00')
    }
  ];

  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number | undefined): string => {
    if (!bytes) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (item: DriveItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    
    const mimeType = item.mimeType?.toLowerCase() || '';
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    }
    if (mimeType.includes('video')) {
      return <Film className="w-8 h-8 text-pink-500" />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const handleNavigate = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    toast.info(`Navegando para ${folderName}`);
  };

  const handleNavigateToIndex = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleSync = () => {
    toast.success('Sincronização iniciada');
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Google Drive
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Navegue e gerencie seus arquivos no Drive
            </p>
          </div>
          <Button
            onClick={handleSync}
            className="bg-gradient-to-r from-blue-600 to-purple-600 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </Button>
        </div>

        {/* Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar no Drive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View toggles */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Lista
              </Button>
            </div>

            {/* Ações */}
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </Card>

        {/* Breadcrumb */}
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-gray-500" />
            {currentPath.map((folder, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigateToIndex(index)}
                  className={`hover:text-blue-600 transition-colors ${
                    index === currentPath.length - 1
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {folder}
                </button>
                {index < currentPath.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Ações em lote */}
        {selectedItems.length > 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedItems.length} item(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => {
                  if (item.type === 'folder') {
                    handleNavigate(item.name);
                  } else {
                    toggleSelection(item.id);
                  }
                }}
              >
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    {getFileIcon(item)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatSize(item.size)}
                      </p>
                    )}
                  </div>
                  {item.type === 'folder' && (
                    <Badge variant="outline">Pasta</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedItems.length === filteredItems.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredItems.map(i => i.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tamanho
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Modificado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                        />
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => item.type === 'folder' && handleNavigate(item.name)}
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(item)}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="capitalize">
                          {item.type === 'folder' ? 'Pasta' : item.mimeType?.split('/')[1] || 'Arquivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatSize(item.size)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.modifiedTime.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {item.type === 'file' && (
                            <>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum arquivo encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Tente outro termo de busca' : 'Esta pasta está vazia'}
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 gap-2">
              <Upload className="w-4 h-4" />
              Fazer Upload
            </Button>
          </Card>
        )}

        {/* Info */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-gray-900 dark:text-white">Armazenamento:</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                2.5 GB de 15 GB usados
              </p>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Sincronização:</strong>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Última sync: há 2 horas
              </p>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Status:</strong>
              <Badge className="ml-2 bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

