# 🔽 BAIXAR CREDENCIAIS - Passo a Passo Visual

## 🎯 VOCÊ ESTÁ AQUI

O Google Cloud está configurado, mas precisamos baixar o arquivo de credenciais.

---

## 📥 PASSO 1: Abrir Link e Fazer Login

**👉 Clique neste link:** 

https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0&authuser=2

**Faça login com:**
- Email: **photocalendar25@gmail.com**
- Senha: (a que você criou)

---

## 📥 PASSO 2: Baixar o JSON

Na página que abrir, você verá uma tabela com:

```
┌─────────────────────────────────────────────────────┐
│ OAuth 2.0 Client IDs                                │
├─────────────────────────────────────────────────────┤
│ Name: TATTOO_PHOTO_CALENDAR_Desktop                 │
│ Type: Desktop                                       │
│ Client ID: 1073557089506-5hk...                     │
│                                                      │
│ [✏️ Edit] [📥 Download] [🗑️ Delete]                 │
└─────────────────────────────────────────────────────┘
```

**Clique no ícone de DOWNLOAD** (📥) ou clique no nome do cliente e depois em "Download JSON"

---

## 📁 PASSO 3: Localizar o Arquivo

O arquivo será baixado em:
```
~/Downloads/client_secret_1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com.json
```

Ou procure por qualquer arquivo que comece com `client_secret_` na pasta Downloads.

---

## ⚡ PASSO 4: Executar Configuração Automática

Depois de baixar o arquivo, execute:

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
./configurar-google-automatico.sh
```

**OU** use os comandos rápidos:

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR
./⚡_COMANDOS_RAPIDOS.sh configurar
```

---

## 🔍 VERIFICAR SE BAIXOU

Execute este comando para verificar:

```bash
ls -lh ~/Downloads/client_secret*.json
```

Se aparecer algo como:
```
-rw-r--r--  1 user  staff   567B Oct 26 20:55 client_secret_1073557089506-...json
```

**✅ Perfeito! O arquivo foi baixado.**

---

## 🆘 Não Consigo Baixar?

### Opção 1: Copiar Client Secret Manualmente

1. Na página do Google Cloud, clique em **TATTOO_PHOTO_CALENDAR_Desktop**
2. O **Client Secret** aparecerá na tela
3. Clique no ícone de copiar (📋)
4. Execute:

```bash
cd agenda-hibrida-v2
node configurar-novas-credenciais-google.js
```

5. Cole o Client Secret quando pedir

---

### Opção 2: Link Alternativo

Se o link acima não funcionar, tente:

1. Acesse: https://console.cloud.google.com/
2. Selecione: **My First Project**
3. Menu: **APIs & Services** → **Credentials**
4. Procure: **TATTOO_PHOTO_CALENDAR_Desktop**
5. Clique em Download (📥)

---

## 📸 O Que Você Deve Ver

Quando clicar no link, você verá uma tela assim:

```
╔══════════════════════════════════════════════════╗
║  Google Cloud Console                            ║
╠══════════════════════════════════════════════════╣
║  Google Auth Platform → Clients                  ║
║                                                  ║
║  OAuth 2.0 Client IDs (1)                       ║
║  ┌────────────────────────────────────────────┐ ║
║  │ ✓ TATTOO_PHOTO_CALENDAR_Desktop            │ ║
║  │   Created: Oct 26, 2025                    │ ║
║  │   Type: Desktop                            │ ║
║  │   Client ID: 1073557089506-5hk...          │ ║
║  │   [Actions: ✏️ 📥 🗑️]                      │ ║
║  └────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════╝
```

---

## ✅ Depois de Baixar

1. ✅ Arquivo baixado
2. ⏳ Executar: `./configurar-google-automatico.sh`
3. ⏳ Autenticar: `node reautenticar-google.js`
4. ⏳ Testar: `node test-gdrive-connection.js`

---

## 🔗 Links Diretos

**Download Credenciais:**
https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0&authuser=2

**Painel Principal:**
https://console.cloud.google.com/auth/overview?project=polar-program-476423-i0

**Gerenciar Projeto:**
https://console.cloud.google.com/?project=polar-program-476423-i0

---

**⏱️ Tempo estimado: 2 minutos**  
**📧 Login: photocalendar25@gmail.com**  
**🔑 Client ID: 1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com**

---

## 🎯 Próximo Arquivo

Depois de baixar, leia: **▶️_COMECE_AQUI_GOOGLE.md**

