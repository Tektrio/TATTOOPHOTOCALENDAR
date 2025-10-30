/**
 * Serviço Híbrido de Logs de Auditoria
 * Armazena logs localmente (localStorage) e sincroniza com backend quando online
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LOCAL_STORAGE_KEY = 'audit_logs_pending';
const LOCAL_STORAGE_SYNCED_KEY = 'audit_logs_synced';
const SYNC_INTERVAL = 30000; // 30 segundos

let syncIntervalId = null;

/**
 * Verifica se está online
 */
function isOnline() {
  return navigator.onLine;
}

/**
 * Gera um ID único para logs locais
 */
function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtém logs pendentes do localStorage
 */
function getPendingLogs() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao ler logs pendentes:', error);
    return [];
  }
}

/**
 * Salva logs pendentes no localStorage
 */
function savePendingLogs(logs) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Erro ao salvar logs pendentes:', error);
  }
}

/**
 * Obtém logs sincronizados do localStorage (cache)
 */
function getSyncedLogs() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SYNCED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao ler logs sincronizados:', error);
    return [];
  }
}

/**
 * Salva logs sincronizados no localStorage (cache)
 */
function saveSyncedLogs(logs) {
  try {
    // Manter apenas os últimos 100 logs em cache
    const cacheLogs = logs.slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_SYNCED_KEY, JSON.stringify(cacheLogs));
  } catch (error) {
    console.error('Erro ao salvar logs sincronizados:', error);
  }
}

/**
 * Registra uma ação no log
 * Armazena localmente e tenta enviar ao backend imediatamente
 * 
 * @param {Object} logData - Dados do log
 * @param {string} logData.action - Ação realizada (CREATE, UPDATE, DELETE, etc)
 * @param {string} logData.entityType - Tipo de entidade
 * @param {number} logData.entityId - ID da entidade
 * @param {string} logData.entityName - Nome da entidade
 * @param {Object} logData.details - Detalhes adicionais
 * @returns {Promise<Object>} Log criado
 */
export async function logAction({
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = null
}) {
  const log = {
    id: generateLocalId(),
    action,
    entityType,
    entityId,
    entityName,
    changes: details,
    timestamp: new Date().toISOString(),
    synced: false,
    userAgent: navigator.userAgent,
    metadata: {
      origin: 'frontend',
      url: window.location.href
    }
  };

  // Sempre salvar localmente primeiro
  const pendingLogs = getPendingLogs();
  pendingLogs.push(log);
  savePendingLogs(pendingLogs);

  // Tentar enviar ao backend imediatamente se estiver online
  if (isOnline()) {
    try {
      await syncLogToBackend(log);
      return { ...log, synced: true };
    } catch (error) {
      console.warn('Não foi possível sincronizar log imediatamente, será enviado depois:', error);
      return { ...log, synced: false };
    }
  }

  return { ...log, synced: false };
}

/**
 * Sincroniza um log específico com o backend
 */
async function syncLogToBackend(log) {
  const response = await fetch(`${API_URL}/api/audit-logs/frontend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      entityName: log.entityName,
      changes: log.changes,
      timestamp: log.timestamp,
      userAgent: log.userAgent,
      metadata: log.metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Erro ao sincronizar log: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Sincroniza todos os logs pendentes com o backend
 * @returns {Promise<Object>} { synced: number, failed: number }
 */
export async function syncLogsToBackend() {
  if (!isOnline()) {
    return { synced: 0, failed: 0, message: 'Offline' };
  }

  const pendingLogs = getPendingLogs();
  if (pendingLogs.length === 0) {
    return { synced: 0, failed: 0, message: 'Nenhum log pendente' };
  }

  let synced = 0;
  let failed = 0;
  const stillPending = [];

  for (const log of pendingLogs) {
    try {
      await syncLogToBackend(log);
      synced++;
      
      // Adicionar aos logs sincronizados
      const syncedLogs = getSyncedLogs();
      syncedLogs.unshift({ ...log, synced: true });
      saveSyncedLogs(syncedLogs);
    } catch (error) {
      console.error('Erro ao sincronizar log:', error);
      failed++;
      stillPending.push(log);
    }
  }

  // Atualizar logs pendentes
  savePendingLogs(stillPending);

  console.log(`✅ Sincronizados ${synced} logs, ${failed} falharam`);
  return { synced, failed, message: `${synced} logs sincronizados` };
}

/**
 * Busca logs do backend com filtros
 * @param {Object} filters - Filtros de busca
 * @returns {Promise<Object>} Resultado da busca
 */
export async function getLogsFromBackend(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/api/audit-logs?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar logs: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Atualizar cache local
    if (data.logs) {
      saveSyncedLogs(data.logs);
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar logs do backend:', error);
    
    // Fallback para logs locais se offline
    if (!isOnline()) {
      const localLogs = getLocalLogs();
      return {
        success: false,
        logs: localLogs,
        total: localLogs.length,
        source: 'local',
        error: 'Offline - dados locais'
      };
    }

    throw error;
  }
}

/**
 * Busca logs recentes do backend
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de logs
 */
export async function getRecentLogs(limit = 100) {
  try {
    const response = await fetch(`${API_URL}/api/audit-logs/recent?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar logs recentes: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.logs) {
      saveSyncedLogs(data.logs);
    }

    return data.logs || [];
  } catch (error) {
    console.error('Erro ao buscar logs recentes:', error);
    
    // Fallback para logs locais
    return getLocalLogs();
  }
}

/**
 * Busca logs de uma entidade específica
 * @param {string} entityType - Tipo de entidade
 * @param {number} entityId - ID da entidade
 * @returns {Promise<Array>} Lista de logs
 */
export async function getLogsByEntity(entityType, entityId) {
  try {
    const response = await fetch(`${API_URL}/api/audit-logs/entity/${entityType}/${entityId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar logs da entidade: ${response.statusText}`);
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error('Erro ao buscar logs da entidade:', error);
    
    // Fallback para logs locais filtrados
    const localLogs = getLocalLogs();
    return localLogs.filter(log => 
      log.entityType === entityType && log.entityId === entityId
    );
  }
}

/**
 * Obtém estatísticas de auditoria
 * @param {number} days - Número de dias para análise
 * @returns {Promise<Object>} Estatísticas
 */
export async function getAuditStats(days = 7) {
  try {
    const response = await fetch(`${API_URL}/api/audit-logs/stats?days=${days}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stats || {};
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {};
  }
}

/**
 * Obtém todos os logs locais (pendentes + sincronizados)
 * @returns {Array} Lista de logs locais
 */
export function getLocalLogs() {
  const pending = getPendingLogs();
  const synced = getSyncedLogs();
  
  // Combinar e ordenar por timestamp
  const allLogs = [...pending, ...synced];
  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return allLogs;
}

/**
 * Limpa logs locais antigos
 * @param {number} days - Manter apenas logs dos últimos X dias
 */
export function cleanupLocalLogs(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Limpar logs sincronizados antigos
  const syncedLogs = getSyncedLogs();
  const recentSynced = syncedLogs.filter(log => 
    new Date(log.timestamp) > cutoffDate
  );
  saveSyncedLogs(recentSynced);

  console.log(`🗑️ Removidos ${syncedLogs.length - recentSynced.length} logs antigos do cache local`);
}

/**
 * Inicia sincronização automática
 */
export function startAutoSync() {
  if (syncIntervalId) {
    return; // Já está rodando
  }

  console.log('🔄 Sincronização automática de logs iniciada');

  syncIntervalId = setInterval(async () => {
    if (isOnline()) {
      await syncLogsToBackend();
    }
  }, SYNC_INTERVAL);

  // Sincronizar imediatamente se houver logs pendentes
  if (getPendingLogs().length > 0) {
    syncLogsToBackend();
  }
}

/**
 * Para sincronização automática
 */
export function stopAutoSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('⏹️ Sincronização automática de logs parada');
  }
}

/**
 * Obtém status da sincronização
 */
export function getSyncStatus() {
  const pendingLogs = getPendingLogs();
  const syncedLogs = getSyncedLogs();
  
  return {
    online: isOnline(),
    pendingCount: pendingLogs.length,
    syncedCount: syncedLogs.length,
    autoSyncEnabled: syncIntervalId !== null,
    lastPendingTimestamp: pendingLogs[0]?.timestamp || null
  };
}

// Iniciar auto-sync quando o módulo é carregado
if (typeof window !== 'undefined') {
  // Sincronizar ao ficar online
  window.addEventListener('online', () => {
    console.log('🌐 Conexão restaurada, sincronizando logs...');
    syncLogsToBackend();
  });

  // Limpar logs antigos periodicamente (1x por dia)
  setInterval(() => {
    cleanupLocalLogs(7);
  }, 24 * 60 * 60 * 1000);
}

export default {
  logAction,
  syncLogsToBackend,
  getLogsFromBackend,
  getRecentLogs,
  getLogsByEntity,
  getAuditStats,
  getLocalLogs,
  cleanupLocalLogs,
  startAutoSync,
  stopAutoSync,
  getSyncStatus,
  isOnline
};

