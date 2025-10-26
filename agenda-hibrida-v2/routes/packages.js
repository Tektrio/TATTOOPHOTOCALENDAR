const express = require('express');
const router = express.Router();

/**
 * Rotas de Pacotes de Sessões
 */

// GET /api/customers/:id/packages - Listar pacotes do cliente
router.get('/:id/packages', (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  
  let query = `
    SELECT 
      p.*,
      pt.name as package_type_name,
      pt.sessions_count as total_sessions
    FROM client_packages p
    LEFT JOIN package_types pt ON p.package_type_id = pt.id
    WHERE p.client_id = ?
  `;
  
  const params = [id];
  
  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY p.purchase_date DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pacotes:', err);
      return res.status(500).json({ error: 'Erro ao buscar pacotes' });
    }
    
    res.json(rows);
  });
});

// GET /api/packages - Listar todos os pacotes
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.*,
      c.name as client_name,
      pt.name as package_type_name
    FROM client_packages p
    JOIN clients c ON p.client_id = c.id
    LEFT JOIN package_types pt ON p.package_type_id = pt.id
    ORDER BY p.purchase_date DESC
  `;
  
  req.app.locals.db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pacotes:', err);
      return res.status(500).json({ error: 'Erro ao buscar pacotes' });
    }
    
    res.json(rows);
  });
});

// GET /api/package-types - Listar tipos de pacotes disponíveis
router.get('/types', (req, res) => {
  const query = 'SELECT * FROM package_types WHERE active = 1 ORDER BY sessions_count ASC';
  
  req.app.locals.db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar tipos de pacotes:', err);
      return res.status(500).json({ error: 'Erro ao buscar tipos de pacotes' });
    }
    
    res.json(rows);
  });
});

// POST /api/packages - Criar novo pacote
router.post('/', (req, res) => {
  const {
    client_id,
    package_type_id,
    name,
    sessions_count,
    sessions_used = 0,
    price,
    discount = 0,
    final_price,
    valid_until,
    notes
  } = req.body;
  
  if (!client_id || !sessions_count || !price) {
    return res.status(400).json({
      error: 'Cliente, quantidade de sessões e preço são obrigatórios'
    });
  }
  
  const query = `
    INSERT INTO client_packages (
      client_id, package_type_id, name, sessions_count, sessions_used,
      price, discount, final_price, purchase_date, valid_until, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'active', ?)
  `;
  
  const params = [
    client_id,
    package_type_id,
    name,
    sessions_count,
    sessions_used,
    price,
    discount,
    final_price || (price - discount),
    valid_until,
    notes
  ];
  
  req.app.locals.db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao criar pacote:', err);
      return res.status(500).json({ error: 'Erro ao criar pacote' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Pacote criado com sucesso'
    });
  });
});

// POST /api/packages/:id/use - Usar uma sessão do pacote
router.post('/:id/use', (req, res) => {
  const { id } = req.params;
  const { appointment_id, notes } = req.body;
  
  // Verificar se o pacote existe e tem sessões disponíveis
  const checkQuery = `
    SELECT 
      sessions_count,
      sessions_used,
      status,
      valid_until
    FROM client_packages
    WHERE id = ?
  `;
  
  req.app.locals.db.get(checkQuery, [id], (err, pkg) => {
    if (err) {
      console.error('Erro ao buscar pacote:', err);
      return res.status(500).json({ error: 'Erro ao buscar pacote' });
    }
    
    if (!pkg) {
      return res.status(404).json({ error: 'Pacote não encontrado' });
    }
    
    if (pkg.status !== 'active') {
      return res.status(400).json({ error: 'Pacote não está ativo' });
    }
    
    if (pkg.sessions_used >= pkg.sessions_count) {
      return res.status(400).json({ error: 'Todas as sessões já foram usadas' });
    }
    
    // Verificar validade
    if (pkg.valid_until && new Date(pkg.valid_until) < new Date()) {
      return res.status(400).json({ error: 'Pacote expirado' });
    }
    
    // Incrementar sessões usadas
    const newSessionsUsed = pkg.sessions_used + 1;
    const newStatus = newSessionsUsed >= pkg.sessions_count ? 'completed' : 'active';
    
    const updateQuery = `
      UPDATE client_packages
      SET sessions_used = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    req.app.locals.db.run(updateQuery, [newSessionsUsed, newStatus, id], function(err) {
      if (err) {
        console.error('Erro ao usar sessão:', err);
        return res.status(500).json({ error: 'Erro ao usar sessão' });
      }
      
      // Registrar uso no histórico
      const historyQuery = `
        INSERT INTO package_usage_history (
          package_id, appointment_id, used_at, notes
        ) VALUES (?, ?, CURRENT_TIMESTAMP, ?)
      `;
      
      req.app.locals.db.run(historyQuery, [id, appointment_id, notes], (err) => {
        if (err) {
          console.error('Erro ao registrar histórico:', err);
        }
        
        res.json({
          message: 'Sessão usada com sucesso',
          sessions_used: newSessionsUsed,
          sessions_remaining: pkg.sessions_count - newSessionsUsed,
          status: newStatus
        });
      });
    });
  });
});

// GET /api/packages/:id/history - Histórico de uso do pacote
router.get('/:id/history', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      h.*,
      a.title as appointment_title,
      a.start_datetime
    FROM package_usage_history h
    LEFT JOIN appointments a ON h.appointment_id = a.id
    WHERE h.package_id = ?
    ORDER BY h.used_at DESC
  `;
  
  req.app.locals.db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar histórico:', err);
      return res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
    
    res.json(rows);
  });
});

// PUT /api/packages/:id - Atualizar pacote
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, valid_until, notes } = req.body;
  
  const query = `
    UPDATE client_packages
    SET status = COALESCE(?, status),
        valid_until = COALESCE(?, valid_until),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  req.app.locals.db.run(query, [status, valid_until, notes, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar pacote:', err);
      return res.status(500).json({ error: 'Erro ao atualizar pacote' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pacote não encontrado' });
    }
    
    res.json({ message: 'Pacote atualizado com sucesso' });
  });
});

// DELETE /api/packages/:id - Deletar pacote
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.run('DELETE FROM client_packages WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar pacote:', err);
      return res.status(500).json({ error: 'Erro ao deletar pacote' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pacote não encontrado' });
    }
    
    res.json({ message: 'Pacote deletado com sucesso' });
  });
});

module.exports = router;

