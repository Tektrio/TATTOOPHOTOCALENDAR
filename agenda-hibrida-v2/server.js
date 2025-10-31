const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const mimeTypes = require('mime-types');
const sharp = require('sharp');
const { readPsd, initializeCanvas } = require('ag-psd');
const { createCanvas } = require('canvas');
const axios = require('axios');

// Inicializar canvas para ag-psd (necessário para processar PSDs sem thumbnail embutido)
initializeCanvas(createCanvas);
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
// const bcrypt = require('bcryptjs'); // Removido - não utilizado
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const http = require('http');
// const QRCode = require('qrcode'); // Removido - não utilizado
const SyncManager = require('./sync-manager');
const FileWatcher = require('./file-watcher');
const { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent, syncGoogleCalendar } = require('./services/googleCalendarService');
const { startTokenMonitoring } = require('./services/googleAuthService');
const folderUtils = require('./utils/folderUtils');
const categoryService = require('./services/categoryService');
const FolderOperationService = require('./services/folderOperationService');
const { getClientsFolder } = require('./utils/pathResolver');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado via WebSocket:', socket.id);
  
  // ▼ EVENTOS DE SINCRONIZAÇÃO MULTI-DESTINO
  socket.on('subscribe:sync', (data) => {
    if (data.fileId) {
      socket.join(`sync:file:${data.fileId}`);
      console.log(`📡 Cliente ${socket.id} inscrito em sync:file:${data.fileId}`);
    }
  });

  socket.on('unsubscribe:sync', (data) => {
    if (data.fileId) {
      socket.leave(`sync:file:${data.fileId}`);
      console.log(`📡 Cliente ${socket.id} desinscrito de sync:file:${data.fileId}`);
    }
  });

  socket.on('subscribe:queue', () => {
    socket.join('sync:queue');
    console.log(`📡 Cliente ${socket.id} inscrito em sync:queue`);
  });

  socket.on('unsubscribe:queue', () => {
    socket.leave('sync:queue');
    console.log(`📡 Cliente ${socket.id} desinscrito de sync:queue`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// Tornar io disponível globalmente para serviços
global.io = io;

const port = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES DE PERFORMANCE
// ============================================

// Compressão Gzip para todas as respostas
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Nível de compressão (0-9, 6 é um bom equilíbrio)
}));

// Cache simples em memória para queries frequentes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Middleware de cache
// eslint-disable-next-line no-unused-vars
function cacheMiddleware(duration) {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < duration) {
      console.log(`💾 Cache HIT: ${key}`);
      return res.send(cachedResponse.data);
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      cache.set(key, {
        data: body,
        timestamp: Date.now()
      });
      res.sendResponse(body);
    };
    next();
  };
}

// Limpar cache expirado a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Middleware CORS
app.use(cors());

// Middleware JSON com limite aumentado para suportar arquivos grandes
app.use(express.json({ limit: '10gb' }));

// Servir arquivos estáticos com cache
app.use(express.static('public', {
  maxAge: '1d', // Cache de 1 dia para arquivos estáticos
  etag: true
}));

app.use('/uploads', express.static(getClientsFolder(), {
  maxAge: '7d', // Cache de 7 dias para uploads
  etag: true
}));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./agenda_hibrida.db');

// Inicializar FolderOperationService
let folderOperationService = null;
try {
  folderOperationService = new FolderOperationService(db);
  console.log('✅ FolderOperationService inicializado');
} catch (err) {
  console.error('⚠️ Erro ao inicializar FolderOperationService:', err);
}

// ============================================
// OTIMIZAÇÕES SQLITE PARA PRODUÇÃO
// ============================================
db.run("PRAGMA journal_mode = WAL", (err) => {
  if (err) console.error('⚠️ Erro ao definir journal_mode:', err);
  else console.log('✅ SQLite: journal_mode = WAL');
});

db.run("PRAGMA synchronous = NORMAL", (err) => {
  if (err) console.error('⚠️ Erro ao definir synchronous:', err);
  else console.log('✅ SQLite: synchronous = NORMAL');
});

db.run("PRAGMA cache_size = -64000", (err) => {
  if (err) console.error('⚠️ Erro ao definir cache_size:', err);
  else console.log('✅ SQLite: cache_size = 64MB');
});

db.run("PRAGMA temp_store = MEMORY", (err) => {
  if (err) console.error('⚠️ Erro ao definir temp_store:', err);
  else console.log('✅ SQLite: temp_store = MEMORY');
});

// Tornar db disponível para as rotas
app.locals.db = db;

// Rotas de importação e sincronização - CORRIGIDO BUG #003
const importsRouter = require('./routes/imports');
const vagaroImportRouter = require('./routes/vagaroImport');
const financialRouter = require('./routes/financial');
const employeesRouter = require('./routes/employees');
const auditLogsRouter = require('./routes/auditLogs');
app.use('/api/imports', importsRouter);
app.use('/api/imports/vagaro', vagaroImportRouter);
app.use('/api/auth', importsRouter);
app.use('/api/sync', importsRouter);
app.use('/api', financialRouter);
app.use('/api', employeesRouter);
app.use('/api/audit-logs', auditLogsRouter);

// ============================================
// ROTAS DE SINCRONIZAÇÃO MULTI-DESTINO
// ============================================
const localStorageRouter = require('./routes/localStorageRouter');
const syncDestinationsRouter = require('./routes/syncDestinationsRouter');
const googleAccountsRouter = require('./routes/googleAccountsRouter');
const qnapRouter = require('./routes/qnapRouter');
const syncMultiRouter = require('./routes/syncRouter');

// Inicializa serviços com dependências
const GoogleDriveMultiAccountService = require('./services/googleDriveMultiAccountService');
const QnapService = require('./services/qnapService');
const LocalStorageService = require('./services/localStorageService');
const AutoSyncWorker = require('./services/autoSyncWorker');

const googleMultiService = new GoogleDriveMultiAccountService(db);
const qnapService = new QnapService(db);

localStorageRouter.initService(db);
syncDestinationsRouter.initService(db);
googleAccountsRouter.initService(db);
qnapRouter.initService(db);
syncMultiRouter.initService(db, io, googleMultiService, qnapService);

// Obter instâncias dos serviços para AutoSyncWorker
const localStorageService = new LocalStorageService(db);
const syncQueue = syncMultiRouter.getSyncQueue ? syncMultiRouter.getSyncQueue() : null;

// Inicializar AutoSyncWorker
let autoSyncWorker = null;
if (syncQueue) {
  autoSyncWorker = new AutoSyncWorker(db, syncQueue, localStorageService);
  autoSyncWorker.start().catch(err => {
    console.error('❌ Erro ao iniciar AutoSyncWorker:', err.message);
  });
  console.log('✅ AutoSyncWorker inicializado');
} else {
  console.warn('⚠️ SyncQueue não disponível, AutoSyncWorker não será iniciado');
}

// Disponibilizar instâncias para as rotas via app.locals
app.locals.syncQueue = syncQueue;
app.locals.autoSyncWorker = autoSyncWorker;

// Registra rotas
app.use('/api/local-storage', localStorageRouter);
app.use('/api/sync-destinations', syncDestinationsRouter);
app.use('/api/google-accounts', googleAccountsRouter);
app.use('/api/qnap', qnapRouter);
app.use('/api/sync-multi', syncMultiRouter);

// Inicializar tabelas do banco
db.serialize(() => {
  // Tabela de configurações do sistema
  db.run(`CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de clientes
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    folder_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de tipos de tatuagem
  db.run(`CREATE TABLE IF NOT EXISTS tattoo_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    duration_hours INTEGER,
    base_price REAL,
    color TEXT,
    description TEXT
  )`);

  // Tabela de agendamentos
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_event_id TEXT,
    client_id INTEGER,
    tattoo_type_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TEXT NOT NULL,
    end_datetime TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    estimated_price REAL,
    actual_price REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types (id)
  )`);

  // Tabela de arquivos
  db.run(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    appointment_id INTEGER,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT NOT NULL,
    storage_type TEXT DEFAULT 'local',
    cloud_path TEXT,
    category TEXT,
    file_type TEXT,
    mime_type TEXT,
    file_size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
  )`);
  
  // Adicionar coluna mime_type se não existir (para bancos existentes)
  db.run(`ALTER TABLE files ADD COLUMN mime_type TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Erro ao adicionar coluna mime_type:', err.message);
    }
  });
  
  // Adicionar coluna deleted_at se não existir (para bancos existentes - soft delete)
  db.run(`ALTER TABLE files ADD COLUMN deleted_at DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Erro ao adicionar coluna deleted_at:', err.message);
    }
  });

  // Tabela de orçamentos
  db.run(`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    appointment_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    tattoo_type_id INTEGER,
    size_cm INTEGER,
    complexity TEXT,
    body_location TEXT,
    colors_count INTEGER,
    sessions_count INTEGER DEFAULT 1,
    base_price REAL,
    complexity_multiplier REAL DEFAULT 1.0,
    size_multiplier REAL DEFAULT 1.0,
    location_multiplier REAL DEFAULT 1.0,
    color_multiplier REAL DEFAULT 1.0,
    session_multiplier REAL DEFAULT 1.0,
    materials_cost REAL DEFAULT 0,
    additional_costs REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    final_price REAL,
    status TEXT DEFAULT 'pending',
    valid_until DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id),
    FOREIGN KEY (tattoo_type_id) REFERENCES tattoo_types (id)
  )`);

  // Tabela de logs de importação - CORRIGIDO BUG #003
  db.run(`CREATE TABLE IF NOT EXISTS import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    import_type TEXT NOT NULL,
    import_source TEXT,
    status TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details TEXT,
    file_name TEXT,
    file_type TEXT,
    total_rows INTEGER DEFAULT 0,
    created_rows INTEGER DEFAULT 0,
    updated_rows INTEGER DEFAULT 0,
    skipped_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    errors TEXT,
    batch_id TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    duration_seconds REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de tokens OAuth do Google - CORRIGIDO BUG #003
  db.run(`CREATE TABLE IF NOT EXISTS google_oauth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'system' NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    scope TEXT,
    token_type TEXT,
    expiry_date INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de configurações de sincronização - CORRIGIDO BUG #003
  db.run(`CREATE TABLE IF NOT EXISTS sync_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Inserir tipos padrão de tatuagem
  const defaultTypes = [
    ['Pequena', 2, 200, '#10B981', 'Tatuagens pequenas até 5cm'],
    ['Média', 4, 400, '#F59E0B', 'Tatuagens médias de 5-15cm'],
    ['Grande', 6, 800, '#EF4444', 'Tatuagens grandes acima de 15cm'],
    ['Sessão Completa', 8, 1200, '#8B5CF6', 'Sessão de 6-8 horas']
  ];

  const stmt = db.prepare(`INSERT OR IGNORE INTO tattoo_types (name, duration_hours, base_price, color, description) VALUES (?, ?, ?, ?, ?)`);
  defaultTypes.forEach(type => stmt.run(type));
  stmt.finalize();

  // Migrações: Adicionar campos que podem estar faltando
  db.run(`ALTER TABLE clients ADD COLUMN avatar_url TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Erro ao adicionar coluna avatar_url:', err);
    } else if (!err) {
      console.log('✅ Coluna avatar_url adicionada à tabela clients');
    }
  });

  // Adicionar outros campos que podem estar faltando na tabela clients
  const clientFields = [
    'birth_date TEXT',
    'gender TEXT',
    'address TEXT',
    'city TEXT',
    'state TEXT',
    'zip_code TEXT',
    'instagram TEXT',
    'emergency_contact TEXT',
    'emergency_phone TEXT',
    'referred_by TEXT',
    'customer_since DATETIME',
    'status TEXT DEFAULT "active"'
  ];

  clientFields.forEach(field => {
    const fieldName = field.split(' ')[0];
    db.run(`ALTER TABLE clients ADD COLUMN ${field}`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error(`Erro ao adicionar coluna ${fieldName}:`, err.message);
      }
    });
  });
});

// ========================================
// ROTAS DE GESTÃO DE CLIENTES
// ========================================
const { registerRoutes } = require('./routes/index');
app.set('db', db); // Disponibilizar db para as rotas
registerRoutes(app);

// Configuração do Google OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Configuração do Google Drive
let driveClient = null;

// 🔄 Gerenciadores de Sincronização
let syncManager = null;
let fileWatcher = null;

/**
 * Inicializar Sistema de Sincronização
 */
// eslint-disable-next-line no-unused-vars
function initializeSyncSystem() {
  try {
    if (!driveClient) {
      console.warn('⚠️ Google Drive não disponível, sincronização desabilitada');
      return;
    }

    const uploadsPath = getClientsFolder();
    console.log(`📁 Pasta de clientes: ${uploadsPath}`);

    // Inicializar Sync Manager
    syncManager = new SyncManager(driveClient, db, uploadsPath);
    console.log('✅ Sync Manager inicializado');

    // Conectar FolderOperationService com SyncManager
    if (folderOperationService) {
      folderOperationService.setSyncManager(syncManager);
      folderOperationService.start();
      console.log('✅ FolderOperationService conectado ao SyncManager e iniciado');
    }

    // Inicializar File Watcher
    fileWatcher = new FileWatcher(syncManager, uploadsPath, db, io);
    fileWatcher.start();
    console.log('✅ File Watcher iniciado');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de sincronização:', error);
  }
}

// Configuração do armazenamento híbrido
class HybridStorage {
  constructor() {
    this.storageMode = process.env.STORAGE_MODE || 'local'; // local, qnap, gdrive, hybrid
    this.qnapConfig = {
      host: process.env.QNAP_HOST,
      username: process.env.QNAP_USERNAME,
      password: process.env.QNAP_PASSWORD,
      sharePath: process.env.QNAP_SHARE_PATH || '/share/Tatuagens'
    };
  }

  async initializeStorage() {
    console.log(`🔧 Inicializando armazenamento: ${this.storageMode}`);
    
    switch (this.storageMode) {
      case 'local':
        await this.initializeLocal();
        break;
      case 'qnap':
        await this.initializeQNAP();
        break;
      case 'gdrive':
        await this.initializeGoogleDrive();
        break;
      case 'hybrid':
        await this.initializeHybrid();
        break;
    }
  }

  async initializeLocal() {
    const localPath = getClientsFolder();
    await fs.ensureDir(localPath);
    console.log(`📁 Armazenamento local: ${localPath}`);
  }

  async initializeQNAP() {
    // Verificar conectividade com QNAP
    try {
      if (this.qnapConfig.host) {
        await axios.get(`http://${this.qnapConfig.host}:8080/cgi-bin/authLogin.cgi`, {
          timeout: 5000
        });
        console.log(`🌐 QNAP conectado: ${this.qnapConfig.host}`);
      }
    } catch (error) {
      console.warn(`⚠️ QNAP não acessível: ${error.message}`);
      console.log('📁 Fallback para armazenamento local');
      await this.initializeLocal();
    }
  }

  async initializeGoogleDrive() {
    try {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        console.log('☁️ Google Drive conectado');
      }
    } catch (error) {
      console.warn(`⚠️ Google Drive não configurado: ${error.message}`);
    }
  }

  async initializeHybrid() {
    await this.initializeLocal();
    await this.initializeQNAP();
    await this.initializeGoogleDrive();
    console.log('🔄 Modo híbrido ativado');
  }

  async saveFile(file, clientName, category = 'outros') {
    const results = [];
    
    // Sempre salvar localmente primeiro
    const localResult = await this.saveToLocal(file, clientName, category);
    results.push(localResult);

    // Salvar na nuvem se configurado
    if (this.storageMode === 'hybrid' || this.storageMode === 'gdrive') {
      try {
        const cloudResult = await this.saveToGoogleDrive(file, clientName, category);
        results.push(cloudResult);
      } catch (error) {
        console.warn('Erro ao salvar no Google Drive:', error.message);
      }
    }

    if (this.storageMode === 'hybrid' || this.storageMode === 'qnap') {
      try {
        const qnapResult = await this.saveToQNAP(file, clientName, category);
        results.push(qnapResult);
      } catch (error) {
        console.warn('Erro ao salvar no QNAP:', error.message);
      }
    }

    return results;
  }

  async saveToLocal(file, clientName, category) {
    const clientFolder = path.join(getClientsFolder(), clientName.replace(/\s+/g, '_'));
    const categoryFolder = path.join(clientFolder, category);
    await fs.ensureDir(categoryFolder);

    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    const filePath = path.join(categoryFolder, filename);

    await fs.writeFile(filePath, file.buffer);

    return {
      storage: 'local',
      path: filePath,
      filename: filename,
      success: true
    };
  }

  async saveToGoogleDrive(file, clientName, category) {
    if (!driveClient) throw new Error('Google Drive não configurado');

    // Criar estrutura de pastas no Google Drive
    const clientFolderId = await this.getOrCreateGDriveFolder(clientName);
    const categoryFolderId = await this.getOrCreateGDriveFolder(category, clientFolderId);

    const fileMetadata = {
      name: file.originalname,
      parents: [categoryFolderId]
    };

    const media = {
      mimeType: file.mimetype,
      body: require('stream').Readable.from(file.buffer)
    };

    const response = await driveClient.files.create({
      resource: fileMetadata,
      media: media
    });

    return {
      storage: 'gdrive',
      fileId: response.data.id,
      filename: file.originalname,
      success: true
    };
  }

  async saveToQNAP(file, clientName, category) {
    // Implementação simplificada - em produção seria via API do QNAP
    const qnapPath = path.join(this.qnapConfig.sharePath, clientName, category);
    
    // Simular salvamento no QNAP
    return {
      storage: 'qnap',
      path: qnapPath,
      filename: file.originalname,
      success: true
    };
  }

  async getOrCreateGDriveFolder(name, parentId = null) {
    const query = parentId 
      ? `name='${name}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder'`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder'`;

    const response = await driveClient.files.list({ q: query });
    
    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Criar pasta se não existir
    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await driveClient.files.create({
      resource: fileMetadata
    });

    return folder.data.id;
  }
}

const hybridStorage = new HybridStorage();

// Configuração do multer para upload híbrido
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10GB - Para suportar arquivos PSD grandes
});

// Middleware de autenticação JWT
// eslint-disable-next-line no-unused-vars
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'agenda_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rotas de autenticação Google (mantidas do sistema anterior)
app.get('/auth/google', (req, res) => {
  // Definir redirectUri dinamicamente baseado na porta atual
  const redirectUri = `http://localhost:${port}/auth/google/callback`;
  oauth2Client.redirectUri = redirectUri;
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    redirect_uri: redirectUri,
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });
  res.json({ authUrl });
});

// Rota GET para receber o código do Google OAuth (redirect)
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Verificar se houve erro do Google (ex: access_denied)
    if (error) {
      console.error('🚨 Erro retornado pelo Google OAuth:', error);
      
      let errorMessage = '';
      let errorDetails = '';
      
      if (error === 'access_denied') {
        errorMessage = '⚠️ Autenticação cancelada ou falhou.';
        errorDetails = `
Se você viu erro "403: access_denied", significa que:

• O app está em modo de TESTE no Google Cloud
• Você precisa ser adicionado como testador autorizado
• OU o app precisa ser publicado em PRODUÇÃO

Consulte o guia "GOOGLE_OAUTH_SOLUCAO_COMPLETA.md" para resolver.
        `.trim();
      } else {
        errorMessage = 'Erro na autenticação Google';
        errorDetails = `Erro: ${error}`;
      }
      
      // Envia erro via postMessage para o frontend
      return res.send(`
        <html>
          <body style="background: #1a1a2e; color: white; font-family: Arial; padding: 40px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ff6b6b;">❌ ${errorMessage}</h1>
              <p style="white-space: pre-line; line-height: 1.6; margin: 20px 0;">${errorDetails}</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 12px 24px; background: #4a4a8a; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Fechar</button>
            </div>
            <script>
              // Envia erro para a janela pai
              if (window.opener) {
                window.opener.postMessage({
                  type: 'google-oauth',
                  error: '403: access_denied - ${errorMessage}. ${errorDetails.replace(/\n/g, ' ')}'
                }, '*');
                
                setTimeout(() => {
                  window.close();
                }, 3000);
              }
            </script>
          </body>
        </html>
      `);
    }
    
    if (!code) {
      return res.send(`
        <html>
          <body style="background: #1a1a2e; color: white; font-family: Arial; display: flex; align-items: center; justify-content: center; height: 100vh;">
            <div style="text-align: center;">
              <h1>❌ Erro na autenticação</h1>
              <p>Código de autorização não recebido.</p>
              <button onclick="window.close()">Fechar</button>
            </div>
          </body>
        </html>
      `);
    }
    
    // ============================================
    // SISTEMA MULTI-CONTA (novo)
    // Envia código via postMessage para o frontend processar
    // ============================================
    console.log('🔐 Callback OAuth recebido - enviando código para frontend via postMessage');
    
    res.send(`
      <html>
        <body style="background: #1a1a2e; color: white; font-family: Arial; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center;">
            <h1>🔄 Processando autenticação...</h1>
            <p>Aguarde enquanto conectamos sua conta Google Drive.</p>
            <script>
              // Envia código OAuth para a janela pai (frontend)
              if (window.opener) {
                window.opener.postMessage({
                  type: 'google-oauth',
                  code: '${code}',
                  state: '${state || ''}'
                }, '*');
                
                // Fecha após enviar
                setTimeout(() => {
                  window.close();
                }, 500);
              } else {
                document.body.innerHTML = \`
                  <div style="text-align: center;">
                    <h1>✅ Código recebido!</h1>
                    <p>Por favor, feche esta janela e retorne ao aplicativo.</p>
                    <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #4a4a8a; color: white; border: none; border-radius: 5px; cursor: pointer;">Fechar</button>
                  </div>
                \`;
              }
            </script>
          </div>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Erro na autenticação Google:', error);
    
    // Detectar erro 403 (access_denied)
    const errorMessage = error.message || error.toString();
    let userMessage = 'Erro na autenticação';
    
    if (errorMessage.includes('403') || errorMessage.includes('access_denied')) {
      userMessage = 'Acesso negado pelo Google (403). O app está em modo de teste ou você não tem permissão.';
      console.error('🚨 ERRO 403: O app precisa ser publicado ou o usuário precisa ser adicionado como testador!');
    } else if (errorMessage.includes('invalid_grant')) {
      userMessage = 'Token inválido ou expirado. Tente fazer login novamente.';
    } else if (errorMessage.includes('redirect_uri_mismatch')) {
      userMessage = 'Redirect URI incorreto. Verifique a configuração no Google Cloud Console.';
    }
    
    res.send(`
      <html>
        <body style="background: #1a1a2e; color: white; font-family: Arial; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center; max-width: 600px; padding: 20px;">
            <h1>❌ Erro na autenticação</h1>
            <p>${userMessage}</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">${errorMessage}</p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #4a4a8a; color: white; border: none; border-radius: 5px; cursor: pointer;">Fechar</button>
          </div>
        </body>
      </html>
    `);
  }
});

app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getAccessToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Salvar tokens
    fs.writeJsonSync('./tokens.json', tokens);
    
    // Inicializar Google Drive and Calendar
    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    // const calendarClient = google.calendar({ version: 'v3', auth: oauth2Client }); // Removido - não utilizado
    
    console.log('✅ Autenticação Google realizada com sucesso');
    console.log('✅ Google Drive conectado');
    console.log('✅ Google Calendar conectado');
    
    res.json({ 
      success: true, 
      message: 'Autenticação realizada com sucesso',
      services: {
        drive: true,
        calendar: true
      }
    });
  } catch (error) {
    console.error('❌ Erro na autenticação Google:', error);
    
    // Detectar erro 403 (access_denied)
    const errorMessage = error.message || error.toString();
    let userMessage = 'Erro na autenticação';
    let errorCode = 500;
    
    if (errorMessage.includes('403') || errorMessage.includes('access_denied')) {
      errorCode = 403;
      userMessage = 'Acesso negado pelo Google (403). O app está em modo de teste ou você não tem permissão.';
      console.error('🚨 ERRO 403: O app precisa ser publicado ou o usuário precisa ser adicionado como testador!');
    } else if (errorMessage.includes('invalid_grant')) {
      errorCode = 401;
      userMessage = 'Token inválido ou expirado. Tente fazer login novamente.';
    } else if (errorMessage.includes('redirect_uri_mismatch')) {
      errorCode = 400;
      userMessage = 'Redirect URI incorreto. Verifique a configuração no Google Cloud Console.';
    }
    
    res.status(errorCode).json({ 
      error: userMessage,
      details: errorMessage,
      code: errorCode
    });
  }
});

app.get('/auth/status', (req, res) => {
  try {
    if (fs.existsSync('./tokens.json')) {
      const tokens = fs.readJsonSync('./tokens.json');
      oauth2Client.setCredentials(tokens);

      const now = Date.now();
      const hasAccess = !!tokens.access_token;
      const notExpired = typeof tokens.expiry_date === 'number' ? tokens.expiry_date > now : true;
      const hasRefresh = !!tokens.refresh_token;
      const authenticated = hasRefresh || (hasAccess && notExpired);

      res.json({ 
        authenticated,
        needsReauth: !hasRefresh || !notExpired,
        services: {
          drive: authenticated,
          calendar: authenticated
        },
        user: {
          hasTokens: true,
          hasRefresh,
          tokenExpiry: tokens.expiry_date || null
        }
      });
    } else {
      res.json({ 
        authenticated: false,
        needsReauth: true,
        services: {
          drive: false,
          calendar: false
        },
        user: {
          hasTokens: false,
          hasRefresh: false,
          tokenExpiry: null
        }
      });
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.json({ 
      authenticated: false, 
      needsReauth: true,
      error: error.message,
      services: {
        drive: false,
        calendar: false
      }
    });
  }
});

// Desconectar Google: apaga tokens e limpa clientes
app.post('/auth/disconnect', async (req, res) => {
  try {
    try {
      if (fs.existsSync('./tokens.json')) {
        await fs.remove('./tokens.json');
      }
    } catch (e) {
      // segue mesmo se falhar
      console.warn('Falha ao remover tokens.json:', e.message);
    }
    oauth2Client.setCredentials({});
    driveClient = null;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ error: 'Erro ao desconectar', details: error.message });
  }
});

// Rotas da API híbrida

// Configuração do sistema
app.get('/api/config', (req, res) => {
  db.get("SELECT value FROM system_config WHERE key = 'storage_mode'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      storageMode: row ? row.value : hybridStorage.storageMode,
      qnapEnabled: !!process.env.QNAP_HOST,
      gdriveEnabled: !!driveClient,
      localPath: getClientsFolder()
    });
  });
});

app.post('/api/config', (req, res) => {
  const { storageMode } = req.body;
  
  db.run(
    "INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)",
    ['storage_mode', storageMode],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      hybridStorage.storageMode = storageMode;
      res.json({ success: true, message: 'Configuração atualizada' });
    }
  );
});

// Tipos de tatuagem
app.get('/api/tattoo-types', (req, res) => {
  db.all("SELECT * FROM tattoo_types ORDER BY name", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/tattoo-types', (req, res) => {
  const { name, duration_hours, base_price, color, description } = req.body;
  
  db.run(
    "INSERT INTO tattoo_types (name, duration_hours, base_price, color, description) VALUES (?, ?, ?, ?, ?)",
    [name, duration_hours, base_price, color, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Clientes
app.get('/api/clients', (req, res) => {
  db.all(`
    SELECT c.*, COUNT(a.id) as appointments_count 
    FROM clients c 
    LEFT JOIN appointments a ON c.id = a.client_id 
    GROUP BY c.id 
    ORDER BY c.name
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Contar total de clientes
app.get('/api/clients/count', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM clients', (err, row) => {
    if (err) {
      console.error('Erro ao contar clientes:', err);
      return res.status(500).json({ error: 'Erro ao contar clientes' });
    }
    res.json({ total: row.total });
  });
});

app.get('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT c.*, COUNT(a.id) as appointments_count 
    FROM clients c 
    LEFT JOIN appointments a ON c.id = a.client_id 
    WHERE c.id = ?
    GROUP BY c.id
  `, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(row);
  });
});

// Obter informações das pastas do cliente (Local, Google Drive, QNAP)
app.get('/api/clients/:id/folders', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação: ID deve ser um número positivo
    const clientId = parseInt(id, 10);
    if (isNaN(clientId) || clientId <= 0) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Buscar dados do cliente
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, phone, folder_path, drive_root_id FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Validação: drive_root_id deve ser alfanumérico se existir
    if (client.drive_root_id && !/^[a-zA-Z0-9_-]+$/.test(client.drive_root_id)) {
      console.warn(`⚠️ drive_root_id inválido para cliente ${clientId}: ${client.drive_root_id}`);
      client.drive_root_id = null; // Ignora ID inválido
    }
    
    // Inicializar resposta
    const folderInfo = {
      local: { available: false, path: '', exists: false },
      drive: { available: false, url: '', id: null },
      qnap: { available: false, path: '' }
    };
    
    // 1. Verificar pasta local
    if (client.folder_path) {
      // Validação: Path traversal protection
      const normalizedPath = path.normalize(client.folder_path);
      if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
        console.error(`⚠️ Tentativa de path traversal detectada: ${client.folder_path}`);
        return res.status(400).json({ error: 'Caminho de pasta inválido' });
      }
      
      const localPath = path.join(getClientsFolder(), normalizedPath);
      folderInfo.local.path = normalizedPath;
      
      try {
        const exists = await fs.pathExists(localPath);
        folderInfo.local.exists = exists;
        folderInfo.local.available = exists;
      } catch (error) {
        console.error('Erro ao verificar pasta local:', error);
      }
    }
    
    // 2. Verificar Google Drive
    if (client.drive_root_id) {
      folderInfo.drive.id = client.drive_root_id;
      folderInfo.drive.url = `https://drive.google.com/drive/folders/${client.drive_root_id}`;
      folderInfo.drive.available = true;
    }
    
    // 3. QNAP - verificar se está configurado
    const qnapEnabled = process.env.QNAP_ENABLED === 'true' || false;
    if (qnapEnabled && process.env.QNAP_HOST && client.folder_path) {
      const qnapPath = path.join(process.env.QNAP_SHARE_PATH || '/share/Tatuagens', client.folder_path);
      folderInfo.qnap.path = qnapPath;
      folderInfo.qnap.available = true;
    }
    
    res.json(folderInfo);
  } catch (error) {
    console.error('Erro ao buscar informações de pastas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Consultar status de sincronização do Google Drive para um cliente
app.get('/api/clients/:id/sync-status', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação: ID deve ser um número positivo
    const clientId = parseInt(id, 10);
    if (isNaN(clientId) || clientId <= 0) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Verificar se o serviço de fila está disponível
    if (!folderOperationService) {
      return res.json({ 
        status: 'idle', 
        message: 'Serviço de sincronização não está habilitado' 
      });
    }
    
    // Buscar operações pendentes ou em processamento para este cliente
    const operation = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM folder_operations_queue 
         WHERE client_id = ? 
         AND (status = 'pending' OR status = 'processing')
         ORDER BY created_at DESC 
         LIMIT 1`,
        [clientId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!operation) {
      // Verificar se já foi concluída recentemente (últimas 24h)
      const recentOperation = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM folder_operations_queue 
           WHERE client_id = ? 
           AND status = 'completed'
           AND updated_at > datetime('now', '-24 hours')
           ORDER BY updated_at DESC 
           LIMIT 1`,
          [clientId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (recentOperation) {
        return res.json({
          status: 'completed',
          operationType: recentOperation.operation_type,
          completedAt: recentOperation.updated_at
        });
      }
      
      // Verificar se há alguma operação falhada
      const failedOperation = await new Promise((resolve, reject) => {
        db.get(
          `SELECT * FROM folder_operations_queue 
           WHERE client_id = ? 
           AND status = 'failed'
           ORDER BY updated_at DESC 
           LIMIT 1`,
          [clientId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (failedOperation) {
        return res.json({
          status: 'error',
          operationType: failedOperation.operation_type,
          error: failedOperation.error,
          attempts: failedOperation.attempts,
          failedAt: failedOperation.updated_at
        });
      }
      
      // Nenhuma operação encontrada
      return res.json({ 
        status: 'idle',
        message: 'Nenhuma operação de sincronização em andamento'
      });
    }
    
    // Operação em andamento
    res.json({
      status: operation.status === 'pending' ? 'pending' : 'syncing',
      operationType: operation.operation_type,
      queuedAt: operation.created_at,
      attempts: operation.attempts
    });
    
  } catch (error) {
    console.error('Erro ao buscar status de sincronização:', error);
    res.status(500).json({ error: error.message });
  }
});

// Abrir pasta QNAP do cliente
app.post('/api/clients/:id/open-qnap-folder', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação: ID deve ser um número positivo
    const clientId = parseInt(id, 10);
    if (isNaN(clientId) || clientId <= 0) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Verificar se QNAP está habilitado
    const qnapEnabled = process.env.QNAP_ENABLED === 'true';
    if (!qnapEnabled) {
      return res.status(400).json({ 
        error: 'QNAP não está habilitado',
        message: 'Configure QNAP_ENABLED=true no arquivo .env'
      });
    }
    
    // Verificar se variáveis necessárias estão configuradas
    if (!process.env.QNAP_HOST) {
      return res.status(400).json({ 
        error: 'QNAP_HOST não configurado',
        message: 'Configure QNAP_HOST no arquivo .env'
      });
    }
    
    // Buscar cliente
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT id, name, phone, folder_path FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    if (!client.folder_path) {
      return res.status(400).json({ 
        error: 'Cliente não possui pasta configurada',
        message: 'Crie a pasta do cliente primeiro'
      });
    }
    
    // Construir URL do QNAP File Station
    const qnapHost = process.env.QNAP_HOST;
    const qnapSharePath = process.env.QNAP_SHARE_PATH || '/share/Tatuagens';
    
    // Normalizar o caminho para URL
    // const folderPathEncoded = encodeURIComponent(path.join(qnapSharePath, client.folder_path)); // Removido - não utilizado
    
    // URL do File Station do QNAP
    // Formato: http://QNAP_HOST:PORT/cgi-bin/filemanager/utilRequest.cgi?func=get_tree&path=/share/folder
    // Ou simplesmente: http://QNAP_HOST/ (File Station abrirá na pasta principal)
    const qnapUrl = `http://${qnapHost}`;
    
    res.json({
      success: true,
      url: qnapUrl,
      path: path.join(qnapSharePath, client.folder_path),
      message: 'URL do QNAP File Station gerada com sucesso',
      note: 'Navegue manualmente até a pasta: ' + path.join(qnapSharePath, client.folder_path)
    });
    
  } catch (error) {
    console.error('Erro ao abrir pasta QNAP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar estrutura de pastas para cliente existente sem pasta
app.post('/api/clients/:id/create-folders', async (req, res) => {
  const { id } = req.params;
  
  // Validação: ID deve ser um número positivo
  const clientId = parseInt(id, 10);
  if (isNaN(clientId) || clientId <= 0) {
    return res.status(400).json({ error: 'ID de cliente inválido' });
  }
  
  try {
    // 1. Buscar cliente
    const client = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM clients WHERE id = ?', [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Validação: Cliente deve ter nome e telefone
    if (!client.name || !client.phone) {
      return res.status(400).json({ error: 'Cliente sem nome ou telefone configurado' });
    }
    
    // 2. Verificar se já tem pasta
    if (client.folder_path) {
      const uploadsPath = getClientsFolder();
      const existingPath = path.join(uploadsPath, client.folder_path);
      const exists = await fs.pathExists(existingPath);
      
      if (exists) {
        return res.status(400).json({ 
          error: 'Cliente já possui pasta configurada',
          folder_path: client.folder_path 
        });
      }
    }
    
    // 3. Gerar nome da pasta
    // const slug = folderUtils.generateNameSlug(client.name); // Removido - não utilizado
    // const phoneClean = folderUtils.formatPhone(client.phone); // Removido - não utilizado
    const folderName = folderUtils.generateFolderName(client.name, client.phone, id);
    
    // 4. Criar estrutura de pastas local
    const uploadsPath = getClientsFolder();
    await fs.ensureDir(uploadsPath);
    
    const folderPath = path.join(uploadsPath, folderName);
    const folderStructure = categoryService.getFolderStructure();
    
    for (const folder of folderStructure) {
      await fs.ensureDir(path.join(folderPath, folder));
    }
    
    // 5. Atualizar banco de dados
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE clients 
         SET folder_path = ?, folder_created_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [folderName, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // 6. Enfileirar criação no Drive (assíncrono)
    const queueEnabled = process.env.FOLDER_OPERATION_QUEUE_ENABLED === 'true';
    if (driveClient && queueEnabled && folderOperationService) {
      try {
        await folderOperationService.enqueue(id, 'create_drive_structure', {
          folderName: folderName,
          structure: folderStructure
        });
        console.log(`📥 Criação de estrutura no Drive enfileirada para cliente ${id}`);
      } catch (queueErr) {
        console.warn('⚠️ Erro ao enfileirar operação no Drive:', queueErr);
      }
    }
    
    console.log(`✅ Pasta criada com sucesso para cliente ${id}: ${folderName}`);
    
    res.json({
      success: true,
      message: 'Pasta criada com sucesso',
      folder_path: folderName,
      created_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar pastas do cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  const { name, email, phone, notes } = req.body;
  
  // 1. Validação de entrada
  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  let tempFolderPath = null;
  let lockPath = null;

  try {
    // 2. Gerar dados da pasta
    // const slug = folderUtils.generateNameSlug(name); // Removido - não utilizado
    // const phoneClean = folderUtils.formatPhone(phone); // Removido - não utilizado
    const tempFolderName = folderUtils.generateFolderName(name, phone, 'temp');
    
    // 3. Tratar colisão de pasta temp
    const uploadsPath = getClientsFolder();
    await fs.ensureDir(uploadsPath);
    
    const finalTempName = await folderUtils.handleFolderCollision(
      uploadsPath, 
      tempFolderName
    );
    
    tempFolderPath = path.join(uploadsPath, finalTempName);

    // 4. Criar lockfile
    lockPath = await folderUtils.createLockfile(tempFolderPath);

    // 5. Inserir no banco
    const clientId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO clients 
         (name, email, phone, notes, folder_path) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, phone, notes, finalTempName],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // 6. Criar estrutura de pastas local
    const folderStructure = categoryService.getFolderStructure();
    for (const folder of folderStructure) {
      await fs.ensureDir(path.join(tempFolderPath, folder));
    }

    // 7. Renomear para incluir ID
    const finalFolderName = folderUtils.generateFolderName(name, phone, clientId);
    const finalFolderPath = path.join(uploadsPath, finalFolderName);
    await fs.move(tempFolderPath, finalFolderPath, { overwrite: false });

    // 8. Atualizar banco com folder_path final
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE clients 
         SET folder_path = ?, folder_created_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [finalFolderName, clientId],
        (err) => err ? reject(err) : resolve()
      );
    });

    // 9. Remover lockfile
    if (lockPath) {
      await folderUtils.removeLockfile(lockPath);
    }

    // 10. Enfileirar criação no Drive (assíncrono)
    const queueEnabled = process.env.FOLDER_OPERATION_QUEUE_ENABLED === 'true';
    if (driveClient && queueEnabled && folderOperationService) {
      try {
        await folderOperationService.enqueue(clientId, 'create_drive_structure', {
          folderName: finalFolderName,
          structure: folderStructure
        });
        console.log(`📥 Criação de estrutura no Drive enfileirada para cliente ${clientId}`);
      } catch (queueErr) {
        console.warn('⚠️ Erro ao enfileirar operação no Drive:', queueErr);
      }
    }

    // 11. Emitir evento Socket.IO (se disponível)
    if (typeof io !== 'undefined' && io) {
      io.emit('client:created', {
        id: clientId,
        name,
        folder_path: finalFolderName
      });
    }

    // 12. Log de auditoria (se disponível)
    // eslint-disable-next-line no-undef
    if (typeof auditLog === 'function') {
      try {
        await auditLog('client', 'create', clientId, { 
          name, 
          phone, 
          folder_path: finalFolderName 
        });
      } catch (auditErr) {
        console.warn('⚠️ Erro ao registrar auditoria:', auditErr);
      }
    }

    console.log(`✅ Cliente ${name} criado com sucesso (ID: ${clientId}, Pasta: ${finalFolderName})`);

    res.json({
      id: clientId,
      message: 'Cliente criado com sucesso',
      folder_path: finalFolderName,
      success: true
    });

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
    
    // Rollback: tentar remover pasta criada
    if (tempFolderPath) {
      try {
        if (await fs.pathExists(tempFolderPath)) {
          await fs.remove(tempFolderPath);
          console.log('🔄 Rollback: pasta temporária removida');
        }
      } catch (rollbackErr) {
        console.error('⚠️ Erro no rollback:', rollbackErr);
      }
    }

    // Remover lockfile se existir
    if (lockPath) {
      try {
        await folderUtils.removeLockfile(lockPath);
      } catch (lockErr) {
        console.error('⚠️ Erro ao remover lockfile:', lockErr);
      }
    }

    res.status(500).json({ 
      error: 'Erro ao criar cliente', 
      details: error.message,
      success: false
    });
  }
});

// GET /api/categories - Obter todas as categorias
app.get('/api/categories', (req, res) => {
  try {
    const categories = categoryService.getAll();
    res.json(categories);
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Agendamentos com integração Google Calendar
app.get('/api/appointments', async (req, res) => {
  try {
    // Buscar do banco local - suporta schema antigo e novo
    db.all(`
      SELECT 
        a.id,
        a.client_id,
        a.tattoo_type_id,
        COALESCE(a.client_name, c.name) as client_name,
        COALESCE(a.date, DATE(a.start_datetime)) as date,
        COALESCE(a.time, TIME(a.start_datetime)) as time,
        COALESCE(a.end_time, TIME(a.end_datetime)) as end_time,
        COALESCE(a.service, a.title) as service,
        a.title,
        COALESCE(a.notes, a.description) as notes,
        a.description,
        a.status,
        a.duration,
        a.google_event_id,
        a.google_calendar_id,
        a.ical_uid,
        a.external_source,
        a.external_id,
        a.last_sync_date,
        a.start_datetime,
        a.end_datetime,
        a.estimated_price,
        a.created_at,
        a.updated_at,
        c.name as client_full_name,
        c.email as client_email,
        c.phone as client_phone,
        c.folder_path as client_folder,
        tt.name as tattoo_type,
        tt.color as type_color
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN tattoo_types tt ON a.tattoo_type_id = tt.id
      ORDER BY 
        COALESCE(a.date, DATE(a.start_datetime)) DESC,
        COALESCE(a.time, TIME(a.start_datetime)) DESC
    `, async (err, localAppointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let allAppointments = localAppointments;

      // Sincronizar com Google Calendar se autenticado
      if (fs.existsSync('./tokens.json')) {
        try {
          const tokens = fs.readJsonSync('./tokens.json');
          oauth2Client.setCredentials(tokens);
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          
          const now = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          
          const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: endDate.toISOString(),
            maxResults: 50,
            singleEvents: true,
            orderBy: 'startTime'
          });

          const googleEvents = response.data.items.map(event => ({
            id: `google_${event.id}`,
            google_event_id: event.id,
            title: event.summary || 'Sem título',
            description: event.description || '',
            start_datetime: event.start.dateTime || event.start.date,
            end_datetime: event.end.dateTime || event.end.date,
            status: getEventStatus(event),
            client_name: extractClientName(event.summary || ''),
            source: 'google'
          }));

          // Combinar eventos locais e do Google (evitar duplicatas)
          const localEventIds = localAppointments.map(a => a.google_event_id).filter(Boolean);
          const newGoogleEvents = googleEvents.filter(e => !localEventIds.includes(e.google_event_id));
          
          allAppointments = [...localAppointments, ...newGoogleEvents];
        } catch (error) {
          console.error('Erro ao sincronizar com Google Calendar:', error);
        }
      }

      res.json(allAppointments);
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { title, description, start_datetime, end_datetime, client_id, tattoo_type_id, estimated_price, date, time, end_time, service, notes } = req.body;
    
    // Validação: start_datetime é obrigatório
    if (!start_datetime || start_datetime.trim() === '') {
      return res.status(400).json({ 
        error: 'start_datetime é obrigatório e deve ser uma data válida' 
      });
    }

    // Validar formato de data
    const dateObj = new Date(start_datetime);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ 
        error: 'start_datetime deve ser uma data válida no formato ISO 8601' 
      });
    }
    
    // Salvar no banco local primeiro
    db.run(
      `INSERT INTO appointments 
       (client_id, tattoo_type_id, title, description, start_datetime, end_datetime, estimated_price, date, time, end_time, service, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [client_id, tattoo_type_id, title, description, start_datetime, end_datetime, estimated_price, date, time, end_time, service, notes, 'scheduled'],
      async function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const appointmentId = this.lastID;
        let googleSyncResult = null;

        // Tentar criar no Google Calendar
        try {
          const appointmentData = {
            id: appointmentId,
            client_id,
            title: title || service,
            description: notes || description,
            date: date || start_datetime?.split('T')[0],
            time: time || start_datetime?.split('T')[1]?.substring(0, 5),
            end_time: end_time || end_datetime?.split('T')[1]?.substring(0, 5),
            notes
          };

          googleSyncResult = await createGoogleEvent(db, appointmentData);
          console.log('✅ Agendamento sincronizado com Google Calendar:', googleSyncResult.googleEventId);
        } catch (googleError) {
          console.warn('⚠️ Não foi possível sincronizar com Google Calendar:', googleError.message);
          // Não falhar a requisição se apenas o Google falhar
        }

        // Criar pasta do cliente se não existir
        if (client_id) {
          db.get("SELECT folder_path FROM clients WHERE id = ?", [client_id], async (err, client) => {
            if (client) {
              await hybridStorage.initializeStorage();
              // Criar estrutura de pastas
              const clientFolder = path.join(getClientsFolder(), client.folder_path);
              await fs.ensureDir(path.join(clientFolder, 'referencias'));
              await fs.ensureDir(path.join(clientFolder, 'desenhos_aprovados'));
              await fs.ensureDir(path.join(clientFolder, 'fotos_finais'));
            }
          });
        }

        res.json({ 
          id: appointmentId, 
          googleEventId: googleSyncResult?.googleEventId || null,
          googleCalendarLink: googleSyncResult?.htmlLink || null,
          success: true 
        });
      }
    );
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Upload híbrido de arquivos
app.post('/api/clients/:clientId/upload/:category', upload.array('files', 10), async (req, res) => {
  try {
    const { clientId, category } = req.params;
    
    // Buscar dados do cliente
    db.get("SELECT * FROM clients WHERE id = ?", [clientId], async (err, client) => {
      if (err || !client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const uploadResults = [];
      
      // Mapear categoria para o novo caminho
      let categoryPath;
      try {
        categoryPath = categoryService.getPath(category);
      } catch (error) {
        console.warn(`⚠️ Categoria não mapeada, usando valor original: ${category}`);
        categoryPath = category;
      }
      
      for (const file of req.files) {
        try {
          // Validar arquivo contra categoria
          const fileExt = path.extname(file.originalname).substring(1);
          const validation = categoryService.validate(category, fileExt, file.size);
          
          if (!validation.valid) {
            console.warn(`⚠️ Arquivo rejeitado: ${validation.error}`);
            uploadResults.push({
              name: file.originalname,
              error: validation.error,
              success: false
            });
            continue;
          }

          // Salvar usando armazenamento híbrido com caminho mapeado
          const results = await hybridStorage.saveFile(file, client.folder_path, categoryPath);
          
          // Registrar no banco (usar categoryPath no file_path)
          const primaryResult = results[0]; // Resultado local sempre primeiro
          db.run(
            `INSERT INTO files 
             (client_id, filename, original_name, file_path, storage_type, category, file_type, mime_type, file_size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              clientId,
              primaryResult.filename,
              file.originalname,
              primaryResult.path,
              primaryResult.storage,
              categoryPath, // Usar caminho mapeado
              getFileType(file.originalname),
              file.mimetype,
              file.size
            ]
          );

          uploadResults.push({
            name: primaryResult.filename,
            originalName: file.originalname,
            category: category,
            categoryPath: categoryPath,
            size: file.size,
            type: getFileType(file.originalname),
            storageResults: results,
            success: true
          });
        } catch (error) {
          console.error('Erro ao fazer upload:', error);
          uploadResults.push({
            name: file.originalname,
            error: error.message,
            success: false
          });
        }
      }

      // Emitir evento via WebSocket para atualização em tempo real
      io.emit('files_uploaded', {
        clientId: clientId,
        category: category,
        files: uploadResults
      });

      res.json({ 
        success: true, 
        message: `${uploadResults.length} arquivo(s) enviado(s) com sucesso`,
        files: uploadResults,
        storageMode: hybridStorage.storageMode
      });
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload de arquivos' });
  }
});

// ===== FUNÇÃO OTIMIZADA PARA EXTRAIR THUMBNAIL DE ARQUIVOS PSD (SEM LIMITE DE TAMANHO) =====
async function extractPsdThumbnail(psdFilePath) {
  try {
    console.log('🎨 Extraindo thumbnail de PSD:', psdFilePath);
    
    // Obter tamanho do arquivo
    const stats = await fs.stat(psdFilePath);
    const fileSizeGB = (stats.size / 1024 / 1024 / 1024).toFixed(2);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    const displaySize = stats.size > 1024 * 1024 * 1024 ? `${fileSizeGB} GB` : `${fileSizeMB} MB`;
    
    console.log(`📊 Tamanho do arquivo: ${displaySize}`);
    
    // Ler o arquivo PSD
    console.log('📖 Lendo arquivo PSD...');
    const psdBuffer = await fs.readFile(psdFilePath);
    console.log('✅ Arquivo lido com sucesso');
    
    // Parse do PSD usando ag-psd
    // SEMPRE pular a imagem composta para economizar memória (pode ser gigante em arquivos grandes)
    // SEMPRE tentar ler o thumbnail embutido (é pequeno, ~160x160, mesmo em arquivos de GB)
    console.log('🔍 Extraindo APENAS thumbnail embutido (otimizado para arquivos de qualquer tamanho)');
    
    const psd = readPsd(psdBuffer, {
      skipCompositeImageData: true,  // SEMPRE pular imagem composta (pode ter vários GB)
      skipLayerImageData: true,      // SEMPRE pular layers individuais
      skipThumbnail: false,          // SEMPRE tentar ler o thumbnail embutido (pequeno)
      skipLayerThumbnails: true      // Pular thumbnails das layers
    });
    
    console.log('✅ Parse do PSD concluído');
    
    // PRIORIDADE 1: Usar o thumbnail embutido (pequeno, rápido, funciona para qualquer tamanho de arquivo)
    if (psd.thumbnail && psd.thumbnail.data) {
      const { width, height, data } = psd.thumbnail;
      console.log(`✅ THUMBNAIL EMBUTIDO encontrado! Dimensões: ${width}x${height}`);
      console.log('⚡ Processando thumbnail (muito rápido, sem limitação de tamanho)...');
      
      // ImageData está em formato RGBA, precisamos converter para buffer
      const buffer = Buffer.from(data.buffer);
      
      // Criar imagem com Sharp a partir do buffer raw
      const thumbnailBuffer = await sharp(buffer, {
        raw: {
          width: width,
          height: height,
          channels: 4 // RGBA
        }
      })
      .png({ quality: 90, compressionLevel: 6 })
      .toBuffer();
      
      console.log('✅ Thumbnail processado com sucesso!');
      return thumbnailBuffer;
    }
    
    // PRIORIDADE 2: Se não houver thumbnail, tentar imageResources (algumas versões do Photoshop)
    if (psd.imageResources && Array.isArray(psd.imageResources)) {
      console.log('🔍 Thumbnail principal não encontrado, procurando recursos alternativos...');
      
      // Recurso 1033 ou 1036 podem conter thumbnails
      const thumbnailResource = psd.imageResources.find(r => r && (r.id === 1033 || r.id === 1036));
      
      if (thumbnailResource && thumbnailResource.data) {
        console.log('✅ Recurso de thumbnail alternativo encontrado!');
        // Tentar processar como JPEG (formato comum em recursos)
        try {
          return await sharp(thumbnailResource.data)
            .png({ quality: 90 })
            .toBuffer();
        } catch (e) {
          console.log('⚠️ Não foi possível processar recurso de thumbnail alternativo:', e.message);
        }
      }
    }
    
    // PRIORIDADE 3 (NÍVEL 3): Se não houver thumbnail, extrair imagem composta completa
    console.log('⚠️ [NÍVEL 3] PSD sem thumbnail embutido, tentando extrair imagem composta (mais lento)...');
    console.log('📊 Este processo pode levar 30-90 segundos para arquivos grandes...');
    
    // Re-ler o PSD com a imagem composta (mas limitada)
    try {
      const startTime = Date.now();
      console.log('📖 [NÍVEL 3] Re-lendo PSD para extrair imagem composta...');
      
      const psdWithImage = readPsd(psdBuffer, {
        skipCompositeImageData: false, // Carregar imagem composta
        skipLayerImageData: true,       // Pular layers individuais (não precisamos)
        skipThumbnail: false           // Tentar thumbnail também
      });
      
      console.log('🔍 [NÍVEL 3] Verificando imageData:', {
        hasImageData: !!psdWithImage.imageData,
        hasCanvas: !!(psdWithImage.canvas),
        width: psdWithImage.width,
        height: psdWithImage.height
      });
      
      // Opção 1: Usar canvas diretamente se disponível (canvas já renderizado pelo ag-psd)
      if (psdWithImage.canvas) {
        console.log(`✅ [NÍVEL 3] Canvas encontrado: ${psdWithImage.canvas.width}x${psdWithImage.canvas.height}`);
        
        // Converter canvas para PNG buffer
        const pngBuffer = psdWithImage.canvas.toBuffer('image/png');
        
        // Redimensionar para thumbnail com Sharp
        const thumbnailBuffer = await sharp(pngBuffer)
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ quality: 85, compressionLevel: 6 })
          .toBuffer();
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ [NÍVEL 3] Thumbnail gerado do canvas em ${elapsed}s`);
        return thumbnailBuffer;
      }
      
      // Opção 2: Usar imageData se canvas não estiver disponível
      if (psdWithImage.imageData && psdWithImage.imageData.data) {
        const { width, height, data } = psdWithImage.imageData;
        console.log(`✅ [NÍVEL 3] ImageData encontrada: ${width}x${height}`);
        
        // Converter imageData para buffer
        const buffer = Buffer.from(data.buffer || data);
        
        // Criar thumbnail com Sharp a partir dos dados raw
        const thumbnailBuffer = await sharp(buffer, {
          raw: {
            width: width,
            height: height,
            channels: 4 // RGBA
          }
        })
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ quality: 85, compressionLevel: 6 })
        .toBuffer();
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ [NÍVEL 3] Thumbnail gerado do imageData em ${elapsed}s`);
        return thumbnailBuffer;
      }
      
      // Opção 3: Tentar renderizar manualmente com canvas
      if (psdWithImage.width && psdWithImage.height) {
        console.log(`🎨 [NÍVEL 3] Tentando renderizar PSD manualmente: ${psdWithImage.width}x${psdWithImage.height}`);
        
        // Criar canvas manualmente
        const canvas = createCanvas(psdWithImage.width, psdWithImage.height);
        const ctx = canvas.getContext('2d');
        
        // Preencher com branco (fundo padrão)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, psdWithImage.width, psdWithImage.height);
        
        // Renderizar camadas se disponíveis
        if (psdWithImage.children && psdWithImage.children.length > 0) {
          console.log(`📚 [NÍVEL 3] Renderizando ${psdWithImage.children.length} camadas...`);
          // Aqui normalmente renderizaríamos as camadas, mas é complexo
          // Por enquanto, vamos apenas usar o fundo branco
        }
        
        const pngBuffer = canvas.toBuffer('image/png');
        const thumbnailBuffer = await sharp(pngBuffer)
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ quality: 85, compressionLevel: 6 })
          .toBuffer();
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ [NÍVEL 3] Thumbnail gerado por renderização manual em ${elapsed}s`);
        return thumbnailBuffer;
      }
      
    } catch (compositeError) {
      console.error('❌ [NÍVEL 3] Erro ao tentar extrair imagem composta:', compositeError.message);
      console.error('📝 Stack:', compositeError.stack);
    }
    
    // Se não houver thumbnail nem imagem composta, retornar null (fallback para ícone)
    console.log('⚠️ PSD sem thumbnail ou imagem composta disponível');
    console.log('💡 Dica: Salve o PSD com "Maximizar Compatibilidade" ativado no Photoshop para gerar thumbnails mais rapidamente');
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao extrair thumbnail de PSD:', error.message);
    
    // Mensagens de erro mais específicas
    if (error.message.includes('ENOMEM') || error.message.includes('allocation')) {
      console.error('💥 ERRO DE MEMÓRIA: Arquivo PSD muito grande ou corrompido');
      console.error('💡 Solução: Salve novamente o PSD no Photoshop com "Maximizar Compatibilidade"');
    } else if (error.message.includes('Invalid') || error.message.includes('parse')) {
      console.error('💥 ERRO DE FORMATO: Arquivo PSD pode estar corrompido');
    }
    
    console.error('📝 Stack trace:', error.stack);
    return null;
  }
}

// Listar arquivos do cliente
app.get('/api/clients/:clientId/files', (req, res) => {
  const { clientId } = req.params;
  const { category } = req.query;
  
  // Construir query SQL com filtro de categoria opcional
  let query = "SELECT * FROM files WHERE client_id = ? AND deleted_at IS NULL";
  const params = [clientId];
  
  if (category && category !== 'all') {
    query += " AND category = ?";
    params.push(category);
  }
  
  query += " ORDER BY uploaded_at DESC";

  db.all(query, params, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(files);
  });
});

// Listar arquivos deletados (lixeira) do cliente
app.get('/api/clients/:clientId/trash', (req, res) => {
  try {
    const { clientId } = req.params;
    const clientIdInt = parseInt(clientId, 10);
    
    // Validar ID do cliente
    if (isNaN(clientIdInt) || clientIdInt <= 0) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    
    // Buscar arquivos deletados
    const query = `
      SELECT 
        *,
        datetime(deleted_at) as deleted_at_formatted
      FROM files 
      WHERE client_id = ? 
        AND deleted_at IS NOT NULL 
      ORDER BY deleted_at DESC
    `;
    
    db.all(query, [clientIdInt], (err, files) => {
      if (err) {
        console.error('Erro ao buscar arquivos deletados:', err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        count: files.length,
        files: files
      });
    });
  } catch (error) {
    console.error('Erro ao processar requisição de lixeira:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir arquivos com otimização e cache de thumbnails
app.get('/api/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  const { width, height, quality, thumbnail } = req.query;
  
  db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, file) => {
    if (err || !file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    try {
      if (file.storage_type === 'local' && fs.existsSync(file.file_path)) {
        const mimeType = mimeTypes.lookup(file.file_path);
        
        // Se é imagem e solicitou redimensionamento/thumbnail
        if (mimeType && mimeType.startsWith('image/') && (width || height || quality || thumbnail)) {
          const w = width ? parseInt(width) : (thumbnail === 'true' ? 300 : null);
          const h = height ? parseInt(height) : (thumbnail === 'true' ? 300 : null);
          const q = quality ? parseInt(quality) : 80;
          
          // Criar nome do arquivo de cache
          const cacheDir = path.join(__dirname, 'thumbnails_cache');
          await fs.ensureDir(cacheDir);
          
          const fileExt = path.extname(file.file_path);
          const cacheFileName = `${fileId}_${w || 'auto'}x${h || 'auto'}_q${q}${fileExt}`;
          const cachePath = path.join(cacheDir, cacheFileName);
          
          // Se já existe cache, servir do cache
          if (await fs.pathExists(cachePath)) {
            console.log(`📦 Servindo thumbnail do cache: ${cacheFileName}`);
            return res.sendFile(path.resolve(cachePath));
          }
          
          // Gerar thumbnail e salvar no cache
          console.log(`🖼️ Gerando thumbnail: ${cacheFileName}`);
          let image = sharp(file.file_path);
          
          // Obter metadados da imagem
          const metadata = await image.metadata();
          
          // Configurar redimensionamento
          if (w || h) {
            image = image.resize(w, h, { 
              fit: 'cover',
              position: 'center',
              withoutEnlargement: true 
            });
          }
          
          // Configurar qualidade baseado no formato
          if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            image = image.jpeg({ quality: q });
          } else if (metadata.format === 'png') {
            image = image.png({ quality: q, compressionLevel: 9 });
          } else if (metadata.format === 'webp') {
            image = image.webp({ quality: q });
          }
          
          // Salvar no cache
          await image.toFile(cachePath);
          
          // Servir o thumbnail
          res.set('Content-Type', mimeType);
          res.set('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
          res.sendFile(path.resolve(cachePath));
          
        } else {
          // Servir arquivo original
          res.sendFile(path.resolve(file.file_path));
        }
      } else {
        res.status(404).json({ error: 'Arquivo não acessível' });
      }
    } catch (error) {
      console.error('Erro ao servir arquivo:', error);
      res.status(500).json({ error: 'Erro ao servir arquivo' });
    }
  });
});

// ===== FUNÇÃO AUXILIAR: BAIXAR ARQUIVO TEMPORÁRIO DO GOOGLE DRIVE OU QNAP =====
async function downloadTemporaryFile(file, storageType, driveClient) {
  const tempDir = path.join(__dirname, 'temp_downloads');
  await fs.ensureDir(tempDir);
  
  const tempFilePath = path.join(tempDir, `${file.id}_${file.original_name || 'file'}`);
  
  console.log(`⬇️ [TEMP] Baixando arquivo temporário de ${storageType}...`);
  
  if (storageType === 'google_drive') {
    // Baixar do Google Drive
    if (!driveClient) {
      throw new Error('Google Drive não configurado');
    }
    
    const driveFileId = file.drive_id || file.id;
    const response = await driveClient.files.get({
      fileId: driveFileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    
    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(tempFilePath);
      response.data
        .on('end', () => {
          console.log(`✅ [TEMP] Download temporário concluído`);
          resolve(tempFilePath);
        })
        .on('error', reject)
        .pipe(dest);
    });
  } else if (storageType === 'qnap') {
    // Baixar do QNAP (implementar conforme configuração do QNAP)
    // Por enquanto, assumir que o file_path já aponta para o caminho montado
    if (file.file_path && await fs.pathExists(file.file_path)) {
      return file.file_path; // Já está acessível
    } else {
      throw new Error('QNAP não configurado ou arquivo não acessível');
    }
  }
  
  throw new Error(`Storage type não suportado: ${storageType}`);
}

// ===== FUNÇÃO AUXILIAR: GERAR THUMBNAIL UNIVERSAL (LOCAL, GOOGLE DRIVE, QNAP) =====
async function generateUniversalThumbnail(file, sizeInt, driveClient) {
  const fileExt = path.extname(file.original_name || file.filename || '').toLowerCase();
  const mimeType = file.mime_type || mimeTypes.lookup(file.original_name || '') || 'application/octet-stream';
  const isPsd = fileExt === '.psd' || mimeType === 'image/vnd.adobe.photoshop';
  const isImage = isPsd || mimeType.startsWith('image/');
  
  if (!isImage) {
    throw new Error('Arquivo não é uma imagem');
  }
  
  // Determinar diretório de cache
  const cacheDir = isPsd 
    ? path.join(__dirname, 'psd_thumbnails_cache')
    : path.join(__dirname, 'thumbnails_cache');
  await fs.ensureDir(cacheDir);
  
  // Nome do cache com identificador do storage
  const storagePrefix = file.storage_type || 'local';
  const cacheFileName = isPsd 
    ? `${storagePrefix}_psd_thumb_${file.id}_${sizeInt}.png`
    : `${storagePrefix}_thumb_${file.id}_${sizeInt}${fileExt}`;
  const cachePath = path.join(cacheDir, cacheFileName);
  
  // Se já existe cache, retornar path do cache
  if (await fs.pathExists(cachePath)) {
    console.log(`📦 [THUMBNAIL] Usando cache: ${cacheFileName}`);
    return cachePath;
  }
  
  // **NÍVEL 2: Para Google Drive e PSDs, tentar thumbnail da API primeiro**
  if (isPsd && file.storage_type === 'google_drive' && driveClient) {
    try {
      console.log(`🌐 [NÍVEL 2] Tentando obter thumbnail do Google Drive API para PSD...`);
      
      const driveFileId = file.drive_id || file.id;
      const metadata = await driveClient.files.get({
        fileId: driveFileId,
        fields: 'id, name, thumbnailLink'
      });
      
      if (metadata.data.thumbnailLink) {
        console.log(`✅ [NÍVEL 2] Thumbnail do Google Drive encontrado!`);
        
        // Baixar thumbnail do Google Drive
        const axios = require('axios');
        const response = await axios.get(metadata.data.thumbnailLink, {
          responseType: 'arraybuffer',
          headers: {
            'Authorization': `Bearer ${driveClient._options.auth.credentials.access_token}`
          }
        });
        
        // Processar thumbnail com Sharp
        await sharp(response.data)
          .resize(sizeInt, sizeInt, { 
            fit: 'cover',
            position: 'center'
          })
          .png({ quality: 85, compressionLevel: 6 })
          .toFile(cachePath);
        
        console.log(`✅ [NÍVEL 2] Thumbnail salvo do Google Drive API: ${cacheFileName}`);
        return cachePath;
      } else {
        console.log(`⚠️ [NÍVEL 2] Google Drive não tem thumbnail para este PSD`);
      }
    } catch (gdriveError) {
      console.log(`⚠️ [NÍVEL 2] Erro ao tentar Google Drive API:`, gdriveError.message);
      console.log(`➡️ [NÍVEL 2] Continuando para Nível 3 (processamento completo)...`);
    }
  }
  
  // Obter path do arquivo (local ou baixar temporário)
  let filePath;
  let isTempFile = false;
  
  if (file.storage_type === 'local') {
    filePath = file.file_path;
  } else {
    filePath = await downloadTemporaryFile(file, file.storage_type, driveClient);
    isTempFile = true;
  }
  
  try {
    // ===== PROCESSAR ARQUIVOS PSD =====
    if (isPsd) {
      console.log(`🎨 [PSD] Processando arquivo PSD de ${file.storage_type}...`);
      
      const psdImageBuffer = await extractPsdThumbnail(filePath);
      
      if (!psdImageBuffer) {
        throw new Error('PSD sem thumbnail embutido');
      }
      
      await sharp(psdImageBuffer)
        .resize(sizeInt, sizeInt, { 
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(cachePath);
      
      console.log(`✅ [PSD] Thumbnail gerado: ${cacheFileName}`);
    } else {
      // ===== PROCESSAR IMAGENS NORMAIS =====
      console.log(`🖼️ [IMAGE] Processando imagem de ${file.storage_type}...`);
      
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      console.log(`📐 [THUMBNAIL] ${metadata.width}x${metadata.height}, formato: ${metadata.format}`);
      
      let pipeline = image.resize(sizeInt, sizeInt, { 
        fit: 'cover',
        position: 'center'
      });
      
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        pipeline = pipeline.jpeg({ quality: 80 });
      } else if (metadata.format === 'png') {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
      } else if (metadata.format === 'webp') {
        pipeline = pipeline.webp({ quality: 80 });
      }
      
      await pipeline.toFile(cachePath);
      console.log(`✅ [IMAGE] Thumbnail gerado: ${cacheFileName}`);
    }
    
    return cachePath;
  } finally {
    // Limpar arquivo temporário se foi baixado
    if (isTempFile && await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      console.log(`🗑️ [TEMP] Arquivo temporário removido`);
    }
  }
}

// ===== ROTA UNIVERSAL DE THUMBNAILS (LOCAL, GOOGLE DRIVE, QNAP) =====
app.get('/api/files/:fileId/thumbnail', async (req, res) => {
  const { fileId } = req.params;
  const size = req.query.size || '300';
  const sizeInt = parseInt(size);
  
  console.log(`🖼️ [THUMBNAIL] Requisição: ${fileId}, tamanho: ${sizeInt}px`);
  
  db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, file) => {
    if (err || !file) {
      console.log(`❌ [THUMBNAIL] Arquivo ${fileId} não encontrado`);
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    const storageType = file.storage_type || 'local';
    console.log(`📁 [THUMBNAIL] ${file.original_name}, storage: ${storageType}`);
    
    try {
      const thumbnailPath = await generateUniversalThumbnail(file, sizeInt, driveClient);
      
      const mimeType = mimeTypes.lookup(thumbnailPath) || 'image/png';
      res.set('Content-Type', mimeType);
      res.set('Cache-Control', 'public, max-age=31536000');
      res.sendFile(path.resolve(thumbnailPath));
      
      console.log(`✅ [THUMBNAIL] Servido com sucesso`);
    } catch (error) {
      console.error(`❌ [THUMBNAIL] Erro:`, error.message);
      
      if (error.message.includes('PSD sem thumbnail') || error.message.includes('não é uma imagem')) {
        return res.status(400).json({ 
          error: error.message,
          useFallback: true 
        });
      }
      
      res.status(500).json({ error: 'Erro ao gerar thumbnail', details: error.message });
    }
  });
});

// Compatibilidade: endpoint de download usado por algumas UIs antigas
app.get('/api/files/:fileId/download', async (req, res) => {
  const { fileId } = req.params;
  db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, file) => {
    if (err || !file) return res.status(404).json({ error: 'Arquivo não encontrado' });
    try {
      if (file.storage_type === 'local' && fs.existsSync(file.file_path)) {
        res.download(path.resolve(file.file_path), file.original_name || file.filename);
      } else {
        res.status(404).json({ error: 'Arquivo não acessível' });
      }
    } catch (error) {
      console.error('Erro no download:', error);
      res.status(500).json({ error: 'Erro no download do arquivo' });
    }
  });
});

// Preview de arquivos (imagens e PDFs)
app.get('/api/files/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação: ID deve ser um número positivo
    const fileId = parseInt(id, 10);
    if (isNaN(fileId) || fileId <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    // Buscar arquivo no banco
    const file = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Verificar se o tipo de arquivo é suportado para preview
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!supportedTypes.includes(file.mime_type)) {
      return res.status(400).json({ 
        error: 'Tipo de arquivo não suportado para preview',
        supportedTypes 
      });
    }
    
    let filePath = null;
    let isTempFile = false;
    
    // Determinar o caminho do arquivo baseado no storage_type
    if (file.storage_type === 'local') {
      filePath = file.file_path;
      
      // Verificar se o arquivo existe
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return res.status(404).json({ error: 'Arquivo físico não encontrado' });
      }
    } else {
      // Para Google Drive ou QNAP, fazer download temporário
      try {
        filePath = await downloadTemporaryFile(file, file.storage_type, driveClient);
        isTempFile = true;
      } catch (error) {
        console.error('Erro ao baixar arquivo para preview:', error);
        return res.status(500).json({ error: 'Erro ao preparar arquivo para preview' });
      }
    }
    
    // Configurar headers apropriados para visualização inline
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name || file.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache de 1 hora
    
    // Enviar arquivo
    const fileStream = require('fs').createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Erro ao ler arquivo para preview:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao ler arquivo' });
      }
    });
    
    fileStream.on('end', async () => {
      // Limpar arquivo temporário se necessário
      if (isTempFile) {
        try {
          await fs.remove(filePath);
        } catch (err) {
          console.warn('Erro ao remover arquivo temporário:', err);
        }
      }
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro ao servir preview de arquivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Excluir arquivo (soft delete ou permanente)
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { permanent } = req.query; // ?permanent=true para deletar permanentemente
    
    // Validação: fileId deve ser um número positivo
    const fileIdInt = parseInt(fileId, 10);
    if (isNaN(fileIdInt) || fileIdInt <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    const file = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM files WHERE id = ?", [fileIdInt], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    const isPermanent = permanent === 'true';
    
    if (isPermanent) {
      // Deleção permanente
      try {
        if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
          await fs.remove(file.file_path);
        }
      } catch (e) {
        console.warn('Não foi possível remover o arquivo local:', e.message);
      }
      
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM files WHERE id = ?", [fileIdInt], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log(`🗑️ Arquivo ${fileIdInt} deletado permanentemente`);
      res.json({ success: true, message: 'Arquivo deletado permanentemente' });
      
    } else {
      // Soft delete - mover para .trash
      if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
        try {
          const trashDir = path.join(getClientsFolder(), '.trash');
          await fs.ensureDir(trashDir);
          
          const fileName = path.basename(file.file_path);
          const timestamp = Date.now();
          const trashPath = path.join(trashDir, `${timestamp}_${fileName}`);
          
          await fs.move(file.file_path, trashPath);
          
          // Atualizar banco com deleted_at e novo caminho
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE files 
               SET deleted_at = CURRENT_TIMESTAMP, 
                   file_path = ? 
               WHERE id = ?`,
              [trashPath, fileIdInt],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          console.log(`🗑️ Arquivo ${fileIdInt} movido para lixeira`);
          res.json({ 
            success: true, 
            message: 'Arquivo movido para lixeira',
            canRestore: true 
          });
          
        } catch (moveErr) {
          console.error('Erro ao mover arquivo para lixeira:', moveErr);
          // Fallback: apenas marcar como deletado no banco
          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
              [fileIdInt],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          res.json({ 
            success: true, 
            message: 'Arquivo marcado como deletado',
            canRestore: false 
          });
        }
      } else {
        // Para arquivos remotos, apenas marcar como deletado
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE files SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
            [fileIdInt],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        console.log(`🗑️ Arquivo remoto ${fileIdInt} marcado como deletado`);
        res.json({ 
          success: true, 
          message: 'Arquivo marcado como deletado',
          canRestore: false 
        });
      }
    }
    
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Copiar arquivo
app.post('/api/files/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetCategory } = req.body;
    
    // Validação: ID deve ser um número positivo
    const fileIdInt = parseInt(id, 10);
    if (isNaN(fileIdInt) || fileIdInt <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    const file = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM files WHERE id = ?", [fileIdInt], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Se arquivo está deletado, não permitir copiar
    if (file.deleted_at) {
      return res.status(400).json({ error: 'Não é possível copiar arquivo deletado' });
    }
    
    const sourceCategory = file.category || 'sem-categoria';
    const destCategory = targetCategory ? targetCategory.trim() : sourceCategory;
    
    // Copiar arquivo físico (se for local)
    let newFilePath = null;
    let newFileName = null;
    
    if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
      try {
        const originalName = path.basename(file.file_path);
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);
        
        // Adicionar sufixo _copy
        newFileName = `${nameWithoutExt}_copy${ext}`;
        
        // Construir caminho de destino
        let destDir;
        if (destCategory === sourceCategory) {
          destDir = path.dirname(file.file_path);
        } else {
          destDir = path.join(path.dirname(path.dirname(file.file_path)), destCategory);
          await fs.ensureDir(destDir);
        }
        
        newFilePath = path.join(destDir, newFileName);
        
        // Se já existir arquivo com esse nome, adicionar número
        let counter = 1;
        while (await fs.pathExists(newFilePath)) {
          newFileName = `${nameWithoutExt}_copy${counter}${ext}`;
          newFilePath = path.join(destDir, newFileName);
          counter++;
        }
        
        // Copiar arquivo
        await fs.copy(file.file_path, newFilePath);
        
      } catch (copyErr) {
        console.error('Erro ao copiar arquivo físico:', copyErr);
        return res.status(500).json({ error: 'Erro ao copiar arquivo físico' });
      }
    }
    
    // Criar nova entrada no banco
    const newFile = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO files 
         (client_id, category, filename, original_name, file_path, file_size, mime_type, storage_type, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          file.client_id,
          destCategory,
          newFileName || `${file.filename}_copy`,
          newFileName || `${file.original_name}_copy`,
          newFilePath || null,
          file.file_size,
          file.mime_type,
          file.storage_type
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    console.log(`📋 Arquivo ${fileIdInt} copiado. Novo ID: ${newFile.id}`);
    res.json({ 
      success: true, 
      message: 'Arquivo copiado com sucesso',
      newFileId: newFile.id,
      newFileName: newFileName || `${file.original_name}_copy`,
      category: destCategory,
      sourceFileId: fileIdInt
    });
    
  } catch (error) {
    console.error('Erro ao copiar arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mover arquivo para outra categoria
app.patch('/api/files/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { newCategory } = req.body;
    
    // Validação: ID deve ser um número positivo
    const fileIdInt = parseInt(id, 10);
    if (isNaN(fileIdInt) || fileIdInt <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    // Validação: newCategory é obrigatória
    if (!newCategory || typeof newCategory !== 'string' || newCategory.trim().length === 0) {
      return res.status(400).json({ error: 'Nova categoria é obrigatória' });
    }
    
    const file = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM files WHERE id = ?", [fileIdInt], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Se arquivo está deletado, não permitir mover
    if (file.deleted_at) {
      return res.status(400).json({ error: 'Não é possível mover arquivo deletado' });
    }
    
    const oldCategory = file.category || 'sem-categoria';
    const newCategoryTrimmed = newCategory.trim();
    
    // Se a categoria for a mesma, não fazer nada
    if (oldCategory === newCategoryTrimmed) {
      return res.json({ 
        success: true, 
        message: 'Arquivo já está nesta categoria',
        category: newCategoryTrimmed
      });
    }
    
    // Mover arquivo físico (se for local)
    if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
      try {
        const oldDir = path.dirname(file.file_path);
        const fileName = path.basename(file.file_path);
        
        // Construir novo caminho
        const newDir = path.join(path.dirname(oldDir), newCategoryTrimmed);
        const newPath = path.join(newDir, fileName);
        
        // Criar diretório da nova categoria se não existir
        await fs.ensureDir(newDir);
        
        // Verificar se já existe arquivo com esse nome na nova categoria
        if (await fs.pathExists(newPath)) {
          return res.status(400).json({ error: 'Já existe um arquivo com esse nome na categoria de destino' });
        }
        
        // Mover arquivo
        await fs.move(file.file_path, newPath);
        
        // Atualizar banco
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE files 
             SET category = ?, 
                 file_path = ?
             WHERE id = ?`,
            [newCategoryTrimmed, newPath, fileIdInt],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        console.log(`📦 Arquivo ${fileIdInt} movido: ${oldCategory} → ${newCategoryTrimmed}`);
        res.json({ 
          success: true, 
          message: 'Arquivo movido com sucesso',
          newCategory: newCategoryTrimmed,
          oldCategory: oldCategory
        });
        
      } catch (moveErr) {
        console.error('Erro ao mover arquivo físico:', moveErr);
        res.status(500).json({ error: 'Erro ao mover arquivo físico' });
      }
    } else {
      // Para arquivos remotos, apenas atualizar banco
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE files SET category = ? WHERE id = ?",
          [newCategoryTrimmed, fileIdInt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log(`📦 Arquivo remoto ${fileIdInt} movido: ${oldCategory} → ${newCategoryTrimmed}`);
      res.json({ 
        success: true, 
        message: 'Arquivo movido com sucesso',
        newCategory: newCategoryTrimmed,
        oldCategory: oldCategory,
        note: 'Arquivo remoto - categoria atualizada apenas no banco de dados'
      });
    }
    
  } catch (error) {
    console.error('Erro ao mover arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Renomear arquivo
app.patch('/api/files/:id/rename', async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    
    // Validação: ID deve ser um número positivo
    const fileIdInt = parseInt(id, 10);
    if (isNaN(fileIdInt) || fileIdInt <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    // Validação: newName é obrigatório
    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      return res.status(400).json({ error: 'Novo nome é obrigatório' });
    }
    
    // Validação: caracteres não permitidos
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidChars.test(newName)) {
      return res.status(400).json({ 
        error: 'Nome contém caracteres não permitidos',
        invalidChars: '< > : " / \\ | ? *'
      });
    }
    
    // Validação: nome muito longo
    if (newName.length > 255) {
      return res.status(400).json({ error: 'Nome muito longo (máximo 255 caracteres)' });
    }
    
    const file = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM files WHERE id = ?", [fileIdInt], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Se arquivo está deletado, não permitir renomear
    if (file.deleted_at) {
      return res.status(400).json({ error: 'Não é possível renomear arquivo deletado' });
    }
    
    const oldName = file.original_name || file.filename;
    const oldExt = path.extname(oldName);
    let finalName = newName.trim();
    
    // Se o novo nome não tem extensão, manter a original
    if (!path.extname(finalName) && oldExt) {
      finalName += oldExt;
    }
    
    // Renomear arquivo físico (se for local)
    if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
      try {
        const newPath = path.join(path.dirname(file.file_path), finalName);
        
        // Verificar se já existe arquivo com esse nome
        if (await fs.pathExists(newPath) && newPath !== file.file_path) {
          return res.status(400).json({ error: 'Já existe um arquivo com esse nome nesta pasta' });
        }
        
        await fs.rename(file.file_path, newPath);
        
        // Atualizar banco com novo nome e caminho
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE files 
             SET original_name = ?, 
                 filename = ?,
                 file_path = ?
             WHERE id = ?`,
            [finalName, finalName, newPath, fileIdInt],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        console.log(`📝 Arquivo ${fileIdInt} renomeado: ${oldName} → ${finalName}`);
        res.json({ 
          success: true, 
          message: 'Arquivo renomeado com sucesso',
          newName: finalName,
          oldName: oldName
        });
        
      } catch (renameErr) {
        console.error('Erro ao renomear arquivo físico:', renameErr);
        res.status(500).json({ error: 'Erro ao renomear arquivo físico' });
      }
    } else {
      // Para arquivos remotos, apenas atualizar banco
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE files 
           SET original_name = ?, 
               filename = ?
           WHERE id = ?`,
          [finalName, finalName, fileIdInt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log(`📝 Arquivo remoto ${fileIdInt} renomeado: ${oldName} → ${finalName}`);
      res.json({ 
        success: true, 
        message: 'Arquivo renomeado com sucesso',
        newName: finalName,
        oldName: oldName,
        note: 'Arquivo remoto - nome atualizado apenas no banco de dados'
      });
    }
    
  } catch (error) {
    console.error('Erro ao renomear arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restaurar arquivo da lixeira
app.post('/api/files/:fileId/restore', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Validação: fileId deve ser um número positivo
    const fileIdInt = parseInt(fileId, 10);
    if (isNaN(fileIdInt) || fileIdInt <= 0) {
      return res.status(400).json({ error: 'ID de arquivo inválido' });
    }
    
    const file = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM files WHERE id = ? AND deleted_at IS NOT NULL", [fileIdInt], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado na lixeira' });
    }
    
    if (file.storage_type === 'local' && file.file_path && await fs.pathExists(file.file_path)) {
      try {
        // Determinar caminho original
        const fileName = path.basename(file.file_path).replace(/^\d+_/, ''); // Remove timestamp
        // Usar regex para suportar tanto / quanto \ como separadores de caminho
        const trashPattern = new RegExp(`[\\\\/]\\.trash`, 'g');
        const originalDir = path.dirname(file.file_path).replace(trashPattern, '');
        const originalPath = path.join(originalDir, fileName);
        
        await fs.move(file.file_path, originalPath);
        
        // Atualizar banco removendo deleted_at e restaurando caminho
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE files 
             SET deleted_at = NULL, 
                 file_path = ? 
             WHERE id = ?`,
            [originalPath, fileIdInt],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        console.log(`♻️ Arquivo ${fileIdInt} restaurado da lixeira`);
        res.json({ 
          success: true, 
          message: 'Arquivo restaurado com sucesso'
        });
        
      } catch (restoreErr) {
        console.error('Erro ao restaurar arquivo:', restoreErr);
        res.status(500).json({ error: 'Erro ao restaurar arquivo físico' });
      }
    } else {
      // Para arquivos remotos, apenas remover marca de deletado
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE files SET deleted_at = NULL WHERE id = ?",
          [fileIdInt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      console.log(`♻️ Arquivo remoto ${fileIdInt} restaurado`);
      res.json({ 
        success: true, 
        message: 'Arquivo restaurado com sucesso'
      });
    }
    
  } catch (error) {
    console.error('Erro ao restaurar arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Backup automático
app.post('/api/backup/create', async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      clients: [],
      appointments: [],
      files: []
    };

    // Exportar dados do banco
    db.all("SELECT * FROM clients", (err, clients) => {
      if (!err) backupData.clients = clients;
      
      db.all("SELECT * FROM appointments", (err, appointments) => {
        if (!err) backupData.appointments = appointments;
        
        db.all("SELECT * FROM files", (err, files) => {
          if (!err) backupData.files = files;
          
          // Salvar backup
          const backupPath = `./backup_${Date.now()}.json`;
          fs.writeJsonSync(backupPath, backupData);
          
          res.json({ 
            success: true, 
            backupPath: backupPath,
            message: 'Backup criado com sucesso' 
          });
        });
      });
    });
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ error: 'Erro ao criar backup' });
  }
});

// Estatísticas do sistema
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  db.get("SELECT COUNT(*) as total FROM clients", (err, result) => {
    stats.totalClients = result ? result.total : 0;
    
    db.get("SELECT COUNT(*) as total FROM appointments WHERE date(start_datetime) >= date('now')", (err, result) => {
      stats.upcomingAppointments = result ? result.total : 0;
      
      db.get("SELECT COUNT(*) as total FROM files", (err, result) => {
        stats.totalFiles = result ? result.total : 0;
        
        db.get("SELECT SUM(file_size) as total FROM files", (err, result) => {
          stats.totalStorage = result ? result.total : 0;
          
          res.json(stats);
        });
      });
    });
  });
});

// Verificação de pasta no Google Drive
app.get('/api/drive/exists', async (req, res) => {
  try {
    const { name, parentId } = req.query;
    if (!name) return res.status(400).json({ error: 'Parâmetro name é obrigatório' });

    await hybridStorage.initializeGoogleDrive();
    if (!driveClient) {
      return res.json({ exists: false, connected: false });
    }

    const query = parentId
      ? `name='${name}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder'`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder'`;

    const response = await driveClient.files.list({ q: query });
    const exists = response.data.files && response.data.files.length > 0;
    const id = exists ? response.data.files[0].id : null;
    res.json({ exists, id, connected: true });
  } catch (error) {
    console.error('Erro ao verificar pasta no Drive:', error);
    res.status(500).json({ error: 'Erro ao verificar no Google Drive', details: error.message });
  }
});

// Atualizar agendamento
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { title, description, start_datetime, end_datetime, client_id, tattoo_type_id, estimated_price, date, time, end_time, service, notes, status } = req.body;

    // Validação: Se start_datetime for fornecido, deve ser válido
    if (start_datetime !== undefined) {
      if (!start_datetime || start_datetime.trim() === '') {
        return res.status(400).json({ 
          error: 'start_datetime não pode ser vazio' 
        });
      }

      // Validar formato de data
      const dateObj = new Date(start_datetime);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ 
          error: 'start_datetime deve ser uma data válida no formato ISO 8601' 
        });
      }
    }

    // Buscar agendamento atual
    const currentAppointment = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM appointments WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!currentAppointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Atualizar no banco local
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE appointments SET 
         client_id = ?, tattoo_type_id = ?, title = ?, description = ?, 
         start_datetime = ?, end_datetime = ?, estimated_price = ?,
         date = ?, time = ?, end_time = ?, service = ?, notes = ?, status = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [client_id, tattoo_type_id, title, description, start_datetime, end_datetime, estimated_price, date, time, end_time, service, notes, status || 'scheduled', id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Tentar atualizar no Google Calendar
    let googleSyncResult = null;
    try {
      const appointmentData = {
        id,
        google_event_id: currentAppointment.google_event_id,
        google_calendar_id: currentAppointment.google_calendar_id,
        client_id,
        title: title || service,
        description: notes || description,
        date: date || start_datetime?.split('T')[0],
        time: time || start_datetime?.split('T')[1]?.substring(0, 5),
        end_time: end_time || end_datetime?.split('T')[1]?.substring(0, 5),
        notes
      };

      if (currentAppointment.google_event_id) {
        googleSyncResult = await updateGoogleEvent(db, appointmentData);
        console.log('✅ Agendamento atualizado no Google Calendar:', googleSyncResult.googleEventId);
      } else {
        // Se não tinha ID do Google, criar novo
        googleSyncResult = await createGoogleEvent(db, appointmentData);
        console.log('✅ Agendamento criado no Google Calendar:', googleSyncResult.googleEventId);
      }
    } catch (googleError) {
      console.warn('⚠️ Não foi possível sincronizar com Google Calendar:', googleError.message);
    }

    res.json({ 
      success: true, 
      message: 'Agendamento atualizado com sucesso',
      googleEventId: googleSyncResult?.googleEventId || currentAppointment.google_event_id,
      googleCalendarLink: googleSyncResult?.htmlLink || null
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Excluir agendamento
app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar agendamento completo
    const appointment = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM appointments WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Tentar remover do Google Calendar primeiro
    try {
      const googleResult = await deleteGoogleEvent(db, appointment);
      console.log('✅ Evento removido do Google Calendar:', googleResult.message);
    } catch (googleError) {
      console.warn('⚠️ Não foi possível remover do Google Calendar:', googleError.message);
      // Continuar com a exclusão local mesmo se o Google falhar
    }

    // Remover do banco local
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM appointments WHERE id = ?", [id], function(deleteErr) {
        if (deleteErr) reject(deleteErr);
        else resolve();
      });
    });

    res.json({ success: true, message: 'Agendamento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// Excluir cliente (bloqueia se houver dependências)
app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT COUNT(1) as total FROM appointments WHERE client_id = ?", [id], (err, a) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get("SELECT COUNT(1) as total FROM files WHERE client_id = ?", [id], (err2, f) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if ((a?.total || 0) > 0 || (f?.total || 0) > 0) {
        return res.status(400).json({ error: 'Cliente possui dados vinculados (agendamentos/arquivos)' });
      }
      db.run("DELETE FROM clients WHERE id = ?", [id], function(delErr) {
        if (delErr) return res.status(500).json({ error: delErr.message });
        res.json({ success: true });
      });
    });
  });
});

// Excluir tipo de tatuagem (bloqueia se houver agendamentos vinculados)
app.delete('/api/tattoo-types/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT COUNT(1) as total FROM appointments WHERE tattoo_type_id = ?", [id], (err, a) => {
    if (err) return res.status(500).json({ error: err.message });
    if ((a?.total || 0) > 0) return res.status(400).json({ error: 'Tipo de tatuagem vinculado a agendamentos' });
    db.run("DELETE FROM tattoo_types WHERE id = ?", [id], function(delErr) {
      if (delErr) return res.status(500).json({ error: delErr.message });
      res.json({ success: true });
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
    },
    version: '2.0.0',
    storageMode: hybridStorage.storageMode
  });
});

// Buscar arquivos do cliente pelo telefone (LOCAL + GOOGLE DRIVE)
app.get('/api/files/by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    console.log(`📞 Buscando arquivos para telefone: ${phone}`);
    
    let allFiles = [];
    
    // 1️⃣ BUSCAR ARQUIVOS LOCAIS
    try {
      // Buscar cliente pelo telefone
      const client = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM clients WHERE phone = ?', [phone], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (client) {
        // Buscar arquivos do cliente
        const files = await new Promise((resolve, reject) => {
          db.all(`
            SELECT f.*, c.name as client_name, c.phone as client_phone
            FROM files f
            LEFT JOIN clients c ON f.client_id = c.id
            WHERE f.client_id = ?
            ORDER BY f.created_at DESC
          `, [client.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
        
        // Adicionar URLs dos arquivos locais
        const filesWithUrls = files.map(file => {
          const mimeType = file.mime_type || mimeTypes.lookup(file.filename) || 'application/octet-stream';
          const isImage = mimeType.startsWith('image/');
          
          return {
            ...file,
            original_name: file.original_filename,
            file_url: file.file_url || `/api/files/${file.id}`,
            thumbnail_url: isImage ? `/api/files/${file.id}/thumbnail?size=300` : null,
            mime_type: mimeType,
            upload_date: file.created_at,
            source: 'local',
            client_folder: client.folder_path,
            is_image: isImage,
            category: file.category || 'outros'
          };
        });
        
        allFiles = [...allFiles, ...filesWithUrls];
        console.log(`✅ Encontrados ${filesWithUrls.length} arquivos locais`);
      }
    } catch (error) {
      console.error('⚠️ Erro ao buscar arquivos locais:', error.message);
    }
    
    // 2️⃣ BUSCAR ARQUIVOS DO GOOGLE DRIVE
    try {
      // Inicializar Google Drive se necessário
      if (!driveClient && fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      }
      
      if (driveClient) {
        // Buscar pasta do cliente pelo telefone
        const searchQuery = `name contains '${phone}' and mimeType = 'application/vnd.google-apps.folder' and trashed=false`;
        
        const folderResponse = await driveClient.files.list({
          q: searchQuery,
          fields: 'files(id, name)',
          pageSize: 1
        });
        
        if (folderResponse.data.files && folderResponse.data.files.length > 0) {
          const clientFolder = folderResponse.data.files[0];
          console.log(`📁 Pasta do cliente encontrada: ${clientFolder.name} (${clientFolder.id})`);
          
          // Buscar arquivos dentro da pasta do cliente
          const filesQuery = `'${clientFolder.id}' in parents and trashed=false`;
          
          const filesResponse = await driveClient.files.list({
            q: filesQuery,
            fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink, size, iconLink)',
            orderBy: 'modifiedTime desc',
            pageSize: 100
          });
          
          const driveFiles = (filesResponse.data.files || [])
            .filter(file => file.mimeType !== 'application/vnd.google-apps.folder') // 🚫 Filtrar pastas
            .map(file => {
              const isImage = file.mimeType && file.mimeType.startsWith('image/');
              const isPSD = file.name && file.name.toLowerCase().endsWith('.psd');
              
              // Categorizar arquivo
              let category = 'outros';
              const fileName = file.name.toLowerCase();
              if (fileName.includes('final') || fileName.includes('resultado')) {
                category = 'fotos_finais';
              } else if (fileName.includes('aprovado') || fileName.includes('desenho')) {
                category = 'desenhos_aprovados';
              } else if (fileName.includes('referencia') || fileName.includes('ref')) {
                category = 'referencias';
              } else if (fileName.includes('processo')) {
                category = 'processo';
              } else if (fileName.includes('cicatriz')) {
                category = 'cicatrizacao';
              }
              
              return {
                id: `gdrive_${file.id}`,
                original_name: file.name,
                file_url: file.webViewLink,
                thumbnail_url: (isImage || isPSD) && file.thumbnailLink ? `/api/drive/thumbnail/${file.id}` : file.iconLink,
                mime_type: file.mimeType,
                upload_date: file.createdTime,
                created_at: file.createdTime,
                source: 'google_drive',
                is_image: isImage || isPSD,
                is_folder: false,
                file_size: file.size ? parseInt(file.size) : 0,
                category: category,
                client_name: clientFolder.name,
                client_phone: phone
              };
            });
          
          allFiles = [...allFiles, ...driveFiles];
          console.log(`✅ Encontrados ${driveFiles.length} arquivos no Google Drive`);
        } else {
          console.log(`⚠️ Pasta não encontrada no Google Drive para telefone: ${phone}`);
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao buscar arquivos do Google Drive:', error.message);
    }
    
    console.log(`📊 Total de arquivos encontrados: ${allFiles.length}`);
    res.json(allFiles);
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos por telefone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Abrir pasta do cliente no sistema (com sincronização automática)
app.post('/api/clients/open-folder', async (req, res) => {
  try {
    const { phone, folderPath } = req.body;
    
    if (!phone && !folderPath) {
      return res.status(400).json({ error: 'Telefone ou caminho da pasta é obrigatório' });
    }
    
    // Se tiver telefone, buscar o cliente
    if (phone) {
      db.get('SELECT * FROM clients WHERE phone = ?', [phone], async (err, client) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (!client) {
          return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        
        const clientFolderPath = path.join(getClientsFolder(), client.folder_path);
        
        // Criar pasta se não existir
        await fs.ensureDir(clientFolderPath);
        
        // 🔄 SINCRONIZAR PASTA ANTES DE ABRIR
        if (syncManager && driveClient) {
          console.log(`\n🔄 Sincronizando pasta do cliente: ${client.name}...`);
          
          try {
            const syncResult = await syncManager.syncClientFolder(
              client.folder_path,
              client.folder_path
            );
            
            // Se houver conflitos, retornar para o frontend resolver
            if (syncResult.needsConflictResolution && syncResult.comparison.conflicts.length > 0) {
              return res.json({
                success: true,
                needsConflictResolution: true,
                conflicts: syncResult.comparison.conflicts,
                path: clientFolderPath,
                syncStats: {
                  synced: syncResult.comparison.synced.length,
                  downloaded: syncResult.downloads.filter(d => d.success).length,
                  onlyLocal: syncResult.comparison.onlyLocal.length
                }
              });
            }
            
            console.log(`✅ Sincronização concluída: ${syncResult.downloads.filter(d => d.success).length} arquivos baixados`);
          } catch (syncError) {
            console.error('⚠️ Erro na sincronização:', syncError);
            // Continuar mesmo com erro de sincronização
          }
        }
        
        // Abrir pasta no explorador de arquivos do sistema operacional
        const { exec } = require('child_process');
        const platform = process.platform;
        
        let command;
        if (platform === 'win32') {
          command = `explorer "${clientFolderPath}"`;
        } else if (platform === 'darwin') {
          command = `open "${clientFolderPath}"`;
        } else {
          command = `xdg-open "${clientFolderPath}"`;
        }
        
        exec(command, (error) => {
          if (error) {
            console.error('Erro ao abrir pasta:', error);
            return res.status(500).json({ error: 'Erro ao abrir pasta' });
          }
          
          res.json({ 
            success: true, 
            message: 'Pasta sincronizada e aberta com sucesso',
            path: clientFolderPath 
          });
        });
      });
    } else if (folderPath) {
      // Abrir pasta específica
      const fullPath = path.join(getClientsFolder(), folderPath);
      
      await fs.ensureDir(fullPath);
      
      const { exec } = require('child_process');
      const platform = process.platform;
      
      let command;
      if (platform === 'win32') {
        command = `explorer "${fullPath}"`;
      } else if (platform === 'darwin') {
        command = `open "${fullPath}"`;
      } else {
        command = `xdg-open "${fullPath}"`;
      }
      
      exec(command, (error) => {
        if (error) {
          console.error('Erro ao abrir pasta:', error);
          return res.status(500).json({ error: 'Erro ao abrir pasta' });
        }
        
        res.json({ 
          success: true, 
          message: 'Pasta aberta com sucesso',
          path: fullPath 
        });
      });
    }
  } catch (error) {
    console.error('Erro ao abrir pasta:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resolver conflito de sincronização
app.post('/api/sync/resolve-conflict', async (req, res) => {
  try {
    const { conflict, resolution } = req.body;
    
    if (!conflict || !resolution) {
      return res.status(400).json({ error: 'Conflito e resolução são obrigatórios' });
    }
    
    if (!syncManager) {
      return res.status(503).json({ error: 'Sistema de sincronização não disponível' });
    }
    
    console.log(`🔧 Resolvendo conflito: ${conflict.name} → ${resolution}`);
    
    const result = await syncManager.resolveConflict(conflict, resolution);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Conflito resolvido com sucesso',
        resolution: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erro ao resolver conflito'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao resolver conflito:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar todos os arquivos (para galeria)
app.get('/api/files', async (req, res) => {
  try {
    // Buscar arquivos do banco de dados
    const dbFiles = await new Promise((resolve, reject) => {
      db.all(`
        SELECT f.*, c.name as client_name
        FROM files f
        LEFT JOIN clients c ON f.client_id = c.id
        ORDER BY f.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Adicionar URLs dos arquivos locais
    const filesWithUrls = dbFiles.map(file => {
      const mimeType = file.mime_type || mimeTypes.lookup(file.filename) || 'application/octet-stream';
      const isImage = mimeType.startsWith('image/');
      
      return {
        ...file,
        original_name: file.original_filename, // Compatibilidade
        file_url: file.file_url || `/api/files/${file.id}`,
        thumbnail_url: isImage ? `/api/files/${file.id}/thumbnail?size=300` : null,
        mime_type: mimeType,
        upload_date: file.created_at,
        source: 'local',
        is_image: isImage
      };
    });

    // Buscar pastas do Google Drive se estiver conectado
    let gdriveItems = [];
    console.log('🔍 Verificando Google Drive...', {
      hasDriveClient: !!driveClient,
      hasOAuth: !!oauth2Client,
      hasTokens: fs.existsSync('./tokens.json')
    });
    
    // Inicializar Google Drive se necessário
    if (!driveClient && fs.existsSync('./tokens.json')) {
      try {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
        console.log('✅ Google Drive cliente inicializado');
      } catch (error) {
        console.error('❌ Erro ao inicializar Google Drive:', error.message);
      }
    }
    
    if (driveClient) {
      try {
        console.log('📁 Buscando arquivos do Google Drive...');
        const response = await driveClient.files.list({
          pageSize: 100,
          fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink, size, iconLink)',
          orderBy: 'modifiedTime desc',
          q: "trashed=false"
        });
        
        console.log(`✅ Encontrados ${response.data.files?.length || 0} itens no Google Drive`);
        
        gdriveItems = (response.data.files || []).map((file) => ({
          id: `gdrive_${file.id}`,
          original_name: file.name,
          client_name: 'Google Drive',
          file_url: file.webViewLink,
          thumbnail_url: file.thumbnailLink ? `/api/drive/thumbnail/${file.id}` : (file.iconLink || null),
          mime_type: file.mimeType,
          upload_date: file.createdTime,
          created_at: file.createdTime,
          category: file.mimeType === 'application/vnd.google-apps.folder' ? 'pasta' : 'arquivo',
          file_size: file.size ? parseInt(file.size) : 0,
          source: 'google_drive',
          is_folder: file.mimeType === 'application/vnd.google-apps.folder'
        }));
      } catch (error) {
        console.error('❌ Erro ao buscar arquivos do Google Drive:', error.message);
        if (error.response) {
          console.error('   Detalhes:', error.response.data);
        }
        // Continuar sem os arquivos do Drive
      }
    } else {
      console.log('⚠️ Google Drive não está configurado ou não autenticado');
    }
    
    // Combinar arquivos locais e do Google Drive
    const allFiles = [...filesWithUrls, ...gdriveItems];
    
    res.json(allFiles);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ 
      error: error.message,
      files: [] // Retornar array vazio em caso de erro
    });
  }
});

// ==================== NOVOS ENDPOINTS GOOGLE DRIVE ====================

// Listar arquivos de uma pasta específica do Google Drive
app.get('/api/drive/files', async (req, res) => {
  try {
    let { folderId } = req.query;
    
    // Remover prefixo gdrive_ se existir
    if (folderId && folderId.startsWith('gdrive_')) {
      folderId = folderId.replace('gdrive_', '');
    }
    
    // Inicializar Google Drive se necessário
    if (!driveClient && fs.existsSync('./tokens.json')) {
      try {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } catch (error) {
        return res.status(500).json({ error: 'Google Drive não configurado' });
      }
    }
    
    if (!driveClient) {
      return res.status(401).json({ error: 'Google Drive não autenticado' });
    }
    
    // Construir query para Google Drive
    let query = "trashed=false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    } else {
      // Se não especificar pasta, buscar arquivos na raiz (sem parent ou parent é root)
      query += " and 'root' in parents";
    }
    
    console.log(`📁 Buscando arquivos do Google Drive (pasta: ${folderId || 'root'})...`);
    
    const response = await driveClient.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink, size, iconLink, parents)',
      orderBy: 'folder,modifiedTime desc',
      q: query
    });
    
    const files = (response.data.files || []).map((file) => {
      const isPsd = file.mimeType === 'image/vnd.adobe.photoshop' || file.name?.toLowerCase().endsWith('.psd');
      const isImage = file.mimeType?.startsWith('image/');
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      
      // SEMPRE usar rota customizada para imagens (incluindo PSDs)
      let thumbnailUrl = null;
      if (!isFolder && (isImage || isPsd)) {
        thumbnailUrl = `/api/drive/thumbnail/${file.id}`;
      } else if (!isFolder && file.thumbnailLink) {
        thumbnailUrl = `/api/drive/thumbnail/${file.id}`;
      } else {
        thumbnailUrl = file.iconLink || null;
      }
      
      return {
        id: `gdrive_${file.id}`,
        original_name: file.name,
        client_name: 'Google Drive',
        file_url: file.webViewLink,
        thumbnail_url: thumbnailUrl,
        mime_type: file.mimeType,
        upload_date: file.createdTime,
        created_at: file.createdTime,
        category: isFolder ? 'pasta' : 'arquivo',
        file_size: file.size ? parseInt(file.size) : 0,
        source: 'google_drive',
        is_folder: isFolder,
        parents: file.parents || []
      };
    });
    
    console.log(`✅ Encontrados ${files.length} itens`);
    res.json(files);
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos do Google Drive:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as pastas do Google Drive (para o dialog de mover)
app.get('/api/drive/folders', async (req, res) => {
  try {
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    const response = await driveClient.files.list({
      pageSize: 1000,
      fields: 'files(id, name, mimeType, parents)',
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      orderBy: 'name'
    });
    
    const folders = (response.data.files || []).map((file) => ({
      id: `gdrive_${file.id}`,
      original_name: file.name,
      parents: file.parents || []
    }));
    
    res.json(folders);
  } catch (error) {
    console.error('❌ Erro ao buscar pastas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Renomear arquivo/pasta no Google Drive
app.post('/api/drive/rename', async (req, res) => {
  try {
    const { fileId, newName } = req.body;
    
    if (!fileId || !newName) {
      return res.status(400).json({ error: 'fileId e newName são obrigatórios' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`✏️ Renomeando arquivo ${fileId} para "${newName}"...`);
    
    const response = await driveClient.files.update({
      fileId: fileId,
      requestBody: {
        name: newName
      },
      fields: 'id, name'
    });
    
    console.log(`✅ Arquivo renomeado com sucesso: ${response.data.name}`);
    res.json({ success: true, file: response.data });
  } catch (error) {
    console.error('❌ Erro ao renomear:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Mover arquivo/pasta no Google Drive
app.post('/api/drive/move', async (req, res) => {
  try {
    const { fileId, targetFolderId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'fileId é obrigatório' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📦 Movendo arquivo ${fileId} para pasta ${targetFolderId || 'root'}...`);
    
    // Primeiro, obter os pais atuais
    const file = await driveClient.files.get({
      fileId: fileId,
      fields: 'parents'
    });
    
    const previousParents = file.data.parents ? file.data.parents.join(',') : '';
    
    // Mover o arquivo removendo dos pais antigos e adicionando ao novo
    const response = await driveClient.files.update({
      fileId: fileId,
      addParents: targetFolderId || 'root',
      removeParents: previousParents,
      fields: 'id, name, parents'
    });
    
    console.log(`✅ Arquivo movido com sucesso`);
    res.json({ success: true, file: response.data });
  } catch (error) {
    console.error('❌ Erro ao mover:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Excluir arquivo/pasta no Google Drive
app.post('/api/drive/delete', async (req, res) => {
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'fileId é obrigatório' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`🗑️ Excluindo arquivo ${fileId}...`);
    
    await driveClient.files.delete({
      fileId: fileId
    });
    
    console.log(`✅ Arquivo excluído com sucesso`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao excluir:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Criar nova pasta no Google Drive
app.post('/api/drive/create-folder', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📁 Criando pasta "${name}" em ${parentId || 'root'}...`);
    
    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    if (parentId) {
      fileMetadata.parents = [parentId];
    }
    
    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink'
    });
    
    console.log(`✅ Pasta criada com sucesso: ${response.data.name}`);
    res.json({ success: true, folder: response.data });
  } catch (error) {
    console.error('❌ Erro ao criar pasta:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Obter informações de quota e storage do Google Drive
app.get('/api/drive/about', async (req, res) => {
  try {
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log('📊 Buscando informações de storage do Google Drive...');
    
    const response = await driveClient.about.get({
      fields: 'storageQuota, user'
    });
    
    const quota = response.data.storageQuota;
    const user = response.data.user;
    
    const storageInfo = {
      limit: parseInt(quota.limit) || 0,
      usage: parseInt(quota.usage) || 0,
      usageInDrive: parseInt(quota.usageInDrive) || 0,
      usageInDriveTrash: parseInt(quota.usageInDriveTrash) || 0,
      user: {
        displayName: user.displayName,
        emailAddress: user.emailAddress,
        photoLink: user.photoLink
      }
    };
    
    console.log(`✅ Storage: ${(storageInfo.usage / 1024 / 1024 / 1024).toFixed(2)} GB de ${(storageInfo.limit / 1024 / 1024 / 1024).toFixed(2)} GB usados`);
    
    res.json(storageInfo);
  } catch (error) {
    console.error('❌ Erro ao buscar informações de storage:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Obter arquivos recentes do Google Drive
app.get('/api/drive/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📋 Buscando ${limit} arquivos recentes...`);
    
    const response = await driveClient.files.list({
      pageSize: parseInt(limit),
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink, size, iconLink, parents, viewedByMeTime)',
      orderBy: 'viewedByMeTime desc,modifiedTime desc',
      q: "trashed=false and mimeType!='application/vnd.google-apps.folder'"
    });
    
    const files = (response.data.files || []).map((file) => {
      const isPsd = file.mimeType === 'image/vnd.adobe.photoshop' || file.name?.toLowerCase().endsWith('.psd');
      const isImage = file.mimeType?.startsWith('image/');
      
      // SEMPRE usar rota customizada para imagens (incluindo PSDs)
      let thumbnailUrl = null;
      if (isImage || isPsd) {
        thumbnailUrl = `/api/drive/thumbnail/${file.id}`;
      } else if (file.thumbnailLink) {
        thumbnailUrl = `/api/drive/thumbnail/${file.id}`;
      } else {
        thumbnailUrl = file.iconLink || null;
      }
      
      return {
        id: `gdrive_${file.id}`,
        original_name: file.name,
        file_url: file.webViewLink,
        thumbnail_url: thumbnailUrl,
        mime_type: file.mimeType,
        created_at: file.createdTime,
        modified_at: file.modifiedTime,
        viewed_at: file.viewedByMeTime,
        file_size: file.size ? parseInt(file.size) : 0,
        source: 'google_drive',
        is_folder: false,
        parents: file.parents || []
      };
    });
    
    console.log(`✅ ${files.length} arquivos recentes encontrados`);
    res.json(files);
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos recentes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🖼️ THUMBNAIL UNIVERSAL DO GOOGLE DRIVE (SUPORTA PSD GRANDES)
app.get('/api/drive/thumbnail/:fileId', async (req, res) => {
  try {
    let { fileId } = req.params;
    const size = req.query.size || '300';
    const sizeInt = parseInt(size);
    
    // Remover prefixo gdrive_ se existir
    if (fileId.startsWith('gdrive_')) {
      fileId = fileId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`\n🖼️ [GDRIVE THUMB] ========================================`);
    console.log(`🖼️ [GDRIVE THUMB] Requisição: ${fileId}, tamanho: ${sizeInt}px`);
    
    // Buscar metadados do arquivo
    const fileMetadata = await driveClient.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, thumbnailLink'
    });
    
    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;
    const fileSize = fileMetadata.data.size;
    const fileExt = path.extname(fileName).toLowerCase();
    const isPsd = fileExt === '.psd' || mimeType === 'image/vnd.adobe.photoshop';
    const isImage = isPsd || mimeType?.startsWith('image/');
    
    console.log(`📁 [GDRIVE THUMB] Arquivo: ${fileName}`);
    console.log(`📊 [GDRIVE THUMB] Tipo: ${fileExt}, Tamanho: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🏷️  [GDRIVE THUMB] É PSD: ${isPsd ? 'SIM' : 'NÃO'}`);
    
    if (!isImage) {
      console.log(`⚠️ [GDRIVE THUMB] Arquivo não é imagem`);
      return res.status(400).json({ error: 'Arquivo não é uma imagem', useFallback: true });
    }
    
    // Tentar usar thumbnail do Google Drive para arquivos pequenos ou não-PSD
    if (!isPsd && fileSize < 50 * 1024 * 1024 && fileMetadata.data.thumbnailLink) {
      try {
        console.log(`📦 [GDRIVE THUMB] Usando thumbnail nativo do Google Drive (arquivos pequenos)`);
        const thumbnailUrl = fileMetadata.data.thumbnailLink;
        const response = await axios.get(thumbnailUrl, {
          headers: {
            'Authorization': `Bearer ${oauth2Client.credentials.access_token}`
          },
          responseType: 'arraybuffer'
        });
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(Buffer.from(response.data));
        console.log(`✅ [GDRIVE THUMB] Thumbnail nativo servido com sucesso`);
        console.log(`🖼️ [GDRIVE THUMB] ========================================\n`);
        return;
      } catch (err) {
        console.log(`⚠️ [GDRIVE THUMB] Falha no thumbnail nativo:`, err.message);
        console.log(`➡️  [GDRIVE THUMB] Gerando thumbnail customizado...`);
      }
    }
    
    // Para PSDs ou arquivos grandes, usar sistema híbrido de 3 níveis
    if (isPsd) {
      console.log(`\n🎯 [SISTEMA HÍBRIDO] Iniciando processamento de PSD...`);
      console.log(`🎯 [SISTEMA HÍBRIDO] Níveis disponíveis:`);
      console.log(`   • NÍVEL 1: Thumbnail embutido no PSD (rápido, ~2-5s)`);
      console.log(`   • NÍVEL 2: Thumbnail do Google Drive API (médio, ~1-3s)`);
      console.log(`   • NÍVEL 3: Processar imagem completa (lento, ~30-90s)`);
      console.log(`🎯 [SISTEMA HÍBRIDO] Tentando em ordem...\n`);
    } else {
      console.log(`🔨 [GDRIVE THUMB] Gerando thumbnail customizado para imagem grande...`);
    }
    
    // Criar objeto file mock para a função universal
    const fileMock = {
      id: fileId,
      drive_id: fileId,
      original_name: fileName,
      filename: fileName,
      mime_type: mimeType,
      storage_type: 'google_drive'
    };
    
    const thumbnailPath = await generateUniversalThumbnail(fileMock, sizeInt, driveClient);
    
    const thumbnailMimeType = mimeTypes.lookup(thumbnailPath) || 'image/png';
    res.set('Content-Type', thumbnailMimeType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.sendFile(path.resolve(thumbnailPath));
    
    if (isPsd) {
      console.log(`\n✅ [SISTEMA HÍBRIDO] Thumbnail PSD gerado e servido com sucesso!`);
      console.log(`🎯 [SISTEMA HÍBRIDO] Verifique os logs acima para ver qual nível foi usado`);
    } else {
      console.log(`✅ [GDRIVE THUMB] Thumbnail customizado servido`);
    }
    console.log(`🖼️ [GDRIVE THUMB] ========================================\n`);
  } catch (error) {
    console.error('❌ [GDRIVE THUMB] Erro:', error.message);
    
    if (error.message.includes('PSD sem thumbnail') || error.message.includes('não é uma imagem')) {
      return res.status(400).json({ 
        error: error.message,
        useFallback: true 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Obter estatísticas detalhadas do Google Drive
app.get('/api/drive/stats', async (req, res) => {
  try {
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log('📊 Calculando estatísticas do Google Drive...');
    
    // Buscar todos os arquivos
    const response = await driveClient.files.list({
      pageSize: 1000,
      fields: 'files(id, name, mimeType, size)',
      q: "trashed=false"
    });
    
    const files = response.data.files || [];
    
    // Calcular estatísticas
    const stats = {
      totalItems: files.length,
      totalFolders: files.filter(f => f.mimeType === 'application/vnd.google-apps.folder').length,
      totalFiles: files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder').length,
      totalImages: files.filter(f => f.mimeType?.startsWith('image/')).length,
      totalVideos: files.filter(f => f.mimeType?.startsWith('video/')).length,
      totalDocuments: files.filter(f => 
        f.mimeType?.includes('document') || 
        f.mimeType?.includes('pdf') ||
        f.mimeType?.includes('text')
      ).length,
      totalSheets: files.filter(f => f.mimeType?.includes('spreadsheet')).length,
      totalPresentations: files.filter(f => f.mimeType?.includes('presentation')).length,
      filesByType: {}
    };
    
    // Agrupar por tipo
    files.forEach(file => {
      if (!file.mimeType) return;
      
      const type = file.mimeType.split('/')[0] || 'other';
      if (!stats.filesByType[type]) {
        stats.filesByType[type] = 0;
      }
      stats.filesByType[type]++;
    });
    
    // Calcular tamanho total (apenas arquivos com tamanho)
    stats.totalSize = files.reduce((sum, file) => {
      return sum + (file.size ? parseInt(file.size) : 0);
    }, 0);
    
    // Encontrar maior arquivo
    const filesWithSize = files.filter(f => f.size && f.mimeType !== 'application/vnd.google-apps.folder');
    if (filesWithSize.length > 0) {
      const largestFile = filesWithSize.reduce((max, file) => {
        return parseInt(file.size) > parseInt(max.size || 0) ? file : max;
      }, filesWithSize[0]);
      
      stats.largestFile = {
        name: largestFile.name,
        size: parseInt(largestFile.size),
        mimeType: largestFile.mimeType
      };
    }
    
    console.log(`✅ Estatísticas: ${stats.totalFiles} arquivos, ${stats.totalFolders} pastas`);
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Obter detalhes de um arquivo específico
app.get('/api/drive/file/:fileId', async (req, res) => {
  try {
    let { fileId } = req.params;
    
    // Remover prefixo gdrive_ se existir
    if (fileId && fileId.startsWith('gdrive_')) {
      fileId = fileId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📄 Buscando detalhes do arquivo ${fileId}...`);
    
    const response = await driveClient.files.get({
      fileId: fileId,
      fields: '*'
    });
    
    const file = response.data;
    
    const details = {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      description: file.description,
      size: file.size ? parseInt(file.size) : 0,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      viewedByMeTime: file.viewedByMeTime,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      iconLink: file.iconLink,
      parents: file.parents || [],
      owners: file.owners || [],
      permissions: file.permissions || [],
      shared: file.shared || false,
      capabilities: file.capabilities || {},
      properties: file.properties || {}
    };
    
    console.log(`✅ Detalhes do arquivo obtidos: ${file.name}`);
    res.json(details);
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do arquivo:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 UPLOAD de arquivo para Google Drive
app.post('/api/drive/upload', upload.array('files', 20), async (req, res) => {
  try {
    let { folderId } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Remover prefixo gdrive_ se existir
    if (folderId && folderId.startsWith('gdrive_')) {
      folderId = folderId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📤 Fazendo upload de ${files.length} arquivo(s) para Google Drive...`);
    console.log(`   Pasta destino: ${folderId || 'root'}`);
    
    const uploadedFiles = [];
    const errors = [];
    
    for (const file of files) {
      try {
        console.log(`   ⬆️  ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
        
        const fileMetadata = {
          name: file.originalname,
          parents: folderId ? [folderId] : []
        };
        
        // Usar buffer em vez de createReadStream, pois estamos usando memoryStorage
        const media = {
          mimeType: file.mimetype,
          body: require('stream').Readable.from(file.buffer)
        };
        
        const response = await driveClient.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, mimeType, size, createdTime, webViewLink, thumbnailLink'
        });
        
        uploadedFiles.push(response.data);
        console.log(`   ✅ ${file.originalname} enviado com sucesso`);
      } catch (error) {
        console.error(`   ❌ Erro ao enviar ${file.originalname}:`, error.message);
        errors.push({ file: file.originalname, error: error.message });
      }
    }
    
    if (uploadedFiles.length > 0) {
      console.log(`✅ Upload concluído: ${uploadedFiles.length} arquivo(s) enviado(s)`);
      res.json({ 
        success: true, 
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
        totalErrors: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      console.error('❌ Nenhum arquivo foi enviado com sucesso');
      res.status(500).json({ 
        error: 'Nenhum arquivo foi enviado com sucesso', 
        errors 
      });
    }
  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
    if (error.response) {
      console.error('   Detalhes:', error.response.data);
    }
    res.status(500).json({ error: error.message });
  }
});

// 🚀 DOWNLOAD de arquivo do Google Drive
app.get('/api/drive/download/:fileId', async (req, res) => {
  try {
    let { fileId } = req.params;
    
    if (fileId && fileId.startsWith('gdrive_')) {
      fileId = fileId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📥 Baixando arquivo ${fileId}...`);
    
    // Buscar metadados do arquivo
    const fileMetadata = await driveClient.files.get({
      fileId: fileId,
      fields: 'name, mimeType'
    });
    
    // Baixar o arquivo
    const response = await driveClient.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    
    // Configurar headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    
    // Stream do arquivo para o cliente
    response.data.pipe(res);
    
    console.log(`✅ Download iniciado: ${fileMetadata.data.name}`);
  } catch (error) {
    console.error('❌ Erro no download:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 COMPARTILHAR arquivo/pasta com email e permissão
app.post('/api/drive/share', async (req, res) => {
  try {
    const { fileId, email, role = 'reader' } = req.body;
    
    if (!fileId || !email) {
      return res.status(400).json({ error: 'fileId e email são obrigatórios' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`🔗 Compartilhando arquivo ${fileId} com ${email} (${role})...`);
    
    const permission = {
      type: 'user',
      role: role,
      emailAddress: email
    };
    
    const response = await driveClient.permissions.create({
      fileId: fileId,
      requestBody: permission,
      fields: 'id'
    });
    
    console.log(`✅ Arquivo compartilhado com sucesso!`);
    res.json({ 
      success: true, 
      permissionId: response.data.id 
    });
  } catch (error) {
    console.error('❌ Erro ao compartilhar:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 CRIAR LINK público de compartilhamento
app.post('/api/drive/create-link', async (req, res) => {
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'fileId é obrigatório' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`🔗 Gerando link público para ${fileId}...`);
    
    // Criar permissão para 'anyone'
    await driveClient.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // Obter o link
    const fileData = await driveClient.files.get({
      fileId: fileId,
      fields: 'webViewLink'
    });
    
    console.log(`✅ Link público criado!`);
    res.json({ 
      success: true, 
      link: fileData.data.webViewLink 
    });
  } catch (error) {
    console.error('❌ Erro ao criar link:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 LISTAR COMENTÁRIOS de um arquivo
app.get('/api/drive/comments/:fileId', async (req, res) => {
  try {
    let { fileId } = req.params;
    
    if (fileId && fileId.startsWith('gdrive_')) {
      fileId = fileId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`💬 Buscando comentários do arquivo ${fileId}...`);
    
    const response = await driveClient.comments.list({
      fileId: fileId,
      fields: 'comments(id, content, createdTime, author, deleted, resolved)',
      includeDeleted: false
    });
    
    console.log(`✅ ${response.data.comments?.length || 0} comentários encontrados`);
    res.json({ 
      success: true, 
      comments: response.data.comments || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar comentários:', error.message);
    res.json({ success: true, comments: [] }); // Retornar vazio em caso de erro (nem todos os arquivos suportam comentários)
  }
});

// 🚀 ADICIONAR COMENTÁRIO a um arquivo
app.post('/api/drive/comment', async (req, res) => {
  try {
    const { fileId, content } = req.body;
    
    if (!fileId || !content) {
      return res.status(400).json({ error: 'fileId e content são obrigatórios' });
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`💬 Adicionando comentário ao arquivo ${fileId}...`);
    
    const comment = {
      content: content
    };
    
    const response = await driveClient.comments.create({
      fileId: fileId,
      requestBody: comment,
      fields: 'id, content, createdTime, author'
    });
    
    console.log(`✅ Comentário adicionado com sucesso!`);
    res.json({ 
      success: true, 
      comment: response.data 
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar comentário:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 HISTÓRICO DE VERSÕES de um arquivo
app.get('/api/drive/versions/:fileId', async (req, res) => {
  try {
    let { fileId } = req.params;
    
    if (fileId && fileId.startsWith('gdrive_')) {
      fileId = fileId.replace('gdrive_', '');
    }
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`📜 Buscando histórico de versões do arquivo ${fileId}...`);
    
    const response = await driveClient.revisions.list({
      fileId: fileId,
      fields: 'revisions(id, modifiedTime, size, lastModifyingUser, downloadUrl)'
    });
    
    console.log(`✅ ${response.data.revisions?.length || 0} versões encontradas`);
    res.json({ 
      success: true, 
      versions: response.data.revisions || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar versões:', error.message);
    res.json({ success: true, versions: [] }); // Retornar vazio em caso de erro
  }
});

// ==================== FIM ENDPOINTS GOOGLE DRIVE ====================

// Upload de arquivos (rota alternativa para compatibilidade com frontend)
app.post('/api/files/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { client_id, category, tags: _tags, notes: _notes } = req.body;
    
    if (!client_id) {
      return res.status(400).json({ error: 'client_id é obrigatório' });
    }
    
    // Buscar dados do cliente
    db.get("SELECT * FROM clients WHERE id = ?", [client_id], async (err, client) => {
      if (err || !client) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const uploadResults = [];
      let successCount = 0;
      
      for (const file of req.files) {
        try {
          // Salvar usando armazenamento híbrido
          const results = await hybridStorage.saveFile(file, client.folder_path, category);
          const primaryResult = results[0];
          
          // Registrar no banco
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO files 
               (client_id, filename, original_name, file_path, storage_type, category, file_type, mime_type, file_size) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                client_id,
                primaryResult.filename,
                file.originalname,
                primaryResult.path,
                primaryResult.storage,
                category || 'outros',
                getFileType(file.originalname),
                file.mimetype,
                file.size
              ],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  uploadResults.push({
                    id: this.lastID,
                    filename: primaryResult.filename,
                    original_filename: file.originalname,
                    file_url: `/api/files/${this.lastID}`,
                    thumbnail_url: `/api/files/${this.lastID}?width=300&quality=80`,
                    file_size: file.size,
                    category: category,
                    mime_type: file.mimetype
                  });
                  successCount++;
                  resolve();
                }
              }
            );
          });
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', file.originalname, error);
        }
      }

      // Emitir evento via WebSocket
      io.emit('files_uploaded', {
        clientId: client_id,
        category: category,
        files: uploadResults
      });

      res.json({ 
        success: true, 
        message: `${successCount} arquivo(s) enviado(s) com sucesso`,
        files: uploadResults,
        storageMode: hybridStorage.storageMode
      });
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload de arquivos' });
  }
});

// Sistema de Orçamentos - Listar
app.get('/api/budgets', (req, res) => {
  db.all(`
    SELECT b.*, 
           c.name as client_name,
           tt.name as tattoo_type_name
    FROM budgets b
    LEFT JOIN clients c ON b.client_id = c.id
    LEFT JOIN tattoo_types tt ON b.tattoo_type_id = tt.id
    ORDER BY b.created_at DESC
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Sistema de Orçamentos - Criar
app.post('/api/budgets', (req, res) => {
  const {
    client_id, appointment_id, title, description, tattoo_type_id,
    size_cm, complexity, body_location, colors_count, sessions_count,
    base_price, complexity_multiplier, size_multiplier,
    location_multiplier, color_multiplier, session_multiplier,
    materials_cost, additional_costs, discount, final_price,
    valid_until, notes
  } = req.body;
  
  db.run(
    `INSERT INTO budgets (
      client_id, appointment_id, title, description, tattoo_type_id,
      size_cm, complexity, body_location, colors_count, sessions_count,
      base_price, complexity_multiplier, size_multiplier,
      location_multiplier, color_multiplier, session_multiplier,
      materials_cost, additional_costs, discount, final_price,
      status, valid_until, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      client_id, appointment_id, title, description, tattoo_type_id,
      size_cm, complexity, body_location, colors_count, sessions_count,
      base_price, complexity_multiplier, size_multiplier,
      location_multiplier, color_multiplier, session_multiplier,
      materials_cost, additional_costs, discount, final_price,
      'pending', valid_until, notes
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

// WebSocket para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('join_client_room', (clientId) => {
    socket.join(`client_${clientId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Tarefas agendadas (cron jobs)
cron.schedule('0 2 * * *', async () => {
  console.log('🔄 Executando backup automático...');
  // Implementar backup automático
});

cron.schedule('*/15 * * * *', async () => {
  console.log('🔄 Sincronizando com Google Calendar...');
  // Implementar sincronização periódica
});

// Funções auxiliares
function extractClientName(eventTitle) {
  if (eventTitle && eventTitle.includes(' - ')) {
    return eventTitle.split(' - ')[1].trim();
  }
  return eventTitle || 'Cliente';
}

function getEventStatus(event) {
  const now = new Date();
  const eventStart = new Date(event.start.dateTime || event.start.date);
  
  if (eventStart < now) {
    return 'concluido';
  } else if (event.status === 'confirmed') {
    return 'confirmado';
  } else {
    return 'pendente';
  }
}

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const docExts = ['.pdf', '.doc', '.docx', '.txt'];
  
  if (imageExts.includes(ext)) return 'image';
  if (docExts.includes(ext)) return 'document';
  return 'other';
}

// ============================================
// CRON JOB: Sincronização automática Google Calendar
// ============================================
cron.schedule('*/5 * * * *', async () => {
  // Emitir evento de início da sincronização
  io.emit('calendar_sync_started', {
    timestamp: new Date().toISOString()
  });
  
  console.log('🔄 [CRON] Iniciando sincronização automática com Google Calendar...');
  try {
    const report = await syncGoogleCalendar(db, {
      daysBack: 7,
      daysForward: 30,
      skipDuplicates: false,
      autoLinkClients: true
    });
    
    console.log(`✅ [CRON] Sincronização concluída:`, {
      total: report.total,
      created: report.created,
      updated: report.updated,
      skipped: report.skipped,
      errors: report.errors.length
    });

    // Emitir evento via WebSocket para atualizar frontend
    io.emit('calendar_synced', {
      timestamp: new Date().toISOString(),
      report: {
        total: report.total,
        created: report.created,
        updated: report.updated,
        skipped: report.skipped
      }
    });
  } catch (error) {
    console.error('❌ [CRON] Erro na sincronização automática:', error.message);
  }
});

// Inicializar servidor
server.listen(port, async () => {
  console.log(`🚀 Servidor híbrido rodando em http://localhost:${port}`);
  console.log(`📊 Modo de armazenamento: ${hybridStorage.storageMode}`);
  console.log(`⏰ Sincronização automática Google Calendar: A cada 5 minutos`);
  
  // Inicializar armazenamento
  await hybridStorage.initializeStorage();
  
  // Iniciar monitoramento automático de tokens OAuth
  startTokenMonitoring(db);
  
  // Executar primeira sincronização ao iniciar
  console.log('🔄 Executando sincronização inicial do Google Calendar...');
  try {
    const initialReport = await syncGoogleCalendar(db, {
      daysBack: 7,
      daysForward: 30,
      skipDuplicates: false
    });
    console.log(`✅ Sincronização inicial concluída: ${initialReport.total} eventos processados`);
  } catch (error) {
    console.warn('⚠️ Não foi possível executar sincronização inicial:', error.message);
  }
  
  console.log('✅ Sistema híbrido inicializado com sucesso!');
});

module.exports = { app, server, hybridStorage };
