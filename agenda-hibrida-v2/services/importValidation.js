/**
 * Serviço de Validação Avançada para Importação
 * Valida telefones, emails, datas e detecta duplicatas
 */

const { normalizePhone, comparePhones } = require('./phoneNormalizer');
const { findDuplicateClient, findDuplicateAppointment } = require('./dedupService');
const { parse, isValid, isFuture, parseISO, format } = require('date-fns');

/**
 * Validar formato de email
 * @param {string} email - Email para validar
 * @returns {object} { valid: boolean, message: string, normalized: string }
 */
function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: true, message: '', normalized: null };
  }

  const trimmed = email.trim().toLowerCase();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!regex.test(trimmed)) {
    return { 
      valid: false, 
      message: 'Formato de email inválido',
      normalized: null
    };
  }

  // Validações adicionais
  const [localPart, domain] = trimmed.split('@');
  
  if (localPart.length > 64) {
    return { 
      valid: false, 
      message: 'Parte local do email muito longa (máx 64 caracteres)',
      normalized: null
    };
  }

  if (domain.length > 255) {
    return { 
      valid: false, 
      message: 'Domínio do email muito longo (máx 255 caracteres)',
      normalized: null
    };
  }

  // Lista de domínios suspeitos/temporários
  const suspiciousDomains = [
    'test.com', 'example.com', 'temp-mail.com', 'throwaway.email',
    'guerrillamail.com', '10minutemail.com'
  ];

  if (suspiciousDomains.some(d => domain.includes(d))) {
    return {
      valid: true,
      message: 'Domínio de email temporário detectado',
      normalized: trimmed,
      warning: true
    };
  }

  return { 
    valid: true, 
    message: '', 
    normalized: trimmed 
  };
}

/**
 * Validar telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {object} { valid: boolean, message: string, normalized: string }
 */
function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: true, message: '', normalized: null };
  }

  try {
    const normalized = normalizePhone(phone);
    
    // Validar formato brasileiro +55 XX XXXXX-XXXX ou +55 XX XXXX-XXXX
    if (!normalized.startsWith('+55')) {
      return {
        valid: false,
        message: 'Telefone deve ser brasileiro (DDD + número)',
        normalized: null
      };
    }

    const cleanPhone = normalized.replace('+55', '');
    
    // Celular: 11 dígitos (DDD + 9 + 8 dígitos)
    // Fixo: 10 dígitos (DDD + 8 dígitos)
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      return {
        valid: false,
        message: 'Telefone deve ter 10 (fixo) ou 11 (celular) dígitos após DDD',
        normalized: null
      };
    }

    // Validar DDD (11-99)
    const ddd = parseInt(cleanPhone.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return {
        valid: false,
        message: 'DDD inválido (deve estar entre 11 e 99)',
        normalized: null
      };
    }

    // Celular deve começar com 9
    if (cleanPhone.length === 11 && cleanPhone[2] !== '9') {
      return {
        valid: false,
        message: 'Celular deve começar com 9 após o DDD',
        normalized: null
      };
    }

    // Validar números repetidos ou sequenciais
    const numberPart = cleanPhone.length === 11 
      ? cleanPhone.substring(3) 
      : cleanPhone.substring(2);
    
    if (/^(\d)\1+$/.test(numberPart)) {
      return {
        valid: true,
        message: 'Telefone com todos os dígitos iguais (suspeito)',
        normalized,
        warning: true
      };
    }

    return { 
      valid: true, 
      message: '', 
      normalized 
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar telefone: ${error.message}`,
      normalized: null
    };
  }
}

/**
 * Validar data
 * @param {string} dateStr - Data para validar
 * @param {object} options - Opções { allowPast: boolean, allowFuture: boolean }
 * @returns {object} { valid: boolean, message: string, normalized: string }
 */
function validateDate(dateStr, options = {}) {
  const { allowPast = true, allowFuture = true } = options;

  if (!dateStr || dateStr.trim() === '') {
    return { valid: false, message: 'Data é obrigatória', normalized: null };
  }

  try {
    // Tentar múltiplos formatos de data
    const formats = [
      'yyyy-MM-dd',
      'dd/MM/yyyy',
      'MM/dd/yyyy',
      'dd-MM-yyyy',
      'MM-dd-yyyy'
    ];

    let parsedDate = null;

    // Tentar parse direto (ISO)
    parsedDate = parseISO(dateStr);
    
    if (!isValid(parsedDate)) {
      // Tentar formatos personalizados
      for (const formatStr of formats) {
        try {
          parsedDate = parse(dateStr, formatStr, new Date());
          if (isValid(parsedDate)) break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!isValid(parsedDate)) {
      return {
        valid: false,
        message: 'Formato de data inválido. Use: YYYY-MM-DD, DD/MM/YYYY ou MM/DD/YYYY',
        normalized: null
      };
    }

    // Validar ano razoável (1900-2100)
    const year = parsedDate.getFullYear();
    if (year < 1900 || year > 2100) {
      return {
        valid: false,
        message: `Ano inválido: ${year}. Deve estar entre 1900 e 2100`,
        normalized: null
      };
    }

    // Validar se está no passado/futuro
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);

    if (!allowPast && parsedDate < now) {
      return {
        valid: false,
        message: 'Data não pode ser no passado',
        normalized: format(parsedDate, 'yyyy-MM-dd')
      };
    }

    if (!allowFuture && parsedDate > now) {
      return {
        valid: false,
        message: 'Data não pode ser no futuro',
        normalized: format(parsedDate, 'yyyy-MM-dd')
      };
    }

    // Avisar se data é muito antiga (> 5 anos atrás)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    if (parsedDate < fiveYearsAgo) {
      return {
        valid: true,
        message: 'Data muito antiga (mais de 5 anos atrás)',
        normalized: format(parsedDate, 'yyyy-MM-dd'),
        warning: true
      };
    }

    // Avisar se data é muito futura (> 2 anos à frente)
    const twoYearsAhead = new Date();
    twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
    
    if (parsedDate > twoYearsAhead) {
      return {
        valid: true,
        message: 'Data muito distante (mais de 2 anos à frente)',
        normalized: format(parsedDate, 'yyyy-MM-dd'),
        warning: true
      };
    }

    return { 
      valid: true, 
      message: '', 
      normalized: format(parsedDate, 'yyyy-MM-dd')
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar data: ${error.message}`,
      normalized: null
    };
  }
}

/**
 * Validar horário
 * @param {string} timeStr - Horário para validar (HH:MM ou HH:MM AM/PM)
 * @returns {object} { valid: boolean, message: string, normalized: string }
 */
function validateTime(timeStr) {
  if (!timeStr || timeStr.trim() === '') {
    return { valid: false, message: 'Horário é obrigatório', normalized: null };
  }

  try {
    // Parse de formato 12h ou 24h
    const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    
    if (!timeMatch) {
      return {
        valid: false,
        message: 'Formato de horário inválido. Use: HH:MM ou HH:MM AM/PM',
        normalized: null
      };
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3];

    // Converter 12h para 24h
    if (meridiem) {
      if (meridiem.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
      } else if (meridiem.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
    }

    // Validar intervalo
    if (hours < 0 || hours > 23) {
      return {
        valid: false,
        message: 'Hora inválida. Deve estar entre 00 e 23',
        normalized: null
      };
    }

    if (minutes < 0 || minutes > 59) {
      return {
        valid: false,
        message: 'Minutos inválidos. Devem estar entre 00 e 59',
        normalized: null
      };
    }

    // Avisar se horário está fora do comercial (7h-22h)
    if (hours < 7 || hours >= 22) {
      return {
        valid: true,
        message: 'Horário fora do expediente comercial (7h-22h)',
        normalized: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        warning: true
      };
    }

    return { 
      valid: true, 
      message: '', 
      normalized: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    };
  } catch (error) {
    return {
      valid: false,
      message: `Erro ao validar horário: ${error.message}`,
      normalized: null
    };
  }
}

/**
 * Validar cliente completo
 * @param {object} clientData - Dados do cliente
 * @param {object} db - Instância do banco de dados
 * @returns {Promise<object>} { valid: boolean, errors: [], warnings: [], normalized: {} }
 */
async function validateClient(clientData, db) {
  const errors = [];
  const warnings = [];
  const normalized = { ...clientData };

  // Validar nome (obrigatório)
  if (!clientData.name || clientData.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nome é obrigatório' });
  } else if (clientData.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres' });
  } else {
    normalized.name = clientData.name.trim();
  }

  // Validar email (opcional)
  if (clientData.email) {
    const emailValidation = validateEmail(clientData.email);
    if (!emailValidation.valid) {
      errors.push({ field: 'email', message: emailValidation.message });
    } else if (emailValidation.warning) {
      warnings.push({ field: 'email', message: emailValidation.message });
    }
    normalized.email = emailValidation.normalized;
  }

  // Validar telefone (opcional)
  if (clientData.phone) {
    const phoneValidation = validatePhone(clientData.phone);
    if (!phoneValidation.valid) {
      errors.push({ field: 'phone', message: phoneValidation.message });
    } else if (phoneValidation.warning) {
      warnings.push({ field: 'phone', message: phoneValidation.message });
    }
    normalized.phone_normalized = phoneValidation.normalized;
  }

  // Validar data de nascimento (opcional)
  if (clientData.birth_date) {
    const dateValidation = validateDate(clientData.birth_date, { 
      allowPast: true, 
      allowFuture: false 
    });
    if (!dateValidation.valid) {
      errors.push({ field: 'birth_date', message: dateValidation.message });
    }
    normalized.birth_date = dateValidation.normalized;
  }

  // Detectar duplicatas
  if (db && normalized.phone_normalized) {
    try {
      const duplicate = await findDuplicateClient(db, normalized);
      if (duplicate) {
        warnings.push({
          field: 'duplicate',
          message: `Cliente duplicado encontrado: ${duplicate.name} (ID: ${duplicate.id})`,
          duplicateId: duplicate.id,
          duplicateData: duplicate
        });
      }
    } catch (error) {
      console.warn('Erro ao verificar duplicata:', error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized
  };
}

/**
 * Validar agendamento completo
 * @param {object} appointmentData - Dados do agendamento
 * @param {object} db - Instância do banco de dados
 * @returns {Promise<object>} { valid: boolean, errors: [], warnings: [], normalized: {} }
 */
async function validateAppointment(appointmentData, db) {
  const errors = [];
  const warnings = [];
  const normalized = { ...appointmentData };

  // Validar nome do cliente (obrigatório)
  if (!appointmentData.client_name || appointmentData.client_name.trim() === '') {
    errors.push({ field: 'client_name', message: 'Nome do cliente é obrigatório' });
  } else {
    normalized.client_name = appointmentData.client_name.trim();
  }

  // Validar data (obrigatória)
  if (!appointmentData.date) {
    errors.push({ field: 'date', message: 'Data é obrigatória' });
  } else {
    const dateValidation = validateDate(appointmentData.date, { 
      allowPast: false, 
      allowFuture: true 
    });
    if (!dateValidation.valid) {
      errors.push({ field: 'date', message: dateValidation.message });
    } else if (dateValidation.warning) {
      warnings.push({ field: 'date', message: dateValidation.message });
    }
    normalized.date = dateValidation.normalized;
  }

  // Validar horário (obrigatório)
  if (!appointmentData.time) {
    errors.push({ field: 'time', message: 'Horário é obrigatório' });
  } else {
    const timeValidation = validateTime(appointmentData.time);
    if (!timeValidation.valid) {
      errors.push({ field: 'time', message: timeValidation.message });
    } else if (timeValidation.warning) {
      warnings.push({ field: 'time', message: timeValidation.message });
    }
    normalized.time = timeValidation.normalized;
  }

  // Validar horário fim (opcional)
  if (appointmentData.end_time) {
    const endTimeValidation = validateTime(appointmentData.end_time);
    if (!endTimeValidation.valid) {
      errors.push({ field: 'end_time', message: endTimeValidation.message });
    } else {
      normalized.end_time = endTimeValidation.normalized;

      // Validar que end_time > time
      if (normalized.time && normalized.end_time <= normalized.time) {
        errors.push({ 
          field: 'end_time', 
          message: 'Horário de término deve ser após o horário de início' 
        });
      }
    }
  }

  // Detectar duplicatas
  if (db && normalized.client_name && normalized.date && normalized.time) {
    try {
      const duplicate = await findDuplicateAppointment(db, normalized);
      if (duplicate) {
        warnings.push({
          field: 'duplicate',
          message: `Agendamento duplicado: ${duplicate.client_name} em ${duplicate.date} às ${duplicate.time}`,
          duplicateId: duplicate.id,
          duplicateData: duplicate
        });
      }
    } catch (error) {
      console.warn('Erro ao verificar duplicata:', error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized
  };
}

/**
 * Validar lote de dados
 * @param {Array} rows - Array de linhas de dados
 * @param {string} type - 'clients' ou 'appointments'
 * @param {object} mapping - Mapeamento de colunas
 * @param {object} db - Instância do banco de dados
 * @returns {Promise<Array>} Array de resultados de validação
 */
async function validateBatch(rows, type, mapping, db) {
  const validatedRows = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const data = {};

    // Mapear dados
    Object.keys(mapping).forEach(field => {
      if (mapping[field] && row[mapping[field]] !== undefined) {
        data[field] = row[mapping[field]];
      }
    });

    // Validar
    let validation;
    if (type === 'clients') {
      validation = await validateClient(data, db);
    } else if (type === 'appointments') {
      validation = await validateAppointment(data, db);
    } else {
      validation = { 
        valid: false, 
        errors: [{ field: 'type', message: 'Tipo inválido' }],
        warnings: [],
        normalized: data
      };
    }

    validatedRows.push({
      index: i,
      originalRow: row,
      ...validation
    });
  }

  return validatedRows;
}

module.exports = {
  validateEmail,
  validatePhone,
  validateDate,
  validateTime,
  validateClient,
  validateAppointment,
  validateBatch
};

