# 📋 PRÓXIMOS PASSOS - Migração TattooScheduler

## 🎯 SITUAÇÃO ATUAL

### ✅ Já Implementado (40% completo)
1. Projeto Next.js 15 configurado
2. Schemas Prisma dual (SQLite + PostgreSQL)
3. Serviço de sincronização completo
4. Scheduler automático (24h)
5. API de clientes (CRUD completo)
6. Bibliotecas helper (db, supabase, utils)

---

## 🔥 TAREFAS URGENTES (Fazer Primeiro)

### 1. Criar Banco Local (5 minutos)
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
npx prisma db push --schema=./prisma/schema-local.prisma
```

Isso cria o SQLite local para você poder testar.

### 2. Completar APIs REST (1-2 horas)

#### A. API de Agendamentos
Criar `app/api/appointments/route.ts`:
- GET (listar agendamentos)
- POST (criar agendamento)

Criar `app/api/appointments/[id]/route.ts`:
- GET (buscar um)
- PUT (atualizar)
- DELETE (deletar)

#### B. API de Upload
Criar `app/api/files/upload/route.ts`:
- POST (fazer upload para Supabase Storage)

#### C. NextAuth
Criar `app/api/auth/[...nextauth]/route.ts`:
- Configurar Google Provider
- Gerenciar tokens OAuth

### 3. Componentes de Sincronização (1 hora)

#### A. `components/SyncButton.tsx`
```tsx
// Botão "Sincronizar Agora"
// - Mostra loading
// - Chama syncService
// - Mostra última sync
```

#### B. `components/SyncStatus.tsx`
```tsx
// Badge de status
// - ✅ Sincronizado
// - ⚠️ X não sincronizados
// - 📴 Offline
```

#### C. `components/ConflictModal.tsx`
```tsx
// Modal para resolver conflitos
// - Mostra versão local vs cloud
// - Botões: manter local, cloud, ou ambos
// - Navega entre múltiplos conflitos
```

### 4. Página Principal (30 minutos)

Criar `app/(dashboard)/page.tsx`:
- Dashboard com cards de estatísticas
- Botão de sincronização no header
- Badge de status

---

## 📅 CRONOGRAMA SUGERIDO

### Dia 1 (2-3 horas)
- ✅ Setup projeto (já feito)
- ✅ Schemas e bibliotecas (já feito)
- [ ] Completar APIs REST
- [ ] Testar APIs com Postman/Thunder Client

### Dia 2 (2-3 horas)
- [ ] Componentes de sincronização
- [ ] Página dashboard
- [ ] Página de clientes

### Dia 3 (2-3 horas)
- [ ] Página de agendamentos
- [ ] Galeria de fotos
- [ ] Testes locais completos

### Dia 4 (1-2 horas)
- [ ] Criar conta Supabase
- [ ] Configurar variáveis ambiente
- [ ] Deploy Vercel
- [ ] Testes em produção

---

## 🔑 CHAVES QUE VOCÊ PRECISA

### 1. Supabase (Gratuito)
Quando criar conta em https://supabase.com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
DATABASE_URL=postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres
```

### 2. Google OAuth (Você já tem!)
Copiar do sistema atual (`agenda-hibrida-v2/.env`):

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

### 3. NextAuth Secret (Gerar)
```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

```env
NEXTAUTH_SECRET=resultado-aqui
```

---

## 🚀 COMANDOS PARA COPIAR E COLAR

### Iniciar Desenvolvimento
```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
npm run dev
```

### Criar Banco Local
```bash
npx prisma db push --schema=./prisma/schema-local.prisma
```

### Ver Banco Visual
```bash
npx prisma studio --schema=./prisma/schema-local.prisma
```

### Testar API
```bash
# GET clientes
curl http://localhost:3000/api/clients

# POST criar cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","phone":"11999999999","email":"joao@email.com"}'
```

---

## 📁 ARQUIVOS QUE FALTAM CRIAR

### APIs
- [ ] `app/api/appointments/route.ts`
- [ ] `app/api/appointments/[id]/route.ts`
- [ ] `app/api/files/upload/route.ts`
- [ ] `app/api/auth/[...nextauth]/route.ts`
- [ ] `app/api/google/calendar/sync/route.ts`
- [ ] `app/api/cron/sync-calendar/route.ts`

### Componentes
- [ ] `components/SyncButton.tsx`
- [ ] `components/SyncStatus.tsx`
- [ ] `components/ConflictModal.tsx`
- [ ] `components/ClientList.tsx`
- [ ] `components/ClientForm.tsx`
- [ ] `components/AppointmentCalendar.tsx`

### Páginas
- [ ] `app/(dashboard)/layout.tsx`
- [ ] `app/(dashboard)/page.tsx`
- [ ] `app/(dashboard)/clientes/page.tsx`
- [ ] `app/(dashboard)/agendamentos/page.tsx`
- [ ] `app/(dashboard)/galeria/page.tsx`
- [ ] `app/auth/signin/page.tsx`

---

## 🆘 SE TIVER DÚVIDAS

### Problema: Erro ao importar Prisma
**Solução**: Regenerar clientes
```bash
npx prisma generate --schema=./prisma/schema-local.prisma
npx prisma generate --schema=./prisma/schema-cloud.prisma
```

### Problema: Tipo BigInt no TypeScript
**Solução**: Já configurado no schema para usar Int

### Problema: CORS no desenvolvimento
**Solução**: Next.js já lida com isso automaticamente

---

## 💪 VOCÊ ESTÁ AQUI

```
[████████████░░░░░░░░░░░░] 40% completo

✅ Estrutura base
✅ Schemas e DB
✅ Serviço de sincronização
✅ API de clientes
🔄 APIs restantes
🔄 Componentes
🔄 Páginas
🔄 Deploy
```

---

## 🎯 META FINAL

Ter um sistema funcionando:
- ✅ Local (offline com SQLite)
- ✅ Cloud (online com Supabase)
- ✅ Sincronização a cada 24h
- ✅ Resolução de conflitos
- ✅ Deploy na Vercel
- ✅ $0/mês de custo

**Você está no caminho certo! Continue! 💪**

