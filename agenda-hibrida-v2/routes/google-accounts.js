/**
 * Rotas API para gerenciamento de contas Google
 * CRUD completo para múltiplas contas Drive/Calendar
 */

const express = require('express');
const router = express.Router();
const MultiAccountService = require('../services/multiAccountService');

/**
 * GET /api/google/accounts
 * Lista todas as contas Google
 */
router.get('/', async (req, res) => {
  const service = new MultiAccountService();
  
  try {
    const activeOnly = req.query.active === 'true';
    const accounts = await service.listAccounts(activeOnly);
    
    // Buscar estatísticas de cada conta
    const accountsWithStats = await Promise.all(
      accounts.map(async (account) => {
        const stats = await service.getAccountStats(account.id);
        return {
          ...account,
          stats
        };
      })
    );
    
    res.json({
      success: true,
      accounts: accountsWithStats,
      count: accountsWithStats.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar contas Google',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * GET /api/google/accounts/:id
 * Obtém uma conta específica
 */
router.get('/:id', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    const account = await service.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta não encontrada'
      });
    }
    
    const stats = await service.getAccountStats(accountId);
    const fileMappings = await service.getFileMappings(accountId);
    
    res.json({
      success: true,
      account: {
        ...account,
        stats,
        recent_files: fileMappings.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar conta',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * GET /api/google/accounts/primary
 * Obtém a conta primária
 */
router.get('/primary/info', async (req, res) => {
  const service = new MultiAccountService();
  
  try {
    const account = await service.getPrimaryAccount();
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma conta primária encontrada'
      });
    }
    
    const stats = await service.getAccountStats(account.id);
    
    res.json({
      success: true,
      account: {
        ...account,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar conta primária:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar conta primária',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * POST /api/google/accounts
 * Adiciona uma nova conta Google
 */
router.post('/', async (req, res) => {
  const service = new MultiAccountService();
  
  try {
    const { account_name, account_email, account_type, is_primary, color_code } = req.body;
    
    // Validações
    if (!account_name || !account_email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email da conta são obrigatórios'
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account_email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }
    
    // Validar tipo de conta
    const validTypes = ['drive', 'calendar', 'both'];
    if (account_type && !validTypes.includes(account_type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de conta inválido. Use: drive, calendar ou both'
      });
    }
    
    const newAccount = await service.addAccount({
      account_name,
      account_email,
      account_type: account_type || 'both',
      is_primary: is_primary || false,
      color_code: color_code || '#4285F4'
    });
    
    res.status(201).json({
      success: true,
      message: 'Conta adicionada com sucesso',
      account: newAccount
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar conta:', error);
    
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma conta com este email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar conta',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * PUT /api/google/accounts/:id
 * Atualiza uma conta existente
 */
router.put('/:id', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    const updates = req.body;
    
    // Remover campos não permitidos
    delete updates.id;
    delete updates.account_email; // Email não pode ser alterado
    delete updates.created_at;
    delete updates.updated_at;
    
    await service.updateAccount(accountId, updates);
    
    const updatedAccount = await service.getAccount(accountId);
    
    res.json({
      success: true,
      message: 'Conta atualizada com sucesso',
      account: updatedAccount
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar conta',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * PUT /api/google/accounts/:id/activate
 * Ativa ou desativa uma conta
 */
router.put('/:id/activate', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'O campo is_active deve ser true ou false'
      });
    }
    
    await service.setAccountActive(accountId, is_active);
    
    res.json({
      success: true,
      message: `Conta ${is_active ? 'ativada' : 'desativada'} com sucesso`
    });
  } catch (error) {
    console.error('❌ Erro ao alterar status da conta:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * PUT /api/google/accounts/:id/set-primary
 * Define uma conta como primária
 */
router.put('/:id/set-primary', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    await service.setPrimaryAccount(accountId);
    
    res.json({
      success: true,
      message: 'Conta definida como primária com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao definir conta primária:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * DELETE /api/google/accounts/:id
 * Remove uma conta
 */
router.delete('/:id', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    await service.deleteAccount(accountId);
    
    res.json({
      success: true,
      message: 'Conta removida com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao remover conta:', error);
    
    if (error.message.includes('primária')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao remover conta',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * POST /api/google/accounts/sync-all
 * Sincroniza todas as contas ativas
 */
router.post('/sync-all', async (req, res) => {
  const service = new MultiAccountService();
  
  try {
    const results = await service.syncAllAccounts();
    
    res.json({
      success: true,
      message: `Sincronização concluída: ${results.success.length}/${results.total} contas`,
      results
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar contas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao sincronizar contas',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * GET /api/google/accounts/:id/files
 * Lista arquivos mapeados de uma conta
 */
router.get('/:id/files', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    const filters = {
      sync_status: req.query.sync_status,
      file_type: req.query.file_type
    };
    
    const files = await service.getFileMappings(accountId, filters);
    
    res.json({
      success: true,
      files,
      count: files.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar arquivos',
      error: error.message
    });
  } finally {
    service.close();
  }
});

/**
 * POST /api/google/accounts/:id/files
 * Adiciona mapeamento de arquivo
 */
router.post('/:id/files', async (req, res) => {
  const service = new MultiAccountService();
  const accountId = parseInt(req.params.id);
  
  try {
    const { file_path, drive_file_id, folder_id, file_type, file_size, mime_type } = req.body;
    
    if (!file_path || !drive_file_id) {
      return res.status(400).json({
        success: false,
        message: 'file_path e drive_file_id são obrigatórios'
      });
    }
    
    await service.addFileMapping(accountId, file_path, drive_file_id, {
      folder_id,
      file_type,
      file_size,
      mime_type
    });
    
    res.status(201).json({
      success: true,
      message: 'Mapeamento de arquivo adicionado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar mapeamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar mapeamento de arquivo',
      error: error.message
    });
  } finally {
    service.close();
  }
});

module.exports = router;

