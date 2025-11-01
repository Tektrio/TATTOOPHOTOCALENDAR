# APIs do Backend - Sistema Antigo vs Novo

## APIs Já Existentes no Sistema Novo ✅

| Endpoint | Método | Status |
|----------|--------|--------|
| `/api/appointments` | GET, POST | ✅ Existe |
| `/api/appointments/[id]` | GET, PUT, DELETE | ✅ Existe |
| `/api/clients` | GET, POST | ✅ Existe |
| `/api/clients/[id]` | GET, PUT, DELETE | ✅ Existe |
| `/api/auth/[...nextauth]` | * | ✅ Existe |
| `/api/google/calendar/sync` | POST | ✅ Existe |
| `/api/files/upload` | POST | ✅ Existe |

## APIs a Migrar do Sistema Antigo

### Clientes/Customers (6 rotas)
- [ ] `GET /api/customers` - Lista completa de customers
- [ ] `GET /api/customers/[id]` - Detalhes do customer
- [ ] `GET /api/customers/[id]/files` - Arquivos do customer
- [ ] `POST /api/customers/[id]/files` - Upload arquivo
- [ ] `GET /api/customers/[id]/forms` - Formulários do customer
- [ ] `POST /api/customers/[id]/notes` - Criar nota privada

### Funcionários (4 rotas)
- [ ] `GET /api/employees` - Listar funcionários
- [ ] `POST /api/employees` - Criar funcionário
- [ ] `PUT /api/employees/[id]` - Atualizar funcionário
- [ ] `DELETE /api/employees/[id]` - Excluir funcionário

### Financeiro (8 rotas)
- [ ] `GET /api/financial/stats` - Estatísticas financeiras
- [ ] `GET /api/invoices` - Listar faturas
- [ ] `POST /api/invoices` - Criar fatura
- [ ] `GET /api/gift-cards` - Listar gift cards
- [ ] `POST /api/gift-cards` - Criar gift card
- [ ] `GET /api/memberships` - Listar memberships
- [ ] `GET /api/packages` - Listar pacotes
- [ ] `GET /api/products` - Listar produtos

### Importação (4 rotas)
- [ ] `POST /api/imports/excel` - Importar Excel
- [ ] `POST /api/imports/csv` - Importar CSV
- [ ] `POST /api/imports/ics` - Importar ICS
- [ ] `POST /api/imports/vagaro` - Importar Vagaro

### Google (5 rotas)
- [ ] `GET /api/google/accounts` - Listar contas Google
- [ ] `POST /api/google/accounts` - Adicionar conta
- [ ] `DELETE /api/google/accounts/[id]` - Remover conta
- [ ] `GET /api/google/drive/list` - Listar arquivos Drive
- [ ] `POST /api/google/drive/upload` - Upload para Drive
- [ ] `POST /api/google/drive/sync` - Sincronizar Drive

### Storage (4 rotas)
- [ ] `GET /api/storage/local` - Listar arquivos locais
- [ ] `POST /api/storage/local/sync` - Sincronizar local
- [ ] `GET /api/storage/qnap` - Listar arquivos QNAP
- [ ] `POST /api/storage/qnap/sync` - Sincronizar QNAP

### Sync & Audit (3 rotas)
- [ ] `POST /api/sync` - Sincronização geral
- [ ] `GET /api/sync/destinations` - Destinos de sync
- [ ] `GET /api/audit/logs` - Logs de auditoria

### Services (1 rota)
- [ ] `GET /api/services` - Listar serviços disponíveis

## Total
- ✅ **7 APIs prontas**
- ⏳ **35 APIs a migrar**
- 📊 **Total: 42 APIs**

## Prioridade de Migração

### Alta Prioridade (para funcionalidades core)
1. `/api/customers/*` - Sistema de clientes completo
2. `/api/financial/stats` - Dashboard financeiro
3. `/api/imports/*` - Sistema de importação

### Média Prioridade
4. `/api/employees` - Gestão de funcionários
5. `/api/google/drive/*` - Explorador Google Drive
6. `/api/storage/*` - Gestão de armazenamento

### Baixa Prioridade (features avançadas)
7. `/api/sync/*` - Sincronização avançada
8. `/api/audit/*` - Auditoria
9. `/api/services` - Listagem de serviços

