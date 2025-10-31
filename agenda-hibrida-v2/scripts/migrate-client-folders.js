const fs = require('fs-extra');
const path = require('path');
// const sqlite3 = require('sqlite3').verbose(); // Removido - não utilizado
const { getClientsFolder } = require('../utils/pathResolver');

async function migrateClientFolders() {
  console.log('🔄 Iniciando migração de pastas de clientes...\n');
  
  const oldPath = path.join(__dirname, '..', 'uploads');
  const newPath = getClientsFolder();
  
  console.log(`📁 Pasta antiga: ${oldPath}`);
  console.log(`📁 Pasta nova: ${newPath}\n`);
  
  // Verificar se pasta antiga existe
  if (!await fs.pathExists(oldPath)) {
    console.log('✅ Nenhuma pasta antiga encontrada. Migração não necessária.');
    return;
  }
  
  // Criar pasta nova se não existir
  await fs.ensureDir(newPath);
  
  // Listar pastas de clientes
  const folders = await fs.readdir(oldPath);
  const clientFolders = folders.filter(f => 
    f.startsWith('Cliente_') || f.startsWith('client_')
  );
  
  if (clientFolders.length === 0) {
    console.log('✅ Nenhuma pasta de cliente encontrada para migrar.');
    return;
  }
  
  console.log(`📦 Encontradas ${clientFolders.length} pastas de clientes para migrar.\n`);
  
  // Migrar cada pasta
  let migrated = 0;
  let skipped = 0;
  
  for (const folder of clientFolders) {
    const oldFolderPath = path.join(oldPath, folder);
    const newFolderPath = path.join(newPath, folder);
    
    try {
      // Verificar se já existe no destino
      if (await fs.pathExists(newFolderPath)) {
        console.log(`⏭️  Pulando ${folder} (já existe no destino)`);
        skipped++;
        continue;
      }
      
      // Mover pasta
      await fs.move(oldFolderPath, newFolderPath, { overwrite: false });
      console.log(`✅ Migrado: ${folder}`);
      migrated++;
    } catch (error) {
      console.error(`❌ Erro ao migrar ${folder}:`, error.message);
    }
  }
  
  console.log(`\n📊 Resumo da migração:`);
  console.log(`   ✅ Migradas: ${migrated}`);
  console.log(`   ⏭️  Puladas: ${skipped}`);
  console.log(`   ❌ Total: ${clientFolders.length}`);
  
  // Verificar se pasta antiga está vazia
  const remaining = await fs.readdir(oldPath);
  if (remaining.length === 0) {
    console.log(`\n🗑️  Pasta antiga está vazia e pode ser removida.`);
    console.log(`   Execute: rm -rf ${oldPath}`);
  }
  
  console.log('\n✅ Migração concluída!');
  console.log(`📁 As pastas dos clientes agora estão em: ${newPath}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateClientFolders()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Erro na migração:', err);
      process.exit(1);
    });
}

module.exports = { migrateClientFolders };

