/**
 * Rotas de API para Importação de Dados Vagaro
 * Endpoints unificados para upload e gerenciamento de importações
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const VagaroUniversalImporter = require('../services/vagaroUniversalImporter');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'vagaro');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `vagaro-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .xlsx, .xls ou .csv são permitidos'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

/**
 * POST /api/imports/vagaro/upload
 * Upload e importação automática de arquivo Vagaro
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  const db = req.app.locals.db;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    console.log(`\n📥 Iniciando importação: ${req.file.originalname}`);

    // Criar importador
    const importer = new VagaroUniversalImporter(db);

    // Importar arquivo (detecta tipo automaticamente)
    const stats = await importer.importFile(req.file.path, req.file.originalname);

    // Gerar relatório
    const report = importer.generateReport();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Limpar arquivo temporário
    await fs.unlink(req.file.path).catch(() => {});

    // Salvar log da importação
    await saveImportLog(db, {
      file_name: req.file.originalname,
      file_type: detectFileType(req.file.originalname),
      total_rows: stats.total,
      created_rows: stats.created,
      updated_rows: stats.updated,
      skipped_rows: stats.skipped,
      error_rows: stats.errors.length,
      duration_seconds: duration,
      status: stats.errors.length === 0 ? 'success' : 
              stats.created + stats.updated > 0 ? 'partial' : 'failed',
      errors: JSON.stringify(stats.errors)
    });

    console.log(`\n✅ Importação concluída em ${duration}s`);

    res.json({
      success: true,
      message: 'Importação concluída com sucesso',
      stats: stats,
      report: report,
      duration: duration + 's',
      file: req.file.originalname
    });

  } catch (error) {
    console.error('\n❌ Erro na importação:', error);

    // Limpar arquivo se existir
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/imports/vagaro/batch
 * Upload e importação de múltiplos arquivos
 */
router.post('/batch', upload.array('files', 20), async (req, res) => {
  const startTime = Date.now();
  const db = req.app.locals.db;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    console.log(`\n📦 Importação em lote: ${req.files.length} arquivos`);

    const importer = new VagaroUniversalImporter(db);
    const results = [];

    // Processar cada arquivo
    for (const file of req.files) {
      try {
        console.log(`\n📁 Processando: ${file.originalname}`);
        
        const stats = await importer.importFile(file.path, file.originalname);
        
        results.push({
          file: file.originalname,
          success: true,
          stats: stats
        });

        // Limpar arquivo
        await fs.unlink(file.path).catch(() => {});

      } catch (error) {
        console.error(`❌ Erro em ${file.originalname}:`, error.message);
        
        results.push({
          file: file.originalname,
          success: false,
          error: error.message
        });

        await fs.unlink(file.path).catch(() => {});
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const report = importer.generateReport();

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\n✅ Lote concluído em ${duration}s`);
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ❌ Falhas: ${failCount}`);

    res.json({
      success: true,
      message: `Processados ${req.files.length} arquivos`,
      results: results,
      report: report,
      duration: duration + 's',
      summary: {
        total: req.files.length,
        success: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('\n❌ Erro na importação em lote:', error);

    // Limpar todos os arquivos
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/vagaro/stats
 * Retorna estatísticas gerais de importação
 */
router.get('/stats', async (req, res) => {
  const db = req.app.locals.db;

  try {
    // Estatísticas de clientes
    const clientStats = await queryDb(db, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN import_source = 'vagaro' THEN 1 END) as from_vagaro,
        SUM(vagaro_amount_paid) as total_paid,
        AVG(vagaro_appointments_booked) as avg_appointments
      FROM clients
    `);

    // Estatísticas de transações
    const transactionStats = await queryDb(db, `
      SELECT 
        COUNT(*) as total,
        SUM(gross_amount) as total_gross,
        SUM(net_amount) as total_net,
        SUM(total_fee) as total_fees
      FROM vagaro_transactions
    `);

    // Estatísticas de serviços
    const serviceStats = await allDb(db, `
      SELECT 
        COUNT(*) as total_services,
        SUM(total_appointments) as total_appointments,
        SUM(service_sales + service_addon_sales + class_sales + class_addon_sales) as total_revenue
      FROM vagaro_services
      WHERE is_active = 1
    `);

    // Estatísticas de gift cards
    const giftCardStats = await queryDb(db, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'outstanding' THEN 1 END) as active,
        SUM(current_balance) as total_balance
      FROM vagaro_gift_cards
    `);

    // Estatísticas de formulários
    const formStats = await queryDb(db, `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN signature_status = 'unsigned' THEN 1 END) as unsigned,
        COUNT(CASE WHEN signature_status = 'signed' THEN 1 END) as signed
      FROM vagaro_forms
    `);

    res.json({
      success: true,
      stats: {
        clients: clientStats,
        transactions: transactionStats,
        services: serviceStats[0],
        gift_cards: giftCardStats,
        forms: formStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/vagaro/logs
 * Histórico de importações
 */
router.get('/logs', async (req, res) => {
  const db = req.app.locals.db;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const logs = await allDb(db, `
      SELECT *
      FROM import_logs
      WHERE file_type LIKE '%vagaro%' OR file_name LIKE '%vagaro%'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const total = await queryDb(db, `
      SELECT COUNT(*) as count
      FROM import_logs
      WHERE file_type LIKE '%vagaro%' OR file_name LIKE '%vagaro%'
    `);

    res.json({
      success: true,
      logs: logs,
      pagination: {
        total: total.count,
        limit: limit,
        offset: offset,
        has_more: offset + logs.length < total.count
      }
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/vagaro/preview
 * Preview de arquivo antes de importar
 */
router.post('/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    const importer = new VagaroUniversalImporter(req.app.locals.db);
    const data = await importer.readExcelFile(req.file.path);

    // Limitar a 10 linhas para preview
    const preview = data.slice(0, 10);
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const fileType = importer.detectFileType(headers, req.file.originalname);

    // Limpar arquivo
    await fs.unlink(req.file.path).catch(() => {});

    res.json({
      success: true,
      preview: {
        file_name: req.file.originalname,
        detected_type: fileType,
        total_rows: data.length,
        headers: headers,
        sample_data: preview
      }
    });

  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// HELPERS
// ============================================

function detectFileType(fileName) {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('customer')) return 'customers';
  if (lowerName.includes('deposit')) return 'deposits';
  if (lowerName.includes('transaction')) return 'transactions';
  if (lowerName.includes('giftcard')) return 'giftcards';
  if (lowerName.includes('form')) return 'forms';
  if (lowerName.includes('service')) return 'services';
  
  return 'unknown';
}

async function saveImportLog(db, logData) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO import_logs (
        file_name, file_type, total_rows, created_rows, updated_rows,
        skipped_rows, error_rows, duration_seconds, status, errors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logData.file_name,
      logData.file_type,
      logData.total_rows,
      logData.created_rows,
      logData.updated_rows,
      logData.skipped_rows,
      logData.error_rows,
      logData.duration_seconds,
      logData.status,
      logData.errors
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function queryDb(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allDb(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = router;

