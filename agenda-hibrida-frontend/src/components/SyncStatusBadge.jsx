/**
 * Badge de Status de Sincronização com Google Calendar
 * Exibe timestamp da última sincronização e status em tempo real
 */

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SyncStatusBadge({ googleStatus }) {
  const [lastSync, setLastSync] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
  const [syncStats, setSyncStats] = useState(null);
  const [socket, setSocket] = useState(null);

  // Conectar ao WebSocket para updates em tempo real
  useEffect(() => {
    if (!googleStatus?.authenticated) return;

    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado para sync status');
    });

    newSocket.on('calendar_sync_started', (data) => {
      console.log('🔄 Sincronização iniciada:', data);
      setSyncStatus('syncing');
    });

    newSocket.on('calendar_synced', (data) => {
      console.log('📅 Sincronização recebida:', data);
      setLastSync(new Date(data.timestamp));
      setSyncStats(data.report);
      setSyncStatus('success');
      
      // Voltar para idle após 3 segundos
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [googleStatus?.authenticated]);

  // Buscar última sincronização ao montar
  useEffect(() => {
    if (!googleStatus?.authenticated) return;

    fetch(`${API_URL}/api/sync/google-calendar/last-sync`)
      .then(res => res.json())
      .then(data => {
        if (data.lastSync) {
          setLastSync(new Date(data.lastSync));
        }
      })
      .catch(err => console.error('Erro ao buscar última sync:', err));
  }, [googleStatus?.authenticated]);

  // Trigger manual de sincronização
  const handleManualSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const response = await fetch(`${API_URL}/api/sync/google-calendar/now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          calendarId: 'primary',
          daysBack: 7,
          daysForward: 30
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        setSyncStats(data.report);
        setSyncStatus('success');
        
        setTimeout(() => {
          setSyncStatus('idle');
        }, 3000);
      } else {
        setSyncStatus('error');
        setTimeout(() => {
          setSyncStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  // Se Google não está autenticado, não mostrar badge
  if (!googleStatus?.authenticated) {
    return (
      <Badge variant="outline" className="text-gray-400 bg-gray-800/50 border-gray-600">
        <CloudOff className="w-3 h-3 mr-1" />
        Google desconectado
      </Badge>
    );
  }

  // Renderizar badge baseado no status
  const renderBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Sincronizando...
          </Badge>
        );

      case 'success':
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sincronizado
            {syncStats && (
              <span className="ml-1 text-xs">
                ({syncStats.created + syncStats.updated} eventos)
              </span>
            )}
          </Badge>
        );

      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro na sincronização
          </Badge>
        );

      default:
        return (
          <button
            onClick={handleManualSync}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                       bg-purple-500/20 text-purple-200 border border-purple-400/50
                       hover:bg-purple-500/30 hover:border-purple-300 
                       transition-all cursor-pointer"
            title="Clique para sincronizar manualmente"
          >
            <Cloud className="w-3 h-3 mr-1.5" />
            <span className="font-semibold">Google Calendar</span>
            {lastSync && (
              <>
                <span className="mx-1.5 text-purple-300">•</span>
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-purple-300">
                  {formatDistanceToNow(lastSync, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </>
            )}
            {!lastSync && (
              <>
                <span className="mx-1.5 text-purple-300">•</span>
                <span className="text-purple-300 italic">Nunca sincronizado</span>
              </>
            )}
          </button>
        );
    }
  };

  return renderBadge();
}

