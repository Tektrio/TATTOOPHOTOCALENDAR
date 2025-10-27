# 🧪 Guia de Testes: CRUD Completo de Clientes

**Data:** 27 de Outubro de 2025  
**Funcionalidade:** Operações CRUD (Create, Read, Update, Delete) de Clientes  
**Tipo:** Testes Funcionais e de Validação

---

## 📋 Resumo da Funcionalidade

### **O que será testado?**

Todas as operações de clientes do sistema:
1. **CREATE**: Criar novos clientes (já testado anteriormente)
2. **READ**: Visualizar clientes existentes e seus detalhes
3. **UPDATE**: Editar informações de clientes
4. **DELETE**: Excluir clientes
5. **HISTORY**: Ver histórico de agendamentos do cliente
6. **SCHEDULE**: Agendar direto da página do cliente
7. **VALIDAÇÕES**: Campos obrigatórios, formatos, duplicatas

---

## 🔧 Pré-requisitos

### **1. Sistema Rodando**
- ✅ Backend ativo na porta 3001
- ✅ Frontend ativo na porta 5173
- ✅ Banco de dados operacional
- ✅ Pelo menos 2-3 clientes cadastrados para testes

### **2. Dados Existentes**
- Cliente de teste: "João da Silva" (criado em testes anteriores)
- Alguns agendamentos vinculados a clientes (opcional, mas útil)
- Arquivos/fotos vinculados a clientes (opcional)

### **3. Navegador**
- Chrome/Firefox atualizado
- DevTools aberto para verificar console

---

## ✅ CENÁRIO 1: CREATE - Criar Novo Cliente (REVISÃO)

**Nota:** Esta funcionalidade já foi testada anteriormente. Vamos apenas revisar rapidamente.

### **1.1 Acesso ao Modal de Criação**

**Passos:**
1. Abrir sistema (`http://localhost:5173`)
2. Navegar para aba "Clientes"
3. Clicar no botão "+ Novo Cliente"

**Resultado Esperado:**
- ✅ Modal abre corretamente
- ✅ Formulário limpo
- ✅ Todos os campos visíveis

---

### **1.2 Criação Rápida (Teste de Regressão)**

**Dados de Teste:**
```
Nome: "Maria Santos Teste"
Email: "maria.santos@email.com"
Telefone: "(11) 98765-4321"
Endereço: "Rua das Flores, 456 - São Paulo, SP"
```

**Passos:**
1. Preencher todos os campos
2. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Cliente criado com sucesso
- ✅ Toast de confirmação
- ✅ Aparece na lista de clientes
- ✅ Dados corretos exibidos

---

## 🔍 CENÁRIO 2: READ - Visualizar Cliente

### **2.1 Lista de Clientes**

**Passos:**
1. Navegar para aba "Clientes"
2. Observar lista de clientes

**Resultado Esperado:**

**Informações Visíveis na Lista:**
- ✅ Foto/Avatar do cliente (inicial ou imagem)
- ✅ Nome completo
- ✅ Email
- ✅ Telefone formatado
- ✅ Número de agendamentos totais
- ✅ Próximo agendamento (data/hora)
- ✅ Status: Ativo/Inativo
- ✅ Botões de ação:
  - 👁️ Ver Detalhes
  - ✏️ Editar
  - 📅 Agendar
  - 🗑️ Excluir

**Layout:**
- ✅ Cards organizados em grid ou lista
- ✅ Informações legíveis
- ✅ Espaçamento adequado
- ✅ Hover effects nos cards

---

### **2.2 Filtros e Busca**

**Teste: Busca por Nome**

**Passos:**
1. Digitar "Maria" no campo de busca
2. Observar filtro em tempo real

**Resultado Esperado:**
- ✅ Lista filtra instantaneamente
- ✅ Apenas clientes com "Maria" aparecem
- ✅ Contador atualiza: "Mostrando X de Y"
- ✅ Limpar busca restaura lista completa

---

**Teste: Busca por Email**

**Passos:**
1. Digitar "@email.com" no campo de busca
2. Verificar resultados

**Resultado Esperado:**
- ✅ Busca funciona por email
- ✅ Todos clientes com email "@email.com" aparecem

---

**Teste: Busca por Telefone**

**Passos:**
1. Digitar "11 98765" no campo de busca
2. Verificar resultados

**Resultado Esperado:**
- ✅ Busca funciona por telefone
- ✅ Cliente "Maria Santos" aparece

---

### **2.3 Ordenação**

**Teste: Ordenar por Nome**

**Passos:**
1. Clicar em cabeçalho "Nome" (se tabela) ou botão de ordenação
2. Observar ordem

**Resultado Esperado:**
- ✅ Lista ordena alfabeticamente (A-Z)
- ✅ Clicar novamente inverte ordem (Z-A)
- ✅ Ícone de seta indica direção da ordenação

---

**Teste: Ordenar por Data de Cadastro**

**Passos:**
1. Selecionar ordenação por "Data de Cadastro"
2. Observar ordem

**Resultado Esperado:**
- ✅ Mais recentes primeiro ou mais antigos primeiro
- ✅ Data de cadastro visível (tooltip ou coluna)

---

**Teste: Ordenar por Número de Agendamentos**

**Passos:**
1. Selecionar ordenação por "Agendamentos"
2. Observar ordem

**Resultado Esperado:**
- ✅ Clientes com mais agendamentos aparecem primeiro (ou último)
- ✅ Contador visível

---

### **2.4 Paginação (Se Implementado)**

**Teste: Navegação entre Páginas**

**Passos:**
1. Se houver mais de 10-20 clientes, verificar paginação
2. Clicar em "Próxima Página" ou "Página 2"

**Resultado Esperado:**
- ✅ Lista atualiza para próxima página
- ✅ Indicador de página atual destacado
- ✅ Contadores corretos: "11-20 de 45"
- ✅ Botões "Anterior" e "Próximo" funcionais
- ✅ Ir diretamente para página específica funciona

---

### **2.5 Ver Detalhes Completos do Cliente**

**Passos:**
1. Localizar cliente "Maria Santos Teste"
2. Clicar em botão "Ver Detalhes" (👁️ ou "Ver")

**Resultado Esperado:**

**Modal/Página de Detalhes Abre com:**

**1. Informações Pessoais:**
- ✅ Nome completo
- ✅ Email
- ✅ Telefone formatado
- ✅ Endereço completo
- ✅ Data de cadastro
- ✅ Data de última modificação
- ✅ Status (Ativo/Inativo)
- ✅ Notas/Observações (se houver)

**2. Estatísticas do Cliente:**
- ✅ Total de agendamentos
- ✅ Agendamentos concluídos
- ✅ Agendamentos cancelados
- ✅ Taxa de comparecimento (%)
- ✅ Valor total gasto (se implementado)
- ✅ Tipo de tatuagem mais comum

**3. Seção de Agendamentos:**
- ✅ Título: "Agendamentos" ou "Histórico"
- ✅ Filtros: "Todos", "Próximos", "Passados", "Cancelados"
- ✅ Lista de agendamentos:
  - Data/Hora
  - Tipo de tatuagem
  - Status (badge colorido)
  - Duração
  - Descrição resumida
- ✅ Ordenação por data (mais recente primeiro)
- ✅ Próximo agendamento destacado (se houver)
- ✅ Botão "+ Novo Agendamento"

**4. Seção de Arquivos/Fotos:**
- ✅ Título: "Galeria" ou "Fotos"
- ✅ Grid de thumbnails
- ✅ Categorias: Antes, Durante, Depois, Referência
- ✅ Clicar em foto abre lightbox
- ✅ Botão "+ Upload Foto"

**5. Ações Disponíveis:**
- ✅ Botão "Editar Cliente" (✏️)
- ✅ Botão "Agendar" (📅)
- ✅ Botão "Excluir Cliente" (🗑️)
- ✅ Botão "Fechar" ou "Voltar"

---

### **2.6 Filtro de Agendamentos do Cliente**

**Passos:**
1. No modal de detalhes de "Maria Santos"
2. Testar filtros de agendamentos

**Teste: Filtro "Próximos"**
- ✅ Apenas agendamentos futuros aparecem
- ✅ Ordenados por data (mais próximo primeiro)

**Teste: Filtro "Passados"**
- ✅ Apenas agendamentos passados aparecem
- ✅ Ordenados por data (mais recente primeiro)

**Teste: Filtro "Cancelados"**
- ✅ Apenas agendamentos com status "Cancelado" aparecem

**Teste: Filtro "Todos"**
- ✅ Restaura lista completa
- ✅ Todos agendamentos visíveis

---

## ✏️ CENÁRIO 3: UPDATE - Editar Cliente

### **3.1 Acesso ao Modo de Edição**

**Passos:**
1. Navegar para aba "Clientes"
2. Localizar cliente "Maria Santos Teste"
3. Clicar no botão "Editar" (✏️)

**Resultado Esperado:**
- ✅ Modal de edição abre
- ✅ Título: "Editar Cliente"
- ✅ Todos os campos preenchidos com dados atuais
- ✅ Campos editáveis
- ✅ Botões "Salvar" e "Cancelar" visíveis

---

### **3.2 Modificação de Dados**

**Alterações a Fazer:**
```
ANTES:
Nome: "Maria Santos Teste"
Email: "maria.santos@email.com"
Telefone: "(11) 98765-4321"
Endereço: "Rua das Flores, 456 - São Paulo, SP"

DEPOIS:
Nome: "Maria Santos Silva" (adicionar sobrenome)
Email: "maria.santos@email.com" (sem mudança)
Telefone: "(11) 98765-5432" (mudar último dígito)
Endereço: "Rua das Flores, 456 - Apt 12 - São Paulo, SP" (adicionar apto)
```

**Passos:**
1. Alterar nome: Adicionar "Silva"
2. Alterar telefone: Último dígito de 1 para 2
3. Alterar endereço: Adicionar "Apt 12"
4. Manter email inalterado
5. Clicar em "Salvar"

**Resultado Esperado:**
- ✅ Campos aceitam alterações
- ✅ Validações aplicadas em tempo real
- ✅ Botão "Salvar" ativo

---

### **3.3 Verificação de Atualização**

**O que verificar:**

1. **Toast de Sucesso**
   - ✅ Mensagem: "Cliente atualizado com sucesso!"
   - ✅ Cor verde
   - ✅ Modal fecha automaticamente

2. **Lista Atualizada**
   - ✅ Nome mudou para "Maria Santos Silva"
   - ✅ Telefone atualizado visível
   - ✅ Endereço atualizado (se visível na lista)
   - ✅ Sem duplicação do registro

3. **Detalhes Atualizados**
   - Abrir detalhes de "Maria Santos Silva"
   - ✅ Todos os campos refletem mudanças
   - ✅ Data de "Última modificação" atualizada
   - ✅ Timestamp correto

4. **Banco de Dados**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT name, email, phone, address, updated_at FROM clients WHERE email = 'maria.santos@email.com';"
   ```
   - ✅ Nome atualizado
   - ✅ Telefone atualizado
   - ✅ Endereço atualizado
   - ✅ `updated_at` timestamp atualizado

---

### **3.4 Teste de Cancelamento de Edição**

**Passos:**
1. Abrir edição de "Maria Santos Silva"
2. Fazer alterações (ex: mudar nome)
3. Clicar em "Cancelar"

**Resultado Esperado:**
- ✅ Modal fecha sem salvar
- ✅ Alterações descartadas
- ✅ Cliente permanece com dados originais
- ✅ Nenhuma mudança no banco

---

### **3.5 Validações Durante Edição**

**Teste: Email Inválido**

**Passos:**
1. Editar "Maria Santos Silva"
2. Mudar email para "mariasantos" (sem @)
3. Tentar salvar

**Resultado Esperado:**
- ✅ Erro de validação exibido
- ✅ Mensagem: "Email inválido. Use formato: exemplo@dominio.com"
- ✅ Campo destacado em vermelho
- ✅ Formulário não submetido

---

**Teste: Telefone Inválido**

**Passos:**
1. Editar cliente
2. Mudar telefone para "123" (formato inválido)
3. Tentar salvar

**Resultado Esperado:**
- ✅ Erro de validação exibido
- ✅ Mensagem: "Telefone inválido. Use formato: (11) 99999-9999"
- ✅ Campo destacado em vermelho
- ✅ Sugestões de formato exibidas

---

**Teste: Email Duplicado**

**Setup:** Ter cliente "João da Silva" com email "joao@email.com"

**Passos:**
1. Editar "Maria Santos Silva"
2. Mudar email para "joao@email.com" (já existe)
3. Tentar salvar

**Resultado Esperado:**
- ✅ Erro de validação exibido
- ✅ Mensagem: "Este email já está cadastrado para outro cliente"
- ✅ Nome do outro cliente exibido (opcional): "Email usado por João da Silva"
- ✅ Formulário não submetido

---

### **3.6 Atualização de Foto/Avatar**

**Passos:**
1. Editar "Maria Santos Silva"
2. Clicar em área de foto/avatar
3. Fazer upload de nova imagem
4. Salvar

**Resultado Esperado:**
- ✅ Upload funciona
- ✅ Preview da nova foto exibido
- ✅ Foto salva após "Salvar"
- ✅ Foto atualizada na lista de clientes
- ✅ Foto atualizada nos detalhes
- ✅ Foto sincronizada com Google Drive (se implementado)

---

## ❌ CENÁRIO 4: DELETE - Excluir Cliente

### **4.1 Acesso à Função de Exclusão**

**Passos:**
1. Navegar para aba "Clientes"
2. Localizar cliente "Maria Santos Silva"
3. Clicar no botão "Excluir" (🗑️ ou ❌)

**Resultado Esperado:**
- ✅ Modal de confirmação aparece
- ✅ Título: "Confirmar Exclusão" ou "Excluir Cliente"
- ✅ Mensagem de aviso clara e destacada

---

### **4.2 Modal de Confirmação**

**Conteúdo Esperado do Modal:**
```
⚠️ Confirmar Exclusão de Cliente

Tem certeza que deseja excluir este cliente?

👤 Maria Santos Silva
📧 maria.santos@email.com
📞 (11) 98765-5432

📊 Agendamentos vinculados: 3
📁 Arquivos vinculados: 5

⚠️ ATENÇÃO: Esta ação não pode ser desfeita!
Todos os agendamentos e arquivos vinculados também serão excluídos.

[Cancelar]  [Excluir Cliente]
```

**Verificar:**
- ✅ Resumo completo do cliente
- ✅ Contagem de agendamentos vinculados
- ✅ Contagem de arquivos vinculados
- ✅ Aviso de ação irreversível destacado (vermelho/laranja)
- ✅ Consequências claras (exclusão em cascata)
- ✅ Botão "Cancelar" (cinza/secundário)
- ✅ Botão "Excluir" (vermelho/destrutivo)

---

### **4.3 Teste de Cancelamento**

**Passos:**
1. No modal de confirmação, clicar em "Cancelar"

**Resultado Esperado:**
- ✅ Modal fecha sem executar exclusão
- ✅ Cliente permanece na lista
- ✅ Nenhuma alteração no banco
- ✅ Agendamentos e arquivos intactos

---

### **4.4 Exclusão de Cliente SEM Agendamentos**

**Setup:** Criar cliente de teste sem agendamentos vinculados

**Passos:**
1. Criar cliente "Teste Exclusão" sem agendamentos
2. Clicar em "Excluir"
3. Confirmar exclusão

**Resultado Esperado:**

1. **Toast de Sucesso**
   - ✅ Mensagem: "Cliente excluído com sucesso!"
   - ✅ Modal fecha

2. **Removido da Lista**
   - ✅ Cliente desaparece imediatamente
   - ✅ Sem necessidade de reload
   - ✅ Animação de fade out (opcional)
   - ✅ Contador de clientes decrementou

3. **Dashboard Atualizado**
   - Navegar para aba "Dashboard"
   - ✅ Card "Total de Clientes" decrementou

4. **Banco de Dados**
   ```bash
   sqlite3 agenda_hibrida.db "SELECT * FROM clients WHERE name = 'Teste Exclusão';"
   ```
   - ✅ Registro não existe mais (hard delete)
   - OU ✅ Campo `deleted_at` preenchido (soft delete)

---

### **4.5 Exclusão de Cliente COM Agendamentos**

**Setup:** Cliente "Maria Santos Silva" tem 3 agendamentos

**Passos:**
1. Clicar em "Excluir" de "Maria Santos Silva"
2. Modal de confirmação mostra "3 agendamentos vinculados"
3. Confirmar exclusão

**Resultado Esperado:**

**Opção A: Bloqueio de Exclusão (Recomendado)**
- ✅ Modal exibe:
  ```
  ⚠️ Não é possível excluir este cliente
  
  Este cliente possui 3 agendamentos vinculados.
  
  Para excluir este cliente:
  1. Exclua ou reassocie os agendamentos primeiro
  2. Ou marque o cliente como "Inativo"
  
  [Ver Agendamentos]  [Marcar como Inativo]  [Cancelar]
  ```
- ✅ Botão "Excluir" desabilitado ou ausente
- ✅ Link "Ver Agendamentos" abre detalhes do cliente
- ✅ Botão "Marcar como Inativo" oferece alternativa

**Opção B: Exclusão em Cascata (Menos Recomendado)**
- ✅ Modal avisa claramente: "3 agendamentos serão excluídos"
- ✅ Checkbox: "Confirmo que desejo excluir cliente e TODOS os agendamentos"
- ✅ Botão "Excluir" só ativo após marcar checkbox
- ✅ Após confirmar:
  - Cliente excluído
  - Todos agendamentos excluídos
  - Eventos removidos do Google Calendar
  - Arquivos mantidos ou excluídos (conforme configuração)

---

### **4.6 Alternativa: Desativar Cliente**

**Passos:**
1. Abrir detalhes de "Maria Santos Silva"
2. Localizar opção "Status"
3. Mudar de "Ativo" para "Inativo"
4. Salvar

**Resultado Esperado:**
- ✅ Cliente marcado como "Inativo"
- ✅ Badge/indicador de status atualizado
- ✅ Cliente permanece no banco (soft delete alternativo)
- ✅ Pode ser filtrado: "Mostrar Inativos"
- ✅ Agendamentos preservados
- ✅ Possibilidade de reativar depois

---

## 📅 CENÁRIO 5: AGENDAR - Criar Agendamento do Cliente

### **5.1 Agendar Via Lista de Clientes**

**Passos:**
1. Navegar para aba "Clientes"
2. Localizar cliente "Maria Santos Silva"
3. Clicar no botão "Agendar" (📅) do card

**Resultado Esperado:**
- ✅ Modal de novo agendamento abre
- ✅ Campo "Cliente" já vem **PRÉ-SELECIONADO** com "Maria Santos Silva"
- ✅ Campo "Cliente" pode ser alterado (não bloqueado)
- ✅ Demais campos vazios para preenchimento
- ✅ Fluxo normal de criação de agendamento

---

### **5.2 Agendar Via Detalhes do Cliente**

**Passos:**
1. Abrir detalhes de "Maria Santos Silva"
2. Na seção "Agendamentos", clicar em "+ Novo Agendamento"

**Resultado Esperado:**
- ✅ Modal de agendamento abre
- ✅ Cliente já pré-selecionado
- ✅ Contexto mantido (modal sobre detalhes ou nova página)

---

### **5.3 Verificação de Agendamento Criado**

**Passos:**
1. Criar agendamento para "Maria Santos Silva"
2. Salvar
3. Verificar atualização

**Resultado Esperado:**

1. **Toast de Sucesso**
   - ✅ "Agendamento criado com sucesso!"

2. **Detalhes do Cliente Atualizados**
   - Voltar aos detalhes de "Maria Santos Silva"
   - ✅ Novo agendamento aparece na lista
   - ✅ Contador de agendamentos incrementou
   - ✅ "Próximo agendamento" atualizado (se for o mais próximo)

3. **Calendário Atualizado**
   - Navegar para aba "Calendário"
   - ✅ Evento aparece no dia correto
   - ✅ Nome do cliente exibido no evento

4. **Dashboard Atualizado**
   - ✅ "Próximos Agendamentos" incrementou

---

## 📊 CENÁRIO 6: HISTÓRICO E ESTATÍSTICAS

### **6.1 Ver Histórico Completo de Agendamentos**

**Passos:**
1. Abrir detalhes de cliente com múltiplos agendamentos
2. Observar seção "Histórico de Agendamentos"

**Resultado Esperado:**

**Lista de Agendamentos Exibe:**
- ✅ Todos agendamentos (passados e futuros)
- ✅ Ordenados cronologicamente
- ✅ Cada agendamento mostra:
  - Data/Hora
  - Tipo de tatuagem
  - Status (badge colorido)
  - Duração
  - Valor (se implementado)
  - Descrição resumida
- ✅ Diferenciação visual:
  - Próximos: destaque/cor diferente
  - Passados: opacidade reduzida
  - Cancelados: tachado ou cor vermelha

---

### **6.2 Estatísticas do Cliente**

**Verificar Métricas:**

1. **Total de Agendamentos**
   - ✅ Número correto exibido
   - ✅ Inclui todos status (pendente, confirmado, concluído, cancelado)

2. **Agendamentos Concluídos**
   - ✅ Apenas com status "Concluído"
   - ✅ Número correto

3. **Taxa de Comparecimento**
   - ✅ Cálculo correto: (Concluídos / Total) * 100%
   - ✅ Exibição: "85%" ou "85% (17 de 20)"
   - ✅ Indicador visual: Verde (>80%), Amarelo (50-80%), Vermelho (<50%)

4. **Tipo de Tatuagem Mais Comum**
   - ✅ Detecta corretamente
   - ✅ Exibe: "Grande (5 vezes)"

5. **Total Gasto (Se Implementado)**
   - ✅ Soma todos valores de agendamentos concluídos
   - ✅ Formatação: "R$ 2.500,00"

6. **Última Visita**
   - ✅ Data do último agendamento concluído
   - ✅ Formato: "15/10/2025 (há 12 dias)"

---

### **6.3 Filtros Avançados de Histórico**

**Teste: Filtro por Período**

**Passos:**
1. Nos detalhes do cliente, usar filtro de data
2. Selecionar "Últimos 30 dias"

**Resultado Esperado:**
- ✅ Apenas agendamentos dos últimos 30 dias aparecem
- ✅ Contador atualiza: "Mostrando X agendamentos"

---

**Teste: Filtro por Status**

**Passos:**
1. Selecionar filtro "Apenas Concluídos"

**Resultado Esperado:**
- ✅ Apenas agendamentos com status "Concluído" aparecem
- ✅ Outros ocultos

---

**Teste: Filtro por Tipo**

**Passos:**
1. Selecionar filtro "Apenas Tatuagens Grandes"

**Resultado Esperado:**
- ✅ Apenas agendamentos de tipo "Grande" aparecem

---

## 🔗 CENÁRIO 7: VINCULAÇÕES E INTEGRAÇÕES

### **7.1 Vinculação com Arquivos**

**Passos:**
1. Abrir detalhes do cliente
2. Verificar seção "Galeria" ou "Fotos"

**Resultado Esperado:**
- ✅ Fotos do cliente exibidas
- ✅ Categorias: Antes, Durante, Depois, Referência
- ✅ Clicar em foto abre lightbox
- ✅ Upload de nova foto funciona
- ✅ Foto vinculada ao cliente corretamente

---

### **7.2 Sincronização Google Drive**

**Passos:**
1. Fazer upload de foto para cliente "Maria Santos Silva"
2. Verificar Google Drive web

**Resultado Esperado:**
- ✅ Foto aparece no Google Drive
- ✅ Estrutura de pastas:
  ```
  TATTOO_PHOTO_CALENDAR/
  └── clientes/
      └── maria-santos-silva/
          ├── antes/
          ├── durante/
          ├── depois/
          └── referencia/
  ```
- ✅ Foto na pasta correta (conforme categoria)

---

### **7.3 Exportação de Dados do Cliente**

**Passos:**
1. Abrir detalhes do cliente
2. Procurar opção "Exportar" ou "Baixar Dados"
3. Clicar para exportar

**Resultado Esperado:**
- ✅ Opção de exportar disponível
- ✅ Formatos: PDF, JSON, CSV
- ✅ Arquivo gerado contém:
  - Dados pessoais do cliente
  - Histórico completo de agendamentos
  - Estatísticas
  - Links para fotos (ou fotos incorporadas no PDF)
- ✅ Download inicia automaticamente
- ✅ Nome do arquivo: "cliente-maria-santos-silva-2025-10-27.pdf"

---

## ✅ CHECKLIST FINAL - CRUD Clientes

### **Create (Criar)**
- [ ] Modal abre corretamente
- [ ] Todos os campos funcionais
- [ ] Validações aplicadas
- [ ] Criação bem-sucedida
- [ ] Toast de confirmação
- [ ] Aparece na lista
- [ ] Dashboard atualizado
- [ ] Banco de dados atualizado

### **Read (Visualizar)**
- [ ] Lista exibe todos os clientes
- [ ] Informações corretas exibidas (nome, email, telefone)
- [ ] Busca funciona (nome, email, telefone)
- [ ] Filtros funcionais
- [ ] Ordenação funciona (nome, data, agendamentos)
- [ ] Paginação funciona (se implementado)
- [ ] Detalhes completos acessíveis
- [ ] Histórico de agendamentos visível
- [ ] Estatísticas corretas
- [ ] Galeria de fotos visível

### **Update (Editar)**
- [ ] Modal de edição abre com dados preenchidos
- [ ] Campos editáveis
- [ ] Validações aplicadas
- [ ] Atualização bem-sucedida
- [ ] Toast de confirmação
- [ ] Lista atualizada
- [ ] Detalhes atualizados
- [ ] Timestamp de modificação atualizado
- [ ] Foto/Avatar pode ser atualizado

### **Delete (Excluir)**
- [ ] Modal de confirmação aparece
- [ ] Aviso claro sobre consequências
- [ ] Contagem de agendamentos vinculados exibida
- [ ] Contagem de arquivos vinculados exibida
- [ ] Opção de cancelar funciona
- [ ] Exclusão bem-sucedida (se sem agendamentos)
- [ ] Bloqueio funciona (se com agendamentos)
- [ ] Alternativa "Desativar" disponível
- [ ] Toast de confirmação
- [ ] Removido da lista
- [ ] Dashboard atualizado

### **Schedule (Agendar)**
- [ ] Botão "Agendar" funciona na lista
- [ ] Botão "Agendar" funciona nos detalhes
- [ ] Cliente pré-selecionado no modal
- [ ] Agendamento criado com sucesso
- [ ] Histórico do cliente atualizado
- [ ] Contador de agendamentos incrementado

### **History (Histórico)**
- [ ] Lista de agendamentos completa
- [ ] Ordenação cronológica
- [ ] Filtros funcionam (status, período, tipo)
- [ ] Estatísticas corretas
- [ ] Taxa de comparecimento calculada
- [ ] Tipo mais comum detectado
- [ ] Última visita exibida

### **Integrações**
- [ ] Google Drive sincronizado
- [ ] Estrutura de pastas correta
- [ ] Exportação de dados funciona
- [ ] Links entre cliente ↔ agendamentos
- [ ] Links entre cliente ↔ arquivos

### **Validações**
- [ ] Email válido obrigatório
- [ ] Telefone formatado corretamente
- [ ] Nome obrigatório
- [ ] Email duplicado bloqueado
- [ ] Mensagens de erro claras
- [ ] Feedback visual adequado

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
**Cenários Críticos:** 2, 3, 4, 5, 6  
**Cenários Opcionais:** 7

**Próximos Passos Após Conclusão:**
1. Documentar bugs encontrados
2. Criar issues para correções necessárias
3. Testar novamente após correções
4. Marcar TODO como "completed"
5. Avançar para próximo teste: Importação de Dados (Excel e ICS)

---

✅ **Teste criado em:** 27 de Outubro de 2025  
📋 **Baseado no plano:** `sistema-100--funcional.plan.md` Seção 3.2

