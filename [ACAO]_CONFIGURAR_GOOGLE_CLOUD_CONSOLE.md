# 🎯 AÇÃO NECESSÁRIA: Configurar Google Cloud Console

## ⚠️ IMPORTANTE: Este passo é OBRIGATÓRIO para conectar o Google Drive

Para que o sistema de múltiplas contas Google Drive funcione, você precisa adicionar o **Redirect URI** correto no Google Cloud Console.

---

## 📋 O que você precisa fazer

### Passo 1: Acessar o Google Cloud Console

Abra este link no navegador:

```
https://console.cloud.google.com/apis/credentials?project=polar-program-476423-i0
```

### Passo 2: Fazer Login

- Use a conta: **photocalendar25@gmail.com**
- Digite a senha desta conta

### Passo 3: Encontrar as Credenciais OAuth

Na página de credenciais, você verá uma lista de "OAuth 2.0 Client IDs".

Procure pela credencial que termina com: **`eq6opdvp`**

O nome completo é:
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

### Passo 4: Editar a Credencial

1. Clique no **nome da credencial** ou no **ícone de lápis** ✏️ para editar
2. Role até a seção **"Authorized redirect URIs"** (URIs de redirecionamento autorizados)

### Passo 5: Adicionar o Redirect URI

Na seção "Authorized redirect URIs", adicione:

```
http://localhost:3001/auth/google/callback
```

**IMPORTANTE:** 
- Cole exatamente como está acima
- Não adicione espaços antes ou depois
- Certifique-se que começa com `http://` (não `https://`)
- Porta é `3001` (não `3000` ou outra)

### Passo 6: Salvar

1. Clique no botão **"SAVE"** ou **"SALVAR"** no final da página
2. Aguarde a mensagem de confirmação

---

## ✅ Como saber se funcionou?

Após salvar no Google Cloud Console:

1. Acesse o sistema: http://localhost:5173
2. Vá para a aba **"Dados Local"**
3. Clique em **"Adicionar Google Drive"**
4. Digite um nome (ex: "Principal")
5. Clique em **"Conectar"**
6. Uma janela popup abrirá para você fazer login no Google
7. Após autorizar, a janela fechará automaticamente
8. Você verá a mensagem: **"✅ Google Drive conectado com sucesso!"**

---

## 🎨 Sistema Multi-Conta

Após configurar, você poderá adicionar **múltiplas contas Google Drive**:

- 🔵 **Conta Azul** - Principal
- 🟢 **Conta Verde** - Backup
- 🟡 **Conta Amarela** - Compartilhada
- 🟣 **Conta Roxa** - Projeto específico

Cada conta terá:
- ✅ Tokens OAuth independentes
- ✅ Identificação visual única (cor + emoji)
- ✅ Gerenciamento individual (ativar/desativar/remover)
- ✅ Sincronização seletiva de arquivos

---

## 🆘 Problemas Comuns

### Erro: "redirect_uri_mismatch"

**Solução:** O URI não está configurado corretamente no Google Cloud Console.

- Verifique se adicionou exatamente: `http://localhost:3001/auth/google/callback`
- Confira se salvou as alterações
- Aguarde 1-2 minutos e tente novamente

### Erro: "access_denied" ou "App not verified"

**Solução:** O app está em modo de teste.

**Opção 1 - Adicionar como testador:**
1. No Google Cloud Console, vá em "OAuth consent screen"
2. Role até "Test users"
3. Clique em "ADD USERS"
4. Adicione o email que deseja usar (ex: seu email pessoal)
5. Salve

**Opção 2 - Continuar mesmo assim:**
1. Na tela de autenticação do Google, clique em "Avançado"
2. Clique em "Ir para [nome do app] (não seguro)"
3. Autorize o acesso

### Erro: "disabled_client"

**Solução:** O OAuth Client ID está desabilitado.

1. No Google Cloud Console, encontre a credencial
2. Verifique se há uma opção "Enable"
3. Clique para habilitar
4. Salve

---

## 📚 Links Úteis

- **Credenciais:** https://console.cloud.google.com/apis/credentials?project=polar-program-476423-i0
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent?project=polar-program-476423-i0
- **Documentação OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2

---

## 🎬 Resumo Visual

```
1. Acessar Google Cloud Console
   ↓
2. Login com photocalendar25@gmail.com
   ↓
3. Encontrar credencial que termina com eq6opdvp
   ↓
4. Editar credencial
   ↓
5. Adicionar: http://localhost:3001/auth/google/callback
   ↓
6. Salvar
   ↓
7. Testar no sistema (Dados Local → Adicionar Google Drive)
   ↓
8. ✅ FUNCIONANDO!
```

---

## 💡 Dica

Depois de configurar a primeira conta, adicionar mais contas é muito rápido:

1. Clique em "Adicionar Google Drive"
2. Digite um nome
3. Clique em "Conectar"
4. Faça login com outra conta Google
5. Pronto! ✅

---

**Tempo estimado:** 3-5 minutos
**Dificuldade:** Fácil
**Frequência:** Apenas uma vez (configuração única)

---

**Criado em:** 29/10/2025
**Arquivo:** [ACAO]_CONFIGURAR_GOOGLE_CLOUD_CONSOLE.md

