/**
 * Serviço de normalização de telefones
 * Usa libphonenumber-js para normalizar números de telefone
 */

const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

/**
 * Normaliza um número de telefone para formato E.164
 * @param {string} phoneNumber - Número de telefone a ser normalizado
 * @param {string} defaultCountry - País padrão (default: BR)
 * @returns {string|null} - Número normalizado ou null se inválido
 */
function normalizePhone(phoneNumber, defaultCountry = 'BR') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return null;
  }

  try {
    // Remover caracteres não numéricos primeiro
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!cleaned) {
      return null;
    }

    // Tentar parse com país padrão
    const parsed = parsePhoneNumber(cleaned, defaultCountry);
    
    if (parsed && parsed.isValid()) {
      // Retornar formato E.164 (ex: +5511999887766)
      return parsed.number;
    }

    return null;
  } catch (error) {
    console.warn(`Erro ao normalizar telefone ${phoneNumber}:`, error.message);
    return null;
  }
}

/**
 * Valida se um número de telefone é válido
 * @param {string} phoneNumber - Número de telefone
 * @param {string} defaultCountry - País padrão
 * @returns {boolean}
 */
function isPhoneValid(phoneNumber, defaultCountry = 'BR') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  try {
    return isValidPhoneNumber(phoneNumber, defaultCountry);
  } catch (error) {
    return false;
  }
}

/**
 * Formata um número de telefone para exibição
 * @param {string} phoneNumber - Número de telefone
 * @param {string} format - Formato desejado (national ou international)
 * @param {string} defaultCountry - País padrão
 * @returns {string|null}
 */
function formatPhone(phoneNumber, format = 'national', defaultCountry = 'BR') {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return null;
  }

  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    
    if (parsed && parsed.isValid()) {
      return format === 'international' 
        ? parsed.formatInternational()
        : parsed.formatNational();
    }

    return phoneNumber; // Retornar original se não conseguir formatar
  } catch (error) {
    return phoneNumber;
  }
}

/**
 * Normaliza múltiplos números de telefone
 * @param {string[]} phoneNumbers - Array de números
 * @param {string} defaultCountry - País padrão
 * @returns {string[]} - Array de números normalizados (filtra inválidos)
 */
function normalizePhones(phoneNumbers, defaultCountry = 'BR') {
  if (!Array.isArray(phoneNumbers)) {
    return [];
  }

  return phoneNumbers
    .map(phone => normalizePhone(phone, defaultCountry))
    .filter(phone => phone !== null);
}

/**
 * Compara dois números de telefone
 * @param {string} phone1 - Primeiro número
 * @param {string} phone2 - Segundo número
 * @param {string} defaultCountry - País padrão
 * @returns {boolean} - true se são o mesmo número
 */
function comparePhones(phone1, phone2, defaultCountry = 'BR') {
  const normalized1 = normalizePhone(phone1, defaultCountry);
  const normalized2 = normalizePhone(phone2, defaultCountry);
  
  return normalized1 && normalized2 && normalized1 === normalized2;
}

module.exports = {
  normalizePhone,
  isPhoneValid,
  formatPhone,
  normalizePhones,
  comparePhones
};
