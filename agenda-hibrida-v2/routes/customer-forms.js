const express = require('express');
const router = express.Router();

/**
 * Rotas de Formulários dos Clientes
 */

// GET /api/form-templates - Listar templates de formulários
router.get('/form-templates', (req, res) => {
  const { type, is_active = true } = req.query;
  
  let query = 'SELECT * FROM custom_forms WHERE 1=1';
  const params = [];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  if (is_active !== undefined) {
    query += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY name ASC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar templates:', err);
      return res.status(500).json({ error: 'Erro ao buscar templates' });
    }
    
    // Parse do JSON para cada template
    const templates = rows.map(t => ({
      ...t,
      fields: t.fields ? JSON.parse(t.fields) : []
    }));
    
    res.json(templates);
  });
});

// GET /api/form-templates/:id - Buscar template específico
router.get('/form-templates/:id', (req, res) => {
  const { id } = req.params;
  
  req.app.locals.db.get('SELECT * FROM custom_forms WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar template:', err);
      return res.status(500).json({ error: 'Erro ao buscar template' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Template não encontrado' });
    }
    
    const template = {
      ...row,
      fields: row.fields ? JSON.parse(row.fields) : []
    };
    
    res.json(template);
  });
});

// POST /api/form-templates - Criar novo template
router.post('/form-templates', (req, res) => {
  const { name, description, type, fields } = req.body;
  
  if (!name || !fields) {
    return res.status(400).json({ error: 'Nome e campos são obrigatórios' });
  }
  
  const query = `
    INSERT INTO custom_forms (name, description, fields)
    VALUES (?, ?, ?)
  `;
  
  req.app.locals.db.run(
    query,
    [name, description, JSON.stringify(fields)],
    function(err) {
      if (err) {
        console.error('Erro ao criar template:', err);
        return res.status(500).json({ error: 'Erro ao criar template' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Template criado com sucesso'
      });
    }
  );
});

// GET /api/customers/:id/forms - Listar formulários do cliente
router.get('/:id/forms', (req, res) => {
  const { id } = req.params;
  const { template_id, status } = req.query;
  
  let query = `
    SELECT 
      cf.*,
      cust_f.name as template_name
    FROM customer_forms cf
    LEFT JOIN custom_forms cust_f ON cf.form_id = cust_f.id
    WHERE cf.client_id = ?
  `;
  
  const params = [id];
  
  if (template_id) {
    query += ' AND cf.form_id = ?';
    params.push(template_id);
  }
  
  query += ' ORDER BY cf.filled_at DESC';
  
  req.app.locals.db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erro ao buscar formulários:', err);
      return res.status(500).json({ error: 'Erro ao buscar formulários' });
    }
    
    // Parse do JSON para cada formulário
    const forms = rows.map(f => ({
      ...f,
      form_data: f.form_data ? JSON.parse(f.form_data) : {}
    }));
    
    res.json(forms);
  });
});

// GET /api/customers/:id/forms/:formId - Buscar formulário específico
router.get('/:id/forms/:formId', (req, res) => {
  const { id, formId } = req.params;
  
  const query = `
    SELECT 
      cf.*,
      cust_f.name as template_name,
      cust_f.type as template_type,
      cust_f.fields as template_fields
    FROM customer_forms cf
    LEFT JOIN custom_forms cust_f ON cf.form_id = cust_f.id
    WHERE cf.id = ? AND cf.client_id = ?
  `;
  
  req.app.locals.db.get(query, [formId, id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar formulário:', err);
      return res.status(500).json({ error: 'Erro ao buscar formulário' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }
    
    const form = {
      ...row,
      form_data: row.form_data ? JSON.parse(row.form_data) : {},
      template_fields: row.template_fields ? JSON.parse(row.template_fields) : []
    };
    
    res.json(form);
  });
});

// POST /api/customers/:id/forms - Preencher novo formulário
router.post('/:id/forms', (req, res) => {
  const { id } = req.params;
  const {
    form_id,
    form_data,
    appointment_id
  } = req.body;
  
  if (!form_id || !form_data) {
    return res.status(400).json({
      error: 'Formulário e dados são obrigatórios'
    });
  }
  
  const query = `
    INSERT INTO customer_forms (
      client_id, form_id, appointment_id, form_data, filled_at
    ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  req.app.locals.db.run(
    query,
    [id, form_id, appointment_id, JSON.stringify(form_data)],
    function(err) {
      if (err) {
        console.error('Erro ao salvar formulário:', err);
        return res.status(500).json({ error: 'Erro ao salvar formulário' });
      }
      
      res.status(201).json({
        id: this.lastID,
        message: 'Formulário salvo com sucesso'
      });
    }
  );
});

// PUT /api/customers/:id/forms/:formId - Atualizar formulário
router.put('/:id/forms/:formId', (req, res) => {
  const { id, formId } = req.params;
  const { form_data } = req.body;
  
  const query = `
    UPDATE customer_forms
    SET form_data = COALESCE(?, form_data),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND client_id = ?
  `;
  
  req.app.locals.db.run(
    query,
    [form_data ? JSON.stringify(form_data) : null, formId, id],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar formulário:', err);
        return res.status(500).json({ error: 'Erro ao atualizar formulário' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      res.json({ message: 'Formulário atualizado com sucesso' });
    }
  );
});

// DELETE /api/customers/:id/forms/:formId - Deletar formulário
router.delete('/:id/forms/:formId', (req, res) => {
  const { id, formId } = req.params;
  
  req.app.locals.db.run(
    'DELETE FROM customer_forms WHERE id = ? AND client_id = ?',
    [formId, id],
    function(err) {
      if (err) {
        console.error('Erro ao deletar formulário:', err);
        return res.status(500).json({ error: 'Erro ao deletar formulário' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      res.json({ message: 'Formulário deletado com sucesso' });
    }
  );
});

module.exports = router;

