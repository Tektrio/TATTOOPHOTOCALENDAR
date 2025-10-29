/**
 * Configuração visual padronizada para sistema de sincronização
 * Define cores, ícones e status para destinos e arquivos
 */

// ============================================
// TIPOS DE ARMAZENAMENTO (Origem)
// ============================================
export const STORAGE_TYPES = {
  local: {
    id: 'local',
    label: 'Pasta Local',
    icon: 'HardDrive',
    color: 'teal',
    bgClass: 'bg-teal-600',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500',
    hoverClass: 'hover:bg-teal-700',
    emoji: '📁',
    role: 'source',
    description: 'Arquivos armazenados localmente no computador'
  }
};

// ============================================
// CORES DOS DESTINOS (Google Drive + QNAP)
// ============================================
export const DESTINATION_COLORS = {
  gdrive: [
    {
      id: 'blue',
      emoji: '🔵',
      label: 'Azul',
      bgClass: 'bg-blue-600',
      textClass: 'text-blue-400',
      borderClass: 'border-blue-500',
      hoverClass: 'hover:bg-blue-700',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-700'
    },
    {
      id: 'green',
      emoji: '🟢',
      label: 'Verde',
      bgClass: 'bg-green-600',
      textClass: 'text-green-400',
      borderClass: 'border-green-500',
      hoverClass: 'hover:bg-green-700',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-700'
    },
    {
      id: 'purple',
      emoji: '🟣',
      label: 'Roxo',
      bgClass: 'bg-purple-600',
      textClass: 'text-purple-400',
      borderClass: 'border-purple-500',
      hoverClass: 'hover:bg-purple-700',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-700'
    },
    {
      id: 'cyan',
      emoji: '🔷',
      label: 'Ciano',
      bgClass: 'bg-cyan-600',
      textClass: 'text-cyan-400',
      borderClass: 'border-cyan-500',
      hoverClass: 'hover:bg-cyan-700',
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-cyan-700'
    }
  ],
  qnap: {
    id: 'orange',
    emoji: '🟠',
    label: 'Laranja',
    bgClass: 'bg-orange-600',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500',
    hoverClass: 'hover:bg-orange-700',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-700'
  }
};

// ============================================
// STATUS DE SINCRONIZAÇÃO
// ============================================
export const SYNC_STATUS = {
  pending: {
    label: 'Pendente',
    icon: '⏳',
    emoji: '⏳',
    color: 'yellow',
    bgClass: 'bg-yellow-600',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500',
    description: 'Aguardando sincronização'
  },
  syncing: {
    label: 'Sincronizando',
    icon: '🔄',
    emoji: '🔄',
    color: 'blue',
    bgClass: 'bg-blue-600',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500',
    description: 'Sincronização em andamento',
    animated: true
  },
  synced: {
    label: 'Sincronizado',
    icon: '✓',
    emoji: '✅',
    color: 'green',
    bgClass: 'bg-green-600',
    textClass: 'text-green-400',
    borderClass: 'border-green-500',
    description: 'Sincronizado com sucesso'
  },
  failed: {
    label: 'Erro',
    icon: '❌',
    emoji: '❌',
    color: 'red',
    bgClass: 'bg-red-600',
    textClass: 'text-red-400',
    borderClass: 'border-red-500',
    description: 'Erro na sincronização'
  },
  conflict: {
    label: 'Conflito',
    icon: '⚠️',
    emoji: '⚠️',
    color: 'orange',
    bgClass: 'bg-orange-600',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500',
    description: 'Conflito detectado'
  }
};

// ============================================
// STATUS COMBINADO (Para badge do arquivo)
// ============================================
export const COMBINED_STATUS = {
  local_only: {
    label: 'Apenas Local',
    emoji: '📁',
    bgClass: 'bg-teal-600',
    borderClass: 'border-teal-500',
    description: 'Arquivo existe apenas localmente'
  },
  local_plus_one: {
    label: 'Local + 1 Drive',
    emoji: '🔵',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-500',
    description: 'Sincronizado com 1 destino'
  },
  local_plus_multiple: {
    label: 'Múltiplos Destinos',
    emoji: '🟣',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-500',
    description: 'Sincronizado com múltiplos destinos'
  },
  local_plus_qnap: {
    label: 'Local + QNAP',
    emoji: '🟠',
    bgClass: 'bg-orange-600',
    borderClass: 'border-orange-500',
    description: 'Sincronizado com QNAP'
  },
  all_synced: {
    label: 'Tudo Sincronizado',
    emoji: '⚡',
    bgClass: 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600',
    borderClass: 'border-purple-500',
    description: 'Sincronizado em todos os destinos'
  },
  partial_errors: {
    label: 'Parcial com Erros',
    emoji: '⚠️',
    bgClass: 'bg-yellow-600',
    borderClass: 'border-yellow-500',
    description: 'Alguns destinos falharam'
  },
  all_errors: {
    label: 'Erro',
    emoji: '❌',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-500',
    description: 'Falha em todos os destinos'
  }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém configuração de cor por ID
 */
export function getColorConfig(colorId, type = 'gdrive') {
  if (type === 'qnap') {
    return DESTINATION_COLORS.qnap;
  }
  return DESTINATION_COLORS.gdrive.find(c => c.id === colorId) || DESTINATION_COLORS.gdrive[0];
}

/**
 * Obtém configuração de status
 */
export function getStatusConfig(status) {
  return SYNC_STATUS[status] || SYNC_STATUS.pending;
}

/**
 * Calcula status combinado baseado em array de statuses
 */
export function calculateCombinedStatus(syncStatuses, totalDestinations) {
  if (!syncStatuses || syncStatuses.length === 0) {
    return COMBINED_STATUS.local_only;
  }

  const synced = syncStatuses.filter(s => s.status === 'synced').length;
  const failed = syncStatuses.filter(s => s.status === 'failed').length;
  const hasQnap = syncStatuses.some(s => s.type === 'qnap' && s.status === 'synced');

  // Todos sincronizados
  if (synced === totalDestinations) {
    return COMBINED_STATUS.all_synced;
  }

  // Todos falharam
  if (failed === syncStatuses.length) {
    return COMBINED_STATUS.all_errors;
  }

  // Alguns falharam
  if (failed > 0 && synced > 0) {
    return COMBINED_STATUS.partial_errors;
  }

  // Apenas QNAP
  if (hasQnap && synced === 1) {
    return COMBINED_STATUS.local_plus_qnap;
  }

  // Um destino
  if (synced === 1) {
    return COMBINED_STATUS.local_plus_one;
  }

  // Múltiplos
  if (synced > 1) {
    return COMBINED_STATUS.local_plus_multiple;
  }

  return COMBINED_STATUS.local_only;
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Obtém ícone de tipo de destino
 */
export function getDestinationIcon(type) {
  return type === 'gdrive' ? 'Cloud' : 'Server';
}

export default {
  STORAGE_TYPES,
  DESTINATION_COLORS,
  SYNC_STATUS,
  COMBINED_STATUS,
  getColorConfig,
  getStatusConfig,
  calculateCombinedStatus,
  formatFileSize,
  getDestinationIcon
};

