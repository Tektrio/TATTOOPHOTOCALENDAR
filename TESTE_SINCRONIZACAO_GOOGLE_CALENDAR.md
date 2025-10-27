# 🧪 Guia de Testes: Sincronização Bidirecional Google Calendar

**Data:** 27 de Outubro de 2025  
**Funcionalidade:** Sincronização completa entre Agendamentos locais e Google Calendar  
**Tipo:** Testes Funcionais e de Integração

---

## 📋 Resumo da Funcionalidade

### **O que é a Sincronização Bidirecional?**

A sincronização bidirecional garante que:
1. **Google → Local**: Eventos criados no Google Calendar aparecem no sistema
2. **Local → Google**: Agendamentos criados no sistema aparecem no Google Calendar
3. **Atualizações**: Mudanças em um lado refletem no outro
4. **Deduplicação**: Evita criar registros duplicados

---

## 🔧 Pré-requisitos

### **1. OAuth Google Configurado**
- ✅ Credenciais ativas no Google Cloud Console
- ✅ Tokens válidos em `tokens.json`
- ✅ Status OAuth: Conectado (verificar `/auth/status`)

### **2. Backend Rodando**
```bash
cd agenda-hibrida-v2
npm start
# Deve estar rodando em http://localhost:3001
```

### **3. Frontend Rodando**
```bash
cd agenda-hibrida-frontend
npm start
# Deve estar rodando em http://localhost:3000
```

### **4. Banco de Dados Inicializado**
```bash
# Verificar se o banco existe
ls -l agenda-hibrida-v2/agenda_hibrida.db

# Verificar tabelas necessárias
sqlite3 agenda-hibrida-v2/agenda_hibrida.db "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('appointments', 'clients', 'google_oauth_tokens');"
```

---

## 🧪 Plano de Testes

### **1. Teste de Conectividade Google**

#### **Teste 1.1: Verificar Status de Autenticação**
```bash
curl http://localhost:3001/auth/status
```

**Resultado Esperado:**
```json
{
  "connected": true,
  "email": "seu-email@gmail.com",
  "expiresAt": "2025-10-28T..."
}
```

**Se falhar:**
- Executar fluxo OAuth: `http://localhost:3001/auth/google`
- Verificar `OAUTH_GOOGLE_REATIVACAO.md`

---

### **2. Teste de Sincronização Manual (Endpoint)**

#### **Teste 2.1: Sincronização Manual Completa**
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -H "Content-Type: application/json" \
  -d '{
    "calendarId": "primary",
    "daysBack": 30,
    "daysForward": 90,
    "skipDuplicates": true
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "report": {
    "total": 15,
    "created": 3,
    "updated": 2,
    "skipped": 10,
    "errors": []
  },
  "processingTime": 5
}
```

#### **Teste 2.2: Verificar Log de Importação**
```bash
curl http://localhost:3001/api/imports/history?type=google_calendar&limit=1
```

**Resultado Esperado:**
```json
{
  "imports": [
    {
      "id": 123,
      "import_type": "google_calendar",
      "status": "success",
      "records_processed": 15,
      "records_created": 3,
      "records_updated": 2,
      "records_skipped": 10,
      "duration_seconds": 5,
      "completed_at": "2025-10-27T..."
    }
  ]
}
```

---

### **3. Teste de Sincronização: Google → Local**

#### **Cenário 3.1: Criar Evento no Google Calendar**

**Passos:**
1. Abrir Google Calendar (https://calendar.google.com)
2. Criar novo evento:
   - **Título:** "Teste Sync - Tatuagem Braço"
   - **Data:** Amanhã, 10:00 - 12:00
   - **Descrição:** "Cliente: João Silva | Estilo: Realista"
   - **Local:** "Studio Tattoo"
3. Salvar evento

**Aguardar 1-2 minutos** ou **executar sincronização manual**:
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -H "Content-Type: application/json" \
  -d '{"skipDuplicates": true}'
```

**Verificar no Sistema:**
```bash
curl http://localhost:3001/api/appointments | jq '.[] | select(.title | contains("Teste Sync"))'
```

**Resultado Esperado:**
```json
{
  "id": 456,
  "title": "Teste Sync - Tatuagem Braço",
  "start_datetime": "2025-10-28T10:00:00...",
  "end_datetime": "2025-10-28T12:00:00...",
  "description": "Cliente: João Silva | Estilo: Realista",
  "google_event_id": "abc123xyz...",
  "status": "confirmed",
  "source": "google"
}
```

**Validar no Frontend:**
1. Abrir `http://localhost:3000`
2. Ir para aba "Agenda"
3. Localizar evento "Teste Sync - Tatuagem Braço" no dia de amanhã
4. Verificar se o card mostra o ícone do Google Calendar

---

#### **Cenário 3.2: Atualizar Evento no Google Calendar**

**Passos:**
1. Abrir Google Calendar
2. Editar o evento criado anteriormente:
   - **Novo Título:** "Teste Sync - Tatuagem Braço ATUALIZADO"
   - **Nova Hora:** 11:00 - 13:00
3. Salvar mudanças

**Executar Sincronização:**
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -H "Content-Type: application/json" \
  -d '{"skipDuplicates": false}'
```

**Verificar Atualização:**
```bash
curl http://localhost:3001/api/appointments | jq '.[] | select(.google_event_id == "abc123xyz...")'
```

**Resultado Esperado:**
```json
{
  "id": 456,
  "title": "Teste Sync - Tatuagem Braço ATUALIZADO",
  "start_datetime": "2025-10-28T11:00:00...",
  "end_datetime": "2025-10-28T13:00:00...",
  "google_event_id": "abc123xyz...",
  "status": "confirmed"
}
```

---

#### **Cenário 3.3: Deletar Evento no Google Calendar**

**Passos:**
1. Abrir Google Calendar
2. Excluir o evento "Teste Sync - Tatuagem Braço ATUALIZADO"

**Executar Sincronização:**
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now
```

**Verificar Exclusão:**
```bash
curl http://localhost:3001/api/appointments | jq '.[] | select(.google_event_id == "abc123xyz...")'
```

**Resultado Esperado:**
- Evento deve estar marcado como `cancelled` ou removido da lista

**⚠️ NOTA**: A lógica de exclusão depende da implementação. Verifique o código em `googleCalendarService.js` para ver se o sistema:
- Marca como `cancelled` (soft delete)
- Remove fisicamente do banco (hard delete)
- Mantém, mas oculta na visualização

---

### **4. Teste de Sincronização: Local → Google**

#### **Cenário 4.1: Criar Agendamento no Sistema**

**Passos no Frontend:**
1. Abrir `http://localhost:3000`
2. Ir para aba "Agenda"
3. Clicar em "Novo Agendamento"
4. Preencher:
   - **Cliente:** Selecionar ou criar "Maria Santos"
   - **Tipo de Tatuagem:** "Colorida"
   - **Data:** Após-amanhã, 14:00
   - **Duração:** 2 horas
   - **Observações:** "Tatuagem de flor nas costas"
5. **Marcar:** ✅ "Sincronizar com Google Calendar"
6. Clicar em "Salvar"

**Verificar no Sistema:**
```bash
curl http://localhost:3001/api/appointments | jq '.[] | select(.client_name | contains("Maria Santos"))'
```

**Resultado Esperado:**
```json
{
  "id": 789,
  "client_id": 12,
  "client_name": "Maria Santos",
  "tattoo_type_id": 3,
  "tattoo_type": "Colorida",
  "start_datetime": "2025-10-29T14:00:00...",
  "end_datetime": "2025-10-29T16:00:00...",
  "notes": "Tatuagem de flor nas costas",
  "google_event_id": "xyz789abc...",
  "status": "confirmed"
}
```

**Verificar no Google Calendar:**
1. Abrir Google Calendar (https://calendar.google.com)
2. Localizar evento no dia após-amanhã às 14:00
3. Verificar se o título contém "Maria Santos" e "Colorida"
4. Abrir evento e conferir descrição

---

#### **Cenário 4.2: Atualizar Agendamento no Sistema**

**Passos no Frontend:**
1. Localizar agendamento de "Maria Santos"
2. Clicar para editar
3. Alterar:
   - **Data:** Mesmo dia, mas 15:00 (em vez de 14:00)
   - **Observações:** "Tatuagem de flor nas costas - URGENTE"
4. Salvar

**Verificar Atualização no Google:**
1. Recarregar Google Calendar
2. Verificar se o evento moveu para 15:00
3. Conferir se a descrição foi atualizada

---

#### **Cenário 4.3: Cancelar Agendamento no Sistema**

**Passos no Frontend:**
1. Localizar agendamento de "Maria Santos"
2. Clicar em "Cancelar"
3. Confirmar cancelamento

**Verificar no Google Calendar:**
1. Recarregar Google Calendar
2. Verificar se o evento:
   - Foi marcado como "Cancelado" no título
   - Foi removido do calendário
   - Aparece riscado (dependendo da implementação)

---

### **5. Teste de Deduplicação**

#### **Cenário 5.1: Criar Mesmo Evento em Ambos os Lados**

**Passos:**
1. **No Google Calendar:**
   - Criar evento: "Teste Duplicata - Pedro Costa"
   - Data: Próxima semana, 10:00 - 11:00
   
2. **No Sistema:**
   - Criar agendamento para "Pedro Costa"
   - Mesma data e hora: 10:00 - 11:00
   - Marcar para sincronizar

3. **Executar Sincronização:**
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -H "Content-Type: application/json" \
  -d '{"skipDuplicates": true}'
```

**Resultado Esperado:**
```json
{
  "report": {
    "total": 1,
    "created": 0,
    "updated": 0,
    "skipped": 1,
    "errors": []
  }
}
```

**Verificar:**
- Apenas 1 registro deve existir no banco de dados
- Apenas 1 evento deve aparecer no Google Calendar
- Os dois devem estar vinculados (mesmo `google_event_id`)

---

### **6. Teste de Vinculação de Clientes**

#### **Cenário 6.1: Evento com Nome de Cliente Existente**

**Preparação:**
1. Criar cliente "Ana Beatriz" no sistema:
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Beatriz",
    "email": "ana.beatriz@email.com",
    "phone": "(11) 98765-4321"
  }'
```

**Teste:**
1. Criar evento no Google Calendar:
   - **Título:** "Tatuagem - Ana Beatriz"
   - **Data:** Semana que vem, 16:00

2. Sincronizar:
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now
```

3. Verificar vinculação:
```bash
curl http://localhost:3001/api/appointments | jq '.[] | select(.client_name | contains("Ana Beatriz"))'
```

**Resultado Esperado:**
```json
{
  "id": 890,
  "client_id": 15,  // ← ID do cliente existente
  "client_name": "Ana Beatriz",
  "google_event_id": "def456ghi...",
  "title": "Tatuagem - Ana Beatriz"
}
```

---

### **7. Teste de Tratamento de Erros**

#### **Cenário 7.1: Token Expirado**

**Simular Expiração:**
1. Editar `tokens.json` e alterar `expiry_date` para ontem
2. Tentar sincronizar:
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now
```

**Resultado Esperado:**
```json
{
  "error": "Token OAuth expirado ou inválido",
  "message": "Por favor, reautentique através de /auth/google"
}
```

**Verificar Logs:**
```bash
# Logs do backend devem mostrar:
# ❌ Erro: Token expirado
# 🔄 Tentativa de refresh automático...
```

---

#### **Cenário 7.2: Evento com Dados Inválidos**

**Criar evento problemático no Google:**
- Título: (vazio)
- Data: Sem hora definida
- Descrição: (vazio)

**Sincronizar:**
```bash
curl -X POST http://localhost:3001/api/sync/google-calendar/now
```

**Resultado Esperado:**
```json
{
  "report": {
    "total": 1,
    "created": 0,
    "skipped": 1,
    "errors": [
      {
        "event": 1,
        "eventId": "invalid123",
        "reason": "Dados inválidos ou campos obrigatórios ausentes"
      }
    ]
  }
}
```

---

### **8. Teste de Performance**

#### **Cenário 8.1: Sincronização de Grande Volume**

**Preparação:**
- Criar 50+ eventos no Google Calendar no intervalo de 90 dias

**Executar Sincronização:**
```bash
time curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -H "Content-Type: application/json" \
  -d '{
    "daysBack": 30,
    "daysForward": 90,
    "skipDuplicates": true
  }'
```

**Resultado Esperado:**
- ✅ Tempo de processamento < 30 segundos
- ✅ Todos os eventos sincronizados sem erros
- ✅ CPU do servidor < 80%
- ✅ Memória RAM < 500MB

**Verificar no Banco:**
```bash
sqlite3 agenda-hibrida-v2/agenda_hibrida.db \
  "SELECT COUNT(*) FROM appointments WHERE google_event_id IS NOT NULL;"
```

---

### **9. Teste de Sincronização Automática**

#### **Cenário 9.1: Sincronização Periódica (Se Implementada)**

**Verificar se há sincronização automática:**
```bash
# Verificar se existe um cron job ou scheduler
curl http://localhost:3001/api/sync/google-calendar/schedule
```

**Se existir:**
1. Criar evento no Google Calendar
2. **Aguardar intervalo configurado** (ex: 5 minutos)
3. Verificar se o evento aparece automaticamente no sistema

**Se não existir:**
- Este é um item de melhoria futura

---

## 📊 Checklist de Testes

### **✅ Preparação**
- [ ] OAuth Google configurado e conectado
- [ ] Backend rodando (port 3001)
- [ ] Frontend rodando (port 3000)
- [ ] Banco de dados inicializado

### **✅ Testes Básicos**
- [ ] Status OAuth retorna `connected: true`
- [ ] Sincronização manual funciona sem erros
- [ ] Logs de importação são salvos corretamente

### **✅ Google → Local**
- [ ] Evento criado no Google aparece no sistema
- [ ] Evento atualizado no Google reflete no sistema
- [ ] Evento deletado no Google é removido/cancelado no sistema

### **✅ Local → Google**
- [ ] Agendamento criado no sistema aparece no Google
- [ ] Agendamento atualizado no sistema reflete no Google
- [ ] Agendamento cancelado no sistema é removido/cancelado no Google

### **✅ Deduplicação**
- [ ] Eventos duplicados são detectados e ignorados
- [ ] `skipDuplicates` funciona corretamente
- [ ] Vinculação `google_event_id` é consistente

### **✅ Vinculação de Clientes**
- [ ] Clientes existentes são vinculados automaticamente
- [ ] Nomes são reconhecidos (case insensitive)
- [ ] Emails são usados como fallback

### **✅ Tratamento de Erros**
- [ ] Token expirado é detectado e reportado
- [ ] Eventos inválidos são pulados com erro descritivo
- [ ] Falhas de rede são tratadas com retry (se implementado)

### **✅ Performance**
- [ ] Sincronização de 50+ eventos em < 30s
- [ ] Uso de CPU e memória dentro dos limites
- [ ] Paginação funciona corretamente (se implementada)

---

## 🐛 Problemas Conhecidos e Soluções

### **Problema 1: "OAuth não conectado"**
**Solução:**
```bash
# Reautenticar
open http://localhost:3001/auth/google
# Seguir fluxo OAuth
```

### **Problema 2: "Eventos não sincronizam"**
**Verificar:**
1. `tokens.json` existe e é válido
2. Intervalo de datas está correto (`daysBack` e `daysForward`)
3. Permissões OAuth incluem `calendar.events`

**Solução:**
```bash
# Forçar resync
curl -X POST http://localhost:3001/api/sync/google-calendar/now \
  -d '{"daysBack": 90, "daysForward": 180}'
```

### **Problema 3: "Duplicatas criadas"**
**Verificar:**
1. `skipDuplicates` está true?
2. Lógica de detecção de duplicatas está correta?

**Solução:**
```bash
# Limpar duplicatas
sqlite3 agenda-hibrida-v2/agenda_hibrida.db \
  "DELETE FROM appointments WHERE google_event_id IN (
    SELECT google_event_id FROM appointments 
    GROUP BY google_event_id 
    HAVING COUNT(*) > 1
  ) AND id NOT IN (
    SELECT MIN(id) FROM appointments 
    GROUP BY google_event_id
  );"
```

### **Problema 4: "Sincronização muito lenta"**
**Otimizações:**
1. Reduzir `daysForward` de 90 para 60
2. Aumentar paginação (`maxResults` de 250 para 500)
3. Implementar cache de eventos

---

## 📈 Métricas de Sucesso

### **Critérios de Aceitação:**
- ✅ 95% dos eventos sincronizam sem erros
- ✅ Latência média < 10 segundos para sincronização manual
- ✅ Zero duplicatas detectadas nos testes
- ✅ Todas as atualizações refletem em ambos os lados
- ✅ Tratamento de erros cobre 100% dos casos críticos

---

## 🚀 Próximos Passos

Após validar todos os testes:
1. Documentar cenários de uso no README
2. Criar testes automatizados (Playwright/Jest)
3. Implementar sincronização automática (se ainda não existe)
4. Adicionar notificações de falha de sincronização
5. Implementar dashboard de status de sincronização

---

**✨ Sincronização Bidirecional: PRONTA PARA TESTES!**

**Observação:** Este é um teste funcional MANUAL. Depende do OAuth Google estar configurado corretamente. Se o OAuth não estiver funcionando, primeiro execute os passos em `OAUTH_GOOGLE_REATIVACAO.md`.

