const express = require('express');
const router = express.Router();
const SyncDestinationsService = require('../services/syncDestinationsService');
const QnapValidator = require('../services/qnapValidator');

/**
 * Rotas para gerenciamento de destinos de sincronização
 * (Google Drive + QNAP)
 */

let syncDestinationsService = null;

const initService = (db) => {
  syncDestinationsService = new SyncDestinationsService(db);
};

// GET /api/sync-destinations - Lista todos os destinos
router.get('/', async (req, res) => {
  try {
    const destinations = await syncDestinationsService.list();
    res.json({ destinations, count: destinations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync-destinations/:id - Obtém destino por ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const destination = await syncDestinationsService.getById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destino não encontrado' });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync-destinations - Adiciona novo destino
router.post('/', async (req, res) => {
  try {
    const { type, name, config, priority } = req.body;

    if (!type || !name || !config) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: type, name, config' 
      });
    }

    const destination = {
      type,
      name,
      config,
      priority: priority || 0
    };

    const result = await syncDestinationsService.add(destination);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/sync-destinations/:id - Atualiza destino
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    const result = await syncDestinationsService.update(id, updates);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/sync-destinations/:id - Remove destino
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await syncDestinationsService.remove(id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/sync-destinations/:id/test - Testa conexão do destino
router.post('/:id/test', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const destination = await syncDestinationsService.getById(id);

    if (!destination) {
      return res.status(404).json({ error: 'Destino não encontrado' });
    }

    let testResult;

    if (destination.type === 'qnap') {
      // Testa conexão QNAP
      testResult = await QnapValidator.validate(destination.config);
    } else if (destination.type === 'gdrive') {
      // Testa conexão Google Drive
      // Verifica se tem tokens
      if (!destination.config.tokens) {
        testResult = {
          valid: false,
          errors: ['Conta não autenticada - OAuth necessário']
        };
      } else {
        testResult = {
          valid: true,
          message: 'Tokens presentes',
          userInfo: destination.config.userInfo
        };
      }
    } else {
      return res.status(400).json({ error: 'Tipo de destino não suportado' });
    }

    res.json({
      destinationId: id,
      destinationName: destination.name,
      type: destination.type,
      testResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync-destinations/:id/enable - Habilita destino
router.post('/:id/enable', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await syncDestinationsService.setEnabled(id, true);
    res.json({ ...result, message: 'Destino habilitado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync-destinations/:id/disable - Desabilita destino
router.post('/:id/disable', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await syncDestinationsService.setEnabled(id, false);
    res.json({ ...result, message: 'Destino desabilitado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync-destinations/type/:type - Lista destinos por tipo
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['gdrive', 'qnap'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: gdrive ou qnap' });
    }

    const destinations = await syncDestinationsService.listByType(type);
    res.json({ type, destinations, count: destinations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.initService = initService;
module.exports = router;

