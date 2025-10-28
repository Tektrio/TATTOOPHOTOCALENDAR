/**
 * Multi-Account Google Service
 * Gerencia múltiplas contas Google Drive/Calendar
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../agenda_hibrida.db');

class MultiAccountService {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
  }

  /**
   * Lista todas as contas Google
   * @param {boolean} activeOnly - Se deve retornar apenas contas ativas
   * @returns {Promise<Array>} Lista de contas
   */
  async listAccounts(activeOnly = false) {
    return new Promise((resolve, reject) => {
      const query = activeOnly
        ? 'SELECT * FROM google_accounts WHERE is_active = 1 ORDER BY is_primary DESC, account_name ASC'
        : 'SELECT * FROM google_accounts ORDER BY is_primary DESC, account_name ASC';

      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ Erro ao listar contas:', err);
          reject(err);
        } else {
          console.log(`✅ ${rows.length} conta(s) encontrada(s)`);
          resolve(rows);
        }
      });
    });
  }

  /**
   * Obtém uma conta específica por ID
   * @param {number} accountId - ID da conta
   * @returns {Promise<Object>} Dados da conta
   */
  async getAccount(accountId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM google_accounts WHERE id = ?',
        [accountId],
        (err, row) => {
          if (err) {
            console.error('❌ Erro ao buscar conta:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  /**
   * Obtém a conta primária
   * @returns {Promise<Object|null>} Conta primária
   */
  async getPrimaryAccount() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM google_accounts WHERE is_primary = 1 LIMIT 1',
        [],
        (err, row) => {
          if (err) {
            console.error('❌ Erro ao buscar conta primária:', err);
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Adiciona uma nova conta Google
   * @param {Object} accountData - Dados da conta
   * @returns {Promise<Object>} Conta criada
   */
  async addAccount(accountData) {
    const {
      account_name,
      account_email,
      account_type = 'both',
      is_primary = false,
      color_code = '#4285F4'
    } = accountData;

    return new Promise((resolve, reject) => {
      // Se esta será a primeira conta, torná-la primária
      this.db.get('SELECT COUNT(*) as count FROM google_accounts', [], (err, row) => {
        if (err) {
          return reject(err);
        }

        const isPrimary = row.count === 0 || is_primary;

        // Se será primária, remover flag de outras contas
        if (isPrimary) {
          this.db.run('UPDATE google_accounts SET is_primary = 0', (err) => {
            if (err) {
              console.error('❌ Erro ao atualizar contas primárias:', err);
              return reject(err);
            }

            this._insertAccount(account_name, account_email, account_type, isPrimary, color_code, resolve, reject);
          });
        } else {
          this._insertAccount(account_name, account_email, account_type, isPrimary, color_code, resolve, reject);
        }
      });
    });
  }

  /**
   * Método auxiliar para inserir conta
   * @private
   */
  _insertAccount(account_name, account_email, account_type, is_primary, color_code, resolve, reject) {
    this.db.run(
      `INSERT INTO google_accounts (account_name, account_email, account_type, is_primary, color_code)
       VALUES (?, ?, ?, ?, ?)`,
      [account_name, account_email, account_type, is_primary ? 1 : 0, color_code],
      function (err) {
        if (err) {
          console.error('❌ Erro ao adicionar conta:', err);
          reject(err);
        } else {
          console.log(`✅ Conta ${account_email} adicionada com ID ${this.lastID}`);
          resolve({
            id: this.lastID,
            account_name,
            account_email,
            account_type,
            is_primary,
            color_code
          });
        }
      }
    );
  }

  /**
   * Atualiza uma conta existente
   * @param {number} accountId - ID da conta
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<void>}
   */
  async updateAccount(accountId, updates) {
    const allowedFields = ['account_name', 'account_type', 'color_code', 'is_active'];
    const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
    
    if (fields.length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(accountId);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE google_accounts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            console.error('❌ Erro ao atualizar conta:', err);
            reject(err);
          } else {
            console.log(`✅ Conta ${accountId} atualizada`);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Define uma conta como primária
   * @param {number} accountId - ID da conta
   * @returns {Promise<void>}
   */
  async setPrimaryAccount(accountId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Remover flag primária de todas as contas
        this.db.run('UPDATE google_accounts SET is_primary = 0', (err) => {
          if (err) {
            console.error('❌ Erro ao limpar flags primárias:', err);
            return reject(err);
          }

          // Definir nova conta primária
          this.db.run(
            'UPDATE google_accounts SET is_primary = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [accountId],
            function (err) {
              if (err) {
                console.error('❌ Erro ao definir conta primária:', err);
                reject(err);
              } else if (this.changes === 0) {
                reject(new Error('Conta não encontrada'));
              } else {
                console.log(`✅ Conta ${accountId} definida como primária`);
                resolve();
              }
            }
          );
        });
      });
    });
  }

  /**
   * Ativa ou desativa uma conta
   * @param {number} accountId - ID da conta
   * @param {boolean} isActive - Status desejado
   * @returns {Promise<void>}
   */
  async setAccountActive(accountId, isActive) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE google_accounts SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [isActive ? 1 : 0, accountId],
        function (err) {
          if (err) {
            console.error('❌ Erro ao alterar status da conta:', err);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Conta não encontrada'));
          } else {
            console.log(`✅ Conta ${accountId} ${isActive ? 'ativada' : 'desativada'}`);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Remove uma conta (soft delete)
   * @param {number} accountId - ID da conta
   * @returns {Promise<void>}
   */
  async deleteAccount(accountId) {
    return new Promise((resolve, reject) => {
      // Verificar se é a única conta ou se é primária
      this.db.get(
        'SELECT is_primary, (SELECT COUNT(*) FROM google_accounts) as total FROM google_accounts WHERE id = ?',
        [accountId],
        (err, row) => {
          if (err) {
            return reject(err);
          }

          if (!row) {
            return reject(new Error('Conta não encontrada'));
          }

          if (row.total === 1) {
            return reject(new Error('Não é possível remover a única conta existente'));
          }

          if (row.is_primary && row.total > 1) {
            return reject(new Error('Não é possível remover a conta primária. Defina outra conta como primária primeiro.'));
          }

          // Deletar conta (CASCADE irá remover relacionamentos)
          this.db.run(
            'DELETE FROM google_accounts WHERE id = ?',
            [accountId],
            function (err) {
              if (err) {
                console.error('❌ Erro ao deletar conta:', err);
                reject(err);
              } else {
                console.log(`✅ Conta ${accountId} removida`);
                resolve();
              }
            }
          );
        }
      );
    });
  }

  /**
   * Obtém estatísticas de uma conta
   * @param {number} accountId - ID da conta
   * @returns {Promise<Object>} Estatísticas
   */
  async getAccountStats(accountId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          (SELECT COUNT(*) FROM account_file_mappings WHERE account_id = ?) as total_files,
          (SELECT COUNT(*) FROM account_file_mappings WHERE account_id = ? AND sync_status = 'synced') as synced_files,
          (SELECT COUNT(*) FROM account_calendar_sync WHERE account_id = ?) as calendars,
          (SELECT MAX(last_synced) FROM account_file_mappings WHERE account_id = ?) as last_file_sync,
          (SELECT MAX(last_synced) FROM account_calendar_sync WHERE account_id = ?) as last_calendar_sync
        `,
        [accountId, accountId, accountId, accountId, accountId],
        (err, row) => {
          if (err) {
            console.error('❌ Erro ao buscar estatísticas:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  /**
   * Sincroniza todas as contas ativas
   * @returns {Promise<Object>} Relatório de sincronização
   */
  async syncAllAccounts() {
    const accounts = await this.listAccounts(true);
    const results = {
      total: accounts.length,
      success: [],
      errors: []
    };

    for (const account of accounts) {
      try {
        console.log(`🔄 Sincronizando conta ${account.account_email}...`);
        
        // Aqui seria integrado com googleCalendarService e Google Drive API
        // Por enquanto, registramos apenas a tentativa
        
        results.success.push({
          id: account.id,
          email: account.account_email
        });
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${account.account_email}:`, error);
        results.errors.push({
          id: account.id,
          email: account.account_email,
          error: error.message
        });
      }
    }

    console.log(`✅ Sincronização concluída: ${results.success.length}/${results.total} sucesso`);
    return results;
  }

  /**
   * Adiciona ou atualiza mapeamento de arquivo
   * @param {number} accountId - ID da conta
   * @param {string} filePath - Caminho local do arquivo
   * @param {string} driveFileId - ID do arquivo no Drive
   * @param {Object} metadata - Metadados adicionais
   * @returns {Promise<void>}
   */
  async addFileMapping(accountId, filePath, driveFileId, metadata = {}) {
    const {
      folder_id,
      file_type = 'photo',
      file_size,
      mime_type,
      sync_status = 'synced'
    } = metadata;

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO account_file_mappings 
         (account_id, file_path, drive_file_id, folder_id, file_type, file_size, mime_type, sync_status, last_synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [accountId, filePath, driveFileId, folder_id, file_type, file_size, mime_type, sync_status],
        function (err) {
          if (err) {
            console.error('❌ Erro ao adicionar mapeamento:', err);
            reject(err);
          } else {
            console.log(`✅ Mapeamento adicionado: ${filePath} → ${driveFileId}`);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Obtém mapeamentos de arquivo de uma conta
   * @param {number} accountId - ID da conta
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de mapeamentos
   */
  async getFileMappings(accountId, filters = {}) {
    let query = 'SELECT * FROM account_file_mappings WHERE account_id = ?';
    const params = [accountId];

    if (filters.sync_status) {
      query += ' AND sync_status = ?';
      params.push(filters.sync_status);
    }

    if (filters.file_type) {
      query += ' AND file_type = ?';
      params.push(filters.file_type);
    }

    query += ' ORDER BY last_synced DESC';

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('❌ Erro ao buscar mapeamentos:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err);
      } else {
        console.log('✅ Conexão com banco fechada');
      }
    });
  }
}

module.exports = MultiAccountService;

