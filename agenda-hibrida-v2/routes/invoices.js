const express = require('express');
const router = express.Router();

/**
 * Rotas de Invoices/Faturas
 */

// Função para gerar número de invoice
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

// GET /api/invoices - Listar todas as invoices
router.get('/', (req, res) => {
  const { client_id, status, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      i.*,
      c.name as client_name,
      c.email as client_email
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (client_id) {
    query += ' AND i.client_id = ?';
    params.push(client_id);
  }
  
  if (status) {
    query += ' AND i.status = ?';
    params.push(status);
  }
  
  if (start_date) {
    query += ' AND DATE(i.created_at) >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    query += ' AND DATE(i.created_at) <= ?';
    params.push(end_date);
  }
  
  query += ' ORDER BY i.created_at DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar invoices:', err);
      return res.status(500).json({ error: 'Erro ao buscar invoices' });
    }
    
    res.json(rows);
  });
});

// GET /api/invoices/:id - Buscar invoice específica
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      i.*,
      c.name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      c.address as client_address
    FROM invoices i
    JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `;
  
  req.app.locals.db.get(query, [id], (err, invoice) => {
    if (err) {
      console.error('Erro ao buscar invoice:', err);
      return res.status(500).json({ error: 'Erro ao buscar invoice' });
    }
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice não encontrada' });
    }
    
    // Buscar itens da invoice
    req.app.locals.db.all(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id],
      (err, items) => {
        if (err) {
          console.error('Erro ao buscar itens:', err);
          invoice.items = [];
        } else {
          invoice.items = items;
        }
        
        res.json(invoice);
      }
    );
  });
});

// POST /api/invoices - Criar nova invoice
router.post('/', (req, res) => {
  const {
    client_id,
    appointment_id,
    items,
    tax = 0,
    discount = 0,
    notes,
    due_date,
    status = 'draft'
  } = req.body;
  
  if (!client_id || !items || items.length === 0) {
    return res.status(400).json({
      error: 'Cliente e itens são obrigatórios'
    });
  }
  
  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const total = subtotal + tax - discount;
  
  const invoice_number = generateInvoiceNumber();
  
  const query = `
    INSERT INTO invoices (
      invoice_number, client_id, appointment_id, subtotal, tax, discount, total,
      status, notes, due_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  req.app.locals.db.run(
    query,
    [invoice_number, client_id, appointment_id, subtotal, tax, discount, total, status, notes, due_date],
    function(err) {
      if (err) {
        console.error('Erro ao criar invoice:', err);
        return res.status(500).json({ error: 'Erro ao criar invoice' });
      }
      
      const invoiceId = this.lastID;
      
      // Inserir itens da invoice
      const itemQuery = `
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, total_price, item_type, item_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      let insertedItems = 0;
      items.forEach(item => {
        const itemTotal = item.unit_price * item.quantity;
        req.app.locals.db.run(
          itemQuery,
          [invoiceId, item.description, item.quantity, item.unit_price, itemTotal, item.item_type, item.item_id],
          (err) => {
            if (err) {
              console.error('Erro ao inserir item:', err);
            }
            
            insertedItems++;
            if (insertedItems === items.length) {
              res.status(201).json({
                id: invoiceId,
                invoice_number,
                message: 'Invoice criada com sucesso'
              });
            }
          }
        );
      });
    }
  );
});

// PUT /api/invoices/:id - Atualizar invoice
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, paid_date, payment_method, notes } = req.body;
  
  const query = `
    UPDATE invoices
    SET status = COALESCE(?, status),
        paid_date = COALESCE(?, paid_date),
        payment_method = COALESCE(?, payment_method),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  req.app.locals.db.run(
    query,
    [status, paid_date, payment_method, notes, id],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar invoice:', err);
        return res.status(500).json({ error: 'Erro ao atualizar invoice' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Invoice não encontrada' });
      }
      
      res.json({ message: 'Invoice atualizada com sucesso' });
    }
  );
});

// DELETE /api/invoices/:id - Deletar invoice (soft delete para void)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.run(
    'UPDATE invoices SET status = "void", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Erro ao deletar invoice:', err);
        return res.status(500).json({ error: 'Erro ao deletar invoice' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Invoice não encontrada' });
      }
      
      res.json({ message: 'Invoice anulada com sucesso' });
    }
  );
});

module.exports = router;

