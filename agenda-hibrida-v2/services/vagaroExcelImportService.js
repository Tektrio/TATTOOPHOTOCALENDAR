/**
 * Serviço de importação de planilhas Excel do Vagaro
 * Suporta importação de Clientes e Agendamentos
 */

const XLSX = require('xlsx');
const { normalizePhone } = require('./phoneNormalizer');
const { findDuplicateClient, findDuplicateAppointment } = require('./dedupService');
const { format, parse } = require('date-fns');
const { zonedTimeToUtc } = require('date-fns-tz');

/**
 * Lê arquivo Excel e retorna dados estruturados
 * @param {Buffer} buffer - Buffer do arquivo Excel
 * @param {string} sheetName - Nome da planilha (opcional)
 * @returns {Array<object>} - Array de objetos representando linhas
 */
function readExcelFile(buffer, sheetName = null) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = sheetName 
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];
    
    if (!sheet) {
      throw new Error(`Planilha não encontrada: ${sheetName || 'primeira planilha'}`);
    }

    // Converter para JSON com headers
    const data = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false // Manter como texto para parsing manual
    });

    return data;
  } catch (error) {
    throw new Error(`Erro ao ler arquivo Excel: ${error.message}`);
  }
}

/**
 * Detecta automaticamente mapeamento de colunas
 * @param {Array<object>} data - Dados da planilha
 * @param {string} type - 'clients' ou 'appointments'
 * @returns {object} - Mapeamento de colunas
 */
function detectColumnMapping(data, type) {
  if (!data || data.length === 0) {
    return {};
  }

  const firstRow = data[0];
  const headers = Object.keys(firstRow);
  const mapping = {};

  if (type === 'clients') {
    // Mapeamentos comuns para clientes Vagaro
    const patterns = {
      name: ['name', 'client name', 'customer name', 'nome', 'cliente'],
      email: ['email', 'e-mail', 'mail'],
      phone: ['phone', 'mobile', 'cell', 'telefone', 'celular'],
      birth_date: ['birth date', 'birthday', 'dob', 'data nascimento'],
      address: ['address', 'street', 'endereço'],
      city: ['city', 'cidade'],
      state: ['state', 'estado', 'uf'],
      zip_code: ['zip', 'postal', 'cep'],
      notes: ['notes', 'note', 'observações', 'obs'],
      external_id: ['id', 'client id', 'customer id', 'vagaro id']
    };

    for (const [field, possibleNames] of Object.entries(patterns)) {
      const found = headers.find(h => 
        possibleNames.some(p => h.toLowerCase().includes(p))
      );
      if (found) {
        mapping[field] = found;
      }
    }
  } else if (type === 'appointments') {
    // Mapeamentos comuns para agendamentos Vagaro
    const patterns = {
      client_name: ['client name', 'customer name', 'nome cliente', 'cliente'],
      date: ['date', 'appointment date', 'data'],
      time: ['time', 'start time', 'hora', 'horário'],
      end_time: ['end time', 'finish time', 'hora fim'],
      service: ['service', 'treatment', 'serviço'],
      title: ['title', 'description', 'título'],
      status: ['status', 'state', 'estado'],
      notes: ['notes', 'note', 'observações'],
      price: ['price', 'cost', 'valor', 'preço'],
      duration: ['duration', 'duração'],
      external_id: ['id', 'appointment id', 'booking id']
    };

    for (const [field, possibleNames] of Object.entries(patterns)) {
      const found = headers.find(h => 
        possibleNames.some(p => h.toLowerCase().includes(p))
      );
      if (found) {
        mapping[field] = found;
      }
    }
  }

  return mapping;
}

/**
 * Mapeia linha da planilha para objeto de cliente
 * @param {object} row - Linha da planilha
 * @param {object} mapping - Mapeamento de colunas
 * @returns {object|null} - Objeto de cliente ou null se inválido
 */
function mapRowToClient(row, mapping) {
  try {
    const client = {
      name: row[mapping.name] || null,
      email: row[mapping.email] || null,
      phone: row[mapping.phone] || null,
      phone_normalized: null,
      birth_date: row[mapping.birth_date] || null,
      address: row[mapping.address] || null,
      city: row[mapping.city] || null,
      state: row[mapping.state] || null,
      zip_code: row[mapping.zip_code] || null,
      notes: row[mapping.notes] || null,
      external_source: 'vagaro',
      external_id: row[mapping.external_id] || null,
      last_import_date: new Date().toISOString()
    };

    // Validar campos obrigatórios
    if (!client.name) {
      return null;
    }

    // Normalizar telefone
    if (client.phone) {
      client.phone_normalized = normalizePhone(client.phone);
    }

    return client;
  } catch (error) {
    console.error('Erro ao mapear linha para cliente:', error);
    return null;
  }
}

/**
 * Mapeia linha da planilha para objeto de agendamento
 * @param {object} row - Linha da planilha
 * @param {object} mapping - Mapeamento de colunas
 * @param {string} timezone - Timezone padrão
 * @returns {object|null} - Objeto de agendamento ou null se inválido
 */
function mapRowToAppointment(row, mapping, timezone = 'America/Sao_Paulo') {
  try {
    const appointment = {
      client_name: row[mapping.client_name] || null,
      date: null,
      time: null,
      end_time: row[mapping.end_time] || null,
      service: row[mapping.service] || null,
      title: row[mapping.title] || row[mapping.service] || null,
      status: row[mapping.status] || 'scheduled',
      notes: row[mapping.notes] || null,
      price: row[mapping.price] || null,
      duration: row[mapping.duration] || 60,
      external_source: 'vagaro',
      external_id: row[mapping.external_id] || null,
      last_sync_date: new Date().toISOString()
    };

    // Validar campos obrigatórios
    if (!appointment.client_name) {
      return null;
    }

    // Parse de data
    if (row[mapping.date]) {
      try {
        // Tentar vários formatos comuns
        const dateStr = row[mapping.date];
        let parsedDate;

        if (dateStr.includes('/')) {
          // Formato DD/MM/YYYY ou MM/DD/YYYY
          parsedDate = parse(dateStr, 'MM/dd/yyyy', new Date());
          if (isNaN(parsedDate)) {
            parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
          }
        } else if (dateStr.includes('-')) {
          // Formato YYYY-MM-DD
          parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
        } else {
          parsedDate = new Date(dateStr);
        }

        if (!isNaN(parsedDate)) {
          appointment.date = format(parsedDate, 'yyyy-MM-dd');
        }
      } catch (error) {
        console.warn('Erro ao fazer parse de data:', row[mapping.date]);
      }
    }

    // Parse de horário
    if (row[mapping.time]) {
      try {
        const timeStr = row[mapping.time];
        // Normalizar formato de hora (HH:MM)
        const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const meridiem = timeMatch[3];

          if (meridiem) {
            if (meridiem.toLowerCase() === 'pm' && hours < 12) {
              hours += 12;
            } else if (meridiem.toLowerCase() === 'am' && hours === 12) {
              hours = 0;
            }
          }

          appointment.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      } catch (error) {
        console.warn('Erro ao fazer parse de horário:', row[mapping.time]);
      }
    }

    if (!appointment.date || !appointment.time) {
      return null;
    }

    return appointment;
  } catch (error) {
    console.error('Erro ao mapear linha para agendamento:', error);
    return null;
  }
}

/**
 * Importa clientes de arquivo Excel
 * @param {object} db - Instância do banco de dados
 * @param {Buffer} buffer - Buffer do arquivo Excel
 * @param {object} options - Opções de importação
 * @returns {Promise<object>} - Relatório de importação
 */
async function importClientsFromExcel(db, buffer, options = {}) {
  const {
    mapping = null,
    sheetName = null,
    skipDuplicates = false
  } = options;

  const report = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Ler arquivo Excel
    const data = readExcelFile(buffer, sheetName);
    report.total = data.length;

    // Detectar ou usar mapeamento fornecido
    const columnMapping = mapping || detectColumnMapping(data, 'clients');

    console.log('📊 Mapeamento de colunas:', columnMapping);
    console.log(`📋 Total de linhas a processar: ${data.length}`);

    // Processar cada linha
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Mapear linha para cliente
        const clientData = mapRowToClient(row, columnMapping);
        
        if (!clientData) {
          report.skipped++;
          report.errors.push({
            row: i + 2, // +2 porque Excel começa em 1 e tem header
            reason: 'Dados inválidos ou nome ausente'
          });
          continue;
        }

        // Verificar duplicata
        const duplicate = await findDuplicateClient(db, clientData);

        if (duplicate) {
          if (skipDuplicates) {
            report.skipped++;
            continue;
          }

          // Atualizar cliente existente
          const updateQuery = `
            UPDATE clients SET
              name = ?,
              email = ?,
              phone = ?,
              phone_normalized = ?,
              birth_date = ?,
              address = ?,
              city = ?,
              state = ?,
              zip_code = ?,
              notes = ?,
              external_source = ?,
              external_id = ?,
              last_import_date = ?
            WHERE id = ?
          `;

          await new Promise((resolve, reject) => {
            db.run(updateQuery, [
              clientData.name,
              clientData.email,
              clientData.phone,
              clientData.phone_normalized,
              clientData.birth_date,
              clientData.address,
              clientData.city,
              clientData.state,
              clientData.zip_code,
              clientData.notes,
              clientData.external_source,
              clientData.external_id,
              clientData.last_import_date,
              duplicate.id
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.updated++;
        } else {
          // Inserir novo cliente
          const insertQuery = `
            INSERT INTO clients (
              name, email, phone, phone_normalized, birth_date,
              address, city, state, zip_code, notes,
              external_source, external_id, last_import_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            db.run(insertQuery, [
              clientData.name,
              clientData.email,
              clientData.phone,
              clientData.phone_normalized,
              clientData.birth_date,
              clientData.address,
              clientData.city,
              clientData.state,
              clientData.zip_code,
              clientData.notes,
              clientData.external_source,
              clientData.external_id,
              clientData.last_import_date
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.created++;
        }
      } catch (error) {
        report.errors.push({
          row: i + 2,
          reason: error.message
        });
      }
    }

    return report;
  } catch (error) {
    throw new Error(`Erro na importação: ${error.message}`);
  }
}

/**
 * Importa agendamentos de arquivo Excel
 * @param {object} db - Instância do banco de dados
 * @param {Buffer} buffer - Buffer do arquivo Excel
 * @param {object} options - Opções de importação
 * @returns {Promise<object>} - Relatório de importação
 */
async function importAppointmentsFromExcel(db, buffer, options = {}) {
  const {
    mapping = null,
    sheetName = null,
    skipDuplicates = false,
    timezone = 'America/Sao_Paulo'
  } = options;

  const report = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Ler arquivo Excel
    const data = readExcelFile(buffer, sheetName);
    report.total = data.length;

    // Detectar ou usar mapeamento fornecido
    const columnMapping = mapping || detectColumnMapping(data, 'appointments');

    console.log('📊 Mapeamento de colunas:', columnMapping);
    console.log(`📋 Total de linhas a processar: ${data.length}`);

    // Processar cada linha
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Mapear linha para agendamento
        const appointmentData = mapRowToAppointment(row, columnMapping, timezone);
        
        if (!appointmentData) {
          report.skipped++;
          report.errors.push({
            row: i + 2,
            reason: 'Dados inválidos ou campos obrigatórios ausentes'
          });
          continue;
        }

        // Buscar client_id pelo nome
        const client = await new Promise((resolve, reject) => {
          db.get(
            'SELECT id FROM clients WHERE LOWER(name) = LOWER(?)',
            [appointmentData.client_name],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (client) {
          appointmentData.client_id = client.id;
        }

        // Verificar duplicata
        const duplicate = await findDuplicateAppointment(db, appointmentData);

        if (duplicate) {
          if (skipDuplicates) {
            report.skipped++;
            continue;
          }

          // Atualizar agendamento existente
          const updateQuery = `
            UPDATE appointments SET
              client_id = ?,
              client_name = ?,
              date = ?,
              time = ?,
              end_time = ?,
              service = ?,
              title = ?,
              status = ?,
              notes = ?,
              price = ?,
              duration = ?,
              external_source = ?,
              external_id = ?,
              last_sync_date = ?
            WHERE id = ?
          `;

          await new Promise((resolve, reject) => {
            db.run(updateQuery, [
              appointmentData.client_id,
              appointmentData.client_name,
              appointmentData.date,
              appointmentData.time,
              appointmentData.end_time,
              appointmentData.service,
              appointmentData.title,
              appointmentData.status,
              appointmentData.notes,
              appointmentData.price,
              appointmentData.duration,
              appointmentData.external_source,
              appointmentData.external_id,
              appointmentData.last_sync_date,
              duplicate.id
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.updated++;
        } else {
          // Inserir novo agendamento
          const insertQuery = `
            INSERT INTO appointments (
              client_id, client_name, date, time, end_time,
              service, title, status, notes, price, duration,
              external_source, external_id, last_sync_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            db.run(insertQuery, [
              appointmentData.client_id,
              appointmentData.client_name,
              appointmentData.date,
              appointmentData.time,
              appointmentData.end_time,
              appointmentData.service,
              appointmentData.title,
              appointmentData.status,
              appointmentData.notes,
              appointmentData.price,
              appointmentData.duration,
              appointmentData.external_source,
              appointmentData.external_id,
              appointmentData.last_sync_date
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          report.created++;
        }
      } catch (error) {
        report.errors.push({
          row: i + 2,
          reason: error.message
        });
      }
    }

    return report;
  } catch (error) {
    throw new Error(`Erro na importação: ${error.message}`);
  }
}

/**
 * Preview de 10 primeiras linhas do Excel
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} type - 'clients' ou 'appointments'
 * @param {string} sheetName - Nome da planilha (opcional)
 * @returns {object} - Preview com headers, mapping e primeiras linhas
 */
function previewExcelFile(buffer, type, sheetName = null) {
  try {
    const data = readExcelFile(buffer, sheetName);
    const mapping = detectColumnMapping(data, type);
    
    return {
      headers: Object.keys(data[0] || {}),
      suggestedMapping: mapping,
      preview: data.slice(0, 10),
      totalRows: data.length
    };
  } catch (error) {
    throw new Error(`Erro ao fazer preview: ${error.message}`);
  }
}

module.exports = {
  importClientsFromExcel,
  importAppointmentsFromExcel,
  previewExcelFile,
  readExcelFile,
  detectColumnMapping,
  mapRowToClient,
  mapRowToAppointment
};
