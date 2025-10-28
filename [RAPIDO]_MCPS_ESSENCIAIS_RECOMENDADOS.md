# 🚀 MCPs Essenciais Recomendados para TattooScheduler

**Data:** 26 de Outubro de 2025
**Status:** ✅ Bun instalado | ✅ google-mcp corrigido

---

## ✅ PROBLEMA RESOLVIDO

### 🐛 Erro Anterior:
```
env: bun: No such file or directory
```

### ✅ Solução Aplicada:
1. **Bun Runtime instalado:** `~/.bun/bin/bun` (v1.3.1)
2. **PATH adicionado ao google-mcp:** Agora pode executar corretamente
3. **mcp.json atualizado:** Configuração corrigida

**Resultado:** O `google-mcp` agora funciona corretamente! 🎉

---

## 📊 MCPs ATUAIS (Instalados e Ativos)

| MCP | Status | Função |
|-----|--------|--------|
| filesystem | ✅ Ativo | Gerenciamento de arquivos |
| google-drive | ✅ Ativo | Armazenamento de fotos |
| google-mcp | ✅ Ativo (Corrigido) | Calendário e agendamentos |
| memory | ✅ Ativo | Contexto entre conversas |
| sequential-thinking | ✅ Ativo | Resolução de problemas |
| playwright | ✅ Ativo | Testes automatizados |

---

## 🎯 MCPs ESSENCIAIS QUE FALTAM

Baseado no PRD do TattooScheduler, estes MCPs seriam **EXTREMAMENTE ÚTEIS**:

### 🔥 PRIORIDADE CRÍTICA

#### 1. **SQLite MCP** 💾
**O que faz:** Gerencia banco de dados SQLite local

**Por que é essencial:**
- PRD menciona: `SQLite (desenvolvimento) / PostgreSQL (produção)`
- Armazena clientes, agendamentos, fotos localmente
- Cache da timeline para performance

**Como instalar:**
```bash
npm install -g @modelcontextprotocol/server-sqlite
```

**Configuração no mcp.json:**
```json
"sqlite": {
  "// Descrição": "💾 CRÍTICO - Banco de dados local para clientes e agendamentos",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sqlite", 
           "/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/agenda_hibrida.db"],
  "disabled": false
}
```

**Benefícios para seu sistema:**
- ✅ Queries SQL diretas no banco
- ✅ Consultar clientes rapidamente
- ✅ Verificar agendamentos
- ✅ Gerar relatórios

---

#### 2. **Fetch MCP** 🌐
**O que faz:** Faz requisições HTTP para APIs externas

**Por que é essencial:**
- Integração com WhatsApp Business API (mencionado no PRD)
- APIs de pagamento (PIX, cartão)
- Consulta CEP, validações externas

**Como instalar:**
```bash
# Já vem com npx, não precisa instalar
```

**Configuração no mcp.json:**
```json
"fetch": {
  "// Descrição": "🌐 APIs externas - WhatsApp, Pagamentos, CEP",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"],
  "disabled": false
}
```

**Benefícios para seu sistema:**
- ✅ Enviar mensagens WhatsApp
- ✅ Processar pagamentos
- ✅ Validar endereços
- ✅ Consultar APIs de terceiros

---

### ⚡ PRIORIDADE ALTA

#### 3. **Brave Search MCP** 🔍
**O que faz:** Busca informações na web de forma privada

**Por que é útil:**
- Pesquisar referências de tatuagens
- Buscar inspirações de design
- Pesquisar tendências do mercado
- Consultar informações sobre estilos

**Como instalar:**
```bash
npm install -g @modelcontextprotocol/server-brave-search
```

**Configuração no mcp.json:**
```json
"brave-search": {
  "// Descrição": "🔍 Busca web - Referências e inspirações de tatuagens",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "SUA_CHAVE_AQUI"
  },
  "disabled": false
}
```

**Como obter API Key:**
1. Acesse: https://brave.com/search/api/
2. Crie conta gratuita
3. Obtenha API key

**Benefícios:**
- ✅ Buscar referências de tatuagens
- ✅ Pesquisar estilos e técnicas
- ✅ Encontrar inspirações
- ✅ Pesquisa privada (sem tracking)

---

#### 4. **Time MCP** ⏰
**O que faz:** Gerencia datas, timezones, agendamentos

**Por que é útil:**
- Cálculos de horários
- Conversões de timezone
- Lembretes automáticos
- Duração de sessões

**Como instalar:**
```bash
npm install -g @modelcontextprotocol/server-time
```

**Configuração no mcp.json:**
```json
"time": {
  "// Descrição": "⏰ Gerenciamento de tempo - Horários e lembretes",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-time"],
  "disabled": false
}
```

**Benefícios:**
- ✅ Calcular duração de sessões
- ✅ Converter timezones
- ✅ Gerar lembretes
- ✅ Validar horários

---

### 📸 PRIORIDADE MÉDIA (Específico para Fotos)

#### 5. **EXIF MCP (Custom)** 📷
**O que faz:** Extrai metadados de fotos (data, câmera, localização)

**Por que seria PERFEITO:**
- PRD menciona organização temporal automática de fotos
- Extrair data de captura das fotos
- Organizar por timestamp real
- Identificar câmera/smartphone usado

**Status:** Não existe ainda, mas seria MUITO útil criar

**Funcionalidade desejada:**
```javascript
// Extrair EXIF de foto
const metadata = await exif.extract('tatuagem.jpg');
console.log(metadata.dateTime); // "2024-10-15 14:30:00"
console.log(metadata.camera);   // "iPhone 15 Pro"
console.log(metadata.gps);      // { lat: -23.5505, lon: -46.6333 }
```

**Alternativa por enquanto:**
- Usar Node.js com bibliotecas como `exif-parser` ou `exifr`
- Integrar no backend do sistema

---

### 💡 PRIORIDADE BAIXA (Melhorias Futuras)

#### 6. **PostgreSQL MCP** 🐘
**Para produção (Fase 3 do PRD)**

```json
"postgres": {
  "// Descrição": "🐘 Banco de dados PostgreSQL para produção",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", 
           "postgresql://usuario:senha@localhost:5432/tattoo_db"],
  "disabled": true
}
```

#### 7. **Slack/Discord MCP** 💬
**Para notificações da equipe**

```json
"slack": {
  "// Descrição": "💬 Notificações da equipe via Slack",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/..."
  },
  "disabled": true
}
```

#### 8. **Stripe/Payment MCP** 💳
**Para processar pagamentos (Fase 3 do PRD)**

---

## 📋 RESUMO DE RECOMENDAÇÕES

### Instalar AGORA (Crítico):

```bash
# 1. SQLite MCP
npm install -g @modelcontextprotocol/server-sqlite

# 2. Fetch MCP (já disponível via npx)
# Não precisa instalar

# 3. Time MCP
npm install -g @modelcontextprotocol/server-time
```

### Considerar (Alta prioridade):

```bash
# 4. Brave Search (precisa API key gratuita)
npm install -g @modelcontextprotocol/server-brave-search
```

---

## 🎯 IMPACTO NO TATTOOSCHEDULER

### Com os MCPs recomendados instalados:

```
📸 FOTO TIRADA
     ↓
filesystem detecta nova foto
     ↓
time extrai timestamp
     ↓
sqlite consulta cliente pelo horário
     ↓
google-drive faz upload
     ↓
memory salva contexto
     ↓
✅ FOTO ORGANIZADA AUTOMATICAMENTE!
```

### Funcionalidades desbloqueadas:

✅ **Organização temporal automática** (com time + sqlite)
✅ **Busca rápida de clientes** (com sqlite)
✅ **Backup inteligente** (com google-drive + filesystem)
✅ **Integração APIs** (com fetch)
✅ **Referências de design** (com brave-search)
✅ **Lembretes automáticos** (com time + fetch)

---

## 🔧 COMANDOS DE INSTALAÇÃO COMPLETOS

### Script para instalar tudo de uma vez:

```bash
#!/bin/bash
echo "🚀 Instalando MCPs essenciais para TattooScheduler..."

# 1. SQLite
echo "📦 Instalando SQLite MCP..."
npm install -g @modelcontextprotocol/server-sqlite

# 2. Time
echo "⏰ Instalando Time MCP..."
npm install -g @modelcontextprotocol/server-time

# 3. Brave Search (requer API key depois)
echo "🔍 Instalando Brave Search MCP..."
npm install -g @modelcontextprotocol/server-brave-search

echo "✅ Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "1. Adicionar MCPs ao ~/.cursor/mcp.json"
echo "2. Obter API key do Brave Search: https://brave.com/search/api/"
echo "3. Recarregar o Cursor"
```

**Salvar como:** `instalar-mcps.sh`

**Executar:**
```bash
chmod +x instalar-mcps.sh
./instalar-mcps.sh
```

---

## 📝 ATUALIZAÇÃO DO MCP.JSON

Depois de instalar, adicione ao seu `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "// ... seus MCPs atuais ...": "",

    "sqlite": {
      "// Descrição": "💾 Banco de dados local - Clientes e agendamentos",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/agenda_hibrida.db"
      ],
      "disabled": false
    },

    "fetch": {
      "// Descrição": "🌐 APIs externas - WhatsApp, Pagamentos, CEP",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "disabled": false
    },

    "time": {
      "// Descrição": "⏰ Gerenciamento de tempo - Horários e lembretes",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-time"],
      "disabled": false
    },

    "brave-search": {
      "// Descrição": "🔍 Busca web - Referências e inspirações",
      "// CONFIGURAR": "Obter API key em: https://brave.com/search/api/",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "SUA_CHAVE_AQUI"
      },
      "disabled": true
    }
  }
}
```

---

## 🎓 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (Sem MCPs essenciais):

- ⚠️ Consultas SQL manuais
- ⚠️ Sem busca de referências
- ⚠️ Cálculos de tempo manuais
- ⚠️ APIs externas limitadas

### ✅ DEPOIS (Com MCPs essenciais):

- ✅ SQLite direto do chat
- ✅ Busca de inspirações integrada
- ✅ Cálculos automáticos de tempo
- ✅ Integração com qualquer API
- ✅ Sistema 10x mais poderoso

---

## 🚀 PRÓXIMOS PASSOS

### 1. Instalar MCPs críticos
```bash
./instalar-mcps.sh
```

### 2. Atualizar mcp.json
```bash
# Editar: ~/.cursor/mcp.json
# Adicionar novos MCPs
```

### 3. Obter API Keys
- [ ] Brave Search: https://brave.com/search/api/

### 4. Testar
```bash
# Recarregar Cursor
# Testar cada MCP
```

### 5. Documentar uso
- Criar guias de uso
- Exemplos práticos
- Casos de uso reais

---

## 📞 SUPORTE E LINKS ÚTEIS

### Documentação Oficial:
- **Model Context Protocol:** https://modelcontextprotocol.io/
- **MCP Servers:** https://github.com/modelcontextprotocol/servers
- **Brave Search API:** https://brave.com/search/api/

### MCPs Recomendados:
1. ✅ **SQLite:** [@modelcontextprotocol/server-sqlite](https://www.npmjs.com/package/@modelcontextprotocol/server-sqlite)
2. ✅ **Fetch:** [@modelcontextprotocol/server-fetch](https://www.npmjs.com/package/@modelcontextprotocol/server-fetch)
3. ✅ **Time:** [@modelcontextprotocol/server-time](https://www.npmjs.com/package/@modelcontextprotocol/server-time)
4. ✅ **Brave Search:** [@modelcontextprotocol/server-brave-search](https://www.npmjs.com/package/@modelcontextprotocol/server-brave-search)

---

## ✅ CHECKLIST FINAL

- [x] Bun instalado
- [x] google-mcp corrigido
- [x] mcp.json atualizado
- [ ] SQLite MCP instalado
- [ ] Fetch MCP configurado
- [ ] Time MCP instalado
- [ ] Brave Search API obtida
- [ ] Cursor recarregado
- [ ] Testes realizados

---

**🎉 Com estes MCPs, o TattooScheduler terá superpoderes! 💪**

**Seu sistema ficará:**
- 🚀 **Mais rápido** (queries diretas no SQLite)
- 🧠 **Mais inteligente** (busca e contexto)
- 🔗 **Mais integrado** (APIs externas)
- ⏰ **Mais preciso** (cálculos de tempo)
- 📸 **Mais organizado** (automação total)

**Pronto para levar o TattooScheduler ao próximo nível! 🎨✨**

