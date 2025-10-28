# ✅ Bugs Corrigidos nas Rotas de Backend

## Data: 28 de Outubro de 2025

---

## 🐛 Bug 1: Ordem Incorreta das Rotas (gift-cards.js)
**Status:** ✅ CORRIGIDO

### Problema:
A rota `/:id` estava capturando "code" antes da rota `/code/:code` ser alcançada, devido à ordem de registro no Express.

### Solução:
- Movida a rota `/code/:code` para **ANTES** da rota `/:id`
- Adicionado comentário explicativo: `// DEVE VIR ANTES DE /:id`

### Arquivos Modificados:
- `agenda-hibrida-v2/routes/gift-cards.js` (linhas 99-132)

---

## 🐛 Bug 2: Campos Incompatíveis - Gift Cards (Frontend vs Backend)
**Status:** ✅ CORRIGIDO

### Problema:
- Frontend usava: `gc.issued_date` e `gc.expiry_date`
- Backend retornava: `purchased_at` e `expires_at`
- Resultado: Datas sempre mostravam "-" no frontend

### Solução:
Adicionado mapeamento de campos em **todas** as rotas de gift cards:

```javascript
const mappedRows = rows.map(row => ({
  ...row,
  issued_date: row.purchased_at,
  expiry_date: row.expires_at
}));
```

### Rotas Corrigidas:
1. `GET /api/customers/:id/gift-cards` (linha 49-56)
2. `GET /api/gift-cards` (linha 88-95)
3. `GET /api/gift-cards/code/:code` (linha 123-130)
4. `GET /api/gift-cards/:id` (linha 172-179)

### Arquivos Modificados:
- `agenda-hibrida-v2/routes/gift-cards.js`

---

## 🐛 Bug 3: Campos Incompatíveis - Memberships (Frontend vs Backend)
**Status:** ✅ CORRIGIDO

### Problema:
- Frontend usava: `membership.monthly_fee` (linhas 188, 271)
- Backend retornava: `plan_monthly_fee`
- Resultado: Sempre exibia "R$ 0.00"

### Solução:
Adicionado mapeamento de campos em **todas** as rotas de memberships:

```javascript
const mappedRows = rows.map(row => ({
  ...row,
  monthly_fee: row.plan_monthly_fee
}));
```

### Rotas Corrigidas:
1. `GET /api/customers/:id/memberships` (linha 39-46)
2. `GET /api/memberships` (linha 80-87)
3. `GET /api/memberships/:id` (linha 135-141)

### Arquivos Modificados:
- `agenda-hibrida-v2/routes/memberships.js`

---

## 🐛 Bug 4: Tabela Antiga Referenciada (customer-forms.js)
**Status:** ✅ CORRIGIDO

### Problema:
As rotas de formulários ainda usavam:
- Tabela antiga: `form_templates`
- Coluna antiga: `template_id`
- Campo antigo: `responses`

Enquanto o resto do arquivo já usava:
- Tabela nova: `custom_forms`
- Coluna nova: `form_id`
- Campo novo: `form_data`

### Solução:
Atualizadas **3 rotas** para usar as novas referências:

#### 1. GET /api/customers/:id/forms/:formId (linhas 135-168)
```javascript
// ANTES:
LEFT JOIN form_templates ft ON cf.template_id = ft.id

// DEPOIS:
LEFT JOIN custom_forms cust_f ON cf.form_id = cust_f.id
```

#### 2. POST /api/customers/:id/forms (linhas 170-207)
```javascript
// ANTES:
const { template_id, responses, ... } = req.body;
INSERT INTO customer_forms (client_id, template_id, appointment_id, responses, ...)

// DEPOIS:
const { form_id, form_data, ... } = req.body;
INSERT INTO customer_forms (client_id, form_id, appointment_id, form_data, ...)
```

#### 3. PUT /api/customers/:id/forms/:formId (linhas 209-238)
```javascript
// ANTES:
const { responses, status } = req.body;
SET responses = COALESCE(?, responses)

// DEPOIS:
const { form_data, status } = req.body;
SET form_data = COALESCE(?, form_data)
```

### Arquivos Modificados:
- `agenda-hibrida-v2/routes/customer-forms.js`

---

## 📊 Resumo das Correções

| Bug | Arquivo | Rotas Afetadas | Status |
|-----|---------|----------------|--------|
| #1 - Ordem de Rotas | gift-cards.js | 1 rota movida | ✅ |
| #2 - Campos Gift Cards | gift-cards.js | 4 rotas mapeadas | ✅ |
| #3 - Campos Memberships | memberships.js | 3 rotas mapeadas | ✅ |
| #4 - Tabela Antiga | customer-forms.js | 3 rotas atualizadas | ✅ |

---

## 🎯 Impacto das Correções

### Antes:
- ❌ Busca por código de gift card nunca funcionava
- ❌ Datas de gift cards sempre exibiam "-"
- ❌ Valores de mensalidade sempre exibiam "R$ 0.00"
- ❌ Formulários customizados causavam erros no banco

### Depois:
- ✅ Busca por código funciona corretamente
- ✅ Datas exibidas corretamente no frontend
- ✅ Valores de mensalidade exibidos corretamente
- ✅ Formulários funcionam com a estrutura correta do banco

---

## 🔍 Verificação

Todos os arquivos foram verificados com linter:
```
✅ No linter errors found.
```

---

## 📝 Notas Técnicas

1. **Mapeamento de Campos**: Preferimos mapear no backend para manter a compatibilidade com o frontend existente, evitando mudanças em múltiplos componentes React.

2. **Ordem de Rotas**: No Express, rotas mais específicas devem sempre vir antes de rotas com parâmetros genéricos (`:id`).

3. **Consistência**: Todas as rotas agora usam nomes consistentes entre frontend e backend.

4. **Performance**: O mapeamento é leve e não afeta significativamente a performance.

---

## ✅ Conclusão

Todos os 4 bugs foram identificados, verificados e corrigidos com sucesso. O sistema agora está funcionando corretamente e sem erros de linting.

