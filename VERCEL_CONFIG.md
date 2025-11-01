# 🔐 Configuração da Vercel - Tattoo Scheduler

## ✅ Conta Vercel Identificada

**Conta:** tektrio  
**Username:** tektrio  
**User ID:** `rtM9iurLOt9qfzrNJT37qdjq`  
**Team ID:** `team_eLNtcS6sAAAJNYp8Btwx0SVv`  
**Email:** tektrio2023@gmail.com  
**URL da conta:** https://vercel.com/tektrio-a55b66fb

---

## 📋 Projetos Existentes na Vercel

Você já tem 4 projetos na Vercel:
1. **seldenink-cmik** - www.selden.ink
2. **seldenink-next** - seldenink-next.vercel.app
3. **tattoo-systems** - www.tattoo.systems
4. **empires-guide-frontend** - empiresguide.com

---

## 🔑 Como Criar um Token de Acesso (PASSO A PASSO MANUAL)

Como o formulário automatizado teve problemas, siga estes passos **MANUALMENTE** no navegador:

### 1. Acesse a página de Tokens

Já estamos nela: https://vercel.com/account/settings/tokens

### 2. Preencha o formulário:

- **TOKEN NAME:** `Tattoo Scheduler Deploy`
- **SCOPE:** Selecione "tektrio's projects" (dá acesso a todos os seus projetos)
- **EXPIRATION:** Selecione "No Expiration" (token não expira)

### 3. Clique no botão "Create"

### 4. **IMPORTANTE:** Copie o token imediatamente!

A Vercel mostrará o token **UMA ÚNICA VEZ**. Depois disso, você não poderá vê-lo novamente!

O token será algo como:
```
vercel_abc123xyz456...
```

---

## 📝 Onde Usar o Token da Vercel

### 1. **No arquivo `.env.local` (LOCAL)**

Adicione esta linha ao seu `.env.local`:

```env
VERCEL_TOKEN="seu_token_aqui"
```

### 2. **Nas Variáveis de Ambiente da Vercel (DEPLOY)**

Quando você fizer o deploy na Vercel, você NÃO precisa adicionar o `VERCEL_TOKEN` no dashboard da Vercel. Esse token é usado apenas para fazer deploy via CLI ou API.

---

## 🚀 Como Fazer Deploy na Vercel (2 OPÇÕES)

### OPÇÃO 1: Via Dashboard da Vercel (MAIS FÁCIL - RECOMENDADO)

1. **Faça commit e push do seu código para o GitHub:**
   ```bash
   cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
   git init
   git add .
   git commit -m "Initial commit: Tattoo Scheduler migração para Next.js + Supabase"
   git remote add origin https://github.com/seu-usuario/tattoo-scheduler.git
   git push -u origin main
   ```

2. **No Dashboard da Vercel:**
   - Acesse: https://vercel.com/new
   - Clique em "Import Project"
   - Selecione seu repositório GitHub
   - Configure as variáveis de ambiente (veja próxima seção)
   - Clique em "Deploy"

### OPÇÃO 2: Via CLI da Vercel (AVANÇADO)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
vercel --prod
```

---

## 🔧 Variáveis de Ambiente para Adicionar na Vercel

Quando você fizer o deploy, adicione estas variáveis de ambiente no dashboard da Vercel (Settings > Environment Variables):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://elicojhbvjprkpstdima.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls
DATABASE_URL=postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres

# Google OAuth (do seu mcp.json)
GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_GOOGLE_CLIENT_SECRET

# NextAuth (gere com: openssl rand -base64 32)
NEXTAUTH_SECRET=SEU_NEXTAUTH_SECRET_AQUI
NEXTAUTH_URL=https://seu-projeto.vercel.app

# Cron Job Secret (gere com: openssl rand -base64 32)
CRON_SECRET=SEU_CRON_SECRET_AQUI

# Caminho para uploads locais (não precisa na Vercel)
# LOCAL_UPLOADS_PATH=./public/uploads
```

⚠️ **ATENÇÃO:**
- **NÃO** adicione `VERCEL_TOKEN` nas variáveis de ambiente da Vercel
- `NEXTAUTH_URL` deve ser a URL do seu deploy (ex: `https://tattoo-scheduler.vercel.app`)

---

## 🔄 Configurar Google Cloud Console

Depois do deploy na Vercel, você precisa adicionar a URL da Vercel nas "Authorized redirect URIs" do Google Cloud Console:

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu projeto OAuth
3. Edite as credenciais
4. Em "Authorized redirect URIs", adicione:
   ```
   https://seu-projeto.vercel.app/api/auth/callback/google
   ```
5. Salve

---

## ⏰ Configurar Cron-job.org (OPCIONAL)

Se você quiser sincronizar o Google Calendar automaticamente a cada 5 minutos:

1. Acesse: https://cron-job.org
2. Crie uma nova conta (ou faça login)
3. Crie um novo Cron Job:
   - **Title:** Tattoo Scheduler - Sync Calendar
   - **URL:** `https://seu-projeto.vercel.app/api/cron/sync-calendar?cron_secret=SEU_CRON_SECRET`
   - **Schedule:** Every 5 minutes
   - **Request method:** GET
   - **Headers:** Adicione `x-vercel-cron-secret: SEU_CRON_SECRET`
4. Ative o job

---

## ✅ Próximos Passos

1. ⚠️ **AGORA:** Crie o token manualmente na página de Tokens da Vercel (aberta no navegador)
2. ✅ **DEPOIS:** Copie o token e salve em local seguro
3. ✅ **DEPOIS:** Crie o arquivo `.env.local` com todas as variáveis
4. ✅ **DEPOIS:** Faça commit e push para o GitHub
5. ✅ **DEPOIS:** Importe o projeto na Vercel
6. ✅ **DEPOIS:** Configure as variáveis de ambiente na Vercel
7. ✅ **DEPOIS:** Atualize o Google Cloud Console com a URL da Vercel
8. ✅ **DEPOIS:** Configure o cron-job.org (opcional)

---

## 📚 Links Úteis

- Dashboard da Vercel: https://vercel.com/tektrio-a55b66fb
- Tokens da Vercel: https://vercel.com/account/settings/tokens
- Criar novo projeto: https://vercel.com/new
- Documentação: https://vercel.com/docs

