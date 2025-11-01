'use client';

import { useEffect, useState } from 'react';
import { prismaLocal } from '@/lib/db-local';

type SyncStatus = 'synced' | 'pending' | 'offline';

export function SyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    checkSyncStatus();
    
    // Atualizar a cada minuto
    const interval = setInterval(checkSyncStatus, 60000);
    
    // Monitorar status online/offline
    const handleOnline = () => {
      setIsOnline(true);
      checkSyncStatus();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const checkSyncStatus = async () => {
    if (!navigator.onLine) {
      setStatus('offline');
      setIsOnline(false);
      return;
    }
    
    setIsOnline(true);
    
    try {
      // Contar registros não sincronizados
      const [unsyncedClients, unsyncedAppointments, unsyncedFiles] = await Promise.all([
        prismaLocal.client.count({ where: { syncedAt: null } }),
        prismaLocal.appointment.count({ where: { syncedAt: null } }),
        prismaLocal.file.count({ where: { syncedAt: null } })
      ]);
      
      const total = unsyncedClients + unsyncedAppointments + unsyncedFiles;
      setPendingCount(total);
      setStatus(total > 0 ? 'pending' : 'synced');
    } catch (error) {
      console.error('Erro ao verificar status de sincronização:', error);
    }
  };
  
  const statusConfig = {
    synced: {
      icon: '✅',
      text: 'Sincronizado',
      color: 'text-green-700 bg-green-100 border-green-300'
    },
    pending: {
      icon: '⚠️',
      text: `${pendingCount} não sincronizado${pendingCount !== 1 ? 's' : ''}`,
      color: 'text-yellow-700 bg-yellow-100 border-yellow-300'
    },
    offline: {
      icon: '📴',
      text: 'Offline',
      color: 'text-gray-700 bg-gray-100 border-gray-300'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`
      px-4 py-2 rounded-lg text-sm font-medium border
      ${config.color}
    `}>
      <span>{config.icon}</span> {config.text}
    </div>
  );
}

