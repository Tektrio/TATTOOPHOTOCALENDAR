/**
 * Service para cálculo de métricas e analytics dos clientes
 * Agrega dados de múltiplas tabelas para fornecer insights
 * 
 * VERSÃO SIMPLIFICADA: Usa tabela 'appointments' existente
 */

// Referência ao banco de dados (será definida pela rota)
let db = null;

/**
 * Definir instância do banco de dados
 */
function setDatabase(database) {
  db = database;
}

/**
 * Calcular métricas gerais de um cliente
 */
async function getClientMetrics(clientId) {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise(async (resolve, reject) => {
    try {
      const metrics = {};

      // 1. Total de sessões realizadas
      metrics.total_sessions = await getTotalSessions(clientId);

      // 2. Total gasto (estimado)
      metrics.total_spent = await getTotalSpent(clientId);

      // 3. Total de gorjetas (não disponível na tabela atual)
      metrics.total_tips = 0;

      // 4. Taxa de cancelamento
      metrics.cancellation_rate = await getCancellationRate(clientId);

      // 5. Duração média das sessões
      metrics.avg_session_duration = await getAverageDuration(clientId);

      // 6. Data da última visita
      metrics.last_visit = await getLastVisit(clientId);

      // 7. Próximo agendamento
      metrics.next_appointment = await getNextAppointment(clientId);

      // 8. Status VIP (baseado em valor gasto)
      metrics.vip_status = metrics.total_spent > 5000 ? 'vip' : 
                          metrics.total_spent > 2000 ? 'premium' : 'standard';

      // 9. Cliente desde
      metrics.client_since = await getClientSince(clientId);

      resolve(metrics);
    } catch (error) {
      console.error('Error getting client metrics:', error);
      reject(error);
    }
  });
}

/**
 * Histórico financeiro do cliente
 */
async function getFinancialHistory(clientId, period = '12months') {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    // Calcular data inicial baseada no período
    let dateFilter = '';
    switch (period) {
      case '3months':
        dateFilter = "AND date(start_datetime) >= date('now', '-3 months')";
        break;
      case '6months':
        dateFilter = "AND date(start_datetime) >= date('now', '-6 months')";
        break;
      case '12months':
        dateFilter = "AND date(start_datetime) >= date('now', '-12 months')";
        break;
      case 'all':
      default:
        dateFilter = '';
    }

    db.all(
      `SELECT 
         date(start_datetime) as date,
         COUNT(*) as sessions,
         SUM(COALESCE(estimated_price, 0)) as amount,
         0 as tips,
         service as service_name
       FROM appointments
       WHERE client_id = ?
         AND status IN ('completed', 'confirmado', 'checked_in')
         ${dateFilter}
       GROUP BY date(start_datetime)
       ORDER BY date DESC`,
      [clientId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

/**
 * Serviços mais frequentes do cliente
 */
async function getMostFrequentServices(clientId, limit = 5) {
  if (!db) throw new Error('Database not initialized');
  
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         COALESCE(service, 'Serviço não especificado') as service_name,
         COUNT(*) as count,
         SUM(COALESCE(estimated_price, 0)) as total_spent
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('completed', 'confirmado', 'checked_in')
         AND service IS NOT NULL
       GROUP BY service
       ORDER BY count DESC
       LIMIT ?`,
      [clientId, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Total de sessões realizadas
 */
function getTotalSessions(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count 
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('completed', 'confirmado', 'checked_in')`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Total gasto pelo cliente (estimado)
 */
function getTotalSpent(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(COALESCE(estimated_price, 0)) as total 
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('completed', 'confirmado', 'checked_in')`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      }
    );
  });
}

/**
 * Taxa de cancelamento
 */
function getCancellationRate(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
         COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
         COUNT(*) as total
       FROM appointments
       WHERE client_id = ?`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else {
          const rate = row && row.total > 0 ? (row.cancelled / row.total) * 100 : 0;
          resolve(Math.round(rate * 100) / 100);
        }
      }
    );
  });
}

/**
 * Duração média das sessões (em minutos)
 */
function getAverageDuration(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT AVG(COALESCE(duration, 60)) as avg_duration
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('completed', 'confirmado', 'checked_in')`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(Math.round(row?.avg_duration || 60));
      }
    );
  });
}

/**
 * Data da última visita
 */
function getLastVisit(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT start_datetime
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('completed', 'confirmado', 'checked_in')
       ORDER BY start_datetime DESC 
       LIMIT 1`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.start_datetime || null);
      }
    );
  });
}

/**
 * Próximo agendamento
 */
function getNextAppointment(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT start_datetime, service, title
       FROM appointments
       WHERE client_id = ? 
         AND status IN ('scheduled', 'pendente', 'confirmado')
         AND datetime(start_datetime) >= datetime('now')
       ORDER BY start_datetime ASC 
       LIMIT 1`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row ? {
          date: row.start_datetime,
          service: row.service || row.title
        } : null);
      }
    );
  });
}

/**
 * Cliente desde quando
 */
function getClientSince(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT created_at
       FROM clients
       WHERE id = ?`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.created_at || null);
      }
    );
  });
}

module.exports = {
  setDatabase,
  getClientMetrics,
  getFinancialHistory,
  getMostFrequentServices
};
