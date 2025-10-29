import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getColorConfig, getStatusConfig } from '../utils/storageConfig';
import { formatTimestamp } from '../utils/syncHelpers';
import { useSyncStatus } from '../hooks/useSyncStatus';

/**
 * Indicador visual de status multi-destino
 * Mostra emojis coloridos por destino com tooltips detalhados
 */
export default function SyncStatusIndicator({ fileId, compact = false }) {
  const { statuses, loading } = useSyncStatus(fileId);

  if (loading) {
    return (
      <div className="flex gap-1">
        <span className="animate-pulse">⏳</span>
      </div>
    );
  }

  if (!statuses || statuses.length === 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-lg">📁</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Apenas local - não sincronizado</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {statuses.map((status, index) => (
        <SyncStatusBadge key={index} status={status} compact={compact} />
      ))}
    </div>
  );
}

/**
 * Badge individual de status de sincronização
 */
function SyncStatusBadge({ status, compact }) {
  const colorConfig = getColorConfig(status.color, status.type);
  const statusConfig = getStatusConfig(status.status);

  const getStatusIcon = () => {
    switch (status.status) {
      case 'synced':
        return '✓';
      case 'syncing':
        return '⏳';
      case 'failed':
        return '❌';
      case 'conflict':
        return '⚠️';
      case 'pending':
        return '⏸️';
      default:
        return '○';
    }
  };

  const content = (
    <span className={`inline-flex items-center gap-0.5 ${compact ? 'text-base' : 'text-lg'}`}>
      <span>{colorConfig.emoji}</span>
      <span className="text-xs">{getStatusIcon()}</span>
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={compact ? '' : 'cursor-pointer'}>
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-2">
              <span>{colorConfig.emoji}</span>
              {status.destination_name}
            </p>
            <p className="text-xs text-gray-400">
              Tipo: {status.type === 'gdrive' ? 'Google Drive' : 'QNAP NAS'}
            </p>
            <div className="pt-2 border-t border-gray-600">
              <p className="text-sm">
                Status: <span className={statusConfig.textClass}>{statusConfig.label}</span>
              </p>
              {status.last_sync && (
                <p className="text-xs text-gray-400 mt-1">
                  Última sync: {formatTimestamp(status.last_sync)}
                </p>
              )}
              {status.error_message && (
                <p className="text-xs text-red-400 mt-1">
                  Erro: {status.error_message}
                </p>
              )}
              {status.remote_file_id && (
                <p className="text-xs text-gray-500 mt-1">
                  ID remoto: {status.remote_file_id.substring(0, 12)}...
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
