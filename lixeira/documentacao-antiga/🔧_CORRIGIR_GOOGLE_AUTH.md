# 🔧 CORRIGIR ERRO DE AUTENTICAÇÃO DO GOOGLE

**Erro**: `403: access_denied` - "O app está em modo de TESTE no Google Cloud"

---

## ✅ SOLUÇÃO RÁPIDA (3 Passos)

### **Passo 1**: Acessar Google Cloud Console

1. Abra: https://console.cloud.google.com
2. Selecione seu projeto (agenda-hibrida ou similar)
3. No menu lateral, clique em **"APIs e Serviços"** → **"Tela de consentimento OAuth"**

### **Passo 2**: Adicionar Seu Email como Testador

**OPÇÃO A - Adicionar Testador (RECOMENDADO)**:

1. Na página "Tela de consentimento OAuth"
2. Role até a seção **"Usuários de teste"**
3. Clique em **"+ ADICIONAR USUÁRIOS"**
4. Digite seu email: `selden.ink@hotmail.com`
5. Clique em **"Salvar"**

✅ **Pronto! Agora você pode autenticar.**

---

**OPÇÃO B - Publicar App (Não Recomendado para Teste)**:

1. Na página "Tela de consentimento OAuth"
2. Clique em **"PUBLICAR APP"**
3. Confirme a publicação

⚠️ **Atenção**: Isso torna o app público. Use apenas se for para produção.

---

### **Passo 3**: Testar Novamente

1. **Desconectar Google** (se ainda estiver conectado):

   ```
   http://localhost:5173
   → Clique em "Desconectar Google"
   ```

2. **Conectar Novamente**:

   ```
   → Clique em "Conectar Google"
   → Autorize Calendar + Drive
   ```

3. **Verificar**:
   ```
   → Badge deve mostrar: "Google Conectado"
   → Calendar e Drive devem estar ativos
   ```

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

Após adicionar como testador:

- [ ] Email adicionado em "Usuários de teste"
- [ ] Desconectado e reconectado no app
- [ ] Google Calendar autorizado
- [ ] Google Drive autorizado
- [ ] Badge mostra "Google Conectado"
- [ ] Sistema de sincronização funcionando

---

## 📸 GUIA VISUAL

### **1. Acessar Tela de Consentimento**

```
Google Cloud Console
└─ APIs e Serviços
   └─ Tela de consentimento OAuth
      └─ Usuários de teste
         └─ + ADICIONAR USUÁRIOS
```

### **2. Adicionar Email**

```
┌─────────────────────────────────┐
│ Adicionar usuários de teste    │
├─────────────────────────────────┤
│ Email: selden.ink@hotmail.com   │
│                                 │
│ [Cancelar]  [Salvar]            │
└─────────────────────────────────┘
```

### **3. Resultado Esperado**

```
✅ Usuários de teste (1)
   • selden.ink@hotmail.com
```

---

## 🔄 SE AINDA DER ERRO

### **Erro Persistente?**

1. **Limpar Cache do Navegador**:

   ```
   Chrome → Configurações → Privacidade
   → Limpar dados de navegação
   → Cookies e cache
   ```

2. **Tentar em Janela Anônima**:

   ```
   Cmd+Shift+N (Mac)
   Ctrl+Shift+N (Windows)
   ```

3. **Verificar Redirect URI**:

   ```
   Google Cloud Console
   → Credenciais
   → Seu OAuth Client ID
   → URIs de redirecionamento autorizados

   Deve conter:
   http://localhost:3001/auth/google/callback
   ```

---

## 📝 COMANDOS ÚTEIS

```bash
# Reiniciar backend (se necessário)
cd ~/Desktop/agenda-hibrida-v2/agenda-hibrida-v2
pkill -f "node server.js"
npm start

# Verificar tokens
ls -la tokens.json

# Remover tokens antigos (se necessário)
rm tokens.json
# Depois reconectar no app
```

---

## ✅ SOLUÇÃO COMPLETA

### **Resumo dos Passos**:

1. ✅ Acessar https://console.cloud.google.com
2. ✅ Ir em "APIs e Serviços" → "Tela de consentimento OAuth"
3. ✅ Adicionar `selden.ink@hotmail.com` como testador
4. ✅ Salvar
5. ✅ No app: Desconectar → Conectar novamente
6. ✅ Autorizar Calendar + Drive
7. ✅ Pronto! 🎉

---

## 🎊 APÓS CORREÇÃO

O sistema de sincronização funcionará perfeitamente:

- ✅ Badge de sincronização ativo
- ✅ File Watcher monitorando
- ✅ Upload/Download automático
- ✅ Detecção de conflitos
- ✅ WebSocket em tempo real

**Tudo está implementado e pronto para funcionar!**

---

_Guia criado: 24/10/2025_  
_Tempo estimado: 2-3 minutos_
