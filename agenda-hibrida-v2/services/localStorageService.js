const fs = require('fs-extra');
const path = require('path');
const { calculateMD5 } = require('../utils/fileHasher');
const { parseFilePath, identifyClientFromFolderName, isPathInBase } = require('../utils/pathParser');

/**
 * Serviço de gerenciamento de armazenamento local
 * Indexa e monitora arquivos em pasta local
 */
class LocalStorageService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Valida se um caminho existe e retorna informações
   * @param {string} pathToValidate - Caminho a validar
   * @returns {Promise<object>}
   */
  async validatePath(pathToValidate) {
    try {
      const exists = await fs.pathExists(pathToValidate);
      
      if (!exists) {
        return {
          valid: false,
          exists: false,
          isDirectory: false,
          message: 'Caminho não existe',
          readable: false,
          fileCount: 0
        };
      }

      const stats = await fs.stat(pathToValidate);
      const isDirectory = stats.isDirectory();
      
      if (!isDirectory) {
        return {
          valid: false,
          exists: true,
          isDirectory: false,
          message: 'Caminho deve ser um diretório, não um arquivo',
          readable: false,
          fileCount: 0
        };
      }

      // Tenta ler o diretório para verificar permissões
      let readable = true;
      let fileCount = 0;
      try {
        const items = await fs.readdir(pathToValidate);
        fileCount = items.filter(item => !item.startsWith('.')).length;
      } catch (error) {
        readable = false;
      }

      return {
        valid: readable,
        exists: true,
        isDirectory: true,
        message: readable ? 'Caminho válido e acessível' : 'Sem permissão de leitura',
        readable,
        fileCount
      };
    } catch (error) {
      return {
        valid: false,
        exists: false,
        isDirectory: false,
        message: `Erro ao validar: ${error.message}`,
        readable: false,
        fileCount: 0
      };
    }
  }

  /**
   * Configura pasta base de armazenamento local
   * @param {string} basePath - Caminho absoluto da pasta
   * @returns {Promise<object>}
   */
  async configure(basePath) {
    // Valida se o caminho existe
    if (!await fs.pathExists(basePath)) {
      throw new Error('Caminho não existe');
    }

    // Valida se é um diretório
    const stats = await fs.stat(basePath);
    if (!stats.isDirectory()) {
      throw new Error('Caminho deve ser um diretório');
    }

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO local_storage_config (id, base_path, enabled, last_scan) 
         VALUES (1, ?, 1, NULL)`,
        [basePath],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, basePath });
          }
        }
      );
    });
  }

  /**
   * Obtém configuração atual
   * @returns {Promise<object|null>}
   */
  async getConfig() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM local_storage_config WHERE id = 1',
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Indexa arquivo individual no banco de dados
   * @private
   * @param {string} filePath - Caminho completo do arquivo
   * @param {string} basePath - Caminho base configurado
   * @returns {Promise<object>}
   */
  async _indexFile(filePath, basePath) {
    try {
      const stat = await fs.stat(filePath);
      const hash = await calculateMD5(filePath);
      const parsed = parseFilePath(filePath, basePath);
      const clientId = await identifyClientFromFolderName(this.db, parsed.clientFolder);

      return new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR REPLACE INTO local_files 
           (file_path, file_name, file_size, file_type, category, md5_hash, last_modified, client_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            filePath,
            parsed.fileName,
            stat.size,
            path.extname(filePath),
            parsed.category,
            hash,
            stat.mtime.toISOString(),
            clientId
          ],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ 
                id: this.lastID, 
                filePath, 
                fileName: parsed.fileName,
                clientId 
              });
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Erro ao indexar ${filePath}: ${error.message}`);
    }
  }

  /**
   * Escaneia recursivamente diretórios
   * @private
   * @param {string} dir - Diretório a escanear
   * @param {string} basePath - Caminho base
   * @param {string[]} fileList - Lista acumuladora de arquivos
   * @returns {Promise<string[]>}
   */
  async _recursiveScan(dir, basePath, fileList = []) {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      // Ignora arquivos/pastas ocultas
      if (item.startsWith('.')) continue;
      
      const fullPath = path.join(dir, item);
      
      try {
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await this._recursiveScan(fullPath, basePath, fileList);
        } else if (stat.isFile()) {
          fileList.push(fullPath);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao acessar ${fullPath}:`, error.message);
      }
    }
    
    return fileList;
  }

  /**
   * Escaneia pasta e indexa todos os arquivos
   * @returns {Promise<object>} Estatísticas do scan
   */
  async scanDirectory() {
    const config = await this.getConfig();
    if (!config || !config.enabled) {
      throw new Error('Storage local não configurado');
    }

    console.log(`📁 Iniciando scan de: ${config.base_path}`);
    
    const files = await this._recursiveScan(config.base_path, config.base_path);
    const indexed = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this._indexFile(file, config.base_path);
        indexed.push(result);
      } catch (err) {
        console.error(`❌ Erro ao indexar ${file}:`, err.message);
        errors.push({ file, error: err.message });
      }
    }

    // Atualiza data do último scan
    await new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE local_storage_config SET last_scan = CURRENT_TIMESTAMP WHERE id = 1',
        err => err ? reject(err) : resolve()
      );
    });

    console.log(`✅ Scan concluído: ${indexed.length} arquivos indexados`);

    return { 
      scanned: files.length, 
      indexed: indexed.length,
      errors: errors.length,
      errorDetails: errors
    };
  }

  /**
   * Lista arquivos indexados com filtros opcionais
   * @param {object} filters - { clientId, category, search }
   * @returns {Promise<array>}
   */
  async listFiles(filters = {}) {
    let query = `
      SELECT lf.*, c.name as client_name,
        (SELECT COUNT(*) FROM sync_status WHERE local_file_id = lf.id AND status = 'synced') as synced_count,
        (SELECT COUNT(*) FROM sync_destinations WHERE enabled = 1) as total_destinations
      FROM local_files lf
      LEFT JOIN clients c ON lf.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.clientId) {
      query += ' AND lf.client_id = ?';
      params.push(filters.clientId);
    }

    if (filters.category) {
      query += ' AND lf.category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      query += ' AND lf.file_name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY lf.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Obtém arquivo por ID
   * @param {number} fileId 
   * @returns {Promise<object|null>}
   */
  async getFileById(fileId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM local_files WHERE id = ?',
        [fileId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Remove arquivo do índice (não deleta fisicamente)
   * @param {number} fileId 
   * @returns {Promise<object>}
   */
  async removeFromIndex(fileId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM local_files WHERE id = ?',
        [fileId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  }
}

module.exports = LocalStorageService;

