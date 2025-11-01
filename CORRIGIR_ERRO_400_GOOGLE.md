# 🔧 CORREÇÃO: Erro 400 - OAuth Client Not Found

## 🎯 Problema Identificado

O erro **400 (Bad Request): "The OAuth client was not found"** ocorre porque o arquivo `.env` está com valores de exemplo:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## ✅ SOLUÇÃO EM 5 PASSOS

### Passo 1: Acessar o Google Cloud Console

1. Abra seu navegador e acesse: **https://console.cloud.google.com**
2. Faça login com sua conta Google

### Passo 2: Criar um Projeto (se ainda não tem)

1. Clique no seletor de projetos no topo da página
2. Clique em **"Novo Projeto"**
3. Nome do projeto: **TattooScheduler** (ou qualquer nome)
4. Clique em **"Criar"**
5. Aguarde alguns segundos até o projeto ser criado

### Passo 3: Ativar as APIs Necessárias

1. No menu lateral, vá em: **APIs e Serviços** → **Biblioteca**
2. Procure por **"Google Calendar API"**
   - Clique na API
   - Clique em **"Ativar"**
3. Procure por **"Google Drive API"**
   - Clique na API
   - Clique em **"Ativar"**

### Passo 4: Configurar Tela de Consentimento OAuth

1. No menu lateral: **APIs e Serviços** → **Tela de permissão OAuth**
2. Escolha **"Externo"** (External)
3. Clique em **"Criar"**
4. Preencha os campos obrigatórios:
   - **Nome do app**: Agenda Híbrida Tatuagem
   - **E-mail de suporte do usuário**: seu_email@gmail.com
   - **Domínio da página inicial** (opcional): deixe em branco
   - **E-mail de contato do desenvolvedor**: seu_email@gmail.com
5. Clique em **"Salvar e Continuar"**
6. Na tela de **Escopos**:
   - Clique em **"Adicionar ou remover escopos"**
   - Procure e selecione:
     * `https://www.googleapis.com/auth/calendar`
     * `https://www.googleapis.com/auth/calendar.events`
     * `https://www.googleapis.com/auth/drive.file`
   - Clique em **"Atualizar"**
   - Clique em **"Salvar e Continuar"**
7. Na tela de **Usuários de teste**:
   - Clique em **"Adicionar usuários"**
   - Digite seu email do Google (o que você usa para fazer login)
   - Clique em **"Adicionar"**
   - Clique em **"Salvar e Continuar"**
8. Clique em **"Voltar ao Painel"**

### Passo 5: Criar Credenciais OAuth

1. No menu lateral: **APIs e Serviços** → **Credenciais**
2. Clique em **"Criar Credenciais"** → **"ID do cliente OAuth"**
3. Tipo de aplicativo: Selecione **"Aplicativo da Web"**
4. Nome: **Agenda Híbrida Web Client**
5. **URIs de redirecionamento autorizados** - Clique em **"Adicionar URI"** e adicione:
   ```
   http://localhost:3001/auth/google/callback
   ```
   ```
   http://localhost:5173/auth/callback
   ```
6. Clique em **"Criar"**
7. Uma janela popup aparecerá com:
   - **ID do cliente** (Client ID)
   - **Chave secreta do cliente** (Client Secret)
8. **COPIE ESSES VALORES** (você vai precisar deles!)

### Passo 6: Atualizar o Arquivo .env

1. Abra o arquivo `agenda-hibrida-v2/.env`
2. Substitua as linhas:

**DE:**
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**PARA:**
```env
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI_COPIADO_DO_GOOGLE
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI_COPIADO_DO_GOOGLE
```

3. **SALVE o arquivo**

### Passo 7: Reiniciar o Servidor

1. Pare o servidor backend (se estiver rodando):
   ```bash
   # Encontre o processo
   netstat -ano | findstr :3001
   # Mate o processo (substitua PID pelo número encontrado)
   taskkill /F /PID 1919
   ```

2. Reinicie o servidor:
   ```bash
   cd agenda-hibrida-v2
   npm start
   ```

### Passo 8: Testar a Conexão

1. Abra o navegador em: http://localhost:5173
2. Clique no botão **"Conectar"** (canto superior direito)
3. Você será redirecionado para a tela de login do Google
4. Faça login com sua conta Google (a que adicionou como testador)
5. Você verá uma tela dizendo: **"Google hasn't verified this app"**
   - Clique em **"Advanced"** (Avançado)
   - Clique em **"Go to Agenda Híbrida (unsafe)"** (Ir para Agenda Híbrida - não seguro)
6. Autorize as permissões solicitadas
7. Você será redirecionado de volta para a aplicação
8. O status do Google Drive deve mudar para **"✓ Conectado"**

## 🎓 Entendendo os Erros

### Erro 400: "OAuth client was not found"
**Causa:** Client ID não existe ou está incorreto no arquivo .env  
**Solução:** Copiar o Client ID correto do Google Cloud Console

### Erro 403: "access_denied"
**Causa:** Seu email não está adicionado como usuário de teste  
**Solução:** Adicionar seu email na Tela de Permissão OAuth → Usuários de teste

### Erro 401: "invalid_client"
**Causa:** Client Secret está incorreto  
**Solução:** Verificar e copiar novamente o Client Secret

## 📋 Checklist Final

Antes de testar, verifique se completou:

- [ ] Criou o projeto no Google Cloud Console
- [ ] Ativou Google Calendar API
- [ ] Ativou Google Drive API
- [ ] Configurou a Tela de Consentimento OAuth
- [ ] Adicionou os escopos corretos (Calendar e Drive)
- [ ] Adicionou seu email como usuário de teste
- [ ] Criou as credenciais OAuth (Web Application)
- [ ] Adicionou os URIs de redirecionamento corretos
- [ ] Copiou o Client ID e Client Secret
- [ ] Atualizou o arquivo .env com os valores corretos
- [ ] Salvou o arquivo .env
- [ ] Reiniciou o servidor backend

## ⚠️ IMPORTANTE

**NUNCA compartilhe seu Client ID e Client Secret publicamente!**

Esses valores são como senhas e devem ser mantidos em segredo. O arquivo `.env` está no `.gitignore` para evitar que seja enviado para o Git.

## 🆘 Problemas Comuns

### O servidor não inicia após alterar o .env
**Solução:** Verifique se não há erros de sintaxe no .env (sem espaços extras, sem aspas)

### O Google mostra "redirect_uri_mismatch"
**Solução:** Verifique se os URIs de redirecionamento no Google Cloud Console são exatamente:
- `http://localhost:3001/auth/google/callback`
- `http://localhost:5173/auth/callback`

### Ainda vejo erro 400 após configurar
**Solução:**
1. Limpe o cache do navegador
2. Reinicie o servidor
3. Tente em uma aba anônima
4. Verifique se copiou o Client ID completo (sem espaços)

## 📞 Próximos Passos

Após configurar com sucesso:

1. ✅ Teste criar um agendamento
2. ✅ Verifique se aparece no Google Calendar
3. ✅ Teste fazer upload de uma imagem
4. ✅ Verifique se vai para o Google Drive

---

**Data de criação:** 01 de Novembro de 2025  
**Status:** ✅ Problema identificado e solução documentada

