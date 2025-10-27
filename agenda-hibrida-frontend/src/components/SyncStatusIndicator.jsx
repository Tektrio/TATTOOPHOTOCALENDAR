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
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error, reconnecting
  const [lastSync, setLastSync] = useState(null);
  const [recentActivity, setRecentActivity] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let socket = null;
    let reconnectTimeout = null;
    let heartbeatInterval = null;
    let eventBuffer = [];

    // Configurar socket com reconexão automática e backoff exponencial
    const connectSocket = () => {
      // Evitar reconexão se offline
      if (!navigator.onLine) {
        console.log('🔌 Sistema offline, aguardando conexão...');
        setSyncStatus('error');
        return;
      }

      socket = io(API_URL, {
        reconnection: true,
        reconnectionDelay: Math.min(1000 * Math.pow(2, retryCount), 30000), // Backoff: 1s, 2s, 4s... max 30s
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket', 'polling'] // Fallback para polling se WS falhar
      });

      // ✅ Conectado com sucesso
      socket.on('connect', () => {
        console.log('🔌 WebSocket conectado:', socket.id);
        setSyncStatus('synced');
        setRetryCount(0); // Reset backoff

        // Processar buffer de eventos pendentes
        if (eventBuffer.length > 0) {
          console.log(`📦 Processando ${eventBuffer.length} eventos pendentes...`);
          eventBuffer.forEach(event => socket.emit(event.name, event.data));
          eventBuffer = [];
        }

        // Heartbeat: ping a cada 30s
        heartbeatInterval = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping');
          }
        }, 30000);
      });

      // 🔌 Desconectado
      socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket desconectado:', reason);
        setSyncStatus('error');
        clearInterval(heartbeatInterval);

        // Se foi desconexão manual pelo servidor, não reconectar
        if (reason === 'io server disconnect') {
          socket.connect(); // Reconectar manualmente
        }
      });

      // 🔄 Tentando reconectar
      socket.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 Tentativa de reconexão #${attempt}...`);
        setSyncStatus('reconnecting');
        setRetryCount(attempt);
      });

      // ✅ Reconectado com sucesso
      socket.on('reconnect', (attempt) => {
        console.log(`✅ Reconectado após ${attempt} tentativas`);
        setSyncStatus('synced');
        setRetryCount(0);
      });

      // ❌ Erro de reconexão
      socket.on('reconnect_error', (error) => {
        console.error('❌ Erro ao reconectar:', error.message);
      });

      // ❌ Falha ao reconectar
      socket.on('reconnect_failed', () => {
        console.error('❌ Falha total ao reconectar. Tentando novamente em 30s...');
        setSyncStatus('error');
        
        // Retry manual após 30s
        reconnectTimeout = setTimeout(() => {
          connectSocket();
        }, 30000);
      });

      // 🏓 Pong (resposta do servidor ao ping)
      socket.on('pong', () => {
        // Conexão está viva
      });

      // 📁 Eventos de sincronização
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

      return socket;
    };

    // Detectar quando ficar online/offline
    const handleOnline = () => {
      console.log('🌐 Sistema online');
      setIsOnline(true);
      setSyncStatus('reconnecting');
      
      // Reconectar automaticamente
      if (!socket || !socket.connected) {
        connectSocket();
      }
    };

    const handleOffline = () => {
      console.log('🌐 Sistema offline');
      setIsOnline(false);
      setSyncStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Iniciar conexão
    socket = connectSocket();

    return () => {
      clearInterval(heartbeatInterval);
      clearTimeout(reconnectTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (socket) {
        socket.disconnect();
      }
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
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return isOnline ? <AlertCircle className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />;
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
      case 'reconnecting':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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
          : 'Conectado';
      case 'reconnecting':
        return retryCount > 0 
          ? `Reconectando... (tentativa ${retryCount})`
          : 'Reconectando...';
      case 'error':
        return isOnline ? 'Desconectado' : 'Sem internet';
      default:
        return 'Aguardando conexão';
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

