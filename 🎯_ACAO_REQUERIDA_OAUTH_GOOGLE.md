# 🎯 AÇÃO REQUERIDA: Configurar OAuth Google

**Status:** ⏳ AGUARDANDO AÇÃO DO USUÁRIO  
**Tempo Estimado:** 10-15 minutos  
**Prioridade:** 🟡 ALTA (bloqueia funcionalidades Google)

---

## ✅ O QUE JÁ ESTÁ PRONTO

O sistema está 100% preparado para usar Google OAuth:

- ✅ Todas as rotas implementadas
- ✅ Serviços de autenticação prontos
- ✅ Tabelas do banco criadas
- ✅ Frontend com botão "Conectar Google"
- ✅ Fluxo OAuth completo codificado
- ✅ Tokens serão salvos automaticamente

**FALTA APENAS:** Configurar credenciais no Google Cloud Console

---

## 🚀 PASSOS RÁPIDOS (Opção Simples)

### 1. Acessar Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

### 2. Criar Novo OAuth Client ID
- Clique em **"+ CREATE CREDENTIALS"**
- Selecione **"OAuth client ID"**
- Application type: **Web application**
- Name: **Tattoo Photo Calendar**

### 3. Adicionar URIs de Redirecionamento
```
http://localhost:3001/auth/google/callback
```

### 4. Copiar Credenciais
Após criar, você verá:
- **Client ID**: 123456789-xxxx.apps.googleusercontent.com
- **Client Secret**: GOCSPX-xxxxxxxxxxxxx

### 5. Atualizar .env
Abra `/workspace/agenda-hibrida-v2/.env` e cole:
```env
GOOGLE_CLIENT_ID=cole_aqui_o_client_id
GOOGLE_CLIENT_SECRET=cole_aqui_o_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

### 6. Habilitar APIs
No Google Cloud Console:
- Habilite **Google Calendar API**
- Habilite **Google Drive API**

### 7. Reiniciar Sistema
```bash
cd /workspace/agenda-hibrida-v2
# Reinicie o backend para carregar novas credenciais
```

### 8. Testar
- Abra o frontend
- Clique em "Conectar Google"
- Autorize o acesso
- ✅ Pronto!

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para guia detalhado, consulte:
- `OAUTH_GOOGLE_REATIVACAO.md` - Guia completo
- `🎯_PASSOS_FINAIS_GOOGLE_AUTH.md` - Passos visuais

---

## ⚠️ IMPORTANTE

Esta é a **ÚNICA** tarefa que requer ação manual externa ao código.  
Todas as outras correções críticas já foram implementadas automaticamente.

**Depois de configurar o OAuth:**
- Sistema estará 100% funcional
- Google Calendar sincronizará automaticamente
- Google Drive estará disponível
- Importações funcionarão completamente

---

**Status do Código:** ✅ PRONTO  
**Status da Configuração:** ⏳ AGUARDANDO USUÁRIO  
**Próxima Ação:** Usuário configurar Google Cloud Console (10-15 min)
