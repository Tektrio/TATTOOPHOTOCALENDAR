<!-- 21757d51-0b8e-4ffe-8a31-2dc1beefda71 3cd04897-4377-4130-b405-97cab64e19e6 -->
# Plano Consolidado - Sistema Tattoo Scheduler Completo e Perfeito

## Visão Geral

Este plano integra 3 objetivos críticos em sequência otimizada:

1. **Implementar features** (Multi-Conta + Dados Vagaro + Melhorias UX)
2. **Testar manualmente** com navegador e MCPs
3. **Automatizar testes E2E** para garantir 100% de cobertura (260/260 testes)

---

## 🎯 STATUS ATUAL DO SISTEMA (ATUALIZADO - 27/10/2025)

### ✅ IMPLEMENTAÇÕES CONCLUÍDAS:

#### Backend:
1. ✅ **Migrations criadas**:
   - `008-multi-account-system.sql` (google_accounts, account_file_mappings)
   - `005-import-logs.sql`
   - `006-vagaro-transactions.sql`
   - `007-vagaro-extended-data.sql` (employees, message_history, clientes com MD5)
   - `009-service-types.sql` (Video Consultation, Half Day, Full Day, etc)

2. ✅ **Services implementados**:
   - `multiAccountService.js` (listAccounts, addAccount, setActiveAccount, syncAllAccounts)
   - `vagaro-batch-importer.js` (importCustomers, importTransactions, MD5 anti-duplicação)

3. ✅ **Rotas API criadas**:
   - `/api/google/accounts` (GET, POST, PUT /activate, POST /sync-all)
   - `/api/services` (CRUD completo de tipos de serviço)

4. ✅ **Script CLI**:
   - `import-vagaro-data.js` (execução batch de importação)

#### Frontend:
1. ✅ **Componentes novos criados**:
   - `GoogleAccountManager.jsx` (gerenciamento de contas Google)
   - `VagaroImport.jsx` (interface de importação visual)
   - `FinancialDashboard.jsx` (gráficos de receita com Recharts)
   - `Employees.jsx` (gestão de funcionários)
   - `Customers.jsx` (filtros avançados - COM ERRO A CORRIGIR)
   - `SettingsPanel.jsx` (temas + idiomas)

2. ✅ **Componentes modificados**:
   - `SeletorHorarioMelhorado.jsx` (integrado com API de serviços predefinidos)
   - `CalendarioVisual.jsx` (tabs por conta Google, filtros multi-conta)
   - `GaleriaCorrigida.jsx` (filtro por fonte: Local/Drive/QNAP)

3. ✅ **Sistema i18n implementado**:
   - `i18n.js` (gerenciador de traduções com eventos)
   - `locales/pt.json` (traduções completas em Português)
   - `locales/en.json` (traduções completas em English)

4. ✅ **Testes E2E atualizados** (Fase 5 completa):
   - `01-navigation.spec.js` ✅
   - `02-clients.spec.js` ✅
   - `03-appointments.spec.js` ✅ (data-testid + timeouts)
   - `04-integration-flow.spec.js` ✅ (data-testid + timeouts)
   - `05-google-sync.spec.js` ✅ (data-testid)
   - `06-import-preview.spec.js` ✅ (data-testid + timeouts)
   - `07-drag-and-drop.spec.js` ✅ (data-testid + timeouts)

5. ✅ **data-testid adicionados** (Fase 4 completa):
   - `App.jsx` (150+ testids em tabs, botões, modais, inputs)
   - `CalendarioVisual.jsx` (calendar-cell, appointment-, tabs-google-accounts)
   - `SyncStatusBadge.jsx` (sync-status-badge, sync-timestamp, btn-manual-sync)
   - `ImportWizard.jsx` (import-wizard, input-upload-excel, preview-table, import-stats, btn-confirm-import)
   - `ExcelFieldMapper.jsx` (preview-table, btn-confirm-import)

### ❌ PROBLEMAS IDENTIFICADOS:

1. **`Customers.jsx` - Endpoints incorretos**:
   - ❌ Usa `/api/clients` mas deveria ser `/api/customers`
   - ❌ Usa `/api/tags` que não existe no backend
   - ❌ Erro "customers is not iterable" por resposta vazia/404

2. **Componentes criados mas não integrados no `App.jsx`**:
   - `FinancialDashboard.jsx` (sem rota/tab)
   - `Employees.jsx` (sem rota/tab)
   - `VagaroImport.jsx` (sem rota/tab)
   - `SettingsPanel.jsx` (sem rota/tab)

3. **Backend faltando**:
   - Rota `/api/tags` para sistema de tags de clientes
   - Integration do `multiAccountService` com Google OAuth existente

### 🟡 PRÓXIMAS AÇÕES IMEDIATAS:

#### 1. Corrigir `Customers.jsx` (15min):
- Trocar `/api/clients` → `/api/customers`
- Remover chamada `/api/tags` ou criar mock
- Ajustar lógica de filtros para trabalhar com dados do backend existente

#### 2. Integrar componentes no `App.jsx` (30min):
- Adicionar tabs para: Financial, Employees, Vagaro Import
- Lazy load dos componentes
- Rotas adequadas

#### 3. Testar manualmente (2h):
- Multi-conta Google (verificar integração)
- Seletor de horário com serviços
- Calendário com filtro por conta
- Galeria com filtro por fonte
- Configurações (temas + idiomas)

#### 4. Executar testes E2E baseline (1h):
- Rodar `npm run test:e2e`
- Analisar falhas
- Documentar status

---

## ROADMAP RESTANTE

### CURTO PRAZO (3-4h):
1. ✅ ~~Completar FASE 5~~ - **CONCLUÍDO**
2. ✅ ~~Adicionar data-testid faltantes~~ - **CONCLUÍDO**
3. ✅ ~~FASE 6 - Aumentar timeouts~~ - **APLICADO NOS TESTES 03-07**
4. 🔧 **Corrigir erro Customers.jsx** - EM ANDAMENTO
5. 🔧 Integrar componentes novos no App.jsx
6. 🔧 Testes manuais com navegador
7. FASE 8 - Executar e corrigir até 100% (2-3h)
8. FASE 9 - Relatório final (30min)

### MÉDIO PRAZO (4-6h):
9. Criar rotas de tags no backend
10. Integrar multiAccountService com OAuth
11. Criar novos testes E2E para features (testes 08-12)
12. Otimizações de performance
13. Documentação completa

---

# FASE ATUAL: CORREÇÃO E INTEGRAÇÃO

## Tarefa 1: Corrigir Customers.jsx

### Problema atual:
```javascript
// ❌ INCORRETO
const response = await fetch(`${API_URL}/api/clients`);  // 404
const tagsResponse = await fetch(`${API_URL}/api/tags`);  // 404
```

### Solução:
```javascript
// ✅ CORRETO
const response = await fetch(`${API_URL}/api/customers`);
// Tags: usar array vazio temporário ou criar endpoint
const tags = [];
```

### Ajustes necessários:
1. Trocar endpoint `/api/clients` → `/api/customers`
2. Remover chamada `/api/tags` (usar mock vazio por enquanto)
3. Ajustar estrutura de dados esperada (API retorna `customers`, não array direto)
4. Tratar casos de resposta vazia

---

## Tarefa 2: Integrar Novos Componentes no App.jsx

Adicionar imports lazy:
```javascript
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard.jsx'))
const Employees = lazy(() => import('./pages/Employees.jsx'))
const VagaroImport = lazy(() => import('./pages/VagaroImport.jsx'))
const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'))
```

Adicionar tabs:
```jsx
<TabsTrigger value="financial" data-testid="tab-financial">
  <DollarSign className="w-4 h-4 mr-2" />
  Financeiro
</TabsTrigger>

<TabsTrigger value="employees" data-testid="tab-employees">
  <Users className="w-4 h-4 mr-2" />
  Funcionários
</TabsTrigger>

<TabsTrigger value="vagaro-import" data-testid="tab-vagaro-import">
  <Upload className="w-4 h-4 mr-2" />
  Importar Vagaro
</TabsTrigger>
```

Adicionar TabsContent:
```jsx
<TabsContent value="financial">
  <Suspense fallback={<LoadingSpinner />}>
    <FinancialDashboard />
  </Suspense>
</TabsContent>

<TabsContent value="employees">
  <Suspense fallback={<LoadingSpinner />}>
    <Employees />
  </Suspense>
</TabsContent>

<TabsContent value="vagaro-import">
  <Suspense fallback={<LoadingSpinner />}>
    <VagaroImport />
  </Suspense>
</TabsContent>
```

Substituir tab settings inline por componente:
```jsx
<TabsContent value="settings">
  <Suspense fallback={<LoadingSpinner />}>
    <SettingsPanel />
  </Suspense>
</TabsContent>
```

---

## Tarefa 3: Testes Manuais

### Roteiro de Testes:

1. **Dashboard** (5min)
   - ✅ Verificar cards de estatísticas
   - ✅ Status do sistema híbrido
   - ✅ Lista de agendamentos

2. **Calendário Visual** (10min)
   - Verificar tabs de contas Google
   - Testar filtro "Todas as Contas" vs conta específica
   - Drag and drop de agendamentos
   - Navegação entre visualizações (mês/semana/dia)

3. **Clientes com Filtros** (10min)
   - Busca por nome/email/telefone
   - Filtro por data de cadastro
   - Ordenação (nome, email, data, total gasto)
   - Limpar filtros

4. **Agendamentos com Serviços** (10min)
   - Abrir seletor de horário
   - Escolher serviço predefinido
   - Verificar duração auto-calculada
   - Criar agendamento

5. **Galeria Unificada** (10min)
   - Filtro por fonte (Local/Drive/QNAP)
   - Upload de arquivo
   - Download/Visualização

6. **Configurações** (10min)
   - Alternar tema (claro/escuro/sistema)
   - Mudar idioma (PT/EN)
   - Verificar persistência no localStorage
   - Sincronização automática on/off

7. **Dashboard Financeiro** (10min)
   - Visualizar gráficos
   - Cards de receita/despesa/lucro
   - Verificar dados mock

8. **Funcionários** (5min)
   - Listar funcionários
   - Verificar layout

9. **Importação Vagaro** (10min)
   - Drag and drop de arquivo
   - Preview de dados
   - Estatísticas de importação

10. **Google Multi-Conta** (10min)
    - Listar contas cadastradas
    - Adicionar nova conta (se OAuth configurado)
    - Ativar conta principal
    - Sincronizar todas

---

## FASE 8: Executar Testes E2E (PRÓXIMO PASSO)

### Comandos:
```bash
cd agenda-hibrida-frontend
npm run test:e2e 2>&1 | tee test-run-$(date +%Y%m%d-%H%M%S).log
```

### Análise esperada:
- Testes 01-07: devem estar passando (data-testid atualizados)
- Testes novos (se criados): podem falhar inicialmente
- Drag and drop: verificar implementação

### Correções iterativas:
1. Identificar padrão de falha
2. Corrigir código ou teste
3. Re-executar
4. Repetir até 260/260

---

## FASE 9: Relatório Final

Documentar em `RELATORIO_TESTES_100_SUCESSO.md`:

### Estrutura:
1. **Resumo Executivo**
   - 260/260 testes passando
   - Tempo total de execução
   - Data de conclusão

2. **Evolução**
   - Baseline: 100/95/65 (passando/falhando/pulados)
   - Final: 260/0/0

3. **Features Implementadas**
   - Multi-Conta Google
   - Dados Vagaro
   - Melhorias UX (15 itens)

4. **Cobertura de Testes**
   - Navegação
   - CRUD Clientes
   - CRUD Agendamentos
   - Integração completa
   - Google Sync
   - Importação
   - Drag and Drop
   - Multi-conta (novo)
   - Vagaro Import (novo)
   - Filtros avançados (novo)
   - Dashboard financeiro (novo)
   - Configurações (novo)

5. **Próximos Passos**
   - Deploy em produção
   - Monitoramento
   - Backup automatizado

---

# Meta Final

✅ 260/260 testes E2E passando (100%)

✅ Sistema multi-conta Google funcionando

✅ Dados Vagaro completamente migrados

✅ Melhorias UX implementadas

✅ Sistema perfeito e pronto para produção! 🎉

