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

## 📥 Importação de Dados

### 1. Importação do Vagaro (Excel)

#### 1.1 Exportar Dados do Vagaro
1. Acesse sua conta Vagaro
2. Vá para **Reports** > **Clients** ou **Appointments**
3. Selecione o período desejado
4. Clique em **Export** e escolha formato **Excel (.xlsx)**
5. Salve o arquivo

#### 1.2 Formatos Esperados

**Clientes (Clients)**:
- Colunas requeridas: Name (ou Customer Name)
- Colunas opcionais: Email, Phone, Birthday, Address, City, State, Zip
- O sistema detecta automaticamente o mapeamento de colunas

**Agendamentos (Appointments)**:
- Colunas requeridas: Client Name, Date, Time
- Colunas opcionais: Service, Status, Notes, Price, Duration
- Formatos de data aceitos: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- Formatos de hora aceitos: HH:MM, HH:MM AM/PM

#### 1.3 Importar via Interface
1. Acesse **Importar Dados** no menu
2. Escolha **Excel Vagaro**
3. Selecione o tipo: Clientes ou Agendamentos
4. Faça upload do arquivo
5. Revise o preview e mapeamento de colunas
6. Confirme a importação
7. Aguarde o relatório de importação

### 2. Importação Manual (ICS/iCalendar)

#### 2.1 Exportar Calendário como ICS
**Do Google Calendar**:
1. Abra Google Calendar
2. Clique no calendário desejado (Settings)
3. Role até "Integrate calendar"
4. Copie o link "Secret address in iCal format"
5. Abra o link no navegador e salve como .ics

**Do Outlook**:
1. Abra o calendário
2. File > Save Calendar
3. Escolha formato iCalendar (.ics)
4. Salve o arquivo

**Do Apple Calendar**:
1. Selecione o calendário
2. File > Export > Export...
3. Escolha formato .ics
4. Salve o arquivo

#### 2.2 Importar Arquivo ICS
1. Acesse **Importar Dados** > **ICS/iCalendar**
2. Faça upload do arquivo .ics
3. Revise o preview dos eventos
4. Marque "Vincular automaticamente a clientes" (recomendado)
5. Confirme a importação

### 3. Sincronização Automática com Google Calendar

#### 3.1 Configurar OAuth
1. Configure as credenciais no .env (veja seção anterior)
2. Acesse **Importar Dados** > **Google Calendar**
3. Clique em **Conectar Google Calendar**
4. Autorize o acesso na janela do Google
5. Aguarde confirmação de conexão

#### 3.2 Sincronizar Eventos
**Manual**:
1. Vá para **Importar Dados** > **Google Calendar**
2. Clique em **Sincronizar Agora**
3. Configure opções:
   - Calendário (padrão: Primary)
   - Dias para trás: 30
   - Dias para frente: 90
4. Aguarde relatório de sincronização

**Automática** (futuro):
- Configure intervalo de sincronização no .env
- O sistema sincronizará automaticamente em background

#### 3.3 Deduplicação Inteligente
O sistema evita duplicatas usando:
- **Clientes**: Telefone normalizado, email, external_id
- **Agendamentos**: google_event_id, ical_uid, external_id, hash (data+hora+cliente)

### 4. Boas Práticas de Importação

#### 4.1 Antes de Importar
- ✅ Faça backup do banco de dados atual
- ✅ Verifique formato dos arquivos
- ✅ Teste com arquivo pequeno primeiro (< 100 linhas)
- ✅ Limpe dados duplicados na origem

#### 4.2 Durante a Importação
- ✅ Revise o preview e mapeamento
- ✅ Marque "Pular duplicatas" na primeira vez
- ✅ Aguarde o relatório completo
- ✅ Anote os erros reportados

#### 4.3 Após Importação
- ✅ Verifique o relatório de importação
- ✅ Revise registros criados/atualizados
- ✅ Corrija erros manualmente se necessário
- ✅ Documente o processo para próximas vezes

### 5. Troubleshooting de Importações

#### Erro: "Arquivo muito grande"
- Divida o arquivo em partes menores (< 1000 linhas)
- Aumente MAX_UPLOAD_SIZE_MB no .env

#### Erro: "Formato de data inválido"
- Converta datas para formato YYYY-MM-DD no Excel
- Use função =TEXT(A2,"YYYY-MM-DD")

#### Erro: "Cliente não encontrado"
- Importe clientes antes de agendamentos
- Use "Vincular automaticamente" na importação

#### Muitas duplicatas
- Use opção "Pular duplicatas"
- Verifique se external_id está presente
- Reimporte com skipDuplicates=true

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
