const express = require('express');
const router = express.Router();

/**
 * Rotas de Gift Cards (Cartões Presente)
 */

// Função para gerar código único de gift card
function generateGiftCardCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GC-';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) code += '-';
  }
  return code;
}

// GET /api/customers/:id/gift-cards - Listar gift cards do cliente
router.get('/:id/gift-cards', (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  
  let query = `
    SELECT 
      gc.*,
      c.name as client_name,
      c.email as client_email
    FROM gift_cards gc
    JOIN clients c ON gc.client_id = c.id
    WHERE gc.client_id = ?
  `;
  
  const params = [id];
  
  if (status) {
    query += ' AND gc.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY gc.purchased_at DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar gift cards:', err);
      return res.status(500).json({ error: 'Erro ao buscar gift cards' });
    }
    
    // Mapear campos do backend para nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      ...row,
      issued_date: row.purchased_at,
      expiry_date: row.expires_at
    }));
    
    res.json(mappedRows);
  });
});

// GET /api/gift-cards - Listar todos os gift cards
router.get('/', (req, res) => {
  const { status, search } = req.query;
  
  let query = `
    SELECT 
      gc.*,
      c.name as client_name,
      c.email as client_email
    FROM gift_cards gc
    JOIN clients c ON gc.client_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND gc.status = ?';
    params.push(status);
  }
  
  if (search) {
    query += ' AND (gc.code LIKE ? OR c.name LIKE ? OR c.email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ' ORDER BY gc.purchased_at DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar gift cards:', err);
      return res.status(500).json({ error: 'Erro ao buscar gift cards' });
    }
    
    // Mapear campos do backend para nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      ...row,
      issued_date: row.purchased_at,
      expiry_date: row.expires_at
    }));
    
    res.json(mappedRows);
  });
});

// GET /api/gift-cards/code/:code - Buscar gift card por código (DEVE VIR ANTES DE /:id)
router.get('/code/:code', (req, res) => {
  const { code } = req.params;
  
  const query = `
    SELECT 
      gc.*,
      c.name as client_name,
      c.email as client_email
    FROM gift_cards gc
    JOIN clients c ON gc.client_id = c.id
    WHERE gc.code = ?
  `;
  
  req.app.locals.db.get(query, [code], (err, row) => {
    if (err) {
      console.error('Erro ao buscar gift card:', err);
      return res.status(500).json({ error: 'Erro ao buscar gift card' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Gift card não encontrado' });
    }
    
    // Mapear campos do backend para nomes esperados pelo frontend
    const response = {
      ...row,
      issued_date: row.purchased_at,
      expiry_date: row.expires_at
    };
    
    res.json(response);
  });
});

// GET /api/gift-cards/:id - Buscar gift card específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      gc.*,
      c.name as client_name,
      c.email as client_email,
      c.phone as client_phone
    FROM gift_cards gc
    JOIN clients c ON gc.client_id = c.id
    WHERE gc.id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar gift card:', err);
      return res.status(500).json({ error: 'Erro ao buscar gift card' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Gift card não encontrado' });
    }
    
    // Buscar histórico de uso
    const usageQuery = `
      SELECT * FROM gift_card_usage
      WHERE gift_card_id = ?
      ORDER BY used_at DESC
    `;
    
    req.app.locals.db.all(usageQuery, [id], (err, usage) => {
      if (err) {
        console.error('Erro ao buscar histórico:', err);
        row.usage_history = [];
      } else {
        row.usage_history = usage;
      }
      
      // Mapear campos do backend para nomes esperados pelo frontend
      const response = {
        ...row,
        issued_date: row.purchased_at,
        expiry_date: row.expires_at
      };
      
      res.json(response);
    });
  });
});

// POST /api/gift-cards - Criar novo gift card
router.post('/', (req, res) => {
  const {
    client_id,
    initial_value,
    expiry_date,
    notes
  } = req.body;
  
  if (!client_id || !initial_value) {
    return res.status(400).json({
      error: 'Cliente e valor inicial são obrigatórios'
    });
  }
  
  // Gerar código único
  const code = generateGiftCardCode();
  
  const query = `
    INSERT INTO gift_cards (
      client_id, code, initial_value, current_balance, 
      purchased_at, expires_at, status
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'active')
  `;
  
  const params = [
    client_id,
    code,
    initial_value,
    initial_value, // current_balance começa igual ao initial_value
    expiry_date
  ];
  
  req.app.locals.db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao criar gift card:', err);
      return res.status(500).json({ error: 'Erro ao criar gift card' });
    }
    
    res.status(201).json({
      id: this.lastID,
      code: code,
      message: 'Gift card criado com sucesso'
    });
  });
});

// POST /api/gift-cards/:id/use - Usar valor do gift card
router.post('/:id/use', (req, res) => {
  const { id } = req.params;
  const { amount, appointment_id, notes } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valor a usar deve ser maior que zero' });
  }
  
  // Verificar se o gift card existe e tem saldo
  const checkQuery = `
    SELECT 
      current_balance,
      status,
      expiry_date
    FROM gift_cards
    WHERE id = ?
  `;
  
  req.app.locals.db.get(checkQuery, [id], (err, gc) => {
    if (err) {
      console.error('Erro ao buscar gift card:', err);
      return res.status(500).json({ error: 'Erro ao buscar gift card' });
    }
    
    if (!gc) {
      return res.status(404).json({ error: 'Gift card não encontrado' });
    }
    
    if (gc.status !== 'active') {
      return res.status(400).json({ error: 'Gift card não está ativo' });
    }
    
    if (gc.current_balance < amount) {
      return res.status(400).json({ 
        error: 'Saldo insuficiente',
        current_balance: gc.current_balance
      });
    }
    
    // Verificar validade
    if (gc.expires_at && new Date(gc.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Gift card expirado' });
    }
    
    const newBalance = gc.current_balance - amount;
    const newStatus = newBalance <= 0 ? 'used' : 'active';
    
    // Atualizar saldo
    const updateQuery = `
      UPDATE gift_cards
      SET current_balance = ?,
          status = ?
      WHERE id = ?
    `;
    
    req.app.locals.db.run(updateQuery, [newBalance, newStatus, id], function(err) {
      if (err) {
        console.error('Erro ao atualizar gift card:', err);
        return res.status(500).json({ error: 'Erro ao atualizar gift card' });
      }
      
      // Registrar uso no histórico
      const historyQuery = `
        INSERT INTO gift_card_usage (
          gift_card_id, amount_used, appointment_id, notes, used_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      req.app.locals.db.run(historyQuery, [id, amount, appointment_id, notes], (err) => {
        if (err) {
          console.error('Erro ao registrar histórico:', err);
        }
        
        res.json({
          message: 'Valor usado com sucesso',
          previous_balance: gc.current_balance,
          amount_used: amount,
          new_balance: newBalance,
          status: newStatus
        });
      });
    });
  });
});

// PUT /api/gift-cards/:id - Atualizar gift card
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, expires_at } = req.body;
  
  const query = `
    UPDATE gift_cards
    SET status = COALESCE(?, status),
        expires_at = COALESCE(?, expires_at)
    WHERE id = ?
  `;
  
  req.app.locals.db.run(query, [status, expires_at, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar gift card:', err);
      return res.status(500).json({ error: 'Erro ao atualizar gift card' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gift card não encontrado' });
    }
    
    res.json({ message: 'Gift card atualizado com sucesso' });
  });
});

// DELETE /api/gift-cards/:id - Deletar gift card
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.run('DELETE FROM gift_cards WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar gift card:', err);
      return res.status(500).json({ error: 'Erro ao deletar gift card' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Gift card não encontrado' });
    }
    
    res.json({ message: 'Gift card deletado com sucesso' });
  });
});

module.exports = router;

