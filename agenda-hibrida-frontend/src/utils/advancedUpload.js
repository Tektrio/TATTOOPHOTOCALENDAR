/**
 * ⚡ Advanced Upload Utility
 * 
 * Sistema avançado de upload com:
 * - Upload em chunks (ideal para arquivos grandes)
 * - Progress tracking preciso
 * - Cancelamento de uploads
 * - Retry automático com exponential backoff
 * - Compressão de imagens antes do upload
 * - Upload múltiplo paralelo (limitado)
 * - Queue management
 */

import imageCompression from 'browser-image-compression';

const API_URL = 'http://localhost:3001';

// ============================================
// CONFIGURAÇÕES
// ============================================

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_PARALLEL_UPLOADS = 3; // Max uploads simultâneos
const MAX_RETRIES = 3; // Max tentativas de retry
const RETRY_DELAY_BASE = 1000; // Delay inicial para retry (1s)

// Configurações de compressão de imagens
const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8
};

// ============================================
// CLASSES DE UPLOAD
// ============================================

/**
 * Classe para gerenciar um upload individual
 */
export class UploadTask {
  constructor(file, options = {}) {
    this.file = file;
    this.options = {
      url: options.url || `${API_URL}/api/files/upload`,
      chunkSize: options.chunkSize || CHUNK_SIZE,
      metadata: options.metadata || {},
      onProgress: options.onProgress || (() => {}),
      onComplete: options.onComplete || (() => {}),
      onError: options.onError || (() => {}),
      compressImages: options.compressImages !== false, // Default true
      ...options
    };
    
    this.id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.status = 'pending'; // pending, uploading, paused, completed, failed, cancelled
    this.progress = 0;
    this.uploadedBytes = 0;
    this.totalBytes = file.size;
    this.retries = 0;
    this.error = null;
    this.startTime = null;
    this.endTime = null;
    
    // Controles
    this.abortController = null;
    this.isPaused = false;
  }

  /**
   * Comprimir imagem antes do upload
   */
  async compressImage() {
    if (!this.file.type.startsWith('image/')) {
      return this.file;
    }

    try {
      console.log(`🗜️ Comprimindo imagem: ${this.file.name}`);
      const compressedFile = await imageCompression(this.file, IMAGE_COMPRESSION_OPTIONS);
      
      const originalSize = (this.file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      const reduction = (((this.file.size - compressedFile.size) / this.file.size) * 100).toFixed(1);
      
      console.log(`✅ Compressão concluída: ${originalSize}MB → ${compressedSize}MB (${reduction}% redução)`);
      
      return compressedFile;
    } catch (error) {
      console.warn('⚠️ Erro ao comprimir imagem, usando arquivo original:', error);
      return this.file;
    }
  }

  /**
   * Iniciar upload
   */
  async start() {
    if (this.status === 'uploading' || this.status === 'completed') {
      return;
    }

    this.status = 'uploading';
    this.startTime = Date.now();
    this.error = null;

    try {
      // Comprimir imagem se necessário
      let fileToUpload = this.file;
      if (this.options.compressImages && this.file.type.startsWith('image/')) {
        fileToUpload = await this.compressImage();
        this.totalBytes = fileToUpload.size;
      }

      // Upload em chunks se arquivo > 5MB
      if (fileToUpload.size > 5 * 1024 * 1024) {
        await this.uploadInChunks(fileToUpload);
      } else {
        await this.uploadDirect(fileToUpload);
      }

      this.status = 'completed';
      this.progress = 100;
      this.endTime = Date.now();
      this.options.onComplete(this);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Upload direto (para arquivos pequenos)
   */
  async uploadDirect(file) {
    this.abortController = new AbortController();
    
    const formData = new FormData();
    formData.append('files', file);
    
    // Adicionar metadata
    Object.keys(this.options.metadata).forEach(key => {
      formData.append(key, this.options.metadata[key]);
    });

    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        this.uploadedBytes = e.loaded;
        this.progress = (e.loaded / e.total) * 100;
        this.options.onProgress(this);
      }
    });

    // Promise wrapper para XMLHttpRequest
    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', this.options.url);
      xhr.send(formData);

      // Permitir cancelamento
      this.abortController.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    });
  }

  /**
   * Upload em chunks (para arquivos grandes)
   */
  async uploadInChunks(file) {
    const totalChunks = Math.ceil(file.size / this.options.chunkSize);
    let uploadedChunks = 0;

    for (let i = 0; i < totalChunks; i++) {
      if (this.isPaused) {
        await this.waitForResume();
      }

      if (this.status === 'cancelled') {
        throw new Error('Upload cancelled');
      }

      const start = i * this.options.chunkSize;
      const end = Math.min(start + this.options.chunkSize, file.size);
      const chunk = file.slice(start, end);

      await this.uploadChunk(chunk, i, totalChunks);
      
      uploadedChunks++;
      this.uploadedBytes = end;
      this.progress = (uploadedChunks / totalChunks) * 100;
      this.options.onProgress(this);
    }
  }

  /**
   * Upload de um chunk individual
   */
  async uploadChunk(chunk, chunkIndex, totalChunks) {
    this.abortController = new AbortController();

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);
    formData.append('fileId', this.id);
    formData.append('fileName', this.file.name);
    
    // Adicionar metadata
    Object.keys(this.options.metadata).forEach(key => {
      formData.append(key, this.options.metadata[key]);
    });

    const response = await fetch(`${this.options.url}/chunk`, {
      method: 'POST',
      body: formData,
      signal: this.abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Pausar upload
   */
  pause() {
    this.isPaused = true;
    this.status = 'paused';
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Retomar upload
   */
  resume() {
    this.isPaused = false;
    this.status = 'uploading';
    this.start();
  }

  /**
   * Cancelar upload
   */
  cancel() {
    this.status = 'cancelled';
    this.isPaused = false;
    if (this.abortController) {
      this.abortController.abort();
    }
    this.options.onError(new Error('Upload cancelled by user'));
  }

  /**
   * Aguardar resumo
   */
  waitForResume() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.isPaused || this.status === 'cancelled') {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Tratar erro com retry automático
   */
  async handleError(error) {
    console.error(`❌ Erro no upload (tentativa ${this.retries + 1}):`, error);
    
    if (this.retries < MAX_RETRIES && error.message !== 'Upload cancelled') {
      this.retries++;
      const delay = RETRY_DELAY_BASE * Math.pow(2, this.retries - 1); // Exponential backoff
      
      console.log(`🔄 Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.start();
    }

    this.status = 'failed';
    this.error = error.message;
    this.options.onError(error);
  }

  /**
   * Obter velocidade de upload
   */
  getUploadSpeed() {
    if (!this.startTime || this.uploadedBytes === 0) {
      return 0;
    }

    const elapsed = (Date.now() - this.startTime) / 1000; // segundos
    return this.uploadedBytes / elapsed; // bytes/segundo
  }

  /**
   * Estimar tempo restante
   */
  getEstimatedTimeRemaining() {
    const speed = this.getUploadSpeed();
    if (speed === 0) {
      return null;
    }

    const remainingBytes = this.totalBytes - this.uploadedBytes;
    return remainingBytes / speed; // segundos
  }

  /**
   * Formatar velocidade de upload
   */
  getFormattedSpeed() {
    const speed = this.getUploadSpeed();
    
    if (speed === 0) return '0 B/s';
    if (speed < 1024) return `${speed.toFixed(0)} B/s`;
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`;
    return `${(speed / 1024 / 1024).toFixed(2)} MB/s`;
  }

  /**
   * Formatar tempo restante
   */
  getFormattedTimeRemaining() {
    const seconds = this.getEstimatedTimeRemaining();
    
    if (!seconds) return 'Calculando...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
}

// ============================================
// UPLOAD MANAGER
// ============================================

/**
 * Classe para gerenciar múltiplos uploads
 */
export class UploadManager {
  constructor(options = {}) {
    this.options = {
      maxParallelUploads: options.maxParallelUploads || MAX_PARALLEL_UPLOADS,
      onQueueUpdate: options.onQueueUpdate || (() => {}),
      ...options
    };
    
    this.queue = [];
    this.activeUploads = new Set();
    this.completedUploads = [];
    this.failedUploads = [];
  }

  /**
   * Adicionar arquivo(s) à fila
   */
  addFiles(files, options = {}) {
    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
      const task = new UploadTask(file, {
        ...options,
        onProgress: (task) => {
          this.options.onQueueUpdate(this.getStats());
          if (options.onProgress) options.onProgress(task);
        },
        onComplete: (task) => {
          this.handleTaskComplete(task);
          if (options.onComplete) options.onComplete(task);
        },
        onError: (error) => {
          this.handleTaskError(task, error);
          if (options.onError) options.onError(error);
        }
      });
      
      this.queue.push(task);
    });

    this.processQueue();
    this.options.onQueueUpdate(this.getStats());
  }

  /**
   * Processar fila de uploads
   */
  async processQueue() {
    while (this.queue.length > 0 && this.activeUploads.size < this.options.maxParallelUploads) {
      const task = this.queue.shift();
      this.activeUploads.add(task);
      task.start();
    }
  }

  /**
   * Tratar conclusão de tarefa
   */
  handleTaskComplete(task) {
    this.activeUploads.delete(task);
    this.completedUploads.push(task);
    this.processQueue();
    this.options.onQueueUpdate(this.getStats());
  }

  /**
   * Tratar erro de tarefa
   */
  handleTaskError(task, error) {
    this.activeUploads.delete(task);
    this.failedUploads.push(task);
    console.error(`Upload failed for ${task.file.name}:`, error);
    this.processQueue();
    this.options.onQueueUpdate(this.getStats());
  }

  /**
   * Pausar todos os uploads
   */
  pauseAll() {
    this.activeUploads.forEach(task => task.pause());
  }

  /**
   * Retomar todos os uploads
   */
  resumeAll() {
    this.activeUploads.forEach(task => task.resume());
  }

  /**
   * Cancelar todos os uploads
   */
  cancelAll() {
    this.queue = [];
    this.activeUploads.forEach(task => task.cancel());
    this.activeUploads.clear();
    this.options.onQueueUpdate(this.getStats());
  }

  /**
   * Cancelar upload específico
   */
  cancel(taskId) {
    // Procurar na fila
    const queueIndex = this.queue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      return;
    }

    // Procurar nos ativos
    const activeTask = Array.from(this.activeUploads).find(task => task.id === taskId);
    if (activeTask) {
      activeTask.cancel();
    }
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    const totalFiles = this.queue.length + this.activeUploads.size + 
                      this.completedUploads.length + this.failedUploads.length;
    
    const totalBytes = [...this.queue, ...this.activeUploads, ...this.completedUploads]
      .reduce((sum, task) => sum + task.totalBytes, 0);
    
    const uploadedBytes = [...this.activeUploads, ...this.completedUploads]
      .reduce((sum, task) => sum + task.uploadedBytes, 0);
    
    const overallProgress = totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0;

    return {
      totalFiles,
      queuedFiles: this.queue.length,
      activeUploads: this.activeUploads.size,
      completedFiles: this.completedUploads.length,
      failedFiles: this.failedUploads.length,
      totalBytes,
      uploadedBytes,
      overallProgress,
      queue: this.queue,
      active: Array.from(this.activeUploads),
      completed: this.completedUploads,
      failed: this.failedUploads
    };
  }

  /**
   * Limpar uploads completos
   */
  clearCompleted() {
    this.completedUploads = [];
    this.options.onQueueUpdate(this.getStats());
  }

  /**
   * Tentar novamente uploads falhados
   */
  retryFailed() {
    const failed = [...this.failedUploads];
    this.failedUploads = [];
    
    failed.forEach(task => {
      task.retries = 0;
      task.error = null;
      this.queue.push(task);
    });

    this.processQueue();
    this.options.onQueueUpdate(this.getStats());
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formatar tamanho de arquivo
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validar tipo de arquivo
 */
export function validateFileType(file, allowedTypes = []) {
  if (allowedTypes.length === 0) return true;
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'));
    }
    return file.type === type || file.name.endsWith(type);
  });
}

/**
 * Validar tamanho de arquivo
 */
export function validateFileSize(file, maxSizeMB = 50) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Upload simples (wrapper de conveniência)
 */
export async function uploadFile(file, options = {}) {
  return new Promise((resolve, reject) => {
    const task = new UploadTask(file, {
      ...options,
      onComplete: (task) => resolve(task),
      onError: (error) => reject(error)
    });
    
    task.start();
  });
}

/**
 * Upload múltiplo (wrapper de conveniência)
 */
export async function uploadFiles(files, options = {}) {
  const manager = new UploadManager(options);
  
  return new Promise((resolve, reject) => {
    let completedCount = 0;
    const fileArray = Array.isArray(files) ? files : [files];
    
    manager.addFiles(fileArray, {
      ...options,
      onComplete: (task) => {
        completedCount++;
        if (completedCount === fileArray.length) {
          resolve(manager.getStats());
        }
        if (options.onFileComplete) options.onFileComplete(task);
      },
      onError: (error) => {
        if (options.onFileError) options.onFileError(error);
        // Continuar mesmo com erros
        completedCount++;
        if (completedCount === fileArray.length) {
          resolve(manager.getStats());
        }
      }
    });
  });
}

export default {
  UploadTask,
  UploadManager,
  uploadFile,
  uploadFiles,
  formatFileSize,
  validateFileType,
  validateFileSize
};

