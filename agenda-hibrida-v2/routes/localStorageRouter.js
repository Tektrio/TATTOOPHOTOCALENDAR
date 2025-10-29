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

router.initService = initService;
module.exports = router;

