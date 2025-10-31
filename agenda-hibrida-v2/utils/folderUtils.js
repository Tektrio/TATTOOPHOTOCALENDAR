const fs = require('fs-extra');
const path = require('path');

/**
 * Gerar slug do nome do cliente
 * Converte para minúsculas, remove acentos e caracteres especiais
 * @param {string} name - Nome do cliente
 * @returns {string} - Nome em formato slug
 */
function generateNameSlug(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome inválido para gerar slug');
  }

  return name
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}

/**
 * Validar e formatar telefone
 * Remove caracteres não numéricos e valida quantidade de dígitos
 * @param {string} phone - Telefone com ou sem formatação
 * @returns {string} - Telefone apenas com dígitos
 */
function formatPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Telefone inválido');
  }

  const clean = phone.replace(/\D/g, '');
  
  if (clean.length < 10 || clean.length > 11) {
    throw new Error('Telefone inválido (deve ter 10-11 dígitos)');
  }
  
  return clean;
}

/**
 * Formatar ID com 5 dígitos (zero-padding)
 * @param {number} id - ID numérico
 * @returns {string} - ID formatado com 5 dígitos
 */
function formatClientId(id) {
  if (typeof id !== 'number' && typeof id !== 'string') {
    throw new Error('ID inválido para formatação');
  }
  
  return String(id).padStart(5, '0');
}

/**
 * Gerar nome completo da pasta do cliente
 * @param {string} name - Nome do cliente
 * @param {string} phone - Telefone do cliente
 * @param {number|null} id - ID do cliente (null para pasta temporária)
 * @returns {string} - Nome da pasta
 */
function generateFolderName(name, phone, id = null) {
  const slug = generateNameSlug(name);
  const phoneClean = formatPhone(phone);
  
  if (id !== null) {
    const idFormatted = formatClientId(id);
    return `Cliente_${slug}_${phoneClean}_${idFormatted}`;
  }
  
  return `Cliente_${slug}_${phoneClean}_temp`;
}

/**
 * Detectar e resolver colisão de pasta
 * Adiciona sufixo incremental se pasta já existir
 * @param {string} basePath - Caminho base
 * @param {string} folderName - Nome da pasta
 * @returns {Promise<string>} - Nome final da pasta (possivelmente com sufixo)
 */
async function handleFolderCollision(basePath, folderName) {
  let counter = 1;
  let finalName = folderName;
  
  while (await fs.pathExists(path.join(basePath, finalName))) {
    finalName = `${folderName}_${counter}`;
    counter++;
    
    // Proteção contra loop infinito
    if (counter > 100) {
      throw new Error('Muitas colisões de pasta detectadas');
    }
  }
  
  return finalName;
}

/**
 * Criar arquivo de lock para evitar race conditions
 * @param {string} folderPath - Caminho da pasta
 * @returns {Promise<string>} - Caminho do lockfile
 */
async function createLockfile(folderPath) {
  try {
    // Garante que o diretório pai existe
    await fs.ensureDir(folderPath);
    
    const lockPath = path.join(folderPath, '.creating');
    const lockData = JSON.stringify({
      timestamp: Date.now(),
      pid: process.pid
    });
    
    await fs.writeFile(lockPath, lockData);
    return lockPath;
  } catch (error) {
    console.error('Erro ao criar lockfile:', error);
    throw new Error('Falha ao criar lockfile: ' + error.message);
  }
}

/**
 * Remover arquivo de lock
 * @param {string} lockPath - Caminho do lockfile
 */
async function removeLockfile(lockPath) {
  try {
    if (await fs.pathExists(lockPath)) {
      await fs.remove(lockPath);
    }
  } catch (error) {
    console.error('Erro ao remover lockfile:', error);
    // Não propaga o erro pois não é crítico
  }
}

/**
 * Verificar se pasta está sendo criada (tem lockfile)
 * @param {string} folderPath - Caminho da pasta
 * @returns {Promise<boolean>}
 */
async function isLocked(folderPath) {
  const lockPath = path.join(folderPath, '.creating');
  
  if (!await fs.pathExists(lockPath)) {
    return false;
  }
  
  try {
    const lockData = await fs.readFile(lockPath, 'utf8');
    const lock = JSON.parse(lockData);
    
    // Se lock tem mais de 5 minutos, considerar expirado
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (lock.timestamp < fiveMinutesAgo) {
      await removeLockfile(lockPath);
      return false;
    }
    
    return true;
  } catch (error) {
    // Se não conseguir ler o lock, considerar não locked
    return false;
  }
}

/**
 * Sanitizar nome de arquivo para evitar path traversal
 * @param {string} filename - Nome do arquivo
 * @returns {string} - Nome sanitizado
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Nome de arquivo inválido');
  }
  
  return filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\]/g, '') // Remove / e \
    .replace(/[<>:"|?*]/g, '') // Remove caracteres proibidos no Windows
    .trim();
}

module.exports = {
  generateNameSlug,
  formatPhone,
  formatClientId,
  generateFolderName,
  handleFolderCollision,
  createLockfile,
  removeLockfile,
  isLocked,
  sanitizeFilename
};

