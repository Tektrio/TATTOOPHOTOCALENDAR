/**
 * Utility for API retry logic and error handling
 * Provides resilient API calls with automatic retries and fallback to cache
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get cached data from localStorage
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
export const getFromCache = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit para: ${key}`);
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('Erro ao ler cache:', error);
    return null;
  }
};

/**
 * Save data to cache in localStorage
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const saveToCache = (key, data) => {
  try {
    const cached = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cached));
    console.log(`💾 Dados salvos no cache: ${key}`);
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
};

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ Cache limpo: ${key}`);
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};

/**
 * Clear all cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'api:clients')
 */
export const clearCachePattern = (pattern) => {
  try {
    const keys = Object.keys(localStorage);
    const matchingKeys = keys.filter(key => key.startsWith(pattern));
    matchingKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cache limpo (${matchingKeys.length} entradas): ${pattern}*`);
  } catch (error) {
    console.error('Erro ao limpar cache por padrão:', error);
  }
};

/**
 * Fetch with automatic retry logic
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} attempt - Current attempt number (internal)
 * @returns {Promise<Response>}
 */
export const fetchWithRetry = async (url, options = {}, attempt = 1) => {
  try {
    console.log(`🔄 Tentativa ${attempt} de ${RETRY_ATTEMPTS}: ${url}`);
    const response = await fetch(url, options);

    // If successful, return response
    if (response.ok) {
      console.log(`✅ Sucesso na tentativa ${attempt}: ${url}`);
      return response;
    }

    // If client error (4xx), don't retry
    if (response.status >= 400 && response.status < 500) {
      console.log(`⚠️ Erro de cliente (${response.status}), não retentar: ${url}`);
      return response;
    }

    // Server error (5xx), retry
    throw new Error(`Server error: ${response.status}`);
  } catch (error) {
    console.error(`❌ Erro na tentativa ${attempt}: ${error.message}`);

    // If max attempts reached, throw error
    if (attempt >= RETRY_ATTEMPTS) {
      console.error(`❌ Todas as ${RETRY_ATTEMPTS} tentativas falharam para: ${url}`);
      throw new Error(`Falha após ${RETRY_ATTEMPTS} tentativas: ${error.message}`);
    }

    // Wait before retrying (exponential backoff)
    const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
    console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
    await sleep(delay);

    // Retry
    return fetchWithRetry(url, options, attempt + 1);
  }
};

/**
 * GET request with retry and cache fallback
 * @param {string} endpoint - API endpoint (e.g., '/api/clients')
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} Response data
 */
export const apiGet = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const cacheKey = `api:${endpoint}`;

  try {
    // Try to fetch from API with retry
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // If response is OK, parse JSON and cache it
    if (response.ok) {
      const data = await response.json();
      saveToCache(cacheKey, data);
      return { data, fromCache: false };
    }

    // If response is not OK, try cache
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.warn(`⚠️ API falhou, tentando cache: ${endpoint}`);

    // Try to get from cache
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 Usando dados do cache: ${endpoint}`);
      return { data: cached, fromCache: true };
    }

    // No cache available, throw error
    throw new Error(`API e cache falharam: ${error.message}`);
  }
};

/**
 * POST request with retry
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} Response data
 */
export const apiPost = async (endpoint, body, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body),
      ...options
    });

    if (response.ok) {
      const data = await response.json();
      // Invalidate related cache
      const cachePrefix = endpoint.split('/')[2]; // e.g., 'clients' from '/api/clients'
      clearCachePattern(`api:/api/${cachePrefix}`);
      return { data, fromCache: false };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    throw new Error(`POST falhou: ${error.message}`);
  }
};

/**
 * PUT request with retry
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} Response data
 */
export const apiPut = async (endpoint, body, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body),
      ...options
    });

    if (response.ok) {
      const data = await response.json();
      // Invalidate related cache
      const cachePrefix = endpoint.split('/')[2];
      clearCachePattern(`api:/api/${cachePrefix}`);
      return { data, fromCache: false };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    throw new Error(`PUT falhou: ${error.message}`);
  }
};

/**
 * DELETE request with retry
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<object>} Response data
 */
export const apiDelete = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (response.ok) {
      const data = await response.json();
      // Invalidate related cache
      const cachePrefix = endpoint.split('/')[2];
      clearCachePattern(`api:/api/${cachePrefix}`);
      return { data, fromCache: false };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    throw new Error(`DELETE falhou: ${error.message}`);
  }
};

/**
 * Format error message for user display
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  const message = error.message || 'Erro desconhecido';

  // Network errors
  if (message.includes('Failed to fetch') || message.includes('Network')) {
    return '❌ Sem conexão com o servidor. Verifique sua internet e tente novamente.';
  }

  // Retry errors
  if (message.includes('Falha após')) {
    return '❌ Não foi possível conectar ao servidor após várias tentativas. Tente novamente mais tarde.';
  }

  // HTTP errors
  if (message.includes('HTTP 401')) {
    return '❌ Sessão expirada. Faça login novamente.';
  }
  if (message.includes('HTTP 403')) {
    return '❌ Você não tem permissão para realizar esta ação.';
  }
  if (message.includes('HTTP 404')) {
    return '❌ Recurso não encontrado.';
  }
  if (message.includes('HTTP 500')) {
    return '❌ Erro no servidor. Tente novamente mais tarde.';
  }

  // Validation errors
  if (message.includes('validação') || message.includes('inválido')) {
    return `⚠️ ${message}`;
  }

  // Default
  return `❌ ${message}`;
};

/**
 * Handle API error and show user-friendly message
 * @param {Error} error - Error object
 * @param {Function} showToast - Toast notification function
 */
export const handleApiError = (error, showToast) => {
  const friendlyMessage = formatErrorMessage(error);
  console.error('API Error:', error);
  if (showToast) {
    showToast(friendlyMessage, { type: 'error' });
  }
  return friendlyMessage;
};

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  fetchWithRetry,
  getFromCache,
  saveToCache,
  clearCache,
  clearCachePattern,
  formatErrorMessage,
  handleApiError
};

