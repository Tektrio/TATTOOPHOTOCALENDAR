const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔧 Gerando fixtures de teste...\n');

const fixturesDir = __dirname;

// 1. CLIENTES VÁLIDOS (10 registros)
console.log('📝 Criando test-import-valid.xlsx...');
const validClients = [
  ['Nome', 'Email', 'Telefone', 'Data Nascimento', 'Notas'],
  ['João Silva', 'joao.silva@email.com', '(11) 98765-4321', '1990-01-15', 'Cliente VIP'],
  ['Maria Santos', 'maria.santos@email.com', '(21) 97654-3210', '1985-05-20', 'Primeira sessão'],
  ['Pedro Costa', 'pedro.costa@email.com', '(31) 96543-2109', '1992-08-10', 'Recomendado por João'],
  ['Ana Lima', 'ana.lima@email.com', '(41) 95432-1098', '1988-03-25', 'Cliente desde 2023'],
  ['Carlos Souza', 'carlos.souza@email.com', '(51) 94321-0987', '1995-11-30', 'Tatuagem grande'],
  ['Juliana Rocha', 'juliana.rocha@email.com', '(61) 93210-9876', '1987-07-18', 'Cover-up'],
  ['Ricardo Alves', 'ricardo.alves@email.com', '(71) 92109-8765', '1991-12-05', 'Cliente regular'],
  ['Fernanda Dias', 'fernanda.dias@email.com', '(81) 91098-7654', '1993-04-22', 'Projeto colorido'],
  ['Lucas Martins', 'lucas.martins@email.com', '(85) 90987-6543', '1989-09-14', 'Estilo japonês'],
  ['Beatriz Cunha', 'beatriz.cunha@email.com', '(11) 89876-5432', '1994-06-08', 'Minimalista']
];

const ws1 = XLSX.utils.aoa_to_sheet(validClients);
const wb1 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb1, ws1, 'Clientes');
XLSX.writeFile(wb1, path.join(fixturesDir, 'test-import-valid.xlsx'));
console.log('   ✅ test-import-valid.xlsx criado (10 clientes válidos)');

// 2. CLIENTES COM DUPLICATAS (5 válidos + 3 duplicatas)
console.log('📝 Criando test-import-duplicates.xlsx...');
const duplicateClients = [
  ['Nome', 'Email', 'Telefone', 'Notas'],
  ['João Silva', 'joao.silva@email.com', '(11) 98765-4321', 'Original'],
  ['Maria Santos', 'maria.santos@email.com', '(21) 97654-3210', 'Original'],
  ['Pedro Costa', 'pedro.costa@email.com', '(31) 96543-2109', 'Original'],
  ['João Silva', 'joao.silva@email.com', '(11) 98765-4321', 'DUPLICATA - email'],
  ['Maria Santos', 'maria.santos@email.com', '(21) 97654-3210', 'DUPLICATA - email'],
  ['Ana Lima', 'ana.lima@email.com', '(11) 98765-4321', 'DUPLICATA - telefone'],
  ['Carlos Souza', 'carlos.souza@email.com', '(41) 95432-1098', 'Original'],
  ['Carlos Souza', 'carlos.souza@email.com', '(41) 95432-1098', 'DUPLICATA - completa']
];

const ws2 = XLSX.utils.aoa_to_sheet(duplicateClients);
const wb2 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb2, ws2, 'Clientes');
XLSX.writeFile(wb2, path.join(fixturesDir, 'test-import-duplicates.xlsx'));
console.log('   ✅ test-import-duplicates.xlsx criado (5 válidos + 3 duplicatas)');

// 3. CLIENTES COM ERROS (4 válidos + 6 inválidos)
console.log('📝 Criando test-import-errors.xlsx...');
const errorClients = [
  ['Nome', 'Email', 'Telefone', 'Data Nascimento', 'Notas'],
  ['João Silva', 'joao@email.com', '(11) 98765-4321', '1990-01-15', 'Válido'],
  ['', 'vazio@email.com', '(21) 97654-3210', '1985-05-20', 'ERRO: Nome vazio'],
  ['Maria Santos', 'email-sem-arroba', '(31) 96543-2109', '1992-08-10', 'ERRO: Email inválido'],
  ['Pedro Costa', 'pedro@email.com', 'telefone-invalido', '1988-03-25', 'ERRO: Telefone inválido'],
  ['Ana Lima', 'ana@email.com', '(41) 95432-1098', 'data-invalida', 'ERRO: Data inválida'],
  ['Carlos Souza', 'carlos@email.com', '(51) 94321-0987', '1995-11-30', 'Válido'],
  ['Juliana Rocha', 'juliana', '123', '1987-07-18', 'ERRO: Múltiplos erros'],
  ['Ricardo Alves', 'ricardo@email.com', '(71) 92109-8765', '1991-12-05', 'Válido'],
  ['', '', '', '', 'ERRO: Linha completamente vazia'],
  ['Fernanda Dias', 'fernanda@email.com', '(81) 91098-7654', '1993-04-22', 'Válido']
];

const ws3 = XLSX.utils.aoa_to_sheet(errorClients);
const wb3 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb3, ws3, 'Clientes');
XLSX.writeFile(wb3, path.join(fixturesDir, 'test-import-errors.xlsx'));
console.log('   ✅ test-import-errors.xlsx criado (4 válidos + 6 inválidos)');

// 4. AGENDAMENTOS (10 registros para importação)
console.log('📝 Criando test-appointments-import.xlsx...');
const appointments = [
  ['Título', 'Cliente', 'Data', 'Hora Início', 'Hora Fim', 'Descrição', 'Status'],
  ['Sessão 1 - Braço', 'João Silva', '2025-11-15', '14:00', '16:00', 'Tatuagem realista', 'Confirmado'],
  ['Consulta', 'Maria Santos', '2025-11-16', '10:00', '11:00', 'Orçamento projeto', 'Pendente'],
  ['Sessão 2 - Costas', 'Pedro Costa', '2025-11-18', '15:00', '18:00', 'Continuação projeto', 'Confirmado'],
  ['Touch-up', 'Ana Lima', '2025-11-20', '09:00', '10:00', 'Retoque sessão anterior', 'Confirmado'],
  ['Sessão 1 - Perna', 'Carlos Souza', '2025-11-22', '13:00', '16:00', 'Tatuagem grande', 'Pendente'],
  ['Cover-up', 'Juliana Rocha', '2025-11-23', '14:00', '17:00', 'Cobrir tatuagem antiga', 'Confirmado'],
  ['Sessão Única', 'Ricardo Alves', '2025-11-25', '11:00', '13:00', 'Tatuagem pequena', 'Confirmado'],
  ['Projeto Colorido', 'Fernanda Dias', '2025-11-26', '14:00', '18:00', 'Sessão 1 de 3', 'Confirmado'],
  ['Estilo Japonês', 'Lucas Martins', '2025-11-27', '10:00', '14:00', 'Koi nas costas', 'Pendente'],
  ['Minimalista', 'Beatriz Cunha', '2025-11-28', '09:00', '10:30', 'Símbolo pequeno', 'Confirmado']
];

const ws4 = XLSX.utils.aoa_to_sheet(appointments);
const wb4 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb4, ws4, 'Agendamentos');
XLSX.writeFile(wb4, path.join(fixturesDir, 'test-appointments-import.xlsx'));
console.log('   ✅ test-appointments-import.xlsx criado (10 agendamentos)');

// 5. ARQUIVO ICS - Calendário
console.log('📝 Criando test-calendar.ics...');
const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Agenda Hibrida Tests//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:test-event-1@agenda-hibrida.com
DTSTART:20251115T140000Z
DTEND:20251115T160000Z
SUMMARY:Sessão de Tatuagem - João Silva
DESCRIPTION:Braço direito - estilo realista
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:test-event-2@agenda-hibrida.com
DTSTART:20251116T100000Z
DTEND:20251116T110000Z
SUMMARY:Consulta - Maria Santos
DESCRIPTION:Cotação de projeto completo
STATUS:TENTATIVE
END:VEVENT
BEGIN:VEVENT
UID:test-event-3@agenda-hibrida.com
DTSTART:20251118T150000Z
DTEND:20251118T180000Z
SUMMARY:Sessão 2 - Pedro Costa
DESCRIPTION:Continuação do projeto nas costas
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:test-event-4@agenda-hibrida.com
DTSTART:20251120T090000Z
DTEND:20251120T100000Z
SUMMARY:Touch-up - Ana Lima
DESCRIPTION:Retoque da sessão anterior
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:test-event-5@agenda-hibrida.com
DTSTART:20251122T130000Z
DTEND:20251122T160000Z
SUMMARY:Sessão 1 - Carlos Souza
DESCRIPTION:Projeto grande na perna
STATUS:TENTATIVE
END:VEVENT
END:VCALENDAR`;

fs.writeFileSync(path.join(fixturesDir, 'test-calendar.ics'), icsContent);
console.log('   ✅ test-calendar.ics criado (5 eventos)');

console.log('\n🎉 Todas as fixtures criadas com sucesso!\n');
console.log('📊 Resumo:');
console.log('   - test-import-valid.xlsx: 10 clientes válidos');
console.log('   - test-import-duplicates.xlsx: 5 válidos + 3 duplicatas');
console.log('   - test-import-errors.xlsx: 4 válidos + 6 inválidos');
console.log('   - test-appointments-import.xlsx: 10 agendamentos');
console.log('   - test-calendar.ics: 5 eventos de calendário');
console.log('\n✅ Fixtures prontas para uso nos testes E2E!\n');

