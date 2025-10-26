import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, HardDrive, Cloud, Files } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 🔧 CONFLICT RESOLVER - Modal para Resolver Conflitos de Sincronização
 * 
 * Exibido quando o mesmo arquivo existe localmente e no Drive com diferenças
 */
export default function ConflictResolver({ conflicts, isOpen, onClose, onResolved }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolving, setResolving] = useState(false);

  const currentConflict = conflicts && conflicts.length > 0 ? conflicts[currentIndex] : null;

  /**
   * Resolver conflito
   */
  const handleResolve = async (resolution) => {
    if (!currentConflict) return;

    setResolving(true);

    try {
      const response = await fetch(`${API_URL}/api/sync/resolve-conflict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conflict: currentConflict,
          resolution: resolution
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`✅ Conflito resolvido: ${getResolutionMessage(resolution)}`);

        // Avançar para próximo conflito ou fechar
        if (currentIndex < conflicts.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Todos os conflitos foram resolvidos
          toast.success('🎉 Todos os conflitos foram resolvidos!');
          if (onResolved) {
            onResolved();
          }
          onClose();
        }
      } else {
        toast.error(data.error || 'Erro ao resolver conflito');
      }
    } catch (error) {
      console.error('Erro ao resolver conflito:', error);
      toast.error('Erro ao resolver conflito');
    } finally {
      setResolving(false);
    }
  };

  /**
   * Mensagem descritiva da resolução
   */
  const getResolutionMessage = (resolution) => {
    switch (resolution) {
      case 'keep_local':
        return 'Versão local mantida';
      case 'keep_drive':
        return 'Versão do Drive mantida';
      case 'keep_both':
        return 'Ambas as versões mantidas';
      default:
        return 'Conflito resolvido';
    }
  };

  /**
   * Formatar tamanho de arquivo
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /**
   * Formatar data
   */
  const formatDate = (date) => {
    if (!date) return 'Data desconhecida';
    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentConflict) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-purple-900 to-blue-900 text-white border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <DialogTitle className="text-2xl">Conflito de Sincronização</DialogTitle>
          </div>
          <DialogDescription className="text-purple-200">
            O arquivo <span className="font-semibold text-white">"{currentConflict.name}"</span> foi modificado 
            tanto localmente quanto no Google Drive. Escolha qual versão deseja manter.
          </DialogDescription>
        </DialogHeader>

        {/* Progresso */}
        {conflicts.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
              <span>Conflito {currentIndex + 1} de {conflicts.length}</span>
              <Badge variant="outline" className="border-purple-400 text-purple-200">
                {conflicts.length - currentIndex - 1} restantes
              </Badge>
            </div>
            <div className="w-full bg-purple-800/30 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / conflicts.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Comparação das versões */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* Versão Local */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-lg">Versão Local</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-purple-200">Tamanho:</span>
                <span className="ml-2 text-white font-medium">
                  {formatFileSize(currentConflict.local.size)}
                </span>
              </div>
              <div>
                <span className="text-purple-200">Modificado:</span>
                <span className="ml-2 text-white font-medium">
                  {formatDate(currentConflict.local.mtime)}
                </span>
              </div>
              {currentConflict.local.hash && (
                <div>
                  <span className="text-purple-200">Hash:</span>
                  <span className="ml-2 text-white font-mono text-xs">
                    {currentConflict.local.hash.substring(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Versão Drive */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Cloud className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-lg">Versão Drive</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-purple-200">Tamanho:</span>
                <span className="ml-2 text-white font-medium">
                  {formatFileSize(currentConflict.drive.size)}
                </span>
              </div>
              <div>
                <span className="text-purple-200">Modificado:</span>
                <span className="ml-2 text-white font-medium">
                  {formatDate(currentConflict.drive.mtime)}
                </span>
              </div>
              {currentConflict.drive.hash && (
                <div>
                  <span className="text-purple-200">Hash:</span>
                  <span className="ml-2 text-white font-mono text-xs">
                    {currentConflict.drive.hash.substring(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diferenças */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-300 mb-1">Diferenças detectadas:</p>
              <ul className="text-yellow-200 space-y-1">
                {Math.abs(currentConflict.sizeDiff) > 0 && (
                  <li>• Tamanho diferente: {formatFileSize(Math.abs(currentConflict.sizeDiff))}</li>
                )}
                {currentConflict.timeDiff > 60000 && (
                  <li>• Modificado com {Math.round(currentConflict.timeDiff / 60000)} minutos de diferença</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de resolução */}
        <div className="space-y-3">
          <Button
            onClick={() => handleResolve('keep_local')}
            disabled={resolving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
          >
            <HardDrive className="w-5 h-5 mr-2" />
            Manter Versão Local
          </Button>

          <Button
            onClick={() => handleResolve('keep_drive')}
            disabled={resolving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
          >
            <Cloud className="w-5 h-5 mr-2" />
            Manter Versão do Drive
          </Button>

          <Button
            onClick={() => handleResolve('keep_both')}
            disabled={resolving}
            variant="outline"
            className="w-full border-purple-400 text-white hover:bg-purple-700/30 py-6 text-lg"
          >
            <Files className="w-5 h-5 mr-2" />
            Manter Ambas as Versões
          </Button>
        </div>

        {/* Cancelar */}
        <Button
          onClick={onClose}
          disabled={resolving}
          variant="ghost"
          className="w-full mt-2 text-purple-200 hover:bg-white/10"
        >
          Cancelar (decidir depois)
        </Button>
      </DialogContent>
    </Dialog>
  );
}

