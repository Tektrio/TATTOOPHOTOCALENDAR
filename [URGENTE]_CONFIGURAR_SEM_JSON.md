# ⚡ Configurar SEM Arquivo JSON - Método Rápido

## 🎯 Situação

Você NÃO consegue baixar o arquivo JSON agora (precisa ativar 2FA).

**MAS** podemos configurar mesmo assim se você tiver o **Client Secret**!

---

## 💡 Solução Rápida

Vou te dar o Client ID (que já temos) e você me dá o Client Secret (se tiver).

---

## 📋 O Que Temos

### ✅ Client ID (PRONTO)
```
1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
```

### ⏳ Client Secret (VOCÊ PRECISA)

**Formato:** `GOCSPX-xxxxxxxxxxxxxxxxxx`

**Onde encontrar:**

1. **Se você já baixou antes:**
   ```bash
   cat ~/Downloads/client_secret*.json | grep client_secret
   ```

2. **Se você anotou em algum lugar:**
   - Procure suas anotações
   - Arquivos de texto
   - Emails

3. **Se você tem outro navegador logado:**
   - Tente baixar por lá

---

## 🚀 Configurar Agora (COM Client Secret)

### Passo 1: Preparar Comando

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
```

### Passo 2: Editar .env Manualmente

```bash
nano .env
```

ou

```bash
open -e .env
```

### Passo 3: Alterar Estas Linhas

Procure e substitua:

```env
GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

**Substitua `SEU_CLIENT_SECRET_AQUI` pelo valor real!**

### Passo 4: Salvar e Fechar
- Ctrl+O (salvar)
- Enter (confirmar)
- Ctrl+X (sair)

---

## ✅ Depois de Configurar

```bash
# 1. Autenticar
node reautenticar-google.js

# 2. Fazer login com
# Email: photocalendar25@gmail.com

# 3. Testar
node test-gdrive-connection.js
```

---

## 🔍 Como Saber Se Funcionou

Se ver isso, está OK:

```
✅ Google Drive conectado
✅ Tokens salvos com sucesso
✅ Autenticação bem-sucedida
```

---

## 📝 Template do .env

Copie e cole, substituindo o CLIENT_SECRET:

```env
# ⚙️ Configuração do Servidor
PORT=3001
NODE_ENV=development

# 🔑 Configuração do Google OAuth
GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=COLE_SEU_CLIENT_SECRET_AQUI
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
GOOGLE_CALENDAR_ID=primary

# 🌍 Configuração de Timezone
TIMEZONE=America/Sao_Paulo

# 📥 Configuração de Importação
DEFAULT_APPOINTMENT_DURATION=60
MAX_UPLOAD_SIZE_MB=20

# 📁 Configuração de Armazenamento
STORAGE_MODE=hybrid
CLIENTS_FOLDER=./uploads

# 🔄 Sincronização
SYNC_ENABLED=true
SYNC_AUTO=true
SYNC_INTERVAL=300000
```

---

## 🆘 Não Tenho o Client Secret

### Opção A: Ativar 2FA e Baixar
Veja: `🔐_ATIVAR_2FA_E_BAIXAR_CREDENCIAIS.md`

### Opção B: Criar Novo Cliente OAuth
(Só depois de ativar 2FA)

### Opção C: Usar Credenciais Antigas
Se você tinha credenciais antigas funcionando:

```bash
# Ver credenciais atuais
cd agenda-hibrida-v2
grep GOOGLE .env
```

**Se funcionavam antes, continue usando!**

---

## 💬 Me Forneça o Client Secret

Se você encontrar o Client Secret, me envie que eu te ajudo a configurar!

**Exemplo:**
```
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45
```

---

## 🔗 Links Úteis

**Minhas Credenciais Antigas:**
```bash
cd agenda-hibrida-v2
cat .env | grep GOOGLE
```

**Procurar JSON:**
```bash
find ~ -name "*client_secret*.json" -o -name "*credentials*.json" 2>/dev/null
```

**Procurar em Backups:**
```bash
find ~ -name "*.env*" -type f 2>/dev/null | grep -i tattoo
```

---

**⚡ Método Rápido**  
**⏱️ Tempo:** 2 minutos  
**✅ Funciona:** Se você tiver o Client Secret

---

**Próximo:** `▶️_COMECE_AQUI_GOOGLE.md` (depois de configurar)

