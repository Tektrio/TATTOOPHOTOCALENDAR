# 🔑 Credenciais do Supabase - Projeto tattoo-scheduler

## ✅ Conta Criada com Sucesso!

**Organização**: Tektrio's Org (Free Plan)  
**Projeto**: tattoo-scheduler  
**Project ID**: elicojhbvjprkpstdima  
**Região**: Americas (us-east-1)  

---

## 🔐 Chaves de API

### NEXT_PUBLIC_SUPABASE_URL
```
https://elicojhbvjprkpstdima.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY (Chave Pública - Segura para cliente)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE
```

### SUPABASE_SERVICE_ROLE_KEY (Chave Secreta - NUNCA expor no cliente!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls
```

---

## 🗄️ Banco de Dados PostgreSQL

### DATABASE_URL (para Prisma)
```
postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres
```

### Senha do Banco de Dados
```
TattooScheduler2025!@#$SecureDB
```

**⚠️ IMPORTANTE**: Guarde esta senha em local seguro! Ela é necessária para:
- Conectar via pgAdmin, DBeaver ou outras ferramentas
- Configurar o Prisma
- Fazer backups manuais

---

## 📦 Storage

**Status**: ⚠️ Bucket 'uploads' precisa ser criado manualmente

### Como Criar o Bucket:
1. Acesse: https://supabase.com/dashboard/project/elicojhbvjprkpstdima/storage/buckets
2. Clique em "New bucket"
3. Nome: `uploads`
4. **IMPORTANTE**: Marque como **Público** (Public bucket = Yes)
5. Clique em "Create bucket"

---

## 🔄 Próximos Passos

### 1. Criar Bucket 'uploads' no Supabase Storage ✅
- URL: https://supabase.com/dashboard/project/elicojhbvjprkpstdima/storage/buckets
- Nome: `uploads`
- Tipo: Público

### 2. Adicionar Chaves ao Projeto Next.js
Adicione estas variáveis ao arquivo `.env` ou `.env.local` no projeto Next.js:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://elicojhbvjprkpstdima.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDYwODksImV4cCI6MjA3NzUyMjA4OX0.BJAwGZr2hCaqDIrhxJNNPuVSA12Se8yMEGHBJcHznZE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWNvamhidmpwcmtwc3RkaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NjA4OSwiZXhwIjoyMDc3NTIyMDg5fQ.3xbntWnTdVzQatNvFEjlX5Yaja2F36iRcGKN4Lonmls

# Database (para Prisma)
DATABASE_URL=postgresql://postgres:TattooScheduler2025!@#$SecureDB@db.elicojhbvjprkpstdima.supabase.co:5432/postgres
```

### 3. Executar Migração do Banco
No projeto Next.js, execute:
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
npx prisma db push --schema=./prisma/schema-cloud.prisma
```

### 4. Criar Conta Vercel
- Acesse: https://vercel.com/signup
- Faça login com GitHub
- Conecte o repositório do projeto
- Adicione as mesmas variáveis de ambiente no dashboard da Vercel

---

## 📚 Links Úteis

- **Dashboard Supabase**: https://supabase.com/dashboard/project/elicojhbvjprkpstdima
- **Storage**: https://supabase.com/dashboard/project/elicojhbvjprkpstdima/storage/buckets
- **Database**: https://supabase.com/dashboard/project/elicojhbvjprkpstdima/editor
- **API Keys**: https://supabase.com/dashboard/project/elicojhbvjprkpstdima/settings/api-keys
- **Documentação**: https://supabase.com/docs

---

## ⚠️ Segurança

- **NUNCA** compartilhe a `SERVICE_ROLE_KEY` publicamente
- **NUNCA** faça commit das chaves no Git (use `.env.local` e adicione ao `.gitignore`)
- A `ANON_KEY` é segura para usar no frontend (desde que tenha RLS configurado)
- A senha do banco deve ser forte e única

---

**Data de Criação**: $(date)  
**Criado automaticamente pelo assistente**

