const express = require('express');
const router = express.Router();
const MultiDestinationSyncService = require('../services/multiDestinationSyncService');
const SyncQueue = require('../services/syncQueue');
const ConflictResolver = require('../services/conflictResolver');

/**
 * Rotas para operações de sincronização
 */

let multiSyncService = null;
let syncQueue = null;
let conflictResolver = null;

const initService = (db, io, googleService, qnapService) => {
  multiSyncService = new MultiDestinationSyncService(db, googleService, qnapService);
  syncQueue = new SyncQueue(db, io, multiSyncService);
  conflictResolver = new ConflictResolver(db);
};

// POST /api/sync/:fileId - Sincroniza arquivo para destino(s)
router.post('/:fileId', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const { destinationIds, priority } = req.body;

    if (!destinationIds || !Array.isArray(destinationIds) || destinationIds.length === 0) {
      return res.status(400).json({ 
        error: 'destinationIds é obrigatório e deve ser array não-vazio' 
      });
    }

    // Adiciona à fila
    const queueItem = await syncQueue.addToQueue(fileId, destinationIds, priority || 5);

    // Dispara processamento
    syncQueue.processQueue().catch(err => {
      console.error('Erro no processamento da fila:', err.message);
    });

    res.json({
      success: true,
      message: 'Sincronização adicionada à fila',
      queueItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/bulk - Sincronização em lote
router.post('/bulk', async (req, res) => {
  try {
    const { fileIds, destinationIds, priority } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'fileIds é obrigatório e deve ser array' });
    }

    if (!destinationIds || !Array.isArray(destinationIds) || destinationIds.length === 0) {
      return res.status(400).json({ error: 'destinationIds é obrigatório e deve ser array' });
    }

    const queueItems = [];

    for (const fileId of fileIds) {
      try {
        const item = await syncQueue.addToQueue(fileId, destinationIds, priority || 5);
        queueItems.push(item);
      } catch (error) {
        console.error(`Erro ao adicionar arquivo ${fileId} à fila:`, error.message);
      }
    }

    // Dispara processamento
    syncQueue.processQueue().catch(err => {
      console.error('Erro no processamento da fila:', err.message);
    });

    res.json({
      success: true,
      message: `${queueItems.length} arquivos adicionados à fila`,
      queueItems,
      total: queueItems.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/status/:fileId - Status de sincronização de arquivo
router.get('/status/:fileId', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const statuses = await multiSyncService.getSyncStatus(fileId);
    
    res.json({ 
      fileId, 
      statuses, 
      count: statuses.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/queue - Lista fila de sincronização
router.get('/queue', async (req, res) => {
  try {
    const status = req.query.status || null;
    const items = await syncQueue.list(status);
    
    res.json({ 
      items, 
      count: items.length,
      filter: status || 'all'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/queue/stats - Estatísticas da fila
router.get('/queue/stats', async (req, res) => {
  try {
    const stats = await syncQueue.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/queue/process - Força processamento da fila
router.post('/queue/process', async (req, res) => {
  try {
    const result = await syncQueue.processQueue();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sync/queue/:id - Cancela item da fila
router.delete('/queue/:id', async (req, res) => {
  try {
    const queueId = parseInt(req.params.id);
    const result = await syncQueue.cancel(queueId);
    
    res.json({ 
      success: true, 
      message: 'Item cancelado',
      ...result 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/queue/clean - Limpa itens antigos da fila
router.post('/queue/clean', async (req, res) => {
  try {
    const removed = await syncQueue.cleanOld();
    
    res.json({ 
      success: true, 
      message: `${removed} itens removidos`,
      removed 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/stats - Estatísticas gerais de sincronização
router.get('/stats', async (req, res) => {
  try {
    const stats = await multiSyncService.getStats();
    const queueStats = await syncQueue.getStats();
    const conflictStats = await conflictResolver.getConflictStats();
    
    res.json({ 
      sync: stats,
      queue: queueStats,
      conflicts: conflictStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/retry-failed - Re-sincroniza arquivos com falha
router.post('/retry-failed', async (req, res) => {
  try {
    const { destinationId } = req.body;
    
    const result = await multiSyncService.retryFailed(destinationId || null);
    
    res.json({
      success: true,
      ...result,
      message: `${result.successCount}/${result.total} re-sincronizações bem-sucedidas`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/conflicts - Lista todos os conflitos
router.get('/conflicts', async (req, res) => {
  try {
    const conflicts = await conflictResolver.detectAllConflicts();
    
    res.json({ 
      conflicts, 
      count: conflicts.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/conflicts/:fileId - Detecta conflitos de arquivo específico
router.get('/conflicts/:fileId', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const result = await conflictResolver.detectConflicts(fileId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/conflicts/resolve - Resolve conflito
router.post('/conflicts/resolve', async (req, res) => {
  try {
    const { fileId, destinationId, strategy } = req.body;

    if (!fileId || !destinationId || !strategy) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: fileId, destinationId, strategy' 
      });
    }

    const validStrategies = ['local_wins', 'remote_wins', 'keep_both', 'manual'];
    if (!validStrategies.includes(strategy)) {
      return res.status(400).json({ 
        error: `Estratégia inválida. Use: ${validStrategies.join(', ')}` 
      });
    }

    const result = await conflictResolver.resolveConflict(fileId, destinationId, strategy);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exporta também o syncQueue para uso no server.js
router.initService = initService;
router.getSyncQueue = () => syncQueue;
module.exports = router;

