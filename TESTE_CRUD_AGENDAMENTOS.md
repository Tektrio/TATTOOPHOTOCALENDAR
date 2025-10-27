# 🧪 Guia de Testes: CRUD Completo de Agendamentos

**Data:** 27 de Outubro de 2025  
**Funcionalidade:** Operações CRUD (Create, Read, Update, Delete) de Agendamentos  
**Tipo:** Testes Funcionais e de Validação

---

## 📋 Resumo da Funcionalidade

### **O que será testado?**

Todas as operações de agendamentos do sistema:
1. **CREATE**: Criar novos agendamentos
2. **READ**: Visualizar agendamentos existentes
3. **UPDATE**: Editar agendamentos
4. **DELETE**: Excluir agendamentos
5. **VALIDAÇÕES**: Campos obrigatórios, formatos, conflitos
6. **INTEGRAÇÕES**: Calendário visual, sincronização Google, vinculação com clientes

---

## 🔧 Pré-requisitos

### **1. Sistema Rodando**
- ✅ Backend ativo na porta 3001
- ✅ Frontend ativo na porta 5173
- ✅ Banco de dados operacional
- ✅ Pelo menos 1 cliente cadastrado para testes

### **2. Dados de Teste**
- Cliente de teste disponível (ex: "João da Silva")
- Tipos de tatuagem configurados (Grande, Média, Pequena)
- Sem agendamentos conflitantes no período de teste

### **3. Navegador**
- Chrome/Firefox atualizado
- DevTools aberto para verificar console

---

## 📝 CENÁRIO 1: CREATE - Criar Novo Agendamento

### **1.1 Acesso ao Modal de Criação**

**Passos:**
1. Abrir sistema no navegador (`http://localhost:5173`)
2. Navegar para aba "Agendamentos"
3. Clicar no botão "+ Novo Agendamento"

**Resultado Esperado:**
- ✅ Modal abre corretamente
- ✅ Todos os campos visíveis
- ✅ Formulário limpo (sem dados preenchidos)
- ✅ Foco automático no primeiro campo

**Campos Presentes:**
- [ ] Título (text input)
- [ ] Cliente (dropdown/select)
- [ ] Tipo de Tatuagem (dropdown)
- [ ] Data de Início (date + time picker)
- [ ] Data de Fim (date + time picker)
- [ ] Descrição (textarea)
- [ ] Status (dropdown: Pendente, Confirmado, Concluído, Cancelado)
- [ ] Botões: "Salvar" e "Cancelar"

---

### **1.2 Preenchimento de Formulário Completo**

**Dados de Teste:**
```
Título: "Tatuagem Grande - João"
Cliente: "João da Silva" (selecionar do dropdown)
Tipo: "Grande"
Data Início: [Amanhã] às 14:00
Data Fim: [Amanhã] às 20:00 (6 horas)
Descrição: "Tatuagem realista no braço direito. Cliente quer dragão oriental em preto e cinza."
Status: "Confirmado"
```

**Passos:**
1. Preencher campo "Título"
2. Selecionar cliente do dropdown
3. Selecionar tipo de tatuagem
4. Definir data e hora de início
5. Definir data e hora de fim (6h depois)
6. Escrever descrição detalhada
7. Selecionar status "Confirmado"
8. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Todos os campos aceitem entrada
- ✅ Date picker funciona corretamente
- ✅ Dropdowns exibem opções corretas
- ✅ Sem erros de validação
- ✅ Botão "Salvar" ativo e clicável

---

### **1.3 Verificação de Criação Bem-Sucedida**

**O que verificar:**

1. **Toast de Sucesso**
   - ✅ Mensagem: "Agendamento criado com sucesso!"
   - ✅ Cor verde
   - ✅ Ícone de check ✓
   - ✅ Duração: 3-5 segundos

2. **Modal Fecha Automaticamente**
   - ✅ Modal desaparece após salvar
   - ✅ Retorna para lista de agendamentos

3. **Agendamento na Lista**
   - ✅ Novo agendamento aparece na tabela
   - ✅ Todos os dados corretos
   - ✅ Cliente vinculado corretamente
   - ✅ Horário formatado adequadamente

4. **Calendário Visual Atualizado**
   - Navegar para aba "Calendário"
   - ✅ Evento aparece no dia correto
   - ✅ Horário correto (14:00 - 20:00)
   - ✅ Nome do cliente visível
   - ✅ Cor adequada ao tipo

5. **Dashboard Atualizado**
   - Navegar para aba "Dashboard"
   - ✅ Contador "Próximos Agendamentos" incrementou
   - ✅ Card mostra o novo agendamento (se próximo)

6. **Banco de Dados**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT * FROM appointments WHERE title LIKE '%João%';"
   ```
   - ✅ Registro criado
   - ✅ Campos corretos
   - ✅ `created_at` preenchido
   - ✅ `client_id` vinculado

---

## 🔍 CENÁRIO 2: READ - Visualizar Agendamento

### **2.1 Visualização em Lista**

**Passos:**
1. Navegar para aba "Agendamentos"
2. Localizar agendamento criado ("Tatuagem Grande - João")
3. Observar dados exibidos

**Resultado Esperado:**
- ✅ Título completo visível
- ✅ Nome do cliente
- ✅ Data e hora formatadas (ex: "28/10/2025 14:00 - 20:00")
- ✅ Tipo de tatuagem
- ✅ Status com badge colorido
- ✅ Ações disponíveis (Ver, Editar, Excluir)

---

### **2.2 Visualização de Detalhes**

**Passos:**
1. Clicar no ícone "Ver Detalhes" (👁️ ou botão "Ver")
2. Modal/Página de detalhes abre

**Resultado Esperado:**
- ✅ Todos os campos do agendamento visíveis
- ✅ Descrição completa exibida
- ✅ Informações do cliente (nome, telefone, email)
- ✅ Duração calculada automaticamente (ex: "6 horas")
- ✅ Data de criação/modificação
- ✅ Histórico de alterações (se implementado)
- ✅ Botão "Editar" disponível
- ✅ Botão "Fechar" funcional

---

### **2.3 Visualização no Calendário**

**Passos:**
1. Navegar para aba "Calendário"
2. Localizar dia do agendamento
3. Clicar no evento

**Resultado Esperado:**
- ✅ Evento visível no dia correto
- ✅ Popup/Tooltip ao passar mouse
- ✅ Informações resumidas: Cliente, horário, tipo
- ✅ Clicar abre detalhes completos
- ✅ Cor diferenciada por tipo/status
- ✅ Ícone de status (se implementado)

---

## ✏️ CENÁRIO 3: UPDATE - Editar Agendamento

### **3.1 Acesso ao Modo de Edição**

**Passos:**
1. Navegar para aba "Agendamentos"
2. Localizar agendamento "Tatuagem Grande - João"
3. Clicar no ícone de "Editar" (✏️)

**Resultado Esperado:**
- ✅ Modal de edição abre
- ✅ Todos os campos preenchidos com dados atuais
- ✅ Título do modal: "Editar Agendamento"
- ✅ Campos editáveis

---

### **3.2 Modificação de Dados**

**Alterações a Fazer:**
```
ANTES:
Data Início: 28/10/2025 14:00

DEPOIS:
Data Início: 28/10/2025 15:00  (mudar de 14h para 15h)
Descrição: [Adicionar] "Cliente pediu para adiar 1 hora."
```

**Passos:**
1. Alterar horário de início de 14:00 para 15:00
2. Manter data fim (agora será 21:00 em vez de 20:00)
3. Adicionar nota na descrição
4. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Campos aceitam alterações
- ✅ Date picker funciona no modo edição
- ✅ Validações aplicadas (não permitir data passada, etc.)
- ✅ Botão "Salvar" ativo

---

### **3.3 Verificação de Atualização**

**O que verificar:**

1. **Toast de Sucesso**
   - ✅ Mensagem: "Agendamento atualizado com sucesso!"
   - ✅ Modal fecha automaticamente

2. **Lista Atualizada**
   - ✅ Horário mudou para 15:00 - 21:00
   - ✅ Descrição atualizada (se visível na lista)
   - ✅ Sem duplicação do registro

3. **Calendário Atualizado**
   - Navegar para aba "Calendário"
   - ✅ Evento movido para 15:00
   - ✅ Duração permanece 6 horas (15:00 - 21:00)

4. **Sincronização Google (se ativa)**
   - Abrir Google Calendar web
   - ✅ Evento atualizado no Google Calendar
   - ✅ Horário correto (15:00)

5. **Banco de Dados**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT start_time, end_time, description FROM appointments WHERE title LIKE '%João%';"
   ```
   - ✅ `start_time` atualizado
   - ✅ `end_time` atualizado
   - ✅ `description` contém nova nota
   - ✅ `updated_at` timestamp atualizado

---

## ❌ CENÁRIO 4: DELETE - Excluir Agendamento

### **4.1 Acesso à Função de Exclusão**

**Passos:**
1. Navegar para aba "Agendamentos"
2. Localizar agendamento "Tatuagem Grande - João"
3. Clicar no ícone de "Excluir" (🗑️ ou ❌)

**Resultado Esperado:**
- ✅ Modal de confirmação aparece
- ✅ Título: "Confirmar Exclusão" ou similar
- ✅ Mensagem de aviso clara

---

### **4.2 Modal de Confirmação**

**Conteúdo Esperado do Modal:**
```
⚠️ Confirmar Exclusão

Tem certeza que deseja excluir este agendamento?

📅 Tatuagem Grande - João
🕐 28/10/2025 15:00 - 21:00
👤 Cliente: João da Silva

⚠️ Esta ação não pode ser desfeita!

[Cancelar]  [Excluir]
```

**Verificar:**
- ✅ Resumo do agendamento visível
- ✅ Aviso de ação irreversível
- ✅ Botão "Cancelar" (cinza/secundário)
- ✅ Botão "Excluir" (vermelho/destrutivo)

---

### **4.3 Teste de Cancelamento**

**Passos:**
1. No modal de confirmação, clicar em "Cancelar"

**Resultado Esperado:**
- ✅ Modal fecha sem executar exclusão
- ✅ Agendamento permanece na lista
- ✅ Nenhuma alteração no banco

---

### **4.4 Execução da Exclusão**

**Passos:**
1. Clicar novamente no ícone de "Excluir"
2. No modal de confirmação, clicar em "Excluir"

**Resultado Esperado:**

1. **Toast de Sucesso**
   - ✅ Mensagem: "Agendamento excluído com sucesso!"
   - ✅ Cor verde ou neutra
   - ✅ Modal fecha

2. **Removido da Lista**
   - ✅ Agendamento desaparece da tabela imediatamente
   - ✅ Sem necessidade de reload
   - ✅ Animação de saída (fade out)

3. **Calendário Atualizado**
   - Navegar para aba "Calendário"
   - ✅ Evento não aparece mais no dia 28/10

4. **Dashboard Atualizado**
   - Navegar para aba "Dashboard"
   - ✅ Contador "Próximos Agendamentos" decrementou

5. **Sincronização Google (se ativa)**
   - Abrir Google Calendar web
   - ✅ Evento removido do Google Calendar

6. **Banco de Dados**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT * FROM appointments WHERE title LIKE '%João%';"
   ```
   - ✅ Registro não existe mais (hard delete)
   - OU ✅ Campo `deleted_at` preenchido (soft delete)

---

## 🛡️ CENÁRIO 5: VALIDAÇÕES

### **5.1 Campos Obrigatórios**

**Teste: Tentar salvar sem preencher campos obrigatórios**

**Passos:**
1. Abrir modal de novo agendamento
2. Deixar campos obrigatórios vazios
3. Clicar em "Salvar"

**Campos Obrigatórios:**
- [ ] Título
- [ ] Cliente
- [ ] Data de Início
- [ ] Data de Fim

**Resultado Esperado:**
- ✅ Formulário NÃO é submetido
- ✅ Campos vazios destacados em vermelho
- ✅ Mensagens de erro abaixo de cada campo:
  - "Título é obrigatório"
  - "Selecione um cliente"
  - "Data de início é obrigatória"
  - "Data de fim é obrigatória"
- ✅ Scroll automático para o primeiro erro
- ✅ Foco no primeiro campo com erro

---

### **5.2 Validação de Data - Não Permitir Passado**

**Teste: Tentar criar agendamento no passado**

**Passos:**
1. Abrir modal de novo agendamento
2. Preencher título e cliente
3. Selecionar data de **ontem** ou anterior
4. Tentar salvar

**Resultado Esperado:**
- ✅ Erro de validação exibido
- ✅ Mensagem: "Data de início não pode ser no passado"
- ✅ Campo de data destacado em vermelho
- ✅ Formulário não submetido

---

### **5.3 Validação de Data - Data Fim Antes de Data Início**

**Teste: Data de fim anterior à data de início**

**Passos:**
1. Abrir modal de novo agendamento
2. Preencher campos
3. Data Início: 28/10/2025 15:00
4. Data Fim: 28/10/2025 14:00 (1 hora ANTES)
5. Tentar salvar

**Resultado Esperado:**
- ✅ Erro de validação exibido
- ✅ Mensagem: "Data de fim deve ser posterior à data de início"
- ✅ Campo destacado em vermelho
- ✅ Formulário não submetido

---

### **5.4 Validação de Duração - Mínima e Máxima**

**Teste: Duração muito curta**

**Passos:**
1. Data Início: 28/10/2025 15:00
2. Data Fim: 28/10/2025 15:15 (15 minutos)
3. Tentar salvar

**Resultado Esperado:**
- ✅ Erro: "Duração mínima é de 30 minutos"
- ✅ Formulário não submetido

**Teste: Duração muito longa**

**Passos:**
1. Data Início: 28/10/2025 08:00
2. Data Fim: 29/10/2025 08:00 (24 horas)
3. Tentar salvar

**Resultado Esperado:**
- ✅ Erro: "Duração máxima é de 12 horas"
- OU ✅ Aviso: "Agendamento muito longo. Confirmar?" (se permitido)

---

### **5.5 Validação de Horário Comercial**

**Teste: Horário fora do expediente**

**Passos:**
1. Data Início: 28/10/2025 06:00 (antes das 8h)
2. Tentar salvar

**Resultado Esperado:**
- ✅ Aviso: "Horário fora do expediente (8h - 22h). Deseja continuar?"
- ✅ Opções: "Cancelar" ou "Confirmar mesmo assim"

---

## ⚠️ CENÁRIO 6: CONFLITOS DE HORÁRIO

### **6.1 Detecção de Conflito**

**Setup:**
1. Criar Agendamento A:
   - Cliente: João
   - Data: 28/10/2025 14:00 - 18:00

2. Tentar criar Agendamento B (conflitante):
   - Cliente: Maria
   - Data: 28/10/2025 16:00 - 20:00 (sobrepõe 2 horas)

**Resultado Esperado:**
- ✅ Sistema detecta conflito
- ✅ Modal de aviso aparece:
  ```
  ⚠️ Conflito de Horário Detectado
  
  Já existe um agendamento neste horário:
  
  📅 Tatuagem Grande - João
  🕐 28/10/2025 14:00 - 18:00
  
  O novo agendamento sobrepõe 2 horas.
  
  Deseja criar mesmo assim?
  
  [Cancelar]  [Forçar Criação]
  ```
- ✅ Opção de cancelar ou forçar criação
- ✅ Aviso visual claro (cor laranja/amarela)

---

### **6.2 Permitir Conflito (Opcional)**

**Passos:**
1. No modal de conflito, clicar em "Forçar Criação"

**Resultado Esperado:**
- ✅ Agendamento criado mesmo com conflito
- ✅ Ambos aparecem no calendário
- ✅ Indicador de conflito no calendário (cor diferente, ícone)
- ✅ Toast de aviso: "Agendamento criado com conflito de horário"

---

## 🔗 CENÁRIO 7: VINCULAÇÃO COM CLIENTES

### **7.1 Exibição de Agendamentos do Cliente**

**Passos:**
1. Navegar para aba "Clientes"
2. Localizar cliente "João da Silva"
3. Clicar em "Ver Detalhes"

**Resultado Esperado:**
- ✅ Seção "Agendamentos" visível
- ✅ Lista de todos os agendamentos do cliente
- ✅ Ordenados por data (mais recente primeiro ou próximo primeiro)
- ✅ Filtros: "Todos", "Próximos", "Passados", "Cancelados"
- ✅ Estatísticas:
  - Total de agendamentos
  - Próximos agendamentos
  - Taxa de comparecimento (se implementado)

---

### **7.2 Criar Agendamento a Partir do Cliente**

**Passos:**
1. Na página de detalhes do cliente "João da Silva"
2. Clicar em botão "Agendar" ou "+ Novo Agendamento"

**Resultado Esperado:**
- ✅ Modal de agendamento abre
- ✅ Campo "Cliente" já vem PRÉ-SELECIONADO com "João da Silva"
- ✅ Campo "Cliente" pode ser alterado (não bloqueado)
- ✅ Demais campos vazios
- ✅ Fluxo normal de criação

---

### **7.3 Filtro por Cliente na Lista**

**Passos:**
1. Navegar para aba "Agendamentos"
2. Usar filtro/busca por cliente
3. Digitar "João"

**Resultado Esperado:**
- ✅ Lista filtra em tempo real
- ✅ Apenas agendamentos de "João da Silva" aparecem
- ✅ Outros agendamentos ocultos
- ✅ Contador atualiza: "Mostrando X de Y agendamentos"
- ✅ Limpar filtro restaura lista completa

---

## 🎨 CENÁRIO 8: ESTADOS VISUAIS

### **8.1 Status de Agendamento**

**Testar Diferentes Status:**

1. **Pendente** (padrão)
   - ✅ Badge amarelo/laranja
   - ✅ Ícone: 🕐 ou ⏳
   - ✅ Texto: "Pendente"

2. **Confirmado**
   - ✅ Badge verde claro
   - ✅ Ícone: ✅ ou ✓
   - ✅ Texto: "Confirmado"

3. **Concluído**
   - ✅ Badge verde escuro
   - ✅ Ícone: ✔️ ou 🎉
   - ✅ Texto: "Concluído"

4. **Cancelado**
   - ✅ Badge vermelho/cinza
   - ✅ Ícone: ❌ ou 🚫
   - ✅ Texto: "Cancelado"
   - ✅ Texto tachado (opcional)

---

### **8.2 Mudança de Status**

**Passos:**
1. Editar agendamento "Tatuagem Grande - João"
2. Mudar status de "Confirmado" para "Concluído"
3. Salvar

**Resultado Esperado:**
- ✅ Badge atualiza para "Concluído" (verde escuro)
- ✅ Agendamento pode sair da lista de "Próximos" (dependendo do filtro)
- ✅ Aparece em "Agendamentos Passados" ou "Concluídos"
- ✅ Sincronização Google: evento marcado como concluído

---

### **8.3 Indicadores de Proximidade**

**Testar em agendamentos próximos:**

1. **Agendamento Hoje**
   - ✅ Destaque especial (borda amarela, fundo diferente)
   - ✅ Label: "HOJE" em destaque

2. **Agendamento em 1 hora**
   - ✅ Badge "EM BREVE" ou "AGORA"
   - ✅ Cor vermelha/urgente
   - ✅ Notificação/alerta (opcional)

3. **Agendamento Atrasado**
   - ✅ Badge "ATRASADO" ou "PERDIDO"
   - ✅ Cor vermelha
   - ✅ Ícone de aviso ⚠️

---

## 📊 CENÁRIO 9: RELATÓRIOS E ESTATÍSTICAS

### **9.1 Contador de Agendamentos**

**Verificar no Dashboard:**
- ✅ Card "Total de Agendamentos" mostra número correto
- ✅ Card "Próximos Agendamentos" (próximos 7 dias)
- ✅ Card "Agendamentos Hoje"
- ✅ Atualização em tempo real ao criar/excluir

---

### **9.2 Estatísticas por Período**

**Filtros de Data:**
1. Hoje
2. Esta Semana
3. Este Mês
4. Personalizado (range de datas)

**Métricas:**
- ✅ Total de agendamentos
- ✅ Por status (pendente, confirmado, concluído, cancelado)
- ✅ Por tipo de tatuagem
- ✅ Taxa de comparecimento
- ✅ Duração média
- ✅ Receita estimada (se implementado)

---

## ✅ CHECKLIST FINAL - CRUD Agendamentos

### **Create (Criar)**
- [ ] Modal abre corretamente
- [ ] Todos os campos funcionais
- [ ] Validações aplicadas
- [ ] Criação bem-sucedida
- [ ] Toast de confirmação
- [ ] Aparece na lista
- [ ] Aparece no calendário
- [ ] Dashboard atualizado
- [ ] Banco de dados atualizado
- [ ] Sincronização Google (se ativa)

### **Read (Visualizar)**
- [ ] Lista exibe todos os agendamentos
- [ ] Detalhes completos acessíveis
- [ ] Visualização no calendário
- [ ] Filtros funcionais
- [ ] Busca funcional
- [ ] Paginação funciona (se implementado)
- [ ] Loading state adequado

### **Update (Editar)**
- [ ] Modal de edição abre com dados preenchidos
- [ ] Campos editáveis
- [ ] Validações aplicadas
- [ ] Atualização bem-sucedida
- [ ] Toast de confirmação
- [ ] Lista atualizada
- [ ] Calendário atualizado
- [ ] Sincronização Google (se ativa)

### **Delete (Excluir)**
- [ ] Modal de confirmação aparece
- [ ] Aviso claro e destacado
- [ ] Opção de cancelar funciona
- [ ] Exclusão bem-sucedida
- [ ] Toast de confirmação
- [ ] Removido da lista
- [ ] Removido do calendário
- [ ] Dashboard atualizado
- [ ] Sincronização Google (se ativa)

### **Validações**
- [ ] Campos obrigatórios validados
- [ ] Data passada bloqueada
- [ ] Data fim > data início
- [ ] Duração mínima/máxima
- [ ] Horário comercial validado
- [ ] Conflitos detectados
- [ ] Mensagens de erro claras

### **Integrações**
- [ ] Vinculação com clientes funciona
- [ ] Calendário visual sincronizado
- [ ] Google Calendar sincronizado
- [ ] WebSocket tempo real funciona
- [ ] Dashboard atualiza automaticamente

---

## 🐛 RELATÓRIO DE BUGS

**Se encontrar bugs durante os testes, documentar aqui:**

| # | Descrição | Severidade | Steps to Reproduce | Screenshot |
|---|-----------|------------|-------------------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 📝 NOTAS FINAIS

**Tempo Estimado de Teste:** 2-3 horas  
**Cenários Críticos:** 1, 2, 3, 4, 5, 6  
**Cenários Opcionais:** 7, 8, 9

**Próximos Passos Após Conclusão:**
1. Documentar bugs encontrados
2. Criar issues para correções necessárias
3. Testar novamente após correções
4. Marcar TODO como "completed"
5. Avançar para próximo teste: CRUD de Clientes

---

✅ **Teste criado em:** 27 de Outubro de 2025  
📋 **Baseado no plano:** `sistema-100--funcional.plan.md` Seção 3.1

