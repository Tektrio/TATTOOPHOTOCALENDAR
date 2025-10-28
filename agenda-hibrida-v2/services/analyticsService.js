const db = require('../config/database');

/**
 * Service para cálculo de métricas e analytics dos clientes
 * Agrega dados de múltiplas tabelas para fornecer insights
 */

/**
 * Calcular métricas gerais de um cliente
 */
async function getClientMetrics(clientId) {
  return new Promise(async (resolve, reject) => {
    try {
      const metrics = {};

      // 1. Total de sessões realizadas
      metrics.total_sessions = await getTotalSessions(clientId);

      // 2. Total gasto
      metrics.total_spent = await getTotalSpent(clientId);

      // 3. Total de gorjetas
      metrics.total_tips = await getTotalTips(clientId);

      // 4. Última visita
      metrics.last_visit = await getLastVisit(clientId);

      // 5. Próximo agendamento
      metrics.next_appointment = await getNextAppointment(clientId);

      // 6. Taxa de cancelamento
      metrics.cancellation_rate = await getCancellationRate(clientId);

      // 7. Projetos ativos
      metrics.active_projects = await getActiveProjects(clientId);

      // 8. Projetos concluídos
      metrics.completed_projects = await getCompletedProjects(clientId);

      // 9. Documentos pendentes
      metrics.pending_documents = await getPendingDocuments(clientId);

      // 10. Tempo médio de sessão
      metrics.avg_session_duration = await getAvgSessionDuration(clientId);

      // 11. Frequência de visitas (dias entre sessões)
      metrics.visit_frequency_days = await getVisitFrequency(clientId);

      // 12. Status VIP (baseado em gasto)
      metrics.vip_status = calculateVIPStatus(metrics.total_spent);

      resolve(metrics);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Total de sessões realizadas
 */
function getTotalSessions(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count 
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status IN ('completed', 'checked_in')`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Total gasto pelo cliente
 */
function getTotalSpent(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(total_amount) as total 
       FROM vagaro_transactions 
       WHERE client_id = ? 
         AND transaction_type IN ('sale', 'appointment')
         AND status = 'completed'`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
      }
    );
  });
}

/**
 * Total de gorjetas
 */
function getTotalTips(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(tip_amount) as total 
       FROM vagaro_transactions 
       WHERE client_id = ? 
         AND tip_amount > 0`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.total || 0);
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
      `SELECT appointment_date 
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status IN ('completed', 'checked_in')
       ORDER BY appointment_date DESC 
       LIMIT 1`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.appointment_date || null);
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
      `SELECT appointment_date, service_name 
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status = 'scheduled'
         AND appointment_date >= datetime('now')
       ORDER BY appointment_date ASC 
       LIMIT 1`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
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
       FROM vagaro_appointments 
       WHERE client_id = ?`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else {
          if (!row || row.total === 0) {
            resolve(0);
          } else {
            resolve((row.cancelled / row.total) * 100);
          }
        }
      }
    );
  });
}

/**
 * Projetos ativos
 */
function getActiveProjects(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count 
       FROM client_projects 
       WHERE client_id = ? 
         AND status IN ('planning', 'in_progress')`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Projetos concluídos
 */
function getCompletedProjects(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count 
       FROM client_projects 
       WHERE client_id = ? 
         AND status = 'completed'`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Documentos pendentes
 */
function getPendingDocuments(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count 
       FROM client_documents 
       WHERE client_id = ? 
         AND status = 'pending'`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Duração média de sessões (em minutos)
 */
function getAvgSessionDuration(clientId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT AVG(duration_minutes) as avg_duration 
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status IN ('completed', 'checked_in')
         AND duration_minutes > 0`,
      [clientId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.avg_duration || 0);
      }
    );
  });
}

/**
 * Frequência de visitas (média de dias entre sessões)
 */
function getVisitFrequency(clientId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT appointment_date 
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status IN ('completed', 'checked_in')
       ORDER BY appointment_date ASC`,
      [clientId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else if (!rows || rows.length < 2) {
          resolve(0);
        } else {
          // Calcular média de dias entre sessões
          let totalDays = 0;
          for (let i = 1; i < rows.length; i++) {
            const date1 = new Date(rows[i-1].appointment_date);
            const date2 = new Date(rows[i].appointment_date);
            const diffDays = (date2 - date1) / (1000 * 60 * 60 * 24);
            totalDays += diffDays;
          }
          resolve(totalDays / (rows.length - 1));
        }
      }
    );
  });
}

/**
 * Calcular status VIP baseado em gasto total
 */
function calculateVIPStatus(totalSpent) {
  if (totalSpent >= 10000) return { level: 'platinum', label: 'Platina', icon: '💎' };
  if (totalSpent >= 5000) return { level: 'gold', label: 'Ouro', icon: '🥇' };
  if (totalSpent >= 1000) return { level: 'silver', label: 'Prata', icon: '🥈' };
  return { level: 'bronze', label: 'Bronze', icon: '🥉' };
}

/**
 * Obter histórico financeiro por período
 */
async function getFinancialHistory(clientId, period = '12months') {
  return new Promise((resolve, reject) => {
    let dateFilter = '';
    switch (period) {
      case '30days':
        dateFilter = "AND transaction_date >= date('now', '-30 days')";
        break;
      case '3months':
        dateFilter = "AND transaction_date >= date('now', '-3 months')";
        break;
      case '6months':
        dateFilter = "AND transaction_date >= date('now', '-6 months')";
        break;
      case '12months':
        dateFilter = "AND transaction_date >= date('now', '-12 months')";
        break;
      case 'all':
      default:
        dateFilter = '';
    }

    db.all(
      `SELECT 
         strftime('%Y-%m', transaction_date) as month,
         SUM(total_amount) as total,
         SUM(tip_amount) as tips,
         COUNT(*) as count
       FROM vagaro_transactions 
       WHERE client_id = ? 
         AND transaction_type IN ('sale', 'appointment')
         AND status = 'completed'
         ${dateFilter}
       GROUP BY month
       ORDER BY month ASC`,
      [clientId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

/**
 * Obter serviços mais frequentes
 */
async function getMostFrequentServices(clientId, limit = 5) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
         service_name,
         COUNT(*) as count,
         SUM(service_price) as total_spent
       FROM vagaro_appointments 
       WHERE client_id = ? 
         AND status IN ('completed', 'checked_in')
         AND service_name IS NOT NULL
       GROUP BY service_name
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

module.exports = {
  getClientMetrics,
  getFinancialHistory,
  getMostFrequentServices
};

