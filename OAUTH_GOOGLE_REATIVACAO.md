# 🔧 Reativação OAuth Google - Guia Passo a Passo

**Data:** 27 de Outubro de 2025  
**Prioridade:** 🟡 MÉDIA (Bloqueador de funcionalidades Google)  
**Tipo:** Configuração Externa

---

## 📋 Resumo

O OAuth Google está **desabilitado no Google Cloud Console** devido a:
- Aplicação não verificada pela Google
- Credenciais podem ter expirado
- Projeto pode estar em modo de teste restrito

**Impacto:**
- ❌ Sincronização Google Calendar não funciona
- ❌ Importação de eventos do Google não funciona  
- ❌ Upload para Google Drive não funciona

**Solução:** Reabilitar e configurar corretamente as credenciais OAuth no Google Cloud Console.

---

## 🔍 Status Atual

### Código Backend
✅ **Rotas funcionais** - Todas as rotas OAuth implementadas  
✅ **Serviços prontos** - googleAuthService.js e googleCalendarService.js  
✅ **Tabelas criadas** - google_oauth_tokens, sync_settings  
✅ **Endpoints testáveis** - `/api/auth/google`, `/api/auth/google/callback`

### Problema
❌ **Google Cloud Console** - OAuth desabilitado ou em modo de teste restrito

---

## 📝 Passos para Reativação

### 1. Acessar Google Cloud Console

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Selecione o projeto **"Tattoo Photo Calendar"** (ou nome do seu projeto)

---

### 2. Verificar Status do Projeto

#### Navegação:
```
APIs & Services → OAuth consent screen
```

#### Verificar:
- ✅ **Status da aplicação**: Deve estar "In production" ou "Testing"
- ✅ **User type**: Pode ser "External" (recomendado para testes)
- ✅ **Publishing status**: "In production" permite qualquer usuário

**Se estiver "Testing":**
- Você precisará adicionar usuários de teste manualmente
- OU solicitar verificação da Google

---

### 3. Configurar OAuth Consent Screen

#### Campos Obrigatórios:
```yaml
App name: Tattoo Photo Calendar
User support email: seu-email@dominio.com
Developer contact information: seu-email@dominio.com
```

#### Escopos Necessários:
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.appdata
```

#### Adicionar Escopos:
1. Clique em **"Add or Remove Scopes"**
2. Procure por "Google Calendar API"
3. Selecione os scopes acima
4. Clique em **"Update"**

---

### 4. Criar Novas Credenciais OAuth 2.0

#### Navegação:
```
APIs & Services → Credentials → Create Credentials → OAuth client ID
```

#### Configuração:
```yaml
Application type: Web application
Name: Tattoo Calendar Web Client

Authorized JavaScript origins:
  - http://localhost:5173
  - http://localhost:3000
  - https://seu-dominio.com (se em produção)

Authorized redirect URIs:
  - http://localhost:3000/api/auth/google/callback
  - https://seu-dominio.com/api/auth/google/callback
```

---

### 5. Copiar Credenciais

Após criar, você verá uma tela com:
```
Client ID: XXXXXXXXXXXXXXXX.apps.googleusercontent.com
Client Secret: XXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANTE:** Salve essas credenciais em local seguro!

---

### 6. Atualizar Arquivo `.env`

Edite o arquivo `.env` no backend:

```bash
# Google OAuth Credentials - ATUALIZADAS
GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXX.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXX
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Se usar em produção, adicione também:
# GOOGLE_REDIRECT_URI=https://seu-dominio.com/api/auth/google/callback
```

---

### 7. Habilitar APIs Necessárias

#### Navegação:
```
APIs & Services → Library
```

#### APIs para Habilitar:
1. **Google Calendar API**
   - Procure: "Google Calendar API"
   - Clique em **"Enable"**

2. **Google Drive API**
   - Procure: "Google Drive API"
   - Clique em **"Enable"**

---

### 8. Adicionar Usuários de Teste (Se em Testing Mode)

Se sua aplicação estiver em modo "Testing":

#### Navegação:
```
APIs & Services → OAuth consent screen → Test users
```

#### Adicionar:
1. Clique em **"Add users"**
2. Adicione o email que você vai usar para testar
3. Clique em **"Save"**

**Limite:** Máximo 100 usuários de teste

---

### 9. Publicar Aplicação (Opcional - Recomendado)

Para remover a restrição de usuários de teste:

#### Navegação:
```
APIs & Services → OAuth consent screen → Publish App
```

#### Processo:
1. Clique em **"Publish App"**
2. Confirme que deseja tornar público
3. **⚠️ Aviso:** Usuários verão uma tela de "App não verificado"
   - É normal para apps não verificados
   - Usuários podem clicar em "Advanced" → "Go to [app] (unsafe)" para continuar

**Verificação pela Google:**
- Para remover o aviso, você precisa solicitar verificação
- Processo pode levar semanas
- Não é necessário para uso interno/teste

---

### 10. Reiniciar Backend

Após atualizar o `.env`:

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
npm run dev
```

---

## 🧪 Testar OAuth Flow

### 1. Iniciar Autenticação

Acesse no navegador:
```
http://localhost:3000/api/auth/google
```

### 2. Fluxo Esperado

```
1. Redireciona para Google OAuth
   ↓
2. Usuário faz login no Google
   ↓
3. Usuário aceita permissões
   ↓
4. Redireciona para /api/auth/google/callback
   ↓
5. Backend salva tokens no banco
   ↓
6. Retorna sucesso: "Autenticado com sucesso!"
```

### 3. Verificar Status

```bash
# Verificar se tokens foram salvos
curl http://localhost:3000/api/auth/google/status
```

**Resposta Esperada:**
```json
{
  "authenticated": true,
  "scopes": ["calendar", "drive"],
  "expiresAt": "2025-10-28T00:00:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Erro: "Access blocked: This app's request is invalid"

**Causa:** Redirect URI não corresponde ao configurado

**Solução:**
1. Verifique o `.env`:
   ```bash
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```
2. Verifique no Google Cloud Console:
   ```
   Credentials → OAuth 2.0 Client IDs → Edit
   ```
3. Certifique-se que o URI está **exatamente** igual

---

### Erro: "Error 403: access_denied"

**Causa:** Aplicação em modo "Testing" e usuário não está na lista de teste

**Solução:**
1. Adicione o usuário aos **Test users**
2. OU publique a aplicação (**Publish App**)

---

### Erro: "Invalid client"

**Causa:** Client ID ou Client Secret incorretos

**Solução:**
1. Verifique se copiou corretamente do Google Cloud Console
2. Verifique se o `.env` está carregado corretamente
3. Reinicie o backend

---

### Erro: "Requested entity was not found"

**Causa:** Calendário padrão não existe

**Solução:**
1. Verifique se o usuário tem um calendário no Google Calendar
2. Acesse `calendar.google.com` e crie um evento de teste

---

## 📊 Verificação Final

### Checklist Pós-Reativação

- [ ] OAuth consent screen configurado
- [ ] Escopos Calendar e Drive adicionados
- [ ] Credenciais OAuth 2.0 criadas
- [ ] APIs Calendar e Drive habilitadas
- [ ] `.env` atualizado com novas credenciais
- [ ] Backend reiniciado
- [ ] Fluxo OAuth testado com sucesso
- [ ] Status `/api/auth/google/status` retorna `authenticated: true`
- [ ] Sincronização Google Calendar funcionando
- [ ] Upload Google Drive funcionando

---

## 🚀 Próximos Passos

Após reativação bem-sucedida:

1. **Testar Sincronização:**
   ```bash
   curl -X POST http://localhost:3000/api/sync/google-calendar/now
   ```

2. **Testar Upload Drive:**
   - Use o frontend para fazer upload de uma foto
   - Verifique se aparece no Google Drive

3. **Testar Importação ICS:**
   - Exporte um calendário do Google como `.ics`
   - Importe via frontend

---

## 📚 Documentação Oficial

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)

---

## ⚠️ Notas Importantes

1. **Nunca commite o `.env`** com credenciais reais
2. **Tokens OAuth expiram** - O sistema deve renovar automaticamente
3. **Limite de requests** - Google tem quotas por dia (geralmente 10,000 requests)
4. **Backup dos tokens** - Salve tokens importantes antes de testar

---

## 📧 Suporte

Se encontrar problemas:

1. Verifique os logs do backend: `npm run dev`
2. Verifique os logs do frontend: Console do navegador
3. Consulte a documentação oficial da Google
4. Verifique se as APIs estão habilitadas no console

---

**Status:** ⏳ AGUARDANDO AÇÃO MANUAL DO USUÁRIO  
**Responsável:** Usuário (requer acesso ao Google Cloud Console)  
**Bloqueador:** Configuração externa  
**Prioridade:** Alta (bloqueia funcionalidades importantes)

