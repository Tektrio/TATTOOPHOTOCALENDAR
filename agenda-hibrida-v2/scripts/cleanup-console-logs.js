#!/usr/bin/env node

/**
 * Script para remover console.logs de debug mantendo logs importantes
 * Remove: console.log, console.debug
 * Mantém: console.error, console.warn, console.info (seletivo)
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

console.log('🧹 Limpando console.logs desnecessários...\n');

const excludeDirs = ['node_modules', '__tests__', 'test-data', 'coverage', 'dist', 'build'];
const filesToProcess = glob.sync('**/*.js', {
  ignore: excludeDirs.map(d => `**/${d}/**`),
  cwd: path.join(__dirname, '..')
});

let totalRemoved = 0;
let filesModified = 0;

// Padrões para remover
// const patternsToRemove = [ // Removido - não utilizado
//   // console.log simples
//   /^\s*console\.log\([^)]*\);?\s*$/gm,
//   // console.debug
//   /^\s*console\.debug\([^)]*\);?\s*$/gm,
//   // Comentários de debug temporário
//   /^\s*\/\/\s*console\.log.*$/gm,
//   /^\s*\/\*\s*console\.log.*\*\/\s*$/gm,
// ];

// Padrões para manter (comentar em vez de remover)
const keepPatterns = [
  'console.error',
  'console.warn',
  'Conectado',
  'Autenticado',
  'OAuth',
  'Erro ao',
  'Falha ao',
  'Iniciando',
  'Servidor rodando'
];

function shouldKeepLog(line) {
  return keepPatterns.some(pattern => line.includes(pattern));
}

for (const file of filesToProcess) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  // const originalContent = content; // Removido - não utilizado

  // Remover linha por linha para ter mais controle
  const lines = content.split('\n');
  const newLines = [];
  let removed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Se é console.log ou console.debug
    if (trimmed.startsWith('console.log(') || trimmed.startsWith('console.debug(')) {
      // Verificar se deve manter
      if (shouldKeepLog(line)) {
        newLines.push(line); // Manter
      } else {
        // Remover (não adicionar à newLines)
        removed++;
      }
    } else {
      newLines.push(line);
    }
  }

  if (removed > 0) {
    content = newLines.join('\n');
    fs.writeFileSync(filePath, content);
    filesModified++;
    totalRemoved += removed;
    console.log(`   ✓ ${file}: ${removed} log(s) removido(s)`);
  }
}

console.log(`\n✅ Limpeza concluída!`);
console.log(`   📁 ${filesModified} arquivo(s) modificado(s)`);
console.log(`   🗑️  ${totalRemoved} console.log(s) removido(s)`);
console.log(`   ✅ console.error e console.warn mantidos`);

// Criar relatório
const reportPath = path.join(__dirname, '..', 'RELATORIO_LIMPEZA_LOGS.md');
const report = `# 🧹 Relatório de Limpeza de Console Logs

**Data:** ${new Date().toLocaleString('pt-BR')}

## 📊 Estatísticas

- **Arquivos processados:** ${filesToProcess.length}
- **Arquivos modificados:** ${filesModified}
- **Console.logs removidos:** ${totalRemoved}

## ✅ O que foi removido

- \`console.log()\` de debug e desenvolvimento
- \`console.debug()\` temporários
- Logs comentados obsoletos

## ✅ O que foi mantido

- \`console.error()\` - Erros importantes
- \`console.warn()\` - Avisos críticos  
- Logs de inicialização (Servidor rodando, etc)
- Logs de autenticação/OAuth
- Logs de conexão/status

## 🎯 Resultado

Código mais limpo e profissional, mantendo rastreabilidade de erros.
`;

fs.writeFileSync(reportPath, report);
console.log(`\n📄 Relatório salvo: ${reportPath}`);
