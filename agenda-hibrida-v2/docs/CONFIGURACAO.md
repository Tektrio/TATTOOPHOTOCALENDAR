# Guia de Configuração Detalhado

## 📋 Pré-requisitos

### Sistema Operacional
- Windows 10/11 ou Linux/macOS
- Node.js 16+ e npm
- 2GB de RAM disponível
- 5GB de espaço em disco

### Contas Necessárias
- Conta Google (para Calendar e Drive)
- Conta de email SMTP (Gmail recomendado)
- QNAP NAS (opcional)
- API WhatsApp (opcional)

## 🔧 Configuração Passo-a-Passo

### 1. Configuração do Google Cloud

#### 1.1 Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Novo Projeto"
3. Nome: "Agenda Tatuagem"
4. Clique em "Criar"

#### 1.2 Ativar APIs
1. Vá para "APIs e Serviços" > "Biblioteca"
2. Busque e ative:
   - Google Calendar API
   - Google Drive API

#### 1.3 Criar Credenciais OAuth
1. Vá para "APIs e Serviços" > "Credenciais"
2. Clique em "Criar Credenciais" > "ID do cliente OAuth 2.0"
3. Tipo: "Aplicativo da Web"
4. Nome: "Agenda Tatuagem"
5. URIs de redirecionamento:
   - http://localhost:3001/auth/google/callback
   - http://localhost:5173/auth/callback
6. Salve o Client ID e Client Secret

#### 1.4 Configurar Tela de Consentimento
1. Vá para "Tela de consentimento OAuth"
2. Tipo: "Externo"
3. Preencha informações básicas
4. Adicione escopos:
   - https://www.googleapis.com/auth/calendar
   - https://www.googleapis.com/auth/drive.file

### 2. Configuração de Email

#### 2.1 Gmail (Recomendado)
1. Ative a verificação em duas etapas
2. Gere uma senha de app:
   - Conta Google > Segurança
   - Verificação em duas etapas
   - Senhas de app
   - Selecione "Email" e "Windows Computer"
   - Use a senha gerada no .env

#### 2.2 Outros Provedores
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Personalizado**: Configure conforme seu provedor

### 3. Configuração do QNAP (Opcional)

#### 3.1 Preparar NAS
1. Certifique-se que o QNAP está na mesma rede
2. Anote o IP do dispositivo
3. Crie uma pasta compartilhada "Tatuagens"
4. Configure permissões de leitura/escrita

#### 3.2 Configurar Acesso
1. Crie um usuário específico para o sistema
2. Dê permissões à pasta "Tatuagens"
3. Teste o acesso via navegador

### 4. Arquivo .env

Crie o arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Google APIs
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_de_app
ADMIN_EMAIL=seu@email.com

# QNAP (Opcional)
QNAP_HOST=192.168.1.100
QNAP_USERNAME=usuario_qnap
QNAP_PASSWORD=senha_qnap
QNAP_SHARE_PATH=/share/Tatuagens

# WhatsApp (Opcional)
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=seu_token_whatsapp

# Configurações do Sistema
BACKUP_RETENTION_DAYS=30
SYNC_INTERVAL=15
LOCAL_STORAGE_PATH=./uploads
```

## 🧪 Verificação da Configuração

### 1. Executar Testes
```bash
node scripts/test-system.js
```

### 2. Verificar Conectividade
- ✅ Banco de dados
- ✅ Armazenamento local
- ✅ APIs funcionando
- ✅ Google Calendar/Drive
- ✅ QNAP (se configurado)
- ✅ Email SMTP

### 3. Primeiro Uso
1. Acesse http://localhost:5173
2. Clique em "Conectar Google"
3. Autorize o acesso
4. Crie seu primeiro cliente
5. Faça um agendamento de teste
6. Teste o upload de arquivos

## 🔧 Personalização

### 1. Tipos de Tatuagem
Edite os tipos padrão no banco de dados ou pela interface

### 2. Multiplicadores de Preço
Ajuste os multiplicadores no componente BudgetSystem

### 3. Intervalos de Sincronização
Modifique SYNC_INTERVAL no .env (em minutos)

### 4. Retenção de Backup
Ajuste BACKUP_RETENTION_DAYS no .env

## 🚨 Solução de Problemas

### Erro: "Google APIs não configuradas"
- Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
- Confirme que as APIs estão ativas
- Verifique URIs de redirecionamento

### Erro: "SMTP não funciona"
- Teste credenciais manualmente
- Verifique se a senha de app está correta
- Confirme configurações do provedor

### Erro: "QNAP não acessível"
- Ping para o IP do QNAP
- Verifique usuário e senha
- Confirme que a pasta existe

### Performance Lenta
- Verifique espaço em disco
- Monitore uso de memória
- Considere aumentar intervalo de sync

## 📞 Suporte Técnico

Se precisar de ajuda:
1. Execute os testes do sistema
2. Verifique os logs em ./logs/
3. Consulte a documentação
4. Entre em contato com suporte
