'use client';

import { useState, useEffect } from 'react';
import { Cloud, RefreshCw } from 'lucide-react';
import { syncService, type Conflict } from '@/lib/sync-service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncButtonProps {
  onConflicts?: (conflicts: Conflict[]) => void;
}

export function SyncButton({ onConflicts }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Carregar última sync do localStorage
    const lastSyncStr = localStorage.getItem('lastSyncTime');
    if (lastSyncStr) {
      setLastSync(new Date(lastSyncStr));
    }
    
    // Monitorar status online/offline
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleSync = async () => {
    if (!isOnline) {
      alert('⚠️ Você está offline. Conecte-se à internet para sincronizar.');
      return;
    }
    
    setSyncing(true);
    
    try {
      const conflicts = await syncService.syncAll();
      
      if (conflicts.length > 0) {
        // Mostrar modal de conflitos
        if (onConflicts) {
          onConflicts(conflicts);
        } else {
          alert(`⚠️ ${conflicts.length} conflito(s) encontrado(s). Por favor, resolva os conflitos.`);
        }
      } else {
        // Sucesso
        const now = new Date();
        setLastSync(now);
        localStorage.setItem('lastSyncTime', now.toISOString());
        alert('✅ Sincronização concluída com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('❌ Erro ao sincronizar. Verifique o console para mais detalhes.');
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={syncing || !isOnline}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${syncing || !isOnline
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }
        `}
      >
        {syncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4" />
            Sincronizar
          </>
        )}
      </button>
      
      {lastSync && (
        <span className="text-sm text-gray-600">
          Última sync: {formatDistanceToNow(lastSync, { locale: ptBR, addSuffix: true })}
        </span>
      )}
      
      {!isOnline && (
        <span className="text-sm text-red-600 font-medium">
          📴 Offline
        </span>
      )}
    </div>
  );
}

