'use client';

import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Database,
  HardDrive,
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  Download,
  Upload,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface LocalFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'image' | 'video' | 'document' | 'database' | 'other';
  size: number;
  modified: Date;
  path: string;
  synced: boolean;
}

export default function DadosLocalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPath, setCurrentPath] = useState('/tattoo-data');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Mock data
  const mockFiles: LocalFile[] = [
    {
      id: '1',
      name: 'clientes',
      type: 'folder',
      size: 0,
      modified: new Date('2025-11-01'),
      path: '/tattoo-data/clientes',
      synced: true
    },
    {
      id: '2',
      name: 'agendamentos',
      type: 'folder',
      size: 0,
      modified: new Date('2025-11-01'),
      path: '/tattoo-data/agendamentos',
      synced: true
    },
    {
      id: '3',
      name: 'tattoo.db',
      type: 'file',
      fileType: 'database',
      size: 5242880, // 5MB
      modified: new Date('2025-11-01T10:30:00'),
      path: '/tattoo-data/tattoo.db',
      synced: true
    },
    {
      id: '4',
      name: 'backup_2025-11-01.db',
      type: 'file',
      fileType: 'database',
      size: 5120000,
      modified: new Date('2025-11-01T00:00:00'),
      path: '/tattoo-data/backup_2025-11-01.db',
      synced: false
    },
    {
      id: '5',
      name: 'fotos',
      type: 'folder',
      size: 0,
      modified: new Date('2025-10-30'),
      path: '/tattoo-data/fotos',
      synced: false
    },
    {
      id: '6',
      name: 'relatorio_outubro.pdf',
      type: 'file',
      fileType: 'document',
      size: 1048576, // 1MB
      modified: new Date('2025-10-31'),
      path: '/tattoo-data/relatorio_outubro.pdf',
      synced: true
    }
  ];

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (file: LocalFile) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-blue-500" />;
    
    switch (file.fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'video':
        return <Film className="w-5 h-5 text-pink-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'database':
        return <Database className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const totalSize = mockFiles.reduce((sum, file) => sum + file.size, 0);
  const syncedCount = mockFiles.filter(f => f.synced).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dados Locais
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie arquivos e banco de dados local
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Arquivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockFiles.length}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Espaço Usado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSize(totalSize)}</p>
              </div>
              <Database className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sincronizados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{syncedCount}/{mockFiles.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Sync</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">há 2 horas</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Ações e Busca */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Database className="w-4 h-4" />
                Backup Agora
              </Button>
            </div>
          </div>
        </Card>

        {/* Caminho Atual */}
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <HardDrive className="w-4 h-4" />
            <span className="font-mono">{currentPath}</span>
          </div>
        </Card>

        {/* Ações em Lote */}
        {selectedFiles.length > 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Sincronizar
                </Button>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabela de Arquivos */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(filteredFiles.map(f => f.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Modificado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      if (file.type === 'folder') {
                        setCurrentPath(file.path);
                      }
                    }}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="capitalize">
                        {file.type === 'folder' ? 'Pasta' : file.fileType || 'Arquivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(file.modified)}
                    </td>
                    <td className="px-4 py-4">
                      {file.synced ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sincronizado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-800 border-yellow-300 dark:text-yellow-200 dark:border-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {file.type === 'file' && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum arquivo encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Tente outro termo de busca' : 'Comece fazendo upload de arquivos'}
              </p>
            </div>
          )}
        </Card>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Banco de Dados Local
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Arquivo:</span>
                <span className="font-mono text-gray-900 dark:text-white">tattoo.db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tamanho:</span>
                <span className="font-mono text-gray-900 dark:text-white">5.0 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Última modificação:</span>
                <span className="text-gray-900 dark:text-white">Hoje às 10:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Último backup:</span>
                <span className="text-gray-900 dark:text-white">Hoje às 00:00</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              Sincronização
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Modo:</span>
                <Badge className="bg-green-100 text-green-800">Automático</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Intervalo:</span>
                <span className="text-gray-900 dark:text-white">A cada 24 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Próxima sync:</span>
                <span className="text-gray-900 dark:text-white">Amanhã às 00:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge className="bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

