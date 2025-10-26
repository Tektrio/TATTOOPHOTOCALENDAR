const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

console.log('🔄 Iniciando migration do banco de dados...');
console.log(`📁 Banco de dados: ${DB_PATH}`);
console.log(`📄 Schema: ${SCHEMA_PATH}`);

// Conectar ao banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ler o arquivo de schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

// Remover comentários de linha
const cleanedSchema = schema
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

// Separar comandos SQL por ponto e vírgula
const commands = cleanedSchema
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0);

console.log(`📊 Total de comandos SQL: ${commands.length}`);

// Função para executar comandos em série
function executeCommands(index = 0) {
  if (index >= commands.length) {
    console.log('✅ Migration concluída com sucesso!');
    
    // Adicionar colunas extras à tabela clients se não existirem
    console.log('\n🔄 Adicionando colunas extras à tabela clients...');
    
    const extraColumns = [
      { name: 'birth_date', type: 'DATE' },
      { name: 'gender', type: 'TEXT' },
      { name: 'address', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'state', type: 'TEXT' },
      { name: 'zip_code', type: 'TEXT' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'emergency_contact', type: 'TEXT' },
      { name: 'emergency_phone', type: 'TEXT' },
      { name: 'instagram', type: 'TEXT' },
      { name: 'referred_by', type: 'TEXT' },
      { name: 'credit_card_last4', type: 'TEXT' },
      { name: 'customer_since', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'vagaro_id', type: 'TEXT' }
    ];
    
    let completed = 0;
    extraColumns.forEach(col => {
      db.run(`ALTER TABLE clients ADD COLUMN ${col.name} ${col.type}`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`❌ Erro ao adicionar coluna ${col.name}:`, err.message);
        } else if (!err) {
          console.log(`✅ Coluna ${col.name} adicionada`);
        }
        completed++;
        
        if (completed === extraColumns.length) {
          // Fechar conexão
          db.close((err) => {
            if (err) {
              console.error('❌ Erro ao fechar banco de dados:', err);
            } else {
              console.log('\n✅ Banco de dados atualizado e fechado com sucesso!');
              console.log('\n📊 Resumo:');
              console.log(`   - ${commands.length} comandos SQL executados`);
              console.log(`   - ${extraColumns.length} colunas adicionadas/verificadas`);
              console.log('\n🎉 Sistema pronto para uso!');
            }
          });
        }
      });
    });
    
    return;
  }
  
  const command = commands[index];
  if (!command) {
    executeCommands(index + 1);
    return;
  }
  
  db.run(command, (err) => {
    if (err) {
      // Ignorar erros de tabela já existente
      if (!err.message.includes('already exists')) {
        console.error(`❌ Erro ao executar comando ${index + 1}:`, err.message);
        console.error('Comando:', command.substring(0, 100) + '...');
      }
    } else {
      console.log(`✅ Comando ${index + 1}/${commands.length} executado`);
    }
    
    // Executar próximo comando
    executeCommands(index + 1);
  });
}

// Iniciar execução
executeCommands();

