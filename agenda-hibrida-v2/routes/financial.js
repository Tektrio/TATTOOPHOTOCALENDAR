/**
 * Financial Statistics Routes
 * Endpoints para métricas e estatísticas financeiras
 */

const express = require('express');
const router = express.Router();

// GET /api/stats/financial
router.get('/stats/financial', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { period = '30' } = req.query; // dias (7, 30, 90, 365, 'all')
    
    const periodDays = period === 'all' ? 36500 : parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    // 1. Receita Total e Número de Transações
    const revenueSummary = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_transactions,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions,
          COUNT(*) as total_transactions
        FROM financial_transactions
        WHERE transaction_date >= ? AND status = 'completed'
      `, [startDateStr], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // 2. Ticket Médio (receita / número de transações de receita)
    const averageTicket = revenueSummary.income_transactions > 0
      ? revenueSummary.total_revenue / revenueSummary.income_transactions
      : 0;

    // 3. Clientes Ativos (clientes com transações no período)
    const activeClients = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(DISTINCT client_id) as count
        FROM financial_transactions
        WHERE transaction_date >= ? 
          AND type = 'income' 
          AND status = 'completed'
          AND client_id IS NOT NULL
      `, [startDateStr], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.count : 0);
      });
    });

    // 4. Receita por Dia (para gráfico de linha)
    const revenueByDay = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          transaction_date as date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM financial_transactions
        WHERE transaction_date >= ? AND status = 'completed'
        GROUP BY transaction_date
        ORDER BY transaction_date ASC
      `, [startDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 5. Receita por Categoria (para gráfico de pizza)
    const revenueByCategory = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          category,
          SUM(amount) as total,
          COUNT(*) as count
        FROM financial_transactions
        WHERE transaction_date >= ? 
          AND type = 'income' 
          AND status = 'completed'
        GROUP BY category
        ORDER BY total DESC
      `, [startDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 6. Despesas por Categoria
    const expensesByCategory = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          category,
          SUM(amount) as total,
          COUNT(*) as count
        FROM financial_transactions
        WHERE transaction_date >= ? 
          AND type = 'expense' 
          AND status = 'completed'
        GROUP BY category
        ORDER BY total DESC
      `, [startDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 7. Top Métodos de Pagamento
    const paymentMethods = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          payment_method,
          SUM(amount) as total,
          COUNT(*) as count
        FROM financial_transactions
        WHERE transaction_date >= ? 
          AND type = 'income' 
          AND status = 'completed'
          AND payment_method IS NOT NULL
        GROUP BY payment_method
        ORDER BY total DESC
      `, [startDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 8. Top Funcionários (por receita gerada)
    const topEmployees = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          e.id,
          e.name,
          e.role,
          SUM(ft.amount) as total_revenue,
          COUNT(ft.id) as transaction_count
        FROM financial_transactions ft
        JOIN employees e ON ft.employee_id = e.id
        WHERE ft.transaction_date >= ? 
          AND ft.type = 'income' 
          AND ft.status = 'completed'
        GROUP BY e.id, e.name, e.role
        ORDER BY total_revenue DESC
        LIMIT 10
      `, [startDateStr], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // 9. Comparação com período anterior
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    const previousStartDateStr = previousStartDate.toISOString().split('T')[0];
    const previousEndDateStr = startDateStr;

    const previousRevenue = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_revenue
        FROM financial_transactions
        WHERE transaction_date >= ? 
          AND transaction_date < ?
          AND status = 'completed'
      `, [previousStartDateStr, previousEndDateStr], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total_revenue : 0);
      });
    });

    // Calcular variação percentual
    const revenueGrowth = previousRevenue > 0
      ? ((revenueSummary.total_revenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // 10. Lucro Líquido
    const netProfit = revenueSummary.total_revenue - revenueSummary.total_expenses;
    const profitMargin = revenueSummary.total_revenue > 0
      ? (netProfit / revenueSummary.total_revenue) * 100
      : 0;

    // Montar resposta
    const response = {
      success: true,
      period: {
        days: periodDays,
        start_date: startDateStr,
        end_date: new Date().toISOString().split('T')[0]
      },
      summary: {
        total_revenue: revenueSummary.total_revenue,
        total_expenses: revenueSummary.total_expenses,
        net_profit: netProfit,
        profit_margin: Math.round(profitMargin * 100) / 100,
        total_transactions: revenueSummary.total_transactions,
        income_transactions: revenueSummary.income_transactions,
        expense_transactions: revenueSummary.expense_transactions,
        average_ticket: Math.round(averageTicket * 100) / 100,
        active_clients: activeClients,
        revenue_growth: Math.round(revenueGrowth * 100) / 100
      },
      charts: {
        revenue_by_day: revenueByDay,
        revenue_by_category: revenueByCategory,
        expenses_by_category: expensesByCategory,
        payment_methods: paymentMethods
      },
      top_employees: topEmployees,
      comparison: {
        current_period_revenue: revenueSummary.total_revenue,
        previous_period_revenue: previousRevenue,
        growth_percentage: Math.round(revenueGrowth * 100) / 100
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      summary: {
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        profit_margin: 0,
        total_transactions: 0,
        income_transactions: 0,
        expense_transactions: 0,
        average_ticket: 0,
        active_clients: 0,
        revenue_growth: 0
      }
    });
  }
});

// GET /api/financial/transactions - Listar transações
router.get('/financial/transactions', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { 
      type, 
      category, 
      start_date, 
      end_date, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let sql = `
      SELECT 
        ft.*,
        c.name as client_name,
        e.name as employee_name
      FROM financial_transactions ft
      LEFT JOIN clients c ON ft.client_id = c.id
      LEFT JOIN employees e ON ft.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      sql += ' AND ft.type = ?';
      params.push(type);
    }

    if (category) {
      sql += ' AND ft.category = ?';
      params.push(category);
    }

    if (start_date) {
      sql += ' AND ft.transaction_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND ft.transaction_date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY ft.transaction_date DESC, ft.id DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({ success: true, data: transactions });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/financial/transactions - Criar nova transação
router.post('/financial/transactions', async (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      transaction_date,
      type,
      category,
      description,
      amount,
      payment_method,
      client_id,
      appointment_id,
      employee_id,
      notes
    } = req.body;

    // Validações
    if (!transaction_date || !type || !description || !amount) {
      return res.status(400).json({
        success: false,
        error: 'transaction_date, type, description e amount são obrigatórios'
      });
    }

    if (!['income', 'expense', 'refund'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'type deve ser: income, expense ou refund'
      });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO financial_transactions (
          transaction_date, type, category, description, amount,
          payment_method, client_id, appointment_id, employee_id, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
      `, [
        transaction_date, type, category, description, amount,
        payment_method, client_id, appointment_id, employee_id, notes
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });

    res.json({ success: true, data: result });

  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

