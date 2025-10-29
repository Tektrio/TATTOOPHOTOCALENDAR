const crypto = require('crypto');
const fs = require('fs-extra');

/**
 * Calcula MD5 hash de um arquivo
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {Promise<string>} Hash MD5 em hexadecimal
 */
async function calculateMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Verifica se dois arquivos têm o mesmo hash
 * @param {string} filePath1 
 * @param {string} filePath2 
 * @returns {Promise<boolean>}
 */
async function compareFiles(filePath1, filePath2) {
  const [hash1, hash2] = await Promise.all([
    calculateMD5(filePath1),
    calculateMD5(filePath2)
  ]);
  return hash1 === hash2;
}

module.exports = {
  calculateMD5,
  compareFiles
};

