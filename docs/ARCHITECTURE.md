# 🏗️ Arquitetura do Sistema

Documentação técnica da arquitetura do TattooScheduler.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Alto Nível](#arquitetura-de-alto-nível)
- [Backend](#backend)
- [Frontend](#frontend)
- [Banco de Dados](#banco-de-dados)
- [Integrações](#integrações)
- [Fluxos de Dados](#fluxos-de-dados)
- [Segurança](#segurança)
- [Escalabilidade](#escalabilidade)

---

## 🎯 Visão Geral

O TattooScheduler é uma aplicação **híbrida** (local + nuvem) com arquitetura **cliente-servidor** composta por:

- **Frontend SPA**: React 19 + Vite
- **Backend REST API**: Node.js + Express
- **Banco de Dados**: SQLite3 (local)
- **Armazenamento**: Local + Google Drive
- **Sincronização**: Google Calendar + WebSocket

### Características Principais

- ✅ **Offline-first**: Funciona sem internet (dados locais)
- ✅ **Sincronização**: Automática com Google Cloud
- ✅ **Tempo Real**: WebSocket para atualizações instantâneas
- ✅ **Escalável**: Preparado para migração para PostgreSQL/MongoDB
- ✅ **Modular**: Componentes independentes e reutilizáveis

---

## 🏛️ Arquitetura de Alto Nível

```
┌────────────────────────────────────────────────────────────┐
│                         USUÁRIO                             │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Components  │  │   Hooks      │  │   Utils      │    │
│  │  (UI Layer)  │  │  (State)     │  │  (Helpers)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────┐       │
│  │         API Client (Fetch + Retry)             │       │
│  └────────────────────────────────────────────────┘       │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTP/REST + WebSocket
                      ▼
┌────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │  Middleware  │  │  Services    │    │
│  │  (API REST)  │  │ (Auth/CORS)  │  │ (Business)   │    │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘    │
│         │                                     │             │
│         └─────────────────┬───────────────────┘             │
│                           ▼                                 │
│  ┌────────────────────────────────────────────────┐       │
│  │          Database Layer (SQLite3)              │       │
│  └────────────────────────────────────────────────┘       │
│                                                             │
│  ┌────────────────────────────────────────────────┐       │
│  │       WebSocket Server (Socket.io)             │       │
│  └────────────────────────────────────────────────┘       │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                   INTEGRAÇÕES EXTERNAS                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │Google Calendar│ │ Google Drive │  │   Gmail SMTP │    │
│  │   (OAuth2)    │ │   (OAuth2)   │  │  (Opcional)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend

### Estrutura de Diretórios

```
agenda-hibrida-v2/
├── server.js                    # Entry point
├── routes/                      # Rotas da API
│   ├── appointments.js
│   ├── clients.js
│   ├── files.js
│   ├── imports.js
│   └── ...
├── services/                    # Serviços de negócio
│   ├── googleCalendar.js
│   ├── googleDrive.js
│   ├── syncManager.js
│   └── notificationManager.js
├── middleware/                  # Middlewares Express
│   ├── auth.js
│   ├── errorHandler.js
│   ├── validation.js
│   └── rateLimit.js
├── models/                      # Modelos de dados
│   ├── Client.js
│   ├── Appointment.js
│   └── ...
├── utils/                       # Utilitários
│   ├── database.js
│   ├── fileManager.js
│   └── logger.js
├── scripts/                     # Scripts de manutenção
│   ├── setup-complete.js
│   ├── backup.js
│   └── migrations/
├── database/                    # SQL schemas e migrations
│   ├── schema.sql
│   └── migrations/
├── uploads/                     # Armazenamento local
├── backups/                     # Backups automáticos
└── logs/                        # Logs do sistema
```

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|------------|--------|-----------|
| Runtime | Node.js | 22.15.0 | Execução JavaScript no servidor |
| Framework | Express | 5.1.0 | Framework web minimalista |
| Database | SQLite3 | - | Banco de dados local embutido |
| Auth | OAuth2 | - | Autenticação Google |
| WebSocket | Socket.io | - | Comunicação em tempo real |
| File Upload | Multer | - | Gerenciamento de uploads |
| Image Processing | Sharp | - | Processamento e compressão |
| Scheduler | node-cron | - | Agendamento de tarefas |
| HTTP Client | Axios | - | Requisições HTTP |
| Validation | Joi/Zod | - | Validação de schemas |
| Logging | Winston | - | Sistema de logs estruturado |

### Principais Módulos

#### 1. API REST

**Endpoints principais**:
- `/api/appointments` - CRUD de agendamentos
- `/api/clients` - CRUD de clientes
- `/api/files` - Upload e gerenciamento de arquivos
- `/api/tattoo-types` - Tipos de tatuagem
- `/api/budgets` - Sistema de orçamentos
- `/api/google-calendar` - Integração com calendário
- `/api/google-drive` - Integração com drive
- `/api/imports` - Importação de dados
- `/api/sync` - Sincronização manual

#### 2. Autenticação OAuth2

```javascript
// Fluxo de autenticação
1. Usuário acessa /auth/google
2. Redirecionado para consentimento Google
3. Callback em /auth/google/callback
4. Token armazenado em token.json
5. Refresh automático quando expira
```

#### 3. WebSocket Server

```javascript
// Eventos emitidos
- file_synced: Arquivo sincronizado
- sync_progress: Progresso de sincronização
- sync_complete: Sincronização completa
- sync_error: Erro na sincronização
- appointment_created: Novo agendamento
- appointment_updated: Agendamento atualizado
```

#### 4. Cron Jobs

```javascript
// Tarefas agendadas
- Sincronização automática: A cada 15 minutos
- Backup diário: 2h da manhã
- Limpeza de cache: A cada hora
- Notificações de lembrete: A cada 30 minutos
```

---

## 🎨 Frontend

### Estrutura de Diretórios

```
agenda-hibrida-frontend/
├── src/
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes base (shadcn/ui)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ... (30+ componentes)
│   │   ├── CalendarioVisual.jsx
│   │   ├── GoogleDriveExplorer.jsx
│   │   ├── AdvancedGallery.jsx
│   │   ├── BudgetSystem.jsx
│   │   ├── SyncStatusIndicator.jsx
│   │   └── ValidatedInput.jsx
│   ├── utils/                   # Utilitários
│   │   ├── validation.js
│   │   ├── api.js
│   │   └── advancedUpload.js
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useWebSocket.js
│   │   └── useFileUpload.js
│   ├── lib/                     # Bibliotecas auxiliares
│   │   └── utils.js
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos customizados
│   └── main.jsx                 # Entry point
├── public/                      # Arquivos estáticos
├── index.html                   # HTML base
├── vite.config.js               # Configuração Vite
├── tailwind.config.js           # Configuração Tailwind
└── package.json
```

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|------------|--------|-----------|
| Framework | React | 19.1.0 | Biblioteca de UI |
| Build Tool | Vite | 6.3.5 | Build e dev server ultra-rápido |
| Roteamento | React Router | 7.1.1 | Navegação SPA |
| Estilização | Tailwind CSS | 4.0.0 | Framework CSS utilitário |
| UI Components | Radix UI | - | Primitivos acessíveis |
| Ícones | Lucide React | - | Ícones modernos |
| Datas | date-fns | - | Manipulação de datas |
| Validação | Zod | - | Validação de schemas |
| Forms | React Hook Form | - | Gerenciamento de formulários |
| WebSocket | socket.io-client | - | Cliente WebSocket |
| HTTP | Fetch API | - | Requisições HTTP |
| State | useState/useReducer | - | Estado local |
| State Global | Zustand (planejado) | - | Estado global leve |

### Arquitetura de Componentes

#### Hierarquia

```
App.jsx (Root)
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   └── TabList
├── MainContent
│   ├── Dashboard
│   │   ├── StatsCards
│   │   ├── QuickActions
│   │   └── RecentActivity
│   ├── CalendarioVisual
│   │   ├── MonthView
│   │   ├── WeekView
│   │   ├── DayView
│   │   └── ListView
│   ├── Agendamentos
│   │   ├── AppointmentList
│   │   ├── AppointmentForm
│   │   └── AppointmentFilters
│   ├── Clientes
│   │   ├── ClientList
│   │   ├── ClientForm
│   │   └── ClientDetails
│   ├── Galeria
│   │   ├── AdvancedGallery
│   │   ├── FileUploader
│   │   └── Lightbox
│   ├── GoogleDrive
│   │   ├── GoogleDriveExplorer
│   │   ├── FileTree
│   │   └── Breadcrumb
│   └── ...
└── Footer
    └── SyncStatusIndicator
```

#### Padrões de Componentes

**1. Componentes Apresentacionais**:
```jsx
// Apenas UI, sem lógica de negócio
const Button = ({ children, onClick, variant }) => {
  return (
    <button className={cn('base-class', variant)} onClick={onClick}>
      {children}
    </button>
  );
};
```

**2. Componentes de Container**:
```jsx
// Gerencia estado e lógica, passa para componentes apresentacionais
const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : <ClientTable clients={clients} />}
    </div>
  );
};
```

**3. Componentes Compostos**:
```jsx
// Composição de múltiplos componentes
const ValidatedInput = ({ label, error, ...props }) => {
  return (
    <div className="form-group">
      <Label>{label}</Label>
      <Input {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
```

---

## 🗄️ Banco de Dados

### Schema SQLite3

#### Tabelas Principais

**1. `clients`**
```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_created_at ON clients(created_at);
```

**2. `appointments`**
```sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  tattoo_type_id INTEGER,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  google_event_id TEXT UNIQUE,
  price REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types(id)
);

CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date_status ON appointments(start_datetime, status);
CREATE INDEX idx_appointments_google_event_id ON appointments(google_event_id);
```

**3. `tattoo_types`**
```sql
CREATE TABLE tattoo_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  duration_hours INTEGER,
  base_price REAL,
  color TEXT,
  description TEXT
);

CREATE UNIQUE INDEX idx_tattoo_types_name ON tattoo_types(name);
```

**4. `files`**
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT,
  mimetype TEXT,
  size INTEGER,
  path TEXT NOT NULL,
  thumbnail_path TEXT,
  client_id INTEGER,
  appointment_id INTEGER,
  google_drive_id TEXT,
  category TEXT, -- referencias, desenhos_aprovados, processo, fotos_finais, pos_tatuagem
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

CREATE INDEX idx_files_client_id ON files(client_id);
CREATE INDEX idx_files_appointment_id ON files(appointment_id);
CREATE INDEX idx_files_google_drive_id ON files(google_drive_id);
```

**5. `budgets`**
```sql
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  tattoo_type_id INTEGER,
  description TEXT,
  base_price REAL,
  multipliers TEXT, -- JSON: {"complexity": 1.5, "size": 1.2}
  final_price REAL,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types(id)
);

CREATE INDEX idx_budgets_client_id ON budgets(client_id);
CREATE INDEX idx_budgets_status ON budgets(status);
```

**6. `import_logs`**
```sql
CREATE TABLE import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_type TEXT NOT NULL, -- excel_appointments, ics_calendar, etc
  import_source TEXT, -- Nome do arquivo
  status TEXT NOT NULL, -- pending, processing, completed, failed
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_logs_timestamp ON import_logs(timestamp);
```

### Relacionamentos

```
clients (1) ──< (N) appointments
clients (1) ──< (N) files
clients (1) ──< (N) budgets

tattoo_types (1) ──< (N) appointments
tattoo_types (1) ──< (N) budgets

appointments (1) ──< (N) files
```

### Índices de Performance

Todos os índices listados acima foram implementados no script:
`scripts/apply-performance-indexes.js`

Impacto esperado:
- ✅ Consultas 3-5x mais rápidas
- ✅ Filtros e ordenações otimizadas
- ✅ Joins mais eficientes

---

## 🔌 Integrações

### Google Calendar API

**Funcionalidades**:
- ✅ Listar eventos
- ✅ Criar evento
- ✅ Atualizar evento
- ✅ Excluir evento
- ✅ Sincronização bidirecional

**Fluxo de Sincronização**:
```
1. Cron job executa a cada 15 minutos
2. Lista eventos do Google Calendar (últimos 30 dias + próximos 90 dias)
3. Para cada evento:
   - Se não existe localmente: CRIAR
   - Se existe e foi modificado: ATUALIZAR
   - Se existe localmente mas não no Google: EXCLUIR LOCAL ou RECRIAR NO GOOGLE
4. Lista agendamentos locais
5. Para cada agendamento local:
   - Se não tem google_event_id: CRIAR NO GOOGLE
   - Se tem e foi modificado: ATUALIZAR NO GOOGLE
6. Emitir evento WebSocket 'sync_complete'
```

### Google Drive API

**Funcionalidades**:
- ✅ Listar arquivos/pastas
- ✅ Criar pasta
- ✅ Fazer upload
- ✅ Download de arquivo
- ✅ Excluir arquivo/pasta
- ✅ Navegação por breadcrumb

**Estrutura de Pastas**:
```
TattooScheduler_Portfolio/
├── Cliente 1/
│   ├── 01_Referencias/
│   ├── 02_Desenhos_Aprovados/
│   ├── 03_Processo/
│   ├── 04_Fotos_Finais/
│   └── 05_Cuidados_Pos_Tatuagem/
├── Cliente 2/
│   └── ...
└── ...
```

**Fluxo de Upload**:
```
1. Usuário seleciona arquivo no frontend
2. Arquivo comprimido (se imagem) com browser-image-compression
3. Enviado em chunks (1MB cada) se > 5MB
4. Backend salva localmente em /uploads/
5. Processa com Sharp (thumbnails, otimização)
6. Upload para Google Drive (se autenticado)
7. Salva metadados no banco (com google_drive_id)
8. Emite evento WebSocket 'file_synced'
```

---

## 🔄 Fluxos de Dados

### Criar Agendamento Completo

```
[Frontend]
1. Usuário preenche formulário
2. Validação em tempo real (validation.js)
3. Submit do form

[API]
4. POST /api/appointments
5. Validação de dados no backend
6. Verifica se cliente existe
7. Insere no banco (appointments table)
8. Cria evento no Google Calendar
9. Atualiza registro com google_event_id
10. Cria estrutura de pastas no Google Drive (se novo cliente)
11. Retorna sucesso com dados completos

[WebSocket]
12. Emite 'appointment_created' para todos os clientes conectados

[Frontend]
13. Recebe resposta
14. Atualiza lista local
15. Exibe toast de sucesso
16. Redireciona ou fecha modal
```

### Upload de Arquivo Grande

```
[Frontend]
1. Usuário seleciona arquivo (ex: vídeo 100MB)
2. advancedUpload.js divide em chunks de 1MB
3. Comprime se for imagem
4. Para cada chunk:
   - POST /api/files/upload/chunk
   - Atualiza progress bar
   - Se erro: Retry com exponential backoff

[Backend]
5. Recebe cada chunk
6. Salva temporariamente em /uploads/temp/
7. Retorna sucesso

[Frontend]
8. Quando todos os chunks enviados:
   - POST /api/files/finalize

[Backend]
9. Concatena chunks
10. Move para pasta final
11. Gera thumbnail (se imagem)
12. Upload para Google Drive (assíncrono)
13. Salva metadados no banco
14. Remove temporários

[WebSocket]
15. Emite 'file_synced' quando upload para Drive completa

[Frontend]
16. Atualiza galeria
17. Exibe toast de sucesso
```

---

## 🔒 Segurança

### Camadas de Segurança

#### 1. Autenticação
- OAuth 2.0 do Google (não armazena senhas)
- Tokens armazenados localmente (token.json)
- Refresh automático de tokens

#### 2. Autorização
- Verificação de autenticação antes de acessar APIs Google
- Rate limiting (100 req/min geral, 20 uploads/min)

#### 3. Validação
- **Frontend**: Validação em tempo real com Zod
- **Backend**: Validação de schemas com Joi/Zod
- **Upload**: Validação de MIME types e tamanho

#### 4. Sanitização
- Inputs sanitizados contra SQL Injection (prepared statements)
- Proteção contra XSS (Content-Security-Policy)
- Path traversal prevenido em uploads

#### 5. CORS
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

#### 6. Headers de Segurança
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 📈 Escalabilidade

### Limites Atuais (SQLite3)

- **Conexões simultâneas**: ~1000
- **Tamanho do banco**: ~140 TB (teórico)
- **Transações/segundo**: ~50,000 (leitura), ~10,000 (escrita)

**Adequado para**:
- Até ~100,000 agendamentos
- Até ~50,000 clientes
- Até ~1,000,000 arquivos (metadados)

### Plano de Migração (Futuro)

#### PostgreSQL (>100k usuários)
```sql
-- Migração automática planejada
npm run migrate:postgres
```

#### MongoDB (>1M arquivos)
```javascript
// Para metadados de arquivos complexos
// Mantém SQLite para dados relacionais
```

### Horizontal Scaling

#### Load Balancer
```
┌─────────┐
│ Nginx   │
└────┬────┘
     │
     ├──> Backend Instance 1 (port 3001)
     ├──> Backend Instance 2 (port 3002)
     └──> Backend Instance 3 (port 3003)
```

#### Database Sharding (Futuro)
- Por cliente (client_id)
- Por data (timestamp range)

---

## 📚 Referências

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Architecture](https://react.dev/learn/thinking-in-react)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**Documentação mantida pela equipe de desenvolvimento**

*Última atualização: Outubro 2025*

