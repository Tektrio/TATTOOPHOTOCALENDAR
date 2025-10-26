const express = require('express');
const router = express.Router();

/**
 * Rotas de Notas dos Clientes
 */

// GET /api/customers/:clientId/notes - Listar todas as notas de um cliente
router.get('/:clientId/notes', (req, res) => {
  const { clientId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT * FROM customer_notes
    WHERE client_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  req.app.locals.db.all(query, [clientId, limit, offset], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar notas:', err);
      return res.status(500).json({ error: 'Erro ao buscar notas' });
    }
    
    // Contar total
    req.app.locals.db.get(
      'SELECT COUNT(*) as total FROM customer_notes WHERE client_id = ?',
      [clientId],
      (err, countRow) => {
        if (err) {
          console.error('Erro ao contar notas:', err);
          return res.status(500).json({ error: 'Erro ao contar notas' });
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
      }
    );
  });
});

// POST /api/customers/:clientId/notes - Criar nova nota
router.post('/:clientId/notes', (req, res) => {
  const { clientId } = req.params;
  const { title, content, created_by } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }
  
  const query = `
    INSERT INTO customer_notes (client_id, title, content, created_by)
    VALUES (?, ?, ?, ?)
  `;
  
  req.app.locals.db.run(query, [clientId, title, content, created_by], function(err) {
    if (err) {
      console.error('Erro ao criar nota:', err);
      return res.status(500).json({ error: 'Erro ao criar nota' });
    }
    
    res.status(201).json({
      id: this.lastID,
      message: 'Nota criada com sucesso'
    });
  });
});

// PUT /api/customers/:clientId/notes/:noteId - Atualizar nota
router.put('/:clientId/notes/:noteId', (req, res) => {
  const { clientId, noteId } = req.params;
  const { title, content } = req.body;
  
  const query = `
    UPDATE customer_notes
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND client_id = ?
  `;
  
  req.app.locals.db.run(query, [title, content, noteId, clientId], function(err) {
    if (err) {
      console.error('Erro ao atualizar nota:', err);
      return res.status(500).json({ error: 'Erro ao atualizar nota' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Nota não encontrada' });
    }
    
    res.json({ message: 'Nota atualizada com sucesso' });
  });
});

// DELETE /api/customers/:clientId/notes/:noteId - Deletar nota
router.delete('/:clientId/notes/:noteId', (req, res) => {
  const { clientId, noteId } = req.params;
  
  req.app.locals.db.run(
    'DELETE FROM customer_notes WHERE id = ? AND client_id = ?',
    [noteId, clientId],
    function(err) {
      if (err) {
        console.error('Erro ao deletar nota:', err);
        return res.status(500).json({ error: 'Erro ao deletar nota' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Nota não encontrada' });
      }
      
      res.json({ message: 'Nota deletada com sucesso' });
    }
  );
});

module.exports = router;

