/**
 * Sistema de atribuição automática de cores para destinos
 * Google Drive: azul, verde, roxo, ciano (rotação)
 * QNAP: laranja (fixo)
 */

const COLOR_SEQUENCE = ['blue', 'green', 'purple', 'cyan'];

/**
 * Atribui cor baseada no número da conta (1-indexed)
 * @param {number} accountNumber - Número da conta (1, 2, 3, 4...)
 * @returns {string} Nome da cor ('blue', 'green', 'purple', 'cyan')
 */
function assignColor(accountNumber) {
  if (!accountNumber || accountNumber < 1) {
    return 'blue'; // Default
  }
  return COLOR_SEQUENCE[(accountNumber - 1) % COLOR_SEQUENCE.length];
}

/**
 * Retorna próxima cor disponível que não está em uso
 * @param {string[]} usedColors - Array de cores já em uso
 * @returns {string} Próxima cor disponível
 */
function getNextAvailableColor(usedColors = []) {
  for (const color of COLOR_SEQUENCE) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // Se todas estão em uso, retorna baseado no tamanho
  return COLOR_SEQUENCE[usedColors.length % COLOR_SEQUENCE.length];
}

/**
 * Converte cor para configuração visual
 * @param {string} color 
 * @returns {object} Configuração com emoji, classes CSS
 */
function getColorConfig(color) {
  const configs = {
    blue: { emoji: '🔵', bgClass: 'bg-blue-600', textClass: 'text-blue-400', borderClass: 'border-blue-500' },
    green: { emoji: '🟢', bgClass: 'bg-green-600', textClass: 'text-green-400', borderClass: 'border-green-500' },
    purple: { emoji: '🟣', bgClass: 'bg-purple-600', textClass: 'text-purple-400', borderClass: 'border-purple-500' },
    cyan: { emoji: '🔷', bgClass: 'bg-cyan-600', textClass: 'text-cyan-400', borderClass: 'border-cyan-500' },
    orange: { emoji: '🟠', bgClass: 'bg-orange-600', textClass: 'text-orange-400', borderClass: 'border-orange-500' },
    teal: { emoji: '📁', bgClass: 'bg-teal-600', textClass: 'text-teal-400', borderClass: 'border-teal-500' }
  };
  return configs[color] || configs.blue;
}

module.exports = {
  assignColor,
  getNextAvailableColor,
  getColorConfig,
  COLOR_SEQUENCE
};

