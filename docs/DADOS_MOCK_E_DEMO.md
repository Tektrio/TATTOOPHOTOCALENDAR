# Dados Mock e Modo Demonstração

## Visão Geral

Sistema de geração de dados fictícios para facilitar testes de interface e demonstrações.

## Geração de Dados Mock

### Backend - Seed Script

Gera dados realistas no banco de dados SQLite.

#### Uso

```bash
# Gerar dados mock (mantém dados existentes)
cd agenda-hibrida-v2
npm run seed:mock

# Gerar dados mock (limpa dados antigos)
npm run seed:clear
```

#### Dados Gerados

| Entidade | Quantidade | Descrição |
|----------|-----------|-----------|
| **Clientes** | 50 | Nomes brasileiros, emails, telefones |
| **Agendamentos** | 100 | Distribuídos entre passado/presente/futuro |
| **Funcionários** | 5 | Diferentes roles (Tatuador, Recepcionista, etc) |
| **Tipos de Tatuagem** | 10 | Tradicional, Realista, Minimalista, etc |
| **Transações** | 30 | Receitas e despesas |

#### Características

✅ **Nomes Realistas**: Combinação de 50 primeiros nomes + 25 sobrenomes brasileiros

✅ **Emails Válidos**: Gerados baseados no nome (`joao.silva@gmail.com`)

✅ **Telefones Formatados**: DDD + 9 dígitos (celular brasileiro)

✅ **Datas Distribuídas**: 
- Passado (últimos 30 dias)
- Presente (hoje)
- Futuro (próximos 60 dias)

✅ **Status Inteligentes**:
- Agendamentos passados: `concluido` ou `cancelado`
- Agendamentos futuros: `confirmado` ou `pendente`

#### Estrutura do Script

```javascript
// database/seed-mock-data.js

// Gera cliente mock
{
  name: "João Silva",
  email: "joao.silva@gmail.com",
  phone: "(11) 98765-4321",
  notes: "Cliente VIP. Prefere horários de manhã.",
  created_at: "2025-09-15T14:30:00Z"
}

// Gera agendamento mock
{
  title: "Sessão de Tradicional",
  description: "Tatuagem de dragão no braço",
  start_datetime: "2025-11-05T14:00:00Z",
  end_datetime: "2025-11-05T16:00:00Z",
  client_id: 23,
  tattoo_type_id: 1,
  status: "confirmado",
  estimated_price: 320
}
```

## Dados Mock no Frontend

### Modo Demonstração

O frontend pode operar em "Modo Demo" usando apenas dados locais, sem backend.

#### Ativação

**Planejado** - Toggle nas Configurações:

```javascript
// Futuro: src/utils/demoMode.js
import { enableDemoMode, disableDemoMode } from '@/utils/demoMode';

// Ativar modo demo
enableDemoMode();

// Desativar
disableDemoMode();
```

#### Funcionalidades

Quando ativo:
- ✅ Dados gerados em memória
- ✅ Ações simuladas (sem persistência real)
- ✅ Banner visual indicando modo demo
- ✅ Performance otimizada (sem chamadas de rede)
- ✅ Ideal para apresentações e testes rápidos

### Geradores de Dados

**Planejado** - `src/utils/mockDataGenerator.js`:

```javascript
import {
  generateMockClients,
  generateMockAppointments,
  generateMockEmployees
} from '@/utils/mockDataGenerator';

// Gerar 20 clientes
const clients = generateMockClients(20);

// Gerar 50 agendamentos
const appointments = generateMockAppointments(50);

// Gerar 3 funcionários
const employees = generateMockEmployees(3);
```

## Limpeza de Dados

### Remover Todos os Dados Mock

```bash
# Backend - limpa banco e gera novos dados
npm run seed:clear

# Backend - apenas limpa (não gera novos)
sqlite3 agenda_hibrida.db "DELETE FROM appointments; DELETE FROM clients; DELETE FROM employees;"
```

### Remover Dados Antigos

```bash
# Remove dados de teste com mais de 90 dias
npm run cleanup
```

### Frontend - Limpar localStorage

```javascript
// Limpar logs locais antigos (últimos 7 dias)
import { cleanupLocalLogs } from '@/services/auditLogService';
cleanupLocalLogs(7);

// Limpar tudo
localStorage.clear();
```

## Auditoria de Dados Mock

Toda geração de dados mock é registrada no audit log:

```json
{
  "action": "CREATE",
  "entity_type": "import",
  "entity_name": "Seed de Dados Mock",
  "changes": {
    "clients": 50,
    "appointments": 100,
    "employees": 5,
    "tattooTypes": 10,
    "transactions": 30
  },
  "metadata": {
    "command": "npm run seed:mock"
  }
}
```

## Casos de Uso

### 1. Desenvolvimento

```bash
# Resetar banco com dados limpos
npm run seed:clear

# Desenvolver features com dados realistas
npm run dev
```

### 2. Testes E2E

```javascript
// tests/e2e/appointments.spec.js
test.beforeEach(async () => {
  // Gerar dados mock antes de cada teste
  await seedDatabase();
});
```

### 3. Demonstrações

```bash
# Gerar dados para demo
npm run seed:mock

# Apresentar sistema para cliente
npm start
```

### 4. Testes de Performance

```bash
# Gerar muitos dados para stress test
node database/seed-mock-data.js --count 1000
```

## Customização

### Ajustar Quantidades

Edite `database/seed-mock-data.js`:

```javascript
const clientIds = await seedClients(db, 100);  // 50 -> 100
const appointmentIds = await seedAppointments(db, clientIds, tattooTypeIds, 500);  // 100 -> 500
```

### Adicionar Novos Tipos

```javascript
const NEW_TATTOO_TYPES = [
  { name: 'Neo-Tradicional', duration: 3, price: 500, color: '#FF6347' },
  { name: 'Fine Line', duration: 2, price: 350, color: '#8A2BE2' }
];
```

### Personalizar Nomes

```javascript
const CUSTOM_NAMES = [
  'Seu', 'Nome', 'Preferido'
];
```

## Boas Práticas

1. **Limpe antes de demonstrações importantes**
   ```bash
   npm run seed:clear
   ```

2. **Use dados mock apenas em desenvolvimento**
   - Nunca em produção
   - Configure via ambiente: `NODE_ENV=development`

3. **Documente dados de teste**
   - Marque claramente em notas: "Cliente de teste"

4. **Backup antes de limpar**
   ```bash
   cp agenda_hibrida.db agenda_hibrida.backup.db
   ```

5. **Verifique seed com sucesso**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT COUNT(*) FROM clients;"
   ```

## Troubleshooting

### Problema: Seed falha com erro SQL

**Causa:** Tabelas não existem

**Solução:**
```bash
npm run migrate:audit
npm run seed:mock
```

### Problema: Dados duplicados

**Causa:** Seed executado múltiplas vezes

**Solução:**
```bash
npm run seed:clear  # Limpa antes de adicionar novos
```

### Problema: Performance lenta com muitos dados

**Causa:** Banco muito grande

**Solução:**
```bash
# Reduzir quantidade ou limpar logs antigos
sqlite3 agenda_hibrida.db "DELETE FROM audit_logs WHERE timestamp < date('now', '-30 days');"
```

## Estatísticas de Seed

Após executar `npm run seed:mock`:

```
✅ Seed concluído com sucesso!
   - 10 tipos de tatuagem
   - 50 clientes
   - 5 funcionários
   - 100 agendamentos
   - 30 transações

🎉 Dados mock prontos para testes!
```

Tempo médio de execução: **< 2 segundos**

## Próximos Passos

- [ ] Implementar `mockDataGenerator.js` no frontend
- [ ] Criar `demoMode.js` com toggle
- [ ] Adicionar banner visual em modo demo
- [ ] Gerar dados mock de arquivos/uploads
- [ ] Seed de dados de importação (Excel, ICS)
- [ ] Comandos interativos: `npm run seed:interactive`

