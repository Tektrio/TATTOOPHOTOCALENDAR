# 🚨 RESOLVER ERRO 403 - GUIA RÁPIDO

## ⚡ Solução em 5 Passos (2 minutos)

### 📍 Passo 1: Acesse o Google Cloud Console

Clique neste link (ou copie e cole no navegador):

🔗 **https://console.cloud.google.com/apis/credentials/consent?project=polar-program-476423-i0**

> ☝️ Este link já abre diretamente na página correta do seu projeto!

---

### 📍 Passo 2: Faça Login

Use a conta **que criou o projeto no Google Cloud**
(provavelmente a conta que você usou para configurar o OAuth)

---

### 📍 Passo 3: Adicione Seu Email

Na página **"Tela de permissão OAuth"**:

1. Role a página até encontrar a seção **"Usuários de teste"**

2. Clique no botão **"+ ADD USERS"** (ou "+ ADICIONAR USUÁRIOS")

3. Digite **SEU EMAIL DO GOOGLE** que você usa para fazer login na aplicação

4. Clique em **"SAVE"** (ou "SALVAR")

---

### 📍 Passo 4: Aguarde (Opcional)

A mudança é instantânea, mas para garantir:
- Aguarde 2-3 minutos
- Ou limpe o cache do navegador:
  - **Windows:** Ctrl + Shift + Delete
  - **Mac:** Cmd + Shift + Delete

---

### 📍 Passo 5: Teste na Aplicação

1. Abra ou recarregue a aplicação: http://localhost:5173

2. Clique no botão **"Conectar"** do Google Drive

3. Faça login com o Google

4. Autorize as permissões

5. ✅ **Pronto!** Deve funcionar agora!

---

## 🎯 Informações do Seu Projeto

Essas informações são do seu `google-credentials.json`:

| Item | Valor |
|------|-------|
| **Project ID** | `polar-program-476423-i0` |
| **Client ID** | `1073557089506-5hk15...` |
| **Redirect URI** | `http://localhost:3001/auth/google/callback` |

---

## 📊 O Que Está Acontecendo?

```
┌─────────────────────────────────────────────────────────┐
│  ANTES (❌ Erro 403)                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Seu App OAuth (Modo TESTE)                            │
│  ├─ Testadores autorizados: [ ]  ← VAZIO!             │
│  └─ Você tenta fazer login: ❌ BLOQUEADO               │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DEPOIS (✅ Funciona!)                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Seu App OAuth (Modo TESTE)                            │
│  ├─ Testadores autorizados: [seu-email@gmail.com]     │
│  └─ Você tenta fazer login: ✅ AUTORIZADO!             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Dicas Importantes

### ✅ Pode adicionar até 100 emails
Perfeito para você e sua equipe!

### ✅ Não precisa publicar o app
Modo de teste funciona perfeitamente para uso pessoal

### ✅ Sem custo adicional
Tudo gratuito no modo de teste

### ✅ Rápido
As mudanças entram em vigor em ~2 minutos

---

## 🆘 Ainda Não Funcionou?

### Verifique estas 3 coisas:

1. **Email correto?**
   - Use o MESMO email que você tenta fazer login na aplicação
   - Exemplo: se faz login com `seunome@gmail.com`, adicione `seunome@gmail.com`

2. **Aguardou 2-3 minutos?**
   - As mudanças do Google Cloud podem levar um tempinho
   - Limpe o cache do navegador enquanto espera

3. **Conta correta?**
   - Certifique-se de que fez login na conta que CRIOU o projeto OAuth
   - Não é a conta que você quer usar na aplicação, é a que configurou o Google Cloud!

---

## 🔍 Verificar se Deu Certo

Depois de adicionar seu email, você pode verificar:

```bash
# Abra o terminal e execute:
cd agenda-hibrida-v2
node verificar-google-config.js
```

Isso mostrará o status das suas credenciais.

---

## 📸 Visual de Como Fica

Quando você acessar o Google Cloud Console, vai ver algo assim:

```
╔════════════════════════════════════════════════════════╗
║  Tela de permissão OAuth                               ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Status de publicação: 🟡 Em teste                     ║
║                                                        ║
║  ┌──────────────────────────────────────────────┐    ║
║  │  Usuários de teste                           │    ║
║  │                                              │    ║
║  │  [+ ADD USERS]  ← CLIQUE AQUI!              │    ║
║  │                                              │    ║
║  │  Digite seu email: ___________________      │    ║
║  │                                              │    ║
║  │  [SAVE]                                      │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## ✨ Pronto!

Depois de adicionar seu email como testador, a aplicação funcionará perfeitamente!

**Lembre-se:** O Google Drive é OPCIONAL. O sistema funciona 100% local sem ele.

---

**🕒 Tempo estimado:** 2-3 minutos
**🎯 Dificuldade:** Muito Fácil
**💰 Custo:** R$ 0,00

---

**Criado em:** 01 de Novembro de 2025  
**Válido para:** Windows 10/11, Google Cloud Console


