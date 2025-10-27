# 🔐 Ativar 2FA e Baixar Credenciais - Guia Completo

## ⚠️ Situação Atual

O Google Cloud agora exige autenticação de 2 fatores (2FA/MFA) para acessar o console.

**Mas não se preocupe!** Vou te guiar em tudo.

---

## 🎯 O Que Você Precisa Fazer

### Opção 1: Ativar 2FA e Baixar (RECOMENDADO)
1. Ativar 2FA na sua conta Google
2. Aguardar 60 segundos
3. Baixar arquivo JSON
4. Configurar projeto

### Opção 2: Configurar Manualmente (ALTERNATIVA)
- Usar Client ID que já temos
- Você me fornece o Client Secret
- Eu configuro tudo para você

---

## 📱 OPÇÃO 1: Ativar 2FA (5 minutos)

### Passo 1: Configurar 2FA

**Acesse:** https://myaccount.google.com/signinoptions/two-step-verification

**OU clique no botão no console:**
- Link direto: https://console.cloud.google.com/enable-mfa

**Login:**
- Email: photocalendar25@gmail.com
- Senha: (a que você criou)

### Passo 2: Escolher Método de 2FA

Você pode escolher:

**A) App Authenticator (Recomendado)**
- Google Authenticator (iOS/Android)
- Microsoft Authenticator
- Authy

**B) SMS**
- Receber código por SMS

**C) Chamada Telefônica**
- Receber código por ligação

### Passo 3: Ativar

1. Escolha o método
2. Siga as instruções na tela
3. Confirme o código de teste
4. Aguarde 60 segundos

### Passo 4: Voltar ao Console

Depois de ativar:
1. Aguarde 1 minuto
2. Acesse: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
3. Faça login novamente
4. Baixe o arquivo JSON

---

## 💡 OPÇÃO 2: Configurar Manualmente (AGORA)

Se você já baixou o arquivo JSON antes, ou se consegue ver o Client Secret em outro lugar:

### Informações que Temos:

**✅ Client ID:**
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

**⏳ Client Secret:**
- Está no arquivo JSON baixado anteriormente
- OU você pode me fornecer manualmente

### Como Configurar:

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2

# Executar script de configuração
node configurar-novas-credenciais-google.js
```

**Quando pedir o Client Secret, cole o valor que você tem.**

---

## 🔍 Encontrar Client Secret Sem Console

### Se você salvou o arquivo JSON:

```bash
# Procurar arquivo
find ~ -name "client_secret*.json" -type f 2>/dev/null

# Extrair Client Secret
cat ~/Downloads/client_secret*.json | grep client_secret | cut -d'"' -f4
```

### Se você tem acesso a emails:

O Google pode ter enviado um email com as credenciais ou um link para download.

---

## 📋 Informações Completas do Projeto

Para você ter tudo anotado:

### Conta Google
- **Email:** photocalendar25@gmail.com
- **Senha:** (a que você criou)

### Projeto Google Cloud
- **Nome:** My First Project
- **ID:** polar-program-476423-i0

### OAuth Client
- **Nome:** TATTOO_PHOTO_CALENDAR_Desktop
- **Tipo:** Desktop app
- **Client ID:** 1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com

### APIs Habilitadas
- ✅ Google Drive API
- ✅ Google Calendar API

### Usuário de Teste
- ✅ photocalendar25@gmail.com

---

## 🚀 Depois de Ter as Credenciais

### 1. Configurar .env

```bash
cd agenda-hibrida-v2

# Opção A: Automático
./configurar-google-automatico.sh

# Opção B: Manual
node configurar-novas-credenciais-google.js
```

### 2. Autenticar

```bash
node reautenticar-google.js
```

### 3. Testar

```bash
node test-gdrive-connection.js
node test-sync-system.js
```

---

## 📱 Guia Rápido: Ativar 2FA com Google Authenticator

### No Celular:

1. **Baixar app:**
   - iOS: App Store → "Google Authenticator"
   - Android: Play Store → "Google Authenticator"

2. **Configurar:**
   - Abrir app
   - Tocar em "+"
   - Escanear QR code da tela

3. **Confirmar:**
   - App gera código de 6 dígitos
   - Inserir código na página do Google
   - Confirmar

### No Computador:

1. Acesse: https://myaccount.google.com/signinoptions/two-step-verification
2. Login: photocalendar25@gmail.com
3. Clique "Começar"
4. Escolha "App Authenticator"
5. Escaneie QR code
6. Digite código do app
7. Confirme

---

## ⏱️ Linha do Tempo

```
Agora (5 min)
  ↓
Ativar 2FA
  ↓
Aguardar 60 segundos
  ↓
Acessar Console (2 min)
  ↓
Baixar JSON (30 seg)
  ↓
Configurar Projeto (2 min)
  ↓
Autenticar (2 min)
  ↓
Testar (1 min)
  ↓
PRONTO! 🎉
```

**Total: ~12 minutos**

---

## 🆘 Problemas Comuns

### "Não tenho celular para 2FA"
**Solução:** Use SMS ou chamada telefônica

### "Não quero ativar 2FA agora"
**Solução:** Use Opção 2 (configuração manual) se tiver o Client Secret

### "Perdi o arquivo JSON"
**Solução:** Ative 2FA e baixe novamente do console

### "Não lembro a senha"
**Solução:** Recupere em https://accounts.google.com/signin/recovery

---

## 📞 Links Importantes

### Ativar 2FA:
https://myaccount.google.com/signinoptions/two-step-verification

### Console (após ativar 2FA):
https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0

### Recuperar Senha:
https://accounts.google.com/signin/recovery

### Suporte Google:
https://support.google.com/accounts/answer/185839

---

## ✅ Checklist

### Antes de Começar:
- [ ] Tenho acesso ao email photocalendar25@gmail.com
- [ ] Sei a senha da conta
- [ ] Tenho celular OU outro método para 2FA

### Ativar 2FA:
- [ ] Acessei configurações de segurança
- [ ] Escolhi método de 2FA
- [ ] Configurei e testei
- [ ] Confirmei ativação
- [ ] Aguardei 60 segundos

### Baixar Credenciais:
- [ ] Acessei o console
- [ ] Encontrei TATTOO_PHOTO_CALENDAR_Desktop
- [ ] Baixei arquivo JSON
- [ ] Arquivo em ~/Downloads/

### Configurar Projeto:
- [ ] Executei script de configuração
- [ ] .env atualizado
- [ ] Executei autenticação OAuth
- [ ] Tokens salvos
- [ ] Testes passaram

---

## 🎯 Próximos Passos Imediatos

**AGORA:** Ativar 2FA
```
https://myaccount.google.com/signinoptions/two-step-verification
```

**DEPOIS:** Baixar Credenciais
```
https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
```

**FINALMENTE:** Configurar Projeto
```bash
cd agenda-hibrida-v2
./configurar-google-automatico.sh
```

---

**🔐 Segurança:** 2FA protege sua conta  
**⏱️ Tempo:** ~12 minutos total  
**✅ Resultado:** Projeto 100% configurado

---

**Criado em:** 26/10/2025 às 21:00  
**Atualizado:** Após detectar requisito de 2FA  
**Status:** Aguardando ativação de 2FA pelo usuário

