/**
 * Rotas API para Serviços (Service Types)
 * CRUD completo de tipos de serviços, variações e add-ons
 */

const express = require('express');
const router = express.Router();

// GET /api/services - Listar todos os serviços ativos
router.get('/', (req, res) => {
  const db = req.app.get('db');
  
  try {
    const {
      category,
      type,
      featured,
      active = '1'
    } = req.query;

    let query = `
      SELECT 
        st.*,
        (SELECT COUNT(*) FROM service_variations WHERE service_type_id = st.id) as variations_count,
        (SELECT COUNT(*) FROM service_addon_mappings WHERE service_type_id = st.id) as addons_count
      FROM service_types st
      WHERE 1=1
    `;
    const params = [];

    if (active) {
      query += ` AND st.is_active = ?`;
      params.push(active === '1' ? 1 : 0);
    }

    if (category) {
      query += ` AND st.service_category = ?`;
      params.push(category);
    }

    if (type) {
      query += ` AND st.service_type = ?`;
      params.push(type);
    }

    if (featured) {
      query += ` AND st.is_featured = ?`;
      params.push(featured === '1' ? 1 : 0);
    }

    query += ` ORDER BY st.sort_order ASC, st.service_name ASC`;

    const services = db.prepare(query).all(...params);

    res.json({
      success: true,
      services,
      total: services.length
    });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar serviços',
      error: error.message
    });
  }
});

// GET /api/services/:id - Buscar serviço por ID (com variações e addons)
router.get('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const service = db.prepare('SELECT * FROM service_types WHERE id = ?').get(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    // Buscar variações
    const variations = db.prepare(`
      SELECT * FROM service_variations 
      WHERE service_type_id = ? 
      ORDER BY sort_order ASC, variation_name ASC
    `).all(id);

    // Buscar addons disponíveis
    const addons = db.prepare(`
      SELECT sa.*, sam.is_recommended, sam.is_required
      FROM service_addons sa
      INNER JOIN service_addon_mappings sam ON sa.id = sam.addon_id
      WHERE sam.service_type_id = ? AND sa.is_active = 1
      ORDER BY sa.addon_name ASC
    `).all(id);

    res.json({
      success: true,
      service: {
        ...service,
        variations,
        addons
      }
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar serviço',
      error: error.message
    });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', (req, res) => {
  const db = req.app.get('db');
  
  try {
    const {
      service_name,
      service_category,
      service_type = 'fixed',
      description,
      short_description,
      base_price = 0,
      min_price,
      max_price,
      default_duration = 60,
      min_duration,
      max_duration,
      requires_deposit = false,
      deposit_amount,
      deposit_percentage,
      allows_online_booking = true,
      requires_consultation = false,
      is_active = true,
      is_featured = false,
      sort_order = 0,
      min_advance_booking_hours = 24,
      max_advance_booking_days = 90,
      requires_special_equipment = false,
      equipment_notes,
      image_url,
      color_code = '#4285F4',
      icon,
      tags,
      metadata
    } = req.body;

    // Validações
    if (!service_name) {
      return res.status(400).json({
        success: false,
        message: 'Nome do serviço é obrigatório'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO service_types (
        service_name, service_category, service_type, description, short_description,
        base_price, min_price, max_price, default_duration, min_duration, max_duration,
        requires_deposit, deposit_amount, deposit_percentage, allows_online_booking,
        requires_consultation, is_active, is_featured, sort_order,
        min_advance_booking_hours, max_advance_booking_days, requires_special_equipment,
        equipment_notes, image_url, color_code, icon, tags, metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      service_name, service_category, service_type, description, short_description,
      base_price, min_price, max_price, default_duration, min_duration, max_duration,
      requires_deposit ? 1 : 0, deposit_amount, deposit_percentage, allows_online_booking ? 1 : 0,
      requires_consultation ? 1 : 0, is_active ? 1 : 0, is_featured ? 1 : 0, sort_order,
      min_advance_booking_hours, max_advance_booking_days, requires_special_equipment ? 1 : 0,
      equipment_notes, image_url, color_code, icon, tags, metadata
    );

    const newService = db.prepare('SELECT * FROM service_types WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      service: newService
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar serviço',
      error: error.message
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM service_types WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    const {
      service_name,
      service_category,
      service_type,
      description,
      short_description,
      base_price,
      min_price,
      max_price,
      default_duration,
      min_duration,
      max_duration,
      requires_deposit,
      deposit_amount,
      deposit_percentage,
      allows_online_booking,
      requires_consultation,
      is_active,
      is_featured,
      sort_order,
      min_advance_booking_hours,
      max_advance_booking_days,
      requires_special_equipment,
      equipment_notes,
      image_url,
      color_code,
      icon,
      tags,
      metadata
    } = req.body;

    const stmt = db.prepare(`
      UPDATE service_types SET
        service_name = COALESCE(?, service_name),
        service_category = COALESCE(?, service_category),
        service_type = COALESCE(?, service_type),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        base_price = COALESCE(?, base_price),
        min_price = COALESCE(?, min_price),
        max_price = COALESCE(?, max_price),
        default_duration = COALESCE(?, default_duration),
        min_duration = COALESCE(?, min_duration),
        max_duration = COALESCE(?, max_duration),
        requires_deposit = COALESCE(?, requires_deposit),
        deposit_amount = COALESCE(?, deposit_amount),
        deposit_percentage = COALESCE(?, deposit_percentage),
        allows_online_booking = COALESCE(?, allows_online_booking),
        requires_consultation = COALESCE(?, requires_consultation),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured),
        sort_order = COALESCE(?, sort_order),
        min_advance_booking_hours = COALESCE(?, min_advance_booking_hours),
        max_advance_booking_days = COALESCE(?, max_advance_booking_days),
        requires_special_equipment = COALESCE(?, requires_special_equipment),
        equipment_notes = COALESCE(?, equipment_notes),
        image_url = COALESCE(?, image_url),
        color_code = COALESCE(?, color_code),
        icon = COALESCE(?, icon),
        tags = COALESCE(?, tags),
        metadata = COALESCE(?, metadata),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      service_name, service_category, service_type, description, short_description,
      base_price, min_price, max_price, default_duration, min_duration, max_duration,
      requires_deposit !== undefined ? (requires_deposit ? 1 : 0) : null,
      deposit_amount, deposit_percentage,
      allows_online_booking !== undefined ? (allows_online_booking ? 1 : 0) : null,
      requires_consultation !== undefined ? (requires_consultation ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      sort_order, min_advance_booking_hours, max_advance_booking_days,
      requires_special_equipment !== undefined ? (requires_special_equipment ? 1 : 0) : null,
      equipment_notes, image_url, color_code, icon, tags, metadata,
      id
    );

    const updatedService = db.prepare('SELECT * FROM service_types WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      service: updatedService
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar serviço',
      error: error.message
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM service_types WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    // Verificar se há agendamentos usando este serviço
    const appointmentsCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE service_type_id = ?').get(id);

    if (appointmentsCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar este serviço pois há agendamentos vinculados a ele. Desative-o ao invés de deletá-lo.'
      });
    }

    db.prepare('DELETE FROM service_types WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar serviço',
      error: error.message
    });
  }
});

// GET /api/services/:id/variations - Listar variações de um serviço
router.get('/:id/variations', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  try {
    const variations = db.prepare(`
      SELECT * FROM service_variations 
      WHERE service_type_id = ? 
      ORDER BY sort_order ASC, variation_name ASC
    `).all(id);

    res.json({
      success: true,
      variations
    });
  } catch (error) {
    console.error('Erro ao listar variações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar variações',
      error: error.message
    });
  }
});

// POST /api/services/:id/variations - Criar variação
router.post('/:id/variations', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { variation_name, variation_type, price_modifier = 0, duration_modifier = 0, is_default = false, sort_order = 0 } = req.body;

  try {
    if (!variation_name) {
      return res.status(400).json({
        success: false,
        message: 'Nome da variação é obrigatório'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO service_variations (
        service_type_id, variation_name, variation_type, price_modifier, duration_modifier, is_default, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(id, variation_name, variation_type, price_modifier, duration_modifier, is_default ? 1 : 0, sort_order);

    const newVariation = db.prepare('SELECT * FROM service_variations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Variação criada com sucesso',
      variation: newVariation
    });
  } catch (error) {
    console.error('Erro ao criar variação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar variação',
      error: error.message
    });
  }
});

// GET /api/services/addons - Listar todos os addons
router.get('/addons/all', (req, res) => {
  const db = req.app.get('db');
  
  try {
    const addons = db.prepare('SELECT * FROM service_addons WHERE is_active = 1 ORDER BY addon_name ASC').all();

    res.json({
      success: true,
      addons
    });
  } catch (error) {
    console.error('Erro ao listar addons:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar addons',
      error: error.message
    });
  }
});

// POST /api/services/addons - Criar addon
router.post('/addons/create', (req, res) => {
  const db = req.app.get('db');
  const { addon_name, addon_category, description, price = 0, is_active = true } = req.body;

  try {
    if (!addon_name) {
      return res.status(400).json({
        success: false,
        message: 'Nome do addon é obrigatório'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO service_addons (addon_name, addon_category, description, price, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(addon_name, addon_category, description, price, is_active ? 1 : 0);

    const newAddon = db.prepare('SELECT * FROM service_addons WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Addon criado com sucesso',
      addon: newAddon
    });
  } catch (error) {
    console.error('Erro ao criar addon:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar addon',
      error: error.message
    });
  }
});

module.exports = router;

