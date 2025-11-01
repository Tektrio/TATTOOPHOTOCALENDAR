# 🔐 Credenciais da Vercel - Tattoo Scheduler

## ✅ Conta Vercel

**Email:** tektrio2023@gmail.com  
**Username:** tektrio  
**User ID:** `rtM9iurLOt9qfzrNJT37qdjq`  
**Team ID:** `team_eLNtcS6sAAAJNYp8Btwx0SVv`  
**URL da conta:** https://vercel.com/tektrio-a55b66fb

---

## 🔑 Token de Acesso

**Nome do Token:** Tattoo Scheduler Deploy  
**Criado em:** Hoje (Nunca expira)  
**Escopo:** tektrio's projects  

### Token:
```
1X7ZMUn51wb0SCWzJKxncb77
```

⚠️ **IMPORTANTE:** Este token dá acesso completo aos seus projetos na Vercel. **Nunca compartilhe este token publicamente!**

---

## 📝 Onde Usar Este Token

### 1. **Para Deploy via CLI da Vercel:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login com o token
vercel login --token 1X7ZMUn51wb0SCWzJKxncb77

# Ou exportar como variável de ambiente
export VERCEL_TOKEN="1X7ZMUn51wb0SCWzJKxncb77"

# Deploy
cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/tattoo-scheduler-nextjs
vercel --prod
```

### 2. **Para CI/CD (GitHub Actions, etc.):**

Se você quiser automatizar o deploy, adicione este token como secret no GitHub Actions:

```yaml
name: Deploy to Vercel
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: team_eLNtcS6sAAAJNYp8Btwx0SVv
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🚀 Método Recomendado: Deploy via Dashboard (SEM TOKEN)

**Para o Tattoo Scheduler, recomendo usar o Dashboard da Vercel, que NÃO precisa do token!**

1. Faça push do código para o GitHub
2. Vá em: https://vercel.com/new
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

✅ **Mais fácil e mais seguro!**

---

## ⚠️ Tokens Existentes (NÃO DELETE!)

Você tem outros tokens na sua conta Vercel:

1. **"Website, Login with Google"** (Jun 11) - Para login com Google
2. **"Vercel Dashboard from Chrome on macOS (current)"** (8m ago) - Sessão atual do navegador

**Recomendação:** Mantenha todos. Eles são usados para diferentes propósitos e não atrapalham.

---

## 🔄 Como Revogar o Token (se necessário)

Se você suspeitar que o token foi comprometido:

1. Acesse: https://vercel.com/account/settings/tokens
2. Encontre "Tattoo Scheduler Deploy"
3. Clique nos 3 pontinhos (...)
4. Clique em "Revoke"
5. Crie um novo token

---

## 📚 Links Úteis

- Dashboard da Vercel: https://vercel.com/tektrio-a55b66fb
- Tokens da Vercel: https://vercel.com/account/settings/tokens
- Criar novo projeto: https://vercel.com/new
- Documentação: https://vercel.com/docs

