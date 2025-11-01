# 🎯 PRÓXIMOS PASSOS - Tattoo Scheduler

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código 100% implementado (Next.js + Prisma + Supabase + Sincronização)
- ✅ Conta Supabase criada e configurada
- ✅ Bucket 'uploads' no Supabase criado
- ✅ Conta Vercel identificada
- ✅ **Token da Vercel criado: `1X7ZMUn51wb0SCWzJKxncb77`**

---

## 🚀 PRÓXIMOS 4 PASSOS (30 minutos)

### PASSO 1: Criar arquivo `.env.local` (5 min) ⚠️

Na raiz do projeto `tattoo-scheduler-nextjs`, crie um arquivo chamado `.env.local` e cole:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://elicojhbvjprkpstdima.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls"
DATABASE_URL="postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres"

# Google OAuth (do seu mcp.json - copie do arquivo ~/.cursor/mcp.json)
GOOGLE_CLIENT_ID="SEU_CLIENT_ID_AQUI"
GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET_AQUI"

# NextAuth (gere um secret executando: openssl rand -base64 32)
NEXTAUTH_SECRET="EXECUTE_openssl_rand_-base64_32_E_COLE_AQUI"
NEXTAUTH_URL="http://localhost:3000"

# Cron Job Secret (gere outro: openssl rand -base64 32)
CRON_SECRET="EXECUTE_openssl_rand_-base64_32_E_COLE_AQUI"

# Caminho para uploads locais
LOCAL_UPLOADS_PATH="./public/uploads"

# Vercel Token (opcional - só se for usar CLI)
VERCEL_TOKEN="1X7ZMUn51wb0SCWzJKxncb77"
```

**Execute estes comandos no terminal para gerar os secrets:**
```bash
# Gerar NEXTAUTH_SECRET
openssl rand -base64 32

# Gerar CRON_SECRET
openssl rand -base64 32
```

Copie os resultados e cole no `.env.local` nos lugares indicados.

---

### PASSO 2: Executar `prisma db push` (2 min) ⏳

⚠️ **Aguarde 10-15 minutos** desde que criou o projeto Supabase (banco precisa provisionar).

Depois, execute no terminal:

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs

# Criar tabelas no Supabase
npx prisma db push --schema=./prisma/schema-cloud.prisma
```

Se der erro de conexão, aguarde mais alguns minutos e tente novamente.

---

### PASSO 3: Testar Localmente (5 min) 🧪

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Rodar o projeto
npm run dev
```

Acesse: http://localhost:3000

Teste:
- ✅ Página inicial carrega
- ✅ Dashboard abre
- ✅ Botão de sincronização aparece

---

### PASSO 4: Fazer Deploy na Vercel (15 min) 🚀

#### 4.1. Commit e Push para GitHub

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs

# Inicializar Git
git init
git add .
git commit -m "feat: Migração completa para Next.js + Supabase + Sincronização dual"

# Criar repositório no GitHub e fazer push
# (Se ainda não tiver, crie em: https://github.com/new)
git remote add origin https://github.com/SEU_USUARIO/tattoo-scheduler.git
git branch -M main
git push -u origin main
```

#### 4.2. Importar na Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import Project"
3. Selecione seu repositório GitHub `tattoo-scheduler`
4. Em "Environment Variables", adicione **TODAS** estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://elicojhbvjprkpstdima.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls
DATABASE_URL=postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres
GOOGLE_CLIENT_ID=SEU_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
NEXTAUTH_SECRET=SEU_NEXTAUTH_SECRET
NEXTAUTH_URL=https://seu-projeto.vercel.app
CRON_SECRET=SEU_CRON_SECRET
```

5. Clique em "Deploy"
6. Aguarde o deploy finalizar (2-3 minutos)

#### 4.3. Atualizar NEXTAUTH_URL

Após o deploy:
1. Copie a URL do deploy (ex: `https://tattoo-scheduler-abc123.vercel.app`)
2. Na Vercel, vá em Settings > Environment Variables
3. Edite `NEXTAUTH_URL` e cole a URL do deploy
4. Clique em "Redeploy" para aplicar a mudança

---

## 🔧 PASSO 5: Configurar Google Cloud Console (5 min)

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione seu projeto OAuth
3. Edite as credenciais
4. Em "Authorized redirect URIs", adicione:
   ```
   https://sua-url-da-vercel.vercel.app/api/auth/callback/google
   ```
5. Salve

---

## ⏰ PASSO 6 (OPCIONAL): Configurar Cron-job.org

Se quiser sincronizar o Google Calendar automaticamente:

1. Acesse: https://cron-job.org
2. Crie uma conta
3. Crie um novo Cron Job:
   - **Title:** Tattoo Scheduler - Sync Calendar
   - **URL:** `https://sua-url-da-vercel.vercel.app/api/cron/sync-calendar`
   - **Schedule:** Every 5 minutes
   - **Request method:** GET
   - **Headers:** `x-vercel-cron-secret: SEU_CRON_SECRET`
4. Ative o job

---

## 📊 CHECKLIST COMPLETO

```
✅ Código implementado
✅ Supabase configurado
✅ Vercel token criado
⬜ .env.local criado
⬜ prisma db push executado
⬜ Teste local (npm run dev)
⬜ Commit e push para GitHub
⬜ Deploy na Vercel
⬜ Google Cloud Console atualizado
⬜ Cron-job.org configurado (opcional)
```

---

## 🎉 Depois de Tudo Pronto

Você terá:
- 🏠 Sistema rodando **offline** no seu PC
- ☁️ Sistema rodando **online** na Vercel
- 🔄 Sincronização bidirecional entre local e nuvem
- 📅 Integração com Google Calendar
- 💾 Supabase para banco de dados e storage
- 💰 **Custo total: R$ 0,00/mês** (planos gratuitos)

---

## 📚 Arquivos de Referência

- **VERCEL_CREDENTIALS.md** - Token e credenciais da Vercel
- **SUPABASE_CREDENTIALS.md** - Chaves do Supabase
- **VERCEL_CONFIG.md** - Guia completo da Vercel
- **🎯_COMECE_AQUI.md** - Guia geral do projeto

---

**Comece pelo PASSO 1 e siga em ordem! 🚀**

