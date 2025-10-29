/**
 * Validador de configurações de sincronização
 * Valida destinos Google Drive e QNAP antes de salvar
 */

/**
 * Valida configuração de destino Google Drive
 * @param {object} config 
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateGoogleDriveConfig(config) {
  const errors = [];
  
  // Se é destino pendente (aguardando OAuth), não precisa de tokens ainda
  if (config.pending === true) {
    // Destino pendente é válido, tokens virão depois do OAuth
    return {
      valid: true,
      errors: []
    };
  }
  
  // Para destinos ativos, tokens são obrigatórios
  if (!config.tokens) {
    errors.push('Tokens OAuth são obrigatórios');
  } else {
    if (!config.tokens.access_token) {
      errors.push('Access token ausente');
    }
    if (!config.tokens.refresh_token) {
      errors.push('Refresh token ausente');
    }
  }
  
  // Validações opcionais
  if (config.folderId && typeof config.folderId !== 'string') {
    errors.push('folderId deve ser string');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida configuração de destino QNAP
 * @param {object} config 
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateQnapConfig(config) {
  const errors = [];
  
  if (!config.host) {
    errors.push('Host/IP é obrigatório');
  }
  
  if (!config.username) {
    errors.push('Usuário é obrigatório');
  }
  
  if (!config.password) {
    errors.push('Senha é obrigatória');
  }
  
  if (!config.protocol) {
    errors.push('Protocolo é obrigatório');
  } else if (!['webdav', 'ftp'].includes(config.protocol)) {
    errors.push('Protocolo deve ser webdav ou ftp');
  }
  
  if (config.port && (typeof config.port !== 'number' || config.port < 1 || config.port > 65535)) {
    errors.push('Porta deve ser número entre 1 e 65535');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida destino completo baseado no tipo
 * @param {object} destination 
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateDestination(destination) {
  const errors = [];
  
  if (!destination.type) {
    errors.push('Tipo de destino é obrigatório');
    return { valid: false, errors };
  }
  
  if (!['gdrive', 'qnap'].includes(destination.type)) {
    errors.push('Tipo deve ser gdrive ou qnap');
    return { valid: false, errors };
  }
  
  if (!destination.name || destination.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }
  
  if (!destination.config) {
    errors.push('Configuração é obrigatória');
    return { valid: false, errors };
  }
  
  // Valida config específico
  let configValidation;
  if (destination.type === 'gdrive') {
    configValidation = validateGoogleDriveConfig(destination.config);
  } else if (destination.type === 'qnap') {
    configValidation = validateQnapConfig(destination.config);
  }
  
  if (configValidation && !configValidation.valid) {
    errors.push(...configValidation.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida regra de sincronização automática
 * @param {object} rule 
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateSyncRule(rule) {
  const errors = [];
  
  if (!rule.destination_id) {
    errors.push('destination_id é obrigatório');
  }
  
  if (rule.categories && !Array.isArray(rule.categories)) {
    errors.push('categories deve ser array');
  }
  
  if (rule.file_patterns && !Array.isArray(rule.file_patterns)) {
    errors.push('file_patterns deve ser array');
  }
  
  if (rule.min_file_size !== undefined && typeof rule.min_file_size !== 'number') {
    errors.push('min_file_size deve ser número');
  }
  
  if (rule.max_file_size !== undefined && typeof rule.max_file_size !== 'number') {
    errors.push('max_file_size deve ser número');
  }
  
  if (rule.min_file_size && rule.max_file_size && rule.min_file_size > rule.max_file_size) {
    errors.push('min_file_size não pode ser maior que max_file_size');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateGoogleDriveConfig,
  validateQnapConfig,
  validateDestination,
  validateSyncRule
};

