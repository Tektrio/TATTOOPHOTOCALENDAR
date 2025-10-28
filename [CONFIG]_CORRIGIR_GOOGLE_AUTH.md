# 🔧 Guia Completo: Corrigir Autenticação Google

**Problema Identificado:** `disabled_client` - Cliente OAuth desabilitado ou revogado

---

## 🎯 SOLUÇÃO RÁPIDA (Método 1)

### 1️⃣ Habilitar o Cliente OAuth no Google Cloud Console

**Passo a Passo:**

1. **Acesse o Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Faça login** com a conta Google usada no projeto

3. **Selecione o projeto** (ou crie um novo se necessário)

4. **Procure pelo OAuth Client ID:**
   - ID: `435554447869-81mao21m5u594r5uimqh169c4n12lhc4`
   - Se estiver desabilitado, clique para habilitar

5. **Verifique as URIs de Redirecionamento:**
   - Adicione: `http://localhost:3001/auth/google/callback`
   - Adicione: `http://localhost:3000/auth/google/callback`

6. **Habilite as APIs necessárias:**
   - Google Calendar API
   - Google Drive API
   - Google+ API

---

## 🆕 SOLUÇÃO ALTERNATIVA (Método 2 - Recomendado)

### Criar Novo OAuth Client ID

**Por que:** Mais rápido que reabilitar um cliente desabilitado

**Passo a Passo:**

1. **Acesse:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Clique em "CREATE CREDENTIALS" → "OAuth client ID"**

3. **Configuração:**
   - **Application type:** Web application
   - **Name:** Tattoo Photo Calendar
   
4. **Authorized redirect URIs:**
   ```
   http://localhost:3001/auth/google/callback
   http://localhost:3000/auth/google/callback
   http://127.0.0.1:3001/auth/google/callback
   ```

5. **Clique em "CREATE"**

6. **Copie as credenciais:**
   - Client ID
   - Client Secret

7. **Atualize o arquivo .env:**
   ```bash
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   nano .env
   ```
   
   Substitua:
   ```env
   GOOGLE_CLIENT_ID=SEU_NOVO_CLIENT_ID_AQUI
   GOOGLE_CLIENT_SECRET=SEU_NOVO_CLIENT_SECRET_AQUI
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   ```

8. **Salve:** Ctrl+O, Enter, Ctrl+X

---

## 🔄 DEPOIS DE CORRIGIR AS CREDENCIAIS

### Reautenticar com o Google:

1. **Execute o script de reautenticação:**
   ```bash
   cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
   node reautenticar-google.js
   ```

2. **O navegador abrirá automaticamente**

3. **Faça login e autorize o acesso**

4. **Aguarde a confirmação de sucesso**

---

## ✅ VERIFICAR SE FUNCIONOU

### Testar conexão com Google Calendar:

```bash
cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
node test-gdrive-connection.js
```

---

## 🆘 TROUBLESHOOTING

### Erro: "redirect_uri_mismatch"

**Solução:** Adicione a URI exata no Google Cloud Console:
- Vá em Credentials → OAuth 2.0 Client IDs
- Edite o cliente
- Adicione: `http://localhost:3001/auth/google/callback`

### Erro: "access_denied"

**Solução:** Verifique se as APIs estão habilitadas:
1. Vá em APIs & Services → Library
2. Procure e habilite:
   - Google Calendar API
   - Google Drive API

### Erro: "invalid_client"

**Solução:** Credenciais incorretas no .env:
1. Verifique se Client ID e Secret estão corretos
2. Sem espaços extras antes/depois
3. Reinicie o servidor backend

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Antes de reautenticar, verifique:

- [ ] Google Cloud Console acessível
- [ ] Projeto selecionado corretamente
- [ ] OAuth Client ID existe e está habilitado
- [ ] URIs de redirecionamento configuradas
- [ ] Google Calendar API habilitada
- [ ] Google Drive API habilitada
- [ ] Arquivo .env atualizado com credenciais corretas
- [ ] Servidor backend rodando (porta 3001)

---

## 🎯 COMANDOS ÚTEIS

### Reiniciar o servidor backend:
```bash
# Parar processos na porta 3001
lsof -ti:3001 | xargs kill -9

# Iniciar novamente
cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
npm start
```

### Verificar arquivo .env:
```bash
cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
cat .env | grep GOOGLE
```

### Remover tokens antigos:
```bash
cd ~/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
rm tokens.json
```

---

## 🔐 SEGURANÇA

### Após resolver:

1. **Nunca compartilhe suas credenciais**
2. **Adicione .env ao .gitignore** (já está)
3. **Faça backup do .env** em local seguro
4. **Rotacione credenciais a cada 3-6 meses**

---

## 📞 LINKS ÚTEIS

- **Google Cloud Console:** https://console.cloud.google.com
- **Credentials Manager:** https://console.cloud.google.com/apis/credentials
- **API Library:** https://console.cloud.google.com/apis/library
- **OAuth 2.0 Playground:** https://developers.google.com/oauthplayground/

---

## 🎬 FLUXO COMPLETO (Resumo)

```
1. Google Cloud Console
   ↓
2. Criar/Habilitar OAuth Client
   ↓
3. Copiar Client ID + Secret
   ↓
4. Atualizar .env
   ↓
5. Reiniciar servidor backend
   ↓
6. Executar: node reautenticar-google.js
   ↓
7. Autorizar no navegador
   ↓
8. ✅ Conectado!
```

---

**💡 DICA:** Escolha o **Método 2** (criar novo cliente) se tiver pressa!

É mais rápido e evita problemas com clientes antigos/desabilitados.

---

**🎉 Após completar estes passos, sua conexão com Google estará funcionando!**

