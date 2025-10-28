import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Search,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3001';

const GaleriaCorrigida = () => {
  // Estados
  const [files, setFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('referencias');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // Novo filtro por fonte
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Categorias disponíveis
  const categories = [
    { value: 'referencias', label: '📋 Referências', color: 'blue' },
    { value: 'desenhos_aprovados', label: '✏️ Desenhos Aprovados', color: 'green' },
    { value: 'fotos_finais', label: '📸 Fotos Finais', color: 'purple' }
  ];

  // Fontes disponíveis
  const sources = [
    { value: 'local', label: '💾 Local', icon: '💾' },
    { value: 'drive', label: '☁️ Google Drive', icon: '☁️' },
    { value: 'qnap', label: '🗄️ QNAP', icon: '🗄️' }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFiles(),
        loadClients()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da galeria');
    } finally {
      setLoading(false);
    }
  };

  // Carregar arquivos
  const loadFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error('Erro ao carregar arquivos:', response.status);
        // Não exibir toast se não houver arquivos (status vazio é normal)
        if (response.status !== 404) {
          toast.error('❌ Erro ao carregar arquivos da galeria');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('❌ Erro de conexão ao carregar arquivos');
    }
  };

  // Carregar clientes
  const loadClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        console.error('Erro ao carregar clientes:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  // Selecionar arquivos
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('❌ Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas');
      e.target.value = '';
      return;
    }

    // Validar tamanho (max 10MB por arquivo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const largeFiles = files.filter(file => file.size > maxSize);
    
    if (largeFiles.length > 0) {
      toast.error('❌ Arquivos muito grandes. Máximo 10MB por arquivo');
      e.target.value = '';
      return;
    }

    setSelectedFiles(files);
    toast.success(`✅ ${files.length} arquivo(s) selecionado(s). Clique em "Confirmar Upload" para enviar.`);
  };

  // Confirmar upload
  const confirmUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('⚠️ Selecione arquivos antes de fazer upload');
      return;
    }

    // Validações
    if (!selectedClient) {
      toast.error('⚠️ Selecione um cliente antes de fazer upload');
      return;
    }

    if (!selectedCategory) {
      toast.error('⚠️ Selecione uma categoria antes de fazer upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('files', file);
          formData.append('client_id', selectedClient);
          formData.append('category', selectedCategory);

          const response = await fetch(`${API_URL}/api/files/upload`, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Erro ao fazer upload de ${file.name}`);
          }
        } catch (err) {
          errorCount++;
          console.error(`Erro ao fazer upload de ${file.name}:`, err);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ ${successCount} arquivo(s) enviado(s) com sucesso!`);
        await loadFiles();
        setShowUploadForm(false);
        
        // Resetar formulário
        setSelectedFiles([]);
        setSelectedClient('');
        setSelectedCategory('referencias');
      }
      
      if (errorCount > 0) {
        toast.error(`❌ Erro ao enviar ${errorCount} arquivo(s). Tente novamente.`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('❌ Erro ao fazer upload dos arquivos');
    } finally {
      setUploading(false);
    }
  };

  // Cancelar upload
  const cancelUpload = () => {
    setSelectedFiles([]);
    setSelectedClient('');
    setSelectedCategory('referencias');
    setShowUploadForm(false);
  };

  // Deletar arquivo
  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('✅ Arquivo deletado com sucesso!');
        await loadFiles();
      } else {
        toast.error('❌ Erro ao deletar arquivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('❌ Erro de conexão ao deletar arquivo');
    } finally {
      setFileToDelete(null);
    }
  };

  // Baixar arquivo
  const handleDownload = async (file) => {
    try {
      const response = await fetch(`${API_URL}/api/files/${file.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.original_name || file.filename || `arquivo_${file.id}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('✅ Download iniciado com sucesso!');
      } else {
        toast.error('❌ Erro ao baixar arquivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('❌ Erro de conexão ao baixar arquivo');
    }
  };

  // Filtrar arquivos
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = filterClient === 'all' || file.client_id === parseInt(filterClient);
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesSource = filterSource === 'all' || file.source === filterSource;
    
    return matchesSearch && matchesClient && matchesCategory && matchesSource;
  });

  // Obter cor da categoria
  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  // Obter label da categoria
  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-400">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Galeria de Arquivos
              </CardTitle>
              <CardDescription>
                {filteredFiles.length} arquivo(s) encontrado(s)
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Novo Upload
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Formulário de Upload */}
      {showUploadForm && (
        <Card className="border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload de Arquivos</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUploadForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente *</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria *</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Arquivos *</label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelection}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-400">
                Formatos aceitos: JPEG, PNG, GIF, WEBP (máx 10MB por arquivo)
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-400 font-medium">
                    ✓ {selectedFiles.length} arquivo(s) selecionado(s)
                  </p>
                  <div className="mt-1 text-xs text-gray-400 space-y-0.5">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index}>• {file.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-purple-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando arquivos...</span>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={confirmUpload}
                disabled={uploading || selectedFiles.length === 0 || !selectedClient || !selectedCategory}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Confirmar Upload
              </Button>
              <Button
                onClick={cancelUpload}
                disabled={uploading}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="border-purple-500/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </label>
              <Input
                placeholder="Nome do arquivo ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-gallery"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Cliente
              </label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger data-testid="select-filter-client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categoria
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Fonte
              </label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger data-testid="select-filter-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galeria */}
      {filteredFiles.length === 0 ? (
        <Card className="border-purple-500/20">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                <ImageIcon className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Nenhum arquivo encontrado</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {files.length === 0 
                  ? 'Faça upload de imagens de referências, desenhos aprovados ou fotos finais para começar sua galeria'
                  : 'Nenhum arquivo corresponde aos filtros selecionados. Tente ajustar os filtros acima.'}
              </p>
              {files.length === 0 && (
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Primeiro Upload
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <Card key={file.id} className="border-purple-500/20 overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="relative aspect-square">
                <img
                  src={file.file_url}
                  alt={file.original_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setFileToDelete(file)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <p className="text-sm font-medium truncate" title={file.original_name}>
                  {file.original_name}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{file.client_name}</span>
                  <Badge className={`bg-${getCategoryColor(file.category)}-500/20 text-${getCategoryColor(file.category)}-400`}>
                    {getCategoryLabel(file.category)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(file.upload_date).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo "{fileToDelete?.original_name}" será deletado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(fileToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Sim, deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GaleriaCorrigida;

