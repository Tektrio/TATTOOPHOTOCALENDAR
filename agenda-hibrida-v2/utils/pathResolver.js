const os = require('os');
const path = require('path');

/**
 * Resolve o caminho correto para a pasta de dados locais
 * Prioridade:
 * 1. CLIENTS_FOLDER do .env (se for caminho absoluto)
 * 2. ~/Documents/Tatto_Photo_CAlendar_Pasta_Local (padrão)
 */
function getClientsFolder() {
  const envPath = process.env.CLIENTS_FOLDER;
  
  // Se tem variável e é caminho absoluto, usar ela
  if (envPath && path.isAbsolute(envPath)) {
    return envPath;
  }
  
  // Caso contrário, usar pasta padrão nos Documentos
  const homeDir = os.homedir();
  return path.join(homeDir, 'Documents', 'Tatto_Photo_CAlendar_Pasta_Local');
}

module.exports = { getClientsFolder };

