/**
 * Script de Seed de Dados Mock
 * Gera dados realistas para facilitar testes de interface
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const auditLogService = require('../services/auditLogService');

const DB_PATH = path.join(__dirname, '../agenda_hibrida.db');

// Dados mock realistas
const FIRST_NAMES = [
  'João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Rafael', 'Beatriz',
  'Gabriel', 'Carolina', 'Felipe', 'Camila', 'Rodrigo', 'Fernanda', 'Bruno',
  'Amanda', 'Diego', 'Larissa', 'Matheus', 'Isabela', 'Thiago', 'Letícia',
  'Vinicius', 'Mariana', 'Gustavo', 'Patricia', 'Marcelo', 'Renata', 'André',
  'Juliana', 'Carlos', 'Vanessa', 'Ricardo', 'Tatiana', 'Paulo', 'Adriana',
  'Leonardo', 'Daniela', 'Eduardo', 'Bianca', 'Henrique', 'Priscila', 'Leandro',
  'Cristina', 'Alexandre', 'Sabrina', 'Fabio', 'Aline', 'Daniel', 'Monica'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
  'Dias', 'Nascimento', 'Araujo', 'Monteiro'
];

const TATTOO_TYPES = [
  { name: 'Tradicional', duration: 2, price: 300, color: '#FF6B6B' },
  { name: 'Realista', duration: 4, price: 800, color: '#4ECDC4' },
  { name: 'Minimalista', duration: 1, price: 200, color: '#95E1D3' },
  { name: 'Aquarela', duration: 3, price: 600, color: '#F38181' },
  { name: 'Old School', duration: 2, price: 400, color: '#AA96DA' },
  { name: 'Japonês', duration: 5, price: 1200, color: '#FCBAD3' },
  { name: 'Geométrico', duration: 2, price: 350, color: '#FFFFD2' },
  { name: 'Tribal', duration: 2, price: 300, color: '#A8D8EA' },
  { name: 'Blackwork', duration: 3, price: 500, color: '#2C3E50' },
  { name: 'Pontilhismo', duration: 4, price: 700, color: '#E74C3C' }
];

const EMPLOYEE_ROLES = ['Tatuador', 'Piercer', 'Recepcionista', 'Gerente', 'Assistente'];

const TATTOO_DESCRIPTIONS = [
  'Tatuagem de dragão no braço',
  'Rosa realista nas costelas',
  'Mandala nas costas',
  'Leão no peito',
  'Frase inspiradora no antebraço',
  'Borboleta no ombro',
  'Caveira mexicana na perna',
  'Lobo uivando',
  'Flecha minimalista',
  'Coração sagrado',
  'Fênix renascendo',
  'Âncora com corda',
  'Pena delicada',
  'Relógio quebrado',
  'Mapa-múndi',
  'Constelação',
  'Olho de Hórus',
  'Coruja sábia',
  'Serpente envolvente',
  'Flor de lótus'
];

/**
 * Gera telefone brasileiro aleatório
 */
function generatePhone() {
  const ddd = Math.floor(Math.random() * 89) + 11; // 11-99
  const first = 9; // Celular sempre começa com 9
  const rest = Math.floor(Math.random() * 100000000); // 8 dígitos
  return `(${ddd}) ${first}${rest.toString().padStart(8, '0')}`;
}

/**
 * Gera email baseado no nome
 */
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return `${name}@${domain}`;
}

/**
 * Gera data aleatória no intervalo
 */
function generateRandomDate(daysBack, daysForward) {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * (daysBack + daysForward)) - daysBack;
  const date = new Date(today);
  date.setDate(date.getDate() + randomDays);
  return date.toISOString();
}

/**
 * Limpa dados existentes (opcional)
 */
async function clearExistingData(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM appointments WHERE id > 0', (err) => {
        if (err) console.error('Erro ao limpar appointments:', err);
      });
      db.run('DELETE FROM clients WHERE id > 0', (err) => {
        if (err) console.error('Erro ao limpar clients:', err);
      });
      db.run('DELETE FROM employees WHERE id > 0', (err) => {
        if (err) console.error('Erro ao limpar employees:', err);
      });
      db.run('DELETE FROM tattoo_types WHERE id > 0', (err) => {
        if (err) console.error('Erro ao limpar tattoo_types:', err);
      });
      db.run('DELETE FROM transactions WHERE id > 0', (err) => {
        if (err) {
          console.error('Erro ao limpar transactions:', err);
          reject(err);
        } else {
          console.log('✅ Dados antigos limpos');
          resolve();
        }
      });
    });
  });
}

/**
 * Cria tipos de tatuagem
 */
async function seedTattooTypes(db) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO tattoo_types (name, duration_hours, base_price, color, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const ids = [];
    let completed = 0;

    TATTOO_TYPES.forEach((type) => {
      stmt.run(
        type.name,
        type.duration,
        type.price,
        type.color,
        `Estilo ${type.name} profissional`,
        function(err) {
          if (err) {
            reject(err);
          } else {
            ids.push(this.lastID);
            completed++;
            if (completed === TATTOO_TYPES.length) {
              stmt.finalize();
              console.log(`✅ ${ids.length} tipos de tatuagem criados`);
              resolve(ids);
            }
          }
        }
      );
    });
  });
}

/**
 * Cria clientes mock
 */
async function seedClients(db, count = 50) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, notes, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const ids = [];
    let completed = 0;

    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = generateEmail(firstName, lastName);
      const phone = generatePhone();
      const notes = Math.random() > 0.7 ? `Cliente ${i % 2 === 0 ? 'VIP' : 'regular'}. ${Math.random() > 0.5 ? 'Prefere horários de manhã.' : 'Prefere horários à tarde.'}` : '';
      const createdAt = generateRandomDate(90, 0);

      stmt.run(name, email, phone, notes, createdAt, function(err) {
        if (err) {
          reject(err);
        } else {
          ids.push(this.lastID);
          completed++;
          if (completed === count) {
            stmt.finalize();
            console.log(`✅ ${ids.length} clientes criados`);
            resolve(ids);
          }
        }
      });
    }
  });
}

/**
 * Cria funcionários mock
 */
async function seedEmployees(db, count = 5) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO employees (name, email, phone, role, hire_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const ids = [];
    let completed = 0;

    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;
      const email = generateEmail(firstName, lastName);
      const phone = generatePhone();
      const role = EMPLOYEE_ROLES[Math.floor(Math.random() * EMPLOYEE_ROLES.length)];
      const hireDate = generateRandomDate(365, 0);
      const status = Math.random() > 0.9 ? 'inactive' : 'active';

      stmt.run(name, email, phone, role, hireDate, status, function(err) {
        if (err) {
          reject(err);
        } else {
          ids.push(this.lastID);
          completed++;
          if (completed === count) {
            stmt.finalize();
            console.log(`✅ ${ids.length} funcionários criados`);
            resolve(ids);
          }
        }
      });
    }
  });
}

/**
 * Cria agendamentos mock
 */
async function seedAppointments(db, clientIds, tattooTypeIds, count = 100) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO appointments (
        title, description, start_datetime, end_datetime, 
        client_id, tattoo_type_id, status, estimated_price, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const statuses = ['pendente', 'confirmado', 'concluido', 'cancelado'];
    const ids = [];
    let completed = 0;

    for (let i = 0; i < count; i++) {
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const tattooTypeId = tattooTypeIds[Math.floor(Math.random() * tattooTypeIds.length)];
      const tattooType = TATTOO_TYPES[tattooTypeIds.indexOf(tattooTypeId)];
      const description = TATTOO_DESCRIPTIONS[Math.floor(Math.random() * TATTOO_DESCRIPTIONS.length)];
      
      // Gerar datas (passado, presente, futuro)
      const startDate = new Date(generateRandomDate(30, 60));
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + tattooType.duration);

      // Status baseado na data
      let status;
      const now = new Date();
      if (endDate < now) {
        status = Math.random() > 0.2 ? 'concluido' : 'cancelado';
      } else if (startDate < now) {
        status = 'confirmado';
      } else {
        status = Math.random() > 0.3 ? 'confirmado' : 'pendente';
      }

      const estimatedPrice = tattooType.price * (0.8 + Math.random() * 0.4); // Variação de ±20%
      const createdAt = generateRandomDate(90, 0);

      stmt.run(
        `Sessão de ${tattooType.name}`,
        description,
        startDate.toISOString(),
        endDate.toISOString(),
        clientId,
        tattooTypeId,
        status,
        Math.round(estimatedPrice),
        createdAt,
        function(err) {
          if (err) {
            reject(err);
          } else {
            ids.push(this.lastID);
            completed++;
            if (completed === count) {
              stmt.finalize();
              console.log(`✅ ${ids.length} agendamentos criados`);
              resolve(ids);
            }
          }
        }
      );
    }
  });
}

/**
 * Cria transações financeiras mock
 */
async function seedTransactions(db, appointmentIds, count = 30) {
  return new Promise((resolve, reject) => {
    // Verificar se tabela transactions existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'", (err, row) => {
      if (err || !row) {
        console.log('⚠️  Tabela transactions não existe, pulando seed de transações');
        resolve([]);
        return;
      }

      const stmt = db.prepare(`
        INSERT INTO transactions (
          type, amount, description, date, appointment_id, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const types = ['receita', 'despesa'];
      const paymentStatuses = ['pago', 'pendente', 'cancelado'];
      const ids = [];
      let completed = 0;

      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = type === 'receita' 
          ? Math.floor(200 + Math.random() * 1000)
          : Math.floor(50 + Math.random() * 500);
        const description = type === 'receita'
          ? `Pagamento de sessão de tatuagem`
          : `Compra de material / Despesa operacional`;
        const date = generateRandomDate(60, 0);
        const appointmentId = type === 'receita' && Math.random() > 0.3
          ? appointmentIds[Math.floor(Math.random() * appointmentIds.length)]
          : null;
        const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

        stmt.run(type, amount, description, date, appointmentId, status, function(err) {
          if (err) {
            reject(err);
          } else {
            ids.push(this.lastID);
            completed++;
            if (completed === count) {
              stmt.finalize();
              console.log(`✅ ${ids.length} transações criadas`);
              resolve(ids);
            }
          }
        });
      }
    });
  });
}

/**
 * Função principal
 */
async function seedDatabase() {
  console.log('🌱 Iniciando seed de dados mock...\n');

  const db = new sqlite3.Database(DB_PATH);

  try {
    // Limpar dados existentes (opcional)
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      console.log('🗑️  Limpando dados existentes...');
      await clearExistingData(db);
    }

    // Criar dados mock
    console.log('📝 Criando tipos de tatuagem...');
    const tattooTypeIds = await seedTattooTypes(db);

    console.log('👥 Criando clientes...');
    const clientIds = await seedClients(db, 50);

    console.log('👨‍💼 Criando funcionários...');
    const employeeIds = await seedEmployees(db, 5);

    console.log('📅 Criando agendamentos...');
    const appointmentIds = await seedAppointments(db, clientIds, tattooTypeIds, 100);

    console.log('💰 Criando transações financeiras...');
    const transactionIds = await seedTransactions(db, appointmentIds, 30);

    // Registrar no audit log
    await auditLogService.logAction({
      userId: null,
      userEmail: 'system',
      userName: 'Sistema',
      action: 'CREATE',
      entityType: 'import',
      entityName: 'Seed de Dados Mock',
      changes: {
        tattooTypes: tattooTypeIds.length,
        clients: clientIds.length,
        employees: employeeIds.length,
        appointments: appointmentIds.length,
        transactions: transactionIds.length
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
      requestMethod: 'SCRIPT',
      requestPath: '/database/seed-mock-data.js',
      status: 'success',
      metadata: {
        timestamp: new Date().toISOString(),
        command: 'npm run seed:mock'
      }
    });

    console.log('\n✅ Seed concluído com sucesso!');
    console.log(`   - ${tattooTypeIds.length} tipos de tatuagem`);
    console.log(`   - ${clientIds.length} clientes`);
    console.log(`   - ${employeeIds.length} funcionários`);
    console.log(`   - ${appointmentIds.length} agendamentos`);
    console.log(`   - ${transactionIds.length} transações`);
    console.log('\n🎉 Dados mock prontos para testes!\n');

  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

