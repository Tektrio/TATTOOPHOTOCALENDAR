# 🚀 TattooScheduler Next.js - Sistema Dual (Local + Cloud)

## ✅ O QUE JÁ FOI FEITO

### 1. Projeto Base
- ✅ Next.js 15 criado com TypeScript, Tailwind CSS e App Router
- ✅ Dependências instaladas: Prisma, Supabase, NextAuth, date-fns, etc.

### 2. Schemas Prisma Dual
- ✅ `prisma/schema-local.prisma` - SQLite para desenvolvimento offline
- ✅ `prisma/schema-cloud.prisma` - PostgreSQL para produção (Supabase)
- ✅ Clientes Prisma gerados para ambos

### 3. Bibliotecas Criadas
- ✅ `lib/db-local.ts` - Cliente Prisma SQLite
- ✅ `lib/db-cloud.ts` - Cliente Prisma PostgreSQL
- ✅ `lib/db.ts` - Seletor automático de banco
- ✅ `lib/supabase.ts` - Cliente Supabase com funções de Storage
- ✅ `lib/utils.ts` - Utilitários gerais (cn, formatDate, generateHash)
- ✅ `lib/sync-service.ts` - Serviço de sincronização bidirecional (~450 linhas)
- ✅ `lib/sync-scheduler.ts` - Scheduler (manual + ao abrir + 24h background)

### 4. APIs REST Criadas
- ✅ `app/api/clients/route.ts` - GET (listar) e POST (criar) clientes
- ✅ `app/api/clients/[id]/route.ts` - GET, PUT, DELETE cliente individual

---

## 🔧 O QUE FALTA FAZER

### 1. Completar APIs REST
- [ ] `app/api/appointments/route.ts` - CRUD de agendamentos
- [ ] `app/api/appointments/[id]/route.ts` - CRUD individual
- [ ] `app/api/files/upload/route.ts` - Upload para Supabase Storage
- [ ] `app/api/auth/[...nextauth]/route.ts` - NextAuth com Google
- [ ] `app/api/google/calendar/sync/route.ts` - Sincronização Google Calendar
- [ ] `app/api/cron/sync-calendar/route.ts` - Endpoint para cron externo

### 2. Componentes React
- [ ] Criar estrutura de components/
- [ ] Migrar componentes principais do sistema atual
- [ ] Criar componentes de sincronização:
  - `components/SyncButton.tsx`
  - `components/SyncStatus.tsx`
  - `components/ConflictModal.tsx`

### 3. Páginas Next.js
- [ ] `app/(dashboard)/page.tsx` - Dashboard principal
- [ ] `app/(dashboard)/clientes/page.tsx` - Lista de clientes
- [ ] `app/(dashboard)/agendamentos/page.tsx` - Calendário
- [ ] `app/(dashboard)/galeria/page.tsx` - Galeria de fotos
- [ ] `app/auth/signin/page.tsx` - Página de login

### 4. Configuração Inicial do Banco
- [ ] Criar banco SQLite local
  ```bash
  cd tattoo-scheduler-nextjs
  npx prisma db push --schema=./prisma/schema-local.prisma
  ```

### 5. Configuração Supabase (quando tiver conta)
- [ ] Criar projeto no Supabase
- [ ] Pegar chaves (URL, ANON_KEY, SERVICE_ROLE_KEY, DATABASE_URL)
- [ ] Atualizar .env
- [ ] Criar tabelas:
  ```bash
  npx prisma db push --schema=./prisma/schema-cloud.prisma
  ```
- [ ] Criar bucket 'uploads' no Supabase Storage

---

## 🏃 COMO CONTINUAR

### Passo 1: Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto `tattoo-scheduler-nextjs`:

```env
# Modo de operação (true = usa SQLite local)
USE_LOCAL_DB=true

# Supabase (preencher depois de criar conta)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres

# Google OAuth (copiar do sistema atual ou criar novo)
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-seu-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar-com-openssl-rand-base64-32

# Cron (criar secret qualquer)
CRON_SECRET=seu-secret-para-validar-cron
```

### Passo 2: Criar Banco Local (SQLite)

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
npx prisma db push --schema=./prisma/schema-local.prisma
```

Isso cria o arquivo `prisma/dev.db` com todas as tabelas.

### Passo 3: Testar Servidor Local

```bash
npm run dev
```

Acesse: http://localhost:3000

### Passo 4: Criar Conta Supabase (Gratuita)

1. Acesse https://supabase.com
2. Crie conta com GitHub
3. Crie novo projeto:
   - Name: `tattoo-scheduler`
   - Database Password: (crie uma senha forte)
   - Region: `South America (São Paulo)`
   - Pricing Plan: **FREE**
4. Aguarde ~2 minutos
5. Vá em **Settings → API** e copie:
   - Project URL
   - anon/public key
   - service_role key (secret!)
6. Vá em **Settings → Database** e copie:
   - Connection string (substitua `[YOUR-PASSWORD]`)

### Passo 5: Atualizar .env com Chaves Supabase

Cole as chaves no `.env`.

### Passo 6: Criar Tabelas no Supabase

```bash
npx prisma db push --schema=./prisma/schema-cloud.prisma
```

### Passo 7: Criar Bucket de Storage

1. No Supabase Dashboard, vá em **Storage**
2. Clique **Create bucket**
3. Nome: `uploads`
4. Public bucket: ✅ SIM
5. Create

---

## 📁 ESTRUTURA DO PROJETO

```
tattoo-scheduler-nextjs/
├── app/
│   ├── api/                          # APIs REST
│   │   ├── clients/                  # ✅ CRUD Clientes
│   │   ├── appointments/             # 🔄 Criar CRUD
│   │   ├── files/upload/             # 🔄 Criar upload
│   │   ├── auth/[...nextauth]/       # 🔄 Criar NextAuth
│   │   ├── google/calendar/sync/     # 🔄 Criar sync
│   │   └── cron/sync-calendar/       # 🔄 Criar cron
│   ├── (dashboard)/                  # 🔄 Criar páginas
│   ├── auth/signin/                  # 🔄 Criar login
│   ├── layout.tsx                    # Layout raiz
│   └── page.tsx                      # Landing page
├── components/                       # 🔄 Criar componentes
├── lib/
│   ├── db-local.ts                   # ✅ Cliente Prisma SQLite
│   ├── db-cloud.ts                   # ✅ Cliente Prisma PostgreSQL
│   ├── db.ts                         # ✅ Seletor automático
│   ├── supabase.ts                   # ✅ Cliente Supabase
│   ├── sync-service.ts               # ✅ Serviço de sincronização
│   ├── sync-scheduler.ts             # ✅ Scheduler 24h
│   └── utils.ts                      # ✅ Utilitários
├── prisma/
│   ├── schema-local.prisma           # ✅ Schema SQLite
│   ├── schema-cloud.prisma           # ✅ Schema PostgreSQL
│   └── dev.db                        # Banco SQLite (criar)
├── .env                              # Variáveis de ambiente
└── package.json
```

---

## 🔄 COMO FUNCIONA A SINCRONIZAÇÃO

### 3 Gatilhos Automáticos

1. **Manual** - Botão "Sincronizar" na interface
2. **Ao Abrir** - Se passou 24h desde última sync
3. **Background** - A cada 24h automaticamente

### Fluxo de Sincronização

```
1. LOCAL → CLOUD
   - Busca registros novos/editados localmente
   - Envia para Supabase
   - Marca como sincronizado

2. CLOUD → LOCAL
   - Busca registros novos/editados no cloud
   - Salva localmente
   - Verifica conflitos

3. CONFLITOS
   - Se mesmo registro editado em 2 lugares
   - Mostra modal para usuário decidir
   - Opções: manter local, manter cloud, ou ambos
```

---

## 🆘 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev                           # Inicia servidor dev (localhost:3000)

# Prisma
npx prisma studio                     # Abre interface visual do banco
npx prisma generate --schema=...     # Regenera cliente Prisma
npx prisma db push --schema=...      # Aplica schema no banco

# Build
npm run build                         # Build para produção
npm start                             # Roda build de produção

# Lint
npm run lint                          # Verifica erros
```

---

## 📝 PRÓXIMAS TAREFAS PRIORITÁRIAS

1. **Completar APIs de appointments** (~30 min)
2. **Criar API de upload** (~20 min)
3. **Configurar NextAuth** (~15 min)
4. **Criar componentes de sincronização** (~1h)
5. **Criar páginas principais** (~2h)
6. **Testes locais** (~1h)
7. **Deploy Vercel** (~30 min)

**Tempo estimado total**: ~5-6 horas de trabalho focado

---

## 💡 DICAS

### Trabalhar Offline
- Use `USE_LOCAL_DB=true` no .env
- Rode `npm run dev`
- Tudo funciona com SQLite local
- Arquivos salvos em `/uploads` local

### Sincronizar com Cloud
- Clique no botão "Sincronizar" na interface
- Ou aguarde sincronização automática (24h)
- Resolva conflitos se aparecerem

### Deploy na Vercel
1. Commit código no GitHub
2. Conecte repositório na Vercel
3. Configure variáveis de ambiente
4. Deploy automático!

---

## 🐛 TROUBLESHOOTING

### "Database not found"
```bash
npx prisma db push --schema=./prisma/schema-local.prisma
```

### "Prisma Client not generated"
```bash
npx prisma generate --schema=./prisma/schema-local.prisma
npx prisma generate --schema=./prisma/schema-cloud.prisma
```

### "Module not found '@/lib/...'"
Reinicie o servidor TypeScript no VSCode (Cmd+Shift+P → "Restart TS Server")

---

**Status**: Sistema 40% completo - Estrutura base e sincronização prontas! 🎉
**Próximo**: Completar APIs REST e criar interface visual.

