# 📋 PRÓXIMO PLANO - Completar Correção de Testes E2E

**Objetivo**: Completar as fases restantes e atingir **260/260 testes passando (100%)**  
**Base**: Continuação do plano `correcao-completa-sistema.plan.md`  
**Status Atual**: 5 de 11 fases completas (45%)

---

## 🎯 META FINAL

- ✅ **100 testes** já passando (baseline)
- 🎯 **+160 testes** para corrigir/implementar
- **= 260/260 testes (100%)**

---

## 📊 O QUE FOI FEITO (Resumo Rápido)

✅ **FASE 0**: Baseline criado (100/95/65)  
✅ **FASE 1**: Playwright webServer configurado (backend 3001 + frontend 5173)  
✅ **FASE 2**: 5 fixtures criadas (Excel + ICS)  
✅ **FASE 3**: Drag and drop verificado (já existia)  
✅ **FASE 4**: 150+ data-testid adicionados (App.jsx + CalendarioVisual.jsx)  
🟡 **FASE 5**: 2 de 7 arquivos de teste atualizados (01-navigation, 02-clients)

---

## ⚠️ O QUE FALTA FAZER (Priorizado)

### 🔴 PRIORIDADE CRÍTICA

#### 1. COMPLETAR FASE 5: Atualizar Arquivos de Teste Restantes
**Tempo Estimado**: 1.5 horas  
**Impacto**: +40-60 testes

**Arquivos a Atualizar**:

##### 1.1 `tests/e2e/03-appointments.spec.js`
- [ ] Atualizar navegação: `[data-testid="tab-appointments"]`
- [ ] Atualizar botão: `[data-testid="btn-new-appointment"]`
- [ ] Atualizar modal: `[data-testid="modal-new-appointment"]`
- [ ] Atualizar botão salvar: `[data-testid="btn-save-appointment"]`
- [ ] Aumentar timeouts para 10s-60s
- [ ] Adicionar `waitForTimeout` onde necessário

**Exemplo de mudança**:
```javascript
// ANTES
await page.click('button:has-text("Novo Agendamento")');
await expect(page.locator('text=Novo Agendamento')).toBeVisible({ timeout: 5000 });

// DEPOIS
await page.click('[data-testid="btn-new-appointment"]');
await expect(page.locator('[data-testid="modal-new-appointment"]')).toBeVisible({ timeout: 10000 });
```

##### 1.2 `tests/e2e/04-integration-flow.spec.js`
- [ ] Atualizar todos os seletores para usar data-testid
- [ ] Fluxo completo: criar cliente → criar agendamento
- [ ] Usar `[data-testid="tab-*"]` para navegação
- [ ] Aumentar timeouts

##### 1.3 `tests/e2e/05-google-sync.spec.js`
- [ ] Adicionar verificação se Google está configurado
- [ ] Usar `[data-testid="sync-status-badge"]` (se existir)
- [ ] Usar `[data-testid="btn-manual-sync"]` (se existir)
- [ ] Se data-testid não existe, adicionar em SyncStatusBadge.jsx primeiro
- [ ] Aumentar timeouts para operações de sync (30s+)

**NOTA**: Se sync badge não tem data-testid, adicionar:
```jsx
// SyncStatusBadge.jsx
<div data-testid="sync-status-badge">...</div>
<button data-testid="btn-manual-sync">Sincronizar</button>
```

##### 1.4 `tests/e2e/06-import-preview.spec.js`
- [ ] Atualizar navegação: `[data-testid="tab-import"]`
- [ ] Verificar se ImportWizard tem data-testid
- [ ] Usar fixtures criadas na FASE 2:
  - `tests/fixtures/test-import-valid.xlsx`
  - `tests/fixtures/test-import-duplicates.xlsx`
  - `tests/fixtures/test-import-errors.xlsx`
- [ ] Adicionar `waitForTimeout(2000)` após navegação
- [ ] Aumentar timeouts para 30s-60s (componente lazy)

**Exemplo**:
```javascript
await page.click('[data-testid="tab-import"]');
await page.waitForTimeout(2000); // Lazy load
await page.setInputFiles('[data-testid="input-upload"]', 'tests/fixtures/test-import-valid.xlsx');
await expect(page.locator('[data-testid="preview-table"]')).toBeVisible({ timeout: 60000 });
```

##### 1.5 `tests/e2e/07-drag-and-drop.spec.js`
- [ ] Usar `[data-testid="tab-calendar"]` para navegação
- [ ] Usar `[data-testid="appointment-{id}"]` para agendamentos
- [ ] Usar `[data-testid="calendar-cell-{YYYY-MM-DD}"]` para células
- [ ] Adicionar `waitForTimeout(2000)` após abrir calendário
- [ ] Testar drag and drop com `appointment.dragTo(targetCell)`
- [ ] Aumentar timeouts para 60s

**Exemplo completo**:
```javascript
test('deve arrastar agendamento para nova data', async ({ page }) => {
  // Navegar para calendário
  await page.click('[data-testid="tab-calendar"]');
  await page.waitForTimeout(2000); // Lazy load
  await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
  
  // Localizar agendamento e célula destino
  const appointment = page.locator('[data-testid="appointment-1"]');
  const targetCell = page.locator('[data-testid="calendar-cell-2025-11-20"]');
  
  // Drag and drop
  await appointment.dragTo(targetCell);
  
  // Verificar mudança
  await page.waitForTimeout(1000);
  await expect(targetCell).toContainText('Agendamento');
});
```

---

#### 2. FASE 6: Aumentar Timeouts para Lazy Loading
**Tempo Estimado**: 30 minutos  
**Impacto**: +10-20 testes

**Tarefas**:
- [ ] Revisar TODOS os testes que navegam para tabs lazy:
  - Calendário Visual
  - Importar Dados
  - Galeria
- [ ] Adicionar padrão:
```javascript
await page.click('[data-testid="tab-{nome}"]');
await page.waitForTimeout(2000); // Aguardar lazy load
await expect(page.locator('.main-content')).toBeVisible({ timeout: 60000 });
```
- [ ] Aumentar `actionTimeout` e `navigationTimeout` se necessário

---

#### 3. FASE 8: Executar Testes e Corrigir Falhas
**Tempo Estimado**: 2-3 horas  
**Impacto**: Crítico para atingir 100%

**Passo a Passo**:

##### 3.1 Executar Teste Completo
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-frontend
npm run test:e2e 2>&1 | tee test-run-final.log
```

##### 3.2 Analisar Resultados
```bash
node tests/analyze-failures.cjs
cat baseline-analysis.json
```

##### 3.3 Categorizar Falhas
Criar documento: `FALHAS_CATEGORIZ ADAS.md`
- Timeouts → Aumentar tempo ou adicionar `waitForTimeout`
- Seletores não encontrados → Verificar se data-testid correto
- Modais não abrem → Adicionar espera após click
- Validação bloqueando → Aguardar validação antes de submit

##### 3.4 Corrigir Iterativamente
Para cada falha:
1. Identificar causa raiz
2. Aplicar correção específica
3. Re-executar APENAS esse teste
4. Marcar como resolvido
5. Próxima falha

**Comandos úteis**:
```bash
# Executar um teste específico
npm run test:e2e -- --grep "nome do teste"

# Executar um arquivo específico
npm run test:e2e tests/e2e/03-appointments.spec.js

# Executar em um navegador específico
npm run test:e2e -- --project=chromium

# Modo debug com UI
npm run test:e2e -- --ui
```

##### 3.5 Padrões Comuns de Correção

**Modal não abre**:
```javascript
await page.click('[data-testid="btn-open"]');
await page.waitForTimeout(500); // Animação
await expect(page.locator('[data-testid="modal"]')).toBeVisible({ timeout: 10000 });
```

**Validação bloqueando**:
```javascript
await page.fill('[data-testid="input-name"]', 'Nome Válido');
await page.waitForTimeout(1000); // Aguardar validação
await expect(page.locator('[data-testid="btn-save"]')).toBeEnabled();
await page.click('[data-testid="btn-save"]');
```

**Elemento lazy-loaded**:
```javascript
await page.click('[data-testid="tab-calendar"]');
await page.waitForTimeout(2000);
await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
```

**Drag and drop não funciona**:
```javascript
// Alternativa se dragTo não funcionar
await page.hover('[data-testid="appointment-1"]');
await page.mouse.down();
await page.hover('[data-testid="calendar-cell-2025-11-20"]');
await page.mouse.up();
```

---

### 🟡 PRIORIDADE MÉDIA

#### 4. FASE 9: Relatório Final
**Tempo Estimado**: 30 minutos

**Tarefas**:
- [ ] Executar testes finais com todos reporters:
```bash
npm run test:e2e -- --reporter=html,json,list
```
- [ ] Criar `RELATORIO_TESTES_100_SUCESSO.md`
- [ ] Incluir:
  - Estatísticas finais (260/260)
  - Evolução (baseline → final)
  - Correções aplicadas
  - Resumo por suíte
  - Tempo de execução
  - Screenshots (se disponíveis)

---

#### 5. FASE 10: Documentação
**Tempo Estimado**: 30 minutos

**Tarefas**:
- [ ] Criar `docs/SETUP_TESTS.md`
- [ ] Documentar:
  - Pré-requisitos
  - Instalação de dependências
  - Como gerar fixtures
  - Como executar testes
  - Como debugar falhas
  - Troubleshooting comum
- [ ] Adicionar exemplos práticos

---

### 🔵 PRIORIDADE BAIXA (Opcional)

#### 6. FASE 7: Configurar Google Calendar
**Tempo Estimado**: 1 hora  
**Impacto**: +10 testes (se configurado)

**DECISÃO NECESSÁRIA**: Usar conta real ou mocks?

**Opção A - Conta Real**:
- [ ] Criar projeto Google Cloud
- [ ] Configurar OAuth 2.0
- [ ] Criar `.env.test`
- [ ] Gerar refresh token
- [ ] Atualizar testes

**Opção B - Mocks (RECOMENDADO)**:
- [ ] Criar `tests/mocks/google-calendar-mock.js`
- [ ] Simular resposta da API
- [ ] Atualizar testes para usar mock
- [ ] Mais rápido e confiável

---

## 📦 ARQUIVOS QUE PRECISAM SER ADICIONADOS/VERIFICADOS

### Verificar se Existem:
- [ ] `SyncStatusBadge.jsx` - tem data-testid?
- [ ] `ImportWizard.jsx` - tem data-testid?

### Adicionar data-testid se Faltando:
```jsx
// SyncStatusBadge.jsx
<div data-testid="sync-status-badge">
  <span data-testid="sync-timestamp">{lastSync}</span>
  <button data-testid="btn-manual-sync">Sincronizar</button>
</div>

// ImportWizard.jsx
<div data-testid="import-wizard">
  <input data-testid="input-upload-excel" type="file" />
  <table data-testid="preview-table">...</table>
  <div data-testid="import-stats">...</div>
  <button data-testid="btn-confirm-import">Importar</button>
</div>
```

---

## 🎯 ESTRATÉGIA DE EXECUÇÃO RECOMENDADA

### Dia 1 (3-4 horas):
1. ✅ Completar FASE 5 (1.5h)
2. ✅ Aplicar FASE 6 (0.5h)
3. ✅ Executar teste intermediário (0.5h)
4. ✅ Começar FASE 8 - corrigir primeiras falhas (1-2h)

### Dia 2 (2-3 horas):
5. ✅ Continuar FASE 8 - corrigir falhas restantes (1.5-2h)
6. ✅ Executar teste final (0.5h)
7. ✅ FASE 9 - Gerar relatório (0.5h)

### Dia 3 (Opcional - 1h):
8. ✅ FASE 10 - Documentação (0.5h)
9. ✅ FASE 7 - Google Calendar (0.5h, se necessário)

---

## 📊 EXPECTATIVA DE RESULTADOS

### Após FASE 5 + 6 (Atualizar testes + timeouts):
- **Estimativa**: 180-200 testes passando (~69-77%)
- **Pulados**: 20-30 (Google Calendar + alguns edge cases)
- **Falhando**: 30-60 (precisam correção individual)

### Após FASE 8 (Correções individuais):
- **Meta Realista**: 240-250 testes passando (~92-96%)
- **Meta Ideal**: 260 testes passando (100%)

---

## 🚨 POSSÍVEIS BLOQUEADORES

1. **Servidores não iniciam**: Verificar portas 3001 e 5173
2. **Fixtures não encontradas**: Verificar path relativo
3. **Drag and drop não funciona**: Usar alternativa com mouse events
4. **Google Calendar tests**: Considerar skip ou mock
5. **Timeouts ainda insuficientes**: Aumentar para 90s ou 120s

---

## ✅ CHECKLIST FINAL

- [ ] FASE 5: Atualizar 5 arquivos de teste (03, 04, 05, 06, 07)
- [ ] FASE 6: Aumentar timeouts lazy loading
- [ ] Adicionar data-testid em SyncStatusBadge (se faltando)
- [ ] Adicionar data-testid em ImportWizard (se faltando)
- [ ] FASE 8: Executar testes completos
- [ ] FASE 8: Analisar e categorizar falhas
- [ ] FASE 8: Corrigir falhas iterativamente
- [ ] FASE 8: Re-executar até 260/260
- [ ] FASE 9: Gerar relatório final
- [ ] FASE 10: Criar documentação
- [ ] FASE 7: Google Calendar (opcional)

---

## 📄 RESUMO PARA CRIAR PRÓXIMO PLANO

**Copiar este conteúdo para criar o próximo plano:**

```
Meta: Completar correção de testes E2E (260/260)

Tarefas Principais:
1. Atualizar 5 arquivos de teste restantes (03-07) com data-testid
2. Aumentar timeouts para lazy loading em todos testes
3. Verificar/adicionar data-testid em SyncStatusBadge e ImportWizard
4. Executar testes completos e analisar falhas
5. Corrigir falhas iterativamente até atingir 100%
6. Gerar relatório final
7. Criar documentação

Tempo Estimado: 6-8 horas
Prioridade: CRÍTICA

Arquivos a Modificar:
- tests/e2e/03-appointments.spec.js
- tests/e2e/04-integration-flow.spec.js
- tests/e2e/05-google-sync.spec.js
- tests/e2e/06-import-preview.spec.js
- tests/e2e/07-drag-and-drop.spec.js
- src/components/SyncStatusBadge.jsx (se necessário)
- src/components/ImportWizard.jsx (se necessário)
```

---

**Data de Criação**: 27/10/2025 - 18:00  
**Última Atualização**: 27/10/2025 - 18:00  
**Próxima Ação**: Usar este arquivo para criar novo plano e continuar implementação

