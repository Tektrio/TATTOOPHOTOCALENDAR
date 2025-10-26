# 🎯 Setup do Sistema de Gestão de Clientes

Sistema completo de gestão de clientes inspirado no Vagaro, implementado no TattooScheduler.

## ✅ O que foi Implementado

### Backend (Node.js + SQLite3)

#### 1. Schema de Banco de Dados (`/database/schema.sql`)
- ✅ Tabela `customer_notes` - Notas dos clientes
- ✅ Tabela `custom_forms` - Formulários customizáveis
- ✅ Tabela `customer_forms` - Formulários preenchidos
- ✅ Tabela `customer_files` - Arquivos dos clientes
- ✅ Tabela `products` - Catálogo de produtos
- ✅ Tabela `customer_products` - Compras de produtos
- ✅ Tabela `gift_cards` - Cartões presente
- ✅ Tabela `gift_card_usage` - Uso de gift cards
- ✅ Tabela `service_packages` - Pacotes de serviços
- ✅ Tabela `customer_packages` - Pacotes comprados
- ✅ Tabela `package_usage` - Uso de pacotes
- ✅ Tabela `membership_plans` - Planos de assinatura
- ✅ Tabela `customer_memberships` - Memberships dos clientes
- ✅ Tabela `membership_payments` - Pagamentos de memberships
- ✅ Tabela `invoices` - Faturas
- ✅ Tabela `invoice_items` - Itens das faturas
- ✅ Tabela `tags` - Tags/etiquetas
- ✅ Tabela `client_tags` - Tags dos clientes
- ✅ Tabela `client_relationships` - Relacionamentos (Family & Friends)
- ✅ Tabela `loyalty_points` - Sistema de pontos de fidelidade
- ✅ Tabela `client_statistics` - Estatísticas agregadas
- ✅ Tabela `vagaro_import_metadata` - Metadados de importação Vagaro

#### 2. Rotas de API

##### `/routes/customers.js`
- `GET /api/customers` - Listar clientes com paginação e busca
- `GET /api/customers/:id` - Buscar cliente específico com estatísticas
- `POST /api/customers` - Criar novo cliente
- `PUT /api/customers/:id` - Atualizar cliente
- `DELETE /api/customers/:id` - Deletar cliente
- `GET /api/customers/:id/statistics` - Estatísticas detalhadas
- `PUT /api/customers/:id/statistics/refresh` - Recalcular estatísticas

##### `/routes/customer-notes.js`
- `GET /api/customers/:clientId/notes` - Listar notas do cliente
- `POST /api/customers/:clientId/notes` - Criar nova nota
- `PUT /api/customers/:clientId/notes/:noteId` - Atualizar nota
- `DELETE /api/customers/:clientId/notes/:noteId` - Deletar nota

##### `/routes/products.js`
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/customers/:clientId/products` - Histórico de compras
- `POST /api/customers/:clientId/products` - Registrar compra

##### `/routes/invoices.js`
- `GET /api/invoices` - Listar faturas
- `GET /api/invoices/:id` - Buscar fatura específica
- `POST /api/invoices` - Criar nova fatura
- `PUT /api/invoices/:id` - Atualizar fatura
- `DELETE /api/invoices/:id` - Anular fatura (void)

### Frontend (React 19 + Vite + Tailwind)

#### Componentes Principais

##### `/components/CustomerManagement.jsx`
Componente principal com:
- Header com informações do cliente
- Avatar com iniciais
- Estatísticas rápidas (vendas, agendamentos, pontos, faltas)
- Sistema de abas (10 abas)
- Navegação fluida entre abas

##### 10 Abas de Gestão

1. **ProfileTab** (`/components/customer/ProfileTab.jsx`) ✅ COMPLETO
   - Edição de informações pessoais
   - Endereço completo
   - Contato de emergência
   - Estatísticas detalhadas
   - Observações

2. **AppointmentsTab** (`/components/customer/AppointmentsTab.jsx`) ✅ COMPLETO
   - Tabela de histórico de agendamentos
   - Filtros por status, data
   - Badges de status coloridos
   - Link para calendário
   - Exportação de dados

3. **NotesTab** (`/components/customer/NotesTab.jsx`) ✅ COMPLETO
   - Lista cronológica de notas
   - Criar/editar/deletar notas
   - Título opcional
   - Timestamp e autor

4. **ProductsTab** (`/components/customer/ProductsTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

5. **FormsTab** (`/components/customer/FormsTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

6. **FilesTab** (`/components/customer/FilesTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

7. **GiftCardsTab** (`/components/customer/GiftCardsTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

8. **PackagesTab** (`/components/customer/PackagesTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

9. **MembershipsTab** (`/components/customer/MembershipsTab.jsx`) 🔄 PLACEHOLDER
   - Estrutura básica criada
   - Pronto para implementação completa

10. **InvoicesTab** (`/components/customer/InvoicesTab.jsx`) 🔄 PLACEHOLDER
    - Estrutura básica criada
    - Pronto para implementação completa

## 🚀 Como Usar

### 1. Executar Migration do Banco de Dados

```bash
cd agenda-hibrida-v2
node database/migrate.js
```

Isso criará todas as tabelas necessárias no banco de dados.

### 2. Registrar as Novas Rotas

Adicione ao `server.js`, após a linha onde o banco de dados é inicializado:

```javascript
// Registrar rotas de gestão de clientes
const { registerRoutes } = require('./routes/index');
app.set('db', db); // Disponibilizar db para as rotas
registerRoutes(app);
```

### 3. Configurar Rota no Frontend

Adicione a rota no arquivo de rotas do React (por exemplo, `App.jsx` ou `main.jsx`):

```jsx
import CustomerManagement from './components/CustomerManagement';

// Dentro do seu Router:
<Route path="/customers/:customerId" element={<CustomerManagement />} />
```

### 4. Instalar Dependência (se necessário)

```bash
cd agenda-hibrida-frontend
npm install date-fns
```

### 5. Iniciar o Sistema

Terminal 1 (Backend):
```bash
cd agenda-hibrida-v2
npm start
```

Terminal 2 (Frontend):
```bash
cd agenda-hibrida-frontend
npm run dev
```

## 📊 Estrutura de Dados

### Cliente Expandido

O cliente agora possui campos adicionais:
- `birth_date` - Data de nascimento
- `gender` - Gênero
- `address`, `city`, `state`, `zip_code` - Endereço completo
- `avatar_url` - URL da foto do perfil
- `emergency_contact`, `emergency_phone` - Contato de emergência
- `instagram` - Handle do Instagram
- `referred_by` - Quem indicou
- `credit_card_last4` - Últimos 4 dígitos do cartão
- `customer_since` - Cliente desde quando
- `vagaro_id` - ID do Vagaro (para importação)

### Estatísticas do Cliente

Calculadas automaticamente:
- `total_appointments` - Total de agendamentos
- `completed_appointments` - Agendamentos completados
- `no_shows` - Faltas
- `cancellations` - Cancelamentos
- `total_sales` - Total gasto
- `loyalty_points_balance` - Saldo de pontos
- `last_visit_date` - Última visita
- `first_visit_date` - Primeira visita
- `average_rating` - Avaliação média

## 🔄 Importação do Vagaro

O sistema está preparado para importar dados do Vagaro:

1. Todas as tabelas possuem compatibilidade com a estrutura do Vagaro
2. Tabela `vagaro_import_metadata` armazena metadados de importação
3. Campo `vagaro_id` em clientes para mapeamento
4. Script de importação pode ser criado em `/services/vagaro-importer.js`

## 🎨 Interface

A interface foi construída com:
- **shadcn/ui** - Componentes de UI modernos
- **Tailwind CSS** - Estilização utilitária
- **Lucide Icons** - Ícones consistentes
- **date-fns** - Manipulação de datas

### Cores e Badges

Status de agendamentos:
- Pendente: Amarelo
- Confirmado: Azul
- Concluído: Verde
- Cancelado: Vermelho
- Faltou: Cinza

Estatísticas:
- Vendas: Azul
- Agendamentos: Verde
- Pontos: Roxo
- Faltas: Vermelho

## 📝 Próximos Passos

### Curto Prazo (Expandir abas existentes)
1. Implementar ProductsTab completo
2. Implementar FilesTab com upload
3. Implementar InvoicesTab com criação de faturas
4. Implementar GiftCardsTab com gestão de saldo

### Médio Prazo (Funcionalidades avançadas)
5. Implementar FormsTab com formulários dinâmicos
6. Implementar PackagesTab com gestão de sessões
7. Implementar MembershipsTab com renovações
8. Sistema de tags e relacionamentos (Family & Friends)

### Longo Prazo (Integração)
9. Script de importação do Vagaro
10. Integração com sistema de orçamentos existente
11. Integração com calendário e timeline visual
12. Relatórios e analytics avançados

## 🐛 Troubleshooting

### Erro: "Cannot find module"
Execute `npm install` no backend e frontend

### Erro: "db.all is not a function"
Certifique-se de que registrou as rotas corretamente no server.js

### Erro: "Table does not exist"
Execute o script de migration: `node database/migrate.js`

### Erro: "date-fns not found"
Instale: `npm install date-fns` no frontend

## 📚 Documentação Adicional

- [Schema SQL](/database/schema.sql) - Estrutura completa do banco
- [Plano Original](/sistema-gestao-clientes-vagaro.plan.md) - Planejamento detalhado
- [Screenshots Vagaro](/.playwright-mcp/) - Capturas de tela do sistema original

## ✨ Funcionalidades Prontas para Uso

- ✅ Gestão completa de clientes
- ✅ Estatísticas automáticas
- ✅ Sistema de notas
- ✅ Histórico de agendamentos
- ✅ Interface profissional e responsiva
- ✅ Busca e filtros
- ✅ Paginação
- ✅ CRUD completo

---

**Desenvolvido com ❤️ para TattooScheduler**  
*Sistema inspirado no Vagaro para gestão profissional de clientes*

