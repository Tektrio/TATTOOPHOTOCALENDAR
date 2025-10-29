/**
 * Funções auxiliares para sistema de sincronização
 * Helpers para formatação, cálculos e utilidades gerais
 */

/**
 * Formata timestamp para display
 * @param {string|Date} timestamp 
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Nunca';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formata tamanho de arquivo
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Calcula porcentagem de progresso
 * @param {number} current 
 * @param {number} total 
 * @returns {number} 0-100
 */
export function calculateProgress(current, total) {
  if (!total || total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Obtém classe de cor baseada na porcentagem
 * @param {number} percentage 
 * @returns {string}
 */
export function getProgressColor(percentage) {
  if (percentage >= 100) return 'text-green-500';
  if (percentage >= 75) return 'text-blue-500';
  if (percentage >= 50) return 'text-yellow-500';
  if (percentage >= 25) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Agrupa arquivos por cliente
 * @param {Array} files 
 * @returns {Object}
 */
export function groupFilesByClient(files) {
  return files.reduce((groups, file) => {
    const clientName = file.client_name || 'Sem Cliente';
    if (!groups[clientName]) {
      groups[clientName] = [];
    }
    groups[clientName].push(file);
    return groups;
  }, {});
}

/**
 * Filtra arquivos por categoria
 * @param {Array} files 
 * @param {string} category 
 * @returns {Array}
 */
export function filterByCategory(files, category) {
  if (!category || category === 'all') return files;
  return files.filter(f => f.category === category);
}

/**
 * Filtra arquivos por busca (nome)
 * @param {Array} files 
 * @param {string} search 
 * @returns {Array}
 */
export function filterBySearch(files, search) {
  if (!search || search.trim() === '') return files;
  
  const searchLower = search.toLowerCase();
  return files.filter(f => 
    f.file_name.toLowerCase().includes(searchLower) ||
    (f.client_name && f.client_name.toLowerCase().includes(searchLower))
  );
}

/**
 * Ordena arquivos
 * @param {Array} files 
 * @param {string} sortBy - 'name' | 'date' | 'size'
 * @param {string} sortOrder - 'asc' | 'desc'
 * @returns {Array}
 */
export function sortFiles(files, sortBy = 'date', sortOrder = 'desc') {
  const sorted = [...files].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'name':
        compareValue = a.file_name.localeCompare(b.file_name);
        break;
      case 'size':
        compareValue = (a.file_size || 0) - (b.file_size || 0);
        break;
      case 'date':
      default:
        compareValue = new Date(a.created_at) - new Date(b.created_at);
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  return sorted;
}

/**
 * Valida configuração de destino QNAP
 * @param {Object} config 
 * @returns {Object} { valid, errors }
 */
export function validateQnapConfig(config) {
  const errors = [];

  if (!config.host) errors.push('Host/IP é obrigatório');
  if (!config.username) errors.push('Usuário é obrigatório');
  if (!config.password) errors.push('Senha é obrigatória');
  if (!config.protocol) errors.push('Protocolo é obrigatório');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Gera nome único para cópia de arquivo
 * @param {string} fileName 
 * @returns {string}
 */
export function generateCopyName(fileName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const basename = fileName.replace(/\.[^/.]+$/, '');
  const ext = fileName.match(/\.[^/.]+$/)?.[0] || '';
  return `${basename}_copia_${timestamp}${ext}`;
}

/**
 * Detecta tipo de arquivo por extensão
 * @param {string} fileName 
 * @returns {string} 'image' | 'video' | 'document' | 'other'
 */
export function detectFileType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'psd'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'md'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (docExts.includes(ext)) return 'document';
  
  return 'other';
}

/**
 * Trunca nome de arquivo longo
 * @param {string} fileName 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateFileName(fileName, maxLength = 30) {
  if (fileName.length <= maxLength) return fileName;

  const ext = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.length - ext.length - 1);
  const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
  
  return `${truncated}...${ext}`;
}

/**
 * Retorna mensagem de erro amigável
 * @param {string} errorMessage 
 * @returns {string}
 */
export function getFriendlyErrorMessage(errorMessage) {
  const errorMap = {
    'ECONNREFUSED': 'Não foi possível conectar ao servidor',
    'ETIMEDOUT': 'Conexão expirou - verifique sua rede',
    'ENOTFOUND': 'Servidor não encontrado',
    'invalid_grant': 'Autenticação expirada - reconecte',
    'insufficient_permissions': 'Permissões insuficientes',
    'quota_exceeded': 'Cota de armazenamento excedida'
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }

  return errorMessage;
}

/**
 * Debounce function para inputs
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default {
  formatTimestamp,
  formatFileSize,
  calculateProgress,
  getProgressColor,
  groupFilesByClient,
  filterByCategory,
  filterBySearch,
  sortFiles,
  validateQnapConfig,
  generateCopyName,
  detectFileType,
  truncateFileName,
  getFriendlyErrorMessage,
  debounce
};

