const express = require('express');
const router = express.Router();
const QnapService = require('../services/qnapService');
const QnapValidator = require('../services/qnapValidator');
const SyncDestinationsService = require('../services/syncDestinationsService');

/**
 * Rotas para gerenciamento QNAP NAS
 */

let qnapService = null;
let destService = null;

const initService = (db) => {
  qnapService = new QnapService(db);
  destService = new SyncDestinationsService(db);
};

// POST /api/qnap/configure - Configura QNAP (cria destino)
router.post('/configure', async (req, res) => {
  try {
    const { name, config } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (!config) {
      return res.status(400).json({ error: 'Configuração é obrigatória' });
    }

    // Valida configuração primeiro
    const validation = await QnapValidator.validate(config);

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Configuração inválida', 
        details: validation.errors,
        warnings: validation.warnings
      });
    }

    // Cria destino QNAP
    const destination = await destService.add({
      type: 'qnap',
      name,
      config,
      priority: 0
    });

    res.status(201).json({
      success: true,
      destination,
      validation,
      message: 'QNAP configurado com sucesso'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/qnap/test - Testa conexão QNAP (sem salvar)
router.post('/test', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({ error: 'Configuração é obrigatória' });
    }

    // Valida e testa conexão
    const result = await QnapValidator.validate(config);

    res.json({
      testResult: result,
      message: result.valid ? 'Conexão bem-sucedida' : 'Falha na conexão'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qnap/test-connection - Teste rápido de conectividade
router.post('/test-connection', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({ error: 'Configuração é obrigatória' });
    }

    const result = await qnapService.testConnection(config);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/qnap/status - Status de todos os QNAP configurados
router.get('/status', async (req, res) => {
  try {
    const destinations = await destService.listByType('qnap');

    const statuses = await Promise.all(
      destinations.map(async (dest) => {
        try {
          const testResult = await qnapService.testConnection(dest.config);
          return {
            id: dest.id,
            name: dest.name,
            enabled: dest.enabled,
            status: testResult.success ? 'connected' : 'disconnected',
            error: testResult.error || null
          };
        } catch (error) {
          return {
            id: dest.id,
            name: dest.name,
            enabled: dest.enabled,
            status: 'error',
            error: error.message
          };
        }
      })
    );

    res.json({ statuses, count: statuses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qnap/:id/disconnect - Desconecta cliente QNAP específico
router.post('/:id/disconnect', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const destination = await destService.getById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'QNAP não encontrado' });
    }

    if (destination.type !== 'qnap') {
      return res.status(400).json({ error: 'Não é um destino QNAP' });
    }

    // Remove cliente do cache (se existir)
    qnapService._removeClient(destination.config);

    res.json({ 
      success: true, 
      message: 'Cliente QNAP desconectado' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/qnap/:id/files - Lista arquivos no QNAP
router.get('/:id/files', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const remotePath = req.query.path || '/';
    
    const destination = await destService.getById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'QNAP não encontrado' });
    }

    if (destination.type !== 'qnap') {
      return res.status(400).json({ error: 'Não é um destino QNAP' });
    }

    const files = await qnapService.listFiles(remotePath, destination.config);
    
    res.json({ 
      destinationId: id,
      destinationName: destination.name,
      remotePath, 
      files, 
      count: files.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.initService = initService;
module.exports = router;

