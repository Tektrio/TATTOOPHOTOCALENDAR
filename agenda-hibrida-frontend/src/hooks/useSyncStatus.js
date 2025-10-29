import { useState, useEffect, useCallback } from 'react';
import syncWebSocket from '../services/syncWebSocket';

/**
 * Hook customizado para gerenciar status de sincronização
 * Monitora status de arquivo com polling e WebSocket
 */
export function useSyncStatus(fileId) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Busca status do servidor
   */
  const fetchStatus = useCallback(async () => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/sync-multi/status/${fileId}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar status: ${response.statusText}`);
      }

      const data = await response.json();
      setStatuses(data.statuses || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao buscar status de sincronização:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fileId, API_URL]);

  /**
   * Handler para eventos WebSocket
   */
  const handleSyncUpdate = useCallback((data) => {
    if (data.fileId === fileId) {
      console.log('🔄 Update de sincronização recebido via WebSocket');
      fetchStatus();
    }
  }, [fileId, fetchStatus]);

  /**
   * Efeito para setup inicial e WebSocket
   */
  useEffect(() => {
    if (!fileId) return;

    // Busca inicial
    fetchStatus();

    // Conecta WebSocket se ainda não estiver conectado
    if (!syncWebSocket.isConnected()) {
      syncWebSocket.connect();
    }

    // Inscreve-se para updates deste arquivo
    syncWebSocket.subscribeToFile(fileId);

    // Registra listeners de eventos
    syncWebSocket.on('sync:complete', handleSyncUpdate);
    syncWebSocket.on('sync:partial', handleSyncUpdate);
    syncWebSocket.on('sync:error', handleSyncUpdate);
    syncWebSocket.on('sync:progress', handleSyncUpdate);

    // Cleanup
    return () => {
      syncWebSocket.unsubscribeFromFile(fileId);
      syncWebSocket.off('sync:complete', handleSyncUpdate);
      syncWebSocket.off('sync:partial', handleSyncUpdate);
      syncWebSocket.off('sync:error', handleSyncUpdate);
      syncWebSocket.off('sync:progress', handleSyncUpdate);
    };
  }, [fileId, fetchStatus, handleSyncUpdate]);

  /**
   * Polling opcional a cada 30 segundos
   */
  useEffect(() => {
    if (!fileId) return;

    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fileId, fetchStatus]);

  return {
    statuses,
    loading,
    error,
    lastUpdate,
    refresh: fetchStatus
  };
}

/**
 * Hook para monitorar fila de sincronização
 */
export function useSyncQueue(status = null) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchQueue = useCallback(async () => {
    try {
      setError(null);
      
      const url = status 
        ? `${API_URL}/api/sync-multi/queue?status=${status}`
        : `${API_URL}/api/sync-multi/queue`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar fila: ${response.statusText}`);
      }

      const data = await response.json();
      setQueue(data.items || []);
    } catch (err) {
      console.error('Erro ao buscar fila:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, API_URL]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/sync-multi/queue/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, [API_URL]);

  const handleQueueUpdate = useCallback(() => {
    fetchQueue();
    fetchStats();
  }, [fetchQueue, fetchStats]);

  useEffect(() => {
    fetchQueue();
    fetchStats();

    // Conecta WebSocket
    if (!syncWebSocket.isConnected()) {
      syncWebSocket.connect();
    }

    // Inscreve-se na fila
    syncWebSocket.subscribeToQueue();

    // Listeners
    syncWebSocket.on('sync:progress', handleQueueUpdate);
    syncWebSocket.on('sync:complete', handleQueueUpdate);
    syncWebSocket.on('sync:error', handleQueueUpdate);

    return () => {
      syncWebSocket.unsubscribeFromQueue();
      syncWebSocket.off('sync:progress', handleQueueUpdate);
      syncWebSocket.off('sync:complete', handleQueueUpdate);
      syncWebSocket.off('sync:error', handleQueueUpdate);
    };
  }, [fetchQueue, fetchStats, handleQueueUpdate]);

  return {
    queue,
    stats,
    loading,
    error,
    refresh: fetchQueue
  };
}

export default useSyncStatus;

