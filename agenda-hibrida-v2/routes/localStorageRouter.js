const express = require('express');
const router = express.Router();
const LocalStorageService = require('../services/localStorageService');

/**
 * Rotas para gerenciamento de armazenamento local
 */

// Inicializa serviço (será injetado no server.js)
let localStorageService = null;

const initService = (db) => {
  localStorageService = new LocalStorageService(db);
};

// POST /api/local-storage/validate-path - Valida caminho antes de configurar
router.post('/validate-path', async (req, res) => {
  try {
    const { path } = req.body;
    console.log('📁 [LOCAL-STORAGE] Validando caminho:', path);

    if (!path) {
      return res.status(400).json({ error: 'path é obrigatório' });
    }

    const result = await localStorageService.validatePath(path);
    console.log('✅ [LOCAL-STORAGE] Validação resultado:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro na validação:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/local-storage/configure - Configura pasta local
router.post('/configure', async (req, res) => {
  try {
    const { basePath } = req.body;
    console.log('⚙️ [LOCAL-STORAGE] Configurando pasta:', basePath);

    if (!basePath) {
      return res.status(400).json({ error: 'basePath é obrigatório' });
    }

    const result = await localStorageService.configure(basePath);
    console.log('✅ [LOCAL-STORAGE] Pasta configurada:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao configurar:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/local-storage/config - Obtém configuração
router.get('/config', async (req, res) => {
  try {
    console.log('📋 [LOCAL-STORAGE] Obtendo configuração...');
    const config = await localStorageService.getConfig();
    
    if (!config) {
      console.log('⚠️ [LOCAL-STORAGE] Configuração não encontrada');
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    console.log('✅ [LOCAL-STORAGE] Configuração encontrada:', config.base_path);
    res.json(config);
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao obter config:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/local-storage/scan - Escaneia e indexa arquivos
router.post('/scan', async (req, res) => {
  try {
    console.log('🔍 [LOCAL-STORAGE] Iniciando escaneamento...');
    const result = await localStorageService.scanDirectory();
    console.log(`✅ [LOCAL-STORAGE] Escaneamento concluído: ${result.indexed} arquivos indexados`);
    res.json(result);
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao escanear:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/local-storage/files - Lista arquivos indexados
router.get('/files', async (req, res) => {
  try {
    console.log('📂 [LOCAL-STORAGE] Listando arquivos indexados...');
    const filters = {
      clientId: req.query.clientId ? parseInt(req.query.clientId) : null,
      category: req.query.category,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const files = await localStorageService.listFiles(filters);
    console.log(`✅ [LOCAL-STORAGE] ${files.length} arquivos encontrados`);
    res.json({ files, count: files.length });
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao listar arquivos:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/local-storage/files/:clientId - Arquivos de cliente específico
router.get('/files/:clientId', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const files = await localStorageService.listFiles({ clientId });
    res.json({ clientId, files, count: files.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/local-storage/files/:fileId - Remove arquivo do índice
router.delete('/files/:fileId', async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);
    const result = await localStorageService.removeFromIndex(fileId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/local-storage/sync-all - Sincroniza todos os arquivos
router.post('/sync-all', async (req, res) => {
  try {
    const { mode, destinationId } = req.body;
    
    if (!mode || !['incremental', 'full'].includes(mode)) {
      return res.status(400).json({ error: 'mode deve ser "incremental" ou "full"' });
    }

    if (!destinationId) {
      return res.status(400).json({ error: 'destinationId é obrigatório' });
    }

    console.log(`🔄 [LOCAL-STORAGE] Iniciando sincronização ${mode} de todos os arquivos...`);
    
    const result = await localStorageService.syncAll(mode, destinationId);
    
    // Adicionar arquivos à fila de sincronização
    const syncQueue = req.app.locals.syncQueue;
    if (syncQueue && result.files.length > 0) {
      for (const file of result.files) {
        try {
          await syncQueue.addToQueue(file.id, [destinationId], 5);
        } catch (error) {
          console.error(`Erro ao adicionar arquivo ${file.id} à fila:`, error.message);
        }
      }
      
      // Iniciar processamento da fila
      syncQueue.processQueue().catch(err => {
        console.error('Erro no processamento da fila:', err.message);
      });
    }

    console.log(`✅ [LOCAL-STORAGE] ${result.count} arquivos adicionados à fila de sincronização`);
    res.json({
      success: true,
      count: result.count,
      mode: result.mode,
      message: `${result.count} arquivo(s) adicionado(s) à fila de sincronização`
    });
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao sincronizar:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/local-storage/sync-folder - Sincroniza pasta específica
router.post('/sync-folder', async (req, res) => {
  try {
    const { folderPath, mode, destinationId } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'folderPath é obrigatório' });
    }

    if (!mode || !['incremental', 'full'].includes(mode)) {
      return res.status(400).json({ error: 'mode deve ser "incremental" ou "full"' });
    }

    if (!destinationId) {
      return res.status(400).json({ error: 'destinationId é obrigatório' });
    }

    console.log(`🔄 [LOCAL-STORAGE] Iniciando sincronização ${mode} da pasta: ${folderPath}`);
    
    const result = await localStorageService.syncFolder(folderPath, mode, destinationId);
    
    // Adicionar arquivos à fila de sincronização
    const syncQueue = req.app.locals.syncQueue;
    if (syncQueue && result.files.length > 0) {
      for (const file of result.files) {
        try {
          await syncQueue.addToQueue(file.id, [destinationId], 5);
        } catch (error) {
          console.error(`Erro ao adicionar arquivo ${file.id} à fila:`, error.message);
        }
      }
      
      // Iniciar processamento da fila
      syncQueue.processQueue().catch(err => {
        console.error('Erro no processamento da fila:', err.message);
      });
    }

    console.log(`✅ [LOCAL-STORAGE] ${result.count} arquivos da pasta adicionados à fila`);
    res.json({
      success: true,
      count: result.count,
      folderPath: result.folderPath,
      mode: result.mode,
      message: `${result.count} arquivo(s) da pasta adicionado(s) à fila`
    });
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao sincronizar pasta:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/local-storage/auto-sync-status - Estado do auto-sync
router.get('/auto-sync-status', async (req, res) => {
  try {
    console.log('📋 [LOCAL-STORAGE] Obtendo status de auto-sync...');
    const config = await localStorageService.getAutoSyncConfig();
    console.log('✅ [LOCAL-STORAGE] Status obtido:', config);
    res.json(config);
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao obter status:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/local-storage/auto-sync - Ativar/desativar auto-sync
router.post('/auto-sync', async (req, res) => {
  try {
    const { enabled, intervalMinutes, mode } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled deve ser boolean' });
    }

    if (intervalMinutes && (!Number.isInteger(intervalMinutes) || intervalMinutes < 5)) {
      return res.status(400).json({ error: 'intervalMinutes deve ser >= 5' });
    }

    if (mode && !['incremental', 'full'].includes(mode)) {
      return res.status(400).json({ error: 'mode deve ser "incremental" ou "full"' });
    }

    console.log(`⚙️ [LOCAL-STORAGE] Configurando auto-sync: enabled=${enabled}, interval=${intervalMinutes}, mode=${mode}`);
    
    const result = await localStorageService.setAutoSyncConfig(
      enabled, 
      intervalMinutes || 30, 
      mode || 'incremental'
    );

    // Notificar AutoSyncWorker sobre mudança de configuração
    const autoSyncWorker = req.app.locals.autoSyncWorker;
    if (autoSyncWorker) {
      if (enabled) {
        await autoSyncWorker.restart();
        console.log('✅ [LOCAL-STORAGE] AutoSyncWorker reiniciado');
      } else {
        autoSyncWorker.stop();
        console.log('✅ [LOCAL-STORAGE] AutoSyncWorker parado');
      }
    }

    console.log('✅ [LOCAL-STORAGE] Configuração de auto-sync atualizada');
    res.json({
      success: true,
      message: enabled ? 'Sincronização automática ativada' : 'Sincronização automática desativada',
      config: result.config
    });
  } catch (error) {
    console.error('❌ [LOCAL-STORAGE] Erro ao configurar auto-sync:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.initService = initService;
module.exports = router;

