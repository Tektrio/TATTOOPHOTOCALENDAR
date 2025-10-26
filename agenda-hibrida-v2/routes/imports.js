/**
 * Rotas de Importação e Sincronização
 * - Importação Excel Vagaro (clientes e agendamentos)
 * - Importação ICS (calendário)
 * - OAuth Google Calendar
 * - Sincronização Google Calendar
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Services
const vagaroService = require('../services/vagaroExcelImportService');
const icsService = require('../services/icsImportService');
const googleAuthService = require('../services/googleAuthService');
const googleCalendarService = require('../services/googleCalendarService');

// Configurar multer para upload de arquivos
const upload = multer({
  dest: path.join(__dirname, '..', 'uploads', 'temp'),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls', '.ics', '.ical'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido. Extensões aceitas: ${allowedExtensions.join(', ')}`));
    }
  }
});

// Helper para salvar log de importação
async function saveImportLog(db, logData) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO import_logs (
        import_type, import_source, status, 
        records_processed, records_created, records_updated, 
        records_skipped, records_failed, error_details,
        file_name, batch_id, started_at, completed_at, duration_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      logData.import_type,
      logData.import_source,
      logData.status,
      logData.records_processed,
      logData.records_created,
      logData.records_updated,
      logData.records_skipped,
      logData.records_failed,
      JSON.stringify(logData.error_details || []),
      logData.file_name,
      logData.batch_id,
      logData.started_at,
      logData.completed_at,
      logData.duration_seconds
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * POST /api/imports/vagaro/excel/preview
 * Preview de arquivo Excel Vagaro
 */
router.post('/vagaro/excel/preview', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { type } = req.query; // 'clients' ou 'appointments'
    
    if (!type || !['clients', 'appointments'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: clients ou appointments' });
    }

    // Ler arquivo
    const buffer = await fs.readFile(req.file.path);
    
    // Gerar preview
    const preview = vagaroService.previewExcelFile(buffer, type);

    // Limpar arquivo temporário
    await fs.remove(req.file.path);

    res.json({
      success: true,
      preview: preview,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: type
      },
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Erro no preview Excel:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && req.file.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json({
      error: 'Erro ao fazer preview do arquivo',
      message: error.message
    });
  }
});

/**
 * POST /api/imports/vagaro/excel?type=clients|appointments
 * Importa arquivo Excel do Vagaro
 */
router.post('/vagaro/excel', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  const db = req.app.locals.db;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { type } = req.query; // 'clients' ou 'appointments'
    const { mapping, skipDuplicates } = req.body;

    if (!type || !['clients', 'appointments'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: clients ou appointments' });
    }

    console.log(`📥 Importando ${type} do arquivo: ${req.file.originalname}`);

    // Ler arquivo
    const buffer = await fs.readFile(req.file.path);

    // Preparar opções
    const options = {
      mapping: mapping ? JSON.parse(mapping) : null,
      skipDuplicates: skipDuplicates === 'true'
    };

    let report;
    
    // Executar importação
    if (type === 'clients') {
      report = await vagaroService.importClientsFromExcel(db, buffer, options);
    } else {
      report = await vagaroService.importAppointmentsFromExcel(db, buffer, options);
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Determinar status
    const status = report.errors.length === 0 ? 'success' : 
                   report.created + report.updated > 0 ? 'partial' : 'failed';

    // Salvar log
    await saveImportLog(db, {
      import_type: 'vagaro_excel',
      import_source: type,
      status: status,
      records_processed: report.total,
      records_created: report.created,
      records_updated: report.updated,
      records_skipped: report.skipped,
      records_failed: report.errors.length,
      error_details: report.errors,
      file_name: req.file.originalname,
      batch_id: `vagaro_${type}_${Date.now()}`,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(endTime).toISOString(),
      duration_seconds: duration
    });

    // Limpar arquivo temporário
    await fs.remove(req.file.path);

    res.json({
      success: true,
      report: report,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: type
      },
      processingTime: duration
    });

  } catch (error) {
    console.error('Erro na importação Excel:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (req.file && req.file.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json({
      error: 'Erro ao importar arquivo',
      message: error.message
    });
  }
});

/**
 * POST /api/imports/calendar/ics/preview
 * Preview de arquivo ICS
 */
router.post('/calendar/ics/preview', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Ler arquivo
    const data = await fs.readFile(req.file.path, 'utf-8');
    
    // Gerar preview
    const preview = icsService.previewIcsFile(data);

    // Limpar arquivo temporário
    await fs.remove(req.file.path);

    res.json({
      success: true,
      preview: preview,
      file: {
        name: req.file.originalname,
        size: req.file.size
      },
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Erro no preview ICS:', error);
    
    if (req.file && req.file.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json({
      error: 'Erro ao fazer preview do arquivo ICS',
      message: error.message
    });
  }
});

/**
 * POST /api/imports/calendar/ics
 * Importa arquivo ICS
 */
router.post('/calendar/ics', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  const db = req.app.locals.db;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { skipDuplicates, autoLinkClients } = req.body;

    console.log(`📥 Importando arquivo ICS: ${req.file.originalname}`);

    // Ler arquivo
    const data = await fs.readFile(req.file.path, 'utf-8');

    // Preparar opções
    const options = {
      skipDuplicates: skipDuplicates === 'true',
      autoLinkClients: autoLinkClients !== 'false' // true por padrão
    };

    // Executar importação
    const report = await icsService.importFromIcs(db, data, options);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Determinar status
    const status = report.errors.length === 0 ? 'success' : 
                   report.created + report.updated > 0 ? 'partial' : 'failed';

    // Salvar log
    await saveImportLog(db, {
      import_type: 'ics',
      import_source: 'appointments',
      status: status,
      records_processed: report.total,
      records_created: report.created,
      records_updated: report.updated,
      records_skipped: report.skipped,
      records_failed: report.errors.length,
      error_details: report.errors,
      file_name: req.file.originalname,
      batch_id: `ics_${Date.now()}`,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(endTime).toISOString(),
      duration_seconds: duration
    });

    // Limpar arquivo temporário
    await fs.remove(req.file.path);

    res.json({
      success: true,
      report: report,
      file: {
        name: req.file.originalname,
        size: req.file.size
      },
      processingTime: duration
    });

  } catch (error) {
    console.error('Erro na importação ICS:', error);
    
    if (req.file && req.file.path) {
      await fs.remove(req.file.path).catch(() => {});
    }

    res.status(500).json({
      error: 'Erro ao importar arquivo ICS',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/google
 * Inicia fluxo OAuth Google
 */
router.get('/google', (req, res) => {
  try {
    const authUrl = googleAuthService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erro ao iniciar OAuth:', error);
    res.status(500).json({
      error: 'Erro ao iniciar autenticação',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Callback OAuth Google
 */
router.get('/google/callback', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(`/?auth_error=${error}`);
    }

    if (!code) {
      return res.status(400).json({ error: 'Código de autorização não fornecido' });
    }

    // Trocar código por tokens
    const tokens = await googleAuthService.getTokensFromCode(code);

    // Salvar tokens
    await googleAuthService.saveTokensToDb(db, tokens);
    await googleAuthService.saveTokensToFile(tokens);

    console.log('✅ Autenticação Google concluída com sucesso');

    // Redirecionar para página de sucesso
    res.redirect('/?auth_success=true');

  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    res.redirect(`/?auth_error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /api/auth/google/status
 * Verifica status da autenticação
 */
router.get('/google/status', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const isAuth = await googleAuthService.isAuthenticated(db);
    const tokenInfo = await googleAuthService.getTokenInfo(db);

    res.json({
      authenticated: isAuth,
      tokenInfo: tokenInfo
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      error: 'Erro ao verificar status',
      message: error.message
    });
  }
});

/**
 * DELETE /api/auth/google/revoke
 * Revoga tokens Google
 */
router.delete('/google/revoke', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    await googleAuthService.revokeTokens(db);
    
    res.json({
      success: true,
      message: 'Tokens revogados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao revogar tokens:', error);
    res.status(500).json({
      error: 'Erro ao revogar tokens',
      message: error.message
    });
  }
});

/**
 * GET /api/sync/google-calendar/calendars
 * Lista calendários do usuário
 */
router.get('/google-calendar/calendars', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const calendars = await googleCalendarService.listCalendars(db);
    
    res.json({
      success: true,
      calendars: calendars
    });

  } catch (error) {
    console.error('Erro ao listar calendários:', error);
    res.status(500).json({
      error: 'Erro ao listar calendários',
      message: error.message
    });
  }
});

/**
 * POST /api/sync/google-calendar/now
 * Executa sincronização manual com Google Calendar
 */
router.post('/google-calendar/now', async (req, res) => {
  const startTime = Date.now();
  const db = req.app.locals.db;

  try {
    const {
      calendarId = 'primary',
      daysBack = 30,
      daysForward = 90,
      skipDuplicates = false
    } = req.body;

    console.log('🔄 Iniciando sincronização com Google Calendar...');

    // Executar sincronização
    const report = await googleCalendarService.syncGoogleCalendar(db, {
      calendarId: calendarId,
      daysBack: parseInt(daysBack),
      daysForward: parseInt(daysForward),
      skipDuplicates: skipDuplicates === true || skipDuplicates === 'true'
    });

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Determinar status
    const status = report.errors.length === 0 ? 'success' : 
                   report.created + report.updated > 0 ? 'partial' : 'failed';

    // Salvar log
    await saveImportLog(db, {
      import_type: 'google_calendar',
      import_source: 'appointments',
      status: status,
      records_processed: report.total,
      records_created: report.created,
      records_updated: report.updated,
      records_skipped: report.skipped,
      records_failed: report.errors.length,
      error_details: report.errors,
      file_name: null,
      batch_id: `google_cal_${Date.now()}`,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(endTime).toISOString(),
      duration_seconds: duration
    });

    res.json({
      success: true,
      report: report,
      processingTime: duration
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({
      error: 'Erro ao sincronizar com Google Calendar',
      message: error.message
    });
  }
});

/**
 * GET /api/sync/google-calendar/last-sync
 * Obtém data/hora da última sincronização
 */
router.get('/google-calendar/last-sync', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const lastSync = await googleCalendarService.getLastSync(db);
    
    res.json({
      success: true,
      lastSync: lastSync
    });

  } catch (error) {
    console.error('Erro ao buscar última sincronização:', error);
    res.status(500).json({
      error: 'Erro ao buscar última sincronização',
      message: error.message
    });
  }
});

/**
 * GET /api/imports/logs
 * Lista logs de importação
 */
router.get('/logs', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const { limit = 50, type, status } = req.query;
    
    let query = 'SELECT * FROM import_logs WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND import_type = ?';
      params.push(type);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY completed_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const logs = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      success: true,
      logs: logs
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({
      error: 'Erro ao buscar logs',
      message: error.message
    });
  }
});

module.exports = router;
