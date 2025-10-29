const express = require('express');
const router = express.Router();
const GoogleDriveMultiAccountService = require('../services/googleDriveMultiAccountService');
const SyncDestinationsService = require('../services/syncDestinationsService');

/**
 * Rotas para gerenciamento de contas Google Drive
 * OAuth para múltiplas contas
 */

let googleService = null;
let destService = null;

const initService = (db) => {
  googleService = new GoogleDriveMultiAccountService(db);
  destService = new SyncDestinationsService(db);
};

// GET /api/google-accounts - Lista contas Google conectadas
router.get('/', async (req, res) => {
  try {
    const destinations = await destService.listByType('gdrive');
    
    const accounts = destinations.map(dest => ({
      id: dest.id,
      name: dest.name,
      color: dest.color,
      enabled: dest.enabled,
      userInfo: dest.config.userInfo || null,
      hasTokens: !!dest.config.tokens,
      createdAt: dest.created_at
    }));

    res.json({ accounts, count: accounts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/google-accounts/add - Inicia processo OAuth para nova conta
router.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da conta é obrigatório' });
    }

    // Conta quantas contas Google já existem
    const existing = await destService.listByType('gdrive');
    const accountNumber = existing.length + 1;

    // Gera URL OAuth
    const oauthData = await googleService.addAccount(name, accountNumber);

    // Cria destino pendente no banco (sem tokens ainda)
    const destination = await destService.add({
      type: 'gdrive',
      name,
      config: {
        pending: true,
        accountNumber
      },
      priority: 0
    });

    res.json({
      destinationId: destination.id,
      ...oauthData,
      message: 'Redirecione o usuário para authUrl para autorizar'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/google-accounts/callback - Callback OAuth (recebe código)
router.post('/callback', async (req, res) => {
  try {
    const { code, destinationId } = req.body;

    if (!code || !destinationId) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: code, destinationId' 
      });
    }

    // Completa OAuth e salva tokens
    const result = await googleService.completeOAuth(code, parseInt(destinationId));

    res.json({
      success: true,
      ...result,
      message: 'Conta Google conectada com sucesso'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/google-accounts/:id - Remove conta Google
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Busca destino
    const destination = await destService.getById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    if (destination.type !== 'gdrive') {
      return res.status(400).json({ error: 'Não é uma conta Google Drive' });
    }

    // Revoga acesso (opcional)
    if (destination.config.tokens) {
      try {
        await googleService.revokeAccess(destination.config);
      } catch (err) {
        console.warn('Não foi possível revogar acesso:', err.message);
      }
    }

    // Remove destino
    const result = await destService.remove(id);
    
    res.json({ 
      success: true, 
      message: 'Conta Google removida',
      ...result 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/google-accounts/:id/refresh - Renova tokens manualmente
router.post('/:id/refresh', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const destination = await destService.getById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    if (destination.type !== 'gdrive') {
      return res.status(400).json({ error: 'Não é uma conta Google Drive' });
    }

    if (!destination.config.tokens) {
      return res.status(400).json({ error: 'Conta não possui tokens' });
    }

    // Força refresh dos tokens
    const oauth2Client = googleService._createOAuthClient();
    oauth2Client.setCredentials(destination.config.tokens);
    
    const newConfig = await googleService._refreshTokens(oauth2Client, destination.config);

    // Atualiza no banco
    await destService.update(id, { config: newConfig });

    res.json({ 
      success: true, 
      message: 'Tokens renovados com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.initService = initService;
module.exports = router;

