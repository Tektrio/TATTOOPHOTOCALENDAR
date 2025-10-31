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
      sp.name as package_type_name,
      sp.total_sessions
    FROM customer_packages p
    LEFT JOIN service_packages sp ON p.package_id = sp.id
    WHERE p.client_id = ?
  `;
  
  const params = [id];
  
  if (status) {
    query += ' AND p.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY p.purchased_at DESC';
  
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
      sp.name as package_type_name
    FROM customer_packages p
    JOIN clients c ON p.client_id = c.id
    LEFT JOIN service_packages sp ON p.package_id = sp.id
    ORDER BY p.purchased_at DESC
  `;
  
  req.app.locals.db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pacotes:', err);
      return res.status(500).json({ error: 'Erro ao buscar pacotes' });
    }
    
    res.json(rows);
  });
});

// GET /api/packages/types - Listar tipos de pacotes disponíveis
router.get('/types', (req, res) => {
  const query = 'SELECT * FROM service_packages WHERE is_active = 1 ORDER BY total_sessions ASC';
  
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
    package_id,
    total_sessions,
    used_sessions = 0,
    purchase_price,
    expires_at
    // notes não utilizado
  } = req.body;
  
  if (!client_id || !package_id || !total_sessions || !purchase_price) {
    return res.status(400).json({
      error: 'Cliente, pacote, quantidade de sessões e preço são obrigatórios'
    });
  }
  
  const remaining_sessions = total_sessions - used_sessions;
  
  const query = `
    INSERT INTO customer_packages (
      client_id, package_id, total_sessions, used_sessions, remaining_sessions,
      purchase_price, purchased_at, expires_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'active')
  `;
  
  const params = [
    client_id,
    package_id,
    total_sessions,
    used_sessions,
    remaining_sessions,
    purchase_price,
    expires_at
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
  const { appointment_id } = req.body; // notes não utilizado
  
  // Verificar se o pacote existe e tem sessões disponíveis
  const checkQuery = `
    SELECT 
      total_sessions,
      used_sessions,
      remaining_sessions,
      status,
      expires_at
    FROM customer_packages
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
    
    if (pkg.remaining_sessions <= 0) {
      return res.status(400).json({ error: 'Todas as sessões já foram usadas' });
    }
    
    // Verificar validade
    if (pkg.expires_at && new Date(pkg.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Pacote expirado' });
    }
    
    // Incrementar sessões usadas
    const newUsedSessions = pkg.used_sessions + 1;
    const newRemainingSessions = pkg.total_sessions - newUsedSessions;
    const newStatus = newRemainingSessions <= 0 ? 'completed' : 'active';
    
    const updateQuery = `
      UPDATE customer_packages
      SET used_sessions = ?,
          remaining_sessions = ?,
          status = ?
      WHERE id = ?
    `;
    
    req.app.locals.db.run(updateQuery, [newUsedSessions, newRemainingSessions, newStatus, id], function(err) {
      if (err) {
        console.error('Erro ao usar sessão:', err);
        return res.status(500).json({ error: 'Erro ao usar sessão' });
      }
      
      // Registrar uso no histórico
      const historyQuery = `
        INSERT INTO package_usage (
          customer_package_id, appointment_id, sessions_used, used_at
        ) VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      `;
      
      req.app.locals.db.run(historyQuery, [id, appointment_id], (err) => {
        if (err) {
          console.error('Erro ao registrar histórico:', err);
        }
        
        res.json({
          message: 'Sessão usada com sucesso',
          used_sessions: newUsedSessions,
          remaining_sessions: newRemainingSessions,
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
    FROM package_usage h
    LEFT JOIN appointments a ON h.appointment_id = a.id
    WHERE h.customer_package_id = ?
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
  const { status, expires_at } = req.body;
  
  const query = `
    UPDATE customer_packages
    SET status = COALESCE(?, status),
        expires_at = COALESCE(?, expires_at)
    WHERE id = ?
  `;
  
  req.app.locals.db.run(query, [status, expires_at, id], function(err) {
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
  
  req.app.locals.db.run('DELETE FROM customer_packages WHERE id = ?', [id], function(err) {
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

