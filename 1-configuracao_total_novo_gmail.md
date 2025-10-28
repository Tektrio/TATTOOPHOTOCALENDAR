# 🔧 Configuração Completa do Google MCP - Nova Conta Gmail

> **Guia completo para configurar todas as integrações Google (Calendar, Drive, Gmail, Tasks) em uma nova conta caso a atual seja banida ou precise migrar.**

---

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Parte 1: Criar Projeto no Google Cloud Console](#parte-1-criar-projeto-no-google-cloud-console)
3. [Parte 2: Habilitar APIs Necessárias](#parte-2-habilitar-apis-necessárias)
4. [Parte 3: Configurar OAuth 2.0](#parte-3-configurar-oauth-20)
5. [Parte 4: Criar Credenciais OAuth](#parte-4-criar-credenciais-oauth)
6. [Parte 5: Configurar o MCP no Cursor](#parte-5-configurar-o-mcp-no-cursor)
7. [Parte 6: Primeira Autenticação](#parte-6-primeira-autenticação)
8. [Parte 7: Verificação e Testes](#parte-7-verificação-e-testes)
9. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Pré-requisitos

### Conta Google Nova ou Alternativa
- [ ] Conta Gmail válida e ativa
- [ ] Acesso ao Google Cloud Console
- [ ] Navegador atualizado (Chrome, Firefox, Safari, Edge)

### Ferramentas Necessárias
- [ ] Cursor instalado
- [ ] Node.js (v18 ou superior) via NVM
- [ ] Bun instalado (para o google-mcp)

### Instalação das Ferramentas

```bash
# Instalar NVM (se não tiver)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js
nvm install 22
nvm use 22

# Instalar Bun
curl -fsSL https://bun.sh/install | bash

# Instalar google-mcp globalmente
npm install -g google-mcp
```

---

## 🚀 Parte 1: Criar Projeto no Google Cloud Console

### 1.1 Acessar o Google Cloud Console

1. Navegue até: https://console.cloud.google.com/
2. Faça login com a nova conta Gmail
3. Aceite os Termos de Serviço se solicitado

### 1.2 Criar Novo Projeto

1. No topo da página, clique no seletor de projetos (ao lado de "Google Cloud")
2. Clique em **"NOVO PROJETO"** (ou "NEW PROJECT")
3. Preencha os dados:
   - **Nome do Projeto**: `tattoo-calendar-mcp` (ou qualquer nome descritivo)
   - **Organização**: Deixe como "Sem organização" (No organization)
   - **Localização**: Deixe em branco ou selecione conforme preferência
4. Clique em **"CRIAR"** (ou "CREATE")
5. Aguarde alguns segundos até o projeto ser criado
6. Selecione o projeto recém-criado no seletor de projetos

---

## 🔌 Parte 2: Habilitar APIs Necessárias

### 2.1 Acessar Biblioteca de APIs

1. No menu lateral esquerdo (☰), navegue até: **APIs e serviços** > **Biblioteca**
2. Ou acesse diretamente: https://console.cloud.google.com/apis/library

### 2.2 Habilitar Google Calendar API

1. Na barra de pesquisa, digite: `Google Calendar API`
2. Clique no resultado **Google Calendar API**
3. Clique no botão **"ATIVAR"** (ou "ENABLE")
4. Aguarde a ativação (alguns segundos)

### 2.3 Habilitar Google Drive API

1. Volte para a Biblioteca de APIs (botão voltar ou link "Biblioteca")
2. Digite na busca: `Google Drive API`
3. Clique no resultado **Google Drive API**
4. Clique em **"ATIVAR"**

### 2.4 Habilitar Gmail API

1. Volte para a Biblioteca de APIs
2. Digite: `Gmail API`
3. Clique no resultado **Gmail API**
4. Clique em **"ATIVAR"**

### 2.5 Habilitar Google Tasks API

1. Volte para a Biblioteca de APIs
2. Digite: `Google Tasks API`
3. Clique no resultado **Tasks API**
4. Clique em **"ATIVAR"**

### 2.6 Habilitar Google People API (opcional, mas recomendado)

1. Volte para a Biblioteca de APIs
2. Digite: `Google People API`
3. Clique no resultado **People API**
4. Clique em **"ATIVAR"**

### ✅ Checkpoint: APIs Habilitadas
Confirme que todas estas APIs estão ativas:
- ✅ Google Calendar API
- ✅ Google Drive API
- ✅ Gmail API
- ✅ Google Tasks API
- ✅ Google People API (opcional)

---

## 🔐 Parte 3: Configurar OAuth 2.0

### 3.1 Configurar Tela de Consentimento OAuth

1. No menu lateral, vá para: **APIs e serviços** > **Tela de consentimento OAuth**
2. Ou acesse: https://console.cloud.google.com/apis/credentials/consent

### 3.2 Escolher Tipo de Usuário

Você verá duas opções:

**Opção A: Interno (Internal)** - Apenas se tiver Google Workspace
- Disponível apenas para contas Google Workspace
- Pule para "Opção B" se não tiver Workspace

**Opção B: Externo (External)** - Recomendado para contas pessoais
- ✅ Selecione **"Externo"** (External)
- Clique em **"CRIAR"** (CREATE)

### 3.3 Configurar Informações do App (Página 1)

Preencha os campos obrigatórios:

**Informações do aplicativo:**
- **Nome do aplicativo**: `Tattoo Calendar MCP` (ou seu nome preferido)
- **E-mail de suporte do usuário**: Seu email Gmail
- **Logotipo do aplicativo**: (opcional, pode pular)

**Domínio do aplicativo:**
- **Página inicial do aplicativo**: (opcional) ou `http://localhost:3001`
- **Política de Privacidade**: (opcional para teste)
- **Termos de Serviço**: (opcional para teste)

**Domínios autorizados**: (deixe em branco por enquanto)

**Informações de contato do desenvolvedor:**
- **Endereços de e-mail**: Seu email Gmail

Clique em **"SALVAR E CONTINUAR"**

### 3.4 Adicionar Escopos (Página 2 - MAIS IMPORTANTE)

Esta é a parte mais crítica - adicionar todos os escopos necessários:

1. Clique em **"ADICIONAR OU REMOVER ESCOPOS"** (ADD OR REMOVE SCOPES)
2. Na janela que abrir, você pode:
   - **Opção A**: Marcar os escopos manualmente da lista
   - **Opção B**: Colar os escopos diretamente

**Cole estes escopos no campo "Atualizar escopos manualmente" (ou marque-os na lista):**

```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.compose
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.labels
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/tasks.readonly
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/userinfo.email
```

3. Clique em **"ATUALIZAR"** (UPDATE)
4. Verifique se todos os 15 escopos aparecem na lista
5. Clique em **"SALVAR E CONTINUAR"**

### 3.5 Adicionar Usuários de Teste (Página 3)

Se você escolheu "Externo" na etapa 3.2:

1. Clique em **"+ ADICIONAR USUÁRIOS"** (ADD USERS)
2. Digite o email da conta Gmail que será usada
3. Clique em **"ADICIONAR"**
4. **IMPORTANTE**: Adicione qualquer outro email que precise testar
5. Clique em **"SALVAR E CONTINUAR"**

### 3.6 Resumo (Página 4)

1. Revise todas as configurações
2. Clique em **"VOLTAR AO PAINEL"** (BACK TO DASHBOARD)

### ⚠️ Aviso Importante sobre Modo de Teste

Seu app ficará em **"Modo de Teste"** (Testing mode):
- ✅ Pode ser usado por você e pelos usuários de teste
- ✅ Não expira (pode usar indefinidamente)
- ⚠️ Mostrará tela de aviso "App não verificado" (normal, pode ignorar)
- 📝 Limite de 100 usuários de teste

Para uso pessoal, o modo de teste é PERFEITO e não precisa de verificação do Google.

---

## 🔑 Parte 4: Criar Credenciais OAuth

### 4.1 Criar ID do Cliente OAuth 2.0

1. No menu lateral, vá para: **APIs e serviços** > **Credenciais**
2. Ou acesse: https://console.cloud.google.com/apis/credentials
3. Clique em **"+ CRIAR CREDENCIAIS"** (CREATE CREDENTIALS)
4. Selecione **"ID do cliente OAuth 2.0"** (OAuth 2.0 Client ID)

### 4.2 Configurar Credenciais

**Tipo de aplicativo:**
- Selecione: **"Aplicativo para computador"** (Desktop app)

**Nome:**
- Digite: `Tattoo Calendar Desktop Client` (ou qualquer nome)

**URIs de redirecionamento autorizados:** (deixe em branco por padrão)

Clique em **"CRIAR"** (CREATE)

### 4.3 Salvar Credenciais

Uma janela aparecerá com:
- **ID do cliente OAuth** (Client ID)
- **Chave secreta do cliente** (Client Secret)

**⚠️ MUITO IMPORTANTE - COPIE E SALVE ESTES DADOS AGORA:**

```
Client ID: 1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
Client Secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

Você pode clicar em **"FAZER DOWNLOAD DO JSON"** para backup.

### 4.4 Verificar Configuração de Redirecionamento

**IMPORTANTE**: O google-mcp usa `http://localhost:3001/oauth2callback` como URI de redirecionamento.

1. Na lista de credenciais, clique no nome da credencial que você acabou de criar
2. Role até **"URIs de redirecionamento autorizados"**
3. Se estiver vazio, adicione manualmente:
   - Clique em **"+ ADICIONAR URI"**
   - Cole: `http://localhost:3001/oauth2callback`
   - Clique em **"SALVAR"**

---

## ⚙️ Parte 5: Configurar o MCP no Cursor

### 5.1 Localizar Arquivo de Configuração

O arquivo de configuração do Cursor está em:
- **macOS**: `~/.cursor/mcp.json` ou `/Users/SEU_USUARIO/.cursor/mcp.json`
- **Windows**: `%APPDATA%\Cursor\mcp.json`
- **Linux**: `~/.config/cursor/mcp.json`

### 5.2 Editar Configuração do google-mcp

Abra o arquivo `mcp.json` e localize ou adicione a seção `google-mcp`:

```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "/Users/SEU_USUARIO/.nvm/versions/node/v22.15.0/bin/google-mcp",
      "args": [],
      "env": {
        "PATH": "/Users/SEU_USUARIO/.bun/bin:/usr/local/bin:/usr/bin:/bin",
        "GOOGLE_OAUTH_CLIENT_ID": "COLE_SEU_CLIENT_ID_AQUI",
        "GOOGLE_OAUTH_CLIENT_SECRET": "COLE_SEU_CLIENT_SECRET_AQUI",
        "GOOGLE_OAUTH_TOKEN_PATH": "/Users/SEU_USUARIO/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json",
        "GOOGLE_CALENDAR_ID": "primary"
      },
      "disabled": false
    }
  }
}
```

### 5.3 Substituir Valores

**SUBSTITUA:**
1. `SEU_USUARIO` pelo seu nome de usuário do sistema
2. `COLE_SEU_CLIENT_ID_AQUI` pelo Client ID copiado na Parte 4.3
3. `COLE_SEU_CLIENT_SECRET_AQUI` pelo Client Secret copiado na Parte 4.3
4. Ajuste o caminho do `GOOGLE_OAUTH_TOKEN_PATH` para onde você quer salvar os tokens

**Exemplo preenchido:**
```json
{
  "mcpServers": {
    "google-mcp": {
      "command": "/Users/luizlopes/.nvm/versions/node/v22.15.0/bin/google-mcp",
      "args": [],
      "env": {
        "PATH": "/Users/luizlopes/.bun/bin:/usr/local/bin:/usr/bin:/bin",
        "GOOGLE_OAUTH_CLIENT_ID": "1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com",
        "GOOGLE_OAUTH_CLIENT_SECRET": "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",
        "GOOGLE_OAUTH_TOKEN_PATH": "/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json",
        "GOOGLE_CALENDAR_ID": "primary"
      },
      "disabled": false
    }
  }
}
```

### 5.4 Verificar Caminho do google-mcp

Para encontrar o caminho correto do google-mcp:

```bash
which google-mcp
# Ou
command -v google-mcp
```

Use o caminho retornado no campo `command` da configuração.

### 5.5 Salvar e Fechar

1. Salve o arquivo `mcp.json`
2. Feche o Cursor completamente
3. Reabra o Cursor

---

## 🔓 Parte 6: Primeira Autenticação

### 6.1 Iniciar Autenticação

1. Abra o Cursor
2. O servidor google-mcp tentará iniciar automaticamente
3. Um navegador será aberto automaticamente para autenticação OAuth

**Se não abrir automaticamente**, você pode tentar manualmente:

```bash
# Terminal
cd /Users/SEU_USUARIO/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2
google-mcp
```

### 6.2 Processo de Autenticação no Navegador

**Passo 1: Escolher Conta**
- Selecione a conta Gmail que você configurou

**Passo 2: Tela de Aviso "App não verificado"**
- ⚠️ Você verá: "Google hasn't verified this app"
- Isso é NORMAL para apps em modo de teste
- Clique em **"Advanced"** (Avançado)
- Clique em **"Go to [Nome do App] (unsafe)"** - NÃO SE PREOCUPE, é seu próprio app!

**Passo 3: Permissões**
Você verá uma lista de permissões solicitadas:
- ✅ Ver, editar, criar e excluir todos os seus calendários do Google Agenda
- ✅ Ver e fazer download de todos os seus arquivos do Google Drive
- ✅ Ler, redigir, enviar e excluir permanentemente todos os seus e-mails do Gmail
- ✅ Ver, editar e excluir permanentemente suas tarefas
- ✅ Ver suas informações pessoais básicas

**Clique em "Allow" (Permitir) ou "Continue" (Continuar)**

**Passo 4: Confirmação**
- Você verá uma mensagem de sucesso
- A página pode dizer "Authentication successful, you can close this window"
- Feche a janela do navegador

### 6.3 Verificar Tokens Salvos

Verifique se o arquivo de tokens foi criado:

```bash
ls -la /Users/SEU_USUARIO/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json
cat /Users/SEU_USUARIO/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2/tokens.json
```

O arquivo deve conter um JSON com `access_token`, `refresh_token`, etc.

---

## ✅ Parte 7: Verificação e Testes

### 7.1 Verificar Status do MCP no Cursor

1. No Cursor, verifique se o ícone do google-mcp está verde
2. Deveria mostrar "35 tools enabled"

### 7.2 Testar Cada API

No Cursor, você pode testar cada funcionalidade:

**Teste 1: Google Calendar**
```
Liste meus calendários
```

**Teste 2: Google Drive**
```
Liste os primeiros 5 arquivos do meu Google Drive
```

**Teste 3: Gmail**
```
Liste minhas labels do Gmail
```

**Teste 4: Google Tasks**
```
Liste minhas listas de tarefas
```

### 7.3 Checklist de Verificação

- [ ] google-mcp aparece como ativo no Cursor (verde)
- [ ] 35 ferramentas estão habilitadas
- [ ] Arquivo tokens.json foi criado
- [ ] Google Calendar responde corretamente
- [ ] Google Drive responde corretamente
- [ ] Gmail responde corretamente (sem erro de scopes)
- [ ] Google Tasks responde corretamente (sem erro de scopes)

---

## 🔧 Solução de Problemas

### Problema 1: "Authentication failed: Neither OAuth nor Service Account..."

**Causa**: Variáveis de ambiente incorretas no mcp.json

**Solução**:
- Verifique se usou `GOOGLE_OAUTH_CLIENT_ID` (não `GOOGLE_CLIENT_ID`)
- Verifique se usou `GOOGLE_OAUTH_CLIENT_SECRET` (não `GOOGLE_CLIENT_SECRET`)
- Verifique se usou `GOOGLE_OAUTH_TOKEN_PATH` (não `GOOGLE_APPLICATION_CREDENTIALS`)

### Problema 2: "Request had insufficient authentication scopes"

**Causa**: Faltam escopos na configuração OAuth

**Solução**:
1. Volte para Google Cloud Console > Tela de consentimento OAuth
2. Edite os escopos e adicione todos os 15 escopos listados na Parte 3.4
3. Delete o arquivo `tokens.json`
4. Reinicie o Cursor
5. Faça a autenticação novamente

### Problema 3: "Failed to start server. Is port 3001 in use?"

**Causa**: Porta 3001 está em uso ou bloqueada

**Solução A - Verificar processo usando a porta:**
```bash
# macOS/Linux
lsof -i :3001
# Matar processo se encontrado
kill -9 PID_DO_PROCESSO
```

**Solução B - Usar porta alternativa:**
Modifique temporariamente a configuração do google-mcp para usar outra porta (requer modificação avançada).

### Problema 4: "App não verificado" não mostra opção "Advanced"

**Causa**: Seu email não está na lista de usuários de teste

**Solução**:
1. Volte para Google Cloud Console > Tela de consentimento OAuth
2. Clique em "Usuários de teste"
3. Adicione seu email Gmail
4. Tente autenticar novamente

### Problema 5: Token expirado

**Causa**: Access token expirou (dura apenas 1 hora)

**Solução**: O refresh token é automático. Se não funcionar:
```bash
# Delete os tokens e re-autentique
rm /caminho/para/tokens.json
# Reinicie o Cursor
```

### Problema 6: "Client ID not found"

**Causa**: Client ID ou Secret incorretos

**Solução**:
1. Volte para Google Cloud Console > APIs e serviços > Credenciais
2. Clique na credencial que você criou
3. Copie novamente o Client ID e Secret
4. Atualize o mcp.json
5. Delete tokens.json
6. Reinicie o Cursor

---

## 📱 Informações Adicionais

### Limites da API Google

**Google Calendar API:**
- 1.000.000 requisições por dia
- 10 requisições por segundo

**Google Drive API:**
- 1.000.000.000 requisições por dia
- 1.000 requisições por 100 segundos por usuário

**Gmail API:**
- 1.000.000.000 requisições por dia
- 250 requisições por segundo por usuário

**Google Tasks API:**
- 50.000 requisições por dia
- 600 requisições por minuto

Para uso pessoal, esses limites são mais que suficientes.

### Segurança dos Tokens

**⚠️ IMPORTANTE:**
- Nunca compartilhe seu `tokens.json`
- Nunca faça commit do `tokens.json` no Git
- Adicione `tokens.json` ao `.gitignore`
- Nunca exponha seu Client Secret publicamente

**Adicionar ao .gitignore:**
```bash
echo "tokens.json" >> .gitignore
echo "google-credentials.json" >> .gitignore
```

### Revogar Acesso

Se precisar revogar o acesso do app:

1. Acesse: https://myaccount.google.com/permissions
2. Encontre "Tattoo Calendar MCP" (ou nome que você deu)
3. Clique em "Remove Access"
4. Delete o arquivo `tokens.json`

### Backup das Credenciais

**Salve em local seguro:**
1. Client ID
2. Client Secret
3. ID do Projeto Google Cloud
4. Lista de APIs habilitadas
5. Lista de escopos configurados

**Sugestão**: Use um gerenciador de senhas como 1Password, LastPass, Bitwarden, etc.

---

## 🎯 Resumo Rápido (TL;DR)

Para configurar rapidamente em uma nova conta:

1. **Google Cloud Console** → Criar projeto
2. **Habilitar APIs**: Calendar, Drive, Gmail, Tasks, People
3. **Tela de consentimento OAuth** → Tipo "Externo" → Adicionar 15 escopos → Adicionar usuários de teste
4. **Criar Credenciais OAuth** → Tipo "Desktop App" → Copiar Client ID e Secret
5. **Editar `~/.cursor/mcp.json`** → Colar Client ID, Client Secret, definir path dos tokens
6. **Reiniciar Cursor** → Autenticar no navegador → Aceitar todas as permissões
7. **Testar** → Verificar 35 tools habilitadas e testar cada API

**Tempo estimado: 20-30 minutos**

---

## 📞 Suporte e Recursos

### Documentação Oficial
- Google Cloud Console: https://console.cloud.google.com/
- Google MCP GitHub: https://github.com/vakharwalad23/google-mcp
- OAuth 2.0 Docs: https://developers.google.com/identity/protocols/oauth2

### URLs Úteis
- Google Cloud Console: https://console.cloud.google.com/
- API Library: https://console.cloud.google.com/apis/library
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent
- My Account Permissions: https://myaccount.google.com/permissions

---

## 📝 Notas Finais

Este guia foi criado para a configuração do projeto **Tattoo Calendar** com integração completa ao Google MCP.

**Data de criação**: 27 de outubro de 2025
**Versão**: 1.0
**Conta atual**: photocalendar25@gmail.com
**Projeto atual**: tattoo-calendar-mcp

Se a conta for banida, siga este guia passo a passo com uma nova conta Gmail para recriar toda a configuração em aproximadamente 20-30 minutos.

**Boa sorte! 🚀**

