# 🚀 QUICK START - Teste em 2 Minutos!

## ⚡ TESTE AGORA (Copie e Cole)

Abra o terminal e execute:

```bash
# 1. Entre na pasta do projeto
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs

# 2. Configure variáveis de ambiente mínimas
cat > .env << 'EOF'
# Banco de dados (SQLite local)
DATABASE_URL=file:./dev.db
USE_LOCAL_DB=true

# NextAuth (desenvolvimento)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=desenvolvimento-local-teste-12345

# Supabase (vazio por enquanto)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth (vazio por enquanto)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cron (qualquer valor)
CRON_SECRET=teste-desenvolvimento
NODE_ENV=development
EOF

# 3. Inicie o servidor
npm run dev
```

## ✅ Pronto!

Acesse no navegador: **http://localhost:3000**

---

## 🧪 TESTE AS APIS

### 1. Listar Clientes
```bash
curl http://localhost:3000/api/clients
```

### 2. Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@test.com",
    "phone": "11999999999"
  }'
```

### 3. Listar Agendamentos
```bash
curl http://localhost:3000/api/appointments
```

### 4. Criar Agendamento
```bash
# Primeiro pegue o ID do cliente criado acima
# Depois use esse ID aqui:
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "startDatetime": "2024-11-10T14:00:00",
    "endDatetime": "2024-11-10T16:00:00",
    "title": "Sessão Tatuagem",
    "status": "pending"
  }'
```

---

## 📊 VER BANCO DE DADOS VISUAL

```bash
npx prisma studio --schema=./prisma/schema-local.prisma
```

Isso abre uma interface visual em **http://localhost:5555** onde você pode ver e editar os dados.

---

## 🔍 PÁGINAS DISPONÍVEIS

- **Home**: http://localhost:3000/
- **Dashboard**: http://localhost:3000/dashboard
- **Clientes**: http://localhost:3000/clientes
- **Agendamentos**: http://localhost:3000/agendamentos
- **Galeria**: http://localhost:3000/galeria

---

## 🎨 O QUE VOCÊ VAI VER

### 1. Landing Page
- Design moderno
- Botões de acesso
- Lista de features

### 2. Dashboard
- Cards de estatísticas
- Botão de sincronização (header)
- Badge de status
- Ações rápidas

### 3. Páginas Internas
- Interface limpa
- Botões de ação
- Placeholders para listas vazias

---

## ❓ TROUBLESHOOTING

### Erro: "Port 3000 already in use"
```bash
# Mate o processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou use outra porta
PORT=3001 npm run dev
```

### Erro: "Cannot find module '@prisma/client-local'"
```bash
npx prisma generate --schema=./prisma/schema-local.prisma
```

### Erro: "Database not found"
```bash
npx prisma db push --schema=./prisma/schema-local.prisma
```

### Erro: "NEXTAUTH_SECRET is not defined"
O arquivo .env não foi criado. Execute o passo 2 novamente.

---

## 📝 PRÓXIMOS PASSOS (Depois de Testar)

1. ✅ Testou localmente? Ótimo!
2. 📖 Leia `README_MIGRACAO.md` para entender tudo
3. ☁️  Crie conta Supabase (quando quiser cloud)
4. 🔑 Configure chaves Google OAuth (quando quiser login)
5. 🚀 Deploy na Vercel (quando quiser online)

---

## 💡 DICAS

### Desenvolvimento
- Use `console.log()` para debug
- O terminal mostra todos os logs
- O navegador mostra erros no console (F12)
- As alterações de código recarregam automaticamente

### Banco de Dados
- SQLite local está em `prisma/dev.db`
- Use Prisma Studio para visualizar dados
- Backup: apenas copie o arquivo `dev.db`

### Sincronização
- Funciona apenas com chaves Supabase configuradas
- Por enquanto, tudo é local
- Botão de sincronização aparece no header

---

## 🎯 RESUMO

```bash
# Apenas 3 comandos:
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
# (criar .env conforme acima)
npm run dev
```

**Pronto para usar!** 🎉

---

**Tempo estimado:** 2 minutos  
**Dificuldade:** Fácil  
**Pré-requisitos:** Node.js instalado (já tem)  
**Custo:** $0  

---

**Divirta-se! 🚀**

