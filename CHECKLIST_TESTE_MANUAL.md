# ✅ CHECKLIST DE TESTES MANUAIS

**Data**: 29 de Outubro de 2025  
**Sistema**: TattooScheduler - Agenda Híbrida v2  
**Versão**: 2.0.0

---

## 🎯 INSTRUÇÕES DE USO

Este checklist deve ser usado para validação manual completa do sistema. 
Marque cada item com ✅ conforme for testando.

---

## 1️⃣ BACKEND (Porta 3001)

### 1.1 Iniciar Servidor
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
npm start
```

**Validação**:
- [ ] Servidor inicia sem erros
- [ ] Porta 3001 está livre/disponível
- [ ] Console mostra "Server running on port 3001"
- [ ] Health check: `curl http://localhost:3001/health`

### 1.2 Testar APIs Principais

**Clientes**:
```bash
# Listar clientes
curl http://localhost:3001/api/clients?limit=10

# Buscar cliente específico
curl http://localhost:3001/api/clients/1

# Estatísticas do cliente
curl http://localhost:3001/api/clients/1/stats
```
- [ ] GET /api/clients retorna lista
- [ ] GET /api/clients/:id retorna cliente específico
- [ ] Dados contêm: id, name, email, phone

**Agendamentos**:
```bash
# Listar agendamentos
curl http://localhost:3001/api/appointments

# Buscar agendamento específico
curl http://localhost:3001/api/appointments/2
```
- [ ] GET /api/appointments retorna lista
- [ ] Dados contêm: id, client_name, date, status

**Funcionários**:
```bash
curl http://localhost:3001/api/employees
```
- [ ] GET /api/employees retorna lista
- [ ] Mínimo 3 funcionários cadastrados

**Estatísticas Financeiras** (Bug #12 - CORRIGIDO):
```bash
curl http://localhost:3001/api/stats/financial
```
- [ ] Retorna total_revenue > 0
- [ ] Retorna total_transactions > 0
- [ ] Estrutura JSON correta

**Google Accounts** (Bug #11 - CORRIGIDO):
```bash
curl http://localhost:3001/api/google/accounts
```
- [ ] API responde sem erro 500
- [ ] Retorna {success: true}
- [ ] Tabela google_accounts existe

### 1.3 Banco de Dados
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
sqlite3 agenda_hibrida.db
```

**Comandos SQL**:
```sql
-- Verificar tabelas críticas
SELECT name FROM sqlite_master WHERE type='table' 
  AND name IN ('clients', 'appointments', 'google_accounts', 'google_oauth_tokens');

-- Contar registros
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as total_appointments FROM appointments;

-- Verificar integridade
PRAGMA integrity_check;
```
- [ ] Tabela `clients` existe
- [ ] Tabela `appointments` existe
- [ ] Tabela `google_accounts` existe ✅ (Bug #11)
- [ ] Tabela `google_oauth_tokens` existe
- [ ] Total clientes: ~995
- [ ] Total agendamentos: ~4
- [ ] Integridade: ok

---

## 2️⃣ FRONTEND (Porta 5173)

### 2.1 Iniciar Aplicação
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-frontend
npm run dev
```

**Validação**:
- [ ] Servidor inicia sem erros
- [ ] Porta 5173 está disponível
- [ ] Console mostra "Local: http://localhost:5173"
- [ ] Navegador abre automaticamente

### 2.2 Navegação entre Abas

Abrir: `http://localhost:5173`

**11 Abas Principais**:
1. [ ] **Dashboard** - Cards de estatísticas carregam
2. [ ] **Calendário** - Mês atual exibido com agendamentos
3. [ ] **Agendamentos** - Lista de 4 agendamentos
4. [ ] **Clientes** - Lista de 50 clientes (paginação)
5. [ ] **Importar** - Interface de upload
6. [ ] **Galeria** - Grid de imagens
7. [ ] **Drive** - Explorer do Google Drive
8. [ ] **Dados Local** - Navegação de pastas locais
9. [ ] **Financeiro** ✅ - Dashboard com R$ 5.865,00 (Bug #12)
10. [ ] **Funcionários** - Lista de 3+ funcionários
11. [ ] **Config** - Configurações do sistema

### 2.3 Dashboard (Aba 1)

- [ ] Card "Total de Clientes": 995
- [ ] Card "Próximos Agendamentos": 1
- [ ] Card "Arquivos Totais": valor >= 0
- [ ] Card "Armazenamento": valor >= 0 MB
- [ ] Status Sistema Híbrido: "Hybrid"
- [ ] Status Armazenamento Local: "✓ Ativo"
- [ ] Status Google Drive: "✓ Conectado"
- [ ] Google Calendar: "há X minutos"
- [ ] Botão "Desconectar" visível
- [ ] Lista "Próximos Agendamentos": 4 itens
- [ ] Cada agendamento mostra: nome, cliente, data

### 2.4 Calendário Visual (Aba 2)

- [ ] Mês atual exibido: "outubro de 2025"
- [ ] Botões navegação: anterior/próximo funcionam
- [ ] Botão "Hoje" volta para dia atual
- [ ] Dias com agendamentos destacados
- [ ] Dia 7: 1 agendamento
- [ ] Dia 22: 2 agendamentos
- [ ] Dia 29: 1 agendamento
- [ ] Clicar em dia: expande detalhes
- [ ] Detalhes mostram: nome cliente, telefone, descrição
- [ ] Legendas: "Hoje", "Com agendamentos"
- [ ] Dicas de uso visíveis

### 2.5 Agendamentos (Aba 3)

- [ ] Título: "Gerenciar Agenda"
- [ ] Botão "Novo Agendamento" visível
- [ ] Lista exibe 4 agendamentos
- [ ] Cada item mostra:
  - [ ] Título do agendamento
  - [ ] Nome do cliente
  - [ ] Data e hora
  - [ ] Orçamento (quando disponível)
  - [ ] Status: "pendente"
  - [ ] Botões: editar, deletar

### 2.6 Clientes (Aba 4)

- [ ] Título: "Clientes" com contador "50 clientes"
- [ ] Botão "Novo Cliente" visível
- [ ] Campo de busca funciona
- [ ] Botão "Filtros" abre opções
- [ ] Lista exibe clientes (primeiros 50)
- [ ] Cada card mostra:
  - [ ] Avatar com iniciais
  - [ ] Nome completo
  - [ ] Email
  - [ ] Gasto total
  - [ ] Sessões
  - [ ] Pontos
  - [ ] Tags de saúde (quando disponível)

**Testar Perfil Completo**:
- [ ] Clicar em qualquer cliente
- [ ] Perfil abre com 12 abas:
  1. [ ] Fila de Espera
  2. [ ] Projetos
  3. [ ] Fotos
  4. [ ] Documentos
  5. [ ] Saúde
  6. [ ] Comunicação
  7. [ ] Notas Privadas
  8. [ ] Visão Geral
  9. [ ] Histórico
  10. [ ] Preferências
  11. [ ] Avaliações
  12. [ ] Gamificação

### 2.7 Financeiro (Aba 9) ✅ Bug #12 VALIDADO

- [ ] Título: "Dashboard Financeiro"
- [ ] Filtro de período: "Últimos 30 dias"
- [ ] Botão "Atualizar" visível
- [ ] Botão "Exportar" visível
- [ ] **Métricas Principais**:
  - [ ] Receita Total: **R$ 5.865,00** (não R$ 0,00!) ✅
  - [ ] Transações: **14** (não 0!) ✅
  - [ ] Ticket Médio: **R$ 586,50** ✅
  - [ ] Growth Rate: **+144.4%** ✅
- [ ] **Gráficos renderizam**:
  - [ ] Receita por Dia: linha com dados
  - [ ] Receita por Tipo: categorias
  - [ ] Métodos de Pagamento: distribuição
- [ ] Tabela "Transações Recentes" visível

### 2.8 Console do Navegador

Abrir DevTools (F12) → Console:

- [ ] Sem erros críticos (vermelho)
- [ ] WebSocket conectado: "✅ WebSocket conectado - ID: ..."
- [ ] Vite conectado: "[vite] connected"
- [ ] Sem "404 Not Found" em APIs
- [ ] Sem "500 Internal Server Error"

---

## 3️⃣ INTEGRAÇÕES

### 3.1 Google OAuth

**Verificar Configuração**:
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
cat .env | grep GOOGLE
ls -la tokens.json
```

- [ ] GOOGLE_CLIENT_ID definido
- [ ] GOOGLE_CLIENT_SECRET definido
- [ ] GOOGLE_REDIRECT_URI correto
- [ ] Arquivo `tokens.json` existe
- [ ] Tokens válidos (não expirados)

**Testar no Frontend**:
- [ ] Badge "Google Calendar • há X minutos" visível
- [ ] Status: "Conectado" (verde)
- [ ] Botão "Desconectar" disponível

### 3.2 Google Calendar Sync

**Validar Sincronização**:
- [ ] Agendamentos do sistema aparecem no Google Calendar
- [ ] Criar evento no Google Calendar → aparece no sistema
- [ ] Última sincronização: menos de 10 minutos
- [ ] Sem erros de sincronização nos logs

**API**:
```bash
curl http://localhost:3001/api/google/accounts
```
- [ ] Retorna lista de contas conectadas
- [ ] Status 200 OK

### 3.3 Google Drive Sync

**Aba Drive (Frontend)**:
- [ ] Google Drive conectado
- [ ] Listagem de arquivos funciona
- [ ] Pastas exibidas
- [ ] Botão "Upload" visível
- [ ] Busca funciona
- [ ] Thumbnails carregam (quando disponível)

**API**:
```bash
curl http://localhost:3001/api/drive/files
```
- [ ] Retorna lista de arquivos
- [ ] Status 200 OK

### 3.4 WebSocket (Tempo Real)

**Console do Navegador**:
- [ ] Log: "🔌 Iniciando conexão WebSocket..."
- [ ] Log: "✅ WebSocket conectado - ID: ..."
- [ ] Sem "WebSocket connection failed"
- [ ] Reconexão automática funciona (se desconectar)

**Testar Atualizações**:
- [ ] Criar agendamento → atualiza em tempo real
- [ ] Editar cliente → reflete imediatamente
- [ ] Indicador de sincronização atualiza

---

## 4️⃣ TESTES DE FUNCIONALIDADES CRÍTICAS

### 4.1 CRUD de Clientes

**Criar**:
- [ ] Clicar "Novo Cliente"
- [ ] Preencher: Nome, Email, Telefone
- [ ] Salvar
- [ ] Cliente aparece na lista

**Editar**:
- [ ] Selecionar cliente
- [ ] Clicar "Editar"
- [ ] Alterar dados
- [ ] Salvar
- [ ] Alterações refletidas

**Deletar**:
- [ ] Selecionar cliente de teste
- [ ] Clicar "Deletar"
- [ ] Confirmar
- [ ] Cliente removido da lista

### 4.2 CRUD de Agendamentos

**Criar**:
- [ ] Clicar "Novo Agendamento"
- [ ] Preencher: Cliente, Data, Hora
- [ ] Salvar
- [ ] Aparece na lista
- [ ] Aparece no calendário

**Editar**:
- [ ] Selecionar agendamento
- [ ] Clicar "Editar"
- [ ] Alterar data/hora
- [ ] Salvar
- [ ] Calendário atualiza

**Deletar**:
- [ ] Selecionar agendamento de teste
- [ ] Clicar "Deletar"
- [ ] Confirmar
- [ ] Removido de lista e calendário

### 4.3 Upload de Arquivos

**Galeria**:
- [ ] Abrir aba "Galeria"
- [ ] Clicar "Novo Upload"
- [ ] Selecionar imagem (JPG/PNG)
- [ ] Upload completa
- [ ] Imagem aparece na galeria
- [ ] Thumbnail gerado

**Google Drive**:
- [ ] Abrir aba "Drive"
- [ ] Clicar "Upload"
- [ ] Selecionar arquivo
- [ ] Upload completa
- [ ] Arquivo aparece no Drive
- [ ] Sincronização OK

### 4.4 Importação Vagaro

**Excel**:
- [ ] Abrir aba "Importar"
- [ ] Selecionar "Excel Vagaro"
- [ ] Upload CustomersList.xlsx
- [ ] Detecção automática de tipo
- [ ] Importação completa
- [ ] Relatório exibido
- [ ] Clientes aparecem na lista

---

## 5️⃣ VALIDAÇÃO DE BUGS CORRIGIDOS

### ✅ Bug #11: Tabela google_accounts

**Problema Original**:
- API `/api/google/accounts` retornava erro 500
- Erro: "SQLITE_ERROR: no such table: google_accounts"

**Validação da Correção**:
```bash
# Testar API
curl http://localhost:3001/api/google/accounts

# Verificar tabela no DB
sqlite3 agenda_hibrida.db "SELECT name FROM sqlite_master WHERE type='table' AND name='google_accounts';"
```

**Checklist**:
- [ ] API retorna status 200 ✅
- [ ] Tabela `google_accounts` existe ✅
- [ ] Frontend Calendário carrega sem erro ✅
- [ ] Sem erro 500 nos logs ✅

**Status**: ✅ **CORRIGIDO E VALIDADO**

---

### ✅ Bug #12: URL Financeiro Incorreta

**Problema Original**:
- Dashboard Financeiro mostrava R$ 0,00 e 0 transações
- URL incorreta: `/api/financial/stats` (404)
- URL correta: `/api/stats/financial`

**Validação da Correção**:
```bash
# Testar URL corrigida
curl http://localhost:3001/api/stats/financial
```

**Checklist**:
- [ ] API `/api/stats/financial` retorna dados ✅
- [ ] Receita Total > 0 (**R$ 5.865,00**) ✅
- [ ] Transações > 0 (**14**) ✅
- [ ] Frontend exibe dados corretos ✅
- [ ] Gráficos renderizam ✅

**Status**: ✅ **CORRIGIDO E VALIDADO**

---

## 6️⃣ PERFORMANCE E ESTABILIDADE

### 6.1 Tempos de Resposta

- [ ] Backend inicia em < 10 segundos
- [ ] Frontend inicia em < 15 segundos
- [ ] Dashboard carrega em < 2 segundos
- [ ] Calendário carrega em < 3 segundos
- [ ] Lista clientes (50 itens) em < 1 segundo
- [ ] APIs REST respondem em < 500ms

### 6.2 Memória e CPU

**Backend**:
```bash
# Verificar uso de memória
curl http://localhost:3001/health | jq '.memoryUsage'
```
- [ ] Heap usado < 150 MB
- [ ] Sem memory leaks após 10 minutos de uso

**Frontend**:
- [ ] DevTools → Performance → Memory
- [ ] Heap size estável (não cresce indefinidamente)
- [ ] Sem warnings de performance

### 6.3 Logs

**Backend**:
- [ ] Sem erros críticos nos logs
- [ ] Avisos são informativos, não bloqueantes
- [ ] SQL queries otimizadas (< 100ms)

**Frontend Console**:
- [ ] Sem erros não tratados
- [ ] Avisos são aceitáveis (ex: React DevTools)
- [ ] Network requests: status 200 OK

---

## 7️⃣ CHECKLIST FINAL

### Pré-Produção
- [ ] Todos os bugs críticos corrigidos ✅
- [ ] Todas as funcionalidades principais funcionando
- [ ] Performance aceitável
- [ ] Sem memory leaks
- [ ] Logs limpos
- [ ] Documentação atualizada

### Backup e Segurança
- [ ] Backup do banco de dados criado
- [ ] Tokens Google salvos em local seguro
- [ ] .env não comitado no git
- [ ] Credenciais protegidas

### Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas (npm install)
- [ ] Build de produção testado
- [ ] Testes finais executados

---

## 📊 RESUMO DE VALIDAÇÃO

| Categoria | Itens | ✅ Funcionando | ⚠️ Avisos | ❌ Erros |
|-----------|-------|----------------|-----------|----------|
| Backend | 15+ | - | - | - |
| Frontend | 30+ | - | - | - |
| Integrações | 4 | - | - | - |
| APIs REST | 30+ | - | - | - |
| Bugs Corrigidos | 2 | 2 ✅ | 0 | 0 |
| **TOTAL** | **80+** | **-** | **-** | **-** |

---

## 🎯 PRÓXIMOS PASSOS

Após completar este checklist:

1. [ ] Preencher resumo de validação
2. [ ] Documentar problemas encontrados
3. [ ] Criar tickets para melhorias
4. [ ] Atualizar README com instruções
5. [ ] Preparar para deploy

---

**Testado por**: _________________  
**Data**: _________________  
**Status Final**: [ ] Aprovado [ ] Reprovado  
**Observações**: _________________

---

**Versão do Checklist**: 1.0.0  
**Última Atualização**: 29 de Outubro de 2025

