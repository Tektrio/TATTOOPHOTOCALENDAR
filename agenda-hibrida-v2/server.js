const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const mimeTypes = require('mime-types');
const sharp = require('sharp');
const { readPsd } = require('ag-psd');
const axios = require('axios');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const http = require('http');
const QRCode = require('qrcode');
const SyncManager = require('./sync-manager');
const FileWatcher = require('./file-watcher');
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
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

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

// Middleware JSON com limite aumentado
app.use(express.json({ limit: '50mb' }));

// Servir arquivos estáticos com cache
app.use(express.static('public', {
  maxAge: '1d', // Cache de 1 dia para arquivos estáticos
  etag: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d', // Cache de 7 dias para uploads
  etag: true
}));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./agenda_hibrida.db');

// Tornar db disponível para as rotas
app.locals.db = db;

// Rotas de importação e sincronização - CORRIGIDO BUG #003
const importsRouter = require('./routes/imports');
app.use('/api/imports', importsRouter);
app.use('/api/auth', importsRouter);
app.use('/api/sync', importsRouter);

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
    file_size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
  )`);

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
    batch_id TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    duration_seconds INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de tokens OAuth do Google - CORRIGIDO BUG #003
  db.run(`CREATE TABLE IF NOT EXISTS google_oauth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
function initializeSyncSystem() {
  try {
    if (!driveClient) {
      console.warn('⚠️ Google Drive não disponível, sincronização desabilitada');
      return;
    }

    const uploadsPath = process.env.CLIENTS_FOLDER || './uploads';

    // Inicializar Sync Manager
    syncManager = new SyncManager(driveClient, db, uploadsPath);
    console.log('✅ Sync Manager inicializado');

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
    const localPath = process.env.CLIENTS_FOLDER || './uploads';
    await fs.ensureDir(localPath);
    console.log(`📁 Armazenamento local: ${localPath}`);
  }

  async initializeQNAP() {
    // Verificar conectividade com QNAP
    try {
      if (this.qnapConfig.host) {
        const response = await axios.get(`http://${this.qnapConfig.host}:8080/cgi-bin/authLogin.cgi`, {
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
    const clientFolder = path.join(process.env.CLIENTS_FOLDER || './uploads', clientName.replace(/\s+/g, '_'));
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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Middleware de autenticação JWT
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
    const { code } = req.query;
    
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
    
    // Garantir redirectUri correto nesta instância antes de trocar o código por tokens
    const redirectUri = `http://localhost:${port}/auth/google/callback`;
    oauth2Client.redirectUri = redirectUri;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Salvar tokens
    fs.writeJsonSync('./tokens.json', tokens);
    
    // Inicializar Google Drive e Calendar
    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    const calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Inicializar Sistema de Sincronização
    initializeSyncSystem();
    
    console.log('✅ Autenticação Google realizada com sucesso');
    console.log('✅ Google Drive conectado');
    console.log('✅ Google Calendar conectado');
    
    // Retornar página de sucesso que fecha automaticamente
    res.send(`
      <html>
        <body style="background: #1a1a2e; color: white; font-family: Arial; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center;">
            <h1>✅ Autenticação bem-sucedida!</h1>
            <p>Google Calendar e Drive conectados.</p>
            <p>Esta janela fechará automaticamente...</p>
            <script>
              setTimeout(() => window.close(), 2000);
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
    
    // Inicializar Google Drive e Calendar
    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    const calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });
    
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
      localPath: process.env.CLIENTS_FOLDER || './uploads'
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

app.post('/api/clients', (req, res) => {
  const { name, email, phone, notes } = req.body;
  const folderPath = name.replace(/\s+/g, '_');
  
  db.run(
    "INSERT INTO clients (name, email, phone, notes, folder_path) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, notes, folderPath],
    async function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Criação de pastas no Google Drive (cliente/referencias, desenhos_aprovados, fotos_finais)
      try {
        await hybridStorage.initializeGoogleDrive();
        if (driveClient) {
          const clientFolderId = await (async () => {
            try {
              return await hybridStorage.getOrCreateGDriveFolder(folderPath);
            } catch (e) {
              console.warn('Falha ao criar pasta do cliente no Drive:', e.message);
              return null;
            }
          })();

          if (clientFolderId) {
            const subfolders = ['referencias', 'desenhos_aprovados', 'fotos_finais'];
            for (const sub of subfolders) {
              try {
                await hybridStorage.getOrCreateGDriveFolder(sub, clientFolderId);
              } catch (e) {
                console.warn(`Falha ao criar subpasta ${sub} no Drive:`, e.message);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Google Drive não disponível para criar pastas do cliente:', e.message);
      }

      res.json({ id: this.lastID, success: true });
    }
  );
});

// Agendamentos com integração Google Calendar
app.get('/api/appointments', async (req, res) => {
  try {
    // Buscar do banco local
    db.all(`
      SELECT a.*, c.name as client_name, c.phone as client_phone, c.email as client_email, 
             c.folder_path as client_folder, tt.name as tattoo_type, tt.color as type_color
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN tattoo_types tt ON a.tattoo_type_id = tt.id
      WHERE a.start_datetime >= date('now', '-1 day')
      ORDER BY a.start_datetime
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
    const { title, description, start_datetime, end_datetime, client_id, tattoo_type_id, estimated_price } = req.body;
    
    // Criar no Google Calendar se autenticado
    let googleEventId = null;
    if (fs.existsSync('./tokens.json')) {
      try {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
          summary: title,
          description: description,
          start: {
            dateTime: start_datetime,
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: end_datetime,
            timeZone: 'America/Sao_Paulo'
          }
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event
        });

        googleEventId = response.data.id;
      } catch (error) {
        console.error('Erro ao criar evento no Google Calendar:', error);
      }
    }

    // Salvar no banco local
    db.run(
      `INSERT INTO appointments 
       (google_event_id, client_id, tattoo_type_id, title, description, start_datetime, end_datetime, estimated_price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [googleEventId, client_id, tattoo_type_id, title, description, start_datetime, end_datetime, estimated_price],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Criar pasta do cliente se não existir
        if (client_id) {
          db.get("SELECT folder_path FROM clients WHERE id = ?", [client_id], async (err, client) => {
            if (client) {
              await hybridStorage.initializeStorage();
              // Criar estrutura de pastas
              const clientFolder = path.join(process.env.CLIENTS_FOLDER || './uploads', client.folder_path);
              await fs.ensureDir(path.join(clientFolder, 'referencias'));
              await fs.ensureDir(path.join(clientFolder, 'desenhos_aprovados'));
              await fs.ensureDir(path.join(clientFolder, 'fotos_finais'));
            }
          });
        }

        res.json({ id: this.lastID, googleEventId, success: true });
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
      
      for (const file of req.files) {
        try {
          // Salvar usando armazenamento híbrido
          const results = await hybridStorage.saveFile(file, client.folder_path, category);
          
          // Registrar no banco
          const primaryResult = results[0]; // Resultado local sempre primeiro
          db.run(
            `INSERT INTO files 
             (client_id, filename, original_name, file_path, storage_type, category, file_type, file_size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              clientId,
              primaryResult.filename,
              file.originalname,
              primaryResult.path,
              primaryResult.storage,
              category,
              getFileType(file.originalname),
              file.size
            ]
          );

          uploadResults.push({
            name: primaryResult.filename,
            originalName: file.originalname,
            category: category,
            size: file.size,
            type: getFileType(file.originalname),
            storageResults: results
          });
        } catch (error) {
          console.error('Erro ao fazer upload:', error);
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

// ===== FUNÇÃO PARA EXTRAIR THUMBNAIL DE ARQUIVOS PSD =====
async function extractPsdThumbnail(psdFilePath) {
  try {
    console.log('🎨 Extraindo thumbnail de PSD:', psdFilePath);
    
    // Ler o arquivo PSD
    const psdBuffer = await fs.readFile(psdFilePath);
    
    // Parse do PSD usando ag-psd
    const psd = readPsd(psdBuffer, {
      skipCompositeImageData: false, // Precisamos da imagem composta
      skipLayerImageData: true,      // Não precisamos das layers individuais
      skipThumbnail: false            // Queremos o thumbnail se existir
    });
    
    // Tentar usar o thumbnail embutido primeiro (mais rápido)
    if (psd.imageData && psd.imageData.data) {
      console.log('✅ Usando imagem composta do PSD');
      
      // Converter ImageData para buffer PNG usando Sharp
      const { width, height, data } = psd.imageData;
      
      // ImageData está em formato RGBA, precisamos converter para buffer
      const buffer = Buffer.from(data.buffer);
      
      // Criar imagem com Sharp a partir do buffer raw
      return await sharp(buffer, {
        raw: {
          width: width,
          height: height,
          channels: 4 // RGBA
        }
      })
      .png()
      .toBuffer();
    }
    
    // Se não houver imagem composta, retornar null (fallback para ícone)
    console.log('⚠️ PSD sem imagem composta, usando fallback');
    return null;
    
  } catch (error) {
    console.error('❌ Erro ao extrair thumbnail de PSD:', error.message);
    return null;
  }
}

// Listar arquivos do cliente
app.get('/api/clients/:clientId/files', (req, res) => {
  const { clientId } = req.params;
  
  db.all(
    "SELECT * FROM files WHERE client_id = ? ORDER BY uploaded_at DESC",
    [clientId],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Adicionar thumbnail_url para cada arquivo
      const filesWithThumbnails = files.map(file => {
        const mimeType = file.mime_type || '';
        const fileExt = path.extname(file.original_name || '').toLowerCase();
        const isPsd = fileExt === '.psd' || mimeType === 'image/vnd.adobe.photoshop';
        const isImage = mimeType.startsWith('image/') || isPsd;
        
        return {
          ...file,
          thumbnail_url: isImage ? `/api/files/${file.id}/thumbnail?size=300` : null
        };
      });
      
      console.log(`📋 [FILES] Listando ${filesWithThumbnails.length} arquivos do cliente ${clientId}`);
      res.json(filesWithThumbnails);
    }
  );
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

// Rota específica para thumbnails
app.get('/api/files/:fileId/thumbnail', async (req, res) => {
  const { fileId } = req.params;
  const size = req.query.size || '300'; // Tamanho padrão
  
  console.log(`🖼️ [THUMBNAIL] Requisição para arquivo ${fileId}, tamanho: ${size}px`);
  
  db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, file) => {
    if (err || !file) {
      console.log(`❌ [THUMBNAIL] Arquivo ${fileId} não encontrado no banco`);
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    console.log(`📁 [THUMBNAIL] Arquivo: ${file.original_name}, tipo: ${file.mime_type}, storage: ${file.storage_type}`);

    try {
      if (file.storage_type === 'local' && await fs.pathExists(file.file_path)) {
        const mimeType = mimeTypes.lookup(file.file_path) || file.mime_type;
        const fileExt = path.extname(file.file_path).toLowerCase();
        const isPsd = fileExt === '.psd' || mimeType === 'image/vnd.adobe.photoshop';
        
        console.log(`🔍 [THUMBNAIL] Extensão: ${fileExt}, MIME: ${mimeType}, isPSD: ${isPsd}`);
        
        // Verificar se é imagem ou PSD
        if (!isPsd && (!mimeType || !mimeType.startsWith('image/'))) {
          console.log(`⚠️ [THUMBNAIL] Arquivo não é imagem: ${mimeType}`);
          return res.status(400).json({ error: 'Arquivo não é uma imagem' });
        }
        
        const sizeInt = parseInt(size);
        const cacheDir = isPsd 
          ? path.join(__dirname, 'psd_thumbnails_cache')
          : path.join(__dirname, 'thumbnails_cache');
        await fs.ensureDir(cacheDir);
        
        // Nome do cache diferente para PSD
        const cacheFileName = isPsd 
          ? `psd_thumb_${fileId}_${sizeInt}.png`
          : `thumb_${fileId}_${sizeInt}${fileExt}`;
        const cachePath = path.join(cacheDir, cacheFileName);
        
        // Se já existe cache, servir do cache
        if (await fs.pathExists(cachePath)) {
          console.log(`📦 [THUMBNAIL] Servindo do cache: ${cacheFileName}`);
          return res.sendFile(path.resolve(cachePath));
        }
        
        console.log(`🔨 [THUMBNAIL] Gerando thumbnail...`);
        
        // ===== PROCESSAR ARQUIVOS PSD =====
        if (isPsd) {
          console.log('🎨 [PSD] Processando arquivo PSD...');
          
          // Extrair imagem do PSD
          const psdImageBuffer = await extractPsdThumbnail(file.file_path);
          
          if (!psdImageBuffer) {
            console.log('⚠️ [PSD] Não foi possível extrair imagem, usando ícone padrão');
            return res.status(400).json({ 
              error: 'PSD sem preview disponível',
              useFallback: true 
            });
          }
          
          // Processar o buffer extraído com Sharp
          await sharp(psdImageBuffer)
            .resize(sizeInt, sizeInt, { 
              fit: 'cover',
              position: 'center'
            })
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(cachePath);
          
          console.log('✅ [PSD] Thumbnail gerado com sucesso!');
          res.set('Content-Type', 'image/png');
          res.set('Cache-Control', 'public, max-age=31536000');
          return res.sendFile(path.resolve(cachePath));
        }
        
        // ===== PROCESSAR IMAGENS NORMAIS =====
        const image = sharp(file.file_path);
        const metadata = await image.metadata();
        
        console.log(`📐 [THUMBNAIL] Imagem original: ${metadata.width}x${metadata.height}, formato: ${metadata.format}`);
        
        // Redimensionar mantendo aspect ratio
        let pipeline = image.resize(sizeInt, sizeInt, { 
          fit: 'cover',
          position: 'center'
        });
        
        // Otimizar baseado no formato
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          pipeline = pipeline.jpeg({ quality: 80 });
        } else if (metadata.format === 'png') {
          pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
        } else if (metadata.format === 'webp') {
          pipeline = pipeline.webp({ quality: 80 });
        }
        
        // Salvar no cache
        await pipeline.toFile(cachePath);
        
        console.log(`✅ [THUMBNAIL] Gerado e salvo em: ${cacheFileName}`);
        
        // Servir o thumbnail
        res.set('Content-Type', mimeType);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.sendFile(path.resolve(cachePath));
        
      } else {
        console.log(`❌ [THUMBNAIL] Arquivo não acessível: ${file.file_path}`);
        res.status(404).json({ error: 'Arquivo não acessível' });
      }
    } catch (error) {
      console.error('❌ [THUMBNAIL] Erro ao gerar thumbnail:', error);
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

// Excluir arquivo
app.delete('/api/files/:fileId', async (req, res) => {
  const { fileId } = req.params;
  db.get("SELECT * FROM files WHERE id = ?", [fileId], async (err, file) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!file) return res.status(404).json({ error: 'Arquivo não encontrado' });
    try {
      if (file.storage_type === 'local' && file.file_path && fs.existsSync(file.file_path)) {
        await fs.remove(file.file_path);
      }
    } catch (e) {
      console.warn('Não foi possível remover o arquivo local:', e.message);
    }
    db.run("DELETE FROM files WHERE id = ?", [fileId], function(deleteErr) {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });
      res.json({ success: true });
    });
  });
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

// Excluir agendamento
app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  db.get("SELECT google_event_id FROM appointments WHERE id = ?", [id], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Agendamento não encontrado' });
    // Tentar remover do Google Calendar, se configurado
    try {
      if (row.google_event_id && fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        await calendar.events.delete({ calendarId: 'primary', eventId: row.google_event_id });
      }
    } catch (e) {
      console.warn('Falha ao remover evento do Google Calendar:', e.message);
    }
    db.run("DELETE FROM appointments WHERE id = ?", [id], function(deleteErr) {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });
      res.json({ success: true });
    });
  });
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
        
        const clientFolderPath = path.join(__dirname, 'uploads', client.folder_path);
        
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
      const fullPath = path.join(__dirname, 'uploads', folderPath);
      
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
    
    const files = (response.data.files || []).map((file) => ({
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
      is_folder: file.mimeType === 'application/vnd.google-apps.folder',
      parents: file.parents || []
    }));
    
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
    
    const files = (response.data.files || []).map((file) => ({
      id: `gdrive_${file.id}`,
      original_name: file.name,
      file_url: file.webViewLink,
      thumbnail_url: file.thumbnailLink ? `/api/drive/thumbnail/${file.id}` : (file.iconLink || null),
      mime_type: file.mimeType,
      created_at: file.createdTime,
      modified_at: file.modifiedTime,
      viewed_at: file.viewedByMeTime,
      file_size: file.size ? parseInt(file.size) : 0,
      source: 'google_drive',
      is_folder: false,
      parents: file.parents || []
    }));
    
    console.log(`✅ ${files.length} arquivos recentes encontrados`);
    res.json(files);
  } catch (error) {
    console.error('❌ Erro ao buscar arquivos recentes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🖼️ PROXY PARA THUMBNAILS DO GOOGLE DRIVE
app.get('/api/drive/thumbnail/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!driveClient) {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        oauth2Client.setCredentials(tokens);
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });
      } else {
        return res.status(401).json({ error: 'Google Drive não autenticado' });
      }
    }
    
    console.log(`🖼️ Buscando thumbnail para arquivo: ${fileId}`);
    
    // Obter metadados do arquivo para pegar a URL da thumbnail
    const fileMetadata = await driveClient.files.get({
      fileId: fileId,
      fields: 'thumbnailLink, mimeType'
    });
    
    if (!fileMetadata.data.thumbnailLink) {
      return res.status(404).json({ error: 'Thumbnail não disponível' });
    }
    
    // Buscar a thumbnail usando o OAuth token
    const thumbnailUrl = fileMetadata.data.thumbnailLink;
    const response = await axios.get(thumbnailUrl, {
      headers: {
        'Authorization': `Bearer ${oauth2Client.credentials.access_token}`
      },
      responseType: 'arraybuffer'
    });
    
    // Detectar tipo de imagem
    let contentType = 'image/jpeg';
    if (thumbnailUrl.includes('.png')) {
      contentType = 'image/png';
    } else if (fileMetadata.data.mimeType === 'image/png') {
      contentType = 'image/png';
    }
    
    // Retornar a imagem
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
    res.send(Buffer.from(response.data));
    
    console.log(`✅ Thumbnail servida com sucesso`);
  } catch (error) {
    console.error('❌ Erro ao buscar thumbnail:', error.message);
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
    const { client_id, category, tags, notes } = req.body;
    
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
               (client_id, filename, original_name, file_path, storage_type, category, file_type, file_size) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                client_id,
                primaryResult.filename,
                file.originalname,
                primaryResult.path,
                primaryResult.storage,
                category || 'outros',
                getFileType(file.originalname),
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

// Inicializar servidor
server.listen(port, async () => {
  console.log(`🚀 Servidor híbrido rodando em http://localhost:${port}`);
  console.log(`📊 Modo de armazenamento: ${hybridStorage.storageMode}`);
  
  // Inicializar armazenamento
  await hybridStorage.initializeStorage();
  
  console.log('✅ Sistema híbrido inicializado com sucesso!');
});

module.exports = { app, server, hybridStorage };
