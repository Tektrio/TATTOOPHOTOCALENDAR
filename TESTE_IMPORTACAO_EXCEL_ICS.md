# Guia de Testes: Importação de Excel e ICS

## Objetivo
Testar completamente a funcionalidade de importação de dados de arquivos **Excel (.xlsx)** e **calendários ICS (.ics)**, incluindo preview, deduplicação e relatórios.

---

## Pré-requisitos

1. **Servidor backend rodando** (`node server.js` na porta 3000)
2. **Frontend rodando** (`npm start` na porta 3001)
3. **Banco de dados SQLite** configurado e acessível
4. **Credenciais Google OAuth** ativas (se aplicável)
5. **Arquivos de teste preparados**:
   - Arquivo Excel com dados de clientes e agendamentos
   - Arquivo ICS com eventos de calendário
   - Arquivo com duplicados (para testar deduplicação)

---

## Casos de Teste

### 1. Importação de Excel - Preview Inicial

#### Objetivo
Verificar se o sistema carrega e exibe corretamente um preview dos dados do Excel antes da importação.

#### Passos
1. Faça login no sistema
2. Navegue até **"Importar Dados"** ou **"Import"**
3. Clique no botão **"Escolher Arquivo"** ou **"Upload Excel"**
4. Selecione um arquivo `.xlsx` válido
5. Aguarde o carregamento

#### Resultados Esperados
- ✅ Arquivo é aceito sem erros
- ✅ Preview dos dados é exibido em uma tabela
- ✅ Cabeçalhos das colunas estão visíveis
- ✅ Primeiras linhas de dados são exibidas (limite de 5-10 registros)
- ✅ Contador mostra o número total de registros no arquivo
- ✅ Botões de ação aparecem: **"Importar"**, **"Cancelar"**, **"Download Template"**

#### Critérios de Falha
- ❌ Arquivo não é aceito
- ❌ Preview não aparece ou está vazio
- ❌ Dados exibidos estão incorretos ou truncados
- ❌ Erro de timeout ou falha no upload

---

### 2. Validação de Campos Obrigatórios no Excel

#### Objetivo
Verificar se o sistema valida corretamente a presença e formato de campos obrigatórios.

#### Passos
1. Prepare um arquivo Excel com dados **faltando campos obrigatórios**:
   - Linha sem nome de cliente
   - Linha sem data de agendamento
   - Linha com email inválido
2. Faça upload do arquivo
3. Observe o preview e validações

#### Resultados Esperados
- ✅ Sistema identifica linhas com dados faltantes
- ✅ Mensagem de erro é exibida para cada linha inválida
- ✅ Linhas válidas são destacadas (verde)
- ✅ Linhas inválidas são destacadas (vermelho ou amarelo)
- ✅ Opção para **"Importar apenas dados válidos"** é oferecida
- ✅ Relatório de validação mostra:
  - Total de linhas
  - Linhas válidas
  - Linhas com erro
  - Detalhes dos erros

#### Critérios de Falha
- ❌ Sistema não identifica erros
- ❌ Mensagens de erro não são claras
- ❌ Importação prossegue sem validação

---

### 3. Deduplicação de Dados no Excel

#### Objetivo
Verificar se o sistema detecta e trata corretamente registros duplicados.

#### Passos
1. Prepare um arquivo Excel com **dados duplicados**:
   - Cliente com mesmo email
   - Cliente com mesmo telefone
   - Agendamento na mesma data/hora para o mesmo cliente
2. Faça upload do arquivo
3. Observe o processo de deduplicação

#### Resultados Esperados
- ✅ Sistema identifica duplicados automaticamente
- ✅ Mensagem de alerta é exibida: "X registros duplicados encontrados"
- ✅ Preview mostra duplicados destacados
- ✅ Opções de tratamento de duplicados são oferecidas:
  - **"Ignorar duplicados"** (não importar)
  - **"Atualizar registros existentes"** (sobrescrever)
  - **"Importar como novos"** (criar duplicados)
- ✅ Relatório de deduplicação mostra:
  - Total de duplicados
  - Critério de detecção usado (email, telefone, etc.)
  - Ação que será tomada

#### Critérios de Falha
- ❌ Duplicados não são detectados
- ❌ Sistema cria duplicados sem avisar
- ❌ Opções de tratamento não funcionam

---

### 4. Importação Completa de Excel com Sucesso

#### Objetivo
Realizar uma importação completa e verificar se os dados são salvos corretamente.

#### Passos
1. Prepare um arquivo Excel com **10-20 registros válidos**
2. Faça upload do arquivo
3. Revise o preview
4. Selecione **"Importar apenas dados válidos"** (se houver inválidos)
5. Clique em **"Importar"**
6. Aguarde o processo de importação

#### Resultados Esperados
- ✅ Barra de progresso é exibida durante a importação
- ✅ Mensagem de sucesso aparece ao final: "X registros importados com sucesso"
- ✅ Relatório detalhado é gerado:
  - Total de registros processados
  - Registros importados
  - Registros ignorados (duplicados)
  - Erros (se houver)
- ✅ Dados aparecem na lista de **Clientes** e **Agendamentos**
- ✅ Notificação é enviada (se configurada)
- ✅ Log de importação é criado

#### Critérios de Falha
- ❌ Importação falha sem mensagem clara
- ❌ Dados não aparecem no banco
- ❌ Relatório não é gerado

---

### 5. Download de Template Excel

#### Objetivo
Verificar se o sistema oferece um template correto para facilitar a importação.

#### Passos
1. Navegue até **"Importar Dados"**
2. Clique em **"Download Template"** ou **"Baixar Modelo"**
3. Abra o arquivo baixado no Excel

#### Resultados Esperados
- ✅ Arquivo `.xlsx` é baixado com sucesso
- ✅ Template contém os cabeçalhos corretos:
  - Nome do Cliente
  - Email
  - Telefone
  - Data de Agendamento
  - Horário
  - Tipo de Tatuagem
  - Status
  - Observações
- ✅ Exemplo de dados está incluído (opcional)
- ✅ Instruções de uso estão presentes (opcional)

#### Critérios de Falha
- ❌ Download falha
- ❌ Cabeçalhos estão incorretos ou faltando
- ❌ Formato do arquivo não é compatível

---

### 6. Importação de ICS - Preview Inicial

#### Objetivo
Verificar se o sistema carrega e exibe corretamente um preview dos eventos de um arquivo ICS.

#### Passos
1. Faça login no sistema
2. Navegue até **"Importar Dados"** ou **"Import ICS"**
3. Clique no botão **"Escolher Arquivo"** ou **"Upload ICS"**
4. Selecione um arquivo `.ics` válido (ex: exportado do Google Calendar)
5. Aguarde o carregamento

#### Resultados Esperados
- ✅ Arquivo ICS é aceito sem erros
- ✅ Preview dos eventos é exibido em uma lista ou tabela
- ✅ Informações dos eventos são visíveis:
  - Título (summary)
  - Data e hora de início
  - Data e hora de término
  - Localização (se houver)
  - Descrição
- ✅ Contador mostra o número total de eventos
- ✅ Botões de ação aparecem: **"Importar"**, **"Cancelar"**

#### Critérios de Falha
- ❌ Arquivo ICS não é aceito
- ❌ Preview não aparece ou está vazio
- ❌ Eventos não são parseados corretamente
- ❌ Datas/horas estão incorretas (problema de timezone)

---

### 7. Mapeamento de Campos ICS para Agendamentos

#### Objetivo
Verificar se o sistema mapeia corretamente os campos do ICS para os campos do sistema.

#### Passos
1. Faça upload de um arquivo ICS
2. No preview, observe o mapeamento sugerido:
   - `SUMMARY` → Título do Agendamento
   - `DTSTART` → Data/Hora de Início
   - `DTEND` → Data/Hora de Término
   - `DESCRIPTION` → Observações
   - `LOCATION` → Local (se aplicável)
3. Ajuste o mapeamento se necessário (se o sistema permitir)

#### Resultados Esperados
- ✅ Mapeamento automático funciona corretamente
- ✅ Opção de ajuste manual de campos é oferecida (opcional)
- ✅ Preview mostra dados mapeados corretamente
- ✅ Campos não mapeados são identificados

#### Critérios de Falha
- ❌ Mapeamento está incorreto
- ❌ Campos importantes não são mapeados
- ❌ Ajuste manual não funciona

---

### 8. Deduplicação de Eventos ICS

#### Objetivo
Verificar se o sistema detecta eventos duplicados ao importar ICS.

#### Passos
1. Importe um arquivo ICS com eventos
2. Tente importar **o mesmo arquivo novamente**
3. Observe o processo de deduplicação

#### Resultados Esperados
- ✅ Sistema identifica eventos duplicados
- ✅ Mensagem de alerta: "X eventos já existem no sistema"
- ✅ Opções de tratamento são oferecidas:
  - **"Ignorar duplicados"**
  - **"Atualizar eventos existentes"**
  - **"Criar novos eventos"**
- ✅ Relatório de deduplicação é gerado

#### Critérios de Falha
- ❌ Duplicados não são detectados
- ❌ Sistema cria eventos duplicados sem avisar

---

### 9. Importação Completa de ICS com Sucesso

#### Objetivo
Realizar uma importação completa de ICS e verificar se os eventos são salvos corretamente.

#### Passos
1. Prepare um arquivo ICS com **5-10 eventos válidos**
2. Faça upload do arquivo
3. Revise o preview
4. Clique em **"Importar"**
5. Aguarde o processo de importação

#### Resultados Esperados
- ✅ Barra de progresso é exibida
- ✅ Mensagem de sucesso: "X eventos importados com sucesso"
- ✅ Relatório detalhado é gerado:
  - Total de eventos processados
  - Eventos importados
  - Eventos ignorados (duplicados)
  - Erros (se houver)
- ✅ Eventos aparecem na lista de **Agendamentos**
- ✅ Eventos aparecem no **Calendário**
- ✅ Sincronização com Google Calendar é acionada (se configurada)

#### Critérios de Falha
- ❌ Importação falha sem mensagem clara
- ❌ Eventos não aparecem no banco
- ❌ Datas/horas estão incorretas

---

### 10. Tratamento de Erros e Arquivos Inválidos

#### Objetivo
Verificar se o sistema trata corretamente arquivos corrompidos ou inválidos.

#### Passos
1. Tente importar um arquivo **não-Excel** (ex: .txt, .pdf) com extensão `.xlsx`
2. Tente importar um arquivo **não-ICS** (ex: .txt) com extensão `.ics`
3. Tente importar um arquivo **Excel corrompido**
4. Tente importar um arquivo **ICS com formato inválido**

#### Resultados Esperados
- ✅ Sistema rejeita arquivos inválidos
- ✅ Mensagem de erro clara é exibida:
  - "Formato de arquivo inválido"
  - "Arquivo corrompido, não foi possível processar"
  - "Arquivo não contém dados válidos"
- ✅ Usuário pode tentar novamente
- ✅ Erro é logado no backend

#### Critérios de Falha
- ❌ Sistema trava ou exibe erro genérico
- ❌ Mensagem de erro não é clara
- ❌ Upload prossegue com arquivo inválido

---

### 11. Relatório de Importação Detalhado

#### Objetivo
Verificar se o sistema gera um relatório completo após cada importação.

#### Passos
1. Realize uma importação (Excel ou ICS)
2. Ao final, observe o relatório gerado

#### Resultados Esperados
- ✅ Relatório é exibido automaticamente
- ✅ Informações incluem:
  - **Data e hora da importação**
  - **Tipo de arquivo** (Excel ou ICS)
  - **Nome do arquivo**
  - **Total de registros processados**
  - **Registros importados com sucesso**
  - **Registros ignorados** (duplicados)
  - **Registros com erro** (detalhes)
  - **Usuário responsável pela importação**
- ✅ Opção para **"Baixar Relatório"** (PDF ou CSV)
- ✅ Opção para **"Ver Detalhes"** de cada registro
- ✅ Relatório fica salvo no histórico de importações

#### Critérios de Falha
- ❌ Relatório não é gerado
- ❌ Informações estão incompletas ou incorretas
- ❌ Download do relatório falha

---

### 12. Histórico de Importações

#### Objetivo
Verificar se o sistema mantém um histórico de todas as importações realizadas.

#### Passos
1. Navegue até **"Histórico de Importações"** ou **"Import History"**
2. Observe a lista de importações anteriores

#### Resultados Esperados
- ✅ Lista de importações é exibida com:
  - Data e hora
  - Tipo de arquivo (Excel ou ICS)
  - Nome do arquivo
  - Total de registros importados
  - Status (Sucesso, Parcial, Falha)
  - Usuário responsável
- ✅ Opção para **"Ver Detalhes"** de cada importação
- ✅ Opção para **"Baixar Relatório"** de cada importação
- ✅ Filtro por data, tipo de arquivo ou status
- ✅ Paginação funciona corretamente

#### Critérios de Falha
- ❌ Histórico não aparece ou está vazio
- ❌ Informações estão incorretas
- ❌ Filtros não funcionam

---

### 13. Importação com Atualização de Dados Existentes

#### Objetivo
Verificar se o sistema atualiza corretamente registros existentes ao importar dados com a opção de "Atualizar".

#### Passos
1. Crie manualmente 2-3 clientes no sistema
2. Prepare um arquivo Excel com os **mesmos clientes**, mas com **dados atualizados** (ex: novo telefone, novo endereço)
3. Faça upload do arquivo
4. No preview, selecione **"Atualizar registros existentes"**
5. Clique em **"Importar"**
6. Verifique os dados dos clientes após a importação

#### Resultados Esperados
- ✅ Sistema identifica os registros existentes
- ✅ Mensagem é exibida: "X registros serão atualizados"
- ✅ Dados são atualizados corretamente no banco
- ✅ Dados antigos não são perdidos (opcional: manter histórico de alterações)
- ✅ Relatório mostra registros atualizados

#### Critérios de Falha
- ❌ Dados não são atualizados
- ❌ Sistema cria duplicados ao invés de atualizar
- ❌ Dados são corrompidos após atualização

---

### 14. Sincronização com Google Calendar após Importação de ICS

#### Objetivo
Verificar se os eventos importados de ICS são sincronizados com o Google Calendar.

#### Passos
1. Configure a sincronização com Google Calendar
2. Importe um arquivo ICS com eventos
3. Aguarde a conclusão da importação
4. Verifique o Google Calendar

#### Resultados Esperados
- ✅ Eventos importados aparecem no Google Calendar
- ✅ Sincronização é automática (se configurada)
- ✅ Detalhes dos eventos estão corretos (título, data, hora, descrição)
- ✅ Notificação de sincronização é exibida

#### Critérios de Falha
- ❌ Eventos não aparecem no Google Calendar
- ❌ Sincronização falha sem mensagem de erro
- ❌ Dados estão incorretos no Google Calendar

---

### 15. Performance com Arquivos Grandes

#### Objetivo
Verificar se o sistema lida bem com arquivos grandes (100+ registros).

#### Passos
1. Prepare um arquivo Excel com **100-200 registros**
2. Prepare um arquivo ICS com **50-100 eventos**
3. Faça upload dos arquivos
4. Observe o desempenho

#### Resultados Esperados
- ✅ Upload é concluído sem timeout
- ✅ Preview carrega em tempo razoável (< 5 segundos)
- ✅ Importação é concluída em tempo razoável (< 30 segundos)
- ✅ Barra de progresso é atualizada em tempo real
- ✅ Sistema não trava ou fica lento
- ✅ Relatório é gerado corretamente

#### Critérios de Falha
- ❌ Upload falha ou timeout
- ❌ Sistema trava durante a importação
- ❌ Importação demora mais de 2 minutos
- ❌ Relatório não é gerado ou está incompleto

---

## Testes de API (Backend)

### Endpoint: `POST /api/import/excel`

**Teste 1: Upload de Excel Válido**
```bash
curl -X POST http://localhost:3000/api/import/excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_data.xlsx"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "preview": {
    "headers": ["Nome", "Email", "Telefone", "Data", "Horário"],
    "rows": [/* primeiras 10 linhas */],
    "totalRows": 150
  },
  "validation": {
    "valid": 145,
    "invalid": 5,
    "errors": [/* detalhes dos erros */]
  }
}
```

---

### Endpoint: `POST /api/import/excel/confirm`

**Teste 2: Confirmação de Importação**
```bash
curl -X POST http://localhost:3000/api/import/excel/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "abc123",
    "options": {
      "skipDuplicates": true,
      "updateExisting": false
    }
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "report": {
    "processed": 150,
    "imported": 145,
    "duplicates": 5,
    "errors": 0,
    "details": [/* detalhes */]
  }
}
```

---

### Endpoint: `POST /api/import/ics`

**Teste 3: Upload de ICS Válido**
```bash
curl -X POST http://localhost:3000/api/import/ics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@calendar.ics"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "preview": {
    "events": [
      {
        "summary": "Reunião com Cliente",
        "start": "2025-10-28T10:00:00Z",
        "end": "2025-10-28T11:00:00Z",
        "description": "Discussão sobre projeto",
        "location": "Escritório"
      }
    ],
    "totalEvents": 25
  }
}
```

---

## Checklist Final

- [ ] **Preview de Excel** funciona corretamente
- [ ] **Validação de campos obrigatórios** funciona
- [ ] **Deduplicação de dados** funciona
- [ ] **Importação completa de Excel** com sucesso
- [ ] **Download de template Excel** funciona
- [ ] **Preview de ICS** funciona corretamente
- [ ] **Mapeamento de campos ICS** funciona
- [ ] **Deduplicação de eventos ICS** funciona
- [ ] **Importação completa de ICS** com sucesso
- [ ] **Tratamento de erros** funciona
- [ ] **Relatório de importação** é gerado corretamente
- [ ] **Histórico de importações** funciona
- [ ] **Atualização de dados existentes** funciona
- [ ] **Sincronização com Google Calendar** após ICS
- [ ] **Performance com arquivos grandes** é aceitável
- [ ] **APIs retornam respostas corretas**

---

## Problemas Conhecidos e Soluções

### Problema 1: Erro 500 ao fazer upload
**Solução:** Verificar se o endpoint está correto (`/api/import/excel` ou `/api/data-import/upload`)

### Problema 2: Preview não aparece
**Solução:** Verificar se o arquivo está no formato correto e não está corrompido

### Problema 3: Duplicados não são detectados
**Solução:** Verificar se a lógica de deduplicação está implementada no backend

### Problema 4: Datas ICS estão incorretas
**Solução:** Verificar conversão de timezone no backend

---

## Conclusão

Este guia cobre todos os cenários críticos para testar a funcionalidade de **Importação de Excel e ICS**. Certifique-se de executar cada teste e registrar os resultados. Em caso de falha, documente o erro e reporte ao time de desenvolvimento.

