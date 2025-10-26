const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

/**
 * Rotas de Gestão de Clientes
 * Inspirado no Vagaro
 */

// Configuração do multer para upload de avatar
const avatarStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    try {
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const customerId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `customer_${customerId}_${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas'));
    }
  }
});

// GET /api/customers - Listar todos os clientes
router.get('/', (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      c.*,
      cs.total_appointments,
      cs.total_sales,
      cs.no_shows,
      cs.cancellations,
      cs.loyalty_points_balance,
      cs.last_visit_date,
      cs.first_visit_date
    FROM clients c
    LEFT JOIN client_statistics cs ON c.id = cs.client_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (search) {
    query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY c.name ASC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar clientes:', err);
      return res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
    
    // Contar total de clientes
    const countQuery = search 
      ? `SELECT COUNT(*) as total FROM clients WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?`
      : `SELECT COUNT(*) as total FROM clients`;
    
    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    
    req.app.locals.db.get(countQuery, countParams, (err, countRow) => {
      if (err) {
        console.error('Erro ao contar clientes:', err);
        return res.status(500).json({ error: 'Erro ao contar clientes' });
      }
      
      res.json({
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRow.total,
          pages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// GET /api/customers/:id - Buscar cliente específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      c.*,
      cs.total_appointments,
      cs.completed_appointments,
      cs.total_sales,
      cs.no_shows,
      cs.cancellations,
      cs.loyalty_points_balance,
      cs.last_visit_date,
      cs.first_visit_date,
      cs.average_rating
    FROM clients c
    LEFT JOIN client_statistics cs ON c.id = cs.client_id
    WHERE c.id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar cliente:', err);
      return res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Buscar tags do cliente
    const tagsQuery = `
      SELECT t.* FROM tags t
      JOIN client_tags ct ON t.id = ct.tag_id
      WHERE ct.client_id = ?
    `;
    
    req.app.locals.db.all(tagsQuery, [id], (err, tags) => {
      if (err) {
        console.error('Erro ao buscar tags:', err);
        row.tags = [];
      } else {
        row.tags = tags;
      }
      
      res.json(row);
    });
  });
});

// POST /api/customers - Criar novo cliente
router.post('/', (req, res) => {
  const {
    name,
    email,
    phone,
    birth_date,
    gender,
    address,
    city,
    state,
    zip_code,
    notes,
    instagram,
    emergency_contact,
    emergency_phone,
    referred_by
  } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }
  
  const query = `
    INSERT INTO clients (
      name, email, phone, birth_date, gender, address, city, state, zip_code,
      notes, instagram, emergency_contact, emergency_phone, referred_by,
      customer_since
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  const params = [
    name, email, phone, birth_date, gender, address, city, state, zip_code,
    notes, instagram, emergency_contact, emergency_phone, referred_by
  ];
  
  req.app.locals.db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao criar cliente:', err);
      return res.status(500).json({ error: 'Erro ao criar cliente' });
    }
    
    const clientId = this.lastID;
    
    // Criar estatísticas iniciais
    const statsQuery = `
      INSERT INTO client_statistics (
        client_id, first_visit_date
      ) VALUES (?, CURRENT_TIMESTAMP)
    `;
    
    req.app.locals.db.run(statsQuery, [clientId], (err) => {
      if (err) {
        console.error('Erro ao criar estatísticas:', err);
      }
      
      res.status(201).json({
        id: clientId,
        message: 'Cliente criado com sucesso'
      });
    });
  });
});

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    birth_date,
    gender,
    address,
    city,
    state,
    zip_code,
    notes,
    instagram,
    emergency_contact,
    emergency_phone,
    referred_by,
    avatar_url
  } = req.body;
  
  const query = `
    UPDATE clients SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      birth_date = COALESCE(?, birth_date),
      gender = COALESCE(?, gender),
      address = COALESCE(?, address),
      city = COALESCE(?, city),
      state = COALESCE(?, state),
      zip_code = COALESCE(?, zip_code),
      notes = COALESCE(?, notes),
      instagram = COALESCE(?, instagram),
      emergency_contact = COALESCE(?, emergency_contact),
      emergency_phone = COALESCE(?, emergency_phone),
      referred_by = COALESCE(?, referred_by),
      avatar_url = COALESCE(?, avatar_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const params = [
    name, email, phone, birth_date, gender, address, city, state, zip_code,
    notes, instagram, emergency_contact, emergency_phone, referred_by, avatar_url, id
  ];
  
  req.app.locals.db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao atualizar cliente:', err);
      return res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente atualizado com sucesso' });
  });
});

// DELETE /api/customers/:id - Deletar cliente
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar cliente:', err);
      return res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente deletado com sucesso' });
  });
});

// GET /api/customers/:id/statistics - Estatísticas detalhadas do cliente
router.get('/:id/statistics', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT * FROM client_statistics WHERE client_id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar estatísticas:', err);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
    
    res.json(row || {
      client_id: id,
      total_appointments: 0,
      completed_appointments: 0,
      no_shows: 0,
      cancellations: 0,
      total_sales: 0,
      loyalty_points_balance: 0
    });
  });
});

// PUT /api/customers/:id/statistics/refresh - Recalcular estatísticas
router.put('/:id/statistics/refresh', (req, res) => {
  const { id } = req.params;
  
  // Recalcular estatísticas a partir dos appointments
  const statsQuery = `
    SELECT 
      COUNT(*) as total_appointments,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
      SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancellations,
      SUM(COALESCE(actual_price, estimated_price, 0)) as total_sales,
      MAX(start_datetime) as last_visit_date,
      MIN(start_datetime) as first_visit_date
    FROM appointments
    WHERE client_id = ?
  `;
  
  req.app.locals.db.get(statsQuery, [id], (err, stats) => {
    if (err) {
      console.error('Erro ao calcular estatísticas:', err);
      return res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
    
    // Calcular pontos de fidelidade
    const pointsQuery = `
      SELECT SUM(points) as total_points
      FROM loyalty_points
      WHERE client_id = ?
    `;
    
    req.app.locals.db.get(pointsQuery, [id], (err, pointsRow) => {
      if (err) {
        console.error('Erro ao calcular pontos:', err);
      }
      
      const loyaltyPoints = pointsRow?.total_points || 0;
      
      // Atualizar ou inserir estatísticas
      const upsertQuery = `
        INSERT INTO client_statistics (
          client_id, total_appointments, completed_appointments, no_shows,
          cancellations, total_sales, loyalty_points_balance, last_visit_date,
          first_visit_date, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(client_id) DO UPDATE SET
          total_appointments = excluded.total_appointments,
          completed_appointments = excluded.completed_appointments,
          no_shows = excluded.no_shows,
          cancellations = excluded.cancellations,
          total_sales = excluded.total_sales,
          loyalty_points_balance = excluded.loyalty_points_balance,
          last_visit_date = excluded.last_visit_date,
          first_visit_date = excluded.first_visit_date,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const params = [
        id,
        stats.total_appointments || 0,
        stats.completed_appointments || 0,
        stats.no_shows || 0,
        stats.cancellations || 0,
        stats.total_sales || 0,
        loyaltyPoints,
        stats.last_visit_date,
        stats.first_visit_date
      ];
      
      req.app.locals.db.run(upsertQuery, params, function(err) {
        if (err) {
          console.error('Erro ao atualizar estatísticas:', err);
          return res.status(500).json({ error: 'Erro ao atualizar estatísticas' });
        }
        
        res.json({
          message: 'Estatísticas atualizadas com sucesso',
          statistics: {
            ...stats,
            loyalty_points_balance: loyaltyPoints
          }
        });
      });
    });
  });
});

// POST /api/customers/:id/avatar - Upload de avatar do cliente
router.post('/:id/avatar', avatarUpload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  
  try {
    // Verificar se o cliente existe
    req.app.locals.db.get('SELECT id, avatar_url FROM clients WHERE id = ?', [id], async (err, client) => {
      if (err) {
        console.error('Erro ao verificar cliente:', err);
        // Remover arquivo enviado
        await fs.remove(req.file.path);
        return res.status(500).json({ error: 'Erro ao verificar cliente' });
      }
      
      if (!client) {
        // Remover arquivo enviado
        await fs.remove(req.file.path);
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      
      // Remover avatar antigo se existir
      if (client.avatar_url) {
        const oldAvatarPath = path.join(__dirname, '..', client.avatar_url.replace(/^\//, ''));
        try {
          if (await fs.pathExists(oldAvatarPath)) {
            await fs.remove(oldAvatarPath);
          }
        } catch (err) {
          console.error('Erro ao remover avatar antigo:', err);
        }
      }
      
      // Gerar URL relativa do avatar
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // Atualizar URL do avatar no banco
      const updateQuery = 'UPDATE clients SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      req.app.locals.db.run(updateQuery, [avatarUrl, id], function(err) {
        if (err) {
          console.error('Erro ao atualizar avatar:', err);
          return res.status(500).json({ error: 'Erro ao atualizar avatar' });
        }
        
        res.json({
          message: 'Avatar atualizado com sucesso',
          avatar_url: avatarUrl,
          filename: req.file.filename
        });
      });
    });
  } catch (error) {
    console.error('Erro no upload do avatar:', error);
    if (req.file) {
      await fs.remove(req.file.path);
    }
    res.status(500).json({ error: 'Erro no upload do avatar' });
  }
});

module.exports = router;

