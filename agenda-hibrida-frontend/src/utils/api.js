/**
 * Utilitários de API
 * Sistema robusto de requisições com retry automático e tratamento de erros
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Delay helper para retry
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Verificar se é erro de rede
 */
const isNetworkError = (error) => {
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ENETUNREACH' ||
    error.message === 'Network Error'
  );
};

/**
 * Obter mensagem de erro amigável baseada no status HTTP
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'Erro desconhecido. Tente novamente.';
  }

  // Erro de rede (sem conexão)
  if (isNetworkError(error)) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }

  // Erro com resposta do servidor
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Mensagem customizada do backend
    if (data && data.message) {
      return data.message;
    }

    // Mensagens padrão por status
    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique os campos e tente novamente.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito de dados. Este registro já existe.';
      case 422:
        return 'Dados não processáveis. Verifique os campos obrigatórios.';
      case 429:
        return 'Muitas requisições. Aguarde um momento e tente novamente.';
      case 500:
        return 'Erro no servidor. Tente novamente em alguns instantes.';
      case 502:
        return 'Servidor temporariamente indisponível. Tente novamente.';
      case 503:
        return 'Serviço em manutenção. Tente novamente em breve.';
      case 504:
        return 'Tempo esgotado. Tente novamente.';
      default:
        return `Erro ${status}. Tente novamente.`;
    }
  }

  // Erro genérico
  return error.message || 'Erro ao processar requisição. Tente novamente.';
};

/**
 * Fetch com retry automático e tratamento de erros robusto
 * 
 * @param {string} url - URL da requisição
 * @param {object} options - Opções do fetch (method, headers, body, etc)
 * @param {object} config - Configurações adicionais
 * @param {number} config.retries - Número de tentativas (padrão: 3)
 * @param {number} config.timeout - Timeout em ms (padrão: 10000)
 * @param {boolean} config.showErrorToast - Exibir toast de erro automaticamente (padrão: false)
 * @returns {Promise<Response>}
 */
export const fetchWithRetry = async (url, options = {}, config = {}) => {
  const {
    retries = 3,
    timeout = 10000,
    showErrorToast = false
  } = config;

  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Fazer requisição
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Se não for 2xx, lançar erro
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.response = response;
        throw error;
      }

      return response;

    } catch (error) {
      lastError = error;

      // Se for timeout
      if (error.name === 'AbortError') {
        lastError.message = 'Operação demorou muito. Tente novamente.';
      }

      // Se não é erro de rede ou última tentativa, não retry
      if (!isNetworkError(error) || attempt === retries - 1) {
        break;
      }

      // Backoff exponencial: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`Tentativa ${attempt + 1}/${retries} falhou. Aguardando ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  const errorMessage = getErrorMessage(lastError);
  
  if (showErrorToast && window.toast) {
    window.toast.error(errorMessage);
  }

  throw lastError;
};

/**
 * GET request com retry
 */
export const apiGet = async (endpoint, config = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }, config);

  return await response.json();
};

/**
 * POST request com retry
 */
export const apiPost = async (endpoint, data, config = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }, config);

  return await response.json();
};

/**
 * PUT request com retry
 */
export const apiPut = async (endpoint, data, config = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }, config);

  return await response.json();
};

/**
 * DELETE request com retry
 */
export const apiDelete = async (endpoint, config = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }, config);

  // DELETE pode não retornar body
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Upload de arquivo com progress e retry
 */
export const apiUpload = async (endpoint, file, onProgress, config = {}) => {
  const url = `${API_URL}${endpoint}`;
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    // Load
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          resolve(xhr.responseText);
        }
      } else {
        const error = new Error(`HTTP ${xhr.status}`);
        error.response = {
          status: xhr.status,
          data: xhr.responseText
        };
        reject(error);
      }
    });

    // Error
    xhr.addEventListener('error', () => {
      reject(new Error('Network Error'));
    });

    // Timeout
    xhr.timeout = config.timeout || 120000; // 2 min para uploads
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'));
    });

    // Send
    xhr.open('POST', url);
    xhr.send(formData);
  });
};

/**
 * Interceptor para adicionar toast global em window
 * Deve ser chamado no App.jsx após Toaster estar disponível
 */
export const setupToastInterceptor = (toastInstance) => {
  window.toast = toastInstance;
};

export default {
  fetchWithRetry,
  getErrorMessage,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiUpload,
  setupToastInterceptor
};

