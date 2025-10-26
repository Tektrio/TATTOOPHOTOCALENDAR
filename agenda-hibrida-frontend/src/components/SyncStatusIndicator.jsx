import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * 🔄 SYNC STATUS INDICATOR - Indicador de Status de Sincronização
 * 
 * Mostra status em tempo real da sincronização via WebSocket
 */
export default function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const [lastSync, setLastSync] = useState(null);
  const [recentActivity, setRecentActivity] = useState('');

  useEffect(() => {
    // Conectar ao WebSocket
    const socket = io(API_URL);

    socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setSyncStatus('synced');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      setSyncStatus('error');
    });

    // Eventos de sincronização
    socket.on('file_synced', (data) => {
      console.log('📁 Arquivo sincronizado:', data);
      setSyncStatus('syncing');
      setLastSync(new Date());
      
      const action = data.action === 'added' ? 'adicionado' : 
                     data.action === 'updated' ? 'atualizado' : 'removido';
      setRecentActivity(`${data.file?.name || data.fileName} ${action}`);

      // Voltar para "synced" após 2 segundos
      setTimeout(() => {
        setSyncStatus('synced');
      }, 2000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Renderizar ícone baseado no status
   */
  const renderIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'synced':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  /**
   * Cor baseada no status
   */
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'synced':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  /**
   * Mensagem baseada no status
   */
  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'synced':
        return lastSync 
          ? `Sincronizado ${formatTimeAgo(lastSync)}`
          : 'Sincronizado';
      case 'error':
        return 'Erro na sincronização';
      default:
        return 'Aguardando sincronização';
    }
  };

  /**
   * Formatar tempo relativo
   */
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
    return `há ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${getStatusColor()} backdrop-blur-md transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              {renderIcon()}
              <span className="text-xs font-medium hidden md:inline">
                {getStatusMessage()}
              </span>
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white border-gray-700">
          <div className="space-y-1">
            <p className="font-semibold">{getStatusMessage()}</p>
            {recentActivity && (
              <p className="text-xs text-gray-400">
                Última atividade: {recentActivity}
              </p>
            )}
            {lastSync && (
              <p className="text-xs text-gray-400">
                {lastSync.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

