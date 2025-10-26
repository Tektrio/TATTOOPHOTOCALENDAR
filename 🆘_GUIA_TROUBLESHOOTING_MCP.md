# 🆘 Guia Rápido de Troubleshooting - MCP

## 🔴 PROBLEMAS COMUNS E SOLUÇÕES

---

### ❌ Problema 1: "tokens.json não encontrado"

**Sintoma:**
```
Error: ENOENT: no such file or directory
'/Users/.../TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json'
```

**Soluções:**

1. **Verificar se o arquivo existe:**
   ```bash
   ls -la ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json
   ```

2. **Se não existir, verificar localização original:**
   ```bash
   find ~/Desktop -name "tokens.json" 2>/dev/null
   ```

3. **Copiar do local correto:**
   ```bash
   # Se estiver em outro lugar, copie:
   cp ~/Desktop/agenda-hibrida-v2/tokens.json \
      ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/
   ```

4. **Criar nova autenticação (se necessário):**
   ```bash
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   node test-gdrive-connection.js
   # Siga o processo de autenticação OAuth2
   ```

---

### ❌ Problema 2: "Google Drive não conecta"

**Sintoma:**
```
Error: invalid_grant ou Error 401: Unauthorized
```

**Soluções:**

1. **Tokens expirados - reautenticar:**
   ```bash
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   rm tokens.json  # Remove tokens antigos
   node test-gdrive-connection.js  # Cria novos
   ```

2. **Verificar permissões no Google Cloud:**
   - Acesse: https://console.cloud.google.com
   - APIs & Services → Enabled APIs
   - Verificar: Google Drive API ✅ Habilitada
   - Verificar: Google Calendar API ✅ Habilitada

3. **Verificar OAuth consent screen:**
   - Status deve ser: "Testing" ou "Published"
   - Seu email deve estar na lista de test users

---

### ❌ Problema 3: "Google Calendar não sincroniza"

**Sintoma:**
```
Error: Calendar events not syncing
```

**Soluções:**

1. **Verificar GOOGLE_API_KEY:**
   
   **Opção A: Usar apenas credentials (recomendado)**
   ```json
   "GOOGLE_API_KEY": ""  // Deixar vazio
   ```
   
   **Opção B: Adicionar API Key**
   - Google Cloud Console → Credentials
   - Create Credentials → API Key
   - Copiar e adicionar no mcp.json

2. **Verificar CALENDAR_ID:**
   ```json
   "GOOGLE_CALENDAR_ID": "primary"  // Calendário principal
   ```
   
   Ou usar ID específico:
   ```json
   "GOOGLE_CALENDAR_ID": "seu-email@gmail.com"
   ```

3. **Testar manualmente:**
   ```bash
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   node test-google-drive-api.js
   ```

---

### ❌ Problema 4: "Cursor não reconhece MCPs"

**Sintoma:**
- Servidores MCP não aparecem
- Funcionalidades não funcionam

**Soluções:**

1. **Recarregar Cursor completamente:**
   - Fechar TODAS as janelas do Cursor
   - Aguardar 5 segundos
   - Abrir novamente

2. **Verificar sintaxe JSON:**
   ```bash
   cd ~/.cursor
   cat mcp.json | python3 -m json.tool
   ```
   
   Se mostrar erro, há problema no JSON.

3. **Verificar localização do arquivo:**
   ```bash
   ls -la ~/.cursor/mcp.json
   ```
   
   Deve existir em: `/Users/luizlopes/.cursor/mcp.json`

4. **Verificar comandos dos servidores:**
   ```bash
   # Testar se npx está disponível:
   which npx
   
   # Testar se google-mcp está instalado:
   ls -la ~/.nvm/versions/node/v22.15.0/bin/google-mcp
   ls -la ~/.nvm/versions/node/v22.15.0/bin/mcp-google-drive
   ```

---

### ❌ Problema 5: "Servidor desabilitado inesperadamente"

**Sintoma:**
```
"disabled": true  // Quando deveria ser false
```

**Solução:**

Editar `~/.cursor/mcp.json` e alterar:

```json
"filesystem": {
  "command": "npx",
  "args": [...],
  "disabled": false  // ← Verificar isso
}
```

**Servidores que DEVEM estar ativos:**
- ✅ filesystem: `"disabled": false`
- ✅ google-drive: `"disabled": false`
- ✅ google-mcp: `"disabled": false`
- ✅ memory: `"disabled": false`

---

### ❌ Problema 6: "Performance lenta"

**Sintoma:**
- Cursor demora para responder
- Timeout em operações

**Soluções:**

1. **Desabilitar servidores não utilizados:**
   ```json
   "playwright": {
     "disabled": true  // Se não estiver testando
   }
   ```

2. **Verificar sincronizações:**
   - Google Drive: Pausar sync temporariamente
   - Muitos arquivos grandes: Usar subpastas

3. **Limpar cache:**
   ```bash
   # Limpar cache do sistema
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   rm -rf node_modules/.cache
   ```

---

## 🔍 DIAGNÓSTICO RÁPIDO

Execute este script para diagnóstico completo:

```bash
#!/bin/bash
echo "🔍 Diagnóstico MCP - TattooScheduler"
echo "====================================="
echo ""

echo "1️⃣ Verificando mcp.json..."
if [ -f ~/.cursor/mcp.json ]; then
  echo "✅ mcp.json existe"
  cat ~/.cursor/mcp.json | python3 -m json.tool > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ JSON válido"
  else
    echo "❌ JSON inválido"
  fi
else
  echo "❌ mcp.json não encontrado"
fi
echo ""

echo "2️⃣ Verificando tokens.json..."
if [ -f ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json ]; then
  echo "✅ tokens.json existe"
else
  echo "❌ tokens.json não encontrado"
  echo "   Localização esperada: ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json"
fi
echo ""

echo "3️⃣ Verificando comandos MCP..."
which npx > /dev/null 2>&1 && echo "✅ npx disponível" || echo "❌ npx não encontrado"
[ -f ~/.nvm/versions/node/v22.15.0/bin/google-mcp ] && echo "✅ google-mcp instalado" || echo "⚠️ google-mcp não encontrado"
[ -f ~/.nvm/versions/node/v22.15.0/bin/mcp-google-drive ] && echo "✅ mcp-google-drive instalado" || echo "⚠️ mcp-google-drive não encontrado"
echo ""

echo "4️⃣ Verificando estrutura de pastas..."
[ -d ~/Desktop/TATTOO_PHOTO_CALENDAR ] && echo "✅ TATTOO_PHOTO_CALENDAR existe" || echo "❌ TATTOO_PHOTO_CALENDAR não encontrado"
[ -d ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2 ] && echo "✅ agenda-hibrida-v2 existe" || echo "❌ agenda-hibrida-v2 não encontrado"
echo ""

echo "====================================="
echo "Diagnóstico concluído!"
```

**Salvar como:** `diagnostico-mcp.sh`

**Executar:**
```bash
chmod +x diagnostico-mcp.sh
./diagnostico-mcp.sh
```

---

## 📞 SUPORTE

### Se nada funcionar:

1. **Fazer backup do mcp.json atual:**
   ```bash
   cp ~/.cursor/mcp.json ~/.cursor/mcp.json.backup
   ```

2. **Resetar para configuração mínima:**
   ```json
   {
     "mcpServers": {
       "filesystem": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-filesystem",
                  "/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR"],
         "disabled": false
       }
     }
   }
   ```

3. **Testar filesystem primeiro:**
   - Se funcionar, adicionar google-drive
   - Se funcionar, adicionar google-mcp
   - Adicionar demais gradualmente

---

## ✅ CHECKLIST DE VALIDAÇÃO

Execute em ordem:

- [ ] JSON válido
- [ ] tokens.json existe
- [ ] Caminhos corretos
- [ ] Servidores críticos ativos
- [ ] Cursor recarregado
- [ ] Google Drive conectado
- [ ] Google Calendar sincronizado
- [ ] Sistema funcionando

---

## 🎓 DICAS PREVENTIVAS

1. **Sempre fazer backup antes de editar:**
   ```bash
   cp ~/.cursor/mcp.json ~/.cursor/mcp.json.$(date +%Y%m%d)
   ```

2. **Testar JSON após edições:**
   ```bash
   cat ~/.cursor/mcp.json | python3 -m json.tool
   ```

3. **Manter tokens.json seguro:**
   ```bash
   chmod 600 ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json
   ```

4. **Documentar mudanças:**
   - Anotar o que mudou
   - Manter histórico de versões

---

**Precisando de ajuda adicional?**
- Verifique logs do Cursor: `~/Library/Application Support/Cursor/logs/`
- Documente o erro exato para troubleshooting mais específico

