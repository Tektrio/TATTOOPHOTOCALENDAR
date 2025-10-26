import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Folder, 
  Upload, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  FileText,
  Grid,
  List,
  Search,
  X,
  Eye
} from 'lucide-react';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const FilesTab = ({ customerId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    { value: 'referencias', label: 'Referências', color: 'bg-blue-500' },
    { value: 'desenhos_aprovados', label: 'Desenhos Aprovados', color: 'bg-green-500' },
    { value: 'fotos_finais', label: 'Fotos Finais', color: 'bg-purple-500' },
    { value: 'documentos', label: 'Documentos', color: 'bg-orange-500' }
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Carregar arquivos do cliente
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedCategory === 'all' 
        ? `${API_URL}/api/customers/${customerId}/files`
        : `${API_URL}/api/customers/${customerId}/files?category=${selectedCategory}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar arquivos');
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err);
      setError('Erro ao carregar arquivos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [customerId, selectedCategory, API_URL]);

  useEffect(() => {
    if (customerId) {
      loadFiles();
    }
  }, [customerId, loadFiles]);

  // Upload de arquivos
  const handleFileUpload = async (uploadFiles, category) => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      Array.from(uploadFiles).forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', category);

      const response = await fetch(`${API_URL}/api/customers/${customerId}/files`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar arquivos');
      }

      const data = await response.json();
      setSuccess(`${data.files.length} arquivo(s) enviado(s) com sucesso!`);
      
      // Recarregar lista de arquivos
      await loadFiles();
      
      // Limpar mensagem de sucesso após 3s
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao enviar arquivos:', err);
      setError(err.message || 'Erro ao enviar arquivos. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Delete de arquivo
  const handleDeleteFile = async (fileId) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/customers/${customerId}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar arquivo');
      }

      setSuccess('Arquivo deletado com sucesso!');
      
      // Recarregar lista
      await loadFiles();
      
      // Fechar dialog
      setDeleteDialog({ open: false, file: null });
      
      // Limpar mensagem após 3s
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err);
      setError('Erro ao deletar arquivo. Tente novamente.');
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, category = 'referencias') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, category);
    }
  };

  // Filtrar arquivos por busca
  const filteredFiles = files.filter(file => 
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Verificar se é imagem
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  // Obter cor da categoria
  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  // Obter label da categoria
  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando arquivos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center justify-between text-green-800">
            <span>{success}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSuccess(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Arquivos do Cliente
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upload Zones por categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.value}
            className={`relative border-2 border-dashed transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, category.value)}
          >
            <CardContent className="py-6 text-center">
              <div className={`w-12 h-12 rounded-full ${category.color} mx-auto mb-3 flex items-center justify-center`}>
                <Folder className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-sm mb-2">{category.label}</h3>
              <p className="text-xs text-gray-500 mb-3">
                {files.filter(f => f.category === category.value).length} arquivo(s)
              </p>
              
              <label htmlFor={`upload-${category.value}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Enviando...' : 'Upload'}
                  </span>
                </Button>
              </label>
              <input
                id={`upload-${category.value}`}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files, category.value)}
                accept="image/*,.pdf,.psd,.ai,.svg"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista/Grid de arquivos */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum arquivo encontrado</p>
            <p className="text-sm">
              {searchTerm ? 'Tente uma busca diferente' : 'Faça upload de arquivos usando os cards acima'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Preview */}
                    <div 
                      className="aspect-square bg-gray-100 relative cursor-pointer"
                      onClick={() => isImage(file.file_type) && setPreviewImage(file)}
                    >
                      {isImage(file.file_type) ? (
                        <img 
                          src={`${API_URL}${file.url}`}
                          alt={file.original_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Overlay com ações */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {isImage(file.file_type) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPreviewImage(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(`${API_URL}/api/customers/${customerId}/files/${file.id}/download`, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteDialog({ open: true, file })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium truncate" title={file.original_name}>
                        {file.original_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getCategoryColor(file.category)}>
                          {getCategoryLabel(file.category)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.file_size)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isImage(file.file_type) ? (
                        <img 
                          src={`${API_URL}${file.url}`}
                          alt={file.original_name}
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => setPreviewImage(file)}
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-gray-400 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.original_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(file.category)}>
                            {getCategoryLabel(file.category)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isImage(file.file_type) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewImage(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`${API_URL}/api/customers/${customerId}/files/${file.id}/download`, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteDialog({ open: true, file })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, file: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o arquivo "{deleteDialog.file?.original_name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteFile(deleteDialog.file?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview de imagem */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={`${API_URL}${previewImage.url}`}
              alt={previewImage.original_name}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded">
              <p className="font-medium">{previewImage.original_name}</p>
              <p className="text-sm text-gray-300">{formatFileSize(previewImage.file_size)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesTab;
