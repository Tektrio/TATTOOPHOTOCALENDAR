# 🔐 Solução Completa: Erro 403 Google OAuth

## 🎯 Problema

Erro ao conectar Google Drive: **"403: access_denied"**

Este erro ocorre quando:
- ✅ O app está em **modo de TESTE** no Google Cloud
- ❌ Você não está adicionado como testador autorizado
- ❌ OU o app precisa ser publicado em PRODUÇÃO

---

## ✨ Solução Rápida (Recomendada para Desenvolvimento)

### Opção 1: Adicionar Email como Testador

1. **Acesse o Google Cloud Console:**
   - 🔗 https://console.cloud.google.com

2. **Selecione seu Projeto:**
   - Nome: `TattooScheduler` ou o nome do seu projeto

3. **Navegue até OAuth:**
   - No menu lateral: **APIs e Serviços** → **Tela de permissão OAuth**

4. **Adicione Usuários de Teste:**
   - Clique em **"Adicionar usuários"** (Add Users)
   - Digite seu email do Google (o que você usa para fazer login)
   - Clique em **Salvar**

5. **Teste Novamente:**
   - Recarregue a aplicação
   - Tente conectar ao Google Drive novamente

---

## 🚀 Solução para Produção

### Opção 2: Publicar o App (Para uso público)

⚠️ **Use apenas se for disponibilizar para outros usuários**

1. **Acesse a Tela de Permissão:**
   - Google Cloud Console → APIs e Serviços → Tela de permissão OAuth

2. **Clique em "Publicar App":**
   - O app sairá do modo de teste

3. **Preencha Informações Obrigatórias:**
   - Logo da aplicação (ícone 120x120px)
   - Link para política de privacidade
   - Link para termos de serviço
   - Email de suporte

4. **Envie para Revisão:**
   - O Google pode levar 1-7 dias para aprovar

---

## 🛠️ Solução Temporária (Desenvolvimento Local)

### Opção 3: Desabilitar Google Drive no Frontend

Se você só quer testar outras funcionalidades sem o Google Drive:

**Arquivo: `agenda-hibrida-frontend/src/components/Dashboard.jsx`**

Procure por:
```jsx
const [driveConnected, setDriveConnected] = useState(false);
```

E adicione logo abaixo:
```jsx
// Desabilitar Google Drive temporariamente
useEffect(() => {
  setDriveConnected(false);
}, []);
```

Ou simplesmente não clique no botão "Conectar" do Google Drive.

---

## 🔍 Verificar Configuração Atual

### Ver Status das Credenciais

Execute no terminal:

```bash
cd agenda-hibrida-v2
node verificar-google-config.js
```

Isso mostrará:
- ✅ Client ID configurado
- ✅ Client Secret configurado  
- ✅ Redirect URI configurado
- ⚠️ Status do OAuth (TESTE ou PRODUÇÃO)

---

## 📋 Checklist de Configuração

### No Google Cloud Console:

- [ ] Projeto criado
- [ ] Google Calendar API ativada
- [ ] Google Drive API ativada
- [ ] OAuth Client ID criado
- [ ] URIs de redirecionamento configurados:
  - `http://localhost:3001/auth/google/callback`
  - `http://localhost:5173/auth/callback`
- [ ] **Seu email adicionado como testador** ⭐
- [ ] Tela de consentimento configurada

### No Arquivo .env:

- [ ] `GOOGLE_CLIENT_ID` preenchido
- [ ] `GOOGLE_CLIENT_SECRET` preenchido
- [ ] `GOOGLE_REDIRECT_URI` correto

---

## 🎓 Entendendo os Modos do Google OAuth

### Modo de TESTE (Testing) - Padrão
- ✅ Até 100 usuários
- ✅ Funciona apenas para emails cadastrados
- ✅ Sem revisão do Google
- ✅ **Ideal para desenvolvimento**
- ❌ Outros usuários veem tela de aviso

### Modo PRODUÇÃO (Production)
- ✅ Usuários ilimitados
- ✅ Sem tela de aviso
- ❌ Requer revisão do Google
- ❌ Requer política de privacidade
- ❌ Processo pode levar dias

---

## 🧪 Testar a Solução

Após adicionar seu email como testador:

1. **Limpe o cache do navegador:**
   ```
   Chrome/Edge: Ctrl+Shift+Delete
   Safari: Cmd+Option+E
   ```

2. **Recarregue a aplicação:**
   - Pressione `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

3. **Tente conectar novamente:**
   - Dashboard → Clique em "Conectar" no card do Google Drive

4. **Você deverá ver:**
   - Tela de login do Google
   - Lista de permissões
   - Mensagem de sucesso na aplicação

---

## ❓ Perguntas Frequentes

### P: Preciso publicar o app?
**R:** Não! Para uso pessoal ou de equipe, basta adicionar os emails como testadores.

### P: Quantos testadores posso adicionar?
**R:** Até 100 usuários no modo de teste.

### P: O erro persiste após adicionar meu email
**R:** 
- Limpe o cache do navegador
- Verifique se usou o email correto
- Aguarde 5 minutos (propagação)
- Tente em aba anônima

### P: Posso usar sem Google Drive?
**R:** Sim! O sistema funciona 100% local. O Google Drive é opcional para backup em nuvem.

---

## 🆘 Ainda com Problemas?

### 1. Verifique os Logs do Backend:
```bash
cd agenda-hibrida-v2
tail -f server.log
```

### 2. Verifique Console do Navegador:
- Pressione F12
- Aba "Console"
- Procure por erros em vermelho

### 3. Teste Credenciais:
```bash
cd agenda-hibrida-v2
node test-gdrive-connection.js
```

---

## 📞 Contato

Se o problema persistir:
1. Anote o erro exato
2. Faça print da tela de erro
3. Verifique se completou TODOS os passos do checklist
4. Entre em contato com suporte técnico

---

**Última atualização:** 30 de Outubro de 2025

