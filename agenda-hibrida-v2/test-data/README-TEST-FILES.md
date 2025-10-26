# Arquivos de Teste para Importação

Este diretório contém arquivos de exemplo para testar a funcionalidade de importação.

## 📄 Arquivos Disponíveis

### 1. `sample-calendar.ics`
Arquivo ICS de exemplo com 5 eventos para testar importação de calendários.

**Como testar:**
1. Acesse a página "Importar Dados"
2. Vá para aba "ICS/iCalendar"
3. Faça upload do arquivo `sample-calendar.ics`
4. Revise o preview
5. Confirme a importação

### 2. Excel Vagaro - Clientes

**Para criar um arquivo de teste de clientes:**

Crie uma planilha Excel (.xlsx) com as seguintes colunas:

| Name | Email | Phone | Birthday | Address | City | State | Zip |
|------|-------|-------|----------|---------|------|-------|-----|
| João Silva | joao@email.com | (11) 99999-9999 | 15/05/1990 | Rua das Flores, 123 | São Paulo | SP | 01234-567 |
| Maria Santos | maria@email.com | (11) 98888-8888 | 20/08/1985 | Av. Paulista, 456 | São Paulo | SP | 01310-100 |
| Pedro Costa | pedro@email.com | (11) 97777-7777 | 10/03/1995 | Rua Augusta, 789 | São Paulo | SP | 01304-001 |
| Ana Oliveira | ana@email.com | (11) 96666-6666 | 25/11/1988 | Rua Oscar Freire, 321 | São Paulo | SP | 01426-001 |
| Lucas Almeida | lucas@email.com | (11) 95555-5555 | 30/07/1992 | Rua Haddock Lobo, 654 | São Paulo | SP | 01414-001 |

Salve como `VAGARO_Clients.xlsx`

### 3. Excel Vagaro - Agendamentos

**Para criar um arquivo de teste de agendamentos:**

Crie uma planilha Excel (.xlsx) com as seguintes colunas:

| Client Name | Date | Time | Service | Status | Price | Duration | Notes |
|-------------|------|------|---------|--------|-------|----------|-------|
| João Silva | 28/01/2025 | 14:00 | Tatuagem tradicional | Confirmed | 500 | 120 | Cliente novo |
| Maria Santos | 29/01/2025 | 10:00 | Retoque colorido | Confirmed | 300 | 120 | Segunda sessão |
| Pedro Costa | 30/01/2025 | 15:00 | Tatuagem sombreada | Confirmed | 800 | 180 | Peça grande |
| Ana Oliveira | 31/01/2025 | 13:00 | Orçamento | Scheduled | 0 | 120 | Primeira visita |
| Lucas Almeida | 01/02/2025 | 11:00 | Tatuagem minimalista | Confirmed | 250 | 120 | Design simples |

Salve como `VAGARO_Appointments.xlsx`

## 🧪 Como Testar

### Teste 1: Importação ICS
```bash
# Já está pronto!
# Use o arquivo sample-calendar.ics incluído neste diretório
```

### Teste 2: Importação Excel Clientes
1. Crie o arquivo Excel conforme template acima
2. Acesse "Importar Dados" > "Excel Vagaro"
3. Selecione "Clientes"
4. Faça upload do arquivo
5. Revise o mapeamento automático
6. Confirme importação

### Teste 3: Importação Excel Agendamentos
1. Certifique-se que os clientes foram importados primeiro
2. Crie o arquivo Excel conforme template acima
3. Acesse "Importar Dados" > "Excel Vagaro"
4. Selecione "Agendamentos"
5. Faça upload do arquivo
6. Revise o mapeamento automático
7. Confirme importação

### Teste 4: Sincronização Google Calendar
1. Configure credenciais OAuth no .env
2. Acesse "Importar Dados" > "Google Calendar"
3. Clique em "Conectar Google Calendar"
4. Autorize o acesso
5. Clique em "Sincronizar Agora"
6. Aguarde o relatório

## 📊 Resultados Esperados

Após todas as importações, você deve ter:
- ✅ 5 clientes cadastrados
- ✅ 5 agendamentos importados do ICS
- ✅ 5 agendamentos importados do Excel
- ✅ Eventos do Google Calendar (se configurado)

## 🔍 Verificação

Para verificar os dados importados:

```bash
# Verificar clientes
cd agenda-hibrida-v2
node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./agenda_hibrida.db');
db.all('SELECT * FROM clients WHERE external_source IS NOT NULL', (err, rows) => {
  console.log('Clientes importados:', rows.length);
  rows.forEach(r => console.log('- ', r.name, '(', r.external_source, ')'));
  db.close();
});
"

# Verificar agendamentos
node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./agenda_hibrida.db');
db.all('SELECT * FROM appointments WHERE external_source IS NOT NULL', (err, rows) => {
  console.log('Agendamentos importados:', rows.length);
  rows.forEach(r => console.log('- ', r.client_name, r.date, '(', r.external_source, ')'));
  db.close();
});
"
```

## 🚨 Troubleshooting

### Erro: "Arquivo muito grande"
- Reduza o número de linhas
- Verifique MAX_UPLOAD_SIZE_MB no .env

### Erro: "Formato de data inválido"
- Use formato DD/MM/YYYY ou YYYY-MM-DD
- Certifique-se que as células estão formatadas como texto

### Erro: "Cliente não encontrado"
- Importe os clientes antes dos agendamentos
- Certifique-se que os nomes correspondem exatamente

### Duplicatas
- Use opção "Pular duplicatas" na primeira importação
- O sistema detecta duplicatas por telefone, email e external_id
