const express = require('express');
const router = express.Router();

/**
 * Rotas de Produtos e Compras de Clientes
 */

// GET /api/products - Listar todos os produtos
router.get('/', (req, res) => {
  const { search, category, is_active = true } = req.query;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY name ASC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
    
    res.json(rows);
  });
});

// POST /api/products - Criar novo produto
router.post('/', (req, res) => {
  const { name, description, category, price, cost, stock_quantity } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }
  
  const query = `
    INSERT INTO products (name, description, category, price, cost, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  req.app.locals.db.run(
    query,
    [name, description, category, price, cost, stock_quantity || 0],
    function(err) {
      if (err) {
        console.error('Erro ao criar produto:', err);
        return res.status(500).json({ error: 'Erro ao criar produto' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Produto criado com sucesso'
      });
    }
  );
});

// GET /api/customers/:clientId/products - Histórico de compras do cliente
router.get('/customers/:clientId/products', (req, res) => {
  const { clientId } = req.params;
  const { start_date, end_date, purchase_location } = req.query;
  
  let query = `
    SELECT 
      cp.*,
      p.name as product_name,
      p.description as product_description,
      p.category as product_category
    FROM customer_products cp
    JOIN products p ON cp.product_id = p.id
    WHERE cp.client_id = ?
  `;
  
  const params = [clientId];
  
  if (start_date) {
    query += ' AND DATE(cp.purchased_at) >= ?';
    params.push(start_date);
  }
  
  if (end_date) {
    query += ' AND DATE(cp.purchased_at) <= ?';
    params.push(end_date);
  }
  
  if (purchase_location) {
    query += ' AND cp.purchase_location = ?';
    params.push(purchase_location);
  }
  
  query += ' ORDER BY cp.purchased_at DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar compras:', err);
      return res.status(500).json({ error: 'Erro ao buscar compras' });
    }
    
    res.json(rows);
  });
});

// POST /api/customers/:clientId/products - Registrar compra de produto
router.post('/customers/:clientId/products', (req, res) => {
  const { clientId } = req.params;
  const {
    product_id,
    appointment_id,
    quantity = 1,
    unit_price,
    purchase_location = 'In House'
  } = req.body;
  
  if (!product_id || !unit_price) {
    return res.status(400).json({
      error: 'Produto e preço são obrigatórios'
    });
  }
  
  const total_price = unit_price * quantity;
  
  const query = `
    INSERT INTO customer_products (
      client_id, product_id, appointment_id, quantity,
      unit_price, total_price, purchase_location
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  req.app.locals.db.run(
    query,
    [clientId, product_id, appointment_id, quantity, unit_price, total_price, purchase_location],
    function(err) {
      if (err) {
        console.error('Erro ao registrar compra:', err);
        return res.status(500).json({ error: 'Erro ao registrar compra' });
      }
      
      // Atualizar estoque se necessário
      req.app.locals.db.run(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [quantity, product_id],
        (err) => {
          if (err) {
            console.error('Erro ao atualizar estoque:', err);
          }
        }
      );
      
      res.status(201).json({
        id: this.lastID,
        message: 'Compra registrada com sucesso'
      });
    }
  );
});

module.exports = router;

