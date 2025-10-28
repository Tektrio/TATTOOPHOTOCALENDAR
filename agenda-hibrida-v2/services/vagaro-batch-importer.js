/**
 * Vagaro Batch Importer Service
 * Importação em lote de dados do Vagaro Excel com anti-duplicação inteligente
 */

const crypto = require('crypto');
const { parse } = require('date-fns');

class VagaroBatchImporter {
  constructor(db) {
    this.db = db;
  }

  /**
   * Calcula hash MD5 para detectar duplicatas
   */
  calculateMD5(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Cria ou atualiza um log de importação
   */
  async createImportLog(importType, fileName) {
    const fileHash = this.calculateMD5({ fileName, timestamp: Date.now() });
    
    const stmt = this.db.prepare(`
      INSERT INTO import_logs (import_type, file_name, file_hash, status, started_at)
      VALUES (?, ?, ?, 'processing', CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(importType, fileName, fileHash);
    return result.lastInsertRowid;
  }

  /**
   * Atualiza log de importação
   */
  async updateImportLog(logId, stats, status = 'completed') {
    const duration = Math.floor((Date.now() - new Date().getTime()) / 1000);
    
    const stmt = this.db.prepare(`
      UPDATE import_logs 
      SET 
        total_rows = ?,
        processed_rows = ?,
        successful_rows = ?,
        failed_rows = ?,
        skipped_rows = ?,
        status = ?,
        completed_at = CURRENT_TIMESTAMP,
        duration_seconds = ?
      WHERE id = ?
    `);
    
    stmt.run(
      stats.total,
      stats.processed,
      stats.successful,
      stats.failed,
      stats.skipped,
      status,
      duration,
      logId
    );
  }

  /**
   * Registra erro de importação
   */
  async logImportError(logId, rowNumber, errorType, errorMessage, rowData) {
    const stmt = this.db.prepare(`
      INSERT INTO import_errors (import_log_id, row_number, error_type, error_message, row_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(logId, rowNumber, errorType, errorMessage, JSON.stringify(rowData));
  }

  /**
   * Verifica se cliente já existe (anti-duplicação)
   */
  async findExistingCustomer(customer) {
    // 1. Por Vagaro ID
    if (customer.vagaro_customer_id) {
      const stmt = this.db.prepare('SELECT id FROM customers WHERE vagaro_customer_id = ?');
      const result = stmt.get(customer.vagaro_customer_id);
      if (result) return result.id;
    }

    // 2. Por email (exato)
    if (customer.email) {
      const stmt = this.db.prepare('SELECT id FROM customers WHERE LOWER(email) = LOWER(?)');
      const result = stmt.get(customer.email);
      if (result) return result.id;
    }

    // 3. Por telefone (normalizado)
    if (customer.phone) {
      const normalizedPhone = customer.phone.replace(/\D/g, '');
      const stmt = this.db.prepare(`
        SELECT id FROM customers 
        WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', '') LIKE ?
      `);
      const result = stmt.get(`%${normalizedPhone}%`);
      if (result) return result.id;
    }

    // 4. Por nome completo (fuzzy)
    if (customer.name) {
      const stmt = this.db.prepare(`
        SELECT id FROM customers 
        WHERE LOWER(name) = LOWER(?)
        LIMIT 1
      `);
      const result = stmt.get(customer.name);
      if (result) return result.id;
    }

    return null;
  }

  /**
   * Importa clientes do Vagaro
   */
  async importCustomers(rows, fileName, options = {}) {
    const logId = await this.createImportLog('vagaro_clients', fileName);
    
    const stats = {
      total: rows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      
      try {
        stats.processed++;

        // Validação básica
        if (!row.name && !row.first_name && !row.last_name) {
          stats.skipped++;
          await this.logImportError(
            logId,
            rowNumber,
            'validation',
            'Nome do cliente é obrigatório',
            row
          );
          continue;
        }

        // Preparar dados do cliente
        const customerData = {
          name: row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          email: row.email || row.email_address || null,
          phone: row.phone || row.mobile || row.phone_number || null,
          address_line1: row.address || row.street || null,
          city: row.city || null,
          state: row.state || row.province || null,
          zip_code: row.zip || row.postal_code || row.zip_code || null,
          country: row.country || 'Brasil',
          date_of_birth: this.parseDate(row.birth_date || row.birthday || row.dob),
          gender: row.gender || null,
          notes: row.notes || row.comments || null,
          marketing_consent: this.parseBoolean(row.marketing_consent || row.email_opt_in),
          sms_consent: this.parseBoolean(row.sms_consent || row.sms_opt_in),
          vagaro_customer_id: row.customer_id || row.client_id || row.vagaro_id || null,
          vagaro_member_since: this.parseDate(row.member_since || row.join_date),
          referral_source: row.referral_source || row.how_did_you_hear || null,
          import_log_id: logId,
          tags: row.tags ? JSON.stringify(row.tags.split(',').map(t => t.trim())) : null
        };

        // Verificar duplicação
        const existingId = await this.findExistingCustomer(customerData);

        if (existingId && !options.updateExisting) {
          stats.skipped++;
          continue;
        }

        if (existingId && options.updateExisting) {
          // Atualizar cliente existente
          const updateStmt = this.db.prepare(`
            UPDATE customers 
            SET 
              name = COALESCE(?, name),
              email = COALESCE(?, email),
              phone = COALESCE(?, phone),
              address_line1 = COALESCE(?, address_line1),
              city = COALESCE(?, city),
              state = COALESCE(?, state),
              zip_code = COALESCE(?, zip_code),
              date_of_birth = COALESCE(?, date_of_birth),
              gender = COALESCE(?, gender),
              notes = COALESCE(?, notes),
              marketing_consent = COALESCE(?, marketing_consent),
              sms_consent = COALESCE(?, sms_consent),
              vagaro_last_sync = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `);
          
          updateStmt.run(
            customerData.name,
            customerData.email,
            customerData.phone,
            customerData.address_line1,
            customerData.city,
            customerData.state,
            customerData.zip_code,
            customerData.date_of_birth,
            customerData.gender,
            customerData.notes,
            customerData.marketing_consent,
            customerData.sms_consent,
            existingId
          );
          
          stats.successful++;
        } else {
          // Inserir novo cliente
          const insertStmt = this.db.prepare(`
            INSERT INTO customers (
              name, email, phone, address_line1, city, state, zip_code, country,
              date_of_birth, gender, notes, marketing_consent, sms_consent,
              vagaro_customer_id, vagaro_member_since, referral_source,
              import_log_id, tags, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `);
          
          insertStmt.run(
            customerData.name,
            customerData.email,
            customerData.phone,
            customerData.address_line1,
            customerData.city,
            customerData.state,
            customerData.zip_code,
            customerData.country,
            customerData.date_of_birth,
            customerData.gender,
            customerData.notes,
            customerData.marketing_consent,
            customerData.sms_consent,
            customerData.vagaro_customer_id,
            customerData.vagaro_member_since,
            customerData.referral_source,
            logId,
            customerData.tags
          );
          
          stats.successful++;
        }
      } catch (error) {
        stats.failed++;
        await this.logImportError(
          logId,
          rowNumber,
          'database',
          error.message,
          row
        );
      }
    }

    await this.updateImportLog(logId, stats);
    return { logId, stats };
  }

  /**
   * Importa transações do Vagaro
   */
  async importTransactions(rows, fileName, options = {}) {
    const logId = await this.createImportLog('vagaro_transactions', fileName);
    
    const stats = {
      total: rows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      
      try {
        stats.processed++;

        // Validação básica
        if (!row.transaction_date && !row.date && !row.service_date) {
          stats.skipped++;
          await this.logImportError(
            logId,
            rowNumber,
            'validation',
            'Data da transação é obrigatória',
            row
          );
          continue;
        }

        // Buscar customer_id
        let customerId = null;
        if (row.customer_email) {
          const customerStmt = this.db.prepare('SELECT id FROM customers WHERE LOWER(email) = LOWER(?)');
          const customer = customerStmt.get(row.customer_email);
          if (customer) customerId = customer.id;
        } else if (row.customer_name) {
          const customerStmt = this.db.prepare('SELECT id FROM customers WHERE LOWER(name) = LOWER(?) LIMIT 1');
          const customer = customerStmt.get(row.customer_name);
          if (customer) customerId = customer.id;
        }

        // Buscar employee_id
        let employeeId = null;
        if (row.employee_name || row.staff_name || row.provider_name) {
          const employeeName = row.employee_name || row.staff_name || row.provider_name;
          const employeeStmt = this.db.prepare('SELECT id FROM employees WHERE LOWER(employee_name) = LOWER(?) LIMIT 1');
          const employee = employeeStmt.get(employeeName);
          if (employee) employeeId = employee.id;
        }

        // Preparar dados da transação
        const transactionData = {
          customer_id: customerId,
          transaction_date: this.parseDate(row.transaction_date || row.date || row.service_date),
          transaction_type: this.normalizeTransactionType(row.transaction_type || row.type || 'service'),
          transaction_status: row.status || 'completed',
          subtotal: this.parseNumber(row.subtotal || row.amount),
          discount: this.parseNumber(row.discount || 0),
          tax: this.parseNumber(row.tax || 0),
          tip: this.parseNumber(row.tip || 0),
          total: this.parseNumber(row.total || row.amount || 0),
          payment_method: this.normalizePaymentMethod(row.payment_method || row.payment_type),
          payment_status: row.payment_status || 'paid',
          item_name: row.service_name || row.product_name || row.item_name || null,
          item_category: row.category || row.service_category || null,
          quantity: this.parseNumber(row.quantity || 1),
          notes: row.notes || row.description || null,
          employee_id: employeeId,
          invoice_number: row.invoice_number || row.invoice || null,
          source: 'vagaro',
          import_log_id: logId,
          vagaro_transaction_id: row.transaction_id || row.id || null
        };

        // Verificar duplicação por vagaro_transaction_id
        if (transactionData.vagaro_transaction_id) {
          const checkStmt = this.db.prepare('SELECT id FROM transactions WHERE vagaro_transaction_id = ?');
          const existing = checkStmt.get(transactionData.vagaro_transaction_id);
          
          if (existing && !options.updateExisting) {
            stats.skipped++;
            continue;
          }
        }

        // Inserir transação
        const insertStmt = this.db.prepare(`
          INSERT INTO transactions (
            customer_id, transaction_date, transaction_type, transaction_status,
            subtotal, discount, tax, tip, total, payment_method, payment_status,
            item_name, item_category, quantity, notes, employee_id, invoice_number,
            source, import_log_id, vagaro_transaction_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        insertStmt.run(
          transactionData.customer_id,
          transactionData.transaction_date,
          transactionData.transaction_type,
          transactionData.transaction_status,
          transactionData.subtotal,
          transactionData.discount,
          transactionData.tax,
          transactionData.tip,
          transactionData.total,
          transactionData.payment_method,
          transactionData.payment_status,
          transactionData.item_name,
          transactionData.item_category,
          transactionData.quantity,
          transactionData.notes,
          transactionData.employee_id,
          transactionData.invoice_number,
          transactionData.source,
          logId,
          transactionData.vagaro_transaction_id
        );
        
        stats.successful++;
      } catch (error) {
        stats.failed++;
        await this.logImportError(
          logId,
          rowNumber,
          'database',
          error.message,
          row
        );
      }
    }

    await this.updateImportLog(logId, stats);
    return { logId, stats };
  }

  /**
   * Importa funcionários do Vagaro
   */
  async importEmployees(rows, fileName, options = {}) {
    const logId = await this.createImportLog('vagaro_employees', fileName);
    
    const stats = {
      total: rows.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      
      try {
        stats.processed++;

        // Validação básica
        if (!row.name && !row.employee_name && !row.staff_name) {
          stats.skipped++;
          await this.logImportError(
            logId,
            rowNumber,
            'validation',
            'Nome do funcionário é obrigatório',
            row
          );
          continue;
        }

        const employeeName = row.name || row.employee_name || row.staff_name;

        // Verificar duplicação
        let existingId = null;
        if (row.employee_id || row.staff_id) {
          const checkStmt = this.db.prepare('SELECT id FROM employees WHERE vagaro_employee_id = ?');
          const existing = checkStmt.get(row.employee_id || row.staff_id);
          if (existing) existingId = existing.id;
        }

        if (!existingId && row.email) {
          const checkStmt = this.db.prepare('SELECT id FROM employees WHERE LOWER(employee_email) = LOWER(?)');
          const existing = checkStmt.get(row.email);
          if (existing) existingId = existing.id;
        }

        if (existingId && !options.updateExisting) {
          stats.skipped++;
          continue;
        }

        // Preparar dados do funcionário
        const employeeData = {
          employee_name: employeeName,
          employee_email: row.email || null,
          employee_phone: row.phone || row.mobile || null,
          is_active: this.parseBoolean(row.is_active !== undefined ? row.is_active : true),
          employment_status: row.status || 'active',
          role: row.role || row.position || null,
          specialties: row.specialties ? JSON.stringify(row.specialties.split(',').map(s => s.trim())) : null,
          commission_rate: this.parseNumber(row.commission_rate || row.commission || 0),
          hourly_rate: this.parseNumber(row.hourly_rate || 0),
          calendar_color: row.calendar_color || this.generateRandomColor(),
          hire_date: this.parseDate(row.hire_date || row.start_date),
          import_log_id: logId,
          vagaro_employee_id: row.employee_id || row.staff_id || null
        };

        if (existingId) {
          // Atualizar funcionário existente
          const updateStmt = this.db.prepare(`
            UPDATE employees 
            SET 
              employee_name = COALESCE(?, employee_name),
              employee_email = COALESCE(?, employee_email),
              employee_phone = COALESCE(?, employee_phone),
              is_active = COALESCE(?, is_active),
              employment_status = COALESCE(?, employment_status),
              role = COALESCE(?, role),
              commission_rate = COALESCE(?, commission_rate),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `);
          
          updateStmt.run(
            employeeData.employee_name,
            employeeData.employee_email,
            employeeData.employee_phone,
            employeeData.is_active,
            employeeData.employment_status,
            employeeData.role,
            employeeData.commission_rate,
            existingId
          );
          
          stats.successful++;
        } else {
          // Inserir novo funcionário
          const insertStmt = this.db.prepare(`
            INSERT INTO employees (
              employee_name, employee_email, employee_phone, is_active, employment_status,
              role, specialties, commission_rate, hourly_rate, calendar_color,
              hire_date, import_log_id, vagaro_employee_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `);
          
          insertStmt.run(
            employeeData.employee_name,
            employeeData.employee_email,
            employeeData.employee_phone,
            employeeData.is_active,
            employeeData.employment_status,
            employeeData.role,
            employeeData.specialties,
            employeeData.commission_rate,
            employeeData.hourly_rate,
            employeeData.calendar_color,
            employeeData.hire_date,
            logId,
            employeeData.vagaro_employee_id
          );
          
          stats.successful++;
        }
      } catch (error) {
        stats.failed++;
        await this.logImportError(
          logId,
          rowNumber,
          'database',
          error.message,
          row
        );
      }
    }

    await this.updateImportLog(logId, stats);
    return { logId, stats };
  }

  /**
   * Helpers de parsing
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      // Tentar múltiplos formatos comuns
      const formats = [
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'yyyy/MM/dd',
        'MM-dd-yyyy',
        'dd-MM-yyyy'
      ];

      for (const format of formats) {
        try {
          const date = parse(dateStr, format, new Date());
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          continue;
        }
      }

      // Fallback: tentar Date.parse
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn(`Failed to parse date: ${dateStr}`);
    }
    
    return null;
  }

  parseNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', 'yes', '1', 'y', 'sim'].includes(value.toLowerCase());
    }
    return !!value;
  }

  normalizeTransactionType(type) {
    const typeMap = {
      'service': 'service',
      'product': 'product',
      'package': 'package',
      'tip': 'tip',
      'deposit': 'deposit',
      'refund': 'refund',
      'membership': 'package'
    };
    return typeMap[type.toLowerCase()] || 'service';
  }

  normalizePaymentMethod(method) {
    if (!method) return null;
    
    const methodMap = {
      'cash': 'cash',
      'credit': 'credit_card',
      'credit card': 'credit_card',
      'debit': 'debit_card',
      'debit card': 'debit_card',
      'pix': 'pix',
      'transfer': 'transfer',
      'bank transfer': 'transfer'
    };
    
    return methodMap[method.toLowerCase()] || 'other';
  }

  generateRandomColor() {
    const colors = [
      '#4285F4', '#34A853', '#FBBC05', '#EA4335',
      '#9333EA', '#EC4899', '#14B8A6', '#F59E0B'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = VagaroBatchImporter;

