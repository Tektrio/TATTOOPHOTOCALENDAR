const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
// const { google } = require('googleapis'); // Removido - não utilizado

/**
 * Rotas de Arquivos dos Clientes
 */

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const clientId = req.params.id;
    const category = req.body.category || 'referencias';
    const uploadPath = path.join(__dirname, '..', 'uploads', `client_${clientId}`, category);
    
    try {
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB - Para suportar arquivos PSD grandes
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|psd|ai|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use: jpeg, jpg, png, gif, pdf, psd, ai, svg'));
    }
  }
});

// GET /api/customers/:id/files - Listar arquivos do cliente
router.get('/:id/files', (req, res) => {
  const { id } = req.params;
  const { category } = req.query;
  
  // Validar ID
  const clientId = parseInt(id);
  if (isNaN(clientId)) {
    console.error('[GET /customers/:id/files] ID inválido:', id);
    return res.status(400).json({ error: 'ID de cliente inválido' });
  }
  
  let query = `
    SELECT 
      f.*,
      c.name as client_name
    FROM customer_files f
    LEFT JOIN clients c ON f.client_id = c.id
    WHERE f.client_id = ?
  `;
  
  const params = [clientId];
  
  if (category) {
    query += ' AND f.category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY f.uploaded_at DESC';
  
  console.log(`[GET /customers/${clientId}/files] Buscando arquivos...`);
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error(`[GET /customers/${clientId}/files] Erro:`, err.message);
      console.error('SQL:', query);
      console.error('Params:', params);
      // Retornar array vazio ao invés de 500
      return res.json({ files: [], count: 0, warning: 'Erro ao carregar arquivos' });
    }
    
    console.log(`[GET /customers/${clientId}/files] ${(rows || []).length} arquivos encontrados`);
    
    // Adicionar URL completa para cada arquivo
    const filesWithUrl = (rows || []).map(file => ({
      ...file,
      url: `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), file.file_path)}`.replace(/\\/g, '/')
    }));
    
    res.json({ files: filesWithUrl, count: filesWithUrl.length });
  });
});

// POST /api/customers/:id/files - Upload de arquivo(s)
router.post('/:id/files', upload.array('files', 10), async (req, res) => {
  const { id } = req.params;
  const { category = 'referencias' } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  
  // Verificar se o cliente existe
  req.app.locals.db.get('SELECT id FROM clients WHERE id = ?', [id], async (err, client) => {
    if (err) {
      console.error('Erro ao verificar cliente:', err);
      return res.status(500).json({ error: 'Erro ao verificar cliente' });
    }
    
    if (!client) {
      // Remover arquivos enviados
      req.files.forEach(file => fs.removeSync(file.path));
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Inserir informações dos arquivos no banco
    const insertPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO customer_files (
            client_id, filename, original_name, file_path, storage_type,
            category, file_type, file_size, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        const params = [
          id,
          file.filename,
          file.originalname,
          file.path,
          'local',
          category,
          file.mimetype,
          file.size
        ];
        
        req.app.locals.db.run(query, params, function(err) {
          if (err) {
            console.error('Erro ao inserir arquivo:', err);
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              filename: file.filename,
              original_name: file.originalname,
              file_type: file.mimetype,
              file_size: file.size,
              category: category,
              url: `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), file.path)}`.replace(/\\/g, '/')
            });
          }
        });
      });
    });
    
    try {
      const insertedFiles = await Promise.all(insertPromises);
      res.status(201).json({
        message: `${insertedFiles.length} arquivo(s) enviado(s) com sucesso`,
        files: insertedFiles
      });
    } catch (err) {
      console.error('Erro ao salvar arquivos:', err);
      res.status(500).json({ error: 'Erro ao salvar arquivos no banco de dados' });
    }
  });
});

// GET /api/customers/:id/files/:fileId - Buscar arquivo específico
router.get('/:id/files/:fileId', (req, res) => {
  const { id, fileId } = req.params;
  
  const query = 'SELECT * FROM customer_files WHERE id = ? AND client_id = ?';
  
  req.app.locals.db.get(query, [fileId, id], (err, file) => {
    if (err) {
      console.error('Erro ao buscar arquivo:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    file.url = `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), file.file_path)}`.replace(/\\/g, '/');
    
    res.json(file);
  });
});

// GET /api/customers/:id/files/:fileId/download - Download de arquivo
router.get('/:id/files/:fileId/download', (req, res) => {
  const { id, fileId } = req.params;
  
  const query = 'SELECT * FROM customer_files WHERE id = ? AND client_id = ?';
  
  req.app.locals.db.get(query, [fileId, id], (err, file) => {
    if (err) {
      console.error('Erro ao buscar arquivo:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Verificar se arquivo existe
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'Arquivo físico não encontrado' });
    }
    
    res.download(file.file_path, file.original_name);
  });
});

// DELETE /api/customers/:id/files/:fileId - Deletar arquivo
router.delete('/:id/files/:fileId', (req, res) => {
  const { id, fileId } = req.params;
  
  // Buscar arquivo primeiro para deletar do disco
  const query = 'SELECT * FROM customer_files WHERE id = ? AND client_id = ?';
  
  req.app.locals.db.get(query, [fileId, id], (err, file) => {
    if (err) {
      console.error('Erro ao buscar arquivo:', err);
      return res.status(500).json({ error: 'Erro ao buscar arquivo' });
    }
    
    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Deletar arquivo físico
    try {
      if (fs.existsSync(file.file_path)) {
        fs.removeSync(file.file_path);
      }
    } catch (err) {
      console.error('Erro ao deletar arquivo físico:', err);
    }
    
    // Deletar do banco
    req.app.locals.db.run('DELETE FROM customer_files WHERE id = ?', [fileId], function(err) {
      if (err) {
        console.error('Erro ao deletar arquivo do banco:', err);
        return res.status(500).json({ error: 'Erro ao deletar arquivo do banco' });
      }
      
      res.json({ 
        message: 'Arquivo deletado com sucesso',
        deleted_file: file.original_name
      });
    });
  });
});

// GET /api/customers/:id/files/categories/summary - Resumo por categoria
router.get('/:id/files/categories/summary', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      category,
      COUNT(*) as count,
      SUM(file_size) as total_size
    FROM customer_files
    WHERE client_id = ?
    GROUP BY category
    ORDER BY count DESC
  `;
  
  req.app.locals.db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar resumo:', err);
      return res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
    
    res.json(rows);
  });
});

module.exports = router;

