/**
 * Serviço de Logs de Auditoria
 * Rastreia e armazena todas as ações realizadas no sistema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../agenda_hibrida.db');

/**
 * Mascara parcialmente um endereço IP para privacidade (LGPD)
 * Ex: 192.168.1.100 -> 192.168.*.***
 */
function maskIP(ip) {
  if (!ip) return null;
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.**`;
  }
  return ip;
}

/**
 * Registra uma ação no log de auditoria
 * 
 * @param {Object} logData - Dados do log
 * @param {number} logData.userId - ID do usuário
 * @param {string} logData.userEmail - Email do usuário
 * @param {string} logData.userName - Nome do usuário
 * @param {string} logData.action - Ação realizada (CREATE, UPDATE, DELETE, etc)
 * @param {string} logData.entityType - Tipo de entidade (appointment, client, etc)
 * @param {number} logData.entityId - ID da entidade
 * @param {string} logData.entityName - Nome da entidade (opcional)
 * @param {Object} logData.changes - Mudanças realizadas { before, after }
 * @param {string} logData.ipAddress - IP do cliente
 * @param {string} logData.userAgent - User agent do cliente
 * @param {string} logData.requestMethod - Método HTTP
 * @param {string} logData.requestPath - Path da requisição
 * @param {string} logData.status - Status (success, error, pending)
 * @param {string} logData.errorMessage - Mensagem de erro (se houver)
 * @param {Object} logData.metadata - Metadados adicionais
 * @returns {Promise<number>} ID do log criado
 */
function logAction({
  userId = null,
  userEmail = null,
  userName = null,
  action,
  entityType,
  entityId = null,
  entityName = null,
  changes = null,
  ipAddress = null,
  userAgent = null,
  requestMethod = null,
  requestPath = null,
  status = 'success',
  errorMessage = null,
  metadata = null
}) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    // Serializar objetos para JSON
    const changesJson = changes ? JSON.stringify(changes) : null;
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    // Mascara IP para privacidade
    const maskedIP = maskIP(ipAddress);

    const query = `
      INSERT INTO audit_logs (
        user_id, user_email, user_name,
        action, entity_type, entity_id, entity_name,
        changes, ip_address, user_agent,
        request_method, request_path,
        status, error_message, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId, userEmail, userName,
      action, entityType, entityId, entityName,
      changesJson, maskedIP, userAgent,
      requestMethod, requestPath,
      status, errorMessage, metadataJson
    ];

    db.run(query, params, function(err) {
      db.close();
      if (err) {
        console.error('❌ Erro ao registrar log de auditoria:', err);
        reject(err);
      } else {
        console.log(`✅ Log de auditoria registrado: ${action} ${entityType} #${entityId || 'N/A'}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Busca logs por entidade específica
 * 
 * @param {string} entityType - Tipo de entidade
 * @param {number} entityId - ID da entidade
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de logs
 */
function getLogsByEntity(entityType, entityId, limit = 50) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      SELECT * FROM audit_logs
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    db.all(query, [entityType, entityId, limit], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        // Parse JSON fields
        const logs = rows.map(row => ({
          ...row,
          changes: row.changes ? JSON.parse(row.changes) : null,
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
        resolve(logs);
      }
    });
  });
}

/**
 * Busca logs por usuário
 * 
 * @param {number} userId - ID do usuário
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de logs
 */
function getLogsByUser(userId, limit = 100) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      SELECT * FROM audit_logs
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    db.all(query, [userId, limit], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        const logs = rows.map(row => ({
          ...row,
          changes: row.changes ? JSON.parse(row.changes) : null,
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
        resolve(logs);
      }
    });
  });
}

/**
 * Busca logs por intervalo de datas
 * 
 * @param {string} startDate - Data início (ISO format)
 * @param {string} endDate - Data fim (ISO format)
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de logs
 */
function getLogsByDateRange(startDate, endDate, limit = 500) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      SELECT * FROM audit_logs
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
      LIMIT ?
    `;

    db.all(query, [startDate, endDate, limit], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        const logs = rows.map(row => ({
          ...row,
          changes: row.changes ? JSON.parse(row.changes) : null,
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));
        resolve(logs);
      }
    });
  });
}

/**
 * Busca logs recentes
 * 
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Lista de logs
 */
function getRecentLogs(limit = 100) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      SELECT * FROM recent_audit_logs
      LIMIT ?
    `;

    db.all(query, [limit], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Busca logs com filtros avançados
 * 
 * @param {Object} filters - Filtros de busca
 * @param {string} filters.action - Ação
 * @param {string} filters.entityType - Tipo de entidade
 * @param {string} filters.status - Status
 * @param {number} filters.userId - ID do usuário
 * @param {string} filters.startDate - Data início
 * @param {string} filters.endDate - Data fim
 * @param {string} filters.search - Busca em entity_name
 * @param {number} filters.limit - Limite de resultados
 * @param {number} filters.offset - Offset para paginação
 * @returns {Promise<Object>} { logs, total, page, totalPages }
 */
function searchLogs(filters = {}) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const {
      action,
      entityType,
      status,
      userId,
      startDate,
      endDate,
      search,
      limit = 50,
      offset = 0
    } = filters;

    // Construir query dinâmica
    const conditions = [];
    const params = [];

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (entityType) {
      conditions.push('entity_type = ?');
      params.push(entityType);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    if (startDate && endDate) {
      conditions.push('timestamp BETWEEN ? AND ?');
      params.push(startDate, endDate);
    } else if (startDate) {
      conditions.push('timestamp >= ?');
      params.push(startDate);
    } else if (endDate) {
      conditions.push('timestamp <= ?');
      params.push(endDate);
    }

    if (search) {
      conditions.push('(entity_name LIKE ? OR user_name LIKE ? OR user_email LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Query para contar total
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
    
    db.get(countQuery, params, (err, countRow) => {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      const total = countRow.total;
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      // Query para buscar logs
      const query = `
        SELECT * FROM audit_logs
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `;

      const queryParams = [...params, limit, offset];

      db.all(query, queryParams, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          const logs = rows.map(row => ({
            ...row,
            changes: row.changes ? JSON.parse(row.changes) : null,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
          }));

          resolve({
            logs,
            total,
            page: currentPage,
            totalPages,
            limit,
            offset
          });
        }
      });
    });
  });
}

/**
 * Obtém estatísticas de auditoria
 * 
 * @param {number} days - Número de dias para análise
 * @returns {Promise<Object>} Estatísticas
 */
function getAuditStats(days = 7) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      SELECT 
        date,
        action,
        entity_type,
        status,
        count
      FROM audit_stats
      WHERE date >= date('now', '-${days} days')
      ORDER BY date DESC, count DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      // Agregar estatísticas
      const stats = {
        totalActions: 0,
        actionsByType: {},
        entitiesByType: {},
        successRate: 0,
        errorCount: 0,
        dailyActivity: {}
      };

      rows.forEach(row => {
        stats.totalActions += row.count;

        // Por ação
        if (!stats.actionsByType[row.action]) {
          stats.actionsByType[row.action] = 0;
        }
        stats.actionsByType[row.action] += row.count;

        // Por entidade
        if (!stats.entitiesByType[row.entity_type]) {
          stats.entitiesByType[row.entity_type] = 0;
        }
        stats.entitiesByType[row.entity_type] += row.count;

        // Por status
        if (row.status === 'error') {
          stats.errorCount += row.count;
        }

        // Por data
        if (!stats.dailyActivity[row.date]) {
          stats.dailyActivity[row.date] = 0;
        }
        stats.dailyActivity[row.date] += row.count;
      });

      // Calcular taxa de sucesso
      if (stats.totalActions > 0) {
        stats.successRate = ((stats.totalActions - stats.errorCount) / stats.totalActions) * 100;
        stats.successRate = Math.round(stats.successRate * 100) / 100;
      }

      db.close();
      resolve(stats);
    });
  });
}

/**
 * Deleta logs antigos manualmente
 * 
 * @param {number} days - Manter apenas logs dos últimos X dias
 * @returns {Promise<number>} Quantidade de logs deletados
 */
function cleanupOldLogs(days = 90) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const query = `
      DELETE FROM audit_logs 
      WHERE timestamp < datetime('now', '-${days} days')
      AND status = 'success'
    `;

    db.run(query, [], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        console.log(`🗑️  ${this.changes} logs antigos removidos`);
        resolve(this.changes);
      }
    });
  });
}

/**
 * Exporta logs para JSON
 * 
 * @param {Object} filters - Mesmos filtros de searchLogs
 * @returns {Promise<Array>} Array de logs
 */
async function exportLogs(filters = {}) {
  const result = await searchLogs({ ...filters, limit: 10000, offset: 0 });
  return result.logs;
}

module.exports = {
  logAction,
  getLogsByEntity,
  getLogsByUser,
  getLogsByDateRange,
  getRecentLogs,
  searchLogs,
  getAuditStats,
  cleanupOldLogs,
  exportLogs,
  maskIP
};

