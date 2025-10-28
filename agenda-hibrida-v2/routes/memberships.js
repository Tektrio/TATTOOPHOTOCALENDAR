const express = require('express');
const router = express.Router();

/**
 * Rotas de Memberships (Assinaturas/Planos)
 */

// GET /api/customers/:id/memberships - Listar memberships do cliente
router.get('/:id/memberships', (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  
  let query = `
    SELECT 
      cm.*,
      mp.name as plan_name,
      mp.price as plan_monthly_fee,
      mp.benefits as plan_benefits
    FROM customer_memberships cm
    LEFT JOIN membership_plans mp ON cm.membership_plan_id = mp.id
    WHERE cm.client_id = ?
  `;
  
  const params = [id];
  
  if (status) {
    query += ' AND cm.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY cm.start_date DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar memberships:', err);
      return res.status(500).json({ error: 'Erro ao buscar memberships' });
    }
    
    // Mapear campos do backend para nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      ...row,
      monthly_fee: row.plan_monthly_fee
    }));
    
    res.json(mappedRows);
  });
});

// GET /api/memberships - Listar todos os memberships
router.get('/', (req, res) => {
  const { status, plan_id } = req.query;
  
  let query = `
    SELECT 
      cm.*,
      c.name as client_name,
      c.email as client_email,
      mp.name as plan_name,
      mp.price as plan_monthly_fee
    FROM customer_memberships cm
    JOIN clients c ON cm.client_id = c.id
    LEFT JOIN membership_plans mp ON cm.membership_plan_id = mp.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND cm.status = ?';
    params.push(status);
  }
  
  if (plan_id) {
    query += ' AND cm.membership_plan_id = ?';
    params.push(plan_id);
  }
  
  query += ' ORDER BY cm.start_date DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar memberships:', err);
      return res.status(500).json({ error: 'Erro ao buscar memberships' });
    }
    
    // Mapear campos do backend para nomes esperados pelo frontend
    const mappedRows = rows.map(row => ({
      ...row,
      monthly_fee: row.plan_monthly_fee
    }));
    
    res.json(mappedRows);
  });
});

// GET /api/memberships/:id - Buscar membership específico
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      cm.*,
      c.name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      mp.name as plan_name,
      mp.price as plan_monthly_fee,
      mp.benefits as plan_benefits,
      mp.description as plan_description
    FROM customer_memberships cm
    JOIN clients c ON cm.client_id = c.id
    LEFT JOIN membership_plans mp ON cm.membership_plan_id = mp.id
    WHERE cm.id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar membership:', err);
      return res.status(500).json({ error: 'Erro ao buscar membership' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    // Buscar histórico de pagamentos
    const paymentsQuery = `
      SELECT * FROM membership_payments
      WHERE customer_membership_id = ?
      ORDER BY payment_date DESC
    `;
    
    req.app.locals.db.all(paymentsQuery, [id], (err, payments) => {
      if (err) {
        console.error('Erro ao buscar pagamentos:', err);
        row.payments = [];
      } else {
        row.payments = payments;
      }
      
      // Mapear campos do backend para nomes esperados pelo frontend
      const response = {
        ...row,
        monthly_fee: row.plan_monthly_fee
      };
      
      res.json(response);
    });
  });
});

// GET /api/membership-plans - Listar planos disponíveis
router.get('/plans', (req, res) => {
  const { is_active = true } = req.query;
  
  let query = 'SELECT * FROM membership_plans WHERE 1=1';
  const params = [];
  
  if (is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY monthly_fee ASC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar planos:', err);
      return res.status(500).json({ error: 'Erro ao buscar planos' });
    }
    
    res.json(rows);
  });
});

// POST /api/memberships - Criar novo membership
router.post('/', (req, res) => {
  const {
    client_id,
    membership_plan_id,
    monthly_price,
    end_date,
    next_billing_date
  } = req.body;
  
  if (!client_id || !membership_plan_id || !monthly_price) {
    return res.status(400).json({
      error: 'Cliente, plano e preço mensal são obrigatórios'
    });
  }
  
  const query = `
    INSERT INTO customer_memberships (
      client_id, membership_plan_id, start_date, end_date, 
      next_billing_date, monthly_price, status
    ) VALUES (?, ?, CURRENT_DATE, ?, ?, ?, 'active')
  `;
  
  const params = [
    client_id,
    membership_plan_id,
    end_date,
    next_billing_date,
    monthly_price
  ];
  
  req.app.locals.db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao criar membership:', err);
      return res.status(500).json({ error: 'Erro ao criar membership' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Membership criado com sucesso'
    });
  });
});

// POST /api/memberships/:id/payment - Registrar pagamento de membership
router.post('/:id/payment', (req, res) => {
  const { id } = req.params;
  const { amount, payment_method, notes } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valor do pagamento deve ser maior que zero' });
  }
  
  // Verificar se o membership existe
  const checkQuery = 'SELECT * FROM customer_memberships WHERE id = ?';
  
  req.app.locals.db.get(checkQuery, [id], (err, membership) => {
    if (err) {
      console.error('Erro ao buscar membership:', err);
      return res.status(500).json({ error: 'Erro ao buscar membership' });
    }
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    // Registrar pagamento
    const paymentQuery = `
      INSERT INTO membership_payments (
        customer_membership_id, amount, payment_method, payment_date
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    req.app.locals.db.run(paymentQuery, [id, amount, payment_method], function(err) {
      if (err) {
        console.error('Erro ao registrar pagamento:', err);
        return res.status(500).json({ error: 'Erro ao registrar pagamento' });
      }
      
      res.json({
        id: this.lastID,
        message: 'Pagamento registrado com sucesso'
      });
    });
  });
});

// PUT /api/memberships/:id - Atualizar membership
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, end_date, monthly_price, next_billing_date } = req.body;
  
  const query = `
    UPDATE customer_memberships
    SET status = COALESCE(?, status),
        end_date = COALESCE(?, end_date),
        monthly_price = COALESCE(?, monthly_price),
        next_billing_date = COALESCE(?, next_billing_date)
    WHERE id = ?
  `;
  
  req.app.locals.db.run(query, [status, end_date, monthly_price, next_billing_date, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar membership:', err);
      return res.status(500).json({ error: 'Erro ao atualizar membership' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    res.json({ message: 'Membership atualizado com sucesso' });
  });
});

// POST /api/memberships/:id/cancel - Cancelar membership
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  
  const query = `
    UPDATE customer_memberships
    SET status = 'cancelled',
        cancellation_date = CURRENT_TIMESTAMP,
        cancellation_reason = ?
    WHERE id = ?
  `;
  
  req.app.locals.db.run(query, [cancellation_reason, id], function(err) {
    if (err) {
      console.error('Erro ao cancelar membership:', err);
      return res.status(500).json({ error: 'Erro ao cancelar membership' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    res.json({ message: 'Membership cancelado com sucesso' });
  });
});

// POST /api/memberships/:id/renew - Renovar membership
router.post('/:id/renew', (req, res) => {
  const { id } = req.params;
  const { months = 1 } = req.body;
  
  const query = `
    SELECT end_date FROM customer_memberships WHERE id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, membership) => {
    if (err) {
      console.error('Erro ao buscar membership:', err);
      return res.status(500).json({ error: 'Erro ao buscar membership' });
    }
    
    if (!membership) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    // Calcular nova data de término
    const currentEndDate = membership.end_date ? new Date(membership.end_date) : new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    
    const updateQuery = `
      UPDATE customer_memberships
      SET end_date = ?,
          status = 'active'
      WHERE id = ?
    `;
    
    req.app.locals.db.run(updateQuery, [newEndDate.toISOString(), id], function(err) {
      if (err) {
        console.error('Erro ao renovar membership:', err);
        return res.status(500).json({ error: 'Erro ao renovar membership' });
      }
      
      res.json({ 
        message: 'Membership renovado com sucesso',
        new_end_date: newEndDate
      });
    });
  });
});

// DELETE /api/memberships/:id - Deletar membership
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.run('DELETE FROM customer_memberships WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar membership:', err);
      return res.status(500).json({ error: 'Erro ao deletar membership' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Membership não encontrado' });
    }
    
    res.json({ message: 'Membership deletado com sucesso' });
  });
});

module.exports = router;

