/**
 * Employees Routes
 * CRUD completo para gerenciamento de funcionários/artistas
 */

const express = require('express');
const router = express.Router();

// GET /api/employees - Listar todos os funcionários
router.get('/employees', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { status, role, limit = 100, offset = 0 } = req.query;

    let sql = `
      SELECT 
        e.*,
        COUNT(DISTINCT a.id) as appointments_count,
        COALESCE(SUM(ft.amount), 0) as total_revenue
      FROM employees e
      LEFT JOIN appointments a ON e.id = a.employee_id AND a.status = 'completed'
      LEFT JOIN financial_transactions ft ON e.id = ft.employee_id AND ft.type = 'income' AND ft.status = 'completed'
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (role) {
      sql += ' AND e.role = ?';
      params.push(role);
    }

    sql += ' GROUP BY e.id ORDER BY e.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const employees = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Calcular estatísticas gerais
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
          AVG(rating) as avg_rating
        FROM employees
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({ 
      success: true, 
      data: employees,
      stats: stats || { total: 0, active: 0, inactive: 0, avg_rating: 0 }
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/:id - Buscar funcionário por ID
router.get('/employees/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const employeeId = req.params.id;

    const employee = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM employees WHERE id = ?
      `, [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        error: 'Funcionário não encontrado' 
      });
    }

    // Buscar estatísticas do funcionário
    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(DISTINCT a.id) as total_appointments,
          COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
          COALESCE(SUM(ft.amount), 0) as total_revenue
        FROM employees e
        LEFT JOIN appointments a ON e.id = a.employee_id
        LEFT JOIN financial_transactions ft ON e.id = ft.employee_id AND ft.type = 'income' AND ft.status = 'completed'
        WHERE e.id = ?
      `, [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Buscar horários de trabalho
    const schedules = await new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM employee_schedules 
        WHERE employee_id = ? AND is_active = 1
        ORDER BY day_of_week
      `, [employeeId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({ 
      success: true, 
      data: {
        ...employee,
        stats: stats || { total_appointments: 0, completed_appointments: 0, total_revenue: 0 },
        schedules
      }
    });

  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/employees - Criar novo funcionário
router.post('/employees', async (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      name,
      email,
      phone,
      role,
      specialty,
      hourly_rate = 0,
      commission_rate = 0,
      status = 'active',
      hire_date,
      birth_date,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
      emergency_phone,
      avatar_url,
      bio,
      instagram,
      portfolio_url,
      notes
    } = req.body;

    // Validações
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome é obrigatório' 
      });
    }

    // Verificar email duplicado
    if (email) {
      const existingEmployee = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE email = ?', [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingEmployee) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email já cadastrado' 
        });
      }
    }

    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO employees (
          name, email, phone, role, specialty,
          hourly_rate, commission_rate, status, hire_date, birth_date,
          address, city, state, postal_code,
          emergency_contact, emergency_phone, avatar_url, bio,
          instagram, portfolio_url, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, email, phone, role, specialty,
        hourly_rate, commission_rate, status, hire_date, birth_date,
        address, city, state, postal_code,
        emergency_contact, emergency_phone, avatar_url, bio,
        instagram, portfolio_url, notes
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });

    res.status(201).json({ 
      success: true, 
      data: result,
      message: 'Funcionário criado com sucesso' 
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/employees/:id - Atualizar funcionário
router.put('/employees/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const employeeId = req.params.id;
    const {
      name,
      email,
      phone,
      role,
      specialty,
      hourly_rate,
      commission_rate,
      status,
      hire_date,
      birth_date,
      address,
      city,
      state,
      postal_code,
      emergency_contact,
      emergency_phone,
      avatar_url,
      bio,
      instagram,
      portfolio_url,
      rating,
      total_appointments,
      total_revenue,
      notes
    } = req.body;

    // Verificar se funcionário existe
    const existingEmployee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE id = ?', [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false, 
        error: 'Funcionário não encontrado' 
      });
    }

    // Verificar email duplicado (exceto o próprio)
    if (email) {
      const duplicateEmail = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE email = ? AND id != ?', [email, employeeId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (duplicateEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email já cadastrado para outro funcionário' 
        });
      }
    }

    // Construir SQL de atualização dinamicamente
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (specialty !== undefined) { updates.push('specialty = ?'); params.push(specialty); }
    if (hourly_rate !== undefined) { updates.push('hourly_rate = ?'); params.push(hourly_rate); }
    if (commission_rate !== undefined) { updates.push('commission_rate = ?'); params.push(commission_rate); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (hire_date !== undefined) { updates.push('hire_date = ?'); params.push(hire_date); }
    if (birth_date !== undefined) { updates.push('birth_date = ?'); params.push(birth_date); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city); }
    if (state !== undefined) { updates.push('state = ?'); params.push(state); }
    if (postal_code !== undefined) { updates.push('postal_code = ?'); params.push(postal_code); }
    if (emergency_contact !== undefined) { updates.push('emergency_contact = ?'); params.push(emergency_contact); }
    if (emergency_phone !== undefined) { updates.push('emergency_phone = ?'); params.push(emergency_phone); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
    if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
    if (instagram !== undefined) { updates.push('instagram = ?'); params.push(instagram); }
    if (portfolio_url !== undefined) { updates.push('portfolio_url = ?'); params.push(portfolio_url); }
    if (rating !== undefined) { updates.push('rating = ?'); params.push(rating); }
    if (total_appointments !== undefined) { updates.push('total_appointments = ?'); params.push(total_appointments); }
    if (total_revenue !== undefined) { updates.push('total_revenue = ?'); params.push(total_revenue); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(employeeId);

    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE employees 
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      success: true, 
      message: 'Funcionário atualizado com sucesso' 
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/employees/:id - Deletar funcionário
router.delete('/employees/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    const employeeId = req.params.id;

    // Verificar se funcionário existe
    const existingEmployee = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM employees WHERE id = ?', [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false, 
        error: 'Funcionário não encontrado' 
      });
    }

    // Verificar se tem agendamentos vinculados
    const hasAppointments = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM appointments WHERE employee_id = ?', [employeeId], (err, row) => {
        if (err) reject(err);
        else resolve(row && row.count > 0);
      });
    });

    if (hasAppointments) {
      // Soft delete: apenas inativar
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE employees 
          SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [employeeId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return res.json({ 
        success: true, 
        message: 'Funcionário inativado (tem agendamentos vinculados)' 
      });
    }

    // Hard delete: deletar permanentemente
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE id = ?', [employeeId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      success: true, 
      message: 'Funcionário deletado com sucesso' 
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/employees/stats - Estatísticas gerais
router.get('/employees-stats', async (req, res) => {
  try {
    const db = req.app.get('db');

    const stats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_employees,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_employees,
          AVG(rating) as average_rating,
          COALESCE(SUM(total_revenue), 0) as total_revenue_all
        FROM employees
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row || { total_employees: 0, active_employees: 0, average_rating: 0, total_revenue_all: 0 });
      });
    });

    res.json({ success: true, data: stats });

  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

