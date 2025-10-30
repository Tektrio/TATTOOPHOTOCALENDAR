# Sistema de Logs de Auditoria

## Visão Geral

Sistema completo de rastreamento de ações para auditoria, debugging e análise de uso.

## Arquitetura

### Backend

```
agenda-hibrida-v2/
├── database/
│   └── migrations/
│       └── 029_create_audit_logs.sql   # Tabela de logs
├── services/
│   └── auditLogService.js              # Lógica de negócio
├── routes/
│   └── auditLogs.js                     # Endpoints REST
└── middleware/
    └── auditMiddleware.js               # Interceptação automática
```

### Frontend

```
agenda-hibrida-frontend/
├── src/
│   ├── services/
│   │   └── auditLogService.js           # Service híbrido
│   ├── hooks/
│   │   └── useAuditLog.js               # Hook React (planejado)
│   └── components/
│       └── AuditLogViewer.jsx            # Interface (planejado)
```

## Funcionalidades

### 1. Registro Automático

Todas as ações CRUD são registradas automaticamente via middleware:

```javascript
// server.js
const { auditMiddleware } = require('./middleware/auditMiddleware');
app.use(auditMiddleware());
```

### 2. Registro Manual

Para casos específicos:

```javascript
const { logAction } = require('../services/auditLogService');

await logAction({
  userId: req.user.id,
  action: 'CREATE',
  entityType: 'appointment',
  entityId: newAppointment.id,
  entityName: newAppointment.title,
  changes: { after: newAppointment }
});
```

### 3. Frontend Híbrido

Funciona offline com localStorage:

```javascript
import { logAction } from '@/services/auditLogService';

// Registra localmente e sincroniza quando online
await logAction({
  action: 'UPDATE',
  entityType: 'client',
  entityId: 123,
  details: { before: oldData, after: newData }
});
```

## Tipos de Ações

- `CREATE`: Criação de entidades
- `UPDATE`: Atualização de dados
- `DELETE`: Exclusão
- `IMPORT`: Importação de dados
- `EXPORT`: Exportação
- `SYNC`: Sincronizações
- `UPLOAD`: Upload de arquivos
- `DOWNLOAD`: Downloads
- `CONFIG_CHANGE`: Mudanças de configuração
- `LOGIN/LOGOUT`: Autenticação (futuro)

## Tipos de Entidades

- `appointment`: Agendamentos
- `client`: Clientes
- `employee`: Funcionários
- `file`: Arquivos
- `tattoo_type`: Tipos de tatuagem
- `transaction`: Transações financeiras
- `config`: Configurações
- `import`: Importações
- `sync`: Sincronizações

## API Endpoints

### GET /api/audit-logs

Lista logs com filtros avançados

**Query params:**
- `action`: Filtrar por ação
- `entityType`: Filtrar por entidade
- `status`: success, error, pending
- `userId`: Filtrar por usuário
- `startDate`, `endDate`: Período
- `search`: Busca textual
- `limit`, `offset`: Paginação

**Exemplo:**
```bash
curl "http://localhost:3001/api/audit-logs?action=CREATE&limit=50"
```

### GET /api/audit-logs/recent

Logs dos últimos 7 dias (cache otimizado)

```bash
curl "http://localhost:3001/api/audit-logs/recent?limit=100"
```

### GET /api/audit-logs/entity/:type/:id

Logs de uma entidade específica

```bash
curl "http://localhost:3001/api/audit-logs/entity/client/123"
```

### GET /api/audit-logs/stats

Estatísticas de uso

```bash
curl "http://localhost:3001/api/audit-logs/stats?days=30"
```

### GET /api/audit-logs/export

Exporta logs para JSON

### POST /api/audit-logs/cleanup

Remove logs antigos (default: > 90 dias)

```json
{ "days": 90 }
```

## Estrutura de um Log

```json
{
  "id": 1234,
  "user_id": 42,
  "user_email": "joao@email.com",
  "user_name": "João Silva",
  "action": "UPDATE",
  "entity_type": "appointment",
  "entity_id": 567,
  "entity_name": "Sessão de Tatuagem",
  "changes": {
    "before": { "status": "pendente" },
    "after": { "status": "confirmado" }
  },
  "ip_address": "192.168.*.**",
  "user_agent": "Mozilla/5.0...",
  "request_method": "PUT",
  "request_path": "/api/appointments/567",
  "status": "success",
  "timestamp": "2025-10-30T23:00:00.000Z",
  "metadata": {
    "responseTime": 45
  }
}
```

## Privacidade e LGPD

### Dados Mascarados

- **IP Address**: Parcialmente mascarado (`192.168.*.**`)
- **User Agent**: Completo apenas para debugging

### Não Armazenamos

- Senhas ou tokens
- Dados sensíveis de saúde
- Números de cartão de crédito
- Documentos pessoais

### Retenção

- **Logs de sucesso**: 90 dias
- **Logs de erro**: Indefinido (troubleshooting)
- **Limpeza automática**: Via trigger SQL

## Performance

### Otimizações

1. **Índices** em campos frequentes:
   - `user_id`, `entity_type`, `entity_id`, `timestamp`

2. **Views materializadas**:
   - `recent_audit_logs`: Últimos 7 dias
   - `audit_stats`: Estatísticas agregadas

3. **Registro assíncrono**:
   - Não bloqueia resposta da requisição
   - Usa `res.on('finish')`

4. **Cache no frontend**:
   - localStorage para logs recentes
   - Sincronização inteligente

### Métricas

- Tempo de registro: < 100ms
- Impacto na resposta: < 5ms
- Espaço em disco: ~1KB por log

## Monitoramento

### Dashboard de Estatísticas

```javascript
const stats = await getAuditStats(7); // Últimos 7 dias

console.log(stats);
// {
//   totalActions: 1523,
//   actionsByType: { CREATE: 450, UPDATE: 890, DELETE: 183 },
//   entitiesByType: { appointment: 980, client: 340, ... },
//   successRate: 98.5,
//   errorCount: 23
// }
```

### Alertas

Configure alertas para:
- Taxa de erro > 5%
- Ações suspeitas (muitas exclusões)
- Logs de erro recorrentes

## Troubleshooting

### Problema: Logs não aparecem

1. Verificar se middleware está ativo
2. Verificar rota não está em `skipPaths`
3. Verificar logs no console do servidor

### Problema: Performance degradada

1. Executar limpeza: `npm run seed:clear`
2. Verificar índices: `PRAGMA index_list('audit_logs')`
3. Analisar slow queries

### Problema: Sincronização falha (frontend)

1. Verificar conexão: `isOnline()`
2. Ver logs pendentes: `getPendingLogs()`
3. Forçar sincronização: `syncLogsToBackend()`

## Exemplos de Uso

### Rastrear mudanças em um cliente

```javascript
const logs = await getLogsByEntity('client', 123);
console.log('Histórico do cliente:', logs);
```

### Ver atividade de um usuário

```javascript
const logs = await getLogsByUser(42);
console.log('Ações do usuário:', logs);
```

### Análise de período

```javascript
const logs = await getLogsByDateRange(
  '2025-10-01',
  '2025-10-31'
);
console.log('Logs de outubro:', logs.length);
```

## Roadmap

- [ ] Interface visual (AuditLogViewer component)
- [ ] Exportação para CSV/Excel
- [ ] Filtros avançados na UI
- [ ] Alertas em tempo real via WebSocket
- [ ] Integração com sistema de usuários
- [ ] Relatórios PDF
- [ ] API de webhooks para eventos críticos

