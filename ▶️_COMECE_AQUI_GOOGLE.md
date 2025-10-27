# ▶️ COMECE AQUI - Google Drive & Calendar

## 🎉 Parabéns! Sua conta Google está configurada!

**Email**: photocalendar25@gmail.com  
**Projeto**: My First Project  
**Status**: Pronto para uso ✅

---

## 🚀 OPÇÃO RÁPIDA (Automático)

```bash
cd agenda-hibrida-v2
./configurar-google-automatico.sh
```

**O script vai:**
1. Procurar o arquivo de credenciais
2. Extrair o Client Secret automaticamente
3. Atualizar seu arquivo .env
4. Mostrar os próximos passos

---

## 📋 OPÇÃO MANUAL (Passo a Passo)

### 1️⃣ Encontrar o Arquivo JSON

Procure na pasta **Downloads** por:
```
client_secret_1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com.json
```

**Não encontrou?** Baixe novamente:
👉 https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0

---

### 2️⃣ Pegar o Client Secret

Abra o arquivo JSON e procure por:
```json
"client_secret": "GOCSPX-xxxxxxxx"
```

Copie apenas o valor: `GOCSPX-xxxxxxxx`

---

### 3️⃣ Configurar

```bash
cd agenda-hibrida-v2
node configurar-novas-credenciais-google.js
```

Cole o Client Secret quando pedir.

---

### 4️⃣ Autenticar

```bash
node reautenticar-google.js
```

**Importante:** Faça login com **photocalendar25@gmail.com**

---

### 5️⃣ Testar

```bash
node test-gdrive-connection.js
```

---

## ⚡ Comandos Úteis

### Ver se tem o arquivo JSON:
```bash
ls ~/Downloads/client_secret_*.json
```

### Copiar Client Secret automaticamente:
```bash
cat ~/Downloads/client_secret_*.json | grep client_secret | cut -d'"' -f4
```

### Ver configuração atual:
```bash
cd agenda-hibrida-v2
grep GOOGLE .env
```

---

## 📚 Documentação Completa

- 📋 **Índice Completo**: `📋_INDICE_COMPLETO_GOOGLE_API.md`
- 🚀 **Início Rápido**: `🚀_INICIO_RAPIDO_GOOGLE_API.md`
- 🔐 **Credenciais**: `🔐_CREDENCIAIS_GOOGLE_API.md`
- 🔍 **Onde Achar Client Secret**: `agenda-hibrida-v2/ONDE_ENCONTRAR_CLIENT_SECRET.md`

---

## ❓ Dúvidas?

### Não sei minha senha do Gmail
- Acesse: https://myaccount.google.com/
- Recupere a senha de: photocalendar25@gmail.com

### Erro "App not verified"
- É NORMAL! Clique em "Avançado" → "Continuar"

### Não encontro o arquivo JSON
- Baixe em: https://console.cloud.google.com/auth/clients?project=polar-program-476423-i0
- Clique em "TATTOO_PHOTO_CALENDAR_Desktop"
- Clique no ícone de download

---

## ✅ Quando Tudo Estiver OK

Você verá:
```
✅ Google Drive conectado
✅ Google Calendar sincronizando
✅ Tokens salvos com sucesso
```

---

## 🎯 Resumo do Processo

```
1. Encontrar JSON em Downloads
   ↓
2. Extrair Client Secret
   ↓
3. Executar configurar-novas-credenciais-google.js
   ↓
4. Executar reautenticar-google.js
   ↓
5. Login com photocalendar25@gmail.com
   ↓
6. Testar com test-gdrive-connection.js
   ↓
7. PRONTO! 🎉
```

---

**🔧 Script Automático:** `./configurar-google-automatico.sh`  
**📝 Manual:** `node configurar-novas-credenciais-google.js`  
**🔐 Credenciais:** No arquivo JSON (Downloads)  
**📧 Email:** photocalendar25@gmail.com

---

**Criado em**: 26/10/2025 às 20:50  
**Tempo estimado**: 5 minutos ⏱️  
**Dificuldade**: Fácil 🟢

