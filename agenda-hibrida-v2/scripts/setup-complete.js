const fs = require('fs-extra');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');
require('dotenv').config();

class CompleteSetup {
  constructor() {
    this.dbPath = './agenda_hibrida.db';
    this.setupSteps = [];
  }

  async runCompleteSetup() {
    console.log('🚀 CONFIGURAÇÃO COMPLETA DO SISTEMA HÍBRIDO');
    console.log('===========================================\n');

    try {
      await this.createDirectoryStructure();
      await this.initializeDatabase();
      await this.createSampleData();
      await this.setupConfiguration();
      await this.createStartupScripts();
      await this.generateDocumentation();
      
      this.showCompletionSummary();
    } catch (error) {
      console.error('❌ Erro durante a configuração:', error);
    }
  }

  async createDirectoryStructure() {
    console.log('📁 Criando estrutura de diretórios...');
    
    const directories = [
      './uploads',
      './uploads/clientes',
      './backups',
      './logs',
      './test-reports',
      './scripts',
      './config',
      './docs'
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      this.setupSteps.push(`✅ Diretório criado: ${dir}`);
    }

    // Criar .gitignore se não existir
    const gitignoreContent = `
# Dependências
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Arquivos de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Banco de dados
*.db
*.sqlite
*.sqlite3

# Uploads e arquivos temporários
uploads/
temp/
tmp/

# Logs
logs/
*.log

# Backups
backups/

# Relatórios de teste
test-reports/

# Tokens e credenciais
tokens.json
credentials.json

# Sistema operacional
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
`.trim();

    if (!await fs.pathExists('./.gitignore')) {
      await fs.writeFile('./.gitignore', gitignoreContent);
      this.setupSteps.push('✅ Arquivo .gitignore criado');
    }

    console.log('✅ Estrutura de diretórios criada\n');
  }

  async initializeDatabase() {
    console.log('🗄️ Inicializando banco de dados...');
    
    const db = new sqlite3.Database(this.dbPath);

    const tables = [
      // Tabela de clientes
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de tipos de tatuagem
      `CREATE TABLE IF NOT EXISTS tattoo_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        duration_hours INTEGER DEFAULT 2,
        base_price DECIMAL(10,2) DEFAULT 200.00,
        color TEXT DEFAULT '#8B5CF6',
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de agendamentos
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        client_id INTEGER,
        tattoo_type_id INTEGER,
        status TEXT DEFAULT 'pendente',
        estimated_price DECIMAL(10,2),
        google_event_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types (id)
      )`,

      // Tabela de arquivos
      `CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_url TEXT,
        thumbnail_url TEXT,
        cloud_path TEXT,
        mime_type TEXT,
        file_size INTEGER,
        client_id INTEGER,
        appointment_id INTEGER,
        category TEXT DEFAULT 'referencias',
        tags TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
      )`,

      // Tabela de orçamentos
      `CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        client_id INTEGER,
        appointment_id INTEGER,
        tattoo_type_id INTEGER,
        size_cm DECIMAL(5,2),
        complexity TEXT DEFAULT 'medium',
        body_location TEXT,
        colors_count INTEGER DEFAULT 1,
        sessions_count INTEGER DEFAULT 1,
        base_price DECIMAL(10,2),
        complexity_multiplier DECIMAL(3,2) DEFAULT 1.00,
        size_multiplier DECIMAL(3,2) DEFAULT 1.00,
        location_multiplier DECIMAL(3,2) DEFAULT 1.00,
        color_multiplier DECIMAL(3,2) DEFAULT 1.00,
        session_multiplier DECIMAL(3,2) DEFAULT 1.00,
        materials_cost DECIMAL(10,2) DEFAULT 0.00,
        additional_costs DECIMAL(10,2) DEFAULT 0.00,
        discount DECIMAL(10,2) DEFAULT 0.00,
        final_price DECIMAL(10,2),
        status TEXT DEFAULT 'pending',
        valid_until DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id),
        FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types (id)
      )`,

      // Tabela de notificações
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        appointment_id INTEGER,
        type TEXT NOT NULL,
        timing TEXT,
        message TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
      )`,

      // Tabela de configurações do sistema
      `CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de logs de sincronização
      `CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await new Promise((resolve, reject) => {
        db.run(tableSQL, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Criar índices para performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointments(start_datetime)',
      'CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_files_client_id ON files(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_files_category ON files(category)',
      'CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON budgets(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id)'
    ];

    for (const indexSQL of indexes) {
      await new Promise((resolve, reject) => {
        db.run(indexSQL, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    db.close();
    this.setupSteps.push('✅ Banco de dados inicializado com todas as tabelas');
    console.log('✅ Banco de dados inicializado\n');
  }

  async createSampleData() {
    console.log('📊 Criando dados de exemplo...');
    
    const db = new sqlite3.Database(this.dbPath);

    // Inserir configurações padrão do sistema
    const systemConfigs = [
      ['storage_mode', 'hybrid', 'Modo de armazenamento (local, qnap, gdrive, hybrid)'],
      ['local_storage_path', './uploads', 'Caminho do armazenamento local'],
      ['backup_retention_days', '30', 'Dias de retenção dos backups'],
      ['sync_interval_minutes', '15', 'Intervalo de sincronização em minutos'],
      ['notification_enabled', 'true', 'Notificações habilitadas'],
      ['email_notifications', 'true', 'Notificações por email habilitadas'],
      ['whatsapp_notifications', 'false', 'Notificações por WhatsApp habilitadas']
    ];

    for (const [key, value, description] of systemConfigs) {
      await new Promise((resolve, reject) => {
        db.run(
        'INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)',
        [key, value],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Inserir tipos de tatuagem padrão
    const tattooTypes = [
      ['Pequena (até 5cm)', 2, 200.00, '#10B981', 'Tatuagens pequenas e simples'],
      ['Média (5-15cm)', 4, 400.00, '#3B82F6', 'Tatuagens de tamanho médio'],
      ['Grande (15-30cm)', 6, 800.00, '#8B5CF6', 'Tatuagens grandes e detalhadas'],
      ['Extra Grande (+30cm)', 10, 1500.00, '#EF4444', 'Tatuagens muito grandes ou complexas'],
      ['Sessão de Retoque', 1, 100.00, '#F59E0B', 'Retoques e correções'],
      ['Cobertura (Cover-up)', 5, 600.00, '#6B7280', 'Cobrir tatuagens existentes']
    ];

    for (const [name, duration, price, color, description] of tattooTypes) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO tattoo_types (name, duration_hours, base_price, color, description) VALUES (?, ?, ?, ?, ?)',
          [name, duration, price, color, description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Inserir cliente de exemplo
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO clients (name, email, phone, notes) VALUES (?, ?, ?, ?)',
        ['Cliente Exemplo', 'exemplo@email.com', '(11) 99999-9999', 'Cliente criado durante a configuração inicial'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    db.close();
    this.setupSteps.push('✅ Dados de exemplo criados');
    console.log('✅ Dados de exemplo criados\n');
  }

  async setupConfiguration() {
    console.log('⚙️ Configurando sistema...');

    // Criar arquivo de configuração de desenvolvimento
    const devConfig = {
      server: {
        port: 3001,
        host: 'localhost',
        cors: {
          origin: 'http://localhost:5173',
          credentials: true
        }
      },
      database: {
        path: './agenda_hibrida.db',
        backup: {
          enabled: true,
          interval: '0 2 * * *', // Diário às 2h
          retention: 30
        }
      },
      storage: {
        mode: 'hybrid',
        local: {
          path: './uploads',
          maxSize: '100MB'
        },
        qnap: {
          enabled: false,
          host: process.env.QNAP_HOST || '',
          path: '/share/Tatuagens'
        },
        googleDrive: {
          enabled: true,
          folder: 'Agenda Tatuagem'
        }
      },
      notifications: {
        email: {
          enabled: true,
          reminders: {
            '24h': true,
            '2h': true
          },
          aftercare: true
        },
        whatsapp: {
          enabled: false,
          apiUrl: process.env.WHATSAPP_API_URL || ''
        }
      },
      sync: {
        interval: 15, // minutos
        googleCalendar: true,
        googleDrive: true,
        qnap: false
      }
    };

    await fs.writeJson('./config/development.json', devConfig, { spaces: 2 });
    this.setupSteps.push('✅ Configuração de desenvolvimento criada');

    // Criar configuração de produção
    const prodConfig = {
      ...devConfig,
      server: {
        ...devConfig.server,
        port: process.env.PORT || 3001,
        host: '0.0.0.0'
      },
      database: {
        ...devConfig.database,
        backup: {
          ...devConfig.database.backup,
          retention: 90
        }
      }
    };

    await fs.writeJson('./config/production.json', prodConfig, { spaces: 2 });
    this.setupSteps.push('✅ Configuração de produção criada');

    console.log('✅ Sistema configurado\n');
  }

  async createStartupScripts() {
    console.log('🚀 Criando scripts de inicialização...');

    // Script para Windows
    const windowsScript = `@echo off
echo Iniciando Agenda Hibrida - Sistema para Tatuadores
echo ================================================

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

echo Instalando dependencias do backend...
cd /d "%~dp0"
call npm install

echo Instalando dependencias do frontend...
cd /d "%~dp0../agenda-hibrida-frontend"
call npm install

echo Iniciando servidor backend...
cd /d "%~dp0"
start "Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo Iniciando frontend...
cd /d "%~dp0../agenda-hibrida-frontend"
start "Frontend" cmd /k "npm run dev"

echo.
echo Sistema iniciado com sucesso!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:5173
`;

    await fs.writeFile('./start-windows.bat', windowsScript);
    this.setupSteps.push('✅ Script de inicialização para Windows criado');

    // Script para Linux/Mac
    const linuxScript = `#!/bin/bash

echo "Iniciando Agenda Híbrida - Sistema para Tatuadores"
echo "================================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

echo "Node.js versão: $(node --version)"

# Instalar dependências do backend
echo "Instalando dependências do backend..."
npm install

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd ../agenda-hibrida-frontend
npm install
cd ../agenda-hibrida-v2

# Iniciar backend em background
echo "Iniciando servidor backend..."
npm run dev &
BACKEND_PID=$!

# Aguardar um pouco
sleep 3

# Iniciar frontend
echo "Iniciando frontend..."
cd ../agenda-hibrida-frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Sistema iniciado com sucesso!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para parar os serviços"

# Aguardar interrupção
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
`;

    await fs.writeFile('./start-linux.sh', linuxScript);
    await fs.chmod('./start-linux.sh', 0o755);
    this.setupSteps.push('✅ Script de inicialização para Linux/Mac criado');

    // Script de instalação automática
    const installScript = `#!/bin/bash

echo "Instalação Automática - Agenda Híbrida"
echo "======================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "ERRO: npm não encontrado após instalação do Node.js"
    exit 1
fi

echo "Instalando dependências globais..."
npm install -g concurrently nodemon

echo "Instalando dependências do projeto..."
npm install

echo "Configurando banco de dados..."
node scripts/setup-complete.js

echo "Executando testes do sistema..."
node scripts/test-system.js

echo ""
echo "Instalação concluída com sucesso!"
echo "Execute './start-linux.sh' para iniciar o sistema"
`;

    await fs.writeFile('./install.sh', installScript);
    await fs.chmod('./install.sh', 0o755);
    this.setupSteps.push('✅ Script de instalação automática criado');

    console.log('✅ Scripts de inicialização criados\n');
  }

  async generateDocumentation() {
    console.log('📚 Gerando documentação...');

    const readme = `# Agenda Híbrida - Sistema Visual para Tatuadores

## 🎨 Sobre o Projeto

Sistema completo de agenda visual especialmente desenvolvido para tatuadores, com funcionalidades híbridas de armazenamento (local + nuvem) e integrações avançadas.

## ✨ Funcionalidades Principais

### 📅 Sistema de Agendamentos
- Integração completa com Google Calendar
- Status visuais (confirmado, pendente, concluído)
- Lembretes automáticos por email e WhatsApp
- Sincronização bidirecional

### 🎨 Galeria Visual Avançada
- Upload múltiplo de imagens e vídeos
- Categorização automática (Referências, Desenhos Aprovados, Fotos Finais)
- Visualizador com zoom, rotação e navegação
- Busca e filtros inteligentes

### 💰 Sistema de Orçamentos
- Calculadora automática de preços
- Multiplicadores por complexidade, tamanho e localização
- Geração de PDFs profissionais
- Controle de aprovação e status

### ☁️ Armazenamento Híbrido
- **Local**: Acesso direto às pastas do Windows
- **Google Drive**: Backup automático na nuvem
- **QNAP NAS**: Integração com servidores locais
- **Sincronização**: Automática entre todas as fontes

### 👥 Gestão de Clientes
- Cadastro completo com histórico
- Organização automática de arquivos por cliente
- Notas e observações personalizadas
- Relatórios de atividade

## 🚀 Instalação Rápida

### Windows
\`\`\`bash
# 1. Extrair o arquivo ZIP
# 2. Executar como Administrador:
install.bat

# 3. Iniciar o sistema:
start-windows.bat
\`\`\`

### Linux/Mac
\`\`\`bash
# 1. Extrair o arquivo
# 2. Dar permissões:
chmod +x install.sh start-linux.sh

# 3. Instalar:
./install.sh

# 4. Iniciar:
./start-linux.sh
\`\`\`

## ⚙️ Configuração

### 1. Google Calendar e Drive
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou use existente
3. Ative as APIs: Google Calendar API e Google Drive API
4. Crie credenciais OAuth 2.0
5. Configure no arquivo \`.env\`

### 2. Email (SMTP)
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_de_app
\`\`\`

### 3. WhatsApp (Opcional)
\`\`\`env
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=seu_token
\`\`\`

### 4. QNAP (Opcional)
\`\`\`env
QNAP_HOST=192.168.1.100
QNAP_USERNAME=admin
QNAP_PASSWORD=sua_senha
QNAP_SHARE_PATH=/share/Tatuagens
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
agenda-hibrida-v2/
├── server.js              # Servidor principal
├── scripts/               # Scripts de automação
│   ├── sync-manager.js    # Gerenciador de sincronização
│   ├── notification-manager.js # Sistema de notificações
│   ├── test-system.js     # Testes automatizados
│   └── setup-complete.js  # Configuração inicial
├── config/                # Configurações
├── uploads/               # Armazenamento local
├── backups/              # Backups automáticos
└── logs/                 # Logs do sistema

agenda-hibrida-frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── App.jsx          # Aplicação principal
│   └── App.css          # Estilos customizados
└── public/              # Arquivos públicos
\`\`\`

## 🔧 Scripts Disponíveis

### Backend
\`\`\`bash
npm start          # Produção
npm run dev        # Desenvolvimento
npm run test       # Testes
npm run backup     # Backup manual
npm run sync       # Sincronização manual
\`\`\`

### Frontend
\`\`\`bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
\`\`\`

## 🧪 Testes e Monitoramento

### Executar Testes
\`\`\`bash
node scripts/test-system.js
\`\`\`

### Verificar Status
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:5173
- **Relatórios**: ./test-reports/

## 📊 Recursos Avançados

### Sincronização Automática
- Intervalo configurável (padrão: 15 minutos)
- Backup diário às 2h da manhã
- Limpeza automática de arquivos antigos
- Logs detalhados de todas as operações

### Notificações Inteligentes
- Lembretes 24h antes dos agendamentos
- Lembretes 2h antes (para não esquecer)
- Cuidados pós-tatuagem no dia seguinte
- Relatórios semanais por email

### Sistema de Backup
- Backup automático do banco de dados
- Compactação dos arquivos
- Retenção configurável (padrão: 30 dias)
- Sincronização com Google Drive

## 🔒 Segurança

- Variáveis de ambiente para credenciais
- Validação de uploads
- Rate limiting nas APIs
- Logs de auditoria
- Backup criptografado

## 🆘 Solução de Problemas

### Problemas Comuns

**Erro de conexão com Google:**
1. Verifique as credenciais no \`.env\`
2. Execute a autenticação: http://localhost:3001/auth/google
3. Verifique se as APIs estão ativas no Google Cloud

**Servidor não inicia:**
1. Verifique se a porta 3001 está livre
2. Execute \`npm install\` novamente
3. Verifique os logs em \`./logs/\`

**Upload não funciona:**
1. Verifique permissões da pasta \`uploads/\`
2. Verifique espaço em disco
3. Teste com arquivos menores

### Logs e Debug
- **Logs do sistema**: \`./logs/combined.log\`
- **Logs de erro**: \`./logs/error.log\`
- **Relatórios de teste**: \`./test-reports/\`

## 🤝 Suporte

Para suporte e dúvidas:
1. Verifique a documentação
2. Execute os testes do sistema
3. Consulte os logs de erro
4. Entre em contato com o suporte

## 📄 Licença

Este projeto é licenciado sob a MIT License.

---

**Desenvolvido com ❤️ pela equipe Manus**
`;

    await fs.writeFile('./README.md', readme);
    this.setupSteps.push('✅ Documentação README.md criada');

    // Criar guia de configuração detalhado
    const configGuide = `# Guia de Configuração Detalhado

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

Crie o arquivo \`.env\` na raiz do projeto:

\`\`\`env
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
\`\`\`

## 🧪 Verificação da Configuração

### 1. Executar Testes
\`\`\`bash
node scripts/test-system.js
\`\`\`

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
`;

    await fs.writeFile('./docs/CONFIGURACAO.md', configGuide);
    this.setupSteps.push('✅ Guia de configuração detalhado criado');

    console.log('✅ Documentação gerada\n');
  }

  showCompletionSummary() {
    console.log('🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!');
    console.log('===================================\n');

    console.log('📋 Resumo das ações realizadas:');
    this.setupSteps.forEach(step => console.log(`  ${step}`));

    console.log('\n🚀 Próximos passos:');
    console.log('  1. Configure o arquivo .env com suas credenciais');
    console.log('  2. Execute: node scripts/test-system.js');
    console.log('  3. Inicie o sistema:');
    console.log('     - Windows: start-windows.bat');
    console.log('     - Linux/Mac: ./start-linux.sh');
    console.log('  4. Acesse: http://localhost:5173');
    console.log('  5. Conecte sua conta Google');

    console.log('\n📚 Documentação:');
    console.log('  - README.md - Guia geral');
    console.log('  - docs/CONFIGURACAO.md - Configuração detalhada');

    console.log('\n🔧 Comandos úteis:');
    console.log('  - npm run dev (backend)');
    console.log('  - npm run test (testes)');
    console.log('  - node scripts/test-system.js (verificar sistema)');

    console.log('\n✨ Sistema pronto para uso!');
    console.log('===================================\n');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new CompleteSetup();
  setup.runCompleteSetup().catch(console.error);
}

module.exports = CompleteSetup;
