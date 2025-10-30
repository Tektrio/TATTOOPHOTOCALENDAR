/**
 * Middleware de Auditoria
 * Intercepta ações e registra logs automaticamente
 */

const auditLogService = require('../services/auditLogService');

/**
 * Extrai informações da entidade com base na URL e corpo da requisição
 */
function extractEntityInfo(req) {
  const path = req.path;
  const body = req.body;
  const params = req.params;

  // Determinar tipo de entidade baseado na URL
  let entityType = null;
  let entityId = null;
  let entityName = null;

  if (path.includes('/appointments')) {
    entityType = 'appointment';
    entityId = params.id || body.id;
    entityName = body.title || null;
  } else if (path.includes('/clients')) {
    entityType = 'client';
    entityId = params.id || body.id;
    entityName = body.name || null;
  } else if (path.includes('/employees')) {
    entityType = 'employee';
    entityId = params.id || body.id;
    entityName = body.name || null;
  } else if (path.includes('/tattoo-types')) {
    entityType = 'tattoo_type';
    entityId = params.id || body.id;
    entityName = body.name || null;
  } else if (path.includes('/transactions') || path.includes('/financial')) {
    entityType = 'transaction';
    entityId = params.id || body.id;
    entityName = `Transação ${entityId || 'nova'}`;
  } else if (path.includes('/files') || path.includes('/uploads')) {
    entityType = 'file';
    entityId = params.id || body.id;
    entityName = body.filename || body.name || null;
  } else if (path.includes('/import')) {
    entityType = 'import';
    entityId = params.id || body.id;
    entityName = body.source || 'Import';
  } else if (path.includes('/sync')) {
    entityType = 'sync';
    entityId = params.id || body.id;
    entityName = 'Sincronização';
  } else if (path.includes('/config')) {
    entityType = 'config';
    entityId = params.id || body.id;
    entityName = body.key || 'Configuração';
  }

  return { entityType, entityId, entityName };
}

/**
 * Determina a ação baseada no método HTTP
 */
function getActionFromMethod(method) {
  const actionMap = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': null  // GET não gera audit log
  };

  return actionMap[method] || null;
}

/**
 * Middleware principal de auditoria
 * Usa após a resposta ser enviada para não afetar performance
 */
function auditMiddleware(options = {}) {
  const {
    skipPaths = ['/api/audit-logs', '/api/stats', '/health'],
    skipMethods = ['GET', 'OPTIONS', 'HEAD']
  } = options;

  return (req, res, next) => {
    // Pular caminhos específicos
    if (skipPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Pular métodos que não modificam dados
    if (skipMethods.includes(req.method)) {
      return next();
    }

    // Armazenar informações originais da resposta
    const originalSend = res.send;
    const originalJson = res.json;

    let responseData = null;
    let originalBodyBefore = null;

    // Capturar corpo original para UPDATE/DELETE (before)
    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
      originalBodyBefore = { ...req.body };
    }

    // Interceptar res.json para capturar resposta
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Interceptar res.send para capturar resposta
    res.send = function(data) {
      if (!responseData && typeof data === 'object') {
        responseData = data;
      }
      return originalSend.call(this, data);
    };

    // Registrar log após resposta ser enviada
    res.on('finish', async () => {
      try {
        // Só registra se foi sucesso (2xx ou 3xx)
        if (res.statusCode < 200 || res.statusCode >= 400) {
          // Se foi erro, registra com status error
          if (res.statusCode >= 400) {
            const { entityType, entityId, entityName } = extractEntityInfo(req);
            const action = getActionFromMethod(req.method);

            if (action && entityType) {
              await auditLogService.logAction({
                userId: req.user?.id || null,
                userEmail: req.user?.email || null,
                userName: req.user?.name || null,
                action,
                entityType,
                entityId,
                entityName,
                changes: null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                requestMethod: req.method,
                requestPath: req.path,
                status: 'error',
                errorMessage: `HTTP ${res.statusCode}`,
                metadata: {
                  statusCode: res.statusCode
                }
              });
            }
          }
          return;
        }

        const { entityType, entityId, entityName } = extractEntityInfo(req);
        const action = getActionFromMethod(req.method);

        // Se não conseguiu determinar entidade ou ação, não registra
        if (!action || !entityType) {
          return;
        }

        // Preparar changes (before/after)
        const changes = {};

        if (req.method === 'UPDATE' && originalBodyBefore) {
          changes.before = originalBodyBefore;
          changes.after = req.body;
        } else if (req.method === 'CREATE') {
          changes.after = req.body;
        } else if (req.method === 'DELETE' && originalBodyBefore) {
          changes.before = originalBodyBefore;
        }

        // Registrar log de auditoria
        await auditLogService.logAction({
          userId: req.user?.id || null,
          userEmail: req.user?.email || null,
          userName: req.user?.name || null,
          action,
          entityType,
          entityId: entityId || (responseData?.id),
          entityName,
          changes: Object.keys(changes).length > 0 ? changes : null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          requestMethod: req.method,
          requestPath: req.path,
          status: 'success',
          metadata: {
            statusCode: res.statusCode,
            responseTime: Date.now() - req._startTime
          }
        });
      } catch (error) {
        // Não deve quebrar a aplicação se falhar o log
        console.error('❌ Erro ao registrar log de auditoria:', error);
      }
    });

    // Registrar tempo de início
    req._startTime = Date.now();

    next();
  };
}

/**
 * Helper para registrar logs manualmente em rotas específicas
 * Usar quando o middleware automático não for suficiente
 */
async function manualAuditLog(req, action, entityType, entityData = {}) {
  try {
    await auditLogService.logAction({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      userName: req.user?.name || null,
      action,
      entityType,
      entityId: entityData.id || null,
      entityName: entityData.name || entityData.title || null,
      changes: entityData.changes || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      status: 'success',
      metadata: entityData.metadata || null
    });
  } catch (error) {
    console.error('❌ Erro ao registrar log manual:', error);
  }
}

/**
 * Middleware específico para upload de arquivos
 */
function auditUploadMiddleware() {
  return async (req, res, next) => {
    // Registrar após upload bem-sucedido
    const originalSend = res.send;
    const originalJson = res.json;

    res.json = async function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.file) {
        try {
          await auditLogService.logAction({
            userId: req.user?.id || null,
            userEmail: req.user?.email || null,
            userName: req.user?.name || null,
            action: 'UPLOAD',
            entityType: 'file',
            entityId: data.fileId || data.id || null,
            entityName: req.file.originalname,
            changes: {
              after: {
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                destination: req.file.destination
              }
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            requestMethod: 'POST',
            requestPath: req.path,
            status: 'success',
            metadata: {
              fileSize: req.file.size,
              mimeType: req.file.mimetype
            }
          });
        } catch (error) {
          console.error('❌ Erro ao registrar log de upload:', error);
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Middleware específico para mudanças de configuração
 */
function auditConfigMiddleware() {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await auditLogService.logAction({
            userId: req.user?.id || null,
            userEmail: req.user?.email || null,
            userName: req.user?.name || null,
            action: 'CONFIG_CHANGE',
            entityType: 'config',
            entityId: null,
            entityName: req.body.key || 'Configuração',
            changes: {
              before: req.body.oldValue || null,
              after: req.body.newValue || req.body.value
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            requestMethod: req.method,
            requestPath: req.path,
            status: 'success',
            metadata: {
              configKey: req.body.key
            }
          });
        } catch (error) {
          console.error('❌ Erro ao registrar log de config:', error);
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = {
  auditMiddleware,
  manualAuditLog,
  auditUploadMiddleware,
  auditConfigMiddleware
};

