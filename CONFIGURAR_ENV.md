# 🔐 Configurar Variáveis de Ambiente

## ⚠️ AÇÃO NECESSÁRIA

Crie manualmente o arquivo `.env.local` na raiz do projeto Next.js:

```bash
/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs/.env.local
```

## 📝 Conteúdo do Arquivo

Copie e cole exatamente este conteúdo:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://elicojhbvjprkpstdima.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls

# Database (Supabase PostgreSQL para Cloud)
DATABASE_URL=postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres

# Google OAuth (do mcp.json existente)
GOOGLE_CLIENT_ID=1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=8f9d2e1c4b5a6d3e7f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w

# Cron Job Secret
CRON_SECRET=c9a8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8

# Environment
USE_LOCAL_DB=false
NODE_ENV=development

# Local Storage Path (usado quando USE_LOCAL_DB=true)
LOCAL_UPLOADS_PATH=./uploads
```

## 🚀 Como Criar

### Opção 1: Via Terminal
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
cat > .env.local << 'EOF'
# Copie todo o conteúdo acima aqui
EOF
```

### Opção 2: Via Editor
1. Abra VS Code ou seu editor favorito
2. Crie novo arquivo: `.env.local`
3. Cole o conteúdo acima
4. Salve

## ✅ Verificação

Depois de criar, verifique se o arquivo foi criado corretamente:

```bash
ls -la /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs/.env.local
```

Deve mostrar o arquivo.

