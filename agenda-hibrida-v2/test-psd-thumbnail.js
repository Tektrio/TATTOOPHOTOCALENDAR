#!/usr/bin/env node

/**
 * Script para testar se um arquivo PSD tem thumbnail embutido
 * 
 * USO:
 *   node test-psd-thumbnail.js /caminho/para/arquivo.psd
 * 
 * O script vai informar se o PSD tem thumbnail embutido ou não.
 */

const fs = require('fs');
const { readPsd } = require('ag-psd');
const path = require('path');

// Verificar argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('');
  console.log('❌ Uso incorreto!');
  console.log('');
  console.log('📖 Como usar:');
  console.log('   node test-psd-thumbnail.js /caminho/para/arquivo.psd');
  console.log('');
  console.log('📝 Exemplo:');
  console.log('   node test-psd-thumbnail.js ~/Downloads/meu-arquivo.psd');
  console.log('');
  process.exit(1);
}

const psdPath = args[0];

// Verificar se arquivo existe
if (!fs.existsSync(psdPath)) {
  console.log('');
  console.log('❌ Arquivo não encontrado:', psdPath);
  console.log('');
  process.exit(1);
}

// Verificar se é .psd
const ext = path.extname(psdPath).toLowerCase();
if (ext !== '.psd') {
  console.log('');
  console.log('⚠️ Aviso: Este arquivo não tem extensão .psd');
  console.log('   Extensão encontrada:', ext);
  console.log('');
}

console.log('');
console.log('🔍 Analisando arquivo PSD...');
console.log('📁 Arquivo:', path.basename(psdPath));

// Obter tamanho do arquivo
const stats = fs.statSync(psdPath);
const fileSizeGB = (stats.size / 1024 / 1024 / 1024).toFixed(2);
const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
const displaySize = stats.size > 1024 * 1024 * 1024 ? `${fileSizeGB} GB` : `${fileSizeMB} MB`;
console.log('📊 Tamanho:', displaySize);
console.log('');

try {
  // Ler arquivo
  console.log('📖 Lendo arquivo PSD...');
  const psdBuffer = fs.readFileSync(psdPath);
  
  // Parse PSD sem carregar imagem completa
  console.log('🔍 Analisando estrutura do PSD...');
  const psd = readPsd(psdBuffer, {
    skipCompositeImageData: true,
    skipLayerImageData: true,
    skipThumbnail: false,
    skipLayerThumbnails: true
  });
  
  console.log('');
  console.log('📋 Informações do PSD:');
  console.log('   • Largura:', psd.width, 'px');
  console.log('   • Altura:', psd.height, 'px');
  console.log('   • Canais:', psd.channels);
  console.log('   • Profundidade:', psd.bitsPerChannel, 'bits');
  console.log('');
  
  // Verificar thumbnail
  if (psd.thumbnail && psd.thumbnail.data) {
    console.log('✅ ✅ ✅ SUCESSO! ✅ ✅ ✅');
    console.log('');
    console.log('🎉 Este PSD TEM thumbnail embutido!');
    console.log('');
    console.log('📐 Dimensões do thumbnail:', psd.thumbnail.width, 'x', psd.thumbnail.height, 'px');
    console.log('');
    console.log('✅ Este arquivo vai gerar thumbnails RAPIDAMENTE no sistema!');
    console.log('✅ Tamanho do thumbnail:', (psd.thumbnail.data.length / 1024).toFixed(2), 'KB');
    console.log('');
    console.log('🚀 Pode fazer upload tranquilamente!');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ ⚠️ ❌ PROBLEMA ENCONTRADO ❌ ⚠️ ❌');
    console.log('');
    console.log('⚠️ Este PSD NÃO tem thumbnail embutido!');
    console.log('');
    console.log('📝 Para corrigir:');
    console.log('');
    console.log('   1. Abra o arquivo no Photoshop');
    console.log('   2. Vá em: Arquivo → Salvar Como...');
    console.log('   3. ☑️ MARQUE "Maximizar Compatibilidade"');
    console.log('   4. Salve o arquivo');
    console.log('   5. Execute este script novamente para verificar');
    console.log('');
    console.log('⚠️ Sem o thumbnail embutido, o sistema vai mostrar apenas');
    console.log('   um ícone genérico de PSD.');
    console.log('');
    process.exit(1);
  }
  
} catch (error) {
  console.log('');
  console.log('❌ Erro ao analisar o arquivo:');
  console.log('   ', error.message);
  console.log('');
  
  if (error.message.includes('Invalid')) {
    console.log('⚠️ O arquivo pode estar corrompido ou não ser um PSD válido.');
  }
  
  console.log('');
  process.exit(1);
}

