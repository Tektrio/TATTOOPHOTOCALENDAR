# ⚗️ CHROME DEVTOOLS EXPERIMENTS - CONFIGURAÇÃO RECOMENDADA

**Como acessar**: DevTools → Settings (F1) → Experiments

---

## ✅ ATIVE ESTAS OPÇÕES (RECOMENDADAS PARA DESENVOLVIMENTO):

```
✅ Capture node creation stacks
   → Captura stacks de criação de nós DOM
   → Útil para debugging

✅ Protocol Monitor
   → Monitora protocolo Chrome DevTools
   → Útil para debugging avançado

✅ Enable full accessibility tree view in the Elements panel
   → Mostra árvore de acessibilidade completa
   → Importante para a11y

✅ Enable new font editor within the Styles tab
   → Editor de fontes melhorado
   → Facilita ajustes de tipografia

✅ Enable automatic contrast issue reporting via the Issues panel
   → Reporta problemas de contraste automaticamente
   → Ajuda com acessibilidade

✅ Enable experimental cookie features
   → Features experimentais de cookies
   → Útil para debugging de sessões
```

---

## 📋 CONFIGURAÇÃO COMPLETA (COPIE E MARQUE):

### ✅ JÁ MARCADAS (MANTENHA):

- ✅ Capture node creation stacks
- ✅ Protocol Monitor
- ✅ Enable full accessibility tree view in the Elements panel
- ✅ Enable new font editor within the Styles tab
- ✅ Enable automatic contrast issue reporting via the Issues panel
- ✅ Enable experimental cookie features

### 🔲 MARQUE TAMBÉM ESTAS (ADICIONE):

- ✅ **Show option to expose internals in heap snapshots**
  → Para análise avançada de memória

- ✅ **Group sources into authored and deployed trees**
  → Organiza código fonte vs código compilado
  → Muito útil para React/Vite

---

## ❌ DEIXE DESMARCADAS (NÃO PRECISA):

```
□ Enable new Advanced Perceptual Contrast Algorithm (APCA)
  → Ainda experimental, pode causar bugs

□ Hide ignore-listed code in Sources tree view
  → Melhor manter visível durante desenvolvimento

□ Performance panel: show postMessage dispatch and handling flows
  → Apenas se usar muito postMessage
```

---

## 🎯 CONFIGURAÇÃO FINAL RECOMENDADA:

```
Na aba Experiments, deixe assim:

✅ Capture node creation stacks
✅ Protocol Monitor
✅ Show option to expose internals in heap snapshots (ADICIONE!)
□ Enable new Advanced Perceptual Contrast Algorithm (APCA)
✅ Enable full accessibility tree view in the Elements panel
✅ Enable new font editor within the Styles tab
✅ Enable automatic contrast issue reporting via the Issues panel
✅ Enable experimental cookie features
✅ Group sources into authored and deployed trees (ADICIONE!)
□ Hide ignore-listed code in Sources tree view
□ Performance panel: show postMessage dispatch...
```

---

## 📝 PASSOS PARA APLICAR:

1. **Você já está na aba certa!** ✅

2. **Adicione as 2 marcações que faltam:**

   - Procure "Show option to expose internals" → ✅ Marque
   - Procure "Group sources into authored" → ✅ Marque

3. **Mantenha as outras 6 já marcadas** ✅

4. **Clique "Close" (X) no canto** para salvar

5. **Recarregue o DevTools** (⌘ + R com DevTools focado)

---

## 🎨 VISUAL RÁPIDO:

```
MARQUE (8 total):
✅ Capture node creation stacks
✅ Protocol Monitor
✅ Show option to expose internals ← ADICIONE!
✅ Enable full accessibility tree
✅ Enable new font editor
✅ Enable automatic contrast issue
✅ Enable experimental cookie features
✅ Group sources into authored ← ADICIONE!

DEIXE DESMARCADAS:
□ Enable new APCA
□ Hide ignore-listed code
□ Performance panel postMessage
```

---

## ⚡ BENEFÍCIOS DAS CONFIGURAÇÕES:

### Para seu app React:

✅ **Group sources into authored and deployed trees**
→ Separa seu código React do código compilado
→ Facilita MUITO debugging

### Para debugging geral:

✅ **Capture node creation stacks**
→ Rastreia onde elementos DOM foram criados
→ Encontra bugs mais rápido

### Para performance:

✅ **Show option to expose internals**
→ Análise detalhada de memória
→ Identifica memory leaks

### Para acessibilidade:

✅ **Enable full accessibility tree**
→ Garante que app é acessível
→ Importante para usuários com deficiência

---

## 🔧 APÓS CONFIGURAR:

1. Feche Settings (ESC ou X)
2. Recarregue DevTools (⌘ + R com DevTools aberto)
3. Pronto! ✅

---

## 💡 DICA PRO:

Estas configurações são salvas no perfil do Chrome Canary.
Se reinstalar ou usar outro computador, precisará configurar novamente.

---

**Criado por**: AI Assistant  
**Data**: 22 de Outubro de 2025  
**Para**: Chrome Canary + Desenvolvimento React
