# 📸 Testes Visuais - Sistema Antigo vs Novo

## Setup de Teste

### 1. Iniciar os 3 Sistemas

```bash
# Terminal 1: Backend Antigo
cd agenda-hibrida-v2
npm run dev
# → Porta 3001

# Terminal 2: Frontend Antigo  
cd agenda-hibrida-frontend
npm run dev
# → Porta 5173

# Terminal 3: Sistema Novo
cd tattoo-scheduler-nextjs
npm run dev
# → Porta 3000
```

### 2. Navegador Split Screen

- **Esquerda:** http://localhost:5173 (ANTIGO - Referência)
- **Direita:** http://localhost:3000 (NOVO - Em validação)

---

## Checklist de Validação Visual

### ✅ Dashboard

**URL Antigo:** http://localhost:5173  
**URL Novo:** http://localhost:3000

- [ ] **Cards de Estatísticas**
  - [ ] 4 cards visíveis
  - [ ] Cores corretas (verde, azul, roxo, vermelho)
  - [ ] Ícones iguais
  - [ ] Números aparecem
  - [ ] Hover scale funciona
  - [ ] Click navega para aba correta

- [ ] **Status do Sistema**
  - [ ] Badges de armazenamento
  - [ ] Status Local Storage
  - [ ] Status Google Drive

- [ ] **Lista de Agendamentos**
  - [ ] Mostra próximos 5
  - [ ] Botão "Novo Agendamento"
  - [ ] Modal abre ao clicar
  - [ ] Empty state se vazio

**Screenshot:** `screenshots/01-dashboard-comparison.png`

---

### ✅ Calendário

**URL Novo:** http://localhost:3000/dashboard/calendario

- [ ] **Layout**
  - [ ] Grid mensal 7x6
  - [ ] Dias da semana no topo
  - [ ] Mês e ano corretos
  - [ ] Botões de navegação (← →)
  - [ ] Botão "Hoje"

- [ ] **Agendamentos**
  - [ ] Aparecem nos dias corretos
  - [ ] Cores por tipo
  - [ ] Hora visível
  - [ ] Cliente aparece

- [ ] **Interações**
  - [ ] Click em dia vazio
  - [ ] Click em agendamento (modal abre)
  - [ ] Navegação meses funciona
  - [ ] "Hoje" volta para mês atual

- [ ] **Legenda**
  - [ ] Cores explicadas
  - [ ] Grande, Média, Pequena, Retoque

**Screenshot:** `screenshots/02-calendario-comparison.png`

---

### ✅ Agendamentos

**URL Novo:** http://localhost:3000/agendamentos

- [ ] **Lista**
  - [ ] Cards de agendamentos
  - [ ] Status badges
  - [ ] Informações do cliente
  - [ ] Data/hora formatadas
  - [ ] Tipo de tatuagem
  - [ ] Preço

- [ ] **Modal Novo**
  - [ ] Botão "Novo Agendamento" abre
  - [ ] Todos campos presentes
  - [ ] Select de clientes funciona
  - [ ] Date picker funciona
  - [ ] Time picker funciona
  - [ ] Select tipo de tatuagem
  - [ ] Validação funciona
  - [ ] Toast ao salvar

- [ ] **Modal Editar**
  - [ ] Botão "Editar" abre modal
  - [ ] Campos pré-preenchidos
  - [ ] Pode alterar valores
  - [ ] Toast ao salvar

- [ ] **Exclusão**
  - [ ] Dialog de confirmação
  - [ ] "Tem certeza?"
  - [ ] Exclui ao confirmar
  - [ ] Toast de sucesso

**Screenshot:** `screenshots/03-agendamentos-comparison.png`

---

### ✅ Clientes - Lista

**URL Novo:** http://localhost:3000/clientes

- [ ] **Grid**
  - [ ] Cards em grid responsivo
  - [ ] 3-4 colunas desktop
  - [ ] 2 colunas tablet
  - [ ] 1 coluna mobile

- [ ] **Card Individual**
  - [ ] Avatar com iniciais
  - [ ] Nome do cliente
  - [ ] Telefone
  - [ ] Email
  - [ ] Botões Ver/Editar/Excluir

- [ ] **Busca**
  - [ ] Input de busca funciona
  - [ ] Filtra em tempo real
  - [ ] Busca por nome/telefone/email

- [ ] **Modal Novo Cliente**
  - [ ] Botão abre modal
  - [ ] Formulário completo
  - [ ] Validação funciona
  - [ ] Toast ao salvar

**Screenshot:** `screenshots/04-clientes-lista-comparison.png`

---

### ✅ Clientes - Detalhes (9 Sub-abas)

**URL Novo:** http://localhost:3000/clientes/[id]

#### Banner do Cliente
- [ ] Avatar grande
- [ ] Nome, email, telefone
- [ ] 4 cards de estatísticas
- [ ] Botão voltar

#### Aba 1: Overview
- [ ] Formulário editável
- [ ] Informações pessoais
- [ ] Endereço completo
- [ ] Observações
- [ ] Botão Editar/Salvar

#### Aba 2: Projects
- [ ] Lista de projetos
- [ ] Status (planejamento/em andamento/concluído)
- [ ] Sessões completadas/estimadas
- [ ] Botão "Novo Projeto"

#### Aba 3: PhotoGallery
- [ ] Grid de fotos
- [ ] Hover effect
- [ ] Click abre lightbox
- [ ] Botão "Upload Fotos"

#### Aba 4: Communication
- [ ] Histórico de mensagens
- [ ] Tipo (email/SMS/WhatsApp)
- [ ] Data/hora
- [ ] Botão "Nova Mensagem"

#### Aba 5: Financial
- [ ] 3 cards de estatísticas
- [ ] Lista de pagamentos
- [ ] Status (pago/pendente/atrasado)
- [ ] Botão "Novo Pagamento"

#### Aba 6: Documents
- [ ] Lista de documentos
- [ ] Tipo de arquivo
- [ ] Data de upload
- [ ] Botões Download/Excluir
- [ ] Botão "Novo Documento"

#### Aba 7: Health
- [ ] Alerta de confidencialidade
- [ ] Campos de saúde
- [ ] Alergias
- [ ] Medicamentos
- [ ] Condições médicas
- [ ] Contato de emergência
- [ ] Botão Editar/Salvar

#### Aba 8: Preferences
- [ ] Idioma preferido
- [ ] Método de contato
- [ ] Preferências de notificação
- [ ] Botão Editar/Salvar

#### Aba 9: PrivateNotes
- [ ] Lista de notas
- [ ] Textarea para nova nota
- [ ] Botão "Adicionar Nota"
- [ ] Botão excluir em cada nota
- [ ] Data de criação

**Screenshots:**  
- `screenshots/05-cliente-overview.png`
- `screenshots/06-cliente-projects.png`
- `screenshots/07-cliente-gallery.png`
- `screenshots/08-cliente-communication.png`
- `screenshots/09-cliente-financial.png`
- `screenshots/10-cliente-documents.png`
- `screenshots/11-cliente-health.png`
- `screenshots/12-cliente-preferences.png`
- `screenshots/13-cliente-notes.png`

---

### ✅ Galeria

**URL Novo:** http://localhost:3000/galeria

- [ ] **Filtros**
  - [ ] Busca funciona
  - [ ] Filtro por tipo
  - [ ] Toggle Grid/List

- [ ] **Grid View**
  - [ ] Grid responsivo
  - [ ] Hover mostra info
  - [ ] Click abre lightbox

- [ ] **List View**
  - [ ] Lista vertical
  - [ ] Thumbnail + info
  - [ ] Click abre lightbox

- [ ] **Lightbox**
  - [ ] Imagem grande
  - [ ] Botão fechar (X)
  - [ ] Navegação ← →
  - [ ] Informações embaixo
  - [ ] Contador (1 de N)

- [ ] **Upload**
  - [ ] Botão "Upload Fotos"
  - [ ] Modal/página de upload

**Screenshot:** `screenshots/14-galeria-comparison.png`

---

### ✅ Funcionários

**URL Novo:** http://localhost:3000/funcionarios

- [ ] **Grid**
  - [ ] Cards de funcionários
  - [ ] Avatar com iniciais
  - [ ] Nome e cargo
  - [ ] Status badge (ativo/inativo)
  - [ ] Taxa/hora e comissão
  - [ ] Data de contratação

- [ ] **Modal Novo**
  - [ ] Botão abre modal
  - [ ] Formulário completo
  - [ ] Validação
  - [ ] Toast ao salvar

- [ ] **Ações**
  - [ ] Botão Editar
  - [ ] Botão Excluir (confirmação)

**Screenshot:** `screenshots/15-funcionarios-comparison.png`

---

### ✅ Financeiro

**URL Novo:** http://localhost:3000/financeiro

- [ ] **Cards de Estatísticas**
  - [ ] Total Receita
  - [ ] Receita do Mês
  - [ ] Pagamentos Pendentes
  - [ ] Pagamentos Recebidos

- [ ] **Tabs**
  - [ ] Faturas
  - [ ] Pagamentos
  - [ ] Gift Cards
  - [ ] Assinaturas
  - [ ] Pacotes

- [ ] **Empty States**
  - [ ] Aparecem quando vazio
  - [ ] Botões de ação

**Screenshot:** `screenshots/16-financeiro-comparison.png`

---

### ✅ Configurações

**URL Novo:** http://localhost:3000/configuracoes

- [ ] **Tabs**
  - [ ] Geral
  - [ ] Notificações
  - [ ] Sincronização
  - [ ] Integrações
  - [ ] Segurança

- [ ] **Geral**
  - [ ] Nome do estúdio
  - [ ] Email
  - [ ] Telefone
  - [ ] Endereço

- [ ] **Notificações**
  - [ ] Switches funcionam
  - [ ] Persistem ao recarregar

- [ ] **Sincronização**
  - [ ] Auto-sync switch
  - [ ] Intervalo
  - [ ] Backup switch

- [ ] **Integrações**
  - [ ] Google Calendar
  - [ ] Google Drive
  - [ ] Botões "Conectar"

- [ ] **Segurança**
  - [ ] Alterar senha
  - [ ] 2FA
  - [ ] Zona de perigo

**Screenshot:** `screenshots/17-configuracoes-comparison.png`

---

## ✅ Testes de Responsividade

### Desktop (1920x1080)
- [ ] Todas abas funcionam
- [ ] Grids com 3-4 colunas
- [ ] Sidebar visível

### Tablet (768px)
- [ ] Layout ajusta
- [ ] Grids com 2 colunas
- [ ] Navegação adaptada

### Mobile (375px)
- [ ] Layout mobile
- [ ] Grids com 1 coluna
- [ ] Menu hamburger
- [ ] Scroll funciona

**Screenshots:**  
- `screenshots/responsive-desktop.png`
- `screenshots/responsive-tablet.png`
- `screenshots/responsive-mobile.png`

---

## ✅ Testes de Dark Mode

- [ ] Toggle funciona
- [ ] Cores mudam corretamente
- [ ] Contraste adequado
- [ ] Persiste no reload

**Screenshots:**  
- `screenshots/dark-mode-dashboard.png`
- `screenshots/dark-mode-clientes.png`

---

## ✅ Console e Erros

Para cada página testada:

- [ ] Console sem erros vermelhos
- [ ] Warnings aceitáveis (se houver)
- [ ] Network tab mostra chamadas corretas
- [ ] Status 200/201 nas APIs
- [ ] Dados carregam

---

## Resultado Final

| Página | Visual | Funcional | Responsivo | Dark Mode | Console Limpo |
|--------|--------|-----------|------------|-----------|---------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendário | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agendamentos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clientes Lista | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cliente Detalhes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Galeria | ✅ | ✅ | ✅ | ✅ | ✅ |
| Funcionários | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financeiro | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurações | ✅ | ✅ | ✅ | ✅ | ✅ |

**Aprovado para produção:** ✅ SIM / ❌ NÃO

---

## Observações e Bugs Encontrados

1. 
2. 
3. 

---

**Data de Teste:** ___/___/___  
**Testador:** ________________  
**Versão:** 1.0

