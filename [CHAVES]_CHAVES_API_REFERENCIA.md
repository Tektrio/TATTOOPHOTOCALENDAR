# 🔑 Guia de Chaves API - Referência Rápida

**Sistema:** TattooScheduler Visual System  
**Atualizado:** 26/10/2025

---

## ✅ CHAVES CONFIGURADAS (Funcionando)

### 🔑 Google OAuth
```env
GOOGLE_CLIENT_ID=435554447869-81mao21m5u594r5uimqh169c4n12lhc4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```
**Status:** ✅ Configurado  
**Usado em:** google-mcp, google-drive  
**Função:** Autenticação com Google Calendar e Drive

---

### 📅 Google Calendar
```env
GOOGLE_CALENDAR_ID=primary
GOOGLE_APPLICATION_CREDENTIALS=/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json
```
**Status:** ✅ Configurado  
**Usado em:** google-mcp  
**Função:** Sincronização de agendamentos

---

### 🤖 Anthropic Claude
```env
ANTHROPIC_API_KEY=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
```
**Status:** ✅ Configurado  
**Usado em:** Backend do sistema (IA automática)  
**Função:** Processamento de linguagem natural

---

## 📝 CHAVES OPCIONAIS (Recomendadas)

### 🔍 Brave Search (GRATUITO)
```env
# BRAVE_API_KEY=BSA_seu_token_aqui
```
**Status:** ⚪ Não configurado (opcional)  
**Como obter:**
1. Acesse: https://brave.com/search/api/
2. Crie uma conta gratuita
3. Obtenha sua API key
4. Cole no .env e descomente

**Função:** Buscar referências de tatuagens, inspirações, estilos  
**Benefício:** 2.000 queries gratuitas/mês  
**Recomendação:** ⭐⭐⭐⭐⭐ ALTAMENTE RECOMENDADO

---

### 🐙 GitHub Token
```env
# GITHUB_TOKEN=ghp_seu_token_aqui
```
**Status:** ⚪ Não configurado (opcional)  
**Como obter:**
1. Acesse: https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Selecione escopos: `repo`, `workflow`
4. Gere o token
5. Cole no .env e descomente

**Função:** Versionamento de código, backup do projeto  
**Benefício:** Controle de versão, colaboração  
**Recomendação:** ⭐⭐⭐⭐ MUITO ÚTIL

---

### 🎨 Figma Token
```env
# FIGMA_API_KEY=figd_seu_token_aqui
# FIGMA_ACCESS_TOKEN=figd_seu_token_aqui
```
**Status:** ⚪ Não configurado (opcional)  
**Como obter:**
1. Acesse: https://www.figma.com/developers/api#access-tokens
2. Faça login na sua conta Figma
3. Settings → Account → Personal Access Tokens
4. Gere novo token
5. Cole no .env e descomente

**Função:** Integração com designs da interface  
**Benefício:** Exportar assets, protótipos  
**Recomendação:** ⭐⭐⭐ ÚTIL (se usar Figma)

---

### 🔍 Tavily Search
```env
# TAVILY_API_KEY=tvly-seu_token_aqui
```
**Status:** ⚪ Não configurado (opcional)  
**Como obter:**
1. Acesse: https://tavily.com
2. Crie uma conta
3. Dashboard → API Keys
4. Copie sua chave
5. Cole no .env e descomente

**Função:** Busca web avançada (alternativa ao Brave)  
**Benefício:** Busca mais detalhada  
**Recomendação:** ⭐⭐⭐ ÚTIL (alternativa)

---

### ✨ OpenAI API (Magic)
```env
# OPENAI_API_KEY=sk-proj-sua_chave_aqui
```
**Status:** ⚪ Não configurado (opcional)  
**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login
3. Create new secret key
4. Copie e guarde com segurança
5. Cole no .env e descomente

**Função:** Recursos avançados de IA  
**Benefício:** GPT-4, DALL-E, etc  
**Recomendação:** ⭐⭐ OPCIONAL (você já tem Claude)  
**Custo:** Pago (pay-as-you-go)

---

## 🔐 CHAVES DE BACKUP (Futuro)

### 💾 WebDAV QNAP
```env
# WEBDAV_URL=https://seu-qnap.local/dav
# WEBDAV_USERNAME=usuario
# WEBDAV_PASSWORD=senha
```
**Status:** ⚪ Não configurado  
**Quando configurar:** Se tiver servidor QNAP  
**Função:** Backup alternativo na rede local

---

### 🔐 SFTP QNAP
```env
# SFTP_HOST=seu-qnap.local
# SFTP_PORT=22
# SFTP_USERNAME=usuario
# SFTP_PASSWORD=senha
```
**Status:** ⚪ Não configurado  
**Quando configurar:** Se tiver servidor QNAP  
**Função:** Backup via SFTP

---

## 🌐 CHAVES DE SERVIÇOS EXTERNOS

### 📈 Opik (Monitoramento)
```env
# OPIK_API_BASE_URL=https://www.comet.com/opik/api
# OPIK_API_KEY=sua_chave_aqui
# OPIK_WORKSPACE_NAME=default
```
**Status:** ⚪ Não configurado  
**Quando usar:** Para monitorar performance da IA  
**Recomendação:** ⭐ OPCIONAL (avançado)

---

### 🌐 Browserbase
```env
# BROWSERBASE_API_KEY=sua_chave_aqui
# BROWSERBASE_PROJECT_ID=seu_projeto_aqui
```
**Status:** ⚪ Não configurado  
**Quando usar:** Testes em nuvem  
**Recomendação:** ⭐ OPCIONAL (você tem Playwright local)

---

### 🔌 Apidog
```env
# APIDOG_ACCESS_TOKEN=sua_chave_aqui
```
**Status:** ⚪ Não configurado  
**Quando usar:** Testes de API profissionais  
**Recomendação:** ⭐ OPCIONAL

---

## 📊 PRIORIZAÇÃO RECOMENDADA

### 🔥 PRIORIDADE CRÍTICA (Já configuradas):
- ✅ Google OAuth (Client ID + Secret)
- ✅ Google Calendar/Drive (tokens.json)
- ✅ Anthropic Claude API

### ⚡ PRIORIDADE ALTA (Recomendado instalar):
- ⚪ **Brave Search** (GRATUITO) - Para buscar referências
- ⚪ **GitHub Token** - Para versionamento

### ⭐ PRIORIDADE MÉDIA (Útil, mas opcional):
- ⚪ Figma Token (se usar design)
- ⚪ Tavily Search (alternativa ao Brave)

### 💡 PRIORIDADE BAIXA (Futuro):
- ⚪ OpenAI API (você já tem Claude)
- ⚪ QNAP (se tiver servidor)
- ⚪ Opik/Browserbase/Apidog (avançado)

---

## 🎯 GUIA RÁPIDO DE CONFIGURAÇÃO

### Para Brave Search (RECOMENDADO):

1. **Acesse:** https://brave.com/search/api/
2. **Cadastre-se** (gratuito)
3. **Obtenha API key**
4. **Edite .env:**
   ```bash
   nano ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/.env
   ```
5. **Descomente e cole:**
   ```env
   BRAVE_API_KEY=BSA_sua_chave_aqui
   ```
6. **Salve:** Ctrl+O, Enter, Ctrl+X
7. **Recarregue Cursor**

### Para GitHub Token:

1. **Acesse:** https://github.com/settings/tokens
2. **Generate new token (classic)**
3. **Selecione:** `repo`, `workflow`
4. **Gere** e copie o token
5. **Edite .env:**
   ```bash
   nano ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/.env
   ```
6. **Descomente e cole:**
   ```env
   GITHUB_TOKEN=ghp_seu_token_aqui
   ```
7. **Salve** e **recarregue Cursor**

---

## 🔒 SEGURANÇA DAS CHAVES

### ✅ Boas Práticas:

1. **NUNCA commitar .env no git**
   ```bash
   # Já está no .gitignore
   echo ".env" >> .gitignore
   ```

2. **Permissões do arquivo:**
   ```bash
   chmod 600 ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/.env
   ```

3. **Backup seguro:**
   ```bash
   # Backup criptografado
   cp .env .env.backup
   chmod 600 .env.backup
   ```

4. **Rotação de chaves:**
   - Trocar chaves a cada 3-6 meses
   - Revogar chaves antigas
   - Usar chaves diferentes para dev/prod

---

## 📝 TEMPLATE DE .env

### Para copiar e colar:

```env
# ✅ CHAVES ESSENCIAIS (já configuradas)
GOOGLE_CLIENT_ID=sua_chave_aqui
GOOGLE_CLIENT_SECRET=sua_chave_aqui
GOOGLE_CALENDAR_ID=primary
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/tokens.json
ANTHROPIC_API_KEY=sua_chave_aqui

# 🔍 BRAVE SEARCH (recomendado - gratuito)
BRAVE_API_KEY=BSA_sua_chave_aqui

# 🐙 GITHUB (recomendado)
GITHUB_TOKEN=ghp_seu_token_aqui

# 🎨 FIGMA (opcional)
# FIGMA_API_KEY=figd_sua_chave_aqui

# ✨ OPENAI (opcional)
# OPENAI_API_KEY=sk-proj-sua_chave_aqui
```

---

## 🆘 TROUBLESHOOTING

### Problema: "Invalid API Key"
**Solução:**
1. Verificar se a chave está correta (sem espaços)
2. Verificar se a chave está ativa
3. Verificar permissões/escopos
4. Recarregar Cursor

### Problema: "Rate Limit Exceeded"
**Solução:**
1. Aguardar limite resetar
2. Considerar upgrade de plano
3. Otimizar queries

### Problema: "Authentication Failed"
**Solução:**
1. Regenerar a chave
2. Verificar tokens.json
3. Verificar permissões no Google Cloud Console

---

## 📞 LINKS ÚTEIS

### Obter Chaves:
- **Brave Search:** https://brave.com/search/api/ (GRATUITO)
- **GitHub:** https://github.com/settings/tokens
- **Figma:** https://www.figma.com/developers/api#access-tokens
- **Tavily:** https://tavily.com
- **OpenAI:** https://platform.openai.com/api-keys
- **Google Cloud:** https://console.cloud.google.com

### Documentação:
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Google Calendar API:** https://developers.google.com/calendar/api
- **Google Drive API:** https://developers.google.com/drive/api
- **MCP Servers:** https://github.com/modelcontextprotocol/servers

---

## ✅ CHECKLIST DE CHAVES

- [x] Google Client ID
- [x] Google Client Secret
- [x] Google Calendar ID
- [x] Google Application Credentials
- [x] Anthropic API Key
- [ ] Brave Search API Key (recomendado)
- [ ] GitHub Token (recomendado)
- [ ] Figma Token (opcional)
- [ ] Tavily API Key (opcional)
- [ ] OpenAI API Key (opcional)

---

**🎉 Guia completo de chaves API para o TattooScheduler!**

**Próximo passo:** Obter Brave Search API key (gratuito e muito útil)! 🔍✨

