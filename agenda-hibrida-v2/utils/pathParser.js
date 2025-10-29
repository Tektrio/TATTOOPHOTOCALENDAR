const path = require('path');

/**
 * Extrai informações de cliente e categoria do caminho do arquivo
 * Estrutura esperada: /base_path/[ClienteName]/[category]/file.ext
 * 
 * @param {string} filePath - Caminho completo do arquivo
 * @param {string} basePath - Caminho base configurado
 * @returns {object} Objeto com clientFolder, category, fileName, relativePath
 */
function parseFilePath(filePath, basePath) {
  const relative = path.relative(basePath, filePath);
  const parts = relative.split(path.sep);
  
  return {
    clientFolder: parts[0] || null,
    category: parts.length > 1 ? parts[1] : 'outros',
    fileName: parts[parts.length - 1],
    relativePath: relative,
    depth: parts.length
  };
}

/**
 * Identifica ID do cliente pelo nome da pasta
 * Busca por nome similar ignorando espaços e case
 * 
 * @param {object} db - Instância do banco de dados SQLite
 * @param {string} folderName - Nome da pasta do cliente
 * @returns {Promise<number|null>} ID do cliente ou null
 */
async function identifyClientFromFolderName(db, folderName) {
  if (!folderName) return null;
  
  // Remove espaços e converte para lowercase para comparação
  const normalizedFolder = folderName.replace(/\s+/g, '').toLowerCase();
  
  const query = `
    SELECT id, name FROM clients 
    WHERE LOWER(REPLACE(name, ' ', '')) = ?
    LIMIT 1
  `;
  
  return new Promise((resolve, reject) => {
    db.get(query, [normalizedFolder], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.id : null);
      }
    });
  });
}

/**
 * Valida se um caminho está dentro do base_path configurado
 * @param {string} filePath 
 * @param {string} basePath 
 * @returns {boolean}
 */
function isPathInBase(filePath, basePath) {
  const relative = path.relative(basePath, filePath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Categoriza arquivo por extensão
 * @param {string} fileName 
 * @returns {string} Categoria sugerida
 */
function categorizeByExtension(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const categories = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    designs: ['.psd', '.ai', '.sketch', '.fig', '.xd'],
    documents: ['.pdf', '.doc', '.docx', '.txt'],
    videos: ['.mp4', '.mov', '.avi', '.mkv'],
    other: []
  };
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return 'outros';
}

module.exports = {
  parseFilePath,
  identifyClientFromFolderName,
  isPathInBase,
  categorizeByExtension
};

