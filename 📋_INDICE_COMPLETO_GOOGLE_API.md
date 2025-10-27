# 📋 Índice Completo - Google API Configuration

**Data**: 26 de Outubro de 2025  
**Status**: ✅ Configuração Completa no Google Cloud Console  
**Próximo**: Configurar credenciais no projeto local

---

## 🎯 Resumo Executivo

| Item | Status | Detalhes |
|------|--------|----------|
| Conta Google | ✅ | photocalendar25@gmail.com |
| Projeto Google Cloud | ✅ | My First Project (polar-program-476423-i0) |
| Google Drive API | ✅ | Habilitada |
| Google Calendar API | ✅ | Habilitada |
| OAuth Client | ✅ | TATTOO_PHOTO_CALENDAR_Desktop |
| Client ID | ✅ | 1073557089506-5hk... |
| Client Secret | ⏳ | No arquivo JSON (Downloads) |
| Test User | ✅ | photocalendar25@gmail.com |
| Escopos Drive | ✅ | Adicionados ao código |

---

## 📚 Documentação Disponível

### 🚀 **Para Começar AGORA**
📄 `🚀_INICIO_RAPIDO_GOOGLE_API.md`
- Guia de 3 passos
- Tempo: 5 minutos
- **Comece por aqui!**

### 🔍 **Encontrar Client Secret**
📄 `agenda-hibrida-v2/ONDE_ENCONTRAR_CLIENT_SECRET.md`
- Como localizar o arquivo JSON
- Como extrair o Client Secret
- Comandos úteis

### 🔐 **Credenciais Completas**
📄 `🔐_CREDENCIAIS_GOOGLE_API.md`
- Todas as credenciais
- Informações do projeto
- Links do Google Cloud
- Documentação técnica completa

### 🎯 **Guias Anteriores**
📄 `🎯_PASSOS_FINAIS_GOOGLE_AUTH.md` - Guia anterior
📄 `🔧_CORRIGIR_GOOGLE_AUTH.md` - Correções anteriores
📄 `📖_INDICE_RAPIDO.md` - Índice rápido anterior

---

## 🔑 Credenciais Principais

### Client ID
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

### Client Secret
```
Procure no arquivo JSON baixado em Downloads/
Chave: "client_secret"
Formato: GOCSPX-xxxxxxxxxxxxxxxxxx
```

### Redirect URI
```
http://localhost:3001/auth/google/callback
```

### Email Autorizado
```
photocalendar25@gmail.com
```

---

## 🛠️ Scripts Disponíveis

### 1️⃣ Configuração Automática
```bash
cd agenda-hibrida-v2
node configurar-novas-credenciais-google.js
```
**O que faz:** Atualiza o arquivo `.env` com as novas credenciais

### 2️⃣ Autenticação OAuth
```bash
node reautenticar-google.js
```
**O que faz:** Inicia o fluxo OAuth para obter tokens

### 3️⃣ Testes
```bash
# Testar Google Drive
node test-gdrive-connection.js

# Testar Google Calendar
node test-sync-system.js

# Testar criação de pasta
node test-create-gdrive-folder.js
```

---

## 📊 Alterações no Código

### ✅ Escopos Atualizados

**Arquivo:** `services/googleAuthService.js`

**Antes:**
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly'
];
```

**Depois:**
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];
```

---

## 🔗 Links Importantes

### Google Cloud Console
- **Dashboard**: https://console.cloud.google.com/
- **Seu Projeto**: https://console.cloud.google.com/auth/overview?project=polar-program-476423-i0
- **OAuth Clients**: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
- **Test Users**: https://console.cloud.google.com/auth/audience?project=polar-program-476423-i0
- **APIs Habilitadas**: https://console.cloud.google.com/apis/dashboard?project=polar-program-476423-i0

### Documentação Google
- **OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2
- **Google Drive API**: https://developers.google.com/drive/api/v3/about-sdk
- **Google Calendar API**: https://developers.google.com/calendar/api/guides/overview

---

## 🎯 Passo a Passo Completo

### Fase 1: Localizar Credenciais ✅ ATUAL
1. ✅ Encontrar arquivo JSON em Downloads
2. ✅ Extrair Client Secret do arquivo
3. ⏳ **VOCÊ ESTÁ AQUI**

### Fase 2: Configurar Projeto
1. ⏳ Executar `configurar-novas-credenciais-google.js`
2. ⏳ Inserir Client Secret quando solicitado
3. ⏳ Verificar arquivo `.env` atualizado

### Fase 3: Autenticar
1. ⏳ Executar `reautenticar-google.js`
2. ⏳ Abrir URL no navegador
3. ⏳ Login com photocalendar25@gmail.com
4. ⏳ Aceitar permissões
5. ⏳ Copiar código de autorização
6. ⏳ Colar no terminal

### Fase 4: Testar
1. ⏳ Testar Google Drive
2. ⏳ Testar Google Calendar
3. ⏳ Iniciar servidor
4. ⏳ Testar integração completa

---

## ⚠️ Problemas Comuns

### 1. Não encontro o arquivo JSON
**Solução:** Baixe novamente em:
https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0

### 2. Client Secret inválido
**Verifique:**
- Copiou apenas o valor (sem aspas)
- Não incluiu espaços extras
- Arquivo JSON está correto

### 3. Erro "This app isn't verified"
**Normal!** É só clicar em:
- "Advanced" / "Avançado"
- "Go to TATTOO_PHOTO_CALENDAR (unsafe)"

### 4. Access Denied
**Certifique-se:**
- Está usando photocalendar25@gmail.com
- Email está na lista de Test Users

---

## 📱 Comandos Rápidos

### Encontrar arquivo JSON:
```bash
find ~/Downloads -name "client_secret_*.json" -type f
```

### Ver Client Secret:
```bash
cat ~/Downloads/client_secret_*.json | grep client_secret
```

### Extrair apenas o valor:
```bash
cat ~/Downloads/client_secret_*.json | grep client_secret | cut -d'"' -f4
```

### Verificar .env atual:
```bash
cd agenda-hibrida-v2
grep GOOGLE .env
```

---

## 🎓 Conceitos Importantes

### OAuth 2.0
- **Client ID**: Identifica sua aplicação
- **Client Secret**: Senha da aplicação (manter seguro!)
- **Access Token**: Token temporário (1h de validade)
- **Refresh Token**: Token para renovar access token

### Escopos (Scopes)
- **calendar.readonly**: Ler calendários
- **drive.file**: Criar/editar arquivos no Drive
- **drive.appdata**: Dados da aplicação
- **drive.metadata**: Metadados dos arquivos

### Test Users
- Modo Testing: Apenas 100 usuários
- Verificação: Necessária para mais usuários
- Lista: Gerenciar em Audience

---

## ✅ Checklist de Conclusão

Antes de começar:
- [ ] Arquivo JSON localizado
- [ ] Client Secret extraído
- [ ] Servidor parado

Configuração:
- [ ] Executado `configurar-novas-credenciais-google.js`
- [ ] `.env` atualizado
- [ ] Backup do `.env` anterior criado

Autenticação:
- [ ] Executado `reautenticar-google.js`
- [ ] Login com photocalendar25@gmail.com
- [ ] Tokens salvos no banco
- [ ] Tokens salvos em arquivo

Testes:
- [ ] Google Drive testado
- [ ] Google Calendar testado
- [ ] Servidor iniciado
- [ ] Tudo funcionando!

---

## 📞 Suporte

### Logs
```bash
# Ver logs do servidor
tail -f agenda-hibrida-v2/backend.log

# Ver logs de sync
tail -f agenda-hibrida-v2/logs/sync-*.log
```

### Diagnóstico
```bash
# Verificar status OAuth
node verificar-google-config.js

# Testar conexão
node test-gdrive-connection.js
```

---

## 🎉 Sucesso!

Quando tudo estiver funcionando, você verá:

✅ Google Drive conectado  
✅ Google Calendar sincronizando  
✅ Upload de fotos funcionando  
✅ Backup automático ativo  

---

**Última atualização**: 26/10/2025 às 20:45  
**Criado por**: Cursor AI Assistant  
**Versão**: 2.0 - Credenciais Novas (photocalendar25@gmail.com)

---

## 🔄 Próximas Atualizações

- [ ] Adicionar mais usuários de teste (se necessário)
- [ ] Publicar app (se sair do modo testing)
- [ ] Configurar webhook para notificações
- [ ] Implementar sync bidirecional

