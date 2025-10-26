const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
require('dotenv').config();

class SyncManager {
  constructor() {
    this.db = new sqlite3.Database('./agenda_hibrida.db');
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    this.driveClient = null;
    this.calendarClient = null;
    this.qnapConfig = {
      host: process.env.QNAP_HOST,
      username: process.env.QNAP_USERNAME,
      password: process.env.QNAP_PASSWORD,
      sharePath: process.env.QNAP_SHARE_PATH || '/share/Tatuagens'
    };
    
    this.syncStatus = {
      lastSync: null,
      isRunning: false,
      errors: [],
      stats: {
        filesSynced: 0,
        appointmentsSynced: 0,
        clientsSynced: 0
      }
    };

    this.initializeClients();
  }

  async initializeClients() {
    try {
      if (fs.existsSync('./tokens.json')) {
        const tokens = fs.readJsonSync('./tokens.json');
        this.oauth2Client.setCredentials(tokens);
        this.driveClient = google.drive({ version: 'v3', auth: this.oauth2Client });
        this.calendarClient = google.calendar({ version: 'v3', auth: this.oauth2Client });
        console.log('✅ Clientes Google inicializados');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar clientes Google:', error);
    }
  }

  // Sincronização completa do sistema
  async performFullSync() {
    if (this.syncStatus.isRunning) {
      console.log('⚠️ Sincronização já em andamento');
      return false;
    }

    console.log('🔄 Iniciando sincronização completa...');
    this.syncStatus.isRunning = true;
    this.syncStatus.errors = [];
    this.syncStatus.stats = { filesSynced: 0, appointmentsSynced: 0, clientsSynced: 0 };

    try {
      // 1. Sincronizar Google Calendar
      await this.syncGoogleCalendar();
      
      // 2. Sincronizar arquivos para Google Drive
      await this.syncFilesToGoogleDrive();
      
      // 3. Sincronizar com QNAP (se disponível)
      await this.syncWithQNAP();
      
      // 4. Criar backup local
      await this.createLocalBackup();
      
      // 5. Limpar arquivos antigos
      await this.cleanupOldFiles();

      this.syncStatus.lastSync = new Date().toISOString();
      console.log('✅ Sincronização completa finalizada');
      
      return true;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.syncStatus.errors.push(error.message);
      return false;
    } finally {
      this.syncStatus.isRunning = false;
    }
  }

  // Sincronização com Google Calendar
  async syncGoogleCalendar() {
    if (!this.calendarClient) {
      console.log('⚠️ Google Calendar não configurado');
      return;
    }

    console.log('📅 Sincronizando Google Calendar...');
    
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // Próximos 3 meses

      // Buscar eventos do Google Calendar
      const response = await this.calendarClient.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.data.items;
      
      // Buscar agendamentos locais
      const localAppointments = await this.getLocalAppointments();
      const localEventIds = localAppointments.map(a => a.google_event_id).filter(Boolean);

      // Sincronizar eventos novos do Google para local
      for (const event of googleEvents) {
        if (!localEventIds.includes(event.id)) {
          await this.createLocalAppointmentFromGoogleEvent(event);
          this.syncStatus.stats.appointmentsSynced++;
        }
      }

      // Sincronizar agendamentos locais para Google
      for (const appointment of localAppointments) {
        if (!appointment.google_event_id) {
          const googleEventId = await this.createGoogleEventFromLocalAppointment(appointment);
          if (googleEventId) {
            await this.updateLocalAppointmentWithGoogleId(appointment.id, googleEventId);
            this.syncStatus.stats.appointmentsSynced++;
          }
        }
      }

      console.log(`✅ ${this.syncStatus.stats.appointmentsSynced} agendamentos sincronizados`);
    } catch (error) {
      console.error('❌ Erro na sincronização do Google Calendar:', error);
      throw error;
    }
  }

  // Sincronização de arquivos para Google Drive
  async syncFilesToGoogleDrive() {
    if (!this.driveClient) {
      console.log('⚠️ Google Drive não configurado');
      return;
    }

    console.log('☁️ Sincronizando arquivos para Google Drive...');

    try {
      // Buscar arquivos locais não sincronizados
      const unsyncedFiles = await this.getUnsyncedFiles();
      
      for (const file of unsyncedFiles) {
        try {
          if (fs.existsSync(file.file_path)) {
            const clientName = await this.getClientName(file.client_id);
            const driveFileId = await this.uploadFileToGoogleDrive(
              file.file_path, 
              file.filename, 
              clientName, 
              file.category
            );
            
            if (driveFileId) {
              await this.updateFileWithGoogleDriveId(file.id, driveFileId);
              this.syncStatus.stats.filesSynced++;
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao sincronizar arquivo ${file.filename}:`, error);
        }
      }

      console.log(`✅ ${this.syncStatus.stats.filesSynced} arquivos sincronizados`);
    } catch (error) {
      console.error('❌ Erro na sincronização de arquivos:', error);
      throw error;
    }
  }

  // Sincronização com QNAP
  async syncWithQNAP() {
    if (!this.qnapConfig.host) {
      console.log('⚠️ QNAP não configurado');
      return;
    }

    console.log('🖥️ Sincronizando com QNAP...');

    try {
      // Verificar conectividade
      const isOnline = await this.checkQNAPConnectivity();
      if (!isOnline) {
        console.log('⚠️ QNAP não acessível');
        return;
      }

      // Autenticar no QNAP
      const sessionId = await this.authenticateQNAP();
      if (!sessionId) {
        console.log('❌ Falha na autenticação QNAP');
        return;
      }

      // Sincronizar estrutura de pastas
      await this.syncFoldersToQNAP(sessionId);
      
      // Sincronizar arquivos
      await this.syncFilesToQNAP(sessionId);

      console.log('✅ Sincronização QNAP concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização QNAP:', error);
    }
  }

  // Backup local automático
  async createLocalBackup() {
    console.log('💾 Criando backup local...');

    try {
      const backupDir = './backups';
      await fs.ensureDir(backupDir);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

      // Exportar dados do banco
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        clients: await this.getAllClients(),
        appointments: await this.getAllAppointments(),
        tattooTypes: await this.getAllTattooTypes(),
        files: await this.getAllFiles(),
        systemConfig: await this.getSystemConfig()
      };

      await fs.writeJson(backupPath, backupData, { spaces: 2 });

      // Compactar backup se possível
      try {
        const archiver = require('archiver');
        const output = fs.createWriteStream(`${backupPath}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        archive.pipe(output);
        archive.file(backupPath, { name: `backup_${timestamp}.json` });
        await archive.finalize();
        
        // Remover JSON não compactado
        await fs.remove(backupPath);
        console.log(`✅ Backup criado: backup_${timestamp}.json.zip`);
      } catch (error) {
        console.log(`✅ Backup criado: backup_${timestamp}.json`);
      }

    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw error;
    }
  }

  // Limpeza de arquivos antigos
  async cleanupOldFiles() {
    console.log('🧹 Limpando arquivos antigos...');

    try {
      const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Limpar backups antigos
      const backupDir = './backups';
      if (await fs.pathExists(backupDir)) {
        const files = await fs.readdir(backupDir);
        for (const file of files) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime < cutoffDate) {
            await fs.remove(filePath);
            console.log(`🗑️ Removido backup antigo: ${file}`);
          }
        }
      }

      // Limpar logs antigos
      const logFiles = ['error.log', 'combined.log'];
      for (const logFile of logFiles) {
        if (await fs.pathExists(logFile)) {
          const stats = await fs.stat(logFile);
          if (stats.size > 10 * 1024 * 1024) { // 10MB
            await fs.writeFile(logFile, ''); // Limpar log
            console.log(`🗑️ Log limpo: ${logFile}`);
          }
        }
      }

      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
    }
  }

  // Métodos auxiliares para banco de dados
  async getLocalAppointments() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM appointments WHERE start_datetime >= date('now', '-1 day')",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getUnsyncedFiles() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM files WHERE cloud_path IS NULL OR cloud_path = ''",
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getClientName(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT name FROM clients WHERE id = ?",
        [clientId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.name : 'Cliente_Desconhecido');
        }
      );
    });
  }

  async getAllClients() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM clients", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getAllAppointments() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM appointments", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getAllTattooTypes() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM tattoo_types", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getAllFiles() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM files", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async getSystemConfig() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM system_config", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Métodos para Google Drive
  async uploadFileToGoogleDrive(filePath, filename, clientName, category) {
    try {
      // Criar estrutura de pastas
      const clientFolderId = await this.getOrCreateGDriveFolder(clientName);
      const categoryFolderId = await this.getOrCreateGDriveFolder(category, clientFolderId);

      const fileMetadata = {
        name: filename,
        parents: [categoryFolderId]
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath)
      };

      const response = await this.driveClient.files.create({
        resource: fileMetadata,
        media: media
      });

      return response.data.id;
    } catch (error) {
      console.error('Erro ao fazer upload para Google Drive:', error);
      return null;
    }
  }

  async getOrCreateGDriveFolder(name, parentId = null) {
    const query = parentId 
      ? `name='${name}' and parents in '${parentId}' and mimeType='application/vnd.google-apps.folder'`
      : `name='${name}' and mimeType='application/vnd.google-apps.folder'`;

    const response = await this.driveClient.files.list({ q: query });
    
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

    const folder = await this.driveClient.files.create({
      resource: fileMetadata
    });

    return folder.data.id;
  }

  // Métodos para QNAP
  async checkQNAPConnectivity() {
    try {
      const response = await axios.get(`http://${this.qnapConfig.host}:8080/cgi-bin/authLogin.cgi`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async authenticateQNAP() {
    try {
      const response = await axios.post(`http://${this.qnapConfig.host}:8080/cgi-bin/authLogin.cgi`, {
        user: this.qnapConfig.username,
        pwd: this.qnapConfig.password
      });
      
      return response.data.authSid || null;
    } catch (error) {
      console.error('Erro na autenticação QNAP:', error);
      return null;
    }
  }

  // Métodos de atualização do banco
  async updateFileWithGoogleDriveId(fileId, driveFileId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE files SET cloud_path = ? WHERE id = ?",
        [driveFileId, fileId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async updateLocalAppointmentWithGoogleId(appointmentId, googleEventId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE appointments SET google_event_id = ? WHERE id = ?",
        [googleEventId, appointmentId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Agendar sincronizações automáticas
  scheduleAutoSync() {
    const syncInterval = process.env.SYNC_INTERVAL || '15';
    
    // Sincronização a cada X minutos
    cron.schedule(`*/${syncInterval} * * * *`, async () => {
      console.log('🔄 Iniciando sincronização automática...');
      await this.performFullSync();
    });

    // Backup diário às 2h da manhã
    cron.schedule('0 2 * * *', async () => {
      console.log('💾 Iniciando backup automático diário...');
      await this.createLocalBackup();
    });

    // Limpeza semanal aos domingos às 3h da manhã
    cron.schedule('0 3 * * 0', async () => {
      console.log('🧹 Iniciando limpeza automática semanal...');
      await this.cleanupOldFiles();
    });

    console.log('⏰ Sincronizações automáticas agendadas');
  }

  // Obter status da sincronização
  getSyncStatus() {
    return {
      ...this.syncStatus,
      nextSync: this.getNextSyncTime(),
      qnapOnline: this.qnapConfig.host ? 'Verificando...' : 'Não configurado',
      googleDriveConnected: !!this.driveClient,
      googleCalendarConnected: !!this.calendarClient
    };
  }

  getNextSyncTime() {
    const interval = parseInt(process.env.SYNC_INTERVAL) || 15;
    const next = new Date();
    next.setMinutes(next.getMinutes() + interval);
    return next.toISOString();
  }
}

module.exports = SyncManager;
