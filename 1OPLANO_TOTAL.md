# Plano Final Completo - Sistema 100% Funcional

## Status Atual (Baseado em Testes Reais via Playwright)

### Estatísticas de Testes

- ✅ **8/8 abas testadas** (Dashboard, Calendário, Agendamentos, Clientes, Importar, Galeria, Google Drive, Configurações)
- ✅ **45+ funcionalidades testadas**: 35 OK (78%), 5 parciais (11%), 4 bugs críticos (9%), 1 faltando (2%)
- ✅ **6 relatórios de teste criados** com screenshots e evidências
- ✅ **Nota geral do sistema**: ⭐⭐⭐⭐ (4/5) - 78% funcional

### Sistema Funcionando

- ✅ Interface moderna e responsiva (gradiente roxo/azul)
- ✅ Backend Node.js estável na porta 3001
- ✅ Frontend React/Vite na porta 5173
- ✅ SQLite database funcionando (5 clientes, 4 agendamentos)
- ✅ Google Drive **100% funcional** (pasta criada com sucesso)
- ✅ Google Calendar conectado e autenticado
- ✅ WebSocket tempo real operacional
- ✅ Sistema híbrido ativo (Local + Google Drive)

### Problemas Identificados

- 🔴 **4 bugs críticos** documentados com evidências
- ⚠️ **~200+ registros duplicados** em Tipos de Tatuagem (severo!)
- ⚠️ **1 funcionalidade faltante** (navegação em pastas Google Drive)
- ⚠️ Alguns erros 500 em API de importação

---

## Execução Rápida

### Backend

```bash
cd agenda-hibrida-v2
npm ci
node server.js  # Porta 3001
```

### Frontend

```bash
cd agenda-hibrida-frontend
npm ci
npm run dev  # Porta 5173
```

### Verificação

```bash
# Checar status Google
cd agenda-hibrida-v2
node verificar-google-config.js
```

---

## FASE 1: CORREÇÕES CRÍTICAS (Prioridade Máxima) 🔴

### 1.1 Bug Crítico: Duplicação Massiva em Configurações

**Evidência dos Testes**:

- 📸 Screenshot: `page-2025-10-27T00-10-01-406Z.png`
- 📊 Relatório: `🧪_RELATORIO_TESTES_FRONTEND.md`
- 🔍 Problema: ~50+ duplicatas de cada tipo ("Grande", "Média", "Pequena", "Sessão Completa")
- 💾 Impacto: Performance degradada, desperdício de storage, UX ruim

**Tarefas**:

1. Investigar causa raiz da duplicação

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar código de seed/inicialização
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Buscar loops infinitos de insert
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar se há triggers duplicando dados

2. Criar script de backup do banco ANTES de limpar
   ```bash
   cp agenda_hibrida.db agenda_hibrida.db.backup-$(date +%Y%m%d)
   ```

3. Criar script SQL de limpeza mantendo apenas 1 registro de cada tipo
   ```sql
   -- Identificar duplicatas
   SELECT name, COUNT(*) as count FROM tattoo_types GROUP BY name HAVING count > 1;
   -- Remover duplicatas mantendo o mais antigo
   DELETE FROM tattoo_types WHERE id NOT IN (
     SELECT MIN(id) FROM tattoo_types GROUP BY name
   );
   ```

4. Implementar constraint UNIQUE no banco
   ```sql
   ALTER TABLE tattoo_types ADD CONSTRAINT unique_tattoo_name UNIQUE (name);
   ```

5. Adicionar validação no backend para prevenir duplicatas

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar `IF NOT EXISTS` antes de insert
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Validar unicidade na API

6. Testar criação/edição após correção
7. Verificar se outras tabelas têm mesmo problema

---

### 1.2 Bug: Modal Dashboard não Abre

**Evidência dos Testes**:

- 📸 Screenshot: `page-2025-10-27T00-26-55-947Z.png`
- 📊 Relatório: `📊_TESTE_01_DASHBOARD.md`
- 🔍 Console log mostra: `showNewAppointment changed: true`
- ❌ Resultado: Modal não renderiza visualmente

**Causa Provável**:

- Modal renderizando fora da viewport
- CSS ocultando (z-index, display: none)
- Componente não importado corretamente
- Props incorretas

**Tarefas**:

1. Inspecionar código do Dashboard.jsx

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar renderização condicional do modal
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir props passadas para `NewAppointmentModal`

2. Verificar CSS do modal

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - z-index adequado (ex: 9999)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - position: fixed
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - display não oculto

3. Verificar se modal está sendo importado
4. Comparar com código da aba Agendamentos (que funciona!)
5. Testar correção clicando no botão "Novo"
6. Adicionar testes E2E para prevenir regressão

**Workaround Temporário**: Usar aba Agendamentos (funciona perfeitamente)

---

### 1.3 Erro: API Importar Dados (500)

**Evidência dos Testes**:

- 📊 Relatório: `📊_RESUMO_TESTES_FINAL.md`
- 🔍 Console mostra: "500 Internal Server Error"
- ⚠️ Severidade: ALTA

**Tarefas**:

1. Acessar aba "Importar Dados" e identificar qual endpoint falha
2. Verificar logs do backend (`backend.log`)
   ```bash
   tail -f agenda-hibrida-v2/backend.log
   ```

3. Testar endpoints manualmente:
   ```bash
   curl http://localhost:3001/api/imports/vagaro/excel/preview
   curl http://localhost:3001/api/auth/google/status
   ```

4. Identificar rota problemática em `routes/imports.js`
5. Corrigir erro (provavelmente middleware ou validação)
6. Testar upload de arquivo Excel (clientes)
7. Testar upload de arquivo ICS
8. Verificar preview funciona antes de importar
9. Validar relatório pós-importação

---

### 1.4 OAuth Google - Reabilitar

**Evidência**:

- 📊 Relatório: `📊_RELATORIO_TESTES_COMPLETO.md`
- 🔍 Erro: "OAuth client was disabled"
- ✅ Tokens presentes mas expirados há 14 horas

**Tarefas**:

1. Acessar [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Verificar status do OAuth Client ID: `435554447869-81mao21m5u594r5uimqh169c4n12lhc4`
3. Reabilitar OAuth Client OU criar novo se necessário
4. Se criar novo:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Copiar Client ID e Secret
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Atualizar `.env`:
     ```env
     GOOGLE_CLIENT_ID=novo_client_id
     GOOGLE_CLIENT_SECRET=novo_secret
     ```


5. Executar script de reautenticação:
   ```bash
   cd agenda-hibrida-v2
   node reautenticar-google.js
   ```

6. Testar conexão completa:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Google Drive (upload, download, criar pasta)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Google Calendar (listar calendários, criar evento)

7. Verificar tokens salvos em `tokens.json`
8. Confirmar status "Conectado" no header

---

## FASE 2: FUNCIONALIDADES FALTANTES ⚠️

### 2.1 Navegação em Pastas - Google Drive

**Evidência dos Testes**:

- 📸 Screenshot: `page-2025-10-27T00-15-57-595Z.png`
- 📊 Relatório: `🧪_RELATORIO_TESTES_GOOGLE_DRIVE.md`
- 🔍 Problema: Clique simples e duplo-clique em pasta NÃO abre conteúdo
- ⚠️ Severidade: MÉDIA (funcionalidade básica esperada)

**Tarefas**:

1. Implementar handler de clique/duplo-clique em pastas
2. Criar estado para "pasta atual" (currentFolderId)
3. Implementar breadcrumb de navegação funcional

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mostrar caminho: `Meu Drive > Pasta1 > Pasta2`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Permitir clicar em qualquer parte do caminho

4. Adicionar botão "Voltar" para pasta pai
5. Implementar navegação:
   ```javascript
   const navigateToFolder = (folderId) => {
     setCurrentFolderId(folderId);
     loadFolderContents(folderId);
   };
   ```

6. Manter histórico de navegação (stack)
7. Testar navegação em múltiplos níveis
8. Testar botão "voltar"
9. Testar breadcrumb clicável
10. Adicionar loading state durante carregamento

---

### 2.2 Sincronização Google Calendar - Testes Completos

**Evidência**:

- 📊 Relatório: `📅_TESTE_02_CALENDARIO_VISUAL.md`
- ✅ Conexão estabelecida
- ⚠️ Sincronização bidirecional não testada (sem dados)

**Tarefas**:

1. Criar agendamento de teste no sistema local
2. Verificar se aparece no Google Calendar web
3. Criar evento no Google Calendar web
4. Verificar se aparece no calendário local
5. Editar evento local e verificar sincronização
6. Editar evento no Google e verificar atualização local
7. Testar exclusão bidirecional
8. Verificar deduplicação (evitar duplicatas)
9. Testar sincronização de eventos recorrentes
10. Validar horários e fusos (timezone correto)

---

## FASE 3: TESTES COMPLETOS DE FUNCIONALIDADES ✅

### 3.1 Agendamentos - CRUD Completo

**Status Atual** (baseado em `📝_TESTE_03_AGENDAMENTOS.md`):

- ✅ Modal abre corretamente na aba Agendamentos
- ✅ Formulário completo com todos os campos
- ⚠️ Criação/Edição/Exclusão não testadas completamente

**Tarefas**:

1. ✅ Abrir modal (já testado e funciona)
2. Criar novo agendamento completo:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Título: "Tatuagem Grande - João"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cliente: Selecionar "João da Silva Teste"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Data início: Amanhã às 14:00
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Data fim: Amanhã às 20:00 (6h)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Descrição: "Tatuagem realista no braço direito"

3. Verificar criação bem-sucedida:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Toast de sucesso aparece
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Agendamento na lista
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aparece no calendário visual
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Contador dashboard atualiza

4. Editar agendamento:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Editar"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mudar horário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar atualização

5. Excluir agendamento:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Excluir"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar modal de confirmação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar remoção

6. Validar campos obrigatórios:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tentar salvar sem título (deve dar erro)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tentar salvar sem cliente (deve dar erro)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar mensagens de erro

7. Testar conflitos de horários:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar 2 agendamentos no mesmo horário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar se sistema avisa

8. Testar vinculação com clientes:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ver agendamentos de um cliente específico
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Filtrar por cliente

9. Verificar exibição no calendário visual:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar no dia do agendamento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ver detalhes completos

---

### 3.2 Clientes - CRUD Completo

**Status Atual** (baseado em testes):

- ✅ Lista de 5 clientes exibida
- ✅ Criação testada e funcionando (cliente "João da Silva Teste")
- ⚠️ Edição, exclusão e outras funções não testadas

**Tarefas**:

1. ✅ Criar cliente (já testado)
2. Editar cliente existente:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em ícone de editar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mudar nome: "João da Silva Teste" → "João da Silva"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mudar telefone
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar atualização na lista

3. Ver detalhes completos:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em botão "Ver"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar modal/página com:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Dados pessoais
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Histórico de agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fotos/arquivos do cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Estatísticas (total gasto, sessões)

4. Testar botão "Agendar":

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Agendar" de um cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar se abre modal de agendamento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar se cliente já vem pré-selecionado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar agendamento

5. Verificar histórico de agendamentos:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ver lista de agendamentos passados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ver agendamentos futuros
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Filtros de data

6. Excluir cliente:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em ícone de deletar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar modal de confirmação:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Tem certeza? Esta ação não pode ser desfeita"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Cliente tem X agendamentos vinculados"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar exclusão
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar remoção da lista
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar contador dashboard atualiza

7. Testar upload de arquivos por cliente:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Abrir detalhes do cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fazer upload de foto
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Organizar em categorias
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar sincronização com Google Drive

8. Testar validações:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Email inválido
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Telefone inválido
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Nome vazio
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duplicatas (mesmo email)

---

### 3.3 Importação de Dados - Teste Completo

**Status Atual**:

- ⚠️ Erro 500 detectado
- ⚠️ Funcionalidade não testada

**Tarefas** (após corrigir erro 500):

1. Testar importação Excel Vagaro (clientes):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar arquivo Excel de teste com 10 clientes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fazer upload
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar preview mostra dados corretamente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar importação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar relatório:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - X clientes criados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Y clientes atualizados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Z clientes ignorados (duplicatas)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir na lista de clientes

2. Testar importação Excel Vagaro (agendamentos):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar arquivo Excel com 10 agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload e preview
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar importação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar relatório
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ver no calendário visual

3. Testar importação ICS/iCalendar:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Usar arquivo `test-data/sample-calendar.ics`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload e preview
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar eventos importados

4. Testar deduplicação automática:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Importar mesmo arquivo 2x
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar que não cria duplicatas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir mensagem "X ignorados (duplicatas)"

5. Verificar preview antes de importar:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Primeiras 10 linhas visíveis
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mapeamento de colunas correto
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Possibilidade de ajustar mapeamento

6. Analisar relatório pós-importação:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Total processados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sucessos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Erros (com detalhes)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Warnings
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tempo de processamento

7. Testar com arquivo grande:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar Excel com 1000+ registros
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar performance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Progress bar funciona
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sistema não trava

8. Testar formatos de data/hora variados:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - DD/MM/YYYY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - MM/DD/YYYY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - YYYY-MM-DD
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Horários 12h e 24h

---

### 3.4 Galeria de Imagens - Teste Completo

**Status Atual** (baseado em `📊_RESUMO_TESTES_FINAL.md`):

- ✅ 2 arquivos exibidos
- ✅ Filtros presentes (busca, cliente, categoria)
- ⚠️ Upload e outras funções não testadas

**Tarefas**:

1. Testar upload de nova imagem:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Novo Upload"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar arquivo de imagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Preencher metadados:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cliente vinculado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Categoria (Antes, Durante, Depois, Referência)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Descrição
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tags
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar upload
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar aparece na galeria

2. Testar filtros:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Busca por texto**: Digitar "tattoo" e filtrar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Filtro por cliente**: Selecionar "João da Silva"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Filtro por categoria**: Selecionar "Depois"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Combinar filtros**: Busca + Cliente + Categoria
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar resultados corretos

3. Testar lightbox de visualização:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em uma imagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Lightbox abre em tela cheia
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Navegação entre imagens (← →)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Zoom in/out
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão fechar (X ou ESC)

4. Verificar sincronização com Google Drive:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fazer upload de imagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar aparece no Google Drive web
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Estrutura de pastas:
     ```
     TATTOO_PHOTO_CALENDAR/
     ├── clientes/
     │   └── joao-silva/
     │       ├── antes/
     │       ├── durante/
     │       └── depois/
     ```


5. Testar download de imagens:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em botão download
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Arquivo baixado corretamente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Nome do arquivo adequado

6. Testar exclusão de imagens:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar 1 imagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Excluir"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar remoção da galeria
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar remoção do Google Drive

7. Verificar organização por categorias:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - View em grid
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - View em lista
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ordenação (mais recente, mais antigo, nome)

8. Testar upload em lote:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar múltiplas imagens (5-10)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload simultâneo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Progress bar individual
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Todas aparecem na galeria

---

## FASE 4: MELHORIAS DE UX/UI 🎨

### 4.1 Cards Navegáveis no Dashboard

**Evidência**: Atualmente cards não navegam (comportamento esperado mas melhorável)

**Tarefas**:

1. Implementar onClick nos cards estatísticos
2. Card "Total de Clientes":

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ao clicar → navega para aba "Clientes"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Adicionar cursor: pointer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Efeito hover (escala 1.02)

3. Card "Próximos Agendamentos":

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ao clicar → navega para aba "Agendamentos"

4. Card "Arquivos Totais":

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ao clicar → navega para aba "Galeria"

5. Card "Armazenamento":

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ao clicar → navega para aba "Google Drive"

6. Adicionar feedback visual:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Hover state (sombra, escala)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Transition suave (0.2s)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ícone de seta → indicando clicável

7. Testar navegação de todos os cards
8. Adicionar tooltips: "Clique para ver detalhes"

---

### 4.2 Calendário Visual - Melhorias Avançadas

**Status Atual**: Calendário funcional mas pode melhorar

**Tarefas**:

1. Testar exibição de múltiplos eventos no mesmo dia:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar 3 agendamentos no mesmo dia
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar como são exibidos:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Empilhados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Com scroll
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "+2 mais" indicator

2. Implementar diferentes vistas:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Vista Mês** (atual, já funciona)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Vista Semana**: 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mostrar 7 dias com horas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Grid de horários (8h-20h)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Eventos posicionados por horário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Vista Dia**:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 1 dia completo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Horários de 30 em 30 min
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar evento arrastando
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Vista Lista/Agenda**:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Lista de todos os agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Agrupado por data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ordenado cronologicamente

3. Adicionar botões de troca de vista:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mês | Semana | Dia | Lista
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Destacar vista ativa

4. Tooltip com detalhes ao passar mouse:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Nome do cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Horário completo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tipo de tatuagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Status (confirmado, pendente)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Miniatura de referência

5. Testar drag-and-drop para reagendar:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Arrastar evento para outro dia
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Modal de confirmação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Atualizar backend
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sincronizar com Google Calendar

6. Adicionar cores por tipo de agendamento:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tatuagem Grande: Roxo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tatuagem Média: Azul
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tatuagem Pequena: Verde
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Retoque: Amarelo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sessão Completa: Vermelho

7. Implementar resize de eventos:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Arrastar borda do evento para mudar duração

8. Criar evento clicando em dia vazio:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em dia → abre modal
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Data já preenchida

9. Adicionar indicador de conflitos:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Horários sobrepostos em vermelho

10. Filtros de visualização:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Por cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Por tipo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Por status

---

### 4.3 Feedbacks Visuais - Melhorias Gerais

**Tarefas**:

1. Verificar todas as notificações toast:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sucesso (verde, ícone ✓)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Erro (vermelho, ícone ✗)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Warning (amarelo, ícone ⚠)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Info (azul, ícone ℹ)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duração adequada (3-5s)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Posição consistente (top-right)

2. Adicionar loading states em operações assíncronas:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Skeleton loaders em listas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Spinner em botões durante submit
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Progress bar em uploads
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Carregando..." em fetches

3. Implementar skeleton loaders:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Lista de clientes (3 cards pulsando)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Galeria (grid de imagens)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Calendário (enquanto carrega eventos)

4. Adicionar animações de transição:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fade in ao trocar de aba (200ms)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Slide in de modais (300ms)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Bounce em notificações
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Smooth scroll

5. Garantir mensagens de erro claras e acionáveis:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - ❌ Ruim: "Erro ao salvar"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - ✅ Bom: "Não foi possível salvar o cliente. Verifique se o email é válido e tente novamente."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Incluir código de erro quando relevante
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sugerir ação de correção

6. Adicionar confirmações em ações destrutivas:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Excluir cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Excluir agendamento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Excluir arquivo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Modal com botões claros: "Cancelar" (cinza) e "Excluir" (vermelho)

7. Indicadores de status em tempo real:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Badge "Conectado" / "Desconectado" no header
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pulsando quando sincronizando
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tooltip com última sincronização

8. Empty states amigáveis:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ícone ilustrativo grande
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mensagem clara: "Nenhum X cadastrado"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Call-to-action: "Criar primeiro X"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão destacado

---

## FASE 5: VALIDAÇÕES E TRATAMENTO DE ERROS 🛡️

### 5.1 Validações de Formulários - Completas

**Tarefas**:

1. Validar formato de email:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Feedback em tempo real (ao desfocar campo)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mensagem: "Email inválido. Use formato: exemplo@dominio.com"

2. Validar formato de telefone:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aceitar múltiplos formatos:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - (11) 99999-9999
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 11999999999
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - +5511999999999
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Normalizar para E.164 no backend
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Feedback visual (ícone ✓ ou ✗)

3. Validar datas de agendamento:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Não permitir datas no passado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Data fim deve ser depois da data início
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Horário comercial (8h-22h)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duração mínima (30 min)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duração máxima (12h)

4. Validar conflitos de horário:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar agendamentos sobrepostos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Alertar usuário:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Já existe agendamento neste horário com Cliente X"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Permitir forçar se necessário

5. Validar campos obrigatórios:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Marcar com asterisco vermelho (*)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Não permitir submit sem preencher
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Destacar campos faltantes em vermelho
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Scroll até primeiro campo com erro

6. Feedback em tempo real:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Validação ao desfocar campo (onBlur)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Não validar ao digitar (UX ruim)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ícone ✓ quando válido
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mensagem de erro abaixo do campo

7. Validação de arquivos:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tipos permitidos: JPG, PNG, PDF (configurável)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tamanho máximo: 20MB
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Dimensões mínimas para imagens: 800x600px
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mensagem clara quando arquivo rejeitado

---

### 5.2 Tratamento de Erros de API - Robusto

**Tarefas**:

1. Implementar retry automático em falhas de rede:
   ```javascript
   const fetchWithRetry = async (url, options, retries = 3) => {
     try {
       return await fetch(url, options);
     } catch (error) {
       if (retries > 0 && isNetworkError(error)) {
         await delay(1000);
         return fetchWithRetry(url, options, retries - 1);
       }
       throw error;
     }
   };
   ```

2. Mensagens de erro amigáveis:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 400: "Dados inválidos. Verifique os campos e tente novamente."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 401: "Sessão expirada. Faça login novamente."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 403: "Você não tem permissão para esta ação."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 404: "Recurso não encontrado."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 500: "Erro no servidor. Tente novamente em alguns instantes."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Network: "Sem conexão. Verifique sua internet."

3. Logging de erros no backend:
   ```javascript
   logger.error('Erro ao criar cliente', {
     error: error.message,
     stack: error.stack,
     userId: req.user?.id,
     body: req.body,
     timestamp: new Date().toISOString()
   });
   ```

4. Fallback para operações offline:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar em localStorage/IndexedDB
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sync quando reconectar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Indicador "Salvo localmente, aguardando sync"

5. Timeout adequado para requests:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Operações rápidas: 10s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Uploads: 120s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sincronização: 60s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Timeout com mensagem: "Operação demorou muito. Tente novamente."

6. Exibir detalhes técnicos em modo dev:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Console.error com stack trace
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Request ID para debug
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Payload enviado/recebido

7. Página de erro 500 customizada:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mensagem amigável
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão "Voltar ao início"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão "Reportar problema"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Código de erro para suporte

---

### 5.3 Validações de Autenticação Google

**Tarefas**:

1. Detectar token expirado:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Interceptor de requisições
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar response 401
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tentar refresh automático:
     ```javascript
     if (response.status === 401 && hasRefreshToken()) {
       const newToken = await refreshAccessToken();
       // Retry request original
     }
     ```


2. Redirecionar para reautenticação automaticamente:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Modal: "Sessão Google expirada. Reconectar?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão "Reconectar" inicia OAuth flow
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mantém estado da aplicação

3. Manter estado após reautenticação:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar rota atual
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar dados do formulário em andamento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Após OAuth, restaurar estado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Continuar de onde parou

4. Exibir status de conexão em tempo real:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Badge no header:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verde pulsante: "Sincronizando..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verde: "Conectado"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Amarelo: "Reconectando..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Vermelho: "Desconectado"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tooltip com detalhes:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Última sync: há 2 minutos"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - "Próxima sync: em 3 minutos"

5. Validar escopo de permissões:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Drive: read/write
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Calendar: read/write
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Alertar se falta permissão

6. Tratamento de revogação:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Detectar quando usuário revoga acesso
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Desabilitar funcionalidades dependentes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão "Reconectar Google"

---

### 5.4 WebSocket - Reconexão Automática

**Status Atual**: WebSocket conecta/desconecta ao trocar abas (não ideal)

**Tarefas**:

1. Implementar reconexão automática:
   ```javascript
   socket.on('disconnect', () => {
     setTimeout(() => socket.connect(), 1000); // Retry após 1s
   });
   ```

2. Estratégia de backoff exponencial:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 1ª tentativa: 1s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 2ª tentativa: 2s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 3ª tentativa: 4s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Máximo: 30s

3. Exibir indicador de status da conexão:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Badge pequeno no canto inferior direito:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verde: "Online"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Amarelo: "Reconectando..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Vermelho: "Offline"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Animação pulsante ao reconectar

4. Buffer de eventos durante desconexão:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar eventos não enviados em fila
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Enviar todos ao reconectar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Garantir ordem correta

5. Sincronizar dados ao reconectar:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fetch de atualizações perdidas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Comparar timestamps
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Atualizar UI com novidades

6. Heartbeat para manter conexão viva:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ping a cada 30s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Pong esperado em 5s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Reconectar se não responde

7. Evitar reconexões desnecessárias:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Não reconectar ao trocar de aba (manter única conexão)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Não reconectar se janela está em background há muito tempo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Reconnect on focus

---

## FASE 6: TESTES DE INTEGRAÇÃO COMPLETOS 🧪

### 6.1 Fluxo End-to-End: Novo Cliente → Agendamento Completo

**Objetivo**: Validar fluxo completo desde criação de cliente até agendamento sincronizado

**Tarefas**:

1. **Criar novo cliente**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Clientes → Novo Cliente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Nome: "Maria Santos"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Email: "maria@email.com"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Telefone: "(11) 98765-4321"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Endereço: "Rua Teste, 123"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Toast sucesso + cliente na lista

2. **Criar agendamento para este cliente**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Agendar" no card de Maria Santos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Modal abre com Maria pré-selecionada
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Título: "Tatuagem Floral - Braço"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Data: Próxima segunda às 14:00
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duração: 4 horas (até 18:00)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tipo: "Média"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Descrição: "Flores coloridas no braço esquerdo"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar

3. **Verificar no calendário visual**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Navegar para aba Calendário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Localizar próxima segunda
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Evento aparece no dia correto
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar no evento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Popup com todos os detalhes

4. **Fazer upload de foto de referência**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Galeria → Novo Upload
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar imagem
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cliente: Maria Santos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Categoria: "Referência"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tags: "flores, colorido, braço"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Imagem na galeria

5. **Editar agendamento**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Voltar para aba Agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Editar" no agendamento de Maria
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Mudar horário: 15:00 (em vez de 14:00)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Calendário atualizado

6. **Sincronizar com Google Calendar**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Google Drive → Sincronizar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aguardar sync
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Abrir Google Calendar no navegador (calendar.google.com)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Evento "Tatuagem Floral - Braço" aparece
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir: Horário correto (15:00-19:00)

7. **Verificar Google Calendar web**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Título: "Tatuagem Floral - Braço - Maria Santos"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Descrição contém detalhes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Link para sistema local (se implementado)

8. **Marcar como concluído**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Voltar ao sistema local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Concluir" no agendamento
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Modal de confirmação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Opcionalmente fazer upload de foto "Depois"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Salvar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Status mudou para "Concluído"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Agendamento sai do calendário (ou fica com cor diferente)

**Critérios de Sucesso**:

- ✅ Todos os passos executados sem erros
- ✅ Dados consistentes entre todas as abas
- ✅ Sincronização bidirecional funcionando
- ✅ Todas as notificações exibidas
- ✅ Nenhum reload necessário (tempo real)

---

### 6.2 Fluxo: Importação Vagaro → Visualização Completa

**Objetivo**: Validar importação em massa e deduplicação

**Tarefas**:

1. **Preparar planilha Excel - Clientes**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar arquivo `clientes-teste.xlsx` com 20 clientes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Colunas: Nome, Email, Telefone, Endereço
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Incluir 3 duplicatas propositalmente (emails repetidos)

2. **Importar planilha de clientes**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Importar → Excel Vagaro → Clientes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload arquivo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Preview mostra 10 primeiras linhas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir: Mapeamento automático de colunas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ajustar mapeamento se necessário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Importar"

3. **Verificar deduplicação funcionando**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aguardar relatório de importação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 17 clientes criados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 3 clientes ignorados (duplicatas)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Lista de duplicatas com detalhes

4. **Conferir dados no dashboard**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Navegar para Dashboard
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Card "Total Clientes" aumentou de 5 para 22

5. **Preparar planilha Excel - Agendamentos**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar arquivo `agendamentos-teste.xlsx` com 15 agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Colunas: Cliente (email), Data, Hora Início, Hora Fim, Tipo, Descrição
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Datas variadas (passado, hoje, futuro)

6. **Importar planilha de agendamentos**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Importar → Excel Vagaro → Agendamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload arquivo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Preview
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Sistema vincula automaticamente com clientes por email
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Importar

7. **Verificar no calendário visual**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Navegar para Calendário
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Múltiplos dias com eventos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cores diferentes por tipo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em alguns dias: Detalhes corretos

8. **Sincronizar com Google Calendar**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Importar → Google Calendar → Sincronizar Agora
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aguardar (~30s para 15 eventos)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Relatório de sincronização
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - X eventos criados no Google
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Y eventos atualizados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Z eventos já existentes (ignorados)

9. **Reimportar mesmo arquivo (teste deduplicação)**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Importar `clientes-teste.xlsx` novamente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar relatório:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 0 clientes criados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 17 clientes atualizados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - 3 ignorados (duplicatas)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar: Nenhum cliente duplicado na lista

**Critérios de Sucesso**:

- ✅ Importação de 20+ registros bem-sucedida
- ✅ Deduplicação funciona (0 duplicatas criadas)
- ✅ Vinculação automática cliente ↔ agendamento OK
- ✅ Calendário exibe todos os eventos
- ✅ Sincronização Google sem erros
- ✅ Reimportação não cria duplicatas

---

### 6.3 Fluxo: Google Drive End-to-End Completo

**Objetivo**: Validar integração completa com Google Drive

**Tarefas**:

1. **Fazer upload de arquivo pela interface**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aba Google Drive → Upload
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar imagem (ex: `tattoo-exemplo.jpg`)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aguardar upload (progress bar)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Toast "Upload concluído!"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Imagem aparece na lista

2. **Verificar aparece no Google Drive web**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Abrir [drive.google.com](https://drive.google.com) em nova aba
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Navegar para pasta `TATTOO_PHOTO_CALENDAR`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Arquivo `tattoo-exemplo.jpg` presente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir: Data/hora de modificação

3. **Navegar nas pastas do Google Drive** (após implementar Fase 2.1):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Voltar ao sistema local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Duplo-clicar em pasta `TATTOO_PHOTO_CALENDAR`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Conteúdo da pasta carregado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Breadcrumb mostra: `Meu Drive > TATTOO_PHOTO_CALENDAR`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar subpasta "Clientes"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Entrar na subpasta "Clientes"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Breadcrumb: `Meu Drive > TATTOO_PHOTO_CALENDAR > Clientes`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Botão "Voltar" disponível

4. **Fazer download de arquivo**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar arquivo `tattoo-exemplo.jpg`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em "Baixar" (ou menu contexto → Baixar)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Download iniciado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir: Arquivo baixado na pasta Downloads
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Nome correto, tamanho igual ao original

5. **Excluir arquivo**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Selecionar arquivo `tattoo-exemplo.jpg`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Clicar em menu (⋮) → Excluir
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Modal de confirmação: "Tem certeza?"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Confirmar
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Arquivo removido da lista
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Toast: "Arquivo excluído com sucesso"

6. **Verificar exclusão sincronizada**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Voltar ao Google Drive web
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Atualizar página (F5)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Verificar: Arquivo `tattoo-exemplo.jpg` não está mais lá
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Conferir: Arquivo na Lixeira do Google Drive

7. **Testar outras operações**:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Renomear**: Renomear pasta → verificar no web
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Mover**: Mover arquivo para outra pasta
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Compartilhar**: Gerar link compartilhável
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Copiar Link**: Copiar e colar em navegador

**Critérios de Sucesso**:

- ✅ Upload rápido e confiável
- ✅ Sincronização bidirecional perfeita
- ✅ Navegação de pastas funcionando
- ✅ Download sem erros
- ✅ Exclusão sincronizada
- ✅ Todas operações refletem no Google Drive web

---

## FASE 7: PERFORMANCE E OTIMIZAÇÃO ⚡

### 7.1 Backend - Otimizações

**Tarefas**:

1. Adicionar índices de banco necessários:
   ```sql
   -- Clientes
   CREATE INDEX idx_clients_email ON clients(email);
   CREATE INDEX idx_clients_phone ON clients(phone_normalized);
   CREATE INDEX idx_clients_name ON clients(name);
   
   -- Agendamentos
   CREATE INDEX idx_appointments_date ON appointments(start_time);
   CREATE INDEX idx_appointments_client ON appointments(client_id);
   CREATE INDEX idx_appointments_status ON appointments(status);
   
   -- Arquivos
   CREATE INDEX idx_files_client ON files(client_id);
   CREATE INDEX idx_files_category ON files(category);
   ```

2. Implementar cache para queries frequentes:
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 300 }); // 5 min
   
   app.get('/api/clients', async (req, res) => {
     const cached = cache.get('clients_list');
     if (cached) return res.json(cached);
     
     const clients = await db.getAllClients();
     cache.set('clients_list', clients);
     res.json(clients);
   });
   ```

3. Otimizar queries N+1:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Usar JOIN em vez de queries aninhadas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Eager loading de relacionamentos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Exemplo:
     ```javascript
     // ❌ N+1 problem
     const clients = await db.getClients();
     for (let client of clients) {
       client.appointments = await db.getAppointments(client.id);
     }
     
     // ✅ Otimizado
     const clients = await db.query(`
       SELECT c.*, COUNT(a.id) as appointment_count
       FROM clients c
       LEFT JOIN appointments a ON a.client_id = c.id
       GROUP BY c.id
     `);
     ```


4. Implementar paginação em listagens grandes:
   ```javascript
   app.get('/api/clients', async (req, res) => {
     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 20;
     const offset = (page - 1) * limit;
     
     const clients = await db.query(
       'SELECT * FROM clients LIMIT ? OFFSET ?',
       [limit, offset]
     );
     
     const total = await db.query('SELECT COUNT(*) FROM clients');
     
     res.json({
       data: clients,
       page,
       limit,
       total: total[0].count,
       pages: Math.ceil(total[0].count / limit)
     });
   });
   ```

5. Comprimir respostas HTTP (gzip):
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

6. Rate limiting para prevenir abuso:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 min
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

7. Otimizar uploads:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Stream direto para Google Drive (não salvar local primeiro)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Compressão de imagens (sharp)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Thumbnails automáticos

---

### 7.2 Frontend - Otimizações

**Tarefas**:

1. Lazy loading de imagens na galeria:
   ```jsx
   <img 
     src={thumbnail} 
     loading="lazy"
     alt={alt}
   />
   ```

2. Code splitting por rotas:
   ```javascript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Clients = lazy(() => import('./pages/Clients'));
   
   <Suspense fallback={<Loading />}>
     <Routes>
       <Route path="/" element={<Dashboard />} />
       <Route path="/clients" element={<Clients />} />
     </Routes>
   </Suspense>
   ```

3. Memoização de componentes pesados:
   ```jsx
   const ClientCard = React.memo(({ client }) => {
     return <div>{client.name}</div>;
   });
   
   const expensiveCalculation = useMemo(() => {
     return calculateStats(data);
   }, [data]);
   ```

4. Virtualização de listas longas:
   ```jsx
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={clients.length}
     itemSize={100}
     width="100%"
   >
     {({ index, style }) => (
       <div style={style}>
         <ClientCard client={clients[index]} />
       </div>
     )}
   </FixedSizeList>
   ```

5. Otimizar bundle size:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Analisar bundle: `npm run build -- --analyze`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tree shaking automático
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Remover lodash/moment (usar date-fns)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Usar imports específicos:
     ```javascript
     // ❌ Import tudo
     import _ from 'lodash';
     // ✅ Import específico
     import debounce from 'lodash/debounce';
     ```


6. Service Worker para cache:
   ```javascript
   // vite.config.js
   import { VitePWA } from 'vite-plugin-pwa';
   
   export default {
     plugins: [
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ]
   };
   ```

7. Prefetch de dados:
   ```javascript
   // Prefetch ao hover em links
   <Link to="/clients" onMouseEnter={() => prefetchClients()}>
     Clientes
   </Link>
   ```


---

### 7.3 Upload de Arquivos - Otimizações Avançadas

**Tarefas**:

1. Implementar upload em chunks:
   ```javascript
   const uploadFileInChunks = async (file) => {
     const chunkSize = 1024 * 1024; // 1MB chunks
     const chunks = Math.ceil(file.size / chunkSize);
     
     for (let i = 0; i < chunks; i++) {
       const start = i * chunkSize;
       const end = Math.min(file.size, start + chunkSize);
       const chunk = file.slice(start, end);
       
       await uploadChunk(chunk, i, chunks);
       updateProgress((i + 1) / chunks * 100);
     }
   };
   ```

2. Progress bar preciso:
   ```jsx
   const [progress, setProgress] = useState(0);
   
   const config = {
     onUploadProgress: (progressEvent) => {
       const percent = (progressEvent.loaded / progressEvent.total) * 100;
       setProgress(Math.round(percent));
     }
   };
   
   <ProgressBar value={progress} max={100} />
   ```

3. Cancelamento de uploads:
   ```javascript
   const cancelToken = axios.CancelToken.source();
   
   const upload = async () => {
     try {
       await axios.post('/upload', file, {
         cancelToken: cancelToken.token
       });
     } catch (error) {
       if (axios.isCancel(error)) {
         console.log('Upload cancelado');
       }
     }
   };
   
   <button onClick={() => cancelToken.cancel()}>
     Cancelar Upload
   </button>
   ```

4. Retry automático em falhas:
   ```javascript
   const uploadWithRetry = async (file, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await upload(file);
       } catch (error) {
         if (i === retries - 1) throw error;
         await delay(Math.pow(2, i) * 1000); // Exponential backoff
       }
     }
   };
   ```

5. Compressão de imagens antes do upload:
   ```javascript
   import imageCompression from 'browser-image-compression';
   
   const compressImage = async (file) => {
     const options = {
       maxSizeMB: 2,
       maxWidthOrHeight: 1920,
       useWebWorker: true
     };
     
     return await imageCompression(file, options);
   };
   ```

6. Upload múltiplo paralelo (limitado):
   ```javascript
   const uploadMultiple = async (files) => {
     const limit = 3; // Max 3 simultâneos
     const queue = [...files];
     const results = [];
     
     while (queue.length > 0) {
       const batch = queue.splice(0, limit);
       const batchResults = await Promise.all(
         batch.map(file => upload(file))
       );
       results.push(...batchResults);
     }
     
     return results;
   };
   ```


---

## FASE 8: CLEANUP E DOCUMENTAÇÃO 📚

### 8.1 Limpeza de Código

**Tarefas**:

1. Remover console.logs desnecessários:
   ```bash
   # Buscar todos console.log
   grep -r "console.log" src/
   
   # Remover logs de debug
   # Manter apenas logs importantes (errors, warnings)
   ```

2. Remover código comentado:
   ```bash
   # Buscar blocos comentados grandes
   grep -E "^s*//(.*)" src/ -r
   
   # Deletar código morto
   ```

3. Remover dependências não utilizadas:
   ```bash
   npx depcheck
   
   # Remover do package.json
   npm uninstall <package-name>
   ```

4. Organizar imports:
   ```javascript
   // ✅ Ordem correta:
   // 1. Node modules
   import React from 'react';
   import axios from 'axios';
   
   // 2. Absolute imports
   import Button from '@/components/Button';
   
   // 3. Relative imports
   import './styles.css';
   ```

5. Aplicar linter/prettier em todo código:
   ```bash
   # ESLint
   npm run lint -- --fix
   
   # Prettier
   npm run format
   
   # Ou ambos
   npm run lint:fix && npm run format
   ```

6. Remover arquivos não utilizados:
   ```bash
   # Buscar arquivos nunca importados
   npx unimported
   
   # Deletar arquivos órfãos
   ```

7. Revisar e melhorar nomes de variáveis:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - ❌ `const d = new Date();`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - ✅ `const currentDate = new Date();`

---

### 8.2 Limpeza de Dados de Teste

**Evidência**: 5 clientes (3 são de teste MCP)

**Tarefas**:

1. Criar script de limpeza `cleanup-test-data.js`:
   ```javascript
   const db = require('./database/db');
   
   async function cleanup() {
     console.log('🧹 Iniciando limpeza de dados de teste...');
     
     // Backup primeiro
     await backupDatabase();
     
     // Remover clientes de teste
     const testClients = await db.query(`
       SELECT id FROM clients 
       WHERE name LIKE '%MCP%' 
       OR email = 'mcp@test.com'
       OR email = 'joao.teste@email.com'
     `);
     
     for (let client of testClients) {
       await db.deleteClient(client.id);
     }
     
     // Resetar configurações duplicadas
     await removeDuplicateTattooTypes();
     
     // Remover agendamentos de teste
     await db.query(`
       DELETE FROM appointments 
       WHERE description LIKE '%teste%'
       OR title LIKE '%teste%'
     `);
     
     console.log('✅ Limpeza concluída!');
   }
   
   cleanup();
   ```

2. Remover clientes de teste (MCP_*):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cliente_MCP_1761155612529
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Cliente_MCP_Teste_1761155261119
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - João da Silva Teste

3. Remover agendamentos de teste vinculados
4. Resetar configurações duplicadas (já feito na Fase 1.1)
5. Executar backup ANTES da limpeza:
   ```bash
   cp agenda_hibrida.db backups/pre-cleanup-$(date +%Y%m%d-%H%M%S).db
   ```

6. Executar limpeza:
   ```bash
   node cleanup-test-data.js
   ```

7. Verificar resultado:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Abrir interface
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Dashboard deve mostrar apenas clientes reais
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Configurações sem duplicatas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Agendamentos limpos

---

### 8.3 Documentação Completa

**Tarefas**:

1. Atualizar README.md principal:
   ```markdown
   # Agenda Híbrida - Tattoo Photo Calendar
   
   Sistema completo de gerenciamento de agenda para tatuadores...
   
   ## 📸 Screenshots
   [Incluir 5-6 screenshots principais]
   
   ## ✨ Funcionalidades
   - ✅ Gestão de clientes
   - ✅ Agendamentos com calendário visual
   - ✅ Galeria de fotos sincronizada
   - ✅ Integração Google Drive + Calendar
   - ✅ Sistema híbrido de armazenamento
   
   ## 🚀 Instalação
   [Passo a passo detalhado]
   
   ## 🔧 Configuração
   [Variáveis de ambiente, OAuth, etc]
   
   ## 📖 Uso
   [Como usar cada funcionalidade]
   
   ## 🐛 Troubleshooting
   [Problemas comuns e soluções]
   ```

2. Documentar variáveis de ambiente:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar `.env.example` completo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Adicionar comentários explicativos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Listar variáveis obrigatórias vs opcionais

3. Criar guia de instalação passo a passo:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `docs/INSTALACAO.md`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Requisitos (Node, npm, Google account)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Instalação backend
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Instalação frontend
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Configuração OAuth
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Primeira execução

4. Documentar API endpoints (Swagger/OpenAPI):
   ```javascript
   /**
    * @swagger
    * /api/clients:
    *   get:
    *     summary: Lista todos os clientes
    *     responses:
    *       200:
    *         description: Lista de clientes
    */
   app.get('/api/clients', getClients);
   ```

5. Criar troubleshooting guide:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Problemas comuns:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Google OAuth não funciona
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Erro 500 em importação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - WebSocket não conecta
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Upload falha
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Soluções passo a passo

6. Documentar arquitetura do sistema:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - `docs/ARQUITETURA.md`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Diagrama de componentes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fluxo de dados
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tecnologias usadas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Estrutura de pastas

7. Criar CHANGELOG.md:
   ```markdown
   # Changelog
   
   ## [1.0.0] - 2025-10-27
   ### Added
   - Sistema completo de gestão de clientes
   - Calendário visual com sincronização Google
   - Galeria de fotos
   - Importação de dados (Excel, ICS)
   
   ### Fixed
   - Duplicação de tipos de tatuagem
   - Modal Dashboard não abria
   - Erro 500 em importação
   ```


---

## FASE 9: TESTES AUTOMATIZADOS 🤖

### 9.1 Testes Unitários - Backend

**Tarefas**:

1. Setup de testes:
   ```bash
   npm install --save-dev jest supertest
   ```

2. Testar serviço de deduplicação:
   ```javascript
   // services/__tests__/dedupService.test.js
   describe('DedupService', () => {
     test('deve detectar duplicata por telefone', () => {
       const result = dedupService.findDuplicate('+5511999999999');
       expect(result).toBeTruthy();
     });
     
     test('deve ignorar telefones diferentes', () => {
       const result = dedupService.findDuplicate('+5511888888888');
       expect(result).toBeFalsy();
     });
   });
   ```

3. Testar normalização de telefones:
   ```javascript
   test('deve normalizar telefone brasileiro', () => {
     expect(phoneNormalizer('(11) 99999-9999'))
       .toBe('+5511999999999');
   });
   ```

4. Testar importação Excel:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Parse de arquivo válido
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Detecção de colunas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tratamento de erros

5. Testar parse ICS:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Eventos simples
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Eventos recorrentes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Fusos horários

6. Testar autenticação Google:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Token válido
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Token expirado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Refresh token

7. Executar testes:
   ```bash
   npm test -- --coverage
   ```


---

### 9.2 Testes de Integração - API

**Tarefas**:

1. Setup:
   ```javascript
   const request = require('supertest');
   const app = require('../server');
   ```

2. Testar CRUD de clientes:
   ```javascript
   describe('Clients API', () => {
     test('POST /api/clients cria novo cliente', async () => {
       const res = await request(app)
         .post('/api/clients')
         .send({
           name: 'Test Client',
           email: 'test@example.com',
           phone: '11999999999'
         });
       
       expect(res.status).toBe(201);
       expect(res.body.name).toBe('Test Client');
     });
     
     test('GET /api/clients lista todos', async () => {
       const res = await request(app).get('/api/clients');
       expect(res.status).toBe(200);
       expect(Array.isArray(res.body)).toBeTruthy();
     });
   });
   ```

3. Testar CRUD de agendamentos
4. Testar upload de arquivos
5. Testar importação de dados
6. Testar sincronização Google (mockar API)
7. Executar:
   ```bash
   npm run test:integration
   ```


---

### 9.3 Testes E2E - Frontend

**Tarefas** (usar Playwright, já disponível):

1. Testar fluxo de criação de cliente:
   ```javascript
   test('criar novo cliente', async ({ page }) => {
     await page.goto('http://localhost:5173');
     await page.click('text=Clientes');
     await page.click('text=Novo Cliente');
     await page.fill('[name="name"]', 'Test Client E2E');
     await page.fill('[name="email"]', 'e2e@test.com');
     await page.fill('[name="phone"]', '11999999999');
     await page.click('button:has-text("Salvar")');
     
     await expect(page.locator('text=Cliente criado com sucesso')).toBeVisible();
   });
   ```

2. Testar fluxo completo de agendamento
3. Testar navegação entre abas
4. Testar upload de arquivos
5. Testar importação de dados
6. Screenshots automáticos em caso de falha
7. Executar:
   ```bash
   npm run test:e2e
   ```


---

### 9.4 CI/CD Pipeline

**Tarefas**:

1. Criar `.github/workflows/test.yml`:
   ```yaml
   name: Tests
   
   on: [push, pull_request]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '22'
         
         - name: Install dependencies
           run: |
             cd agenda-hibrida-v2 && npm ci
             cd ../agenda-hibrida-frontend && npm ci
         
         - name: Run backend tests
           run: cd agenda-hibrida-v2 && npm test
         
         - name: Run frontend tests
           run: cd agenda-hibrida-frontend && npm test
         
         - name: Build frontend
           run: cd agenda-hibrida-frontend && npm run build
   ```

2. Rodar testes automaticamente em PRs
3. Bloquear merge se testes falharem
4. Build e validação de produção
5. Deploy automático (opcional):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Heroku
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Vercel (frontend)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - VPS próprio

---

## FASE 10: SEGURANÇA E OPERAÇÃO 🔒

### 10.1 Segurança - Revisão Completa

**Tarefas**:

1. Revisar CORS configuration:
   ```javascript
   const cors = require('cors');
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. Implementar rate limiting:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 min
     max: 100, // max 100 requests
     message: 'Muitas requisições, tente novamente mais tarde'
   });
   
   app.use('/api/', limiter);
   ```

3. Validação de inputs server-side:
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   app.post('/api/clients', [
     body('email').isEmail().normalizeEmail(),
     body('name').trim().notEmpty(),
     body('phone').isMobilePhone('pt-BR')
   ], (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     // ...
   });
   ```

4. Sanitização de dados:
   ```javascript
   const xss = require('xss');
   
   const sanitize = (input) => {
     return xss(input.trim());
   };
   ```

5. Headers de segurança (helmet.js):
   ```javascript
   const helmet = require('helmet');
   
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"]
       }
     }
   }));
   ```

6. Revisar permissões de arquivos:
   ```bash
   # Uploads não devem ser executáveis
   chmod 644 uploads/*
   chmod 755 uploads/
   
   # .env não deve ser legível por outros
   chmod 600 .env
   ```

7. SQL Injection prevention:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Usar prepared statements sempre
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Nunca concatenar strings em queries
   ```javascript
   // ❌ Vulnerável
   db.query(`SELECT * FROM users WHERE id = ${userId}`);
   
   // ✅ Seguro
   db.query('SELECT * FROM users WHERE id = ?', [userId]);
   ```


---

### 10.2 Secrets Management - Validação

**Tarefas**:

1. Garantir que `.env` não está no git:
   ```bash
   # Verificar .gitignore
   cat .gitignore | grep .env
   
   # Verificar se está no repo
   git ls-files | grep .env
   
   # Se encontrou, remover do histórico
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

2. Validar que `google-credentials.json` não está exposto:
   ```bash
   cat .gitignore | grep google-credentials
   git ls-files | grep google-credentials
   ```

3. Revisar tokens no código:
   ```bash
   # Buscar por secrets hardcoded
   grep -rE "(password|secret|token|key).*=.*['\"]" src/
   
   # Remover qualquer token encontrado
   ```

4. Implementar rotação de secrets:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Google OAuth: Revogar e criar novos tokens trimestralmente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Database: Sem password (SQLite local), mas criar se usar remote DB

5. Usar variáveis de ambiente para todos os secrets:
   ```javascript
   // ❌ Nunca
   const apiKey = 'sk_test_abc123';
   
   // ✅ Sempre
   const apiKey = process.env.API_KEY;
   ```

6. Criar `.env.example` sem valores sensíveis:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_secret_here
   
   # Não inclua valores reais!
   ```


---

### 10.3 Logging e Monitoring - Implementação

**Tarefas**:

1. Estruturar logs (Winston):
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ 
         filename: 'logs/error.log', 
         level: 'error' 
       }),
       new winston.transports.File({ 
         filename: 'logs/combined.log' 
       })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   
   module.exports = logger;
   ```

2. Logs rotativos por tamanho/data:
   ```javascript
   new winston.transports.DailyRotateFile({
     filename: 'logs/app-%DATE%.log',
     datePattern: 'YYYY-MM-DD',
     maxSize: '20m',
     maxFiles: '14d'
   });
   ```

3. Monitoramento de erros (Sentry opcional):
   ```javascript
   const Sentry = require('@sentry/node');
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.errorHandler());
   ```

4. Métricas de performance:
   ```javascript
   const responseTime = require('response-time');
   
   app.use(responseTime((req, res, time) => {
     logger.info('Request', {
       method: req.method,
       url: req.url,
       time: `${time}ms`
     });
   }));
   ```

5. Health check endpoint:
   ```javascript
   app.get('/health', (req, res) => {
     const healthcheck = {
       uptime: process.uptime(),
       status: 'OK',
       timestamp: Date.now(),
       checks: {
         database: checkDatabase(),
         google: checkGoogleConnection(),
         storage: checkStorageAvailable()
       }
     };
     
     res.json(healthcheck);
   });
   ```

6. Dashboard de logs (opcional):

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - ELK Stack (Elasticsearch, Logstash, Kibana)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Grafana + Loki
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Ou simplesmente `tail -f logs/*.log`

---

### 10.4 Backup e Recuperação - Implementação

**Tarefas**:

1. Implementar backup automático do SQLite:
   ```javascript
   const schedule = require('node-schedule');
   const fs = require('fs-extra');
   
   // Backup diário às 3h da manhã
   schedule.scheduleJob('0 3 * * *', async () => {
     const date = new Date().toISOString().split('T')[0];
     const backupPath = `backups/agenda_hibrida_${date}.db`;
     
     await fs.copy('agenda_hibrida.db', backupPath);
     logger.info(`Backup criado: ${backupPath}`);
     
     // Manter apenas últimos 30 dias
     cleanOldBackups(30);
   });
   ```

2. Backup dos uploads locais:
   ```bash
   #!/bin/bash
   # scripts/backup-uploads.sh
   
   DATE=$(date +%Y-%m-%d)
   BACKUP_DIR="backups/uploads_$DATE"
   
   mkdir -p $BACKUP_DIR
   cp -r uploads/* $BACKUP_DIR/
   tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
   rm -rf $BACKUP_DIR
   
   echo "Backup uploads criado: $BACKUP_DIR.tar.gz"
   ```

3. Procedimento de restauração:
   ````markdown
   ## Como Restaurar Backup
   
   ### 1. Parar servidor
   ```bash
   pm2 stop agenda-hibrida
   ````


### 2. Restaurar banco

   ```bash
   cp backups/agenda_hibrida_2025-10-27.db agenda_hibrida.db
   ```

### 3. Restaurar uploads

   ```bash
   tar -xzf backups/uploads_2025-10-27.tar.gz
   cp -r uploads_2025-10-27/* uploads/
   ```

### 4. Reiniciar

   ```bash
   pm2 start agenda-hibrida
   ```

   ````
   4. Testar recuperação de desastre:
   - Simular perda de dados
   - Executar procedimento de restauração
   - Validar integridade dos dados
   - Verificar funcionalidades
   - Documentar tempo de recuperação (RTO)
   5. Backup para Google Drive (redundância):
   ```javascript
   async function backupToGoogleDrive() {
     const backupFile = 'agenda_hibrida.db';
     const drive = getDriveClient();
     
     await drive.files.create({
       requestBody: {
         name: `backup_${Date.now()}.db`,
         parents: ['BACKUP_FOLDER_ID']
       },
       media: {
         mimeType: 'application/x-sqlite3',
         body: fs.createReadStream(backupFile)
       }
     });
   }
   ````

---

## FASE 11: PREPARAÇÃO PARA RELEASE 🚀

### 11.1 Versionamento - Sistema Semântico

**Tarefas**:

1. Definir versão inicial (1.0.0):
   ```json
   // package.json (backend e frontend)
   {
     "version": "1.0.0"
   }
   ```

2. Criar CHANGELOG.md:
   ```markdown
   # Changelog
   
   Todas as mudanças notáveis neste projeto serão documentadas aqui.
   
   O formato é baseado em [Keep a Changelog](https://keepachangelog.com/)
   e este projeto adere ao [Semantic Versioning](https://semver.org/).
   
   ## [1.0.0] - 2025-10-27
   
   ### Added
   - Sistema completo de gestão de clientes
   - Agendamentos com calendário visual interativo
   - Integração Google Drive para armazenamento de fotos
   - Integração Google Calendar para sincronização bidirecional
   - Galeria de fotos com categorização
   - Importação de dados via Excel (Vagaro) e ICS
   - Sistema híbrido de armazenamento (Local + Cloud)
   - WebSocket para atualizações em tempo real
   - Deduplicação automática de dados
   - Interface moderna e responsiva
   
   ### Fixed
   - Duplicação massiva de tipos de tatuagem (200+ registros)
   - Modal de agendamento do Dashboard não abria
   - Erro 500 em API de importação
   - OAuth Google desabilitado
   - Navegação em pastas do Google Drive não implementada
   
   ### Security
   - Rate limiting implementado
   - Validação server-side de inputs
   - Headers de segurança (Helmet)
   - CORS configurado corretamente
   ```

3. Taggear releases no git:
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0 - Sistema completo e funcional"
   git push origin v1.0.0
   ```

4. Documentar breaking changes:
   ```markdown
   ## Breaking Changes
   
   Nenhum (primeira versão)
   
   ## Migration Guide
   
   Para usuários de versões anteriores (beta):
   1. Fazer backup do banco de dados
   2. Executar script de migração: `node migrate-to-v1.js`
   3. Limpar cache do navegador
   4. Reautenticar com Google
   ```

5. Seguir Semantic Versioning para futuras versões:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - MAJOR (1.x.x): Mudanças incompatíveis
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - MINOR (x.1.x): Novas funcionalidades compatíveis
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - PATCH (x.x.1): Correções de bugs

---

### 11.2 Build de Produção - Otimizado

**Tarefas**:

1. Otimizar build do frontend:
   ```bash
   cd agenda-hibrida-frontend
   
   # Build otimizado
   npm run build
   
   # Analisar bundle
   npm run build -- --analyze
   
   # Verificar tamanho
   ls -lh dist/assets/
   ```

2. Minificar assets:
   ```javascript
   // vite.config.js
   export default {
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true, // Remove console.logs
           drop_debugger: true
         }
       },
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
           }
         }
       }
     }
   };
   ```

3. Configurar variáveis de produção:
   ```env
   # .env.production
   NODE_ENV=production
   VITE_API_URL=https://api.seudominio.com
   VITE_WS_URL=wss://api.seudominio.com
   ```

4. Testar build em ambiente limpo:
   ```bash
   # Simular ambiente de produção
   docker run -it --rm \
     -v $(pwd):/app \
     -w /app \
     node:22 \
     bash -c "npm ci && npm run build && npm start"
   ```

5. Verificar performance:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Lighthouse (Google Chrome DevTools)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Meta: Score > 90 em todas as categorias
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Bundle size < 500KB (gzipped)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - First Contentful Paint < 1.5s

6. Gerar source maps apenas para debug:
   ```javascript
   build: {
     sourcemap: process.env.NODE_ENV !== 'production'
   }
   ```


---

### 11.3 Deploy - Estratégia e Automação

**Tarefas**:

1. Escolher estratégia de deploy:

**Opção A: VPS Próprio** (Recomendado para controle total)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - DigitalOcean Droplet ($12/mês)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - AWS EC2 t3.micro
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Linode

**Opção B: PaaS**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Backend: Heroku, Render.com
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Frontend: Vercel, Netlify

**Opção C: Serverless**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Backend: AWS Lambda + API Gateway
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Frontend: Vercel

2. Documentar processo de deploy (VPS):
   ````markdown
   # Deploy em Produção
   
   ## 1. Preparar servidor
   ```bash
   # Atualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Node.js 22
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Instalar PM2
   sudo npm install -g pm2
   
   # Instalar Nginx
   sudo apt install -y nginx
   ````


## 2. Clonar repositório

   ```bash
   cd /var/www
   git clone https://github.com/seu-usuario/tattoo-calendar.git
   cd tattoo-calendar
   ```

## 3. Backend

   ```bash
   cd agenda-hibrida-v2
   npm ci --production
   cp .env.example .env
   # Editar .env com valores de produção
   
   # Executar migrações
   node database/run-migrations.js
   
   # Iniciar com PM2
   pm2 start server.js --name "tattoo-backend"
   pm2 save
   pm2 startup
   ```

## 4. Frontend

   ```bash
   cd ../agenda-hibrida-frontend
   npm ci
   npm run build
   
   # Copiar build para Nginx
   sudo cp -r dist/* /var/www/html/
   ```

## 5. Configurar Nginx

   ```nginx
   server {
     listen 80;
     server_name seudominio.com;
     
     location / {
       root /var/www/html;
       try_files $uri $uri/ /index.html;
     }
     
     location /api {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## 6. SSL (Let's Encrypt)

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seudominio.com
   ```

   ````
   
   3. Criar scripts de deploy:
   ```bash
   #!/bin/bash
   # scripts/deploy.sh
   
   echo "🚀 Iniciando deploy..."
   
   # Pull latest
   git pull origin main
   
   # Backend
   cd agenda-hibrida-v2
   npm ci --production
   pm2 restart tattoo-backend
   
   # Frontend
   cd ../agenda-hibrida-frontend
   npm ci
   npm run build
   sudo cp -r dist/* /var/www/html/
   
   # Reload Nginx
   sudo systemctl reload nginx
   
   echo "✅ Deploy concluído!"
   ````

4. Testar em staging primeiro:

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Criar ambiente staging idêntico a produção
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Deploy para staging
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Testes completos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Aprovação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Deploy para produção

5. Rollback plan:
   ```bash
   # scripts/rollback.sh
   
   # Voltar para versão anterior
   git checkout v1.0.0
   
   # Backend
   cd agenda-hibrida-v2
   npm ci --production
   pm2 restart tattoo-backend
   
   # Frontend
   cd ../agenda-hibrida-frontend
   npm run build
   sudo cp -r dist/* /var/www/html/
   ```


---

### 11.4 Checklist Final de Release - Validação Completa

**Tarefas** (Verificar TUDO antes de liberar):

1. **✅ Todos os testes passando**
   ```bash
   npm run test:all
   # Backend: 100% passed
   # Frontend: 100% passed
   # E2E: 100% passed
   ```

2. **✅ Documentação completa**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] README.md atualizado com screenshots
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] INSTALACAO.md completo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] ARQUITETURA.md documentado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] API documentada (Swagger)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] CHANGELOG.md criado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] TROUBLESHOOTING.md com problemas comuns
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Comentários no código importantes
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] .env.example completo

3. **✅ Sem bugs críticos**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Bug duplicação RESOLVIDO
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Modal Dashboard RESOLVIDO
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Erro 500 importação RESOLVIDO
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] OAuth Google FUNCIONANDO
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Navegação pastas IMPLEMENTADA
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] 0 bugs críticos abertos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] 0 erros de console
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] 0 warnings importantes

4. **✅ Performance aceitável**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Lighthouse Score > 90
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] First Contentful Paint < 1.5s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Time to Interactive < 3s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Largest Contentful Paint < 2.5s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Cumulative Layout Shift < 0.1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Bundle size < 500KB gzipped
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] API response time < 200ms (média)

5. **✅ Backup configurado**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Backup automático diário implementado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Backup testado e recuperação validada
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Procedimento de restauração documentado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Backups redundantes (local + cloud)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Retenção configurada (30 dias)

6. **✅ Monitoring ativo**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Logs estruturados (Winston)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Health check endpoint (/health)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Error tracking (Sentry ou equivalente)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Performance metrics
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Uptime monitoring (opcional)

7. **✅ README atualizado com screenshots**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] 5-6 screenshots principais
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] GIF demonstrativo (opcional)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Badges (versão, testes, licença)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Links para documentação
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Seção de contribuição
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Roadmap futuro

8. **✅ Guia de contribuição**
   ```markdown
   # CONTRIBUTING.md
   
   ## Como Contribuir
   
   1. Fork o projeto
   2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
   3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
   4. Push para a branch (`git push origin feature/MinhaFeature`)
   5. Abra um Pull Request
   
   ## Padrões de Código
   
   - ESLint + Prettier
   - Conventional Commits
   - Testes obrigatórios para novas features
   - Documentação atualizada
   ```

9. **✅ Licença definida**
   ```markdown
   # LICENSE
   
   MIT License
   
   Copyright (c) 2025 Seu Nome
   
   [Texto completo da licença MIT]
   ```

10. **✅ Segurança validada**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Sem secrets no código
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] .env não commitado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] CORS configurado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Rate limiting ativo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Input validation implementada
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] SQL injection prevented
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] XSS protection ativa

11. **✅ Ambiente de produção pronto**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Servidor configurado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] SSL/HTTPS configurado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] DNS apontando corretamente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Firewall configurado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] PM2 com auto-restart
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Nginx configurado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Backup automático ativo

12. **✅ Comunicação preparada**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Release notes escritas
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Email para usuários beta
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Post em redes sociais (se aplicável)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - [x] Comunicado em canais relevantes

**Assinatura Final**:

```
✅ Sistema validado e pronto para produção!

Validado por: _________________
Data: 27 de Outubro de 2025
Versão: 1.0.0
```

---

## MATRIZ DE PRIORIDADES ATUALIZADA

### 🔴 URGENTE (Fazer Primeiro) - 4 items

1. **Corrigir duplicação em Configurações** (~200+ registros) - 2h
2. **Corrigir modal Dashboard** (estado muda mas não renderiza) - 1h
3. **Resolver erro 500 em Importar Dados** (API endpoint) - 2h
4. **Reabilitar OAuth Google** (Client desabilitado no Console) - 1h

**Total Fase Urgente**: ~6 horas

---

### 🟡 IMPORTANTE (Fazer em Seguida) - 8 items

5. **Navegação de pastas no Google Drive** (funcionalidade faltante) - 3h
6. **Testes CRUD completos de Agendamentos** (criar, editar, excluir) - 2h
7. **Testes CRUD completos de Clientes** (editar, excluir, histórico) - 2h
8. **Testes completos de Importação** (Excel, ICS, deduplicação) - 3h
9. **Testes completos de Galeria** (upload, filtros, lightbox) - 2h
10. **Sincronização Google Calendar bidirecional** (testar com eventos reais) - 2h
11. **Script de limpeza de dados de teste** (MCP clientes, agendamentos) - 1h
12. **Validações de formulários completas** (email, telefone, datas) - 2h

**Total Fase Importante**: ~17 horas

---

### 🟢 DESEJÁVEL (Fazer Depois) - 24 items

13. **Melhorias UX Dashboard** (cards clicáveis, navegação) - 2h
14. **Vistas de calendário** (semana, dia, lista) - 4h
15. **Melhorias UX calendário** (tooltips, drag-drop, cores) - 3h
16. **Feedbacks visuais** (toasts, loading states, skeleton) - 3h
17. **Tratamento de erros robusto** (retry, mensagens, fallback) - 3h
18. **WebSocket reconexão automática** (backoff, status indicator) - 2h
19. **Fluxo E2E Cliente → Agendamento** (teste completo) - 1h
20. **Fluxo E2E Importação Vagaro** (teste completo) - 1h
21. **Fluxo E2E Google Drive** (upload, navegar, download, excluir) - 1h
22. **Otimizar backend** (índices, cache, paginação, gzip) - 4h
23. **Otimizar frontend** (lazy loading, code split, memoização) - 4h
24. **Otimizar uploads** (chunks, progress, cancel, retry, compress) - 3h
25. **Limpar código** (console.logs, comentários,