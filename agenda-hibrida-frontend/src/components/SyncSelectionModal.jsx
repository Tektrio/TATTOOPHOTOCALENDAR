import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { getColorConfig } from '../utils/storageConfig';

/**
 * Modal para selecionar destinos para sincronização
 * Permite escolher quais destinos receberão o(s) arquivo(s)
 */
export default function SyncSelectionModal({ 
  open, 
  onOpenChange,
  files = [], // Array de objetos de arquivo ou IDs
  destinations = [],
  onSync
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [priority, setPriority] = useState(5);
  const [syncing, setSyncing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Auto-seleciona destinos habilitados ao abrir
  useEffect(() => {
    if (open) {
      const enabledIds = destinations.filter(d => d.enabled).map(d => d.id);
      setSelectedDestinations(enabledIds);
    }
  }, [open, destinations]);

  const handleToggleDestination = (destId, checked) => {
    if (checked) {
      setSelectedDestinations([...selectedDestinations, destId]);
    } else {
      setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedDestinations(destinations.filter(d => d.enabled).map(d => d.id));
    } else {
      setSelectedDestinations([]);
    }
  };

  const handleSync = async () => {
    if (selectedDestinations.length === 0) {
      alert('Selecione pelo menos um destino');
      return;
    }

    if (files.length === 0) {
      alert('Nenhum arquivo selecionado');
      return;
    }

    setSyncing(true);

    try {
      const fileIds = files.map(f => typeof f === 'number' ? f : f.id);

      const endpoint = fileIds.length === 1 
        ? `${API_URL}/api/sync-multi/${fileIds[0]}`
        : `${API_URL}/api/sync-multi/bulk`;

      const body = fileIds.length === 1
        ? { destinationIds: selectedDestinations, priority }
        : { fileIds, destinationIds: selectedDestinations, priority };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Erro ao sincronizar');
      }

      const data = await response.json();

      if (onSync) onSync(data);
      
      onOpenChange(false);
      
      alert(`${fileIds.length} arquivo(s) adicionado(s) à fila de sincronização!`);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const fileName = files.length === 1 
    ? (typeof files[0] === 'object' ? files[0].file_name : 'arquivo')
    : `${files.length} arquivos`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sincronizar: {fileName}
          </DialogTitle>
          <DialogDescription>
            Selecione os destinos para onde sincronizar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selecionar Todos */}
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-700">
            <Checkbox
              id="select-all"
              checked={selectedDestinations.length === destinations.filter(d => d.enabled).length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Selecionar todos habilitados
            </label>
          </div>

          {/* Lista de Destinos */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {destinations.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                Nenhum destino configurado
              </p>
            ) : (
              destinations.map((dest) => {
                const colorConfig = getColorConfig(dest.color, dest.type);
                const isDisabled = !dest.enabled;

                return (
                  <div
                    key={dest.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isDisabled 
                        ? 'border-gray-700 bg-gray-900 opacity-50' 
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                    }`}
                  >
                    <Checkbox
                      id={`dest-${dest.id}`}
                      checked={selectedDestinations.includes(dest.id)}
                      onCheckedChange={(checked) => handleToggleDestination(dest.id, checked)}
                      disabled={isDisabled}
                    />
                    <label
                      htmlFor={`dest-${dest.id}`}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-xl">{colorConfig.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium">{dest.name}</p>
                        <p className="text-xs text-gray-400">
                          {dest.type === 'gdrive' ? 'Google Drive' : 'QNAP NAS'}
                        </p>
                      </div>
                      {!dest.enabled && (
                        <Badge variant="outline" className="text-gray-500">
                          Desabilitado
                        </Badge>
                      )}
                    </label>
                  </div>
                );
              })
            )}
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-400 text-center">
              Prioridade: {priority} {priority >= 8 ? '(Alta)' : priority >= 5 ? '(Normal)' : '(Baixa)'}
            </p>
          </div>

          {/* Info */}
          {selectedDestinations.length > 0 && (
            <div className="p-3 bg-green-950 border border-green-800 rounded-lg">
              <p className="text-sm text-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {selectedDestinations.length} destino(s) selecionado(s)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={syncing}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={syncing || selectedDestinations.length === 0}
          >
            {syncing ? (
              <>🔄 Sincronizando...</>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar {selectedDestinations.length > 0 && `(${selectedDestinations.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

