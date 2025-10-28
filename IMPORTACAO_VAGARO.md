# 📥 Sistema de Importação Vagaro - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquivos Suportados](#arquivos-suportados)
3. [Instalação](#instalação)
4. [Uso via API](#uso-via-api)
5. [Uso via CLI](#uso-via-cli)
6. [Estrutura de Dados](#estrutura-de-dados)
7. [Validação e Integridade](#validação-e-integridade)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Sistema de Importação Vagaro é uma solução completa para migrar **TODOS** os dados do Vagaro para o sistema de gestão de tatuagem, mantendo 100% dos dados sem perdas.

### ✨ Funcionalidades

- ✅ **Zero Perda de Dados**: Todos os campos do Vagaro são importados
- ✅ **Detecção Automática**: Identifica o tipo de arquivo automaticamente
- ✅ **Deduplicação Inteligente**: Evita duplicatas por email, telefone ou nome
- ✅ **Integridade Referencial**: Vincula automaticamente transações, gift cards e formulários aos clientes
- ✅ **Validação Robusta**: Verifica consistência dos dados após importação
- ✅ **Logs Detalhados**: Rastreabilidade completa de cada operação
- ✅ **Interface Web + CLI**: Duas formas de uso

---

## 📁 Arquivos Suportados

### 1. **CustomersList.xlsx** - Clientes
Campos importados (29 campos):
- Identificação: First Name, Last Name, Customer Since, Last Visited
- Contato: Email, Mobile, Day Phone, Night Phone
- Endereço: Address, Apt/Suite, City, State, Zip
- Dados pessoais: Birthdate, Gender
- Preferências: Membership, Tags, Referred By, Online Booking
- Financeiro: Credit Card, Bank, Amount Paid
- Estatísticas: Appointments Booked, Check-Ins, Points Earned, No Shows

### 2. **DepositReport.xlsx** - Transações Financeiras
Campos importados (16 campos):
- Datas: TransactionDate, DepositDate
- Identificação: TranNum, TranType
- Pagamento: Customer Name, Last4ofAcct, AcctType
- Valores: Gross, DiscFee, PerTran, Refund, Fee, NetAmount

### 3. **Services.xlsx** - Serviços
Campos importados (9 campos):
- Service Name, Total Appointments, Total Attendees
- Service Sales, Service Add-On Sales
- Class Sales, Class Add-On Sales
- Cost To Business, Average Sale

### 4. **GiftCardsManagement.xlsx** - Gift Cards
Campos importados (13 campos):
- GC No, Purchase Date, Expire On
- From, Assign To, Merchant Account
- Init.Amount, Current Balance
- Visits Remaining, Status, Void Reason

### 5. **Unsigned Forms.xlsx** - Formulários
Campos importados (6 campos):
- Form Name, Type, Customer
- Fill Date, Signature Status, Signature Required

---

## 🛠️ Instalação

### 1. Executar Migrations do Banco de Dados

```bash
cd agenda-hibrida-v2
node database/run-vagaro-migrations.js
```

Isso criará:
- Novos campos na tabela `clients`
- Tabela `vagaro_transactions`
- Tabela `vagaro_services`
- Tabela `vagaro_gift_cards`
- Tabela `vagaro_forms`

### 2. Verificar Dependências

As dependências já devem estar instaladas. Se não:

```bash
npm install xlsx multer sqlite3
```

### 3. Iniciar o Servidor (para usar via API)

```bash
npm start
```

---

## 🌐 Uso via API

### Upload de Arquivo Único

```bash
curl -X POST http://localhost:3001/api/imports/vagaro/upload \
  -F "file=@/caminho/para/CustomersList.xlsx"
```

Resposta:
```json
{
  "success": true,
  "message": "Importação concluída com sucesso",
  "stats": {
    "total": 150,
    "created": 120,
    "updated": 25,
    "skipped": 5,
    "errors": []
  },
  "duration": "2.45s"
}
```

### Upload de Múltiplos Arquivos

```bash
curl -X POST http://localhost:3001/api/imports/vagaro/batch \
  -F "files=@CustomersList.xlsx" \
  -F "files=@DepositReport.xlsx" \
  -F "files=@Services.xlsx"
```

### Preview de Arquivo

```bash
curl -X POST http://localhost:3001/api/imports/vagaro/preview \
  -F "file=@CustomersList.xlsx"
```

### Estatísticas Gerais

```bash
curl http://localhost:3001/api/imports/vagaro/stats
```

### Logs de Importação

```bash
curl http://localhost:3001/api/imports/vagaro/logs?limit=20
```

---

## 💻 Uso via CLI

### Importar Diretório Inteiro

```bash
node scripts/import-all-vagaro.js \
  --dir=/Users/luizlopes/Desktop/vagaro_dados_download
```

### Importar Arquivo Único

```bash
node scripts/import-all-vagaro.js \
  --file=/caminho/para/CustomersList.xlsx
```

### Dry-Run (Simulação)

```bash
node scripts/import-all-vagaro.js \
  --dir=/caminho/para/arquivos \
  --dry-run
```

### Com Logs Detalhados

```bash
node scripts/import-all-vagaro.js \
  --dir=/caminho/para/arquivos \
  --verbose
```

### Validar Dados Importados

```bash
node scripts/validate-import.js
```

Com detalhes:
```bash
node scripts/validate-import.js --verbose
```

---

## 📊 Estrutura de Dados

### Tabela: `clients`

```sql
-- Novos campos adicionados:
customer_since TEXT
last_visited TEXT
first_name TEXT
last_name TEXT
mobile TEXT
day_phone TEXT
night_phone TEXT
birthdate TEXT
apt_suite TEXT
address_line1 TEXT
membership TEXT
tags TEXT
referred_by TEXT
online_booking_allowed BOOLEAN
credit_card_on_file TEXT
bank_on_file TEXT
vagaro_appointments_booked INTEGER
vagaro_classes_booked INTEGER
vagaro_check_ins INTEGER
vagaro_points_earned INTEGER
vagaro_amount_paid REAL
vagaro_no_shows INTEGER
vagaro_employee_seen TEXT
```

### Tabela: `vagaro_transactions`

```sql
CREATE TABLE vagaro_transactions (
  id INTEGER PRIMARY KEY,
  client_id INTEGER,
  transaction_date TEXT,
  deposit_date TEXT,
  transaction_number TEXT UNIQUE,
  transaction_type TEXT,
  swiped_typed TEXT,
  customer_name TEXT,
  last_4_acct TEXT,
  account_type TEXT,
  gross_amount REAL,
  discount_fee REAL,
  per_transaction_fee REAL,
  refund_amount REAL,
  total_fee REAL,
  net_amount REAL,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Views Criadas

```sql
-- v_transactions_summary: Resumo financeiro por mês
-- v_top_services: Serviços mais populares
-- v_active_gift_cards: Gift cards ativos
-- v_gift_cards_summary: Resumo de gift cards por status
-- v_unsigned_forms: Formulários pendentes de assinatura
-- v_forms_stats: Estatísticas de formulários
```

---

## ✅ Validação e Integridade

### O que é Validado

1. **Clientes**
   - Clientes sem nome
   - Emails duplicados
   - Telefones duplicados

2. **Transações**
   - Taxa de vinculação com clientes
   - Valores negativos (reembolsos)
   - Consistência de valores (gross - fees = net)

3. **Serviços**
   - Serviços ativos vs inativos
   - Top serviços por appointments

4. **Gift Cards**
   - Gift cards expirados mas ativos
   - Saldo total em aberto
   - Vinculação com clientes

5. **Formulários**
   - Taxa de assinatura
   - Formulários pendentes

6. **Integridade Referencial**
   - Transações órfãs (sem cliente)
   - Gift cards órfãos
   - Formulários órfãos

### Executar Validação

```bash
node scripts/validate-import.js
```

### Interpretando Resultados

- ✅ Verde: Tudo OK
- ⚠️ Amarelo: Avisos (não críticos)
- ❌ Vermelho: Erros críticos (dados inconsistentes)

---

## 🔧 Troubleshooting

### Problema: Arquivo não é reconhecido

**Solução**: O sistema detecta automaticamente pelo nome. Renomeie:
- CustomersList.xlsx ✅
- customers.xlsx ✅
- Clientes.xlsx ❌ (não detecta)

### Problema: Muitos clientes duplicados

**Solução**: O sistema deduplica por:
1. Email (prioridade 1)
2. Telefone (prioridade 2)
3. Nome completo (prioridade 3)

Se quiser forçar criação de novos:
- Remova emails duplicados do Excel antes de importar
- Ou use nomes diferentes

### Problema: Transações não vinculam com clientes

**Solução**: 
1. Importe CLIENTES primeiro
2. Depois importe TRANSAÇÕES
3. O sistema vincula por nome automaticamente

Para aumentar vinculação:
- Garanta que nomes nos arquivos sejam idênticos
- Use o mesmo formato: "First Last"

### Problema: Erro "Table already exists"

**Solução**: Normal! As migrations ignoram tabelas existentes automaticamente.

### Problema: Campos não aparecem no banco

**Solução**: Execute as migrations:
```bash
node database/run-vagaro-migrations.js
```

### Problema: Arquivo muito grande (timeout)

**Solução**: Use o CLI em vez da API:
```bash
node scripts/import-all-vagaro.js --file=arquivo_grande.xlsx
```

---

## 📈 Melhores Práticas

1. **Ordem de Importação**
   ```
   1. CustomersList.xlsx (primeiro!)
   2. Services.xlsx
   3. DepositReport.xlsx
   4. GiftCardsManagement.xlsx
   5. Unsigned Forms.xlsx
   ```

2. **Backup Antes**
   ```bash
   cp agenda_hibrida.db agenda_hibrida.db.backup
   ```

3. **Validar Depois**
   ```bash
   node scripts/validate-import.js --verbose
   ```

4. **Conferir Totais**
   - Compare totais do Vagaro com os importados
   - Use as views SQL para relatórios rápidos

5. **Logs**
   - Sempre salve logs de importações grandes
   - Use `--verbose` para debug

---

## 🎯 Exemplos Práticos

### Caso 1: Importação Inicial Completa

```bash
# 1. Backup
cp agenda_hibrida.db agenda_hibrida.db.backup

# 2. Executar migrations
node database/run-vagaro-migrations.js

# 3. Importar tudo
node scripts/import-all-vagaro.js \
  --dir=/Users/luizlopes/Desktop/vagaro_dados_download \
  --verbose

# 4. Validar
node scripts/validate-import.js --verbose
```

### Caso 2: Atualizar Dados Existentes

```bash
# Reimportar apenas clientes (atualiza existentes)
node scripts/import-all-vagaro.js \
  --file=CustomersList_Updated.xlsx
```

### Caso 3: Testar Antes de Importar

```bash
# Dry-run para ver o que será importado
node scripts/import-all-vagaro.js \
  --dir=/caminho/arquivos \
  --dry-run

# Se OK, importar de verdade
node scripts/import-all-vagaro.js \
  --dir=/caminho/arquivos
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs em `agenda-hibrida-v2/reports/`
2. Execute validação: `node scripts/validate-import.js`
3. Confira este documento

---

## 🎉 Resultado Esperado

Após importação bem-sucedida, você terá:

- ✅ Todos os clientes do Vagaro no sistema
- ✅ Histórico completo de transações financeiras
- ✅ Catálogo de serviços com estatísticas
- ✅ Gift cards ativos rastreáveis
- ✅ Formulários e suas assinaturas
- ✅ Integridade referencial 100%
- ✅ Relatórios e dashboards prontos

