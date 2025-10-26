/**
 * Serviço de deduplicação de registros
 * Implementa regras para evitar duplicatas em clientes e agendamentos
 */

const { normalizePhone, comparePhones } = require('./phoneNormalizer');
const crypto = require('crypto');

/**
 * Encontra cliente duplicado por telefone normalizado
 * @param {object} db - Instância do banco de dados SQLite
 * @param {string} phone - Telefone a buscar
 * @param {string} name - Nome do cliente (opcional, para confirmar)
 * @returns {Promise<object|null>} - Cliente encontrado ou null
 */
async function findDuplicateClientByPhone(db, phone, name = null) {
  const normalized = normalizePhone(phone);
  
  if (!normalized) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const query = name
      ? 'SELECT * FROM clients WHERE phone_normalized = ? OR (LOWER(name) = LOWER(?) AND phone LIKE ?)'
      : 'SELECT * FROM clients WHERE phone_normalized = ?';
    
    const params = name 
      ? [normalized, name, `%${phone.slice(-4)}%`]
      : [normalized];

    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

/**
 * Encontra cliente duplicado por ID externo
 * @param {object} db - Instância do banco de dados SQLite
 * @param {string} externalSource - Fonte externa (ex: 'vagaro', 'google')
 * @param {string} externalId - ID na fonte externa
 * @returns {Promise<object|null>}
 */
async function findDuplicateClientByExternalId(db, externalSource, externalId) {
  if (!externalSource || !externalId) {
    return null;
  }

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM clients WHERE external_source = ? AND external_id = ?',
      [externalSource, externalId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Encontra cliente duplicado (usando múltiplos critérios)
 * @param {object} db - Instância do banco de dados
 * @param {object} clientData - Dados do cliente
 * @returns {Promise<object|null>}
 */
async function findDuplicateClient(db, clientData) {
  // 1. Tentar por external_id primeiro (mais confiável)
  if (clientData.external_source && clientData.external_id) {
    const byExternal = await findDuplicateClientByExternalId(
      db,
      clientData.external_source,
      clientData.external_id
    );
    if (byExternal) return byExternal;
  }

  // 2. Tentar por telefone normalizado
  if (clientData.phone) {
    const byPhone = await findDuplicateClientByPhone(
      db,
      clientData.phone,
      clientData.name
    );
    if (byPhone) return byPhone;
  }

  // 3. Tentar por email (se fornecido)
  if (clientData.email) {
    const byEmail = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM clients WHERE LOWER(email) = LOWER(?)',
        [clientData.email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
    if (byEmail) return byEmail;
  }

  return null;
}

/**
 * Gera hash único para um agendamento
 * @param {object} appointmentData - Dados do agendamento
 * @returns {string} - Hash MD5
 */
function generateAppointmentHash(appointmentData) {
  const {
    client_id,
    client_name,
    date,
    time,
    service,
    title
  } = appointmentData;

  const hashString = [
    client_id || client_name || '',
    date || '',
    time || '',
    service || title || ''
  ].join('|').toLowerCase();

  return crypto.createHash('md5').update(hashString).digest('hex');
}

/**
 * Encontra agendamento duplicado por ID externo
 * @param {object} db - Instância do banco de dados
 * @param {string} externalSource - Fonte externa
 * @param {string} externalId - ID na fonte externa
 * @returns {Promise<object|null>}
 */
async function findDuplicateAppointmentByExternalId(db, externalSource, externalId) {
  if (!externalSource || !externalId) {
    return null;
  }

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM appointments WHERE external_source = ? AND external_id = ?',
      [externalSource, externalId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Encontra agendamento duplicado por Google Event ID
 * @param {object} db - Instância do banco de dados
 * @param {string} googleEventId - ID do evento do Google Calendar
 * @returns {Promise<object|null>}
 */
async function findDuplicateAppointmentByGoogleEventId(db, googleEventId) {
  if (!googleEventId) {
    return null;
  }

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM appointments WHERE google_event_id = ?',
      [googleEventId],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Encontra agendamento duplicado por iCal UID
 * @param {object} db - Instância do banco de dados
 * @param {string} icalUid - UID do evento iCal
 * @returns {Promise<object|null>}
 */
async function findDuplicateAppointmentByIcalUid(db, icalUid) {
  if (!icalUid) {
    return null;
  }

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM appointments WHERE ical_uid = ?',
      [icalUid],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

/**
 * Encontra agendamento duplicado (usando múltiplos critérios)
 * @param {object} db - Instância do banco de dados
 * @param {object} appointmentData - Dados do agendamento
 * @returns {Promise<object|null>}
 */
async function findDuplicateAppointment(db, appointmentData) {
  // 1. Tentar por google_event_id
  if (appointmentData.google_event_id) {
    const byGoogleId = await findDuplicateAppointmentByGoogleEventId(
      db,
      appointmentData.google_event_id
    );
    if (byGoogleId) return byGoogleId;
  }

  // 2. Tentar por ical_uid
  if (appointmentData.ical_uid) {
    const byIcalUid = await findDuplicateAppointmentByIcalUid(
      db,
      appointmentData.ical_uid
    );
    if (byIcalUid) return byIcalUid;
  }

  // 3. Tentar por external_id
  if (appointmentData.external_source && appointmentData.external_id) {
    const byExternal = await findDuplicateAppointmentByExternalId(
      db,
      appointmentData.external_source,
      appointmentData.external_id
    );
    if (byExternal) return byExternal;
  }

  // 4. Tentar por hash (cliente + data + horário)
  if (appointmentData.client_id || appointmentData.client_name) {
    const hash = generateAppointmentHash(appointmentData);
    const byHash = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM appointments 
         WHERE (client_id = ? OR LOWER(client_name) = LOWER(?))
         AND date = ? 
         AND time = ?`,
        [
          appointmentData.client_id || 0,
          appointmentData.client_name || '',
          appointmentData.date,
          appointmentData.time
        ],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
    if (byHash) return byHash;
  }

  return null;
}

/**
 * Calcula similaridade entre dois nomes (algoritmo simples)
 * @param {string} name1 - Primeiro nome
 * @param {string} name2 - Segundo nome
 * @returns {number} - Score de 0 a 1
 */
function calculateNameSimilarity(name1, name2) {
  if (!name1 || !name2) return 0;
  
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();
  
  if (n1 === n2) return 1;
  
  // Algoritmo simples: contar palavras em comum
  const words1 = n1.split(/\s+/);
  const words2 = n2.split(/\s+/);
  
  const common = words1.filter(w => words2.includes(w)).length;
  const total = Math.max(words1.length, words2.length);
  
  return common / total;
}

module.exports = {
  findDuplicateClient,
  findDuplicateClientByPhone,
  findDuplicateClientByExternalId,
  findDuplicateAppointment,
  findDuplicateAppointmentByExternalId,
  findDuplicateAppointmentByGoogleEventId,
  findDuplicateAppointmentByIcalUid,
  generateAppointmentHash,
  calculateNameSimilarity
};
