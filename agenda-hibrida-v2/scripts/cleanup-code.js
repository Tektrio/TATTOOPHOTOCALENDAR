#!/usr/bin/env node

/**
 * 🧹 Script de Limpeza de Código
 * 
 * Remove console.logs desnecessários, mantendo apenas os importantes:
 * - console.error (erros críticos)
 * - console.warn (avisos de sistema)
 * - Logs explicitamente marcados como importantes
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// ============================================
// CONFIGURAÇÕES
// ============================================

const ROOT_DIR = path.join(__dirname, '..');

const PATTERNS_TO_CLEAN = [
  '**/*.js',
  '!node_modules/**',
  '!dist/**',
  '!build/**',
  '!scripts/cleanup-code.js' // Não processar a si mesmo
];

// Padrões de console.log que devem ser MANTIDOS
const KEEP_PATTERNS = [
  /console\.(error|warn)/,  // Manter errors e warnings
  /\/\/\s*KEEP:/,           // Comentário explícito para manter
  /logger\./,               // Winston logger
  /log\.error/,
  /log\.warn/
];

// Padrões de console.log que devem ser REMOVIDOS
// const REMOVE_PATTERNS = [ // Removido - não utilizado
//   /console\.log\([^)]*\);?\s*$/gm,     // console.log simples
//   /console\.info\([^)]*\);?\s*$/gm,    // console.info
//   /console\.debug\([^)]*\);?\s*$/gm,   // console.debug
// ];

// ============================================
// FUNÇÕES
// ============================================

/**
 * Verificar se uma linha deve ser mantida
 */
function shouldKeepLine(line) {
  // Se a linha corresponde a algum padrão de manter, mantém
  for (const pattern of KEEP_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }
  
  // Se não é um console.log, mantém
  if (!/console\.(log|info|debug)/.test(line)) {
    return true;
  }
  
  // Linhas curtas são provavelmente importantes (console.log('🚀 Server started'))
  if (line.includes('🚀') || line.includes('✅') || line.includes('⚡')) {
    return true;
  }
  
  return false;
}

/**
 * Limpar um arquivo
 */
async function cleanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    let removedCount = 0;
    const cleanedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Se deve manter a linha, adiciona
      if (shouldKeepLine(line)) {
        cleanedLines.push(line);
      } else {
        // Verifica se é realmente um console.log para remover
        if (/console\.(log|info|debug)/.test(line)) {
          console.log(`  Removido: ${filePath}:${i + 1}`);
          removedCount++;
          // Não adiciona a linha (remove)
        } else {
          cleanedLines.push(line);
        }
      }
    }
    
    if (removedCount > 0) {
      const cleanedContent = cleanedLines.join('\n');
      await fs.writeFile(filePath, cleanedContent, 'utf8');
      return removedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Limpar todos os arquivos
 */
async function cleanAllFiles() {
  console.log('🧹 Iniciando limpeza de código...\n');
  
  const files = glob.sync(PATTERNS_TO_CLEAN, {
    cwd: ROOT_DIR,
    absolute: true,
    nodir: true
  });
  
  console.log(`📁 Encontrados ${files.length} arquivos para verificar\n`);
  
  let totalRemoved = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const removed = await cleanFile(file);
    if (removed > 0) {
      totalRemoved += removed;
      filesChanged++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Limpeza concluída!`);
  console.log(`   Arquivos processados: ${files.length}`);
  console.log(`   Arquivos modificados: ${filesChanged}`);
  console.log(`   Console.logs removidos: ${totalRemoved}\n`);
}

// ============================================
// EXECUTAR
// ============================================

if (require.main === module) {
  cleanAllFiles().catch(error => {
    console.error('❌ Erro na limpeza:', error);
    process.exit(1);
  });
}

module.exports = { cleanFile, shouldKeepLine };

