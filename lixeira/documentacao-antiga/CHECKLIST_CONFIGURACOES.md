# ✅ CHECKLIST - Configurações para Aplicar Manualmente

## 🎯 PRIORIDADE ALTA (Fazer agora)

### 1️⃣ Cursor IDE - Aba "Ignore List"

**Localização**: Settings > Ignore List

**O que fazer:**

1. Abrir Cursor Settings (⌘ + ,)
2. Clicar na aba "Ignore List"
3. Adicionar estas pastas (se ainda não tiver):

```
node_modules/*
build/*
dist/*
.next/*
coverage/*
*.min.js
vendor/*
public/build/*
```

**Por quê?**

- ⚡ Melhora MUITO a performance
- 🔍 O Cursor não vai indexar/buscar nesses arquivos
- 💾 Economiza RAM e CPU

**Status**: ❌ PRECISA FAZER

---

### 2️⃣ Cursor IDE - Aba "Throttling"

**Localização**: Settings > Throttling

**O que fazer:**

1. Durante desenvolvimento normal:

   - Network: **No throttling**
   - CPU: **No throttling**

2. Durante testes (ativar quando testar):
   - Network: **Fast 3G** (1.6 Mbps)
   - CPU: **4x slowdown**

**Por quê?**

- 🧪 Testa como app funciona em dispositivos lentos
- 📱 Simula experiência real de usuários mobile

**Status**: ⚠️ CONFIGURAR QUANDO TESTAR

---

## 🔧 PRIORIDADE MÉDIA (Fazer esta semana)

### 3️⃣ Cursor IDE - Aba "Experiments"

**Localização**: Settings > Experiments

**O que fazer:**

1. Revisar lista de experimentos ativos
2. Desativar experimentos que você NÃO usa
3. Manter apenas features que você testa ativamente

**Por quê?**

- ⚡ Experiments podem consumir recursos
- 🐛 Algumas features beta podem causar bugs

**Status**: ⚠️ REVISAR QUANDO TIVER TEMPO

---

### 4️⃣ Chrome DevTools - Console Settings

**Localização**: DevTools > Console > ⚙️ (ícone de configurações)

**O que fazer:**

```yaml
✅ ATIVAR:
  - Preserve log
  - Show timestamps
  - Autocomplete from history
  - Group similar messages

❌ DESATIVAR (se estiver ativo):
  - Eager evaluation (deixa lento com objetos grandes)
  - Log XMLHttpRequests (se não precisar)
```

**Como fazer:**

1. Abrir Chrome DevTools (F12)
2. Ir para aba "Console"
3. Clicar no ícone de engrenagem ⚙️
4. Marcar/desmarcar conforme acima

**Status**: ❌ PRECISA FAZER

---

### 5️⃣ Chrome DevTools - Network Settings

**Localização**: DevTools > Network > ⚙️

**O que fazer durante desenvolvimento:**

```yaml
✅ ATIVAR:
  - Preserve log (mantém logs entre navegações)
  - Disable cache (vê mudanças ao vivo)

❌ DESATIVAR em produção:
  - Disable cache (ativar apenas em dev)
```

**Status**: ⚠️ ATIVAR DURANTE DESENVOLVIMENTO

---

## 📊 PRIORIDADE BAIXA (Opcional)

### 6️⃣ Chrome Flags (Experimental)

**Localização**: Digite na barra de endereço: `chrome://flags/`

**⚠️ CUIDADO: Recursos experimentais! Só ative se souber o que está fazendo**

**O que considerar:**

```yaml
✅ Para melhor performance (ative se quiser testar):
  -  #enable-gpu-rasterization
  -  #enable-zero-copy
  -  #enable-parallel-downloading

❌ NÃO recomendado:
  - Flags desconhecidas
  - Flags que causam instabilidade
```

**Status**: ⚠️ OPCIONAL - NÃO OBRIGATÓRIO

---

### 7️⃣ Extensões do Chrome

**Localização**: Chrome > Extensões (chrome://extensions/)

**O que fazer:**

1. Desativar extensões que você NÃO usa regularmente
2. Manter ativas apenas:
   - DevTools de frameworks (React, Vue, Redux)
   - Ferramentas essenciais

**Por quê?**

- 💾 Cada extensão consome 50-200MB de RAM
- ⚡ Extensões pesadas deixam o Chrome lento

**Status**: ⚠️ REVISAR QUANDO TIVER TEMPO

---

## 📈 RESUMO DO QUE FAZER AGORA

### ✅ SUAS CONFIGURAÇÕES ATUAIS:

**Status Geral: 8/10** (Já está muito bom!)

O que já está perfeito:

- ✅ Source maps ativados
- ✅ Autocompletion ON
- ✅ Word wrap OFF (performance)
- ✅ Search in anonymous scripts OFF (performance)
- ✅ Bracket matching, code folding, etc.

### 🎯 O QUE MELHORAR:

**AGORA (5 minutos):**

1. [ ] Adicionar pastas na **Ignore List**
2. [ ] Configurar **Console** do DevTools

**ESTA SEMANA (10 minutos):** 3. [ ] Revisar **Experiments** e desativar não-usados 4. [ ] Configurar **Throttling** para testes

**QUANDO TIVER TEMPO:** 5. [ ] Revisar extensões do Chrome 6. [ ] Considerar Chrome Flags (opcional)

---

## 🚀 AÇÃO IMEDIATA - FAÇA AGORA:

### Passo 1: Ignore List (2 minutos)

1. Abrir Cursor
2. Pressionar `⌘ + ,` (abre Settings)
3. Clicar em "Ignore List" na barra lateral esquerda
4. Adicionar:
   ```
   node_modules/*
   build/*
   dist/*
   .next/*
   coverage/*
   *.min.js
   ```

### Passo 2: DevTools Console (3 minutos)

1. Abrir Chrome DevTools (`F12` ou `⌘ + Option + I`)
2. Ir para aba "Console"
3. Clicar no ícone ⚙️ (Settings)
4. Ativar:
   - ✅ Preserve log
   - ✅ Show timestamps
   - ✅ Autocomplete from history
5. Fechar settings

---

## ❓ PERGUNTAS FREQUENTES

### "Preciso fazer tudo isso agora?"

**R:** Não! Suas configurações já estão ótimas. O mais importante é:

1. Adicionar **Ignore List** (melhora muito a performance)
2. Configurar **Console preserve log** (não perde erros)

### "O que acontece se eu não fizer?"

**R:** Nada grave! Você já tem 80% das configurações otimizadas. Essas são apenas melhorias incrementais.

### "Posso aplicar tudo de uma vez?"

**R:** Pode, mas recomendo fazer aos poucos para ver o impacto de cada mudança.

### "Como saber se funcionou?"

**R:** Depois de adicionar ao Ignore List, você vai notar:

- Buscas mais rápidas no Cursor
- Menos uso de CPU/RAM
- Indexação mais rápida de arquivos

---

## 📞 PRECISA DE AJUDA?

Se tiver dúvida em qualquer passo, me pergunte!

Posso:

- Fazer screenshots de onde clicar
- Explicar melhor qualquer configuração
- Testar se algo funcionou

---

**Última atualização**: 22 de Outubro de 2025
**Status do seu sistema**: ✅ 80% otimizado (muito bom!)
**Próxima ação**: Adicionar Ignore List (2 minutos)
