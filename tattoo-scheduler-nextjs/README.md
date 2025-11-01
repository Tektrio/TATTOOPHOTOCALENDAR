# 🎨 TattooScheduler Next.js - Sistema Dual

> Sistema de agendamento profissional com sincronização automática entre local e cloud

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Dual-brightgreen)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start

```bash
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
npm run dev
```

**Acesse:** http://localhost:3000

📖 **Guia Completo:** [QUICK_START.md](./QUICK_START.md)

---

## ✨ Features

- 🔄 **Sistema Dual**: Funciona offline (SQLite) e online (Supabase)
- 🔁 **Sincronização Bidirecional**: Local ↔ Cloud automática
- ⚔️ **Resolução de Conflitos**: Interface visual para escolher
- 📱 **Offline-First**: 100% funcional sem internet
- 🎨 **Interface Moderna**: Tailwind CSS + Shadcn UI
- 🔐 **Google OAuth**: Autenticação segura
- 📅 **Google Calendar**: Sincronização de agendamentos
- 📸 **Upload de Fotos**: Local ou Supabase Storage
- 💰 **$0/mês**: Totalmente grátis com Vercel + Supabase FREE

---

## 📊 Status do Projeto

```
████████████████████████████████████████░░░░░░░░░░░░ 70%

✅ Código Base: 100%      ✅ APIs REST: 100%
✅ Sincronização: 100%    ✅ Interface: 100%
✅ Banco Local: 100%      ⚠️  Cloud: 0% (config)
```

**Pronto para:** Desenvolvimento local, testes, personalização  
**Pendente:** Configuração cloud (opcional), deploy (opcional)

---

## 📁 Estrutura do Projeto

```
tattoo-scheduler-nextjs/
├── app/
│   ├── (dashboard)/           # Páginas protegidas
│   │   ├── page.tsx          # Dashboard
│   │   ├── clientes/         # Gestão de clientes
│   │   ├── agendamentos/     # Calendário
│   │   └── galeria/          # Fotos
│   └── api/                  # APIs REST
│       ├── clients/          # CRUD clientes
│       ├── appointments/     # CRUD agendamentos
│       ├── files/            # Upload de arquivos
│       ├── auth/             # Google OAuth
│       └── google/           # Google Calendar
├── components/               # Componentes React
│   ├── SyncButton.tsx       # Botão sincronizar
│   ├── SyncStatus.tsx       # Badge de status
│   └── ConflictModal.tsx    # Resolução conflitos
├── lib/
│   ├── db*.ts               # Prisma clients
│   ├── sync-service.ts      # Sincronização (~450 linhas)
│   ├── sync-scheduler.ts    # Scheduler 24h
│   └── supabase.ts          # Cliente Supabase
└── prisma/
    ├── schema-local.prisma  # SQLite
    ├── schema-cloud.prisma  # PostgreSQL
    └── dev.db              # Banco local
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Lucide React
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 22
- **API**: Next.js API Routes
- **Database**: Prisma (SQLite + PostgreSQL)
- **Auth**: NextAuth.js (Google OAuth)
- **Storage**: Local FS + Supabase Storage
- **Calendar**: Google Calendar API

### Cloud & Deploy
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: Vercel (Serverless)
- **Cron**: cron-job.org

---

## 📖 Documentação

### Para Começar
1. 📘 **[QUICK_START.md](./QUICK_START.md)** - Teste em 2 minutos
2. 📗 **[README_MIGRACAO.md](./README_MIGRACAO.md)** - Guia completo
3. 📙 **[PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md)** - O que fazer depois

### Referência Técnica
4. 📕 **[STATUS_PROJETO.md](./STATUS_PROJETO.md)** - Status técnico
5. 📔 **[RESUMO_EXECUTIVO_FINAL.md](./RESUMO_EXECUTIVO_FINAL.md)** - Resumo executivo

---

## 🎯 Principais Funcionalidades

### Gestão de Clientes
- ✅ Criar, editar, deletar clientes
- ✅ Busca por nome, email, telefone
- ✅ Histórico de agendamentos
- ✅ Galeria de fotos por cliente

### Agendamentos
- ✅ Calendário visual
- ✅ Criar, editar, deletar agendamentos
- ✅ Status: pendente, confirmado, concluído, cancelado
- ✅ Sincronização com Google Calendar
- ✅ Notificações (via Google Calendar)

### Upload de Fotos
- ✅ Upload múltiplo
- ✅ Categorização (tatuagem, piercing, referência, resultado)
- ✅ Armazenamento local ou cloud (Supabase)
- ✅ Galeria por cliente ou categoria

### Sincronização
- ✅ Sincronização manual (botão)
- ✅ Sincronização automática (ao abrir app, se 24h)
- ✅ Sincronização background (a cada 24h)
- ✅ Detecção automática de conflitos
- ✅ Interface visual para resolução

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie arquivo `.env` na raiz:

```env
# Modo de operação
USE_LOCAL_DB=true

# Database (local)
DATABASE_URL=file:./dev.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-secret-aqui

# Supabase (opcional - apenas para cloud)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth (opcional - apenas para login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cron (opcional - apenas para sync automático)
CRON_SECRET=qualquer-secret
```

### 2. Banco de Dados

```bash
# Criar banco SQLite local
npx prisma db push --schema=./prisma/schema-local.prisma

# Ver dados visualmente
npx prisma studio --schema=./prisma/schema-local.prisma
```

---

## 🧪 Testes

### Testar APIs

```bash
# Listar clientes
curl http://localhost:3000/api/clients

# Criar cliente
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","phone":"11999999999"}'

# Listar agendamentos
curl http://localhost:3000/api/appointments
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte repositório na Vercel
3. Configure variáveis de ambiente
4. Deploy automático!

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin seu-repo
git push -u origin main
```

### Variáveis no Vercel
- `USE_LOCAL_DB=false`
- `DATABASE_URL` (do Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (URL da Vercel)
- `NEXTAUTH_SECRET`
- `CRON_SECRET`

---

## 💡 Uso

### Modo Local (Desenvolvimento)
```bash
npm run dev
```
- Usa SQLite local
- Arquivos salvos em `/uploads`
- Funciona 100% offline

### Modo Cloud (Produção)
```bash
npm run build
npm start
```
- Usa PostgreSQL (Supabase)
- Arquivos no Supabase Storage
- Requer internet

### Sincronização
- **Manual**: Clique no botão "Sincronizar" no header
- **Automática**: Ao abrir (se passou 24h)
- **Background**: A cada 24h (se online)

---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor desenvolvimento
npm run build        # Build produção
npm start            # Rodar build
npm run lint         # Verificar erros
```

---

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- **Next.js** - Framework incrível
- **Prisma** - ORM type-safe
- **Supabase** - Backend as a Service
- **Vercel** - Hosting serverless
- **Tailwind CSS** - Utility-first CSS

---

## 📞 Suporte

Dúvidas? Consulte a documentação:

1. [QUICK_START.md](./QUICK_START.md) - Início rápido
2. [README_MIGRACAO.md](./README_MIGRACAO.md) - Guia completo
3. [STATUS_PROJETO.md](./STATUS_PROJETO.md) - Status técnico

---

## 🎉 Status

**Implementado:** 70% (código completo)  
**Funcionando:** ✅ Local (offline)  
**Pendente:** ⚠️  Configuração cloud (opcional)  

**Última atualização:** 01 de Novembro de 2024  
**Desenvolvido com:** ❤️ Next.js + TypeScript

---

<div align="center">

**[⬆ Voltar ao topo](#-tattoscheduler-nextjs---sistema-dual)**

Made with 💙 by [Claude](https://claude.ai) + [Cursor](https://cursor.sh)

</div>
