# 🔐 Credenciais Google API - TATTOO_PHOTO_CALENDAR

**Data de Criação**: 26 de Outubro de 2025  
**Email da Conta**: photocalendar25@gmail.com  
**Projeto**: My First Project (polar-program-476423-i0)

---

## 📋 Resumo da Configuração

✅ **APIs Habilitadas:**
- Google Drive API
- Google Calendar API

✅ **OAuth 2.0 Configurado:**
- App Name: TATTOO_PHOTO_CALENDAR
- User Type: External (Testing)
- Status: Testing Mode (até 100 usuários de teste)

✅ **Usuário de Teste Autorizado:**
- Email: photocalendar25@gmail.com

---

## 🔑 Credenciais OAuth 2.0

### **Client ID**
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

### **Client Secret**
```
(O Client Secret está no arquivo JSON baixado)
```

### **Redirect URI**
```
http://localhost:3001/auth/google/callback
```

### **OAuth Client Name**
```
TATTOO_PHOTO_CALENDAR_Desktop
```

---

## 📁 Arquivo JSON de Credenciais

O arquivo JSON com as credenciais completas foi baixado automaticamente. Procure por:
- Nome: `client_secret_*.json` ou similar
- Local: Pasta Downloads do navegador
- Conteúdo: Client ID, Client Secret, URIs de autenticação, etc.

**⚠️ IMPORTANTE:** Este arquivo contém informações sensíveis. Mantenha-o seguro!

---

## 🔧 Como Configurar no Projeto

### Opção 1: Atualizar Arquivo `.env` (Recomendado)

1. Abra o arquivo `.env` na pasta `agenda-hibrida-v2/`
2. Localize as linhas com `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
3. Substitua pelos novos valores:

```env
# 🔑 Configuração do Google OAuth (NOVAS CREDENCIAIS)
GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<SEU_CLIENT_SECRET_DO_ARQUIVO_JSON>
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

### Opção 2: Usar Arquivo JSON Diretamente

1. Mova o arquivo JSON baixado para: `agenda-hibrida-v2/config/`
2. Renomeie para: `google-credentials.json`
3. Atualize o código para ler este arquivo

---

## 🔐 Escopos de Permissão

As APIs estão configuradas com os seguintes escopos:

### Google Calendar
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events.readonly`

### Google Drive (Adicionar se necessário)
- `https://www.googleapis.com/auth/drive.file` - Criar e editar arquivos
- `https://www.googleapis.com/auth/drive.appdata` - Dados da aplicação
- `https://www.googleapis.com/auth/drive.readonly` - Apenas leitura

**📝 Para adicionar escopos do Google Drive:**

Edite o arquivo `services/googleAuthService.js` e adicione os escopos:

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/drive.file', // Adicionar
  'https://www.googleapis.com/auth/drive.appdata' // Adicionar
];
```

---

## 🚀 Processo de Autenticação OAuth

### 1. Gerar URL de Autorização
```javascript
const googleAuthService = require('./services/googleAuthService');
const authUrl = googleAuthService.getAuthUrl();
console.log('Acesse esta URL:', authUrl);
```

### 2. Usuário Autoriza
- Abre a URL no navegador
- Faz login com: **photocalendar25@gmail.com**
- Aceita as permissões
- É redirecionado para: `http://localhost:3001/auth/google/callback?code=...`

### 3. Trocar Código por Tokens
```javascript
const code = '<CÓDIGO_DA_URL>';
const tokens = await googleAuthService.getTokensFromCode(code);
await googleAuthService.saveTokensToDb(db, tokens);
```

---

## 🔄 Renovação Automática de Tokens

O sistema está configurado para renovar tokens automaticamente:

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Usado para obter novos access tokens
- **Renovação**: Automática quando o access token expira

---

## 📊 Status Atual

- ✅ Projeto criado: **My First Project**
- ✅ APIs habilitadas: **Google Drive + Calendar**
- ✅ OAuth configurado: **TATTOO_PHOTO_CALENDAR**
- ✅ Cliente OAuth criado: **Desktop app**
- ✅ Usuário de teste adicionado: **photocalendar25@gmail.com**
- ⏳ Pendente: Executar fluxo de autorização OAuth pela primeira vez

---

## 🛠️ Scripts de Teste Disponíveis

O projeto já possui scripts de teste para Google Drive:

```bash
# Testar conexão com Google Drive
node test-gdrive-connection.js

# Testar criação de pasta no Google Drive
node test-create-gdrive-folder.js

# Testar API do Google Drive
node test-google-drive-api.js
```

---

## ⚠️ Notas Importantes

1. **Modo Testing**: A aplicação está em modo de teste. Apenas usuários listados como "Test Users" podem autenticar.

2. **Limite de Usuários**: Máximo de 100 usuários de teste antes da verificação da app.

3. **Usuário Autorizado**: Apenas `photocalendar25@gmail.com` está autorizado no momento.

4. **Segurança**: NUNCA commite o arquivo `.env` ou arquivos JSON de credenciais no Git!

5. **Backup**: O arquivo JSON de credenciais é único. Faça backup em local seguro.

---

## 🔗 Links Úteis

- **Google Cloud Console**: https://console.cloud.google.com/
- **Projeto**: https://console.cloud.google.com/auth/overview?project=polar-program-476423-i0
- **OAuth Clients**: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
- **Test Users**: https://console.cloud.google.com/auth/audience?project=polar-program-476423-i0

---

## 📞 Próximos Passos

1. ✅ **Localizar o arquivo JSON** baixado (pasta Downloads)
2. ✅ **Atualizar arquivo `.env`** com as novas credenciais
3. ✅ **Adicionar escopos do Google Drive** ao `googleAuthService.js`
4. ✅ **Executar fluxo OAuth** para obter tokens
5. ✅ **Testar conexão** com as APIs

---

**Data de Criação**: 26/10/2025 às 20:36  
**Criado por**: Cursor AI Assistant  
**Válido até**: As credenciais não expiram, mas podem ser revogadas se necessário

