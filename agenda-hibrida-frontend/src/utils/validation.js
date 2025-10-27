/**
 * Utilitários de Validação
 * Sistema completo de validação de formulários com feedback em tempo real
 */

/**
 * Validar formato de email
 * @param {string} email - Email para validar
 * @returns {object} { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: true, message: '' }; // Campo opcional
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = regex.test(email);

  return {
    valid,
    message: valid ? '' : 'Email inválido. Use formato: exemplo@dominio.com'
  };
};

/**
 * Validar formato de telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {object} { valid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { valid: true, message: '' }; // Campo opcional
  }

  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
  const valid = cleanPhone.length === 10 || cleanPhone.length === 11;

  return {
    valid,
    message: valid ? '' : 'Telefone inválido. Use: (11) 98765-4321 ou (11) 3456-7890'
  };
};

/**
 * Normalizar telefone para formato E.164
 * @param {string} phone - Telefone para normalizar
 * @returns {string} Telefone normalizado (+5511999999999)
 */
export const normalizePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    // Fixo: (11) 3456-7890 -> +551134567890
    return `+55${cleanPhone}`;
  } else if (cleanPhone.length === 11) {
    // Celular: (11) 98765-4321 -> +5511987654321
    return `+55${cleanPhone}`;
  }
  
  return phone; // Retorna original se inválido
};

/**
 * Validar nome (mínimo 2 caracteres)
 * @param {string} name - Nome para validar
 * @returns {object} { valid: boolean, message: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'Nome é obrigatório' };
  }

  if (name.trim().length < 2) {
    return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
  }

  return { valid: true, message: '' };
};

/**
 * Validar data (não pode ser no passado)
 * @param {string} date - Data para validar (ISO string)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateFutureDate = (date) => {
  if (!date || date.trim() === '') {
    return { valid: false, message: 'Data é obrigatória' };
  }

  const dateObj = new Date(date);
  const now = new Date();

  // Comparar apenas datas, ignorando horas
  dateObj.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (dateObj < now) {
    return { valid: false, message: 'Data não pode ser no passado' };
  }

  return { valid: true, message: '' };
};

/**
 * Validar período (data fim deve ser depois de data início)
 * @param {string} startDate - Data início (ISO string)
 * @param {string} endDate - Data fim (ISO string)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: false, message: 'Datas de início e fim são obrigatórias' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return { valid: false, message: 'Horário de término deve ser posterior ao início' };
  }

  // Validar duração mínima (30 minutos)
  const durationMs = end - start;
  const durationMinutes = durationMs / (1000 * 60);

  if (durationMinutes < 30) {
    return { valid: false, message: 'Duração mínima é de 30 minutos' };
  }

  // Validar duração máxima (12 horas)
  const durationHours = durationMinutes / 60;
  if (durationHours > 12) {
    return { valid: false, message: 'Duração máxima é de 12 horas' };
  }

  return { valid: true, message: '' };
};

/**
 * Validar horário comercial (8h-22h)
 * @param {string} datetime - Data e hora (ISO string)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateBusinessHours = (datetime) => {
  if (!datetime) {
    return { valid: true, message: '' };
  }

  const date = new Date(datetime);
  const hour = date.getHours();

  if (hour < 8 || hour >= 22) {
    return { valid: false, message: 'Horário fora do comercial (8h-22h)' };
  }

  return { valid: true, message: '' };
};

/**
 * Validar campo obrigatório (não vazio)
 * @param {any} value - Valor para validar
 * @param {string} fieldName - Nome do campo (para mensagem)
 * @returns {object} { valid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = 'Campo') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} é obrigatório` };
  }

  return { valid: true, message: '' };
};

/**
 * Validar arquivo (tipo e tamanho)
 * @param {File} file - Arquivo para validar
 * @param {Array<string>} allowedTypes - Tipos permitidos (ex: ['image/jpeg', 'image/png'])
 * @param {number} maxSizeMB - Tamanho máximo em MB
 * @returns {object} { valid: boolean, message: string }
 */
export const validateFile = (file, allowedTypes = [], maxSizeMB = 20) => {
  if (!file) {
    return { valid: false, message: 'Nenhum arquivo selecionado' };
  }

  // Validar tipo
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const typesStr = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return { valid: false, message: `Tipo de arquivo inválido. Permitidos: ${typesStr}` };
  }

  // Validar tamanho
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return { valid: false, message: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` };
  }

  return { valid: true, message: '' };
};

/**
 * Validar dimensões mínimas de imagem
 * @param {File} file - Arquivo de imagem
 * @param {number} minWidth - Largura mínima em pixels
 * @param {number} minHeight - Altura mínima em pixels
 * @returns {Promise<object>} { valid: boolean, message: string }
 */
export const validateImageDimensions = (file, minWidth = 800, minHeight = 600) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          message: `Imagem muito pequena. Mínimo: ${minWidth}x${minHeight}px`
        });
      } else {
        resolve({ valid: true, message: '' });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, message: 'Erro ao carregar imagem' });
    };

    img.src = url;
  });
};

/**
 * Validar preço (número positivo)
 * @param {number|string} price - Preço para validar
 * @returns {object} { valid: boolean, message: string }
 */
export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) {
    return { valid: true, message: '' }; // Campo opcional
  }

  const priceNum = parseFloat(price);

  if (isNaN(priceNum)) {
    return { valid: false, message: 'Preço inválido' };
  }

  if (priceNum < 0) {
    return { valid: false, message: 'Preço não pode ser negativo' };
  }

  if (priceNum > 100000) {
    return { valid: false, message: 'Preço muito alto (máx: R$ 100.000)' };
  }

  return { valid: true, message: '' };
};

/**
 * Validar formulário completo de cliente
 * @param {object} clientData - Dados do cliente
 * @param {Array} existingClients - Clientes existentes (para verificar duplicatas)
 * @returns {object} { valid: boolean, errors: object }
 */
export const validateClientForm = (clientData, existingClients = []) => {
  const errors = {};

  // Nome obrigatório
  const nameValidation = validateName(clientData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.message;
  }

  // Email opcional mas deve ser válido se preenchido
  if (clientData.email) {
    const emailValidation = validateEmail(clientData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.message;
    }
  }

  // Telefone opcional mas deve ser válido se preenchido
  if (clientData.phone) {
    const phoneValidation = validatePhone(clientData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message;
    } else {
      // Verificar duplicata
      const duplicate = existingClients.some(
        c => c.phone === clientData.phone && c.id !== clientData.id
      );
      if (duplicate) {
        errors.phone = 'Já existe um cliente com este telefone';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validar formulário completo de agendamento
 * @param {object} appointmentData - Dados do agendamento
 * @returns {object} { valid: boolean, errors: object }
 */
export const validateAppointmentForm = (appointmentData) => {
  const errors = {};

  // Título obrigatório
  const titleValidation = validateRequired(appointmentData.title, 'Título');
  if (!titleValidation.valid) {
    errors.title = titleValidation.message;
  }

  // Cliente obrigatório
  const clientValidation = validateRequired(appointmentData.client_id, 'Cliente');
  if (!clientValidation.valid) {
    errors.client = 'Você precisa selecionar um cliente';
  }

  // Data início obrigatória e não pode ser no passado
  if (!appointmentData.start_datetime) {
    errors.start = 'Data e hora de início são obrigatórias';
  } else {
    const futureDateValidation = validateFutureDate(appointmentData.start_datetime);
    if (!futureDateValidation.valid) {
      errors.start = futureDateValidation.message;
    }

    // Validar horário comercial
    const businessHoursValidation = validateBusinessHours(appointmentData.start_datetime);
    if (!businessHoursValidation.valid) {
      errors.start = businessHoursValidation.message;
    }
  }

  // Data fim obrigatória
  if (!appointmentData.end_datetime) {
    errors.end = 'Data e hora de término são obrigatórias';
  }

  // Validar período
  if (appointmentData.start_datetime && appointmentData.end_datetime) {
    const rangeValidation = validateDateRange(
      appointmentData.start_datetime,
      appointmentData.end_datetime
    );
    if (!rangeValidation.valid) {
      errors.end = rangeValidation.message;
    }
  }

  // Preço estimado opcional
  if (appointmentData.estimated_price) {
    const priceValidation = validatePrice(appointmentData.estimated_price);
    if (!priceValidation.valid) {
      errors.price = priceValidation.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Formatar telefone brasileiro para exibição
 * @param {string} phone - Telefone para formatar
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 10) {
    // Fixo: (11) 3456-7890
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11) {
    // Celular: (11) 98765-4321
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  }

  return phone; // Retorna original se não corresponder aos formatos
};

/**
 * Formatar preço para exibição
 * @param {number} price - Preço para formatar
 * @returns {string} Preço formatado (R$ 1.234,56)
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

