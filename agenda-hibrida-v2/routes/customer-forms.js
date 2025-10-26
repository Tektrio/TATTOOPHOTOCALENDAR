const express = require('express');
const router = express.Router();

/**
 * Rotas de Formulários dos Clientes
 */

// GET /api/form-templates - Listar templates de formulários
router.get('/form-templates', (req, res) => {
  const { type, is_active = true } = req.query;
  
  let query = 'SELECT * FROM form_templates WHERE 1=1';
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
  
  req.app.locals.db.get('SELECT * FROM form_templates WHERE id = ?', [id], (err, row) => {
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
    INSERT INTO form_templates (name, description, type, fields)
    VALUES (?, ?, ?, ?)
  `;
  
  req.app.locals.db.run(
    query,
    [name, description, type, JSON.stringify(fields)],
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
      ft.name as template_name,
      ft.type as template_type
    FROM customer_forms cf
    LEFT JOIN form_templates ft ON cf.template_id = ft.id
    WHERE cf.client_id = ?
  `;
  
  const params = [id];
  
  if (template_id) {
    query += ' AND cf.template_id = ?';
    params.push(template_id);
  }
  
  if (status) {
    query += ' AND cf.status = ?';
    params.push(status);
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
      responses: f.responses ? JSON.parse(f.responses) : {}
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
      ft.name as template_name,
      ft.type as template_type,
      ft.fields as template_fields
    FROM customer_forms cf
    LEFT JOIN form_templates ft ON cf.template_id = ft.id
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
      responses: row.responses ? JSON.parse(row.responses) : {},
      template_fields: row.template_fields ? JSON.parse(row.template_fields) : []
    };
    
    res.json(form);
  });
});

// POST /api/customers/:id/forms - Preencher novo formulário
router.post('/:id/forms', (req, res) => {
  const { id } = req.params;
  const {
    template_id,
    responses,
    appointment_id,
    status = 'completed'
  } = req.body;
  
  if (!template_id || !responses) {
    return res.status(400).json({
      error: 'Template e respostas são obrigatórios'
    });
  }
  
  const query = `
    INSERT INTO customer_forms (
      client_id, template_id, appointment_id, responses, status, filled_at
    ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  req.app.locals.db.run(
    query,
    [id, template_id, appointment_id, JSON.stringify(responses), status],
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
  const { responses, status } = req.body;
  
  const query = `
    UPDATE customer_forms
    SET responses = COALESCE(?, responses),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND client_id = ?
  `;
  
  req.app.locals.db.run(
    query,
    [responses ? JSON.stringify(responses) : null, status, formId, id],
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

