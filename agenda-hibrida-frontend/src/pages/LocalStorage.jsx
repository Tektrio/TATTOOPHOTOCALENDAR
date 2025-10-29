import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HardDrive, FolderOpen, RefreshCw, Plus, Cloud, Server, CheckCircle, AlertCircle } from 'lucide-react';
import DestinationManager from '../components/DestinationManager';
import LocalFileTable from '../components/LocalFileTable';
import AddGoogleAccountModal from '../components/AddGoogleAccountModal';
import SyncSelectionModal from '../components/SyncSelectionModal';
import QnapConfigModal from '../components/QnapConfigModal';
import { toast } from 'sonner';

/**
 * Página principal de sincronização multi-destino
 * 3 seções: Configuração Local | Gerenciamento de Destinos | Lista de Arquivos
 */
export default function LocalStorage() {
  const [config, setConfig] = useState(null);
  const [basePath, setBasePath] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [files, setFiles] = useState([]);
  
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showAddGoogle, setShowAddGoogle] = useState(false);
  const [showQnapConfig, setShowQnapConfig] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [qnapToEdit, setQnapToEdit] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // ============================================
  // CARREGAMENTO INICIAL
  // ============================================

  useEffect(() => {
    loadConfig();
    loadDestinations();
    loadFiles();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/local-storage/config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setBasePath(data.base_path);
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sync-destinations`);
      if (response.ok) {
        const data = await response.json();
        setDestinations(data.destinations || []);
      }
    } catch (error) {
      console.error('Erro ao carregar destinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/local-storage/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    }
  };

  // ============================================
  // SEÇÃO 1: CONFIGURAÇÃO LOCAL
  // ============================================

  /**
   * Seleciona pasta usando File System Access API (navegadores modernos)
   * Abre diálogo nativo do sistema para navegação visual
   */
  const handleSelectFolder = async () => {
    try {
      console.log('🔍 Tentando abrir seletor de pasta...');
      
      // Verifica suporte à API
      if (!('showDirectoryPicker' in window)) {
        toast.error('❌ Seu navegador não suporta seleção visual de pasta. Use Chrome, Edge ou Opera mais recentes.');
        toast.info('💡 Digite o caminho manualmente no campo acima');
        return;
      }

      console.log('✅ API showDirectoryPicker disponível, abrindo diálogo...');
      
      // Abre o diálogo de seleção de pasta
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read', // Apenas leitura
        startIn: 'desktop' // Inicia no Desktop se possível
      });
      
      console.log('📁 Pasta selecionada:', dirHandle.name);
      
      // Lê alguns arquivos para mostrar ao usuário
      let fileCount = 0;
      const files = [];
      
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          fileCount++;
          if (files.length < 5) { // Mostra apenas os 5 primeiros
            files.push(entry.name);
          }
        }
      }
      
      console.log(`📊 Encontrados ${fileCount} arquivos na pasta`);
      
      // Monta mensagem com informações
      const filesList = files.length > 0 ? `\n\nPrimeiros arquivos: ${files.join(', ')}` : '';
      
      toast.success(`✅ Pasta selecionada: "${dirHandle.name}"\n${fileCount} arquivo(s) encontrado(s)${filesList}`, {
        duration: 5000
      });
      
      // Tenta construir um caminho útil
      // IMPORTANTE: Navegadores não fornecem o caminho completo por segurança
      // Vamos sugerir um caminho baseado em padrões comuns
      let suggestedPath;
      
      if (dirHandle.name.startsWith('@')) {
        // Pasta com @ provavelmente está no Desktop
        suggestedPath = `/Users/${process.env.USER || 'seu_usuario'}/Desktop/${dirHandle.name}`;
      } else {
        suggestedPath = `/caminho/para/${dirHandle.name}`;
      }
      
      setBasePath(suggestedPath);
      
      toast.warning('⚠️ Ajuste o caminho no campo acima se necessário.\n\nPor segurança, navegadores não revelam o caminho completo da pasta.', {
        duration: 6000
      });
      
      console.log('💾 Caminho sugerido:', suggestedPath);
      
    } catch (error) {
      // Usuário cancelou a seleção
      if (error.name === 'AbortError') {
        console.log('❌ Seleção cancelada pelo usuário');
        return;
      }
      
      // Erro de permissão
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Permissão negada. Conceda permissão para acessar a pasta.');
        console.error('Permissão negada:', error);
        return;
      }
      
      // Outros erros
      console.error('❌ Erro ao selecionar pasta:', error);
      toast.error(`Erro: ${error.message}\n\nTente digitar o caminho manualmente.`);
    }
  };

  const handleConfigure = async () => {
    if (!basePath.trim()) {
      toast.error('Digite um caminho válido');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/local-storage/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePath: basePath.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        toast.success('Pasta local configurada com sucesso!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao configurar');
      }
    } catch (error) {
      toast.error('Erro ao configurar: ' + error.message);
    }
  };

  const handleScan = async () => {
    if (!config) {
      toast.error('Configure a pasta local primeiro');
      return;
    }

    setScanning(true);

    try {
      const response = await fetch(`${API_URL}/api/local-storage/scan`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.indexed} arquivos indexados com sucesso!`);
        loadFiles();
      } else {
        toast.error('Erro ao escanear pasta');
      }
    } catch (error) {
      toast.error('Erro ao escanear: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  // ============================================
  // SEÇÃO 2: GERENCIAMENTO DE DESTINOS
  // ============================================

  const handleTestDestination = async (destId) => {
    try {
      const response = await fetch(`${API_URL}/api/sync-destinations/${destId}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.testResult?.valid) {
        toast.success(`Conexão OK: ${data.destinationName}`);
      } else {
        toast.error(`Falha: ${data.testResult?.errors?.join(', ')}`);
      }
    } catch (error) {
      toast.error('Erro ao testar: ' + error.message);
    }
  };

  const handleRemoveDestination = async (destId) => {
    if (!confirm('Tem certeza que deseja remover este destino?')) return;

    try {
      const response = await fetch(`${API_URL}/api/sync-destinations/${destId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Destino removido');
        loadDestinations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover');
      }
    } catch (error) {
      toast.error('Erro ao remover: ' + error.message);
    }
  };

  const handleToggleDestination = async (destId, enabled) => {
    try {
      const endpoint = enabled 
        ? `${API_URL}/api/sync-destinations/${destId}/enable`
        : `${API_URL}/api/sync-destinations/${destId}/disable`;

      const response = await fetch(endpoint, { method: 'POST' });

      if (response.ok) {
        toast.success(enabled ? 'Destino habilitado' : 'Destino desabilitado');
        loadDestinations();
      }
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleConfigureQnap = (destination) => {
    setQnapToEdit(destination);
    setShowQnapConfig(true);
  };

  // ============================================
  // SEÇÃO 3: SINCRONIZAÇÃO DE ARQUIVOS
  // ============================================

  const handleSyncFiles = (fileIds) => {
    setSelectedFiles(fileIds);
    setShowSyncModal(true);
  };

  const handleSyncComplete = () => {
    toast.success('Sincronização iniciada!');
    loadFiles();
  };

  // ============================================
  // RENDER
  // ============================================

  const googleAccounts = destinations.filter(d => d.type === 'gdrive');
  const qnapDestinations = destinations.filter(d => d.type === 'qnap');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ============================================ */}
      {/* SEÇÃO 1: CONFIGURAÇÃO DE PASTA LOCAL */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Configurar Pasta Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="/caminho/para/pasta/arquivos"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSelectFolder}
              variant="outline"
              title="Selecionar pasta"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Selecionar
            </Button>
            <Button onClick={handleConfigure}>
              <HardDrive className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            💡 Dica: Digite o caminho completo da pasta no servidor onde os arquivos estão armazenados
          </p>

          {config && (
            <Alert className="bg-green-950 border-green-800">
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-green-200 font-semibold">Pasta configurada</p>
                    <p className="text-green-300 text-sm mt-1">{config.base_path}</p>
                    {config.last_scan && (
                      <p className="text-green-400 text-xs mt-1">
                        Último scan: {new Date(config.last_scan).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={handleScan} disabled={scanning} size="sm">
                  {scanning ? (
                    <>🔄 Escaneando...</>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Escanear Arquivos
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SEÇÃO 2: GERENCIAMENTO DE DESTINOS */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Destinos de Sincronização
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddGoogle(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Google Drive
              </Button>
              <Button onClick={() => { setQnapToEdit(null); setShowQnapConfig(true); }} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar QNAP
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {destinations.length === 0 ? (
            <Alert>
              <AlertDescription className="text-center py-8">
                <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Nenhum destino configurado</p>
                <p className="text-sm text-gray-500 mt-2">
                  Adicione uma conta Google Drive ou QNAP NAS para começar
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((dest) => (
                <DestinationManager
                  key={dest.id}
                  destination={dest}
                  onTest={handleTestDestination}
                  onRemove={handleRemoveDestination}
                  onConfigure={dest.type === 'qnap' ? handleConfigureQnap : null}
                  onToggleEnabled={handleToggleDestination}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* SEÇÃO 3: LISTA DE ARQUIVOS */}
      {/* ============================================ */}
      <LocalFileTable
        files={files}
        destinations={destinations}
        onSync={handleSyncFiles}
        onRefresh={loadFiles}
      />

      {/* ============================================ */}
      {/* MODAIS */}
      {/* ============================================ */}
      <AddGoogleAccountModal
        open={showAddGoogle}
        onOpenChange={setShowAddGoogle}
        existingAccountsCount={googleAccounts.length}
        onAdd={() => loadDestinations()}
      />

      <QnapConfigModal
        open={showQnapConfig}
        onOpenChange={setShowQnapConfig}
        initialConfig={qnapToEdit}
        onSave={() => {
          loadDestinations();
          setQnapToEdit(null);
        }}
      />

      <SyncSelectionModal
        open={showSyncModal}
        onOpenChange={setShowSyncModal}
        files={selectedFiles}
        destinations={destinations}
        onSync={handleSyncComplete}
      />
    </div>
  );
}

