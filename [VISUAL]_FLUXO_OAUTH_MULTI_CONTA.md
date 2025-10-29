# 🎨 Fluxo Visual: OAuth Multi-Conta Google Drive

## 🔄 Como Funciona Agora (Sistema Corrigido)

```
┌─────────────────────────────────────────────────────────┐
│  🖥️  FRONTEND - Aba "Dados Local"                       │
└─────────────────────────────────────────────────────────┘
           │
           │ 1. Usuário clica "Adicionar Google Drive"
           ↓
┌─────────────────────────────────────────────────────────┐
│  📝 Modal: Digite nome da conta (ex: "Principal")       │
│  🎨 Preview: 🔵 Azul (cor automática)                   │
│  [Cancelar]  [Conectar]                                 │
└─────────────────────────────────────────────────────────┘
           │
           │ 2. Clica "Conectar"
           ↓
┌─────────────────────────────────────────────────────────┐
│  🔌 POST /api/google-accounts/add                       │
│  Body: { name: "Principal" }                            │
└─────────────────────────────────────────────────────────┘
           │
           │ 3. Backend processa
           ↓
┌─────────────────────────────────────────────────────────┐
│  🗄️  BACKEND - googleAccountsRouter.js                  │
│                                                          │
│  • Cria destino pendente no banco                       │
│  • Gera OAuth URL do Google                             │
│  • Retorna: { authUrl, destinationId }                  │
└─────────────────────────────────────────────────────────┘
           │
           │ 4. Frontend recebe authUrl
           ↓
┌─────────────────────────────────────────────────────────┐
│  🪟  window.open(authUrl, 'popup', ...)                 │
│  Nova janela popup abre                                 │
└─────────────────────────────────────────────────────────┘
           │
           │ 5. Usuário vê tela do Google
           ↓
┌─────────────────────────────────────────────────────────┐
│  🔐 GOOGLE OAUTH                                        │
│                                                          │
│  [  Fazer login  ]                                      │
│  Email: _______________                                 │
│  Senha: _______________                                 │
│                                                          │
│  Permissões solicitadas:                                │
│  ✓ Ver e gerenciar arquivos do Drive                   │
│                                                          │
│  [Cancelar]  [Permitir]                                 │
└─────────────────────────────────────────────────────────┘
           │
           │ 6. Usuário clica "Permitir"
           ↓
┌─────────────────────────────────────────────────────────┐
│  ↩️  Google redireciona para:                           │
│  http://localhost:3001/auth/google/callback?code=XXX    │
└─────────────────────────────────────────────────────────┘
           │
           │ 7. Backend recebe callback
           ↓
┌─────────────────────────────────────────────────────────┐
│  🗄️  GET /auth/google/callback                          │
│                                                          │
│  • Extrai código OAuth da query string                 │
│  • Envia HTML com JavaScript                           │
│  • JavaScript executa: window.opener.postMessage()      │
└─────────────────────────────────────────────────────────┘
           │
           │ 8. postMessage envia código
           ↓
┌─────────────────────────────────────────────────────────┐
│  📨 postMessage({                                       │
│    type: 'google-oauth',                                │
│    code: 'ABC123...'                                    │
│  }, '*')                                                │
└─────────────────────────────────────────────────────────┘
           │
           │ 9. Janela popup fecha
           ↓
┌─────────────────────────────────────────────────────────┐
│  🪟  window.close() → popup fecha automaticamente       │
└─────────────────────────────────────────────────────────┘
           │
           │ 10. Frontend recebe mensagem
           ↓
┌─────────────────────────────────────────────────────────┐
│  👂 useEffect listener em AddGoogleAccountModal.jsx     │
│                                                          │
│  window.addEventListener('message', (event) => {        │
│    if (event.data.type === 'google-oauth') {           │
│      // Processa código...                             │
│    }                                                    │
│  })                                                     │
└─────────────────────────────────────────────────────────┘
           │
           │ 11. Frontend completa OAuth
           ↓
┌─────────────────────────────────────────────────────────┐
│  🔌 POST /api/google-accounts/callback                  │
│  Body: { code: 'ABC123...', destinationId: 1 }         │
└─────────────────────────────────────────────────────────┘
           │
           │ 12. Backend troca código por tokens
           ↓
┌─────────────────────────────────────────────────────────┐
│  🗄️  BACKEND - googleDriveMultiAccountService.js        │
│                                                          │
│  • oauth2Client.getToken(code)                          │
│  • Obtém: access_token, refresh_token                   │
│  • Busca info do usuário (email, nome, quota)          │
│  • Salva tokens no banco:                              │
│    UPDATE sync_destinations SET config = JSON          │
│    WHERE id = destinationId                            │
└─────────────────────────────────────────────────────────┘
           │
           │ 13. Retorna sucesso
           ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ Response: {                                         │
│    success: true,                                       │
│    accountId: 1,                                        │
│    userInfo: {                                          │
│      email: "usuario@gmail.com",                        │
│      displayName: "Nome do Usuário"                     │
│    }                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
           │
           │ 14. Frontend mostra sucesso
           ↓
┌─────────────────────────────────────────────────────────┐
│  🎊 toast.success("Conta conectada com sucesso!")       │
│  • Limpa localStorage                                   │
│  • Fecha modal                                          │
│  • Recarrega lista de contas                           │
└─────────────────────────────────────────────────────────┘
           │
           │ 15. Lista atualizada
           ↓
┌─────────────────────────────────────────────────────────┐
│  📋 Aba "Dados Local" - Seção Destinos                  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🔵 Principal                                      │ │
│  │ usuario@gmail.com                                 │ │
│  │ ✓ Conectado • 0 arquivos                          │ │
│  │ [Testar] [Desativar] [Remover]                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  [+ Adicionar Google Drive] [+ Adicionar QNAP]          │
└─────────────────────────────────────────────────────────┘
           │
           │ 16. Pronto para sincronizar!
           ↓
┌─────────────────────────────────────────────────────────┐
│  🎉 SISTEMA PRONTO!                                     │
│                                                          │
│  Agora você pode:                                       │
│  • Adicionar mais contas (repete processo)              │
│  • Escanear pasta local                                 │
│  • Sincronizar arquivos                                 │
│  • Gerenciar contas                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Interface Visual - Estados das Contas

### Conta não conectada (pendente)
```
┌─────────────────────────────┐
│ 🔵 Principal                │
│ ⏳ Aguardando autenticação   │
│ [Conectar]                  │
└─────────────────────────────┘
```

### Conta conectada (ativa)
```
┌─────────────────────────────┐
│ 🔵 Principal                │
│ usuario@gmail.com           │
│ ✓ Conectado • 5 arquivos    │
│ [Testar] [❚❚] [🗑️]         │
└─────────────────────────────┘
```

### Conta desativada
```
┌─────────────────────────────┐
│ 🔵 Principal                │
│ usuario@gmail.com           │
│ ⊗ Desativado                │
│ [Testar] [▶] [🗑️]          │
└─────────────────────────────┘
```

---

## 🔢 Múltiplas Contas - Exemplo Visual

```
┌───────────────────────────────────────────────────────────┐
│  Destinos de Sincronização                               │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │ 🔵 Principal    │  │ 🟢 Backup      │  │ 🟡 Compart.│ │
│  │ luiz@gmail.com │  │ backup@g.com   │  │ team@g.com │ │
│  │ ✓ 15 arquivos  │  │ ✓ 15 arquivos  │  │ ✓ 8 arqs   │ │
│  │ [Testar] [❚❚]  │  │ [Testar] [❚❚]  │  │ [Testar] ▶ │ │
│  └────────────────┘  └────────────────┘  └────────────┘ │
│                                                           │
│  [+ Adicionar Google Drive] [+ Adicionar QNAP]            │
└───────────────────────────────────────────────────────────┘
```

---

## 📊 Sincronização de Arquivo - Exemplo

### Selecionando destinos
```
┌─────────────────────────────────────────┐
│  Sincronizar: foto_cliente.jpg          │
├─────────────────────────────────────────┤
│                                         │
│  Selecione os destinos:                 │
│                                         │
│  ☑ 🔵 Principal (luiz@gmail.com)        │
│  ☑ 🟢 Backup (backup@gmail.com)         │
│  ☐ 🟡 Compartilhado (desativado)        │
│                                         │
│  [Cancelar]  [Sincronizar]              │
└─────────────────────────────────────────┘
```

### Arquivo sincronizado
```
┌───────────────────────────────────────────────┐
│ 📄 foto_cliente.jpg                           │
│ 2.5 MB • Modificado hoje às 14:30             │
│                                               │
│ Status: ✓ Sincronizado com:                   │
│ 🔵 Principal  🟢 Backup                       │
│                                               │
│ [↻ Re-sincronizar] [🗑️ Remover]             │
└───────────────────────────────────────────────┘
```

---

## 🔐 Segurança - Tokens OAuth

### Como são armazenados
```
sync_destinations table:
┌────┬────────┬────────────┬─────────────────────────────┐
│ id │  type  │    name    │          config             │
├────┼────────┼────────────┼─────────────────────────────┤
│ 1  │ gdrive │ Principal  │ {                           │
│    │        │            │   "tokens": {               │
│    │        │            │     "access_token": "...",  │
│    │        │            │     "refresh_token": "...", │
│    │        │            │     "expiry_date": 123...   │
│    │        │            │   },                        │
│    │        │            │   "userInfo": {             │
│    │        │            │     "email": "...",         │
│    │        │            │     "displayName": "..."    │
│    │        │            │   },                        │
│    │        │            │   "accountNumber": 1,       │
│    │        │            │   "color": "#4285F4"        │
│    │        │            │ }                           │
└────┴────────┴────────────┴─────────────────────────────┘
```

### Renovação automática
```
1. Token expira (1 hora)
   ↓
2. Sistema detecta 401 error
   ↓
3. Usa refresh_token para obter novo access_token
   ↓
4. Atualiza banco de dados
   ↓
5. Retry da operação original
   ↓
6. ✓ Sucesso (transparente para o usuário)
```

---

## ✅ Checklist Visual de Implementação

```
┌──────────────────────────────────────────────┐
│  Status da Implementação                     │
├──────────────────────────────────────────────┤
│                                              │
│  Backend:                                    │
│  ✅ google-credentials.json (formato web)    │
│  ✅ server.js (callback com postMessage)     │
│  ✅ googleAccountsRouter.js (já existia)     │
│  ✅ googleDriveMultiAccountService.js (OK)   │
│                                              │
│  Frontend:                                   │
│  ✅ AddGoogleAccountModal.jsx (listener)     │
│  ✅ LocalStorage.jsx (já existia)            │
│  ✅ DestinationManager.jsx (já existia)      │
│                                              │
│  Documentação:                               │
│  ✅ [ACAO]_CONFIGURAR_GOOGLE_CLOUD.md        │
│  ✅ [SUCESSO]_GOOGLE_DRIVE_PRONTO.md         │
│  ✅ [INICIO]_GOOGLE_DRIVE_LER_AQUI.txt       │
│  ✅ [VISUAL]_FLUXO_OAUTH.md (este arquivo)   │
│                                              │
│  Pendente (Usuário):                         │
│  ⏳ Configurar Google Cloud Console          │
│  ⏳ Testar primeira conexão                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🎉 Resultado Final

Após configurar no Google Cloud Console, o sistema permitirá:

✅ Conectar múltiplas contas Google Drive
✅ Cada conta com identidade visual única
✅ Tokens OAuth gerenciados automaticamente
✅ Renovação automática quando expirarem
✅ Sincronização seletiva para cada conta
✅ Gerenciamento individual de cada conta
✅ Interface intuitiva e visual
✅ Feedback em tempo real

**Status:** 🚀 PRONTO PARA USO!

