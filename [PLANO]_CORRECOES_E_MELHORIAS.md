# 📋 PLANO DE CORREÇÕES E MELHORIAS - TattooScheduler

**Data de Criação:** 29 de Outubro de 2025  
**Status:** Em Execução  
**Baseado em:** [RELATORIO]\_AUDITORIA_COMPLETA_SISTEMA.md

---

## ✅ AUDITORIA CONCLUÍDA (6/6)

- [x] Testar todas as 11 abas do frontend usando o navegador e capturar screenshots
- [x] Testar todas as APIs do backend usando requisições HTTP diretas
- [x] Validar integrações Google Calendar, Google Drive e WebSocket
- [x] Verificar estrutura do banco de dados, migrations e integridade dos dados
- [x] Analisar código fonte frontend e backend para erros e débito técnico
- [x] Criar relatório completo com bugs, funcionalidades parciais e melhorias

---

## 🔴 CICLO 1: BUGS CRÍTICOS (P0) - 0/11 Concluídos

### Bug #1: Banco de Dados SQLite Vazio

- [ ] **1.1** Investigar migrations existentes em `agenda-hibrida-v2/migrations/`
- [ ] **1.2** Executar migrations ou criar tabelas básicas (clients, appointments, employees, financial_transactions)
- [ ] **1.3** Popular banco com dados de seed mínimos
- [ ] **1.4** Testar: `sqlite3 database.sqlite ".tables"` - deve listar todas as tabelas
- [ ] **1.5** Executar queries de contagem em cada tabela
- [ ] **1.6** Verificar foreign keys e constraints
- [ ] **1.7** Commit: `fix(database): executar migrations e popular banco de dados`

### Bug #2: API `/api/clients/:id/photos` - Erro SQL

- [ ] **2.1** Localizar query SQL que referencia `a.start_time` em routes/clients.js
- [ ] **2.2** Verificar schema real da tabela appointments/sessions
- [ ] **2.3** Corrigir query para usar nomes de colunas corretos
- [ ] **2.4** Testar: `curl http://localhost:3001/api/clients/11/photos`
- [ ] **2.5** Acessar perfil de cliente no navegador, aba "Fotos"
- [ ] **2.6** Verificar console do browser - não deve ter erro 500
- [ ] **2.7** Commit: `fix(api): corrigir query SQL em endpoint de fotos do cliente`

### Bug #3: Rota `/api/stats/financial` - 404 Not Found

- [ ] **3.1** Criar arquivo `agenda-hibrida-v2/routes/financial.js`
- [ ] **3.2** Implementar endpoint GET `/api/stats/financial`
- [ ] **3.3** Implementar queries para métricas (receita, transações, ticket médio, etc)
- [ ] **3.4** Registrar rota no `server.js`
- [ ] **3.5** Testar: `curl http://localhost:3001/api/stats/financial`
- [ ] **3.6** Acessar aba "Financeiro" no navegador - deve carregar dados
- [ ] **3.7** Verificar se gráficos são renderizados
- [ ] **3.8** Testar filtros de período (7, 30, 90 dias)
- [ ] **3.9** Commit: `feat(api): implementar endpoint de estatísticas financeiras`

### Bug #4: Rota `/api/employees` - 404 Not Found

- [ ] **4.1** Criar arquivo `agenda-hibrida-v2/routes/employees.js`
- [ ] **4.2** Implementar GET `/api/employees` - listar todos
- [ ] **4.3** Implementar POST `/api/employees` - criar novo
- [ ] **4.4** Implementar GET `/api/employees/:id` - buscar por id
- [ ] **4.5** Implementar PUT `/api/employees/:id` - atualizar
- [ ] **4.6** Implementar DELETE `/api/employees/:id` - deletar
- [ ] **4.7** Adicionar validações (nome, email, função, status)
- [ ] **4.8** Registrar rotas no `server.js`
- [ ] **4.9** Testar: `curl http://localhost:3001/api/employees`
- [ ] **4.10** Acessar aba "Funcionários" - interface sem erro
- [ ] **4.11** Testar criação via interface
- [ ] **4.12** Testar edição e exclusão
- [ ] **4.13** Commit: `feat(api): implementar CRUD completo de funcionários`

### Bug #5: Agendamentos com "Invalid Date"

- [ ] **5.1** Verificar 3 agendamentos problemáticos no banco
- [ ] **5.2** Identificar formato de data armazenado vs esperado
- [ ] **5.3** Adicionar validação de data no endpoint POST/PUT de appointments
- [ ] **5.4** Implementar parser robusto de datas
- [ ] **5.5** Sanitizar datas antes de salvar (ISO 8601)
- [ ] **5.6** Criar migration para corrigir datas inválidas existentes
- [ ] **5.7** Frontend: adicionar validação no componente de data/hora
- [ ] **5.8** Testar: Query no banco - verificar formato das datas
- [ ] **5.9** Acessar aba "Agendamentos" - todos com data válida
- [ ] **5.10** Criar novo agendamento - data salva corretamente
- [ ] **5.11** Editar agendamento existente - data mantida
- [ ] **5.12** Commit: `fix(appointments): validar e corrigir formato de datas inválidas`

### 📊 CHECKPOINT 1: Re-executar Bateria Completa

- [ ] **CP1.1** Testar todas as 11 abas do frontend
- [ ] **CP1.2** Capturar screenshots atualizados
- [ ] **CP1.3** Verificar console para novos erros
- [ ] **CP1.4** Testar todas as 17 APIs com curl
- [ ] **CP1.5** Verificar respostas JSON válidas
- [ ] **CP1.6** Validar códigos HTTP corretos (200, 201, 404, etc)
- [ ] **CP1.7** Atualizar `[RELATORIO]_AUDITORIA_COMPLETA_SISTEMA.md`
- [ ] **CP1.8** Marcar bugs P0 como resolvidos
- [ ] **CP1.9** Documentar novos problemas (se houver)

---

## 🟡 CICLO 2: AVISOS MÉDIA PRIORIDADE (P1) - 0/13 Concluídos

### Aviso #6: Parse de Tags de Saúde

- [ ] **6.1** Localizar função de parse em `agenda-hibrida-frontend/src/utils/` ou componentes
- [ ] **6.2** Ajustar regex/parser para aceitar formato "NONE of the options,Diabetes"
- [ ] **6.3** Tratar casos especiais: múltiplas tags, tags vazias
- [ ] **6.4** Adicionar try-catch para evitar warnings no console
- [ ] **6.5** Testar: Acessar aba "Clientes" - sem warnings no console
- [ ] **6.6** Abrir perfil de cliente com tags de saúde
- [ ] **6.7** Verificar casos: sem tags, uma tag, múltiplas tags
- [ ] **6.8** Commit: `fix(frontend): ajustar parser de tags de saúde para aceitar formato atual`

### Aviso #7: WebSocket Warnings

- [ ] **7.1** Abrir `agenda-hibrida-frontend/src/services/syncWebSocket.js`
- [ ] **7.2** Implementar padrão Singleton para conexão
- [ ] **7.3** Adicionar controle de estado (CONNECTING, CONNECTED, DISCONNECTED)
- [ ] **7.4** Prevenir múltiplas instâncias de conexão
- [ ] **7.5** Implementar reconnect com exponential backoff
- [ ] **7.6** Adicionar cleanup no useEffect dos componentes
- [ ] **7.7** Testar: Console sem warnings "WebSocket já conectado"
- [ ] **7.8** Navegar entre abas - conexão mantida
- [ ] **7.9** Simular perda de conexão - reconexão automática
- [ ] **7.10** Badge de sync atualiza em tempo real
- [ ] **7.11** Commit: `fix(websocket): implementar singleton e controle de estado de conexão`

### Aviso #8: API `/api/sync/status` - Resposta Inválida

- [ ] **8.1** Localizar endpoint em `agenda-hibrida-v2/routes/sync.js`
- [ ] **8.2** Garantir que resposta seja sempre JSON válido
- [ ] **8.3** Adicionar error handling com try-catch
- [ ] **8.4** Validar estrutura de resposta antes de enviar
- [ ] **8.5** Testar: `curl http://localhost:3001/api/sync/status | jq '.'`
- [ ] **8.6** Verificar badge de sincronização no frontend
- [ ] **8.7** Simular erro de sincronização - JSON de erro válido
- [ ] **8.8** Commit: `fix(api): garantir resposta JSON válida em endpoint de sync status`

### 📊 CHECKPOINT 2: Re-executar Bateria Completa

- [ ] **CP2.1** Testar todas as 11 abas do frontend
- [ ] **CP2.2** Testar todas as 17 APIs backend
- [ ] **CP2.3** Capturar screenshots atualizados
- [ ] **CP2.4** Atualizar relatório: marcar P1 como resolvidos
- [ ] **CP2.5** Verificar se todos os warnings foram eliminados

---

## 🟢 CICLO 3: MELHORIAS (P2) - 0/11 Concluídos

### Melhoria #9: OAuth Google - Renovação Automática

- [ ] **9.1** Abrir `agenda-hibrida-v2/services/googleAuthService.js`
- [ ] **9.2** Detectar quando token está próximo de expirar (15 min antes)
- [ ] **9.3** Implementar função de renovação automática usando refresh_token
- [ ] **9.4** Adicionar cron job ou setTimeout para verificação periódica
- [ ] **9.5** Atualizar tokens no banco após renovação
- [ ] **9.6** Adicionar logging de renovações bem-sucedidas
- [ ] **9.7** Testar: `/auth/status` - `needsReauth` deve ser false
- [ ] **9.8** Deixar sistema rodando por 1h - tokens renovam automaticamente
- [ ] **9.9** Verificar logs - renovações automáticas
- [ ] **9.10** Sincronização com Google continua funcionando
- [ ] **9.11** Commit: `feat(auth): implementar renovação automática de tokens OAuth`

### Melhoria #10: QNAP NAS - Remoção da Interface

- [ ] **10.1** Localizar componente Dashboard - "Status do Sistema Híbrido"
- [ ] **10.2** Remover card/seção QNAP NAS
- [ ] **10.3** Remover warning "QNAP NAS não configurado"
- [ ] **10.4** (Opcional) Criar `docs/QNAP_SETUP.md` para uso futuro
- [ ] **10.5** (Opcional) Adicionar variável de ambiente para habilitar/desabilitar
- [ ] **10.6** Testar: Dashboard não mostra QNAP
- [ ] **10.7** Sistema funciona normalmente sem QNAP
- [ ] **10.8** Commit: `refactor(ui): remover QNAP NAS do dashboard (feature não utilizada)`

### 📊 CHECKPOINT 3: Testes Finais Completos

**Bateria Completa:**

- [ ] **CP3.1** Testar todas as 11 abas (frontend)
- [ ] **CP3.2** Testar todas as 17 APIs (backend)
- [ ] **CP3.3** Testar integrações (Google Calendar, Drive, WebSocket)

**Fluxos End-to-End:**

- [ ] **CP3.4** Fluxo 1: Criar cliente → Criar agendamento → Sincronizar Google → Verificar calendário
- [ ] **CP3.5** Fluxo 2: Upload arquivo → Verificar galeria → Verificar Google Drive
- [ ] **CP3.6** Fluxo 3: Importar dados → Validar → Confirmar → Verificar lista
- [ ] **CP3.7** Fluxo 4: Criar funcionário → Atribuir agendamento → Verificar estatísticas

**Screenshots Finais:**

- [ ] **CP3.8** Capturar todas as abas novamente
- [ ] **CP3.9** Comparar com screenshots iniciais
- [ ] **CP3.10** Documentar melhorias visuais

---

## 📝 RELATÓRIO FINAL - 0/2 Concluídos

- [ ] **RF.1** Atualizar `[RELATORIO]_AUDITORIA_COMPLETA_SISTEMA.md` com seção "CICLO DE CORREÇÕES IMPLEMENTADO"
- [ ] **RF.2** Criar `[SUCESSO]_SISTEMA_100_FUNCIONAL.md` com comparação antes/depois, lista de commits, screenshots, checklist de deploy

---

## 📊 PROGRESSO TOTAL

| Fase                | Concluídos | Total | %    |
| ------------------- | ---------- | ----- | ---- |
| **Auditoria**       | 6          | 6     | 100% |
| **Ciclo 1 (P0)**    | 0          | 11    | 0%   |
| **Ciclo 2 (P1)**    | 0          | 13    | 0%   |
| **Ciclo 3 (P2)**    | 0          | 11    | 0%   |
| **Relatório Final** | 0          | 2     | 0%   |
| **TOTAL GERAL**     | 6          | 43    | 14%  |

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Iniciar com Bug #1 (Banco de Dados) - resolve dependências
2. ⏳ Seguir ordem sequencial: Bug #2 → #3 → #4 → #5
3. ⏳ Commit após cada bug corrigido
4. ⏳ Executar CHECKPOINT 1 após todos os bugs P0
5. ⏳ Continuar com Ciclo 2 (P1) e depois Ciclo 3 (P2)
6. ⏳ Finalizar com relatório completo e documento de sucesso

---

**Última atualização:** 29 de Outubro de 2025, 12:30 UTC  
**Estratégia:** Item por item, com testes após cada correção, commits incrementais
