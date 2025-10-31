/**
 * Rotas REST para Logs de Auditoria
 * Endpoints para consultar e exportar logs do sistema
 */

const express = require('express');
const router = express.Router();
const auditLogService = require('../services/auditLogService');

/**
 * GET /api/audit-logs
 * Lista logs com filtros avançados e paginação
 * 
 * Query params:
 * - action: Filtrar por ação (CREATE, UPDATE, DELETE, etc)
 * - entityType: Filtrar por tipo de entidade
 * - status: Filtrar por status (success, error, pending)
 * - userId: Filtrar por usuário
 * - startDate: Data início (ISO format)
 * - endDate: Data fim (ISO format)
 * - search: Busca textual em entity_name, user_name, user_email
 * - limit: Limite de resultados por página (default: 50)
 * - offset: Offset para paginação (default: 0)
 * - page: Número da página (alternativa ao offset)
 */
router.get('/', async (req, res) => {
  try {
    const {
      action,
      entityType,
      status,
      userId,
      startDate,
      endDate,
      search,
      limit = 50,
      page
    } = req.query;

    // Calcular offset se page foi fornecido
    let offset = parseInt(req.query.offset) || 0;
    if (page) {
      offset = (parseInt(page) - 1) * parseInt(limit);
    }

    const result = await auditLogService.searchLogs({
      action,
      entityType,
      status,
      userId: userId ? parseInt(userId) : null,
      startDate,
      endDate,
      search,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs de auditoria',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/recent
 * Lista logs recentes (últimos 7 dias)
 * 
 * Query params:
 * - limit: Limite de resultados (default: 100)
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await auditLogService.getRecentLogs(limit);

    res.json({
      success: true,
      logs,
      count: logs.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs recentes',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/entity/:type/:id
 * Lista logs de uma entidade específica
 * 
 * Params:
 * - type: Tipo de entidade (appointment, client, etc)
 * - id: ID da entidade
 * 
 * Query params:
 * - limit: Limite de resultados (default: 50)
 */
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const logs = await auditLogService.getLogsByEntity(type, parseInt(id), limit);

    res.json({
      success: true,
      logs,
      count: logs.length,
      entityType: type,
      entityId: parseInt(id)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs da entidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs da entidade',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/user/:id
 * Lista logs de um usuário específico
 * 
 * Params:
 * - id: ID do usuário
 * 
 * Query params:
 * - limit: Limite de resultados (default: 100)
 */
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const logs = await auditLogService.getLogsByUser(parseInt(id), limit);

    res.json({
      success: true,
      logs,
      count: logs.length,
      userId: parseInt(id)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs do usuário',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/stats
 * Retorna estatísticas de auditoria
 * 
 * Query params:
 * - days: Número de dias para análise (default: 7)
 */
router.get('/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await auditLogService.getAuditStats(days);

    res.json({
      success: true,
      stats,
      period: `${days} dias`
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas de auditoria',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/export
 * Exporta logs para JSON
 * Mesmos filtros que o endpoint principal
 */
router.get('/export', async (req, res) => {
  try {
    const {
      action,
      entityType,
      status,
      userId,
      startDate,
      endDate,
      search
    } = req.query;

    const logs = await auditLogService.exportLogs({
      action,
      entityType,
      status,
      userId: userId ? parseInt(userId) : null,
      startDate,
      endDate,
      search
    });

    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit_logs_${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      exportDate: new Date().toISOString(),
      totalLogs: logs.length,
      filters: { action, entityType, status, userId, startDate, endDate, search },
      logs
    });
  } catch (error) {
    console.error('❌ Erro ao exportar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar logs',
      message: error.message
    });
  }
});

/**
 * POST /api/audit-logs/cleanup
 * Remove logs antigos (apenas sucesso)
 * 
 * Body:
 * - days: Manter apenas logs dos últimos X dias (default: 90)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const deletedCount = await auditLogService.cleanupOldLogs(days);

    // Registrar a própria limpeza
    await auditLogService.logAction({
      userId: null,
      userEmail: 'system',
      userName: 'Sistema',
      action: 'DELETE',
      entityType: 'audit_logs',
      entityName: 'Limpeza automática',
      changes: {
        deletedCount,
        retentionDays: days
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestMethod: 'POST',
      requestPath: '/api/audit-logs/cleanup',
      status: 'success',
      metadata: {
        manual: true
      }
    });

    res.json({
      success: true,
      message: `${deletedCount} logs antigos removidos`,
      deletedCount,
      retentionDays: days
    });
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar logs antigos',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/date-range
 * Lista logs por intervalo de datas
 * 
 * Query params:
 * - startDate: Data início (ISO format) - OBRIGATÓRIO
 * - endDate: Data fim (ISO format) - OBRIGATÓRIO
 * - limit: Limite de resultados (default: 500)
 */
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate, limit = 500 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate e endDate são obrigatórios'
      });
    }

    const logs = await auditLogService.getLogsByDateRange(
      startDate,
      endDate,
      parseInt(limit)
    );

    res.json({
      success: true,
      logs,
      count: logs.length,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs por data:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar logs por data',
      message: error.message
    });
  }
});

/**
 * GET /api/audit-logs/:id
 * Busca um log específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar através do searchLogs com offset específico
    // const result = await auditLogService.searchLogs({ limit: 1, offset: 0 }); // Removido - não utilizado
    
    // Alternativa: buscar diretamente no banco
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const DB_PATH = path.join(__dirname, '../agenda_hibrida.db');
    const db = new sqlite3.Database(DB_PATH);

    db.get('SELECT * FROM audit_logs WHERE id = ?', [parseInt(id)], (err, row) => {
      db.close();
      
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao buscar log',
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: 'Log não encontrado'
        });
      }

      // Parse JSON fields
      const log = {
        ...row,
        changes: row.changes ? JSON.parse(row.changes) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      };

      res.json({
        success: true,
        log
      });
    });
  } catch (error) {
    console.error('❌ Erro ao buscar log:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar log',
      message: error.message
    });
  }
});

module.exports = router;

