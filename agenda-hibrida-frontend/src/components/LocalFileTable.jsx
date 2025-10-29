import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, RefreshCw, Filter } from 'lucide-react';
import SyncStatusIndicator from './SyncStatusIndicator';
import { formatFileSize, formatTimestamp, sortFiles, filterBySearch } from '../utils/syncHelpers';

/**
 * Extrai pasta pai do caminho completo do arquivo
 */
const getParentFolder = (filePath, fileName) => {
  if (!filePath || !fileName) return null;
  
  // Remove o nome do arquivo para pegar só o caminho
  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
  
  // Pega apenas o nome da última pasta
  const folders = dirPath.split('/');
  const lastFolder = folders[folders.length - 1];
  
  // Se a última pasta não for o base_path (começa com @)
  if (lastFolder && !lastFolder.startsWith('@')) {
    return lastFolder;
  }
  
  return null;
};

/**
 * Tabela de arquivos locais com filtros e seleção múltipla
 */
export default function LocalFileTable({ 
  files = [], 
  destinations = [],
  onSync,
  onView,
  onDownload,
  onRefresh
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Filtra e ordena arquivos
  const processedFiles = useMemo(() => {
    let result = filterBySearch(files, search);
    result = sortFiles(result, sortBy, sortOrder);
    return result;
  }, [files, search, sortBy, sortOrder]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFiles(processedFiles.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId, checked) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    }
  };

  const handleSyncSelected = () => {
    if (onSync && selectedFiles.length > 0) {
      onSync(selectedFiles);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📁 Arquivos Locais
            <Badge variant="outline">{processedFiles.length}</Badge>
          </CardTitle>
          
          <div className="flex gap-2">
            {selectedFiles.length > 0 && (
              <Button onClick={handleSyncSelected} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Selecionados ({selectedFiles.length})
              </Button>
            )}
            
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Busca */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome de arquivo ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-2 text-left">
                  <Checkbox
                    checked={selectedFiles.length === processedFiles.length && processedFiles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:text-white"
                  onClick={() => toggleSort('name')}
                >
                  Arquivo {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Categoria</th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:text-white"
                  onClick={() => toggleSort('size')}
                >
                  Tamanho {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left">Status</th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:text-white"
                  onClick={() => toggleSort('date')}
                >
                  Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processedFiles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                    {search ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo indexado'}
                  </td>
                </tr>
              ) : (
                processedFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={(checked) => handleSelectFile(file.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {file.file_type === '.jpg' || file.file_type === '.png' ? '🖼️' : '📄'}
                        </span>
                        <div className="flex flex-col">
                          <span className="truncate max-w-xs font-medium" title={file.file_name}>
                            {file.file_name}
                          </span>
                          {/* Mostra subpasta se arquivo estiver dentro de uma */}
                          {(() => {
                            const parentFolder = getParentFolder(file.file_path, file.file_name);
                            return parentFolder ? (
                              <span className="text-xs text-gray-500 truncate max-w-xs flex items-center gap-1" title={file.file_path}>
                                <span className="text-blue-400">📁</span>
                                <span>{parentFolder}/</span>
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {file.client_name ? (
                        <Badge variant="outline">{file.client_name}</Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">Sem cliente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-gray-700">
                        {file.category || 'outros'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-4 py-3">
                      <SyncStatusIndicator fileId={file.id} compact />
                      <div className="text-xs text-gray-500 mt-1">
                        {file.synced_count}/{file.total_destinations || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatTimestamp(file.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {onDownload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownload(file)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {onSync && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSync([file.id])}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

