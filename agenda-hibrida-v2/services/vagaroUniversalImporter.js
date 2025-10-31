/**
 * Importador Universal de Dados Vagaro
 * Suporta: Clientes, Transações, Serviços, Gift Cards e Formulários
 * 
 * Usa biblioteca XLSX nativa para garantir compatibilidade total
 */

const XLSX = require('xlsx');

class VagaroUniversalImporter {
  constructor(db) {
    this.db = db;
    this.stats = {
      customers: { total: 0, created: 0, updated: 0, skipped: 0, errors: [] },
      transactions: { total: 0, created: 0, updated: 0, skipped: 0, errors: [] },
      services: { total: 0, created: 0, updated: 0, skipped: 0, errors: [] },
      giftcards: { total: 0, created: 0, updated: 0, skipped: 0, errors: [] },
      forms: { total: 0, created: 0, updated: 0, skipped: 0, errors: [] }
    };
  }

  // ============================================
  // DETECÇÃO E LEITURA DE ARQUIVOS
  // ============================================

  /**
   * Detecta tipo de arquivo automaticamente
   */
  detectFileType(headers, fileName) {
    // const headerStr = headers.join(',').toLowerCase(); // Removido - não utilizado
    const fileNameLower = fileName.toLowerCase();
    
    if (headers.includes('Customer Since') || fileNameLower.includes('customerslist')) {
      return 'customers';
    }
    if (headers.includes('TransactionDate') || fileNameLower.includes('depositreport')) {
      return 'deposits';
    }
    if (headers.includes('GC No') || fileNameLower.includes('giftcard')) {
      return 'giftcards';
    }
    if (headers.includes('Form Name') || fileNameLower.includes('forms')) {
      return 'forms';
    }
    if (headers.includes('Services/Classes') || fileNameLower.includes('services')) {
      return 'services';
    }
    
    return 'unknown';
  }

  /**
   * Lê arquivo Excel usando biblioteca XLSX
   */
  async readExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath, {
        type: 'file',
        cellDates: false,
        cellText: false
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Ler TODAS as linhas sem assumir cabeçalhos
      const allData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: null,
        blankrows: false,
        header: 1 // Retornar como array de arrays
      });
      
      // Encontrar a linha de cabeçalho real (procura por colunas conhecidas)
      let headerRowIndex = -1;
      const headerKeywords = ['First Name', 'Last Name', 'Email', 'Customer Since', 'TransactionDate', 'Services/Classes', 'GC No', 'Form Name'];
      
      for (let i = 0; i < Math.min(5, allData.length); i++) {
        const row = allData[i];
        const rowText = row.join('|').toLowerCase();
        
        if (headerKeywords.some(keyword => rowText.includes(keyword.toLowerCase()))) {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex === -1) {
        headerRowIndex = 0; // Fallback para primeira linha
      }
      
      // Usar a linha de cabeçalho encontrada
      const headers = allData[headerRowIndex];
      const dataRows = allData.slice(headerRowIndex + 1);
      
      // Converter para objetos usando os cabeçalhos corretos
      const data = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[header] = row[index] !== undefined ? row[index] : null;
          }
        });
        return obj;
      });
      
      // Filtrar linhas de summary/total/vazias
      return data.filter(row => {
        const firstValue = Object.values(row)[0];
        if (!firstValue) return false;
        
        const lowerValue = String(firstValue).toLowerCase();
        return !lowerValue.includes('total') && 
               !lowerValue.includes('summary') &&
               lowerValue !== ' to ';
      });
    } catch (error) {
      throw new Error(`Erro ao ler Excel: ${error.message}`);
    }
  }

  // ============================================
  // UTILITÁRIOS DE PARSING
  // ============================================

  /**
   * Parse de valores monetários ($1,234.56)
   */
  parseMoneyValue(value) {
    if (!value || value === '---') return 0;
    
    // Remove $, vírgulas, espaços e parênteses
    const cleaned = String(value).replace(/[$,\s()]/g, '');
    const parsed = parseFloat(cleaned);
    
    // Checar se tinha parênteses (número negativo em contabilidade)
    if (String(value).includes('(') && String(value).includes(')')) {
      return -Math.abs(parsed || 0);
    }
    
    return parsed || 0;
  }

  /**
   * Parse de valores inteiros
   */
  parseIntValue(value) {
    if (!value || value === '---') return 0;
    return parseInt(String(value).replace(/[,\s]/g, '')) || 0;
  }

  /**
   * Parse de datas
   */
  parseDate(value) {
    if (!value || value === '---' || value === 'Never') return null;
    
    try {
      // Tentar criar data
      const date = new Date(value);
      
      // Validar se é uma data válida
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Retornar no formato YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  /**
   * Normaliza nomes (remove espaços extras)
   */
  normalizeName(name) {
    if (!name || name === '---') return null;
    return name.trim().replace(/\s+/g, ' ');
  }

  /**
   * Normaliza telefone (apenas dígitos)
   */
  normalizePhone(phone) {
    if (!phone || phone === '---') return null;
    const digits = phone.replace(/\D/g, '');
    return digits.length > 0 ? digits : null;
  }

  // ============================================
  // PARSERS ESPECÍFICOS POR TIPO
  // ============================================

  /**
   * Parser para CustomersList.xlsx
   */
  parseCustomerRow(row, rowIndex) {
    try {
      const firstName = this.normalizeName(row['First Name']);
      const lastName = this.normalizeName(row['Last Name']);
      
      if (!firstName && !lastName) {
        throw new Error('Nome do cliente é obrigatório');
      }

      return {
        // Nome completo
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        first_name: firstName,
        last_name: lastName,
        
        // Contato
        email: row['Email'] && row['Email'] !== '---' ? row['Email'].toLowerCase().trim() : null,
        mobile: this.normalizePhone(row['Mobile']),
        day_phone: this.normalizePhone(row['Day']),
        night_phone: this.normalizePhone(row['Night']),
        
        // Endereço
        address_line1: this.normalizeName(row['Address']),
        apt_suite: row['Apt/Suite'] !== '---' ? row['Apt/Suite'] : null,
        city: this.normalizeName(row['City']),
        state: row['State'] !== '---' ? row['State'] : null,
        zip_code: row['Zip'] !== '---' ? row['Zip'] : null,
        
        // Dados pessoais
        birthdate: this.parseDate(row['Birthdate']),
        gender: row['Gender'] !== '---' ? row['Gender'] : null,
        
        // Datas importantes
        customer_since: this.parseDate(row['Customer Since']),
        last_visited: this.parseDate(row['Last Visited']),
        
        // Preferências
        membership: row['Membership'] !== '---' ? row['Membership'] : null,
        tags: row['Tags'] && row['Tags'] !== 'NONE of the options' ? row['Tags'] : null,
        referred_by: this.normalizeName(row['Refered By']), // Typo do Vagaro
        online_booking_allowed: row['Online Booking'] === 'Allow' ? 1 : 0,
        
        // Informações financeiras
        credit_card_on_file: row['Credit Card'] !== '---' ? row['Credit Card'] : null,
        bank_on_file: row['Bank'] !== '---' ? row['Bank'] : null,
        
        // Estatísticas do Vagaro
        vagaro_appointments_booked: this.parseIntValue(row['Appointments Booked']),
        vagaro_classes_booked: this.parseIntValue(row['Classes Booked']),
        vagaro_check_ins: this.parseIntValue(row['Check-Ins']),
        vagaro_points_earned: this.parseIntValue(row['Points Earned']),
        vagaro_amount_paid: this.parseMoneyValue(row['Amount Paid']),
        vagaro_no_shows: this.parseIntValue(row['No Shows/Cancellations']),
        vagaro_employee_seen: row['Employee Seen'] !== '---' ? row['Employee Seen'] : null,
        
        // Metadados
        import_source: 'vagaro',
        last_import_date: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Linha ${rowIndex + 2}: ${error.message}`);
    }
  }

  /**
   * Parser para DepositReport.xlsx
   */
  parseDepositRow(row, rowIndex) {
    try {
      return {
        transaction_date: this.parseDate(row['TransactionDate']),
        deposit_date: this.parseDate(row['DepositDate']),
        transaction_number: row['TranNum'],
        transaction_type: row['TranType'],
        swiped_typed: row['SwipedTyped'],
        customer_name: this.normalizeName(row['Name']),
        last_4_acct: row['Last4ofAcct'],
        account_type: row['AcctType'],
        
        // Valores monetários
        gross_amount: this.parseMoneyValue(row['Gross']),
        discount_fee: Math.abs(this.parseMoneyValue(row['DiscFee'])),
        per_transaction_fee: Math.abs(this.parseMoneyValue(row['PerTran'])),
        refund_amount: Math.abs(this.parseMoneyValue(row['Refund'])),
        total_fee: Math.abs(this.parseMoneyValue(row['Fee'])),
        net_amount: this.parseMoneyValue(row['NetAmount']),
        
        import_date: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Linha ${rowIndex + 2}: ${error.message}`);
    }
  }

  /**
   * Parser para Services.xlsx
   */
  parseServiceRow(row, rowIndex) {
    try {
      const serviceName = row['Services/Classes'];
      
      // Pular linha "Total"
      if (!serviceName || serviceName.toLowerCase() === 'total') {
        return null;
      }

      return {
        service_name: serviceName,
        total_appointments: this.parseIntValue(row['No of Appointments']),
        total_attendees: this.parseIntValue(row['No of Attendees']),
        service_sales: this.parseMoneyValue(row['Service Sale']),
        service_addon_sales: this.parseMoneyValue(row['Service Add-On Sale']),
        class_sales: this.parseMoneyValue(row['Class Sale']),
        class_addon_sales: this.parseMoneyValue(row['Class Add-On Sale']),
        cost_to_business: this.parseMoneyValue(row['Cost To Business']),
        average_sale: this.parseMoneyValue(row['Average Sale']),
        is_active: 1,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Linha ${rowIndex + 2}: ${error.message}`);
    }
  }

  /**
   * Parser para GiftCardsManagement.xlsx
   */
  parseGiftCardRow(row, rowIndex) {
    try {
      return {
        gift_card_number: row['GC No'],
        purchase_date: this.parseDate(row['Purchase Date']),
        merchant_account: row['Merchant Account'] || null,
        purchased_at: row['Purchased At'],
        from_customer: this.normalizeName(row['From']),
        assigned_to: this.normalizeName(row['Assign To']),
        initial_amount: this.parseMoneyValue(row['Init.Amount']),
        current_balance: this.parseMoneyValue(row['Current Balance']),
        visits_remaining: row['No of Visit(s) Remaining'] !== '---' 
          ? this.parseIntValue(row['No of Visit(s) Remaining']) 
          : null,
        expire_on: row['Expire On'] !== 'Never' 
          ? this.parseDate(row['Expire On']) 
          : null,
        status: row['Status'] ? row['Status'].toLowerCase() : 'outstanding',
        void_reason: row['Void Reason'] || null,
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Linha ${rowIndex + 2}: ${error.message}`);
    }
  }

  /**
   * Parser para Unsigned Forms.xlsx
   */
  parseFormRow(row, rowIndex) {
    try {
      return {
        form_name: row['Form Name'],
        form_type: row['Type'],
        customer_name: this.normalizeName(row['Customer']),
        fill_date: this.parseDate(row['Customer Fill Date']),
        signature_date: this.parseDate(row['Customer Fill Date']),
        signature_status: row['Signature Status'] ? row['Signature Status'].toLowerCase() : 'unsigned',
        signature_required: row['Signature Required'],
        created_at: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Linha ${rowIndex + 2}: ${error.message}`);
    }
  }

  // ============================================
  // HELPERS DE BANCO DE DADOS
  // ============================================

  /**
   * Executa query SELECT
   */
  queryDb(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Executa query INSERT/UPDATE/DELETE
   */
  runDb(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  /**
   * Executa query SELECT ALL
   */
  allDb(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // ============================================
  // DEDUPLICAÇÃO
  // ============================================

  /**
   * Encontra cliente duplicado por email, telefone ou nome
   */
  async findDuplicateClient(customerData) {
    // Prioridade 1: Email
    if (customerData.email) {
      const byEmail = await this.queryDb(
        'SELECT * FROM clients WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [customerData.email]
      );
      if (byEmail) return byEmail;
    }

    // Prioridade 2: Telefone
    if (customerData.mobile) {
      const byPhone = await this.queryDb(
        'SELECT * FROM clients WHERE mobile = ? LIMIT 1',
        [customerData.mobile]
      );
      if (byPhone) return byPhone;
    }

    // Prioridade 3: Nome completo
    if (customerData.name) {
      const byName = await this.queryDb(
        'SELECT * FROM clients WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [customerData.name]
      );
      if (byName) return byName;
    }

    return null;
  }

  /**
   * Encontra transação duplicada por número
   */
  async findDuplicateTransaction(transactionData) {
    if (transactionData.transaction_number) {
      return await this.queryDb(
        'SELECT * FROM vagaro_transactions WHERE transaction_number = ? LIMIT 1',
        [transactionData.transaction_number]
      );
    }
    return null;
  }

  /**
   * Encontra serviço por nome
   */
  async findService(serviceName) {
    return await this.queryDb(
      'SELECT * FROM vagaro_services WHERE service_name = ? LIMIT 1',
      [serviceName]
    );
  }

  /**
   * Encontra gift card por número
   */
  async findGiftCard(cardNumber) {
    return await this.queryDb(
      'SELECT * FROM vagaro_gift_cards WHERE gift_card_number = ? LIMIT 1',
      [cardNumber]
    );
  }

  /**
   * Vincula cliente pelo nome (para transações/forms/gift cards)
   */
  async findClientByName(name) {
    if (!name) return null;
    
    return await this.queryDb(
      'SELECT id FROM clients WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [name]
    );
  }

  // ============================================
  // IMPORTAÇÕES PRINCIPAIS
  // ============================================

  /**
   * Importa clientes do CustomersList.xlsx
   */
  async importCustomers(filePath) {
    console.log('\n📥 Importando clientes...');
    
    const data = await this.readExcelFile(filePath);
    this.stats.customers.total = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const customerData = this.parseCustomerRow(row, i);
        const duplicate = await this.findDuplicateClient(customerData);

        if (duplicate) {
          // Atualizar cliente existente
          await this.runDb(`
            UPDATE clients SET
              name = ?, first_name = ?, last_name = ?, email = ?, mobile = ?,
              day_phone = ?, night_phone = ?, address_line1 = ?, apt_suite = ?,
              city = ?, state = ?, zip_code = ?, birthdate = ?, gender = ?,
              customer_since = ?, last_visited = ?, membership = ?, tags = ?,
              referred_by = ?, online_booking_allowed = ?, credit_card_on_file = ?,
              bank_on_file = ?, vagaro_appointments_booked = ?, vagaro_classes_booked = ?,
              vagaro_check_ins = ?, vagaro_points_earned = ?, vagaro_amount_paid = ?,
              vagaro_no_shows = ?, vagaro_employee_seen = ?, last_import_date = ?
            WHERE id = ?
          `, [
            customerData.name, customerData.first_name, customerData.last_name,
            customerData.email, customerData.mobile, customerData.day_phone,
            customerData.night_phone, customerData.address_line1, customerData.apt_suite,
            customerData.city, customerData.state, customerData.zip_code,
            customerData.birthdate, customerData.gender, customerData.customer_since,
            customerData.last_visited, customerData.membership, customerData.tags,
            customerData.referred_by, customerData.online_booking_allowed,
            customerData.credit_card_on_file, customerData.bank_on_file,
            customerData.vagaro_appointments_booked, customerData.vagaro_classes_booked,
            customerData.vagaro_check_ins, customerData.vagaro_points_earned,
            customerData.vagaro_amount_paid, customerData.vagaro_no_shows,
            customerData.vagaro_employee_seen, customerData.last_import_date,
            duplicate.id
          ]);

          this.stats.customers.updated++;
        } else {
          // Inserir novo cliente
          await this.runDb(`
            INSERT INTO clients (
              name, first_name, last_name, email, mobile, day_phone, night_phone,
              address_line1, apt_suite, city, state, zip_code, birthdate, gender,
              customer_since, last_visited, membership, tags, referred_by,
              online_booking_allowed, credit_card_on_file, bank_on_file,
              vagaro_appointments_booked, vagaro_classes_booked, vagaro_check_ins,
              vagaro_points_earned, vagaro_amount_paid, vagaro_no_shows,
              vagaro_employee_seen, import_source, last_import_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            customerData.name, customerData.first_name, customerData.last_name,
            customerData.email, customerData.mobile, customerData.day_phone,
            customerData.night_phone, customerData.address_line1, customerData.apt_suite,
            customerData.city, customerData.state, customerData.zip_code,
            customerData.birthdate, customerData.gender, customerData.customer_since,
            customerData.last_visited, customerData.membership, customerData.tags,
            customerData.referred_by, customerData.online_booking_allowed,
            customerData.credit_card_on_file, customerData.bank_on_file,
            customerData.vagaro_appointments_booked, customerData.vagaro_classes_booked,
            customerData.vagaro_check_ins, customerData.vagaro_points_earned,
            customerData.vagaro_amount_paid, customerData.vagaro_no_shows,
            customerData.vagaro_employee_seen, customerData.import_source,
            customerData.last_import_date
          ]);

          this.stats.customers.created++;
        }
        
        // Log de progresso a cada 50 registros
        if ((i + 1) % 50 === 0) {
          console.log(`   📊 Processados: ${i + 1}/${data.length}`);
        }

      } catch (error) {
        this.stats.customers.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
        this.stats.customers.skipped++;
      }
    }

    return this.stats.customers;
  }

  /**
   * Importa transações do DepositReport.xlsx
   */
  async importDeposits(filePath) {
    console.log('\n💳 Importando transações...');
    
    const data = await this.readExcelFile(filePath);
    this.stats.transactions.total = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const transactionData = this.parseDepositRow(row, i);
        
        // Tentar vincular com cliente pelo nome
        const client = await this.findClientByName(transactionData.customer_name);
        if (client) {
          transactionData.client_id = client.id;
        }

        // Verificar duplicata
        const duplicate = await this.findDuplicateTransaction(transactionData);

        if (duplicate) {
          this.stats.transactions.skipped++;
        } else {
          // Inserir nova transação
          await this.runDb(`
            INSERT INTO vagaro_transactions (
              client_id, transaction_date, deposit_date, transaction_number,
              transaction_type, swiped_typed, customer_name, last_4_acct,
              account_type, gross_amount, discount_fee, per_transaction_fee,
              refund_amount, total_fee, net_amount, import_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            transactionData.client_id, transactionData.transaction_date,
            transactionData.deposit_date, transactionData.transaction_number,
            transactionData.transaction_type, transactionData.swiped_typed,
            transactionData.customer_name, transactionData.last_4_acct,
            transactionData.account_type, transactionData.gross_amount,
            transactionData.discount_fee, transactionData.per_transaction_fee,
            transactionData.refund_amount, transactionData.total_fee,
            transactionData.net_amount, transactionData.import_date
          ]);

          this.stats.transactions.created++;
        }

        if ((i + 1) % 50 === 0) {
          console.log(`   📊 Processados: ${i + 1}/${data.length}`);
        }

      } catch (error) {
        this.stats.transactions.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
        this.stats.transactions.skipped++;
      }
    }

    return this.stats.transactions;
  }

  /**
   * Importa serviços do Services.xlsx
   */
  async importServices(filePath) {
    console.log('\n🔧 Importando serviços...');
    
    const data = await this.readExcelFile(filePath);
    this.stats.services.total = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const serviceData = this.parseServiceRow(row, i);
        
        if (!serviceData) {
          this.stats.services.skipped++;
          continue;
        }

        const existing = await this.findService(serviceData.service_name);

        if (existing) {
          // Atualizar serviço existente
          await this.runDb(`
            UPDATE vagaro_services SET
              total_appointments = ?, total_attendees = ?, service_sales = ?,
              service_addon_sales = ?, class_sales = ?, class_addon_sales = ?,
              cost_to_business = ?, average_sale = ?, is_active = ?, updated_at = ?
            WHERE id = ?
          `, [
            serviceData.total_appointments, serviceData.total_attendees,
            serviceData.service_sales, serviceData.service_addon_sales,
            serviceData.class_sales, serviceData.class_addon_sales,
            serviceData.cost_to_business, serviceData.average_sale,
            serviceData.is_active, serviceData.updated_at, existing.id
          ]);

          this.stats.services.updated++;
        } else {
          // Inserir novo serviço
          await this.runDb(`
            INSERT INTO vagaro_services (
              service_name, total_appointments, total_attendees, service_sales,
              service_addon_sales, class_sales, class_addon_sales,
              cost_to_business, average_sale, is_active, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            serviceData.service_name, serviceData.total_appointments,
            serviceData.total_attendees, serviceData.service_sales,
            serviceData.service_addon_sales, serviceData.class_sales,
            serviceData.class_addon_sales, serviceData.cost_to_business,
            serviceData.average_sale, serviceData.is_active, serviceData.updated_at
          ]);

          this.stats.services.created++;
        }

      } catch (error) {
        this.stats.services.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
        this.stats.services.skipped++;
      }
    }

    return this.stats.services;
  }

  /**
   * Importa gift cards do GiftCardsManagement.xlsx
   */
  async importGiftCards(filePath) {
    console.log('\n🎁 Importando gift cards...');
    
    const data = await this.readExcelFile(filePath);
    this.stats.giftcards.total = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const cardData = this.parseGiftCardRow(row, i);
        
        // Tentar vincular com cliente
        const client = await this.findClientByName(cardData.assigned_to);
        if (client) {
          cardData.client_id = client.id;
        }

        const existing = await this.findGiftCard(cardData.gift_card_number);

        if (existing) {
          // Atualizar gift card
          await this.runDb(`
            UPDATE vagaro_gift_cards SET
              purchase_date = ?, merchant_account = ?, purchased_at = ?,
              from_customer = ?, assigned_to = ?, client_id = ?, initial_amount = ?,
              current_balance = ?, visits_remaining = ?, expire_on = ?, status = ?,
              void_reason = ?, updated_at = ?
            WHERE id = ?
          `, [
            cardData.purchase_date, cardData.merchant_account, cardData.purchased_at,
            cardData.from_customer, cardData.assigned_to, cardData.client_id,
            cardData.initial_amount, cardData.current_balance, cardData.visits_remaining,
            cardData.expire_on, cardData.status, cardData.void_reason,
            cardData.updated_at, existing.id
          ]);

          this.stats.giftcards.updated++;
        } else {
          // Inserir novo gift card
          await this.runDb(`
            INSERT INTO vagaro_gift_cards (
              gift_card_number, purchase_date, merchant_account, purchased_at,
              from_customer, assigned_to, client_id, initial_amount, current_balance,
              visits_remaining, expire_on, status, void_reason, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            cardData.gift_card_number, cardData.purchase_date, cardData.merchant_account,
            cardData.purchased_at, cardData.from_customer, cardData.assigned_to,
            cardData.client_id, cardData.initial_amount, cardData.current_balance,
            cardData.visits_remaining, cardData.expire_on, cardData.status,
            cardData.void_reason, cardData.updated_at
          ]);

          this.stats.giftcards.created++;
        }

      } catch (error) {
        this.stats.giftcards.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
        this.stats.giftcards.skipped++;
      }
    }

    return this.stats.giftcards;
  }

  /**
   * Importa formulários do Unsigned Forms.xlsx
   */
  async importForms(filePath) {
    console.log('\n📋 Importando formulários...');
    
    const data = await this.readExcelFile(filePath);
    this.stats.forms.total = data.length;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        const formData = this.parseFormRow(row, i);
        
        // Tentar vincular com cliente
        const client = await this.findClientByName(formData.customer_name);
        if (client) {
          formData.client_id = client.id;
        }

        // Inserir formulário (sempre cria novo - não tem ID único)
        await this.runDb(`
          INSERT INTO vagaro_forms (
            form_name, form_type, client_id, customer_name, fill_date,
            signature_date, signature_status, signature_required, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          formData.form_name, formData.form_type, formData.client_id,
          formData.customer_name, formData.fill_date, formData.signature_date,
          formData.signature_status, formData.signature_required, formData.created_at
        ]);

        this.stats.forms.created++;

      } catch (error) {
        this.stats.forms.errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
        this.stats.forms.skipped++;
      }
    }

    return this.stats.forms;
  }

  /**
   * Importa arquivo automaticamente detectando o tipo
   */
  async importFile(filePath, fileName) {
    const data = await this.readExcelFile(filePath);
    
    if (data.length === 0) {
      throw new Error('Arquivo vazio ou sem dados válidos');
    }

    const headers = Object.keys(data[0]);
    const fileType = this.detectFileType(headers, fileName);

    console.log(`\n🔍 Tipo detectado: ${fileType.toUpperCase()}`);
    console.log(`📊 Total de registros: ${data.length}`);

    switch (fileType) {
      case 'customers':
        return await this.importCustomers(filePath);
      case 'deposits':
        return await this.importDeposits(filePath);
      case 'services':
        return await this.importServices(filePath);
      case 'giftcards':
        return await this.importGiftCards(filePath);
      case 'forms':
        return await this.importForms(filePath);
      default:
        throw new Error(`Tipo de arquivo não reconhecido. Headers: ${headers.join(', ')}`);
    }
  }

  /**
   * Retorna estatísticas completas
   */
  getStats() {
    return this.stats;
  }

  /**
   * Gera relatório resumido
   */
  generateReport() {
    const report = {
      summary: {},
      details: this.stats
    };

    // Calcular totais
    Object.keys(this.stats).forEach(type => {
      const stats = this.stats[type];
      report.summary[type] = {
        total: stats.total,
        created: stats.created,
        updated: stats.updated,
        skipped: stats.skipped,
        errors: stats.errors.length,
        success_rate: stats.total > 0 
          ? ((stats.created + stats.updated) / stats.total * 100).toFixed(2) + '%'
          : '0%'
      };
    });

    return report;
  }
}

module.exports = VagaroUniversalImporter;

